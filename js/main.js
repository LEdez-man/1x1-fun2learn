// Hauptmenü, Lernraster, Auswertung und Start einer Runde.
import { RANGES, POOLS, buildPool, allFacts, parse, key, isHard, errorFacts, factStats } from './tasks.js';
import { Session, recommend } from './session.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { Engine2D } from './engine2d.js';
import { Play } from './play.js';
import { TurkeyScenario } from './scenarios/turkey.js';
import { SnowScenario } from './scenarios/snow.js';

const $ = (id) => document.getElementById(id);

const MODES = [
  { id: 1, label: 'Ergebnis treffen', hint: 'Aufgabe steht unten, triff das richtige Ergebnis', ico: '🎯' },
  { id: 2, label: 'Treffen & tippen', hint: 'Ziele tragen Aufgaben – Ergebnis eintippen', ico: '⌨️' },
  { id: 3, label: 'Geteilt-Aufgaben', hint: '56 : 7 = ? – triff den fehlenden Faktor', ico: '➗' },
  { id: 4, label: 'Alles gemischt', hint: 'alle drei Spielarten im Wechsel', ico: '🔀' },
];

// Szenarien mit `cls` sind spielbar; die übrigen sind spezifiziert (spec.md) und geplant.
const SCENARIOS = [
  { id: 'turkey', label: 'Truthahn-Skeet', hint: 'Jagdreise: Rocky Mountains, Schwarzwald, Uckermark', ico: '🦃', cls: TurkeyScenario },
  { id: 'snow', label: 'Schneeballschlacht', hint: 'Winterdorf am zugefrorenen See', ico: '☃️', cls: SnowScenario },
  { id: 'train', label: 'Tiefflieger', hint: 'in Planung', ico: '✈️' },
  { id: 'ufo', label: 'UFO-Abwehr', hint: 'in Planung', ico: '🛸' },
  { id: 'pond', label: 'Fischteich', hint: 'in Planung', ico: '🐟' },
  { id: 'fair', label: 'Schießbude', hint: 'in Planung', ico: '🎪' },
  { id: 'balloon', label: 'Ballon-Zwille', hint: 'in Planung', ico: '🎈' },
];

let engine2d = null;      // PixiJS-Engine, wird beim ersten Start angelegt
let starting = false;
let lastRun = null;       // { pool, range } der letzten Runde für "Nochmal"
const S = () => store.profile.settings;

function show(id) {
  for (const s of ['menu', 'grid', 'summary', 'game']) $(s).hidden = s !== id;
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------------- Menü
function optButtons(el, items, current, onPick, cls = 'opt') {
  el.innerHTML = '';
  for (const it of items) {
    const b = document.createElement('button');
    b.className = cls + (it.id === current ? ' on' : '');
    b.disabled = !!it.disabled;
    b.dataset.id = it.id;
    b.innerHTML = cls === 'opt'
      ? `${it.ico ? `<span class="ico">${it.ico}</span>` : ''}<b>${it.label}</b><small>${it.hint || ''}</small>`
      : it.label;
    b.onclick = () => { audio.unlock(); onPick(it.id); };
    el.appendChild(b);
  }
}

function currentPool() {
  const s = S();
  return buildPool(s.pool, s.range, store.profile, s.rows);
}

function renderMenu() {
  const p = store.profile, s = S();
  const set = (k, v) => { s[k] = v; store.save(); renderMenu(); };

  const sel = $('profileSel');
  sel.innerHTML = store.profiles.map((x) => `<option value="${x.id}"${x.id === p.id ? ' selected' : ''}>${escapeHtml(x.name)}</option>`).join('');
  $('btnSound').textContent = s.sound ? '🔊' : '🔇';
  audio.setEnabled(s.sound);

  const rec = p.recommended;
  const rb = $('btnRecommended');
  rb.hidden = !rec.keys.length;
  rb.textContent = `⭐ Meine Übungsserie spielen – ${rec.keys.length} Aufgaben, die noch Übung brauchen (${rec.keys.slice(0, 5).map(pretty).join(', ')}${rec.keys.length > 5 ? ' …' : ''})`;

  optButtons($('optRange'), Object.values(RANGES).map((r) => ({
    id: r.id, label: r.label, hint: r.id === 'small' ? '1 × 1 bis 10 × 10' : '11 × 1 bis 20 × 10',
  })), s.range, (v) => { s.rows = [v === 'small' ? 2 : 11]; set('range', v); });

  optButtons($('optPool'), POOLS, s.pool, (v) => set('pool', v));

  const r = RANGES[s.range];
  const rp = $('rowPick');
  rp.hidden = s.pool !== 'rows';
  if (!rp.hidden) {
    const rows = [];
    for (let i = r.aMin; i <= r.aMax; i++) rows.push({ id: i, label: `${i}er` });
    rp.innerHTML = '';
    for (const row of rows) {
      const b = document.createElement('button');
      b.className = 'chip' + (s.rows.includes(row.id) ? ' on' : '');
      b.textContent = row.label;
      b.onclick = () => {
        s.rows = s.rows.includes(row.id) ? s.rows.filter((x) => x !== row.id) : [...s.rows, row.id];
        store.save(); renderMenu();
      };
      rp.appendChild(b);
    }
  }
  $('customInfo').hidden = s.pool !== 'custom';
  $('customCount').textContent = `${p.custom[s.range].length} Aufgaben im Lernraster ausgewählt`;

  const n = currentPool().length;
  $('poolInfo').textContent = n === 0
    ? 'Noch keine Aufgaben ausgewählt.'
    : n > 10 ? `${n} Aufgaben im Topf – pro Runde werden 10 davon gezogen (unsichere zuerst).` : `${n} Aufgaben in dieser Runde.`;
  $('btnStart').disabled = n === 0;
  $('btnStart').style.opacity = n ? 1 : 0.4;

  optButtons($('optMode'), MODES, s.mode, (v) => set('mode', v));
  optButtons($('optScenario'), SCENARIOS.map((x) => ({ ...x, disabled: !x.cls })), s.scenario, (v) => set('scenario', v));

  const seg = (id, items, cur, k) => optButtons($(id), items, cur, (v) => set(k, v), '');
  seg('optNeed', [2, 3, 5].map((v) => ({ id: v, label: `${v}×` })), s.need, 'need');
  seg('optTempo', [{ id: 0.75, label: 'gemütlich' }, { id: 1, label: 'normal' }, { id: 1.3, label: 'flott' }], s.tempo, 'tempo');
  seg('optLead', [{ id: true, label: 'an' }, { id: false, label: 'aus' }], s.lead, 'lead');
  seg('optType', [3, 5, 8].map((v) => ({ id: v, label: `${v} s` })), s.typeTimeout, 'typeTimeout');
}

const pretty = (k) => k.replace('x', ' × ');
const escapeHtml = (t) => t.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// ---------------------------------------------------------------- Runde
async function getEngine() {
  if (!engine2d) engine2d = await new Engine2D($('gl2d')).init();
  return engine2d;
}

async function startRun(pool, range) {
  const s = S();
  if (!pool.length || starting) return;
  starting = true;
  const scen = SCENARIOS.find((x) => x.id === s.scenario && x.cls) || SCENARIOS[0];
  lastRun = { pool, range };
  audio.unlock();
  show('game');
  s.round = (s.round || 0) + 1;          // Kulisse wechselt mit jeder Runde
  const session = new Session({ pool, need: s.need, mode: s.mode, facts: store.profile.facts });
  let engine;
  $('loading').hidden = false;
  try {
    engine = await getEngine();
    engine.resize();
    await engine.load(scen.cls, { tempo: s.tempo, lead: s.lead, variant: s.round, stages: session.stageCount });
  } catch (err) {
    console.error(err);
    alert('Das Szenario konnte nicht geladen werden: ' + err.message);
    renderMenu(); show('menu');
    return;
  } finally {
    $('loading').hidden = true; starting = false;
  }
  const play = new Play({
    engine, session, settings: s,
    onEnd: (result, aborted) => {
      const answered = result.correct + result.wrong > 0;
      if (answered) store.addSession(result, { range, scenario: scen.id, pool: s.pool, aborted });
      else store.save();
      if (aborted && !answered) { renderMenu(); show('menu'); } else renderSummary(result, range, aborted);
    },
  });
  window.__play = play;      // für automatisierte Tests
  play.start();
}

// ---------------------------------------------------------------- Auswertung
function renderSummary(res, range, aborted) {
  const pct = Math.round(res.rate * 100);
  $('sumTitle').innerHTML = res.gameOver ? 'Game Over – <span>gleich nochmal!</span>'
    : aborted ? 'Runde <span>beendet</span>'
      : pct >= 90 ? 'Stark! <span>Runde geschafft</span>' : 'Geschafft! <span>Weiter so</span>';
  $('sumRing').style.setProperty('--p', pct);
  $('sumRate').textContent = pct + ' %';
  const min = Math.floor(res.durationSec / 60), sec = String(res.durationSec % 60).padStart(2, '0');
  const stars = pct >= 95 ? '★★★' : pct >= 80 ? '★★☆' : pct >= 60 ? '★☆☆' : '☆☆☆';
  $('sumFacts').innerHTML = `
    <div><span>Richtig</span><b>${res.correct}</b></div><div><span>Falsch</span><b>${res.wrong}</b></div>
    <div><span>Zeit</span><b>${min}:${sec} min</b></div><div><span>Sterne</span><b style="color:var(--accent)">${stars}</b></div>`;

  const items = [...res.items].sort((a, b) => (a.rate ?? -1) - (b.rate ?? -1));
  $('sumBars').innerHTML = items.map((i) => {
    const n = i.correct + i.wrong;
    const p = i.rate === null ? 0 : Math.round(i.rate * 100);
    const col = i.rate === null ? 'var(--unseen)' : p >= 80 ? 'var(--good)' : p >= 50 ? 'var(--mid)' : 'var(--bad)';
    const face = i.rate === null ? '·' : p >= 80 ? '😀' : p >= 50 ? '🙂' : '🤔';
    return `<div class="bar-row"><div class="task">${face} ${i.a} × ${i.b}</div>
      <div class="track"><div class="fill" style="width:${Math.max(p, 4)}%;background:${col}"></div></div>
      <div class="val">${n ? `${i.correct} von ${n}` : 'nicht dran'}</div></div>`;
  }).join('');

  const rec = recommend(res);
  store.profile.recommended = { range, keys: rec };
  store.save();
  $('sumRec').innerHTML = rec.length
    ? `<h3>Das üben wir als Nächstes</h3>${rec.map((k) => `<span class="tag">${pretty(k)}</span>`).join('')}
       <p class="info">Diese Aufgaben waren noch unsicher oder langsam. Sie liegen jetzt als „Meine Übungsserie“ im Hauptmenü bereit.</p>`
    : '<h3>Alles sicher! 🎉</h3><p class="info">In dieser Runde gab es nichts nachzuüben. Nimm dir neue Aufgaben vor.</p>';
  $('btnPlayRec').hidden = !rec.length;
  show('summary');
}

// ---------------------------------------------------------------- Lernraster
function rateClass(k) {
  const s = factStats(store.profile.facts, k);
  if (!s.n) return 'unseen';
  return s.rate >= 0.8 ? 'good' : s.rate >= 0.5 ? 'mid' : 'bad';
}

function renderGrid() {
  const p = store.profile, range = S().range, r = RANGES[range];
  const selSet = new Set(p.custom[range]);
  $('gridRange').textContent = r.label;
  let html = '<table><tr><th>×</th>';
  for (let b = 1; b <= 10; b++) html += `<th data-col="${b}">${b}</th>`;
  html += '</tr>';
  for (let a = r.aMin; a <= r.aMax; a++) {
    html += `<tr><th data-row="${a}">${a}</th>`;
    for (let b = 1; b <= 10; b++) {
      const k = key(a, b), st = factStats(p.facts, k);
      html += `<td data-k="${k}" class="${rateClass(k)}${selSet.has(k) ? ' sel' : ''}" title="${a} × ${b} = ${a * b}${st.n ? ` · ${st.c} von ${st.n} richtig` : ''}">${a * b}<small>${a}×${b}</small></td>`;
    }
    html += '</tr>';
  }
  $('gridTable').innerHTML = html + '</table>';
  $('gridCount').textContent = `${selSet.size} Aufgaben ausgewählt`;
}

function setCustom(keys) {
  store.profile.custom[S().range] = [...new Set(keys)];
  store.save(); renderGrid();
}

function gridClick(ev) {
  const range = S().range, cur = store.profile.custom[range];
  const t = ev.target.closest('td,th');
  if (!t) return;
  let keys;
  if (t.dataset.k) keys = [t.dataset.k];
  else if (t.dataset.row) keys = allFacts(range).filter((k) => parse(k).a === Number(t.dataset.row));
  else if (t.dataset.col) keys = allFacts(range).filter((k) => parse(k).b === Number(t.dataset.col));
  else return;
  const allOn = keys.every((k) => cur.includes(k));
  setCustom(allOn ? cur.filter((k) => !keys.includes(k)) : [...cur, ...keys]);
}

// ---------------------------------------------------------------- Verdrahtung
function init() {
  $('profileSel').onchange = (e) => { store.select(e.target.value); renderMenu(); };
  $('btnNewProfile').onclick = () => {
    const name = prompt('Name des neuen Spielers:');
    if (name && name.trim()) { store.add(name); renderMenu(); }
  };
  $('btnSound').onclick = () => { S().sound = !S().sound; store.save(); renderMenu(); };
  $('btnExport').onclick = () => {
    const blob = new Blob([store.exportProfile()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `1x1-profil-${store.profile.name.replace(/[^\wäöüÄÖÜß-]+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { store.importProfile(await f.text()); renderMenu(); } catch (err) { alert('Import fehlgeschlagen: ' + err.message); }
    e.target.value = '';
  };

  $('btnStart').onclick = () => startRun(currentPool(), S().range);
  $('btnRecommended').onclick = () => { const r = store.profile.recommended; startRun(r.keys, r.range); };
  $('btnPlayRec').onclick = () => { const r = store.profile.recommended; startRun(r.keys, r.range); };
  $('btnAgain').onclick = () => lastRun && startRun(lastRun.pool, lastRun.range);
  $('btnMenu').onclick = () => { renderMenu(); show('menu'); };

  const openGrid = () => { renderGrid(); show('grid'); };
  $('btnGrid').onclick = openGrid;
  $('btnStats').onclick = openGrid;
  $('gridTable').onclick = gridClick;
  $('gridDone').onclick = () => { renderMenu(); show('menu'); };
  $('gridClear').onclick = () => setCustom([]);
  $('gridHard').onclick = () => setCustom([...store.profile.custom[S().range], ...allFacts(S().range).filter((k) => isHard(k, S().range))]);
  $('gridErrors').onclick = () => setCustom([...store.profile.custom[S().range], ...errorFacts(store.profile.facts, S().range, 20)]);

  renderMenu();
  show('menu');
}

init();
