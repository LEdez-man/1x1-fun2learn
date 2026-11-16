// Spielablauf einer Runde: Batterien stellen, Treffer auswerten, sofortige
// Rückmeldung (Ton + Bild), Fortschritt und Abbruchkriterien.
import { makeQuestion, distractors, shuffle } from './tasks.js';
import { STAGE_SIZE } from './session.js';
import { store } from './store.js';
import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);
const MISS_LIMIT = 5;            // Modus 2: so viele Ziele in Folge durchgelassen → Game Over
const INTRO = 1.25, OUTRO = 1.15;

export class Play {
  // Das Szenario ist bereits geladen (engine.load in main.js).
  constructor({ engine, session, settings, onEnd }) {
    this.e = engine; this.session = session; this.settings = settings; this.onEnd = onEnd;
    this.sc = engine.scenario;
    // Etappen gibt es nur in Szenarien, die eine Zwischenrunde anbieten
    this.staged = typeof this.sc.intermission === 'function' && session.stageCount > 1;
    this.stageSeen = 0;
    this.sc.onEscape = (t) => this._escaped(t);
    engine.onHit = (t, p) => this._hit(t, p);
    engine.onFrame = (dt) => this._frame(dt);
    this.state = 'idle'; this.timer = 0; this.round = null;
    this.typing = null; this.missStreak = 0; this.ended = false;

    this._mm = (ev) => { engine.setMouse(ev.clientX, ev.clientY); const c = $('crosshair'); c.style.left = ev.clientX + 'px'; c.style.top = ev.clientY + 'px'; };
    this._md = (ev) => {
      if (ev.button !== 0 || ev.target.closest('button')) return;
      audio.unlock();
      if (this.typing || this.e.paused || this.state === 'idle') return;
      if (engine.shoot()) { const c = $('crosshair'); c.classList.remove('kick'); void c.offsetWidth; c.classList.add('kick'); }
    };
    this._kd = (ev) => this._key(ev);
    window.addEventListener('mousemove', this._mm);
    window.addEventListener('mousedown', this._md);
    window.addEventListener('keydown', this._kd);
    $('btnPause').onclick = () => this.togglePause();
    $('btnResume').onclick = () => this.togglePause(false);
    $('btnQuit').onclick = () => this._finish(true);

    $('lives').hidden = session.mode === 1 || session.mode === 3;
    this._buildStages();
    this._hud();
  }

  start() {
    this.e.paused = false; this.e.timeScale = 1;
    $('pause').hidden = true;
    this.e.start();
    this.state = 'outro'; this.timer = 0.6;
  }

  togglePause(force) {
    if (this.ended) return;
    const p = force === undefined ? !this.e.paused : force;
    this.e.paused = p;
    $('pause').hidden = !p;
  }

  // ---------------------------------------------------------- Batterie
  _begin() {
    if (this.session.finished) return this._finish(false);
    if (this.staged && this.session.stage > this.stageSeen) return this._intermission();
    const op = this.session.nextOp();
    const prompt = $('prompt');
    if (op === 'type') {
      const items = this.session.next(Math.min(3, this.session.open.length));
      const labels = items.map((it) => { const q = makeQuestion(it.key, 'mul'); return { text: `${it.a}×${it.b}`, item: it, q }; });
      this.round = { kind: 'type', labels };
      prompt.innerHTML = '<span class="small">Triff eine Aufgabe – dann Ergebnis tippen!</span>';
    } else {
      const item = this.session.next(1)[0];
      const q = makeQuestion(item.key, op);
      const labels = shuffle([q.answer, ...distractors(q, 4)]).map((v) => ({ text: String(v), correct: v === q.answer }));
      this.round = { kind: 'pick', item, q, labels, wrong: false };
      prompt.innerHTML = `${q.text} = <span class="q">?</span>`;
    }
    prompt.classList.remove('in'); void prompt.offsetWidth; prompt.classList.add('in');
    audio.play('task');
    this.state = 'intro'; this.timer = INTRO;
  }

  // Zwischenrunde nach jeder Etappe: Das Szenario spielt seinen Übergang
  // (z. B. Schneesturm und neue Tageszeit), ein Banner meldet den Stand.
  _intermission() {
    const s = this.session;
    this.stageSeen = s.stage;
    const info = this.sc.intermission(s.stage, s.stageCount) || {};
    audio.play('stage');
    $('stageTitle').textContent = `Etappe ${s.stage} von ${s.stageCount} geschafft!`;
    $('stageSub').textContent = [info.label, info.detail].filter(Boolean).join(' · ');
    const b = $('stageBanner');
    b.classList.remove('in'); void b.offsetWidth; b.classList.add('in');
    this.state = 'inter'; this.timer = info.duration || 2.5;
    this._hud();
  }

  _launch() {
    this.sc.spawnWave(this.round.labels);
    this.round.t0 = performance.now();
    this.state = 'live';
  }

  _record(item, op, ok, ms) {
    this.session.record(item, ok, ms);
    store.recordAnswer(item.key, op, ok, ms);
    this._hud();
  }

  _endRound() { this.state = 'outro'; this.timer = OUTRO; $('prompt').classList.remove('in'); }

  // ---------------------------------------------------------- Treffer
  _hit(target, point) {
    if (this.state !== 'live') return;
    const r = this.round, scr = this.e.toScreen(target.center);
    this.missStreak = 0; this._lives();
    if (r.kind === 'pick') {
      if (target.data.correct) {
        if (!r.wrong) this._record(r.item, r.q.op, true, performance.now() - r.t0);
        this.sc.resolve(target, 'correct');
        audio.play('correct');
        this._pop(r.q.full, 'good', scr);
        this.sc.dismiss();
        this._endRound();
      } else {
        if (!r.wrong) { r.wrong = true; this._record(r.item, r.q.op, false, 0); }
        this.sc.resolve(target, 'wrong');
        audio.play('wrong');
        this._pop('✗', 'bad', scr);
      }
    } else if (!this.typing) {
      this.sc.resolve(target, 'lock');
      audio.play('lock');
      this.typing = { target, q: target.data.q, item: target.data.item, text: '', left: this.settings.typeTimeout, t0: performance.now() };
      this.e.timeScale = 0.12;
      $('typeTask').textContent = `${target.data.q.text} =`;
      $('typeVal').textContent = '';
      $('typebox').hidden = false;
    }
  }

  _key(ev) {
    if (ev.key === 'Escape') { this.togglePause(); return; }
    const ty = this.typing;
    if (!ty || this.e.paused) return;
    if (/^[0-9]$/.test(ev.key)) {
      if (ty.text.length < 3) ty.text += ev.key;
      audio.play('key');
    } else if (ev.key === 'Backspace') { ty.text = ty.text.slice(0, -1); ev.preventDefault(); }
    else if (ev.key !== 'Enter') return;
    $('typeVal').textContent = ty.text;
    if (ev.key === 'Enter' ? ty.text.length > 0 : ty.text.length >= String(ty.q.answer).length) this._typed(Number(ty.text) === ty.q.answer);
  }

  _typed(ok) {
    const ty = this.typing; this.typing = null;
    this.e.timeScale = 1;
    $('typebox').hidden = true;
    const scr = this.e.toScreen(ty.target.center);
    this._record(ty.item, 'type', ok, performance.now() - ty.t0);
    this.sc.resolve(ty.target, ok ? 'correct' : 'wrong');
    audio.play(ok ? 'correct' : 'wrong');
    this._pop(ty.q.full, ok ? 'good' : 'show', scr);
  }

  _escaped() {
    if (this.state !== 'live' || this.round.kind !== 'type') return;
    this.missStreak++;
    audio.play('miss');
    this._lives();
    if (this.missStreak >= MISS_LIMIT) { this.session.gameOver = true; this._finish(false); }
  }

  // ---------------------------------------------------------- Frame
  _frame(dt) {
    if (this.ended) return;
    if (this.typing) {
      this.typing.left -= dt;
      $('typeBar').style.width = Math.max(0, this.typing.left / this.settings.typeTimeout * 100) + '%';
      if (this.typing.left <= 0) this._typed(false);
      return;
    }
    if (this.state === 'intro') { if ((this.timer -= dt) <= 0) this._launch(); }
    else if (this.state === 'outro') { if ((this.timer -= dt) <= 0) this._begin(); }
    else if (this.state === 'inter') { if ((this.timer -= dt) <= 0) { $('stageBanner').classList.remove('in'); this._begin(); } }
    else if (this.state === 'live' && this.sc.waveDone()) {
      const r = this.round;
      if (r.kind === 'pick') {            // kein richtiger Treffer: Lösung zeigen
        if (!r.wrong) this._record(r.item, r.q.op, false, 0);
        audio.play('miss');
        this._pop(r.q.full, 'show', { x: innerWidth / 2, y: innerHeight * 0.42 });
      }
      this._endRound();
    }
  }

  // ---------------------------------------------------------- Anzeige
  _pop(text, cls, scr) {
    const d = document.createElement('div');
    d.className = `pop ${cls}`; d.textContent = text;
    d.style.left = Math.min(innerWidth - 160, Math.max(160, scr.x)) + 'px';
    d.style.top = Math.min(innerHeight - 200, Math.max(90, scr.y)) + 'px';
    $('popups').appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  }

  // Etappenmarken im Fortschrittsbalken: eine Marke je STAGE_SIZE gelöster Aufgaben.
  _buildStages() {
    const ticks = $('progressTicks'), s = this.session;
    ticks.innerHTML = '';
    $('stageInfo').hidden = !this.staged;
    if (!this.staged) return;
    for (let i = 1; i < s.stageCount; i++) {
      const t = document.createElement('i');
      t.style.left = (i * STAGE_SIZE / s.total * 100) + '%';
      ticks.appendChild(t);
    }
  }

  _hud() {
    const s = this.session;
    $('progressFill').style.width = (s.progress * 100).toFixed(1) + '%';
    if (this.staged) {
      $('stageInfo').textContent = `Etappe ${Math.min(s.stage + 1, s.stageCount)}/${s.stageCount}`;
      [...$('progressTicks').children].forEach((t, i) => t.classList.toggle('done', s.done >= (i + 1) * STAGE_SIZE));
    }
    const c = this.session.items.reduce((s, i) => s + i.correct, 0);
    $('score').textContent = `★ ${c}`;
  }
  _lives() {
    $('lives').textContent = '♥'.repeat(MISS_LIMIT - this.missStreak) + '♡'.repeat(this.missStreak);
  }

  _finish(aborted) {
    if (this.ended) return;
    this.ended = true;
    this.e.stop(); this.e.timeScale = 1;
    window.removeEventListener('mousemove', this._mm);
    window.removeEventListener('mousedown', this._md);
    window.removeEventListener('keydown', this._kd);
    $('typebox').hidden = true; $('pause').hidden = true; $('popups').innerHTML = '';
    $('stageBanner').classList.remove('in');
    $('prompt').classList.remove('in');
    const result = this.session.results();
    if (!aborted) audio.play(result.gameOver ? 'gameover' : 'fanfare');
    this.e.unload();
    this.onEnd(result, aborted);
  }
}
