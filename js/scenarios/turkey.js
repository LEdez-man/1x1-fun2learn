// Szenario "Truthahn-Skeet" als 2D-Mehrebenen-Szene (PixiJS): Jagdreise durch drei
// Reviere – Rocky Mountains (Truthahn), Schwarzwald (Ringeltaube), Uckermark
// (Jagdfasan) – mit wechselnden Jahreszeiten. Die Vögel steigen hinter dem Gebüsch
// im Vordergrund auf und fliegen im Bogen durchs Bild; das Ergebnis hängt als Schild
// unter dem Vogel. Grafiken: assets/vogel-skeet (gezeichnet von tools/build-skeet-assets.py).
//
// Etappen, Ballistik und die Regeln für sichtbare Ziele: spec.md 5.6, 7.1, 7.4.
import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { rasterSvg, textureOf, softDot, mulberry, lerp, clamp, smooth, lerpColor } from '../engine2d.js';
import { audio } from '../audio.js';

const A = 'assets/vogel-skeet/';
const X0 = -240, X1 = 1520, W = X1 - X0;
const PAN = 100, SAFE_HALF = 540;
const INK = 0x2b2118, PAPER = 0xf1e9d2;

// Ebenen der Landschaft: [Name, Parallaxfaktor, gerasterter Ausschnitt y0–y1, Farbgruppe]
const LAND = [['fern', 0.12, [100, 502], 'far'], ['mitte', 0.3, [270, 614], 'mid'], ['nah', 0.55, [230, 720], 'near'], ['vorn', 1, [590, 720], 'near']];
const REVIERE = {
  rocky: { name: 'Rocky Mountains', at: 'in den Rocky Mountains', go: 'Auf in die Rocky Mountains', bird: 'truthahn', snow: true },
  schwarzwald: { name: 'Schwarzwald', at: 'im Schwarzwald', go: 'Weiter in den Schwarzwald', bird: 'taube', snow: true },
  uckermark: { name: 'Uckermark', at: 'in der Uckermark', go: 'Weiter in die Uckermark', bird: 'fasan', snow: false },
};
// Stimmungen: Farbmultiplikator je Gruppe, Schneedecke (0–1), Wetterteilchen, Sonne [x, y, Stärke].
const MOODS = {
  herbst: { label: 'Goldener Herbst', sky: 0xffeccf, far: 0xfbe6d0, mid: 0xffe2b0, near: 0xffe6b8, snow: 0, fx: 'laub', sun: [1040, 150, 0.9], stars: 0 },
  winter: { label: 'Tiefer Winter', sky: 0xe2e9f2, far: 0xeaf0f6, mid: 0xffffff, near: 0xffffff, snow: 1, fx: 'schnee', sun: [300, 170, 0.35], stars: 0 },
  tauwetter: { label: 'Der Schnee taut', sky: 0xf2f6fa, far: 0xf4f6f8, mid: 0xf6f8f2, near: 0xf6f8f0, snow: 0.5, fx: 'none', sun: [520, 120, 0.7], stars: 0 },
  fruehling: { label: 'Frühling', sky: 0xf6fbff, far: 0xf2f8f4, mid: 0xf4ffe6, near: 0xf6ffe8, snow: 0, fx: 'pollen', sun: [420, 110, 0.9], stars: 0 },
  sommer: { label: 'Hochsommer', sky: 0xffffff, far: 0xffffff, mid: 0xffffff, near: 0xffffff, snow: 0, fx: 'pollen', sun: [860, 90, 1], stars: 0 },
  abendrot: { label: 'Abendrot', sky: 0xffb486, far: 0xf2a68e, mid: 0xf4b48c, near: 0xf8c49c, snow: 0, fx: 'none', sun: [1010, 330, 1], stars: 0 },
  daemmerung: { label: 'Abenddämmerung', sky: 0x7682c4, far: 0x7c86ba, mid: 0x868eba, near: 0x969ec2, snow: 0, fx: 'none', sun: [1060, 420, 0.25], stars: 1 },
};
// Reiseroute. Eine Runde durchläuft sie von vorn bis hinten, gleichmäßig auf ihre Etappen verteilt.
const STATIONS = [
  ['rocky', 'herbst'], ['rocky', 'sommer'], ['rocky', 'winter'], ['rocky', 'tauwetter'],
  ['schwarzwald', 'fruehling'], ['schwarzwald', 'sommer'], ['schwarzwald', 'herbst'], ['schwarzwald', 'winter'],
  ['uckermark', 'sommer'], ['uckermark', 'herbst'], ['uckermark', 'abendrot'], ['uckermark', 'daemmerung'],
];
// Maße der Vogelgrafiken (Figur-Einheiten, Ursprung = Rumpfmitte)
const BIRD = { halfW: 142, top: -150, bodyRx: 66, bodyRy: 40, wing: { x: -4, y: -20 }, plateY: 46 };
const SCALES = [0.52, 0.64, 0.78];             // fern, mittel, nah
const LANES = [190, 265, 340, 415, 490];       // Flughöhen (Rumpfmitte am Scheitel der Bahn)
const BASE_Y = 800, CLEAR_Y = 596;             // Start-/Landehöhe hinter dem Gebüsch; darüber ist ein Vogel frei sichtbar
const FEATHERS = { truthahn: [0x4a3324, 0x7d532c, 0xe9dcc0, 0xc98a3e], taube: [0x8d9bab, 0x6f7f8f, 0xf4f4f0, 0x2b3038], fasan: [0xb5602a, 0xb98846, 0x1f5a4a, 0xe0c9a0] };
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class TurkeyScenario {
  constructor(engine, opts = {}) {
    this.e = engine;
    this.tempo = opts.tempo || 1;
    this.ballistic = opts.lead !== false;        // Einstellung "Ballistik"
    this.stages = Math.max(1, opts.stages || 1);
    this.variant = opts.variant || 0;
    this.design = { w: 1280, h: 720 };
    this.pan = { x: PAN, safeHalf: SAFE_HALF, minPan: 40, worldHalf: W / 2 };
    this.shot = {
      cooldown: 0.42, flight: 0.2, radius: 15, arc: 0, spin: 0, origin: { x: 0.62, y: 0.9 }, startScale: 1, endScale: 0.5,
      make: () => new Graphics().circle(0, 0, 5).fill({ color: 0xfff2c0, alpha: 0.9 }).circle(-7, 4, 3).circle(6, -5, 3).circle(8, 6, 2.5).fill({ color: 0xffe9a0, alpha: 0.8 }),
      ballistics: (to) => this._ballistics(to),
    };
    this.targets = [];
    this.onEscape = null;
    this.time = 0; this.wave = 0;
    this.L = {}; this.rev = {}; this.tint = { sky: [], far: [], mid: [], near: [], birds: [] };
    this.bits = []; this.flocks = []; this.clouds = [];
    this.storm = null; this.kick = 0;
    this.station = this._stationFor(0);
  }

  // ------------------------------------------------------------ Aufbau
  async build() {
    const e = this.e, rnd = mulberry(4711);
    const rs = clamp(Math.round(e.view.s * Math.min(window.devicePixelRatio || 1, 2) * 4) / 4, 1, 1.5);
    const jobs = [];
    for (const [id, r] of Object.entries(REVIERE)) {
      for (const [name, , box] of LAND) {
        for (const sn of r.snow ? ['', '-schnee'] : ['']) {
          jobs.push(rasterSvg(`${A}${id}/${name}${sn}.svg`, { scale: rs, box: [X0, box[0], W, box[1] - box[0]] }).then((ras) => ({ id, name, sn, ras })));
        }
      }
    }
    const birdKinds = ['truthahn', 'taube', 'fasan'];
    const [land, bodies, wings, gun] = await Promise.all([
      Promise.all(jobs),
      Promise.all(birdKinds.map((k) => rasterSvg(`${A}voegel/${k}-koerper.svg`, { scale: 1.5 }))),
      Promise.all(birdKinds.map((k) => rasterSvg(`${A}voegel/${k}-fluegel.svg`, { scale: 1.5 }))),
      rasterSvg(`${A}flinte.svg`, { scale: 1.5 }),
    ]);
    this.tex = {};
    birdKinds.forEach((k, i) => { this.tex[k] = { body: textureOf(bodies[i].canvas), wing: textureOf(wings[i].canvas) }; });

    this.L.himmel = e.addLayer('himmel', 0.03);
    this._buildSky(rnd);
    this.L.schwarm = e.addLayer('schwarm', 0.08);
    for (const [name, f] of LAND.slice(0, 3)) this.L[name] = e.addLayer(name, f);
    this.L.voegel = e.addLayer('voegel', 1);
    this.L.vorn = e.addLayer('vorn', 1);
    this.L.wetter = e.addLayer('wetter', 0);
    this.L.flinte = e.addLayer('flinte', 0);

    // je Revier und Ebene: Grundfassung und (falls vorhanden) Schneefassung übereinander
    for (const id of Object.keys(REVIERE)) this.rev[id] = { parts: [], snows: [] };
    for (const [name, , , group] of LAND) {
      for (const id of Object.keys(REVIERE)) {
        const c = new Container();
        c.visible = false;
        for (const item of land.filter((x) => x.id === id && x.name === name)) {
          const sp = new Sprite(textureOf(item.ras.canvas));
          sp.position.set(item.ras.x, item.ras.y); sp.scale.set(1 / rs);
          c.addChild(sp);
          this.tint[group].push(sp);
          if (item.sn) { sp.alpha = 0; this.rev[id].snows.push(sp); }
        }
        this.L[name].addChild(c);
        this.rev[id].parts.push(c);
      }
    }
    this.birdsC = new Container();
    this.birdsC.sortableChildren = true;               // kleine (ferne) Vögel hinten
    this.L.voegel.addChild(this.birdsC);
    this.tint.birds.push(this.birdsC);

    this._buildFlocks(rnd);
    this._buildWeather(rnd);
    this.gun = new Sprite(textureOf(gun.canvas));
    this.gun.anchor.set(500 / 520, 60 / 120); this.gun.scale.set(0.9 / 1.5);
    this.L.flinte.addChild(this.gun);
    this.tint.birds.push(this.gun);

    this._apply(this.station, this.station, 1);
    this._setFx(MOODS[STATIONS[this.station][1]].fx);
    if (new URLSearchParams(location.search).has('debug')) window.__scenario = this;
  }

  _buildSky(rnd) {
    const c = this.L.himmel;
    const gc = document.createElement('canvas'); gc.width = 4; gc.height = 256;
    const g = gc.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#6ea6da'); gr.addColorStop(0.55, '#b9d6ea'); gr.addColorStop(1, '#eef3ee');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const tex = Texture.from(gc);
    this._owned = [tex];
    const top = new Graphics().rect(X0, -1700, W, 1702).fill(0x6ea6da);
    const sky = new Sprite(tex); sky.position.set(X0, 0); sky.width = W; sky.height = 520;
    this.sun = new Container();
    const halo = new Sprite(softDot()); halo.anchor.set(0.5); halo.scale.set(7); halo.tint = 0xfff0b0; halo.blendMode = 'add'; halo.alpha = 0.5;
    this.sun.addChild(halo, new Graphics().circle(0, 0, 26).fill(0xfff6d0));
    this.stars = new Graphics();
    for (let i = 0; i < 120; i++) this.stars.circle(X0 + rnd() * W, -60 + rnd() * 330, 0.7 + rnd() * 0.9).fill({ color: 0xfff8e0, alpha: 0.5 + rnd() * 0.5 });
    c.addChild(top, sky, this.stars, this.sun);
    this.tint.sky.push(top, sky);
    for (let i = 0; i < 6; i++) {                       // Wolken mit schraffierter Unterseite
      const cl = new Graphics(), w = 90 + rnd() * 110;
      cl.ellipse(0, 0, w, 20).ellipse(-w * 0.35, -16, w * 0.4, 22).ellipse(w * 0.2, -22, w * 0.45, 28).fill(0xffffff);
      cl.ellipse(w * 0.1, 8, w * 0.8, 9).fill({ color: 0x8fa3b5, alpha: 0.35 });
      for (let k = -4; k < 5; k++) cl.moveTo(k * w * 0.16, 4).lineTo(k * w * 0.16 - 8, 15).stroke({ width: 1.2, color: 0x5f7284, alpha: 0.45 });
      cl.position.set(X0 + rnd() * W, 70 + rnd() * 200); cl.alpha = 0.92;
      c.addChild(cl);
      this.tint.sky.push(cl);
      this.clouds.push({ g: cl, v: 4 + rnd() * 6 });
    }
  }

  _buildFlocks(rnd) {
    for (let i = 0; i < 2; i++) {
      const c = new Container();
      this.L.schwarm.addChild(c);
      this.tint.far.push(c);
      const f = { c, birds: [], vx: 0, wait: i * 6 + rnd() * 4 };
      for (let b = 0; b < 9; b++) {
        const bird = new Container(), wings = [];
        for (const sd of [-1, 1]) {
          const w = new Graphics().moveTo(0, 0).quadraticCurveTo(sd * 4.5, -6, sd * 9, 0).stroke({ width: 1.8, color: 0x2a231c, cap: 'round' });
          bird.addChild(w); wings.push(w);
        }
        c.addChild(bird);
        f.birds.push({ bird, wings, ph: rnd() * 6.28, sp: 7 + rnd() * 3 });
      }
      this.flocks.push(f);
      this._resetFlock(f, rnd, i === 0);
    }
    this._rnd = rnd;
  }
  _resetFlock(f, rnd, visibleNow) {
    const dir = rnd() < 0.5 ? -1 : 1, n = 3 + Math.floor(rnd() * 7), size = 0.6 + rnd() * 0.5;
    f.vx = dir * (24 + rnd() * 22);
    f.c.position.set(visibleNow ? 200 + rnd() * 800 : (dir > 0 ? X0 - 120 : X1 + 120), 70 + rnd() * 150);
    f.birds.forEach((b, i) => {
      b.bird.visible = i < n;
      const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      b.bird.position.set(-dir * row * 22 + (rnd() - 0.5) * 8, side * row * 11 + (rnd() - 0.5) * 6);
      b.bird.scale.set(size * (0.85 + rnd() * 0.3));
    });
  }

  // Wetterteilchen (Laub, Schnee, Blütenstaub) und Nebel für die Zwischenrunde, alles in Sichtkoordinaten.
  _buildWeather(rnd) {
    const n = reducedMotion() ? 24 : 60;
    const leaf = new Graphics().ellipse(0, 0, 5, 2.6).fill(0xffffff);
    this._leafTex = this.e.app.renderer.generateTexture(leaf);
    this._owned.push(this._leafTex);
    leaf.destroy();
    for (let i = 0; i < n; i++) {
      const s = new Sprite(softDot());
      s.anchor.set(0.5);
      this.L.wetter.addChild(s);
      this.bits.push({ s, x: rnd(), y: rnd(), ph: rnd() * 6.28, k: 0.6 + rnd() * 0.8 });
    }
    this.fog = new Container(); this.fog.visible = false;
    this.veil = new Graphics().rect(X0 - 200, -1700, W + 400, 2500).fill(0xeef1ee);
    this.fog.addChild(this.veil);
    this.banks = [];
    for (let i = 0; i < 9; i++) {
      const s = new Sprite(softDot());
      s.anchor.set(0.5); s.scale.set(22 + rnd() * 14, 7 + rnd() * 5); s.tint = 0xf6f8f6;
      this.fog.addChild(s);
      this.banks.push({ s, x: rnd(), y: 0.15 + rnd() * 0.8, v: 0.5 + rnd() * 0.6 });
    }
    this.L.wetter.addChild(this.fog);
  }

  _setFx(kind) {
    this.fxKind = kind;
    const leaves = [0xd9882e, 0xe0b93c, 0xa8552a, 0xc9a23a];
    this.bits.forEach((b, i) => {
      b.s.visible = kind !== 'none';
      b.s.texture = kind === 'laub' ? this._leafTex : softDot();
      b.s.tint = kind === 'laub' ? leaves[i % 4] : kind === 'pollen' ? 0xfff6c0 : 0xffffff;
      b.s.alpha = kind === 'pollen' ? 0.55 : 0.9;
      b.s.scale.set(kind === 'laub' ? 1.1 * b.k : kind === 'pollen' ? 0.07 * b.k : 0.13 * b.k);
    });
  }

  // ------------------------------------------------------------ Reise und Etappen
  // Station einer Etappe: Die Route wird gleichmäßig auf die Etappen der Runde verteilt;
  // die letzte Etappe zeigt immer die letzte Station (Abenddämmerung in der Uckermark).
  _stationFor(stage) {
    const n = this.stages, last = STATIONS.length - 1;
    if (n <= 1) return (this.variant * 5) % STATIONS.length;
    return Math.round(stage * last / (n - 1));
  }

  // Zwischenrunde: Nebel zieht durchs Bild, darunter wechseln Revier und Jahreszeit.
  intermission(stage) {
    const to = this._stationFor(stage), from = this.station, calm = reducedMotion();
    const [rv, md] = STATIONS[to], moved = STATIONS[from][0] !== rv;
    this.storm = { t: 0, dur: calm ? 2.2 : 3.2, from, to, dir: stage % 2 ? -1 : 1, calm, fx: false };
    this.fog.visible = true;
    audio.play('wind');
    return {
      duration: this.storm.dur + 0.3,
      label: moved ? REVIERE[rv].go : `${MOODS[md].label} ${REVIERE[rv].at}`,
      detail: moved ? `${MOODS[md].label} · es fliegen ${{ truthahn: 'Truthähne', taube: 'Ringeltauben', fasan: 'Fasane' }[REVIERE[rv].bird]}` : '',
    };
  }

  _apply(ai, bi, k) {
    const [ra, ma] = STATIONS[ai], [rb, mb] = STATIONS[bi], a = MOODS[ma], b = MOODS[mb];
    for (const [id, r] of Object.entries(this.rev)) {
      const alpha = ra === rb ? (id === rb ? 1 : 0) : id === ra ? 1 - k : id === rb ? k : 0;
      for (const c of r.parts) { c.visible = alpha > 0.004; c.alpha = alpha; }
      const snow = id === rb ? (ra === rb ? lerp(a.snow, b.snow, k) : b.snow) : id === ra ? a.snow : 0;
      for (const s of r.snows) { s.alpha = snow; s.visible = snow > 0.004; }
    }
    for (const g of ['sky', 'far', 'mid', 'near']) {
      const col = lerpColor(a[g], b[g], k);
      for (const o of this.tint[g]) o.tint = col;
    }
    const bc = lerpColor(lerpColor(a.near, b.near, k), 0xffffff, 0.55);      // Ziele bleiben heller als die Kulisse
    for (const o of this.tint.birds) o.tint = bc;
    this.sun.position.set(lerp(a.sun[0], b.sun[0], k), lerp(a.sun[1], b.sun[1], k));
    this.sun.alpha = lerp(a.sun[2], b.sun[2], k);
    this.stars.alpha = lerp(a.stars, b.stars, k); this.stars.visible = this.stars.alpha > 0.01;
  }

  // ------------------------------------------------------------ Ballistik
  // Aus: Der Schuss sitzt sofort am Fadenkreuz. An: Flugzeit und Geschossabfall wachsen mit
  // der Entfernung des nächstgelegenen Vogels (kleiner Vogel = weit weg); auf fliegende Ziele
  // muss vorgehalten werden. Die Garbe wird mit der Entfernung etwas breiter.
  _ballistics(to) {
    if (!this.ballistic) return { flight: 0, drop: 0, radius: 16, f: 1 };
    let near = null, best = 260;
    for (const t of this.targets) {
      if (!t.hittable) continue;
      const d = Math.hypot(t.center.x - to.x, t.center.y - to.y);
      if (d < best) { best = d; near = t; }
    }
    const far = near ? (SCALES[2] - near.scale) / (SCALES[2] - SCALES[0]) : 0.5;      // 0 nah … 1 fern
    return { flight: 0.14 + 0.24 * far, drop: 2 + 8 * far, radius: 13 + 5 * far, f: 1 };
  }

  // ------------------------------------------------------------ Vögel
  _bird(text, kind, scale) {
    const fig = new Container(), art = new Container(), tx = this.tex[kind];
    const body = new Sprite(tx.body); body.anchor.set(150 / 300, 110 / 200); body.scale.set(1 / 1.5);
    const wing = new Sprite(tx.wing); wing.anchor.set(130 / 170, 150 / 170); wing.scale.set(1 / 1.5); wing.position.set(BIRD.wing.x, BIRD.wing.y);
    art.addChild(body, wing);
    const size = Math.round(27 / scale) * (text.length > 3 ? 0.82 : 1);
    const label = new Text({ text, style: { fontFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif', fontWeight: '900', fontSize: size, fill: INK } });
    label.anchor.set(0.5); label.resolution = 2;
    const pw = Math.max(label.width + 22, size * 1.5), ph = size + 12, py = BIRD.plateY + ph / 2;
    const plate = new Container();
    plate.addChild(
      new Graphics().moveTo(-pw / 2 + 8, -ph / 2).lineTo(-16, -ph / 2 - 16).moveTo(pw / 2 - 8, -ph / 2).lineTo(16, -ph / 2 - 16).stroke({ width: 2.4, color: 0x3d2f22 }),
      new Graphics().roundRect(-pw / 2, -ph / 2, pw, ph, 7).fill(PAPER).stroke({ width: 3.5, color: INK }),
      label,
    );
    plate.position.set(0, py);
    fig.addChild(art, plate);
    fig.scale.set(scale);
    return { fig, art, wing, plate, body, scale, kind, plateBox: { w: pw / 2, h: ph / 2, y: py }, bottom: py + ph / 2 + 3 };
  }

  // Alle Vögel einer Batterie fliegen gleich schnell und starten gestaffelt, sodass sie sich
  // nie überdecken. Flugrichtung wechselt je Batterie: von links, von rechts, aus der Mitte.
  spawnWave(labels) {
    const mode = this.wave++ % 3, kind = REVIERE[STATIONS[this.station][0]].bird;
    const lanes = [...LANES].sort(() => Math.random() - 0.5);
    const speed = 165 * this.tempo * (mode === 2 ? 0.6 : 1);
    const gap = (2 * BIRD.halfW * SCALES[2] + 14) / speed;                   // Startabstand in Sekunden
    labels.forEach((lab, i) => {
      const scale = SCALES[Math.floor(Math.random() * SCALES.length)];
      const b = this._bird(lab.text, kind, scale);
      const lim = SAFE_HALF - 8 - BIRD.halfW * scale;                        // Zielzone abzüglich halber Figurbreite
      let x0, x1, delay;
      if (mode === 2) {
        const side = i % 2 ? 1 : -1;
        x0 = 640 + side * 86; x1 = 640 + side * lim; delay = Math.floor(i / 2) * gap;
      } else {
        const dir = mode === 0 ? 1 : -1;
        x0 = 640 - dir * lim; x1 = 640 + dir * lim; delay = i * gap;
      }
      b.art.scale.x = x1 > x0 ? 1 : -1;
      b.fig.visible = false; b.fig.zIndex = scale;
      this.birdsC.addChild(b.fig);
      const t = {
        ...b, data: lab, x0, x1, peak: lanes[i % lanes.length], dur: Math.abs(x1 - x0) / speed, delay: 0.15 + delay,
        z: scale, f: 1, center: { x: 0, y: 0 }, hittable: false, state: 'wait', t: 0, vy: 0, phase: Math.random() * 6.28,
      };
      t.hitTest = (p, r) => this._hitTest(t, p, r);
      this.targets.push(t);
    });
  }

  _hitTest(t, p, r) {
    const s = t.scale;
    const lx = (p.x + this.e.cam.x - t.fig.x) / s, ly = (p.y - t.fig.y) / s, pad = r / s;
    if ((lx / (BIRD.bodyRx + pad)) ** 2 + (ly / (BIRD.bodyRy + pad)) ** 2 <= 1) return true;
    const dir = t.art.scale.x;
    if (Math.hypot(lx - dir * 92, ly + 50) <= 18 + pad) return true;         // Kopf
    return Math.abs(lx) <= t.plateBox.w + pad && Math.abs(ly - t.plateBox.y) <= t.plateBox.h + pad;
  }

  waveDone() { return !this.targets.some((b) => ['wait', 'fly', 'lock'].includes(b.state)); }

  dismiss() {
    for (const b of this.targets) {
      if (b.state === 'wait') this._remove(b);
      else if (b.state === 'fly') { b.state = 'dive'; b.hittable = false; }
    }
  }

  resolve(b, outcome) {
    const fx = this.e.fx, c = { x: b.center.x, y: b.center.y };
    b.hittable = false;
    audio.play('thud');
    if (outcome === 'lock') { b.state = 'lock'; fx.ring(c, { color: 0xffe066, size: 100 }); return; }
    b.t = 0;
    if (outcome === 'correct') {
      b.state = 'burst';
      fx.flash(c, { color: 0xfff4c8, size: 170 });
      fx.ring(c, { color: 0xffe680, size: 160 });
      fx.burst(c, { count: 46, speed: 260, colors: FEATHERS[b.kind], size: 13, life: 1.5, gravity: 240, drag: 2.2 });
      fx.burst(c, { count: 34, speed: 330, colors: [0xffd84a, 0xfff3b0, 0xff9d2e], size: 10, life: 0.8, gravity: 120, drag: 2, additive: true });
    } else {
      b.state = 'drop'; b.vy = -60;
      b.plate.alpha = 0.4;
      fx.burst(c, { count: 8, speed: 110, colors: FEATHERS[b.kind], size: 10, life: 1.1, gravity: 220, drag: 2 });
    }
  }

  _remove(b) {
    b.state = 'gone'; b.hittable = false;
    b.fig.destroy({ children: true });
  }

  onShoot() {
    audio.play('shot');
    this.kick = 1;
    const m = this._muzzle();
    this.e.fx.flash(m, { color: 0xffd9a0, size: 60, life: 0.09 });
    this.e.fx.burst(m, { count: 5, speed: 40, colors: [0xbbbbbb], size: 14, life: 0.7, gravity: -30, drag: 1, alpha: 0.35 });
  }
  // Fehlschuss: kleine Schrotwolke zeigt, wo die Garbe lag (bei Ballistik hilfreich zum Vorhalten).
  onMiss(p) {
    this.e.fx.burst(p, { count: 7, speed: 46, colors: [0xffffff, 0xd9d9d9], size: 7, life: 0.45, gravity: 40, drag: 2, alpha: 0.8 });
    if (this.ballistic) this.e.fx.ring(p, { color: 0xffffff, size: 26, life: 0.35 });
  }

  _muzzle() {
    const g = this.gun, len = 480 * 0.9;
    return { x: g.x - Math.cos(g.rotation) * len, y: g.y - Math.sin(g.rotation) * len };
  }

  // ------------------------------------------------------------ Bild für Bild
  update(dt, raw) {
    this.time += dt;
    const e = this.e, t = this.time, vr = e.viewRect(), cam = e.cam.x;
    let wind = 0;

    if (this.storm) {
      const st = this.storm;
      st.t += raw;
      const u = Math.min(1, st.t / st.dur);
      wind = Math.sin(u * Math.PI) ** 0.8;
      this._apply(st.from, st.to, smooth((u - 0.32) / 0.36));
      if (u > 0.5 && !st.fx) { st.fx = true; this._setFx(MOODS[STATIONS[st.to][1]].fx); }
      this.veil.alpha = wind * (st.calm ? 0.5 : 0.72);
      const span = vr.x1 - vr.x0 + 900;
      for (const b of this.banks) {
        const px = (b.x + st.dir * u * b.v * 1.2 + 4) % 1;
        b.s.position.set(vr.x0 - 450 + px * span, vr.y0 + b.y * (vr.y1 - vr.y0));
        b.s.alpha = wind * 0.9; b.s.visible = !st.calm;
      }
      if (u >= 1) { this.station = st.to; this.storm = null; this.fog.visible = false; }
    }

    // Himmel: Wolken und ferner Vogelzug
    for (const c of this.clouds) { c.g.x += c.v * raw * (1 + wind * 6); if (c.g.x > X1 + 260) c.g.x = X0 - 260; }
    for (const f of this.flocks) {
      if (f.wait > 0) { f.wait -= raw; continue; }
      f.c.x += f.vx * raw;
      for (const b of f.birds) { const a = Math.sin(t * b.sp + b.ph); b.wings[0].rotation = a * 0.55; b.wings[1].rotation = -a * 0.55; }
      if (f.c.x < X0 - 160 || f.c.x > X1 + 160) { this._resetFlock(f, this._rnd, false); f.wait = 4 + Math.random() * 9; }
    }

    // Wetterteilchen
    if (this.fxKind !== 'none') {
      const sx = vr.x1 - vr.x0 + 80, sy = vr.y1 - vr.y0 + 40, k = this.fxKind;
      for (const b of this.bits) {
        const fall = k === 'laub' ? 46 : k === 'schnee' ? 34 : -7;
        b.y += raw * fall * b.k / sy;
        b.x += raw * (Math.sin(t * 0.9 + b.ph) * (k === 'laub' ? 40 : 12) + 10 + wind * 300) / sx;
        b.y -= Math.floor(b.y);
        const px = b.x - cam * 0.6 / sx;
        b.s.position.set(vr.x0 - 40 + (px - Math.floor(px)) * sx, vr.y0 - 20 + b.y * sy);
        if (k === 'laub') b.s.rotation = t * 2 * b.k + b.ph;
      }
    }

    // Flinte folgt dem Fadenkreuz; der Lauf bleibt unterhalb der Flugbahnen
    const aim = e.aimView(), gx = (vr.x0 + vr.x1) / 2 + 380, gy = 720 + 330;
    this.kick = Math.max(0, this.kick - raw * 6);
    const ang = clamp(Math.atan2(aim.y - gy, aim.x - gx), -2.2, -0.95);
    this.gun.rotation = ang - Math.PI + this.kick * 0.03;
    this.gun.position.set(gx - Math.cos(ang) * this.kick * 16, gy - Math.sin(ang) * this.kick * 16);
    const m = e.toScreen(this._muzzle());
    this.shot.origin.x = m.x / e.view.w; this.shot.origin.y = m.y / e.view.h;

    // Vögel
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const b = this.targets[i];
      if (b.state === 'gone') { this.targets.splice(i, 1); continue; }
      const g = b.fig, s = b.scale;
      if (b.state === 'wait') {
        b.delay -= dt;
        if (b.delay > 0) continue;
        b.state = 'fly'; g.visible = true;
      }
      if (b.state === 'fly') {
        b.t += dt;
        const u = b.t / b.dur;
        if (u >= 1) {                                  // hinter dem Gebüsch gelandet, ohne getroffen zu sein
          this._remove(b);
          if (this.onEscape) this.onEscape(b);
          continue;
        }
        g.x = lerp(b.x0, b.x1, u);
        g.y = BASE_Y - (BASE_Y - b.peak) * Math.sin(Math.PI * u) ** 0.5 + Math.sin(t * 3 + b.phase) * 3;
        g.rotation = (b.x1 > b.x0 ? 1 : -1) * (u < 0.12 ? -0.25 * (1 - u / 0.12) : u > 0.86 ? 0.3 * (u - 0.86) / 0.14 : 0);
        b.hittable = g.y + b.bottom * s < CLEAR_Y;
      } else if (b.state === 'dive' || b.state === 'drop') {     // abtauchen bzw. getroffen abtrudeln
        b.t += dt;
        b.vy += 900 * dt;
        g.y += b.vy * dt;
        if (b.state === 'drop') { g.rotation += dt * 7 * b.art.scale.x; g.x += b.art.scale.x * 40 * dt; }
        if (g.y > BASE_Y + 40) { this._remove(b); continue; }
      } else if (b.state === 'burst') {                // richtig: Vogel vergeht in der Federwolke
        b.t += dt;
        const a = Math.min(1, b.t / 0.22);
        g.scale.set(s * (1 + a * 0.35)); g.alpha = 1 - a;
        if (a >= 1) { this._remove(b); continue; }
      }
      const flap = b.state === 'drop' ? 0.2 : Math.sin(t * (b.state === 'lock' ? 16 : 11) + b.phase);
      b.wing.scale.y = lerp(-0.55, 1, (flap + 1) / 2) / 1.5;
      b.center.x = g.x - cam; b.center.y = g.y;
    }
  }

  // Für Tests: Bildschirmrechtecke der Trefferflächen (Rumpf bis Schild) aller frei fliegenden Vögel.
  debugKids() {
    const e = this.e;
    return this.targets.filter((b) => b.hittable || b.state === 'lock').map((b) => {
      const s = b.scale, hw = Math.max(BIRD.bodyRx, b.plateBox.w) * s;
      const a = e.toScreen({ x: b.center.x - hw, y: b.center.y - BIRD.bodyRy * s }), z = e.toScreen({ x: b.center.x + hw, y: b.center.y + b.bottom * s });
      const o = e.toScreen({ x: b.center.x - BIRD.halfW * s, y: b.center.y + BIRD.top * s }), q = e.toScreen({ x: b.center.x + BIRD.halfW * s, y: b.center.y + b.bottom * s });
      return { text: b.data.text, x0: a.x, y0: a.y, x1: z.x, y1: z.y, fx0: o.x, fy0: o.y, fx1: q.x, fy1: q.y, cx: e.toScreen(b.center).x, cy: e.toScreen(b.center).y };
    });
  }
  debugShow({ solo = false, calm = false } = {}) {
    for (const l of this.e.layers) l.c.visible = l.name === 'voegel' || !(solo || (calm && (l.name === 'wetter' || l.name === 'fx')));
  }

  dispose() {
    this.targets.length = 0;
    for (const t of this._owned || []) t.destroy(true);
    if (window.__scenario === this) window.__scenario = null;
  }
}
