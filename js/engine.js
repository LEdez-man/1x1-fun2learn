// 3D-Grundgerüst: Renderer, Kamera, Zielen per Maus, Geschosse, Partikel.
import * as THREE from 'three';

// ---------- deterministisches Rauschen für Gelände ----------
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
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * noise2(x * f, y * f); f *= 2.03; amp *= 0.5; }
  return v;
}

// ---------- Beschriftungen ----------
export function makeLabel(text, { fg = '#1b1b1b', bg = '#fffdf2', border = '#c0392b', plate = true, height = 1 } = {}) {
  const c = document.createElement('canvas');
  const long = text.length > 3;
  c.width = long ? 384 : 256; c.height = 160;
  const g = c.getContext('2d');
  if (plate) {
    const r = 36, w = c.width - 12, h = c.height - 12;
    g.beginPath(); g.roundRect(6, 6, w, h, r);
    g.fillStyle = bg; g.fill();
    g.lineWidth = 10; g.strokeStyle = border; g.stroke();
  }
  g.font = `900 ${long ? 96 : 108}px "Trebuchet MS", "Segoe UI", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (!plate) { g.lineWidth = 14; g.strokeStyle = 'rgba(0,0,0,0.75)'; g.lineJoin = 'round'; g.strokeText(text, c.width / 2, 86); }
  g.fillStyle = fg; g.fillText(text, c.width / 2, 86);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(height * c.width / c.height, height, 1);
  s.renderOrder = 10;
  return s;
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

// ---------- Partikel ----------
class Particles {
  constructor(scene, max, blending) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 4);
    this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.alpha0 = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('pcolor', new THREE.BufferAttribute(this.col, 4));
    geo.setAttribute('psize', new THREE.BufferAttribute(this.size, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending,
      uniforms: { scale: { value: 600 } },
      vertexShader: `
        attribute vec4 pcolor; attribute float psize; uniform float scale; varying vec4 vC;
        void main(){ vC = pcolor; vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = psize * scale / -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `
        varying vec4 vC;
        void main(){ float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.15, d) * vC.a; if (a < 0.01) discard;
          gl_FragColor = vec4(vC.rgb, a); }`,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 20;
    scene.add(this.points);
  }
  emit(p, v, color, size, life, grav, drag, alpha = 1) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.col.set([color.r, color.g, color.b, alpha], i * 4);
    this.size[i] = size; this.life[i] = this.maxLife[i] = life;
    this.grav[i] = grav; this.drag[i] = drag; this.alpha0[i] = alpha;
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {            // letztes Partikel an diese Stelle kopieren
        const l = --this.n;
        if (l !== i) {
          this.pos.copyWithin(i * 3, l * 3, l * 3 + 3);
          this.vel.copyWithin(i * 3, l * 3, l * 3 + 3);
          this.col.copyWithin(i * 4, l * 4, l * 4 + 4);
          for (const a of [this.size, this.life, this.maxLife, this.grav, this.drag, this.alpha0]) a[i] = a[l];
        }
        continue;
      }
      const k = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i * 3] *= k; this.vel[i * 3 + 2] *= k;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * k - this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      const t = this.life[i] / this.maxLife[i];
      this.col[i * 4 + 3] = this.alpha0[i] * Math.min(1, t * 2.2);
      i++;
    }
    const g = this.points.geometry;
    g.setDrawRange(0, this.n);
    g.attributes.position.needsUpdate = true;
    g.attributes.pcolor.needsUpdate = true;
    g.attributes.psize.needsUpdate = true;
  }
}

const tmpC = new THREE.Color();
const tmpV = new THREE.Vector3();

export class Fx {
  constructor(scene) {
    this.scene = scene;
    this.glow = new Particles(scene, 3000, THREE.AdditiveBlending);
    this.solid = new Particles(scene, 3000, THREE.NormalBlending);
    this.transients = [];
  }
  // Kugelförmiger Partikelstoß.
  burst(pos, { count = 40, speed = 6, colors = ['#ffffff'], size = 0.5, life = 0.9, gravity = 6, drag = 1.5, additive = false, up = 0, alpha = 1 } = {}) {
    const sys = additive ? this.glow : this.solid;
    for (let i = 0; i < count; i++) {
      tmpV.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
        .multiplyScalar(speed * (0.3 + Math.random() * 0.7));
      tmpV.y += up;
      tmpC.set(colors[Math.floor(Math.random() * colors.length)]);
      sys.emit(pos, tmpV, tmpC, size * (0.5 + Math.random()), life * (0.6 + Math.random() * 0.6), gravity, drag, alpha);
    }
  }
  // Sich ausdehnender Leuchtring.
  ring(pos, camera, { color = '#fff3a0', size = 5, life = 0.55 } = {}) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.82, 1, 48),
      new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    m.position.copy(pos); m.quaternion.copy(camera.quaternion); m.renderOrder = 21;
    this.scene.add(m);
    this.transients.push({ obj: m, t: 0, life, step: (o, k) => { o.scale.setScalar(0.3 + k * size); o.material.opacity = 1 - k; } });
  }
  flash(pos, { color = '#ffffff', size = 4, life = 0.25 } = {}) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.copy(pos); s.renderOrder = 22;
    this.scene.add(s);
    this.transients.push({ obj: s, t: 0, life, step: (o, k) => { o.scale.setScalar(size * (0.4 + k)); o.material.opacity = 1 - k; } });
  }
  update(dt) {
    this.glow.update(dt); this.solid.update(dt);
    for (let i = this.transients.length - 1; i >= 0; i--) {
      const tr = this.transients[i];
      tr.t += dt;
      const k = Math.min(1, tr.t / tr.life);
      tr.step(tr.obj, k);
      if (k >= 1) {
        this.scene.remove(tr.obj);
        if (tr.obj.geometry) tr.obj.geometry.dispose();
        tr.obj.material.dispose();
        this.transients.splice(i, 1);
      }
    }
  }
}

let dotTex = null;
export function softDot() {
  if (dotTex) return dotTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(c);
  return dotTex;
}

// ---------- Engine ----------
export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 3000);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);
    this.clock = new THREE.Clock();
    this.running = false;
    this.paused = false;
    this.timeScale = 1;
    this.projectiles = [];
    this.cooldown = 0;
    this.scenario = null;
    this.onHit = null;        // (target, point)
    this.onFrame = null;      // (dt)
    this._loop = this._loop.bind(this);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  load(ScenarioClass, opts) {
    this.unload();
    this.scene = new THREE.Scene();
    this.fx = new Fx(this.scene);
    this.scenario = new ScenarioClass(this, opts);
    this.scenario.build();
    this.baseQuat = this.camera.quaternion.clone();
    this.scene.add(this.camera);      // damit Kamera-Kinder (Waffe) gerendert werden
  }

  unload() {
    if (!this.scene) return;
    this.projectiles.length = 0;
    this.camera.clear();
    disposeTree(this.scene);
    this.scene = null; this.scenario = null;
    this.renderer.renderLists.dispose();
  }

  start() {
    if (this.running) return;
    this.running = true; this.clock.getDelta();
    requestAnimationFrame(this._loop);
  }
  stop() { this.running = false; }

  setMouse(clientX, clientY) {
    this.mouse.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
  }

  aimRay() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.ray;
  }

  // Schuss entlang des Zielstrahls. Das Geschoss startet versetzt (Waffe/Hand)
  // und konvergiert in Zielentfernung auf den Zielstrahl.
  shoot() {
    const sc = this.scenario;
    if (!sc || this.cooldown > 0 || this.paused) return false;
    const cfg = sc.shot;
    this.cooldown = cfg.cooldown;
    const ray = this.aimRay();
    let dist = cfg.aimDistance;
    let best = Infinity;
    for (const t of sc.targets) {
      if (!t.hittable) continue;
      const d = ray.distanceToPoint(t.center);
      if (d < t.radius * 2.5 && d < best) { best = d; dist = ray.origin.distanceTo(t.center); }
    }
    const aim = ray.at(dist, new THREE.Vector3());
    const start = new THREE.Vector3(cfg.offset.x, cfg.offset.y, cfg.offset.z).applyMatrix4(this.camera.matrixWorld);
    const dir = aim.sub(start).normalize();
    const mesh = cfg.makeMesh();
    mesh.position.copy(start);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, pos: start.clone(), vel: dir.multiplyScalar(cfg.speed), life: cfg.range / cfg.speed, radius: cfg.radius });
    if (sc.onShoot) sc.onShoot(start, dir);
    return true;
  }

  _stepProjectiles(dt) {
    const sc = this.scenario;
    const seg = new THREE.Line3();
    const closest = new THREE.Vector3();
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      seg.start.copy(p.pos);
      p.pos.addScaledVector(p.vel, dt);
      seg.end.copy(p.pos);
      p.mesh.position.copy(p.pos);
      if (sc.shot.orient) p.mesh.lookAt(tmpV.copy(p.pos).add(p.vel));
      p.life -= dt;
      let hit = null;
      for (const t of sc.targets) {
        if (!t.hittable) continue;
        seg.closestPointToPoint(t.center, true, closest);
        if (closest.distanceTo(t.center) <= t.radius + p.radius) { hit = t; break; }
      }
      const ground = sc.groundAt ? p.pos.y < sc.groundAt(p.pos.x, p.pos.z) : false;
      if (hit || ground || p.life <= 0) {
        this.scene.remove(p.mesh);
        disposeTree(p.mesh);
        this.projectiles.splice(i, 1);
        if (hit && this.onHit) this.onHit(hit, closest.clone());
        else if (ground && sc.onGroundHit) sc.onGroundHit(p.pos);
      }
    }
  }

  // Bildschirmkoordinaten eines Weltpunkts (für DOM-Einblendungen).
  toScreen(v) {
    tmpV.copy(v).project(this.camera);
    return { x: (tmpV.x * 0.5 + 0.5) * window.innerWidth, y: (-tmpV.y * 0.5 + 0.5) * window.innerHeight };
  }

  _loop() {
    if (!this.running) return;
    requestAnimationFrame(this._loop);
    const raw = Math.min(this.clock.getDelta(), 0.05);
    if (this.paused || !this.scene) return;
    const dt = raw * this.timeScale;
    this.cooldown = Math.max(0, this.cooldown - raw);

    // leichter Kameraschwenk mit der Maus
    const sc = this.scenario;
    const yaw = -this.mouse.x * sc.sway.yaw, pitch = this.mouse.y * sc.sway.pitch;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    this.camera.quaternion.copy(this.baseQuat).multiply(q);
    this.camera.updateMatrixWorld();

    sc.update(dt, raw);
    this._stepProjectiles(raw);
    this.fx.update(raw);
    if (this.onFrame) this.onFrame(raw);
    if (!this.scene) return;            // Runde wurde in diesem Frame beendet
    this.renderer.render(this.scene, this.camera);
  }
}
