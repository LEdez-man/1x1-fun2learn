// Szenario "Schneeballschlacht": Winterdorf am zugefrorenen See in der Art
// flämischer Winterlandschaften des 16./17. Jahrhunderts. Kinder tauchen hinter
// Zaun, Hütten und Kopfweiden auf; das Ergebnis steht auf der Mütze.
import * as THREE from 'three';
import { fbm, mulberry, makeLabel } from '../engine.js';
import { audio } from '../audio.js';

// Sichtprüfung für Verstecke: Körperhöhen (m über Boden) und Breite (m) der Abtastpunkte.
const KID_SAMPLE_HEIGHTS = [0.4, 1.0, 1.6, 2.1];
const KID_SAMPLE_OFFSETS = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45];
const FACE_HEIGHT = KID_SAMPLE_HEIGHTS[KID_SAMPLE_HEIGHTS.length - 1];   // oberster Abtastpunkt = Gesicht
// Höchstanteil des Körpers, der hinter Bäumen verschwinden darf (Spielgefühl: „halb versteckt“ ist ok).
const MAX_HIDDEN_SHARE = 0.3;
// Sichtfeld-Prüfung: Kopfhöhe des Kindes (m über Boden), halbe Breite (m) und Randabstand in NDC.
const KID_HEAD_HEIGHT = 3.0;
const KID_HALF_WIDTH = 0.7;
const VIEW_MARGIN = 0.9;

const COATS = [0x8c2f24, 0x2f4f6b, 0x7a6a2c, 0x3f5f3a, 0x6b3a55, 0x9a5a22];
const HATS = [0xb5302a, 0x1f5a8a, 0x2e7a44, 0x8a3a8a, 0xc27a12, 0x3a3a3a];

function faceTexture(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#f0c8a4'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(225,95,80,0.55)';
  g.beginPath(); g.arc(26, 78, 15, 0, 7); g.arc(102, 78, 15, 0, 7); g.fill();
  g.fillStyle = '#2a1a12'; g.strokeStyle = '#2a1a12'; g.lineWidth = 6; g.lineCap = 'round';
  if (kind === 'neutral') {
    g.beginPath(); g.arc(42, 52, 7, 0, 7); g.arc(86, 52, 7, 0, 7); g.fill();
    g.beginPath(); g.arc(64, 78, 20, 0.25, Math.PI - 0.25); g.stroke();
  } else if (kind === 'laugh') {
    g.beginPath(); g.arc(42, 54, 11, Math.PI, 0); g.stroke();
    g.beginPath(); g.arc(86, 54, 11, Math.PI, 0); g.stroke();
    g.beginPath(); g.arc(64, 74, 28, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.fillRect(44, 75, 40, 9);
    g.fillStyle = '#e0605a'; g.beginPath(); g.arc(64, 96, 11, 0, 7); g.fill();
  } else if (kind === 'funny') {           // schielt, Zunge raus
    g.fillStyle = '#fff'; g.beginPath(); g.arc(42, 50, 15, 0, 7); g.arc(86, 50, 15, 0, 7); g.fill();
    g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(50, 54, 6, 0, 7); g.arc(78, 54, 6, 0, 7); g.fill();
    g.beginPath(); g.moveTo(26, 30); g.lineTo(52, 24); g.moveTo(102, 22); g.lineTo(76, 30); g.stroke();
    g.beginPath(); g.moveTo(42, 88); g.quadraticCurveTo(64, 78, 88, 90); g.stroke();
    g.fillStyle = '#e0605a'; g.beginPath(); g.roundRect(58, 86, 18, 26, 9); g.fill();
  } else {                                 // 'oh' – überrascht
    g.beginPath(); g.arc(42, 50, 9, 0, 7); g.arc(86, 50, 9, 0, 7); g.fill();
    g.beginPath(); g.ellipse(64, 90, 11, 14, 0, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class SnowScenario {
  constructor(engine, opts = {}) {
    this.e = engine;
    this.tempo = opts.tempo || 1;
    this.variant = opts.variant || 0;
    this.targets = [];
    this.trees = [];          // Bäume: verdecken Verstecke, siehe _pruneHiddenSpots
    this.wave = 0;
    this.onEscape = null;
    this.sway = { yaw: 0.14, pitch: 0.05 };
    this.shot = {
      speed: opts.lead === false ? 90 : 38, cooldown: 0.38, range: 70, radius: 0.22,
      aimDistance: 14, orient: false, offset: { x: 0.35, y: -0.35, z: -0.9 },
      makeMesh: () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x99a4b0 })),
    };
    this.time = 0;
    this.spots = [];
    this.smoke = [];
  }

  groundAt(x, z) {
    const lake = this._lake(x, z);
    return (fbm(x * 0.05 + 3, z * 0.05 + 9) - 0.5) * 1.6 * (1 - lake) - lake * 0.35;
  }
  // Zugefrorener Flusslauf, der sich in die Bildtiefe windet.
  _riverX(z) { return 6 + Math.sin((z + 20) * 0.05) * 16; }
  _riverW(z) { return 7 + (-z - 27) * 0.06; }
  _lake(x, z) {                 // 1 auf dem Eis, 0 außerhalb (weicher Rand)
    const c = THREE.MathUtils.clamp;
    const d = Math.abs(x - this._riverX(z)) / this._riverW(z);
    return c((1.05 - d) * 5, 0, 1) * c((-z - 27) / 6, 0, 1) * c((z + 112) / 8, 0, 1);
  }

  build() {
    const { scene, camera } = this.e;
    const rnd = mulberry(1565);
    this.faces = { neutral: faceTexture('neutral'), laugh: faceTexture('laugh'), funny: faceTexture('funny'), oh: faceTexture('oh') };
    // Farbstimmung nach flämischen Winterlandschaften: fahler, gelblicher Himmel,
    // warme Erdtöne. Variante 1 = Abenddämmerung.
    const dusk = this.variant % 2 === 1;
    const P = dusk
      ? { sky: ['#6d6f86', '#c79a86', '#f2cf9a'], fog: 0xdcc0a6, sun: [0xffc48a, 1.2], hemi: [0xf0d9c8, 0x8f8a90, 1.25] }
      : { sky: ['#7d917f', '#c4c6a2', '#ece2ba'], fog: 0xd8d2b4, sun: [0xffe9c9, 1.25], hemi: [0xe9e8d8, 0x9a988a, 1.35] };
    scene.fog = new THREE.Fog(P.fog, 30, 240);

    // Himmel: grünlich-grauer Winterhimmel mit fahlem Horizont
    const sc = document.createElement('canvas'); sc.width = 16; sc.height = 256;
    const g = sc.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, P.sky[0]); gr.addColorStop(0.4, P.sky[1]); gr.addColorStop(0.5, P.sky[2]); gr.addColorStop(1, P.sky[2]);
    g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
    const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 24, 12), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, fog: false, toneMapped: false })));

    scene.add(new THREE.HemisphereLight(P.hemi[0], P.hemi[1], P.hemi[2]));
    const sun = new THREE.DirectionalLight(P.sun[0], P.sun[1]);
    sun.position.set(40, 45, 30); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 });
    sun.shadow.bias = -0.0008;
    sun.target.position.set(0, 0, -20);
    scene.add(sun, sun.target);

    // Schneedecke
    const geo = new THREE.PlaneGeometry(360, 300, 140, 110);
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -120);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let y = this.groundAt(x, z);
      if (z < -75) y += Math.pow((-z - 75) / 60, 1.6) * 9 * (0.5 + fbm(x * 0.02, 5)) * (1 - this._lake(x, z));   // Hügel im Hintergrund
      pos.setY(i, y);
      const n = fbm(x * 0.08, z * 0.08);
      c.setHSL(0.11, 0.22, 0.86 + n * 0.09);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    ground.receiveShadow = true; scene.add(ground);

    // Eisfläche des Flusses mit Schlittschuhläufern
    const seg = 60, ig = new THREE.PlaneGeometry(1, 1, seg, 1), ip = ig.attributes.position;
    for (let i = 0; i <= seg; i++) {
      const z = -25 - i * 90 / seg, cx = this._riverX(z), w = this._riverW(z) + 1.5;
      ip.setXYZ(i, cx - w, -0.3, z); ip.setXYZ(seg + 1 + i, cx + w, -0.3, z);
    }
    ig.computeVertexNormals();
    const ice = new THREE.Mesh(ig, new THREE.MeshStandardMaterial({ color: 0xa9b196, roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide }));
    ice.receiveShadow = true; scene.add(ice);
    this.skaters = [];
    for (let i = 0; i < 22; i++) {
      const sk = new THREE.Group();
      const coat = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 6), new THREE.MeshLambertMaterial({ color: [0x2a2420, 0x7a2e22, 0x2d3f55, 0x5a4420, 0x3a3a34][i % 5] }));
      coat.position.y = 0.55;
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), new THREE.MeshLambertMaterial({ color: 0x2a201a }));
      hd.position.y = 1.2;
      sk.add(coat, hd); sk.traverse((o) => { o.castShadow = true; });
      scene.add(sk);
      const cz = -33 - rnd() * 66, w = this._riverW(cz) - 2.5;
      this.skaters.push({ g: sk, cx: this._riverX(cz) + (rnd() - 0.5) * w, cz, r: 0.8 + rnd() * 2.2, sp: (rnd() < 0.5 ? -1 : 1) * (0.25 + rnd() * 0.4), ph: rnd() * 6 });
    }

    // Dorf: Hütten, Kirche, Kopfweiden, kahle Bäume
    this._hut(-15, -17, 6.5, 4.6, 0.35, 0x9c4f33, rnd);
    this._hut(14.5, -19, 7.5, 5, -0.3, 0xb8935a, rnd);
    this._hut(-31, -30, 6, 4.2, 0.6, 0x8a4a34, rnd);
    this._hut(33, -33, 6.5, 4.5, -0.5, 0xa9824e, rnd);
    this._hut(-48, -66, 7, 5, 0.2, 0x8f5238, rnd);
    this._hut(-24, -50, 5.5, 4, 0.9, 0xa58a5c, rnd);
    this._hut(26, -54, 6, 4.2, -0.8, 0x94482f, rnd);
    this._hut(-36, -84, 6, 4.4, 0.4, 0x9a7a4e, rnd);
    this._hut(48, -86, 6.5, 4.6, -0.2, 0x8c4a32, rnd);
    this._hut(54, -48, 6, 4.2, -0.9, 0xa0835a, rnd);
    this._church(30, -72);
    [[-6.5, -14.5], [6.2, -15.5], [-23, -24], [24, -26], [-13, -31], [-40, -40], [44, -44]].forEach(([x, z]) => this._willow(x, z, 1 + rnd() * 0.4, rnd));
    [[-22, -37], [19, -40], [-27, -58], [12, -66], [52, -60], [-58, -52], [-22, -72], [-19, -21], [21, -23], [38, -40], [-44, -30], [28, -76], [-12, -94], [60, -74], [-64, -80]].forEach(([x, z]) => this._bareTree(x, z, 4.5 + rnd() * 3, rnd));

    // Zaun im Vordergrund
    const wood = new THREE.MeshLambertMaterial({ color: 0x4b382a });
    const snowM = new THREE.MeshLambertMaterial({ color: 0xf6f8fa });
    const fz = -9.5;
    for (let x = -22; x <= 22; x += 2.2) {
      if (Math.abs(x) < 1.5) continue;                       // Lücke (Gatter offen)
      const y = this.groundAt(x, fz);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), wood);
      post.position.set(x, y + 0.7, fz); post.rotation.z = (rnd() - 0.5) * 0.12; post.castShadow = true;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), snowM); cap.scale.y = 0.6; cap.position.set(x, y + 1.48, fz);
      scene.add(post, cap);
      if (x + 2.2 <= 22 && Math.abs(x + 2.2) >= 1.5) {
        for (const h of [0.55, 1.1]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.11, 0.08), wood);
          rail.position.set(x + 1.1, y + h, fz); rail.castShadow = true;
          const rs = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.12), snowM); rs.position.set(x + 1.1, y + h + 0.08, fz);
          scene.add(rail, rs);
        }
      }
    }
    // Schneehaufen als Deckung
    const mounds = [[-3.5, -12.5, 1.5], [4.5, -13, 1.7], [0, -22, 2.0], [-11, -24, 1.8], [11, -26, 1.9]];
    for (const [x, z, r] of mounds) {
      const mnd = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), snowM);
      mnd.scale.set(1.5, 0.75, 1); mnd.position.set(x, this.groundAt(x, z) - 0.1, z);
      mnd.castShadow = mnd.receiveShadow = true; scene.add(mnd);
    }

    // Vogelfalle: schräg aufgestelltes Brett mit Stützholz, Krähen im Schnee davor
    const trap = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.3), wood); board.position.set(0, 0.42, 0); board.rotation.x = -0.5; board.castShadow = true;
    const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 5), wood); prop.position.set(0, 0.36, 0.52);
    trap.add(board, prop);
    for (let i = 0; i < 6; i++) {
      const crow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), new THREE.MeshLambertMaterial({ color: 0x14110f }));
      crow.scale.set(0.8, 0.9, 1.7); crow.position.set((rnd() - 0.5) * 3.4, 0.12, 0.4 + rnd() * 1.8); crow.rotation.y = rnd() * 6; crow.castShadow = true;
      trap.add(crow);
    }
    trap.position.set(8.5, this.groundAt(8.5, -21) , -21); trap.rotation.y = -0.4;
    scene.add(trap);
    this.birds = [];
    const vg = new THREE.BufferGeometry();
    vg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, -0.5, 0.16, -0.12, -0.12, 0, 0.14, 0, 0, 0, 0.5, 0.16, -0.12, 0.12, 0, 0.14]), 3));
    for (let i = 0; i < 7; i++) {
      const bd = new THREE.Mesh(vg, new THREE.MeshBasicMaterial({ color: 0x1a1512, side: THREE.DoubleSide }));
      bd.position.set((rnd() - 0.5) * 120, 14 + rnd() * 14, -45 - rnd() * 50);
      scene.add(bd);
      this.birds.push({ m: bd, v: (rnd() < 0.5 ? -1 : 1) * (2.5 + rnd() * 2), ph: rnd() * 6 });
    }

    // Verstecke: pos = sichtbare Position, hide = Versatz im Versteck
    const up = (x, z, d) => ({ x, z, hide: new THREE.Vector3(0, -d, 0) });
    const side = (x, z, dx) => ({ x, z, hide: new THREE.Vector3(dx, 0, 0) });
    this.spots = [
      up(-15, -10.4, 4.3), up(-10, -10.4, 4.3), up(-5.5, -10.4, 4.3), up(5.5, -10.4, 4.3), up(10, -10.4, 4.3), up(15, -10.4, 4.3),
      up(-3.5, -13.4, 4.3), up(4.5, -14, 4.3), up(0, -23.2, 4.3), up(-11, -25, 4.3), up(11, -27, 4.3),
      side(-10.2, -15.5, -3.2), side(9.4, -17.5, 3.4),
    ];

    // Schneefall
    const N = 2200;
    this.flakes = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) this.flakes.set([(rnd() - 0.5) * 70, rnd() * 26, 6 - rnd() * 60], i * 3);
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(this.flakes, 3));
    const dot = document.createElement('canvas'); dot.width = dot.height = 32;
    const dg = dot.getContext('2d'); const rg = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, '#fff'); rg.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = rg; dg.fillRect(0, 0, 32, 32);
    this.snow = new THREE.Points(fg, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(dot), size: 0.2, transparent: true, depthWrite: false, opacity: 0.9 }));
    this.snow.frustumCulled = false;
    scene.add(this.snow);

    camera.fov = 55; camera.updateProjectionMatrix();
    camera.position.set(0, this.groundAt(0, 0) + 3.6, 0);      // erhöhter Standpunkt wie im Gemälde
    camera.lookAt(0, 1.2, -22);
    this._pruneHiddenSpots();
  }

  // Verstecke hinter einem Baum sind erlaubt, solange das Kind größtenteils sichtbar
  // bleibt. Das Gesicht darf nie verdeckt sein, sonst ist die Antwort nicht zu sehen.
  // Sichtlinien: Kamera -> Punkte auf dem Körper des Kindes.
  _pruneHiddenSpots() {
    const { scene, camera } = this.e;
    scene.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    const blocked = (point) => {
      const dir = point.clone().sub(camera.position);
      const dist = dir.length();
      ray.set(camera.position, dir.normalize());
      const hit = ray.intersectObjects(this.trees, true)[0];
      return !!hit && hit.distance < dist - 0.3;
    };
    const hidden = (spot) => {
      const ground = this.groundAt(spot.x, spot.z);
      let total = 0, count = 0;
      for (const h of KID_SAMPLE_HEIGHTS) {
        for (const dx of KID_SAMPLE_OFFSETS) {
          const p = new THREE.Vector3(spot.x + dx, ground + h, spot.z);
          const isBlocked = blocked(p);
          if (h === FACE_HEIGHT && dx === 0 && isBlocked) return true;   // Gesicht verdeckt
          total += isBlocked ? 1 : 0;
          count++;
        }
      }
      return total / count > MAX_HIDDEN_SHARE;
    };
    const before = this.spots.length;
    this.spots = this.spots.filter((s) => !hidden(s));
    if (this.spots.length < before) console.info(`Schneeballschlacht: ${before - this.spots.length} verdeckte Verstecke entfernt`);
  }

  _hut(x, z, w, d, rot, wall, rnd) {
    const grp = new THREE.Group();
    const h = 2.5;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: wall }));
    walls.position.y = h / 2; walls.castShadow = walls.receiveShadow = true; grp.add(walls);
    const rh = 2.9, ov = 0.45;
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - ov, 0); sh.lineTo(0, rh); sh.lineTo(d / 2 + ov, 0); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: w + ov * 2, bevelEnabled: false });
    const roof = new THREE.Mesh(rg, [new THREE.MeshLambertMaterial({ color: 0x6a4a34 }), new THREE.MeshLambertMaterial({ color: 0xf3f6f8 })]);
    roof.rotation.y = Math.PI / 2; roof.position.set(-w / 2 - ov, h, 0); roof.castShadow = true; grp.add(roof);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.6), new THREE.MeshLambertMaterial({ color: 0x6b4034 }));
    ch.position.set(w * 0.25, h + rh * 0.75, 0); grp.add(ch);
    const glow = new THREE.MeshBasicMaterial({ color: 0xffc56a });
    const frame = new THREE.MeshLambertMaterial({ color: 0x3a2a20 });
    for (const wx of [-w * 0.25, w * 0.22]) {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.06), frame); fr.position.set(wx, 1.45, d / 2 + 0.01);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), glow); win.position.set(wx, 1.45, d / 2 + 0.05);
      grp.add(fr, win);
    }
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.08), frame); door.position.set(0, 0.85, d / 2 + 0.02); grp.add(door);
    grp.position.set(x, this.groundAt(x, z) - 0.1, z); grp.rotation.y = rot;
    this.e.scene.add(grp);
    const top = new THREE.Vector3(w * 0.25, h + rh * 0.75 + 1, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(grp.position);
    this.smoke.push({ pos: top, t: rnd() });
  }

  _church(x, z) {
    const grp = new THREE.Group();
    const stone = new THREE.MeshLambertMaterial({ color: 0x8d8576 }), snowM = new THREE.MeshLambertMaterial({ color: 0xf3f6f8 });
    const nave = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 6), stone); nave.position.y = 3;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.6, 4, 4, 1), snowM); roof.rotation.y = Math.PI / 4; roof.scale.set(1.9, 1, 1); roof.position.y = 8;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13, 3.6), stone); tower.position.set(-7, 6.5, 0);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.8, 9, 4), new THREE.MeshLambertMaterial({ color: 0x55606a })); spire.rotation.y = Math.PI / 4; spire.position.set(-7, 17.5, 0);
    grp.add(nave, roof, tower, spire);
    grp.position.set(x, this.groundAt(x, z) + 1.2, z); grp.rotation.y = -0.3;
    this.e.scene.add(grp);
  }

  // Kopfweide: kurzer dicker Stamm, Knubbel, Rutenbüschel
  _willow(x, z, s, rnd) {
    const grp = new THREE.Group();
    const bark = new THREE.MeshLambertMaterial({ color: 0x40342b, flatShading: true });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42 * s, 0.55 * s, 2.6 * s, 7), bark);
    trunk.position.y = 1.3 * s; trunk.rotation.z = (rnd() - 0.5) * 0.15; trunk.castShadow = true;
    const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 * s, 0), bark); knob.position.y = 2.8 * s; knob.castShadow = true;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.62 * s, 8, 5, 0, 7, 0, 1.3), new THREE.MeshLambertMaterial({ color: 0xf4f6f8 })); cap.position.y = 3.0 * s;
    grp.add(trunk, knob, cap);
    this.trees.push(grp);
    const twig = new THREE.MeshLambertMaterial({ color: 0x6a4a2c });
    for (let i = 0; i < 26; i++) {
      const len = (1.6 + rnd() * 1.6) * s;
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.035, len, 3), twig);
      const dir = new THREE.Vector3((rnd() - 0.5) * 1.5, 1, (rnd() - 0.5) * 1.5).normalize();
      t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      t.position.set(0, 2.9 * s, 0).addScaledVector(dir, len / 2 + 0.3 * s);
      grp.add(t);
    }
    grp.position.set(x, this.groundAt(x, z) - 0.1, z);
    this.e.scene.add(grp);
  }

  _bareTree(x, z, h, rnd) {
    const grp = new THREE.Group();
    const bark = new THREE.MeshLambertMaterial({ color: 0x2f2620 });
    const branch = (p, dir, len, r, depth) => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r, len, 5), bark);
      const end = p.clone().addScaledVector(dir, len);
      cyl.position.copy(p).lerp(end, 0.5);
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      if (depth === 0) cyl.castShadow = true;
      grp.add(cyl);
      if (depth >= 2 && rnd() < 0.1) {
        const crow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), new THREE.MeshLambertMaterial({ color: 0x14110f }));
        crow.scale.set(0.8, 0.9, 1.7); crow.position.copy(end).y += 0.12; crow.rotation.y = rnd() * 6;
        grp.add(crow);
      }
      if (depth >= 3) return;
      const n = depth === 0 ? 4 : 2 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++) {
        const d2 = dir.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.6, rnd() * 0.5, (rnd() - 0.5) * 1.6)).normalize();
        branch(end, d2, len * (0.55 + rnd() * 0.2), r * 0.55, depth + 1);
      }
    };
    branch(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), h * 0.45, h * 0.045, 0);
    this.trees.push(grp);
    grp.position.set(x, this.groundAt(x, z) - 0.1, z);
    this.e.scene.add(grp);
  }

  // ------------------------------------------------------------ Kinder
  _kid(text, i) {
    const grp = new THREE.Group();
    const coatC = COATS[(i + Math.floor(Math.random() * 6)) % 6], hatC = HATS[(i + Math.floor(Math.random() * 6)) % 6];
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.52, 1.15, 10), new THREE.MeshLambertMaterial({ color: coatC }));
    coat.position.y = 0.6; coat.castShadow = true; grp.add(coat);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.09, 6, 12), new THREE.MeshLambertMaterial({ color: 0xe8e2d0 }));
    collar.rotation.x = Math.PI / 2; collar.position.y = 1.17; grp.add(collar);
    const arms = [];
    for (const sd of [-1, 1]) {
      const pivot = new THREE.Group(); pivot.position.set(sd * 0.36, 1.05, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.62, 6), new THREE.MeshLambertMaterial({ color: coatC }));
      arm.position.y = -0.28;
      const mitt = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), new THREE.MeshLambertMaterial({ color: hatC })); mitt.position.y = -0.62;
      pivot.add(arm, mitt); pivot.rotation.z = sd * 0.35; grp.add(pivot); arms.push(pivot);
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 14, 10), new THREE.MeshLambertMaterial({ color: 0xf0c8a4 }));
    head.position.y = 1.52; head.castShadow = true; grp.add(head);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.27, 20), new THREE.MeshBasicMaterial({ map: this.faces.neutral }));
    face.position.set(0, 1.5, 0.3); grp.add(face);
    // Mütze: breite Wollkappe mit Krempe und Bommel – groß genug für die Zahl
    const hatM = new THREE.MeshLambertMaterial({ color: hatC });
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.47, 0.72, 14), hatM); hat.position.y = 2.08; hat.castShadow = true;
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.1, 6, 16), new THREE.MeshLambertMaterial({ color: 0xece6d6 })); brim.rotation.x = Math.PI / 2; brim.position.y = 1.76;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 6, 0, 7, 0, Math.PI / 2), hatM); top.position.y = 2.44;
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf5f1e6 })); pom.position.y = 2.82;
    grp.add(hat, brim, top, pom);
    const label = makeLabel(text, { plate: false, fg: '#ffffff', height: 0.74 });
    label.position.set(0, 2.12, 0.5);
    grp.add(label);
    grp.scale.setScalar(1.3);
    return { group: grp, face, arms, label };
  }

  // Verstecke, deren Kind im aktuellen Bildausschnitt liegt (hängt vom Seitenverhältnis ab).
  _visibleSpots() {
    const { camera } = this.e;
    camera.updateMatrixWorld(true);
    const p = new THREE.Vector3();
    const inView = (x, y, z) => { p.set(x, y, z).project(camera); return p.z < 1 && Math.abs(p.x) <= VIEW_MARGIN && Math.abs(p.y) <= VIEW_MARGIN; };
    return this.spots.filter((s) => {
      const y = this.groundAt(s.x, s.z) + KID_HEAD_HEIGHT;
      return inView(s.x - KID_HALF_WIDTH, y, s.z) && inView(s.x + KID_HALF_WIDTH, y, s.z);
    });
  }

  // n verschiedene Verstecke; sichtbare zuerst, Kinder möglichst nicht direkt nebeneinander.
  _pickSpots(n) {
    const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
    const visible = this._visibleSpots();
    const isVisible = new Set(visible);
    // Zweite Stufe nur als Notfall: lieber verdeckt als fehlendes Kind
    const tiers = [shuffle(visible), shuffle(this.spots.filter((s) => !isVisible.has(s)))];
    const chosen = [];
    const take = (list, spaced) => {
      for (const s of list) {
        if (chosen.length === n) return;
        if (chosen.includes(s)) continue;
        if (!spaced || chosen.every((c) => Math.hypot(c.x - s.x, c.z - s.z) > 3.4)) chosen.push(s);
      }
    };
    for (const tier of tiers) {
      take(tier, true);
      take(tier, false);                              // Rest ohne Abstandsregel, aber nie doppelt
    }
    return chosen;
  }

  spawnWave(labels) {
    this.wave++;
    const chosen = this._pickSpots(labels.length);
    labels.forEach((lab, i) => {
      const spot = chosen[i];
      const k = this._kid(lab.text, i);
      const base = new THREE.Vector3(spot.x, this.groundAt(spot.x, spot.z) - 0.15, spot.z);
      k.group.position.copy(base).add(spot.hide);
      k.group.visible = false;
      this.e.scene.add(k.group);
      this.targets.push({
        ...k, data: lab, base, hide: spot.hide, center: new THREE.Vector3(), radius: 1.05, hittable: false,
        state: 'wait', delay: 0.2 + i * 0.5 / this.tempo, t: 0, k: 0, stay: (7.5 + Math.random() * 2) / this.tempo, phase: Math.random() * 6,
      });
    });
  }

  waveDone() { return !this.targets.some((k) => ['wait', 'rise', 'up', 'lock'].includes(k.state)); }

  dismiss() {
    for (const k of this.targets) {
      if (k.state === 'wait') this._remove(k);
      else if (k.state === 'rise' || k.state === 'up') { k.state = 'hide'; k.hittable = false; }
    }
  }

  _setFace(k, kind) { k.face.material.map = this.faces[kind]; k.face.material.needsUpdate = true; }

  resolve(k, outcome) {
    const fx = this.e.fx;
    k.hittable = false;
    audio.play('thud');
    fx.burst(k.center, { count: 26, speed: 4.5, colors: ['#ffffff', '#e8eef5'], size: 0.4, life: 0.7, gravity: 7, drag: 1.5 });
    if (outcome === 'lock') { k.state = 'lock'; this._setFace(k, 'oh'); fx.ring(k.center, this.e.camera, { color: '#ffe066', size: 2.6 }); return; }
    k.t = 0;
    if (outcome === 'correct') {
      k.state = 'fall'; this._setFace(k, 'laugh');
      k.group.position.copy(k.base);
      fx.flash(k.center, { color: '#fff4c8', size: 5 });
      fx.ring(k.center, this.e.camera, { color: '#ffe680', size: 5 });
      fx.burst(k.center, { count: 50, speed: 8, colors: ['#ffd84a', '#fff3b0', '#9be7ff', '#ff9ecb'], size: 0.4, life: 0.9, gravity: 3, drag: 2, additive: true });
    } else {
      k.state = 'funny'; this._setFace(k, 'funny');
      k.label.material.opacity = 0.35;
    }
  }

  _remove(k) {
    k.state = 'gone'; k.hittable = false;
    this.e.scene.remove(k.group);
    k.label.material.map.dispose(); k.label.material.dispose();
  }

  onShoot() { audio.play('throw'); }
  onGroundHit(p) { this.e.fx.burst(p, { count: 12, speed: 3, colors: ['#ffffff'], size: 0.35, life: 0.5, gravity: 8, up: 2 }); }

  update(dt, raw) {
    this.time += dt;
    // Schneefall
    const f = this.flakes;
    for (let i = 0; i < f.length; i += 3) {
      f[i + 1] -= raw * (1.3 + (i % 7) * 0.12);
      f[i] += Math.sin(this.time * 0.7 + i) * raw * 0.35;
      if (f[i + 1] < -0.5) f[i + 1] = 26;
    }
    this.snow.geometry.attributes.position.needsUpdate = true;
    // Rauch
    for (const s of this.smoke) {
      s.t += raw;
      if (s.t > 0.28) { s.t = 0; this.e.fx.burst(s.pos, { count: 1, speed: 0.3, colors: ['#d8d8d4'], size: 1.6, life: 4.5, gravity: -0.9, drag: 0.2, alpha: 0.3 }); }
    }
    for (const b of this.birds) {
      b.m.position.x += b.v * raw; if (Math.abs(b.m.position.x) > 70) b.m.position.x *= -0.98;
      b.m.scale.y = 0.4 + Math.abs(Math.sin(this.time * 5 + b.ph)) * 1.4;
    }
    // Schlittschuhläufer
    for (const s of this.skaters) {
      const a = this.time * s.sp + s.ph;
      s.g.position.set(s.cx + Math.cos(a) * s.r, -0.28, s.cz + Math.sin(a) * s.r * 0.6);
      s.g.rotation.z = Math.sin(a * 3) * 0.12;
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const k = this.targets[i];
      if (k.state === 'gone') { this.targets.splice(i, 1); continue; }
      const g = k.group;
      if (k.state === 'wait') {
        k.delay -= dt;
        if (k.delay > 0) continue;
        k.state = 'rise'; g.visible = true;
      }
      if (k.state === 'rise') {
        k.k = Math.min(1, k.k + dt * 3.2);
        if (k.k > 0.55) k.hittable = true;
        if (k.k >= 1) k.state = 'up';
      } else if (k.state === 'up') {
        k.t += dt;
        if (k.t > k.stay) { k.state = 'hide'; k.hittable = false; k.escaped = true; }
      } else if (k.state === 'hide') {
        k.k -= dt * 3.5;
        if (k.k <= 0) {
          const esc = k.escaped;
          this._remove(k);
          if (esc && this.onEscape) this.onEscape(k);
          continue;
        }
      } else if (k.state === 'funny') {            // falsch: guckt ulkig, wackelt, duckt sich weg
        k.t += dt;
        g.rotation.z = Math.sin(k.t * 22) * 0.12 * Math.max(0, 1 - k.t);
        if (k.t > 1.3) { g.rotation.z = 0; k.state = 'hide'; }
      } else if (k.state === 'fall') {             // richtig: kippt lachend nach hinten in den Schnee
        k.t += dt;
        const a = Math.min(1, k.t / 0.55);
        g.rotation.x = -a * a * 1.5;
        k.arms[0].rotation.z = -0.35 - a * 2.2; k.arms[1].rotation.z = 0.35 + a * 2.2;
        if (a >= 1 && !k.puffed) {
          k.puffed = true;
          const p = k.base.clone().add(new THREE.Vector3(0, 0.3, -1.6));
          this.e.fx.burst(p, { count: 45, speed: 5, colors: ['#ffffff', '#eaf1f7'], size: 0.55, life: 1.0, gravity: 6, up: 3.5, drag: 1.2 });
        }
        if (k.t > 1.5) { g.position.y -= dt * 2.2; }
        if (k.t > 2.3) { this._remove(k); continue; }
      }
      if (['rise', 'up', 'hide', 'funny', 'lock'].includes(k.state)) {
        const e = 1 - Math.pow(1 - Math.max(0, k.k), 3);
        g.position.copy(k.base).addScaledVector(k.hide, 1 - e);
        if (k.state !== 'hide') {
          g.position.y += Math.abs(Math.sin(this.time * 3 + k.phase)) * 0.07;
          k.arms[0].rotation.z = -0.35 - Math.max(0, Math.sin(this.time * 5 + k.phase)) * 1.6;
        }
      }
      g.getWorldPosition(k.center); k.center.y += 2.2;
    }
  }

  dispose() { this.targets.length = 0; }
}
