// 2D-Grundgerüst auf PixiJS: gestaffelte Bildebenen mit Parallaxe, leichter
// Kameraschwenk mit der Maus, Geschosse (wahlweise mit Ballistik), Partikel.
//
// Koordinaten: Alle Ebenen teilen das Raster der Szene (design.w × design.h,
// Ursprung oben links). Eine Ebene mit Parallaxfaktor f wird um −cam.x · f
// verschoben. „Sichtkoordinaten“ sind Szenenkoordinaten bei f = 0; darin laufen
// Geschosse, Effekte und der Treffertest.
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';

export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smooth = (k) => { const c = clamp(k, 0, 1); return c * c * (3 - 2 * c); };
export function lerpColor(a, b, k) {
  const r = lerp((a >> 16) & 255, (b >> 16) & 255, k), g = lerp((a >> 8) & 255, (b >> 8) & 255, k), bl = lerp(a & 255, b & 255, k);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl);
}

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let dotTex = null;
export function softDot() {
  if (dotTex) return dotTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  dotTex = Texture.from(c);
  return dotTex;
}

// SVG-Datei einmalig in eine Leinwand rastern (Filter der SVGs kosten dann nichts
// mehr). `box` = Ausschnitt in SVG-Einheiten, `replace` = Textersetzungen (Farben).
const svgCache = new Map();
export async function rasterSvg(url, { scale = 1, box = null, replace = null } = {}) {
  const key = `${url}|${scale}|${box ? box.join(',') : ''}|${replace ? replace.join('>') : ''}`;
  if (svgCache.has(key)) return svgCache.get(key);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Grafik fehlt: ${url}`);
  let text = await res.text();
  if (replace) text = text.split(replace[0]).join(replace[1]);
  const blobUrl = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
  const img = new Image();
  img.src = blobUrl;
  await img.decode();
  URL.revokeObjectURL(blobUrl);
  const vb = (text.match(/viewBox="([^"]+)"/) || [0, `0 0 ${img.width} ${img.height}`])[1].split(/[\s,]+/).map(Number);
  const [bx, by, bw, bh] = box || vb;                    // Ausschnitt in SVG-Einheiten
  const c = document.createElement('canvas');
  c.width = Math.round(bw * scale); c.height = Math.round(bh * scale);
  const g = c.getContext('2d');
  // Bildpixel des <img> entsprechen SVG-Einheiten (width/height = viewBox-Größe)
  g.drawImage(img, bx - vb[0], by - vb[1], bw, bh, 0, 0, c.width, c.height);
  const out = { canvas: c, x: bx, y: by, w: bw, h: bh, scale };
  svgCache.set(key, out);
  return out;
}
const texCache = new Map();
export function textureOf(canvas) {
  if (!texCache.has(canvas)) texCache.set(canvas, Texture.from(canvas));
  return texCache.get(canvas);
}

// ---------- Partikel und kurzlebige Effekte (Sichtkoordinaten) ----------
export class Fx2D {
  constructor(parent) {
    this.root = new Container();
    parent.addChild(this.root);
    this.live = []; this.pool = []; this.transients = [];
  }
  burst(pos, { count = 30, speed = 320, colors = [0xffffff], size = 14, life = 0.8, gravity = 600, drag = 1.5, additive = false, up = 0, alpha = 1 } = {}) {
    for (let i = 0; i < count; i++) {
      const s = this.pool.pop() || new Sprite(softDot());
      s.anchor.set(0.5);
      const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random() * 0.7);
      s.position.set(pos.x, pos.y);
      s.tint = colors[Math.floor(Math.random() * colors.length)];
      s.blendMode = additive ? 'add' : 'normal';
      s.scale.set(size * (0.5 + Math.random()) / 32);
      s.alpha = alpha;
      const L = life * (0.6 + Math.random() * 0.6);
      this.root.addChild(s);
      this.live.push({ s, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, life: L, max: L, gravity, drag, alpha });
    }
  }
  ring(pos, { color = 0xfff3a0, size = 180, life = 0.55 } = {}) {
    const g = new Graphics().circle(0, 0, 100).stroke({ width: 14, color });
    g.position.set(pos.x, pos.y); g.blendMode = 'add';
    this.root.addChild(g);
    this.transients.push({ o: g, t: 0, life, step: (o, k) => { o.scale.set((0.2 + k * 0.8) * size / 100); o.alpha = 1 - k; } });
  }
  flash(pos, { color = 0xffffff, size = 260, life = 0.25 } = {}) {
    const s = new Sprite(softDot());
    s.anchor.set(0.5); s.position.set(pos.x, pos.y); s.tint = color; s.blendMode = 'add';
    this.root.addChild(s);
    this.transients.push({ o: s, t: 0, life, step: (o, k) => { o.scale.set(size * (0.4 + k) / 32); o.alpha = 1 - k; } });
  }
  update(dt) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i];
      p.life -= dt;
      if (p.life <= 0) { this.root.removeChild(p.s); this.pool.push(p.s); this.live.splice(i, 1); continue; }
      const k = Math.max(0, 1 - p.drag * dt);
      p.vx *= k; p.vy = p.vy * k + p.gravity * dt;
      p.s.x += p.vx * dt; p.s.y += p.vy * dt;
      p.s.alpha = p.alpha * Math.min(1, p.life / p.max * 2.2);
    }
    for (let i = this.transients.length - 1; i >= 0; i--) {
      const tr = this.transients[i];
      tr.t += dt;
      const k = Math.min(1, tr.t / tr.life);
      tr.step(tr.o, k);
      if (k >= 1) { tr.o.destroy(); this.transients.splice(i, 1); }
    }
  }
}

// ---------- Engine ----------
export class Engine2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.app = null;
    this.mouse = { x: 0, y: 0 };            // −1 … 1
    this.cam = { x: 0 };                    // Kameraversatz in Szeneneinheiten (Ebene mit f = 1)
    this.design = { w: 1280, h: 720 };
    this.view = { w: 1, h: 1, s: 1, V: 1280, H: 720, panX: 0 };
    this.layers = [];
    this.running = false; this.paused = false; this.timeScale = 1;
    this.projectiles = []; this.cooldown = 0;
    this.scenario = null; this.onHit = null; this.onFrame = null;
    this._last = 0;
    this._loop = this._loop.bind(this);
    window.addEventListener('resize', () => this.resize());
  }

  async init() {
    this.app = new Application();
    await this.app.init({
      canvas: this.canvas, width: window.innerWidth, height: window.innerHeight,
      antialias: true, autoStart: false, autoDensity: true, preference: 'webgl',
      resolution: Math.min(window.devicePixelRatio || 1, 2), backgroundColor: 0x8f937e,
    });
    return this;
  }

  // Maßstab: Die Szene füllt die Bildhöhe und ist am unteren Rand verankert.
  // Auf schmalen Bildschirmen wird verkleinert, bis die sichere Zielzone
  // (pan.safeHalf beidseits der Mitte) samt Mindestschwenk ins Bild passt.
  // Schwenkweite: so groß wie möglich, ohne dass die Zielzone das Bild verlässt
  // oder die Ebenen an den Rändern enden.
  resize() {
    if (!this.app) return;
    const w = window.innerWidth, h = window.innerHeight, v = this.view, d = this.design;
    this.app.renderer.resize(w, h);
    const pan = this.scenario?.pan || { x: 0, safeHalf: d.w / 2, minPan: 0, worldHalf: d.w / 2 };
    let s = Math.min(h / d.h, w / (2 * (pan.safeHalf + pan.minPan)));
    if (w / s > 2 * pan.worldHalf) s = w / (2 * pan.worldHalf);       // sehr breite Bildschirme
    Object.assign(v, { w, h, s, V: w / s, H: h / s });
    v.panX = clamp(Math.min(pan.x, v.V / 2 - pan.safeHalf, pan.worldHalf - v.V / 2), 0, pan.x);
    if (this.world) { this.world.position.set(w / 2, h); this.world.scale.set(s); }
  }

  // Bildebene anlegen; Reihenfolge der Aufrufe = Reihenfolge von hinten nach vorn.
  // parallax 0 = unbewegt (Sichtkoordinaten), 1 = bewegt sich so weit wie die Kamera.
  addLayer(name, parallax) {
    const c = new Container();
    c.label = name;
    this.world.addChild(c);
    this.layers.push({ name, parallax, c });
    return c;
  }

  async load(ScenarioClass, opts) {
    this.unload();
    this.world = new Container();
    this.app.stage.addChild(this.world);
    this.cam.x = 0;
    const sc = new ScenarioClass(this, opts);
    if (sc.design) this.design = sc.design;
    this.scenario = sc;
    this.resize();
    await sc.build();
    this.fx = new Fx2D(this.addLayer('fx', 0));
    this._place();
  }

  unload() {
    if (!this.world) return;
    this.projectiles.length = 0;
    this.scenario?.dispose?.();
    this.world.destroy({ children: true });
    this.world = this.scenario = this.fx = null;
    this.layers.length = 0;
  }

  start() {
    if (this.running) return;
    this.running = true; this._last = performance.now();
    requestAnimationFrame(this._loop);
  }
  stop() { this.running = false; }

  setMouse(clientX, clientY) {
    this.mouse.x = clamp((clientX / window.innerWidth) * 2 - 1, -1, 1);
    this.mouse.y = clamp((clientY / window.innerHeight) * 2 - 1, -1, 1);
  }

  // Bildschirm ↔ Sichtkoordinaten; Sicht ↔ Ebene mit Parallaxfaktor f.
  toView(sx, sy) {
    const v = this.view, d = this.design;
    return { x: d.w / 2 + (sx - v.w / 2) / v.s, y: d.h + (sy - v.h) / v.s };
  }
  toScreen(p) {
    const v = this.view, d = this.design;
    return { x: v.w / 2 + (p.x - d.w / 2) * v.s, y: v.h + (p.y - d.h) * v.s };
  }
  layerToView(p, f) { return { x: p.x - this.cam.x * f, y: p.y }; }
  aimView() {
    const v = this.view;
    return this.toView((this.mouse.x + 1) / 2 * v.w, (this.mouse.y + 1) / 2 * v.h);
  }
  // sichtbarer Ausschnitt in Sichtkoordinaten
  viewRect() {
    const v = this.view, d = this.design;
    return { x0: d.w / 2 - v.V / 2, x1: d.w / 2 + v.V / 2, y0: d.h - v.H, y1: d.h };
  }

  // vorderstes Ziel, dessen Trefferfläche den Sichtpunkt p enthält
  _targetAt(p, r) {
    let hit = null;
    for (const t of this.scenario.targets) {
      if (!t.hittable || !t.hitTest(p, r)) continue;
      if (!hit || (t.z || 0) > (hit.z || 0)) hit = t;
    }
    return hit;
  }

  // Wurf vom unteren Bildrand zum Punkt unter dem Fadenkreuz. Der Zielpunkt wird
  // an der Ebene des anvisierten Ziels verankert: Schwenkt die Kamera während des
  // Flugs noch nach, landet der Ball trotzdem dort, wohin gezielt wurde.
  shoot() {
    const sc = this.scenario;
    if (!sc || this.cooldown > 0 || this.paused) return false;
    const cfg = sc.shot, v = this.view;
    this.cooldown = cfg.cooldown;
    const to = this.aimView();
    const from = this.toView(v.w * cfg.origin.x, v.h * cfg.origin.y);
    const end = sc.depthAt ? sc.depthAt(to.y) : 1;
    // Ballistik (optional, je Schuss): Flugzeit, Geschossabfall, Trefferradius, Ebene des Zielpunkts
    const bal = cfg.ballistics ? cfg.ballistics(to) : null;
    const radius = bal?.radius ?? cfg.radius * end;
    const aimed = this._targetAt(to, radius);
    const f = bal?.f ?? (aimed ? aimed.f ?? 1 : 1);
    const obj = cfg.make();
    obj.position.set(from.x, from.y);
    this.fx.root.addChild(obj);
    this.projectiles.push({
      obj, from, to, f, radius, end, t: 0, dur: Math.max(0.001, bal?.flight ?? cfg.flight),
      anchor: { x: to.x + this.cam.x * f, y: to.y + (bal?.drop || 0) },
    });
    if (sc.onShoot) sc.onShoot(from, to);
    return true;
  }

  _stepProjectiles(dt) {
    const sc = this.scenario;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      p.to = this.layerToView(p.anchor, p.f);
      p.obj.position.set(lerp(p.from.x, p.to.x, k), lerp(p.from.y, p.to.y, k) - Math.sin(k * Math.PI) * sc.shot.arc);
      p.obj.scale.set(lerp(sc.shot.startScale, sc.shot.endScale * p.end, k));
      p.obj.rotation += dt * (sc.shot.spin ?? 9);
      if (k < 1) continue;
      p.obj.destroy();
      this.projectiles.splice(i, 1);
      const hit = this._targetAt(p.to, p.radius);       // vorderstes Ziel gewinnt
      if (hit && this.onHit) this.onHit(hit, p.to);
      else if (sc.onMiss) sc.onMiss(p.to);
    }
  }

  _place() {
    const d = this.design;
    for (const l of this.layers) l.c.position.set(-d.w / 2 - this.cam.x * l.parallax, -d.h);
  }

  _loop(now) {
    if (!this.running) return;
    requestAnimationFrame(this._loop);
    const raw = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;
    if (this.paused || !this.world || !this.fx || raw <= 0) return;
    const dt = raw * this.timeScale;
    this.cooldown = Math.max(0, this.cooldown - raw);

    // leichter Kameraschwenk mit der Maus (gedämpft)
    this.cam.x += (this.mouse.x * this.view.panX - this.cam.x) * (1 - Math.exp(-raw * 5));
    this._place();

    const sc = this.scenario;
    sc.update(dt, raw);
    this._stepProjectiles(raw);
    this.fx.update(raw);
    if (this.onFrame) this.onFrame(raw);
    if (!this.world) return;               // Runde wurde in diesem Frame beendet
    this.app.renderer.render(this.app.stage);
  }
}
