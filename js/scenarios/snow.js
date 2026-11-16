// Szenario "Schneeballschlacht": 2D-Mehrebenen-Szene (PixiJS) mit den Grafiken aus
// assets/schneeball-bruegel – Winterdorf am zugefrorenen See nach Pieter Bruegel.
// Kinder stehen als Klappfiguren in drei Reihen hinter Uferbank, Zaun und
// Schneewehe; das Ergebnis steht auf einem Papierschild vor der Brust.
//
// Aufbau, Etappen (Tagesverlauf, Schneesturm) und die Regeln für sichtbare,
// unverdeckte Ziele sind in spec.md, Abschnitt 7.2 und 7.4, beschrieben.
import { Container, Graphics, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import { rasterSvg, textureOf, softDot, mulberry, lerp, clamp, smooth, lerpColor } from '../engine2d.js';
import { audio } from '../audio.js';

const A = 'assets/schneeball-bruegel/';
const X0 = -240, X1 = 1520, W = X1 - X0;          // Breite der verbreiterten Ebenen
const PAN = 100;                                  // größter Kameraschwenk (Ebene mit f = 1)
const SAFE_HALF = 540;                            // Zielzone: Bildmitte ± 540 (bei f = 1)
const KID = { w: 240, h: 400, feet: 398, head: { x: 120, y: 112, r: 33 }, body: { x0: 82, x1: 170, y0: 146, y1: 290 }, plateY: 203 };
const KIDS = ['kind-1-winker', 'kind-2-schlitten', 'kind-3-werfer', 'kind-4-eislaeufer', 'kind-5-holztraeger', 'kind-6-jubel'];

// Bildebenen von hinten nach vorn. f = Parallaxfaktor, box = gerasterter Ausschnitt (y0, y1).
const LAYERS = [
  { id: 'backdrop', f: 0.06, file: '01-backdrop', box: [0, 720], tint: 'back' },
  { id: 'himmel', f: 0.06 },
  { id: 'voegel', f: 0.12 },
  { id: 'flocken-fern', f: 0 },
  { id: 'haeuser', f: 0.25, file: '02a-haeuser-fern', box: [240, 500], tint: 'back', glow: true },
  { id: 'reiheA', f: 0.40 },
  { id: 'ufer', f: 0.40, file: '02b-ufer', box: [470, 576], tint: 'mid' },
  { id: 'baeume', f: 0.40, file: '03-baeume', box: [0, 580], tint: 'mid' },
  { id: 'nah', f: 0.55, file: '04-haus-nah', box: [200, 640], tint: 'mid', glow: true },
  { id: 'flocken-mitte', f: 0 },
  { id: 'reiheB', f: 0.75 },
  { id: 'zaun', f: 0.75, file: '05-zaun', box: [530, 720], tint: 'front' },
  { id: 'reiheC', f: 1 },
  { id: 'vorn', f: 1, file: '06-schnee-vorn', box: [620, 720], tint: 'front' },
  { id: 'flocken-nah', f: 0 },
];

// Kinderreihen: scale = Größe der Figur, cover = Ebene, die die Füße verdeckt,
// from = Unterkante der Deckung (Suche der Oberkante beginnt dort).
const ROWS = [
  { id: 'A', layer: 'reiheA', scale: 0.46, cover: 'ufer', from: 564, clip: 566, font: 54 },
  { id: 'B', layer: 'reiheB', scale: 0.60, cover: 'zaun', from: 719, font: 48 },
  { id: 'C', layer: 'reiheC', scale: 0.74, cover: 'vorn', from: 719, font: 42 },
];

// Tagesverlauf. tint = Farbmultiplikator je Ebenengruppe (weiß = Originalfarben),
// glow = Himmelsleuchten am Horizont, win = Fensterlicht, label = Text im Etappenbanner.
const PHASES = [
  { id: 'morgen', label: 'Guten Morgen im Winterdorf', tint: { back: 0xf4dcd6, mid: 0xf8e8e2, front: 0xfdf2ec }, glow: [0xf0a088, 0.22], win: 0.35, stars: 0, moon: 0 },
  { id: 'mittag', label: 'Es wird Mittag', tint: { back: 0xffffff, mid: 0xffffff, front: 0xffffff }, glow: [0xffe0a0, 0], win: 0, stars: 0, moon: 0 },
  { id: 'nachmittag', label: 'Der Nachmittag bricht an', tint: { back: 0xfff0d2, mid: 0xfff4de, front: 0xfff8ea }, glow: [0xffcf80, 0.16], win: 0, stars: 0, moon: 0 },
  { id: 'abendrot', label: 'Abendrot über dem See', tint: { back: 0xf6b890, mid: 0xf8c8a8, front: 0xfbd8be }, glow: [0xff8448, 0.4], win: 0.55, stars: 0, moon: 0 },
  { id: 'daemmerung', label: 'Es dämmert – die Fenster leuchten', tint: { back: 0x8a88bc, mid: 0x9a96c2, front: 0xaaa6ca }, glow: [0xc86878, 0.22], win: 1, stars: 0.4, moon: 0.55 },
  { id: 'nacht', label: 'Es ist Nacht geworden', tint: { back: 0x4e6098, mid: 0x5c6ea2, front: 0x6e7fae }, glow: [0x6078c0, 0.1], win: 1, stars: 1, moon: 1 },
];

// Spuren und Dorfleben, die mit den Etappen hinzukommen (Reihenfolge, zyklisch).
const EXTRAS = [
  { id: 'spuren', label: 'Frische Fußspuren im Schnee' },
  { id: 'schlitten', label: 'Ein Schlitten ist vorbeigefahren' },
  { id: 'schneemann', label: 'Jemand hat einen Schneemann gebaut' },
  { id: 'kraehen', label: 'Krähen sitzen auf dem Zaun' },
  { id: 'neuschnee', label: 'Neuschnee deckt die Spuren zu' },
];

const SKATERS = [
  [330, 396, 0.62, '#7b3a30'], [392, 410, 0.66, '#35302b'], [455, 388, 0.58, '#8a6a38'], [520, 430, 0.72, '#3b4e4a'],
  [590, 402, 0.64, '#35302b'], [640, 452, 0.82, '#7b3a30'], [700, 392, 0.6, '#5d5476'], [760, 424, 0.7, '#8a6a38'],
  [815, 470, 0.9, '#35302b'], [872, 398, 0.62, '#3b4e4a'], [930, 438, 0.76, '#7b3a30'], [985, 408, 0.64, '#b9b3a2'],
  [1040, 462, 0.86, '#5d5476'], [260, 470, 0.88, '#8a6a38'], [205, 430, 0.74, '#35302b'], [1110, 420, 0.7, '#3b4e4a'],
];
// Kaminöffnungen (Szenenkoordinaten), aus den Haus-Symbolen der Ebenen berechnet.
const CHIMNEYS = [
  { layer: 'haeuser', x: 44.6, y: 346, size: 0.7 }, { layer: 'haeuser', x: 267.4, y: 316.5, size: 0.5 },
  { layer: 'haeuser', x: 921.5, y: 295, size: 0.45 }, { layer: 'haeuser', x: 1052, y: 305.6, size: 0.55 },
  { layer: 'haeuser', x: 1195.5, y: 280, size: 0.7 }, { layer: 'haeuser', x: -191, y: 336, size: 0.5 },
  { layer: 'nah', x: 120.6, y: 264, size: 1.5 }, { layer: 'nah', x: 1515.5, y: 321, size: 1.1 },
];
const INK = 0x2b2118, PAPER = 0xf1e9d2, SNOW = 0xf2f0e5;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class SnowScenario {
  constructor(engine, opts = {}) {
    this.e = engine;
    this.tempo = opts.tempo || 1;
    this.stages = Math.max(1, opts.stages || 1);
    this.variant = opts.variant || 0;
    this.design = { w: 1280, h: 720 };
    this.pan = { x: PAN, safeHalf: SAFE_HALF, minPan: 40, worldHalf: W / 2 };
    this.shot = {
      cooldown: 0.38, flight: opts.lead === false ? 0.1 : 0.4, radius: 13, arc: 46,
      origin: { x: 0.6, y: 1.04 }, startScale: 1.5, endScale: 0.62, make: () => this._ball(),
    };
    this.targets = [];
    this.onEscape = null;
    this.time = 0;
    this.L = {};                 // Ebenen: id → Container
    this.tintables = { back: [], mid: [], front: [], kids: [] };
    this.glows = []; this.smoke = []; this.puffs = []; this.flocks = []; this.skaters = []; this.flakes = [];
    this.extras = {}; this.storm = null; this.transition = 0;
    this.phase = this._phaseFor(0);
  }

  // ------------------------------------------------------------ Aufbau
  async build() {
    const e = this.e, rnd = mulberry(1565);
    const rs = clamp(Math.round(e.view.s * Math.min(window.devicePixelRatio || 1, 2) * 4) / 4, 1, 2);
    const files = LAYERS.filter((l) => l.file);
    const [rasters, maps, kids, ball, puff, trap] = await Promise.all([
      Promise.all(files.map((l) => rasterSvg(`${A}layers-wide/${l.file}.svg`, { scale: rs, box: [X0, l.box[0], W, l.box[1] - l.box[0]] }))),
      Promise.all(files.map((l) => rasterSvg(`${A}layers-wide/${l.file}.svg`, { scale: 0.5 }))),
      Promise.all(KIDS.map((k) => rasterSvg(`${A}kids/${k}.svg`, { scale: 1.5 }))),
      rasterSvg(`${A}sprites/schneeball.svg`, { scale: 1 }),
      rasterSvg(`${A}sprites/schneepuff.svg`, { scale: 1.5 }),
      rasterSvg(`${A}sprites/vogelfalle.svg`, { scale: 1.5 }),
    ]);
    const skaterTex = {};
    for (const col of new Set(SKATERS.map((s) => s[3]))) {
      skaterTex[col] = textureOf((await rasterSvg(`${A}sprites/eislaeufer.svg`, { scale: 3, replace: ['#7b3a30', col] })).canvas);
    }
    this.tex = { kids: kids.map((k) => textureOf(k.canvas)), ball: textureOf(ball.canvas), puff: textureOf(puff.canvas) };

    // Verdeckungskarten (Alphakanal in halber Auflösung) für die Platzsuche
    this.maps = {};
    files.forEach((l, i) => {
      const c = maps[i].canvas;
      this.maps[l.id] = { a: c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
    });

    for (const l of LAYERS) {
      const c = e.addLayer(l.id, l.f);
      this.L[l.id] = c;
      if (!l.file) continue;
      const r = rasters[files.indexOf(l)];
      if (l.id === 'backdrop') {                       // Himmel nach oben verlängern (hohe Bildschirme):
        const base = textureOf(r.canvas);              // oberste Pixelzeilen der Grafik hochziehen
        const strip = new Sprite(new Texture({ source: base.source, frame: new Rectangle(0, 1, r.canvas.width, 2) }));
        strip.position.set(X0, -1600); strip.width = W; strip.height = 1601;
        c.addChild(this._tinted(strip, 'back'));
      }
      if (l.id === 'nah') this._buildTracks(c);
      const sp = new Sprite(textureOf(r.canvas));
      sp.position.set(r.x, r.y); sp.scale.set(1 / rs);
      c.addChild(this._tinted(sp, l.tint));
      if (l.glow) this._buildGlow(c, r);
    }

    this._buildSky(rnd);
    this._buildSkaters(skaterTex, rnd);
    this._buildBirds(rnd);
    this._buildSmoke();
    this._buildVillage(trap);
    this._buildFlakes(rnd);
    this._buildRows();
    this._applyPhase(this.phase, this.phase, 0);
    if (new URLSearchParams(location.search).has('debug')) window.__scenario = this;
  }

  _tinted(obj, group) { this.tintables[group].push(obj); return obj; }

  // Leuchtende Fenster: Pixel in der Fensterfarbe der Grafik werden in eine eigene,
  // nicht abgedunkelte Ebene kopiert (plus weicher Lichtschein).
  _buildGlow(layer, r) {
    const src = r.canvas, w = src.width, h = src.height;
    const d = src.getContext('2d').getImageData(0, 0, w, h).data;
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const g = out.getContext('2d'), img = g.createImageData(w, h), o = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 200 && Math.abs(d[i] - 232) < 22 && Math.abs(d[i + 1] - 189) < 22 && Math.abs(d[i + 2] - 106) < 26) {
        o[i] = 255; o[i + 1] = 214; o[i + 2] = 128; o[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const halo = document.createElement('canvas'); halo.width = w >> 2; halo.height = h >> 2;
    const hg = halo.getContext('2d');
    hg.filter = `blur(${Math.max(2, Math.round(r.scale * 2.5))}px)`;
    hg.drawImage(out, 0, 0, halo.width, halo.height);
    const lit = new Sprite(Texture.from(out)), glow = new Sprite(Texture.from(halo));
    lit.position.set(r.x, r.y); lit.scale.set(1 / r.scale);
    glow.position.set(r.x, r.y); glow.scale.set(4 / r.scale); glow.blendMode = 'add';
    layer.addChild(glow, lit);
    this.glows.push({ lit, glow });
    this._owned = (this._owned || []).concat(lit.texture, glow.texture);
  }

  _buildSky(rnd) {
    const c = this.L.himmel;
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const tex = Texture.from(gc);
    this._owned = (this._owned || []).concat(tex);
    this.skyGlow = new Sprite(tex);
    this.skyGlow.anchor.set(0.5); this.skyGlow.position.set(880, 300);
    this.skyGlow.width = 1700; this.skyGlow.height = 560; this.skyGlow.blendMode = 'add';
    this.stars = new Graphics();
    for (let i = 0; i < 150; i++) {
      const x = X0 + rnd() * W, y = -40 + rnd() * 290;
      if (x > 980 && x < 1040 && y > 150) continue;             // Kirchturm aussparen
      this.stars.circle(x, y, 0.6 + rnd() * 0.9).fill({ color: 0xfff8e0, alpha: 0.5 + rnd() * 0.5 });
    }
    this.moon = new Container();
    const halo = new Sprite(tex); halo.anchor.set(0.5); halo.width = halo.height = 190; halo.alpha = 0.5; halo.blendMode = 'add';
    this.moon.addChild(halo, new Graphics().circle(0, 0, 20).fill(0xf4efd8).circle(-6, -4, 4).fill({ color: 0xd9d2b4, alpha: 0.6 }).circle(7, 6, 3).fill({ color: 0xd9d2b4, alpha: 0.5 }));
    this.moon.position.set(300, 108);
    c.addChild(this.skyGlow, this.stars, this.moon);
  }

  // Eisläufer ziehen kleine Bögen um ihre Plätze aus der Vorlage.
  _buildSkaters(tex, rnd) {
    for (const [x, y, s, col] of SKATERS) {
      const sp = new Sprite(tex[col]);
      sp.anchor.set(0.5, 40 / 46); sp.scale.set(s / 3);
      this.L.backdrop.addChild(this._tinted(sp, 'back'));
      this.skaters.push({ sp, x, y, s: s / 3, rx: 22 + rnd() * 46, ry: 3 + rnd() * 7, sp0: (rnd() < 0.5 ? -1 : 1) * (0.35 + rnd() * 0.5), ph: rnd() * 6.28 });
    }
  }

  _buildBirds(rnd) {
    for (let i = 0; i < 3; i++) {
      const c = new Container();
      this.L.voegel.addChild(this._tinted(c, 'back'));
      const flock = { c, birds: [], vx: 0, wait: i * 4 + rnd() * 3 };
      for (let b = 0; b < 9; b++) {
        const bird = new Container(), wings = [];
        for (const sd of [-1, 1]) {
          const w = new Graphics().moveTo(0, 0).quadraticCurveTo(sd * 4.5, -6, sd * 9, 0).stroke({ width: 1.8, color: 0x2a231c, cap: 'round' });
          bird.addChild(w); wings.push(w);
        }
        c.addChild(bird);
        flock.birds.push({ bird, wings, ph: rnd() * 6.28, sp: 7 + rnd() * 3 });
      }
      this.flocks.push(flock);
      this._resetFlock(flock, rnd, i === 0);
    }
    this._rnd = rnd;
  }
  _resetFlock(f, rnd, visibleNow) {
    const dir = rnd() < 0.5 ? -1 : 1, n = 3 + Math.floor(rnd() * 7), size = 0.7 + rnd() * 0.7;
    f.vx = dir * (26 + rnd() * 26);
    f.c.position.set(visibleNow ? 200 + rnd() * 800 : (dir > 0 ? X0 - 120 : X1 + 120), 60 + rnd() * 170);
    f.birds.forEach((b, i) => {
      b.bird.visible = i < n;
      const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;              // Keilformation
      b.bird.position.set(-dir * row * 22 + (rnd() - 0.5) * 8, side * row * 11 + (rnd() - 0.5) * 6);
      b.bird.scale.set(size * (0.85 + rnd() * 0.3));
    });
  }

  _buildSmoke() {
    for (const ch of CHIMNEYS) {
      const c = new Container();
      this.L[ch.layer].addChild(this._tinted(c, ch.layer === 'nah' ? 'mid' : 'back'));
      this.smoke.push({ ...ch, c, t: Math.random() });
    }
  }

  // Requisiten und Dorfleben, das mit den Etappen sichtbar wird.
  _buildTracks(layer) {
    const add = (id, obj, group = 'mid') => { obj.alpha = 0; layer.addChild(this._tinted(obj, group)); this.extras[id] = obj; return obj; };
    const prints = new Graphics();
    const trail = (pts) => {
      let side = 1;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay), n = Math.round(len / 11);
        for (let k = 0; k < n; k++) {
          const t = k / n; side = -side;
          prints.ellipse(lerp(ax, bx, t), lerp(ay, by, t) + side * 2.2, 3.6, 1.9).fill({ color: 0x8696a0, alpha: 0.75 });
        }
      }
    };
    trail([[150, 590], [270, 604], [400, 596], [470, 606], [500, 632]]);
    trail([[742, 576], [850, 596], [960, 588], [1080, 598]]);
    trail([[560, 574], [600, 598], [575, 630]]);
    add('spuren', prints);
    const sled = new Graphics();
    for (const dy of [0, 7]) {
      sled.moveTo(1130, 596 + dy).bezierCurveTo(980, 612 + dy, 860, 580 + dy, 700, 592 + dy).bezierCurveTo(610, 598 + dy, 560, 610 + dy, 500, 626 + dy)
        .stroke({ width: 2, color: 0x9fb0b0, alpha: 0.85, cap: 'round' });
    }
    add('schlitten', sled);
  }

  _buildVillage(trap) {
    // Schneemann (Ebene "nah", vor dem Ufer, hinter dem Zaun)
    const sm = new Graphics();
    const ball = (x, y, r) => sm.circle(x, y, r).fill(SNOW).stroke({ width: 2, color: 0x7d8c92 });
    sm.ellipse(0, 1, 24, 5).fill({ color: 0xa9b8ba, alpha: 0.5 });
    ball(0, -15, 16); ball(0, -38, 12); ball(0, -56, 8.5);
    sm.moveTo(-11, -40).lineTo(-26, -50).moveTo(11, -40).lineTo(25, -47).stroke({ width: 2, color: 0x3d2f22, cap: 'round' });
    sm.circle(-3, -58, 1.2).circle(3, -58, 1.2).circle(0, -40, 1.3).circle(0, -34, 1.3).fill(INK);
    sm.poly([0, -55, 9, -53, 0, -52]).fill(0xd1803a);
    sm.poly([-8, -63, 8, -63, 6, -74, -6, -74]).fill(0x3a2a1c).rect(-11, -64, 22, 2.5).fill(0x3a2a1c);
    sm.position.set(552, 618); sm.alpha = 0;
    this.L.nah.addChild(this._tinted(sm, 'mid'));
    this.extras.schneemann = sm;

    // Vogelfalle steht hinter Reihe B (verdeckt kein Kind)
    const tr = new Sprite(textureOf(trap.canvas));
    tr.position.set(830, 538); tr.scale.set(0.7 / 1.5);
    this.L.reiheB.addChild(this._tinted(tr, 'front'));

    // Krähen auf den Zaunpfosten
    const crows = new Graphics();
    for (const [x, y, d] of [[171, 541, 1], [695, 541, -1], [1087, 547, 1], [433, 543, -1]]) {
      crows.ellipse(x, y, 8, 5).fill(0x1d1814).circle(x + d * 7, y - 4, 3.6).fill(0x1d1814)
        .poly([x + d * 10, y - 5, x + d * 15, y - 3.5, x + d * 10, y - 2.5]).fill(0x3d3226)
        .poly([x - d * 6, y - 1, x - d * 15, y + 1, x - d * 6, y + 3]).fill(0x1d1814);
    }
    crows.alpha = 0;
    this.L.zaun.addChild(this._tinted(crows, 'front'));
    this.extras.kraehen = crows;
  }

  // Schneefall in drei Tiefen (Sichtkoordinaten) plus Sturmflocken und Schleier.
  _buildFlakes(rnd) {
    const few = reducedMotion() ? 0.4 : 1;
    const sets = [['flocken-fern', 70, 1.5, 20, 0.15, 0.7], ['flocken-mitte', 60, 2.4, 34, 0.5, 0.8], ['flocken-nah', 44, 3.8, 54, 1.0, 0.9]];
    for (const [id, n, size, speed, depth, alpha] of sets) {
      for (let i = 0; i < n * few; i++) {
        const s = new Sprite(softDot());
        s.anchor.set(0.5); s.scale.set(size * (0.7 + rnd() * 0.6) / 22); s.alpha = alpha * (0.6 + rnd() * 0.4);
        this.L[id].addChild(s);
        this.flakes.push({ s, x: rnd(), y: rnd(), speed: speed * (0.7 + rnd() * 0.6), depth, ph: rnd() * 6.28, gust: false });
      }
    }
    this.veil = new Graphics().rect(X0 - 200, -1600, W + 400, 2400).fill(0xe6ebee);
    this.veil.alpha = 0; this.veil.visible = false;
    this.gust = new Container(); this.gust.visible = false;
    for (let i = 0; i < 240 * few; i++) {
      const s = new Sprite(softDot());
      s.anchor.set(0.5); s.scale.set((5 + rnd() * 7) / 22, (1.6 + rnd() * 2) / 22); s.alpha = 0.5 + rnd() * 0.5;
      this.gust.addChild(s);
      this.flakes.push({ s, x: rnd(), y: rnd(), speed: 80 + rnd() * 120, depth: 1, ph: rnd() * 6.28, gust: true, wind: 700 + rnd() * 700 });
    }
    this.L['flocken-nah'].addChild(this.veil, this.gust);
  }

  // ------------------------------------------------------------ Plätze
  _alpha(map, x, y) {
    const mx = Math.round((x - X0) * 0.5), my = Math.min(map.h - 1, Math.round(y * 0.5));
    if (mx < 0 || my < 0 || mx >= map.w) return 0;
    return map.a[(my * map.w + mx) * 4 + 3];
  }
  // Oberkante der Deckung an der Stelle x (von der Unterkante aufwärts gesucht).
  _coverTop(map, x, from) {
    let y = from;
    while (y > 0 && this._alpha(map, x, y) > 128) y -= 2;
    return y + 2;
  }
  _blocked(map, x0, x1, y0, y1) {
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) if (this._alpha(map, x, y) > 40) return true;
    return false;
  }

  // Für jede Reihe alle Standorte bestimmen, an denen ein Kind
  //  - bei jedem Kameraschwenk im Bild bleibt (Zielzone),
  //  - mit der Fußleiste hinter seiner Deckung steht und
  //  - mit Kopf, Schild und Körper von keiner davorliegenden Ebene verdeckt wird.
  _buildRows() {
    const order = LAYERS.map((l) => l.id);
    this.rows = ROWS.map((cfg, z) => {
      const s = cfg.scale, li = order.indexOf(cfg.layer), f = LAYERS[li].f;
      const c = new Container();
      this.L[cfg.layer].addChild(this._tinted(c, 'kids'));
      if (cfg.clip) {                                   // Deckung endet oberhalb des Bildrands: darunter abschneiden
        const m = new Graphics().rect(X0, -1600, W, 1600 + cfg.clip).fill(0xffffff);
        this.L[cfg.layer].addChild(m); c.mask = m;
      }
      const front = LAYERS.slice(li + 1).filter((l) => l.file).map((l) => ({ map: this.maps[l.id], shift: Math.abs(l.f - f) * PAN + 3, own: l.id === cfg.cover }));
      const cover = this.maps[cfg.cover], half = SAFE_HALF - 105 * s - 8, free = [];
      for (let x = 640 - half; x <= 640 + half; x += 4) {
        let top = 0;
        for (let bx = -58 * s; bx <= 58 * s; bx += 4) top = Math.max(top, this._coverTop(cover, x + bx, cfg.from));
        const feet = top + 15 * s + 5;
        const yTop = feet - (KID.feet - 38) * s;
        const ok = front.every((l) => !this._blocked(l.map, x - 52 * s - l.shift, x + 52 * s + l.shift, yTop, feet - (KID.feet - (l.own ? 230 : 290)) * s));
        if (ok) free.push({ x, feet });
      }
      return { ...cfg, z, f, c, free };
    });
  }

  // Zwei Kinder vertragen sich, wenn das vordere das hintere (Kopf, Schild, Körper)
  // bei keinem Kameraschwenk überdeckt und Figuren derselben Reihe sich nicht berühren.
  _clash(a, b) {
    const dx = Math.abs(a.x - b.x);
    if (a.row === b.row) return dx < (a.half + b.half) * a.row.scale + 46 * a.row.scale;
    const [back, frontK] = a.row.z < b.row.z ? [a, b] : [b, a];
    return dx < 104 * frontK.row.scale + back.half * back.row.scale + Math.abs(frontK.row.f - back.row.f) * PAN + 6;
  }

  _place(kids) {
    const weight = this.rows.map((r) => (r.free.length ? (r.id === 'A' ? 1 : 2.2) : 0));
    const total = weight.reduce((s, w) => s + w, 0);
    let best = [];
    for (let attempt = 0; attempt < 60 && best.length < kids.length; attempt++) {
      const placed = [];
      for (const kid of kids) {
        for (let tries = 0; tries < 50; tries++) {
          let r = Math.random() * total, row = this.rows[0];
          for (let i = 0; i < this.rows.length; i++) { r -= weight[i]; if (r <= 0) { row = this.rows[i]; break; } }
          const spot = row.free[Math.floor(Math.random() * row.free.length)];
          const cand = { row, x: spot.x, feet: spot.feet, half: kid.half };
          if (placed.every((p) => !this._clash(p, cand))) { placed.push(cand); break; }
        }
        if (placed.length <= kids.indexOf(kid)) break;
      }
      if (placed.length > best.length) best = placed;
    }
    return best;
  }

  // ------------------------------------------------------------ Kinder
  _kid(text, row) {
    const fig = new Container();
    const sp = new Sprite(this.tex.kids[Math.floor(Math.random() * this.tex.kids.length)]);
    sp.anchor.set(0.5, KID.feet / KID.h); sp.scale.set(1 / 1.5);
    const size = row.font * (text.length > 3 ? 0.8 : 1);
    const label = new Text({ text, style: { fontFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif', fontWeight: '900', fontSize: size, fill: INK } });
    label.anchor.set(0.5); label.resolution = 2;
    const pw = Math.max(label.width + 22, size * 1.5), ph = size + 12;
    const plate = new Container();
    plate.addChild(
      new Graphics().moveTo(-pw / 2 + 8, -ph / 2).lineTo(-12, -ph / 2 - 26).moveTo(pw / 2 - 8, -ph / 2).lineTo(12, -ph / 2 - 26).stroke({ width: 2, color: 0x3d2f22 }),
      new Graphics().roundRect(-pw / 2, -ph / 2, pw, ph, 7).fill(PAPER).stroke({ width: 3.5, color: INK }),
      label,
    );
    plate.position.set(0, KID.plateY - KID.feet);
    fig.addChild(sp, plate);
    fig.scale.set(row.scale);
    return { fig, sp, plate, half: Math.max(50, pw / 2 + 4), plateBox: { w: pw / 2, h: ph / 2 } };
  }

  spawnWave(labels) {
    // halbe Schildbreite (in Figur-Einheiten) vorab schätzen, dann Plätze suchen
    const spots = this._place(labels.map((lab) => ({ half: Math.max(50, lab.text.length * 16 + 16) })));
    labels.forEach((lab, i) => {
      const spot = spots[i];
      if (!spot) return;                                  // kein freier Platz (kommt bei 5 Zielen nicht vor)
      const b = { lab, text: lab.text };
      const k = this._kid(b.text, spot.row);
      k.fig.position.set(spot.x, spot.feet);
      k.fig.visible = false;
      spot.row.c.addChild(k.fig);
      const t = {
        ...k, data: b.lab, row: spot.row, x: spot.x, feet: spot.feet, z: spot.row.z, f: spot.row.f, center: { x: 0, y: 0 }, hittable: false,
        state: 'wait', delay: 0.2 + i * 0.45 / this.tempo, t: 0, k: 0, stay: (7.5 + Math.random() * 2) / this.tempo, phase: Math.random() * 6.28,
      };
      t.hitTest = (p, r) => this._hitTest(t, p, r);
      this.targets.push(t);
    });
  }

  _hitTest(t, p, r) {
    const s = t.row.scale, pad = r / s + 7;
    const lx = (p.x + this.e.cam.x * t.row.f - t.x) / s + KID.w / 2, ly = (p.y - t.fig.y) / s + KID.feet;
    if (Math.hypot(lx - KID.head.x, ly - KID.head.y) <= KID.head.r + pad) return true;
    const b = KID.body;
    if (lx >= b.x0 - pad && lx <= b.x1 + pad && ly >= b.y0 - pad && ly <= b.y1 + pad) return true;
    return Math.abs(lx - KID.w / 2) <= t.plateBox.w + pad && Math.abs(ly - KID.plateY) <= t.plateBox.h + pad;
  }

  waveDone() { return !this.targets.some((k) => ['wait', 'rise', 'up', 'lock'].includes(k.state)); }

  dismiss() {
    for (const k of this.targets) {
      if (k.state === 'wait') this._remove(k);
      else if (k.state === 'rise' || k.state === 'up') { k.state = 'hide'; k.hittable = false; }
    }
  }

  resolve(k, outcome) {
    const fx = this.e.fx, c = k.center;
    k.hittable = false;
    audio.play('thud');
    this._puff(c, 0.5 * k.row.scale / 0.74);
    fx.burst(c, { count: 14, speed: 150, colors: [0xffffff, 0xe8eef2], size: 9, life: 0.6, gravity: 420, drag: 1.6 });
    if (outcome === 'lock') { k.state = 'lock'; fx.ring(c, { color: 0xffe066, size: 90 }); return; }
    k.t = 0;
    if (outcome === 'correct') {
      k.state = 'fall';
      k.fig.y = k.feet; k.fig.rotation = 0;
      fx.flash(c, { color: 0xfff4c8, size: 150 });
      fx.ring(c, { color: 0xffe680, size: 150 });
      fx.burst(c, { count: 36, speed: 300, colors: [0xffd84a, 0xfff3b0, 0x9be7ff, 0xff9ecb], size: 10, life: 0.9, gravity: 160, drag: 2, additive: true });
    } else {
      k.state = 'funny';
      k.plate.alpha = 0.4;
    }
  }

  _remove(k) {
    k.state = 'gone'; k.hittable = false;
    k.fig.destroy({ children: true });
  }

  // Schneepuff aus der Vorlage: kurz aufblähen und ausblenden.
  _puff(p, size = 1) {
    const s = new Sprite(this.tex.puff);
    s.anchor.set(0.5); s.position.set(p.x, p.y);
    this.e.fx.root.addChild(s);
    this.puffs.push({ s, t: 0, size: size / 1.5 });
  }
  _ball() {
    const s = new Sprite(this.tex.ball);
    s.anchor.set(0.5);
    const c = new Container(); c.addChild(s); s.scale.set(0.42);
    return c;
  }
  depthAt(y) { return clamp(lerp(0.55, 1, (y - 380) / 300), 0.55, 1); }
  onShoot() { audio.play('throw'); }
  onMiss(p) {
    if (p.y < 330) return;                                  // in den Himmel geworfen
    this._puff(p, 0.3 * this.depthAt(p.y));
    this.e.fx.burst(p, { count: 6, speed: 90, colors: [0xffffff], size: 7, life: 0.45, gravity: 380, up: 60 });
  }

  // ------------------------------------------------------------ Etappen
  // Tageszeit einer Etappe: Der Tag läuft über die Runde vom Morgen bis zur Nacht.
  _phaseFor(stage) {
    const n = this.stages, last = PHASES.length - 1;
    if (n <= 1) return this.variant % 2 ? 3 : 1;
    const first = n >= 4 ? 0 : 1;
    return Math.round(lerp(first, last, stage / (n - 1)));
  }

  // Zwischenrunde nach einer Etappe: Schneesturm, danach neue Tageszeit und ein
  // neues Detail im Dorf. Gibt Dauer und Bannertext zurück (siehe play.js).
  intermission(stage) {
    const to = this._phaseFor(stage), calm = reducedMotion();
    const extra = EXTRAS[this.transition % EXTRAS.length];
    this.transition++;
    const goal = {};
    for (const id of Object.keys(this.extras)) goal[id] = this.extras[id].alpha;
    if (extra.id === 'neuschnee') { goal.spuren = 0; goal.schlitten = 0; } else goal[extra.id] = 1;
    const start = { ...goal };
    for (const id of Object.keys(this.extras)) start[id] = this.extras[id].alpha;
    this.storm = { t: 0, dur: calm ? 2.2 : 3.4, from: this.phase, to, dir: stage % 2 ? -1 : 1, start, goal, calm };
    this.gust.visible = !calm;
    audio.play('wind');
    return { duration: this.storm.dur + 0.3, label: to !== this.phase ? PHASES[to].label : extra.label, detail: to !== this.phase ? extra.label : '' };
  }

  _applyPhase(ai, bi, k) {
    const a = PHASES[ai], b = PHASES[bi];
    for (const g of ['back', 'mid', 'front']) {
      const col = lerpColor(a.tint[g], b.tint[g], k);
      for (const o of this.tintables[g]) o.tint = col;
    }
    // Kinder bleiben heller als die Umgebung, damit Schild und Figur lesbar sind
    const kc = lerpColor(lerpColor(a.tint.front, b.tint.front, k), 0xffffff, 0.55);
    for (const o of this.tintables.kids) o.tint = kc;
    this.skyGlow.tint = lerpColor(a.glow[0], b.glow[0], k);
    this.skyGlow.alpha = lerp(a.glow[1], b.glow[1], k);
    this.stars.alpha = lerp(a.stars, b.stars, k);
    this.moon.alpha = lerp(a.moon, b.moon, k);
    this.win = lerp(a.win, b.win, k);
    this.skyGlow.visible = this.skyGlow.alpha > 0.01;
    this.stars.visible = this.stars.alpha > 0.01;
    this.moon.visible = this.moon.alpha > 0.01;
  }

  // ------------------------------------------------------------ Bild für Bild
  update(dt, raw) {
    this.time += dt;
    const e = this.e, cam = e.cam.x, vr = e.viewRect(), t = this.time;
    let wind = 0;                                           // 0 … 1 Sturmstärke

    if (this.storm) {
      const st = this.storm;
      st.t += raw;
      const u = Math.min(1, st.t / st.dur);
      wind = Math.sin(u * Math.PI) ** 0.8;
      const k = smooth((u - 0.3) / 0.4);
      this._applyPhase(st.from, st.to, k);
      for (const id of Object.keys(this.extras)) this.extras[id].alpha = lerp(st.start[id], st.goal[id], k);
      this.veil.alpha = wind * (st.calm ? 0.45 : 0.62); this.veil.visible = true;
      this.windDir = st.dir;
      if (u >= 1) { this.phase = st.to; this.storm = null; this.gust.visible = false; this.veil.visible = false; }
    }

    // Fensterlicht flackert leicht
    for (const g of this.glows) {
      g.lit.visible = g.glow.visible = this.win > 0.01;       // unsichtbare Flächen nicht zeichnen
      g.lit.alpha = this.win; g.glow.alpha = this.win * (0.75 + Math.sin(t * 3.1) * 0.06);
    }

    // Schnee
    const spanX = vr.x1 - vr.x0 + 260, spanY = vr.y1 - vr.y0 + 40, dir = this.windDir || 1;
    for (const f of this.flakes) {
      if (f.gust && !this.gust.visible) continue;
      f.y += raw * f.speed * (1 + wind * 1.5) / spanY;
      f.x += raw * (Math.sin(t * 0.8 + f.ph) * 9 + dir * (f.gust ? f.wind : wind * 520 * (0.4 + f.depth))) / spanX;
      f.y -= Math.floor(f.y);
      const px = f.x - cam * f.depth * 0.5 / spanX;
      f.s.position.set(vr.x0 - 130 + (px - Math.floor(px)) * spanX, vr.y0 - 20 + f.y * spanY);
      if (f.gust) f.s.alpha = wind;
    }

    // Kaminrauch
    for (const s of this.smoke) {
      s.t += raw;
      if (s.t > 0.42) {
        s.t = 0;
        const p = new Sprite(softDot());
        p.anchor.set(0.5); p.position.set(s.x, s.y); p.tint = 0xd8d3c0;
        s.c.addChild(p);
        (s.puffs ||= []).push({ p, t: 0, life: 5 + Math.random() * 2, vx: (Math.random() - 0.3) * 5, grow: 0.8 + Math.random() * 0.5 });
      }
      for (let i = (s.puffs?.length || 0) - 1; i >= 0; i--) {
        const q = s.puffs[i];
        q.t += raw;
        const u = q.t / q.life;
        if (u >= 1) { q.p.destroy(); s.puffs.splice(i, 1); continue; }
        q.p.x += (q.vx + 5 * u + dir * wind * 160) * raw * s.size;
        q.p.y -= (15 - u * 7) * raw * s.size;
        q.p.scale.set(s.size * (0.3 + u * q.grow * 1.3));
        q.p.alpha = 0.42 * Math.min(1, u * 6) * (1 - u);
      }
    }

    // Vogelschwärme
    for (const f of this.flocks) {
      if (f.wait > 0) { f.wait -= raw; continue; }
      f.c.x += f.vx * raw * (1 + wind * 2);
      f.c.y += Math.sin(t * 0.5 + f.vx) * 2 * raw;
      for (const b of f.birds) {
        const a = Math.sin(t * b.sp + b.ph);
        b.wings[0].rotation = a * 0.55; b.wings[1].rotation = -a * 0.55;
      }
      if (f.c.x < X0 - 160 || f.c.x > X1 + 160) { this._resetFlock(f, this._rnd, false); f.wait = 3 + Math.random() * 8; }
    }

    // Eisläufer
    for (const s of this.skaters) {
      const a = t * s.sp0 + s.ph;
      s.sp.position.set(s.x + Math.cos(a) * s.rx, s.y + Math.sin(a) * s.ry);
      s.sp.scale.x = s.s * (Math.sin(a) * s.sp0 > 0 ? -1 : 1);
      s.sp.rotation = Math.sin(a * 2) * 0.09;
    }

    // Schneepuffs
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.t += raw;
      const u = Math.min(1, p.t / 0.45);
      p.s.scale.set(p.size * lerp(0.6, 1.2, u)); p.s.alpha = 1 - u * u;
      if (u >= 1) { p.s.destroy(); this.puffs.splice(i, 1); }
    }

    // Kinder
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const k = this.targets[i];
      if (k.state === 'gone') { this.targets.splice(i, 1); continue; }
      const g = k.fig, s = k.row.scale;
      if (k.state === 'wait') {
        k.delay -= dt;
        if (k.delay > 0) continue;
        k.state = 'rise'; g.visible = true;
      }
      if (k.state === 'rise') {
        k.k = Math.min(1, k.k + dt * 3.6);
        if (k.k > 0.6) k.hittable = true;
        if (k.k >= 1) k.state = 'up';
      } else if (k.state === 'up') {
        k.t += dt;
        if (k.t > k.stay) { k.state = 'hide'; k.hittable = false; k.escaped = true; }
      } else if (k.state === 'hide') {
        k.k -= dt * 3.6;
        if (k.k <= 0) {
          const esc = k.escaped;
          this._remove(k);
          if (esc && this.onEscape) this.onEscape(k);
          continue;
        }
      } else if (k.state === 'funny') {             // falsch: Figur wackelt auf ihrer Leiste und taucht ab
        k.t += dt;
        g.rotation = Math.sin(k.t * 24) * 0.13 * Math.max(0, 1 - k.t / 1.1);
        if (k.t > 1.2) { g.rotation = 0; k.state = 'hide'; }
      } else if (k.state === 'fall') {              // richtig: Figur klappt nach hinten weg
        k.t += dt;
        const a = Math.min(1, k.t / 0.24);
        g.scale.y = s * Math.max(0.06, Math.cos(a * a * 1.48));
        g.skew.x = a * 0.12;
        k.sp.tint = lerpColor(0xffffff, 0xa89e8c, a);
        if (a >= 1 && !k.puffed) {
          k.puffed = true;
          this._puff(e.layerToView({ x: k.x, y: k.feet - 14 * s }, k.row.f), 0.75 * s / 0.74);
        }
        if (a >= 1) g.alpha = Math.max(0, 1 - (k.t - 0.24) / 0.25);
        if (k.t > 0.6) { this._remove(k); continue; }
      }
      if (['rise', 'up', 'hide', 'funny', 'lock'].includes(k.state)) {
        const ease = 1 - Math.pow(1 - Math.max(0, k.k), 3);
        g.y = k.feet + (1 - ease) * (KID.h * s + 6);
        if (k.state === 'up') g.rotation = Math.sin(this.time * 2.3 + k.phase) * 0.022;
      }
      const c = e.layerToView({ x: k.x, y: g.y - (KID.feet - 190) * s }, k.row.f);
      k.center.x = c.x; k.center.y = c.y;
    }
  }

  // Für Tests: Sichtrechtecke der Trefferflächen aller sichtbaren Kinder.
  debugKids() {
    return this.targets.filter((k) => k.state === 'up' || k.state === 'lock').map((k) => {
      const s = k.row.scale, e = this.e;
      const a = e.toScreen(e.layerToView({ x: k.x - k.half * s, y: k.feet - (KID.feet - 70) * s }, k.row.f));
      const b = e.toScreen(e.layerToView({ x: k.x + k.half * s, y: k.feet - (KID.feet - 230) * s }, k.row.f));
      return { row: k.row.id, text: k.data.text, x0: a.x, y0: a.y, x1: b.x, y1: b.y, cx: e.toScreen(k.center).x, cy: e.toScreen(k.center).y };
    });
  }
  // Für Tests: nur die Kinderreihen zeigen (solo) bzw. Schnee und Effekte ausblenden (calm).
  debugShow({ solo = false, calm = false } = {}) {
    const kidLayers = new Set(ROWS.map((r) => r.layer));
    for (const l of this.e.layers) {
      const fxLayer = l.name.startsWith('flocken') || l.name === 'fx';
      l.c.visible = kidLayers.has(l.name) || !(solo || (calm && fxLayer));
    }
  }

  dispose() {
    this.targets.length = 0;
    for (const t of this._owned || []) t.destroy(true);
    if (window.__scenario === this) window.__scenario = null;
  }
}
