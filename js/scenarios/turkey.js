// Szenario "Truthahn-Skeet": Bergwiese in den Rocky Mountains, Wildtruthähne
// steigen aus dem Gebüsch auf und tragen die Ergebnisse.
import * as THREE from 'three';
import { fbm, noise2, mulberry, makeLabel, disposeTree } from '../engine.js';
import { audio } from '../audio.js';

const FEATHERS = ['#3b2a1e', '#5a3d28', '#7a5535', '#d9c7a3', '#2a1d15', '#8c2f22'];

// Kulissen nach Jahreszeit; wechseln mit jeder Runde (opts.variant).
export const TURKEY_THEMES = [
  { id: 'autumn', name: 'Herbst im Hochtal',
    sky: ['#1f5fae', '#5d9bd8', '#d6e4f0'], clouds: { n: 34, a: 0.34, light: '255,255,255', dark: '170,180,195' }, fog: 0xc6d5e3,
    hemi: [0xdcebff, 0x7a6238, 1.1], sun: [0xfff0d2, 2.4],
    ground: (c, n, d) => c.setHSL(0.085 + n * 0.035, 0.5 + d * 0.1, 0.29 + n * 0.15 + d * 0.05), snow: 0,
    grass: { n: 14000, h: 1, hue: 0.09, sat: 0.6, l: 0.33 }, flowers: false,
    conifer: [0.38, 0.32, 0.1], aspen: [0.085, 0.06], water: 0x5d87b5, rock: 0x8d8a84,
    bushNear: [0x7a3418, 0x94461c, 0x5c2a16, 0xa8641f, 0x6b6a2c], bushFar: [0x4a4a24, 0x6b3a1c, 0x3f4420, 0x80501e],
    ridges: [{ forest: 0x1c3024, rock: 0x6f6a64, tree: 0.62, snowline: 0.9 }, { forest: 0x2f4636, rock: 0x7d7a78, tree: 0.36, snowline: 0.66 }, { forest: 0x6f8494, rock: 0x8f99a6, tree: 0.15, snowline: 0.46 }] },
  { id: 'summer', name: 'Sommer unter den Gipfeln',
    sky: ['#2a66b0', '#7aa9d8', '#d2dde8'], clouds: { n: 30, a: 0.36, light: '250,250,252', dark: '150,155,170' }, fog: 0xc3d0de,
    hemi: [0xdcebff, 0x5c6b3a, 1.15], sun: [0xfff1d6, 2.3],
    ground: (c, n, d) => c.setHSL(0.25 - n * 0.08, 0.45 + d * 0.15, 0.25 + n * 0.15 + d * 0.04), snow: 0,
    grass: { n: 14000, h: 1, hue: 0.22, sat: 0.55, l: 0.22 }, flowers: true,
    conifer: [0.36, 0.42, 0.14], aspen: [0.27, 0.05, 0.5, 0.26], water: 0, rock: 0x8a8f92,
    bushNear: [0x5d7a4a, 0x6f8a58, 0x4c6a3f, 0x7f9668], bushFar: [0x33492c, 0x3e5433, 0x2b3d27, 0x4a5c36],
    ridges: [{ forest: 0x2a5230, rock: 0x7b8088, tree: 0.6, snowline: 1.2 }, { forest: 0x3d6142, rock: 0x8a8d96, tree: 0.3, snowline: 1.2 }, { forest: 0x7d8f99, rock: 0x9aa0ad, tree: 0.12, snowline: 0.8 }] },
  { id: 'winter', name: 'Wintertag im Schnee',
    sky: ['#6a7686', '#9aa5b3', '#d5dae0'], clouds: { n: 60, a: 0.4, light: '235,238,242', dark: '110,118,130' }, fog: 0xcfd5dc,
    hemi: [0xe6ecf2, 0x9aa3ad, 1.35], sun: [0xf4f1ea, 1.5],
    ground: (c, n, d) => c.setHSL(0.6, 0.15, 0.88 + n * 0.08), snow: 2,
    grass: { n: 3500, h: 0.7, hue: 0.09, sat: 0.4, l: 0.36 }, flowers: false,
    conifer: [0.4, 0.3, 0.1], aspen: null, water: 0, rock: 0x5e5550,
    bushNear: [0x6b3a2c, 0x7d4630, 0x55302a, 0x8a5a3c], bushFar: [0x4a3a30, 0x5c4032, 0x2f3d30, 0x6b4a36],
    ridges: [{ forest: 0x2a3a3a, rock: 0x7d8a96, tree: 0.3, snowline: 0.55 }, { forest: 0x55687a, rock: 0x8e9cab, tree: 0.15, snowline: 0.38 }, { forest: 0x9aa8b6, rock: 0xb0bcc8, tree: 0.05, snowline: 0.25 }] },
  { id: 'thaw', name: 'Schneereste im Vorfrühling',
    sky: ['#1c62b8', '#4f96dc', '#c4dcf0'], clouds: { n: 22, a: 0.45, light: '255,255,255', dark: '225,232,240' }, fog: 0xb7cde6,
    hemi: [0xdcebff, 0x8a7a52, 1.2], sun: [0xfff4e0, 2.3],
    ground: (c, n, d) => c.setHSL(0.09 + n * 0.03, 0.34 + d * 0.1, 0.36 + n * 0.14), snow: 0.47,
    grass: { n: 9000, h: 0.8, hue: 0.095, sat: 0.45, l: 0.38 }, flowers: false,
    conifer: [0.36, 0.38, 0.13], aspen: null, water: 0, rock: 0x8a7f74,
    bushNear: [0x6f6a44, 0x857a4c, 0x5a5a3a, 0x7a4a2c], bushFar: [0x3f4a30, 0x55502f, 0x4a3a28],
    ridges: [{ forest: 0x24423f, rock: 0x4d6a8c, tree: 0.6, snowline: 0.85 }, { forest: 0x3a5a7a, rock: 0x5f7fa6, tree: 0.3, snowline: 0.6 }, { forest: 0x6f8fb8, rock: 0x86a3c8, tree: 0.1, snowline: 0.45 }] },
];

export class TurkeyScenario {
  constructor(engine, opts = {}) {
    this.e = engine;
    this.tempo = opts.tempo || 1;
    this.variant = opts.variant || 0;
    this.theme = TURKEY_THEMES[this.variant % TURKEY_THEMES.length];
    this.targets = [];
    this.wave = 0;
    this.onEscape = null;
    this.sway = { yaw: 0.16, pitch: 0.07 };
    this.shot = {
      speed: opts.lead === false ? 600 : 95, cooldown: 0.42, range: 160, radius: 0.18,
      aimDistance: 28, orient: true, offset: { x: 0.2, y: -0.2, z: -1.4 },
      makeMesh: () => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
        m.scale.set(1, 1, 9);
        return m;
      },
    };
    this.time = 0;
    this.recoil = 0;
    this.leafFx = this.theme.bushFar.map((h) => '#' + h.toString(16).padStart(6, '0'));
  }

  groundAt(x, z) {
    return -z * 0.085 + x * 0.025 + (fbm(x * 0.021 + 7.3, z * 0.021 + 2.1) - 0.5) * 5.5;
  }

  // ------------------------------------------------------------ Szenerie
  build() {
    const { scene, camera } = this.e;
    const T = this.theme;
    const rnd = mulberry(4711 + this.variant * 97);
    scene.fog = new THREE.Fog(T.fog, 170, 2300);

    // Himmel mit Wolken
    const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 512;
    const g = sc.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, T.sky[0]); gr.addColorStop(0.36, T.sky[1]); gr.addColorStop(0.5, T.sky[2]); gr.addColorStop(1, T.sky[2]);
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    g.filter = 'blur(8px)';
    for (let i = 0; i < T.clouds.n; i++) {
      const cx = rnd() * 1024, cy = 70 + rnd() * 175, w = 50 + rnd() * 130;
      for (let j = 0; j < 8; j++) {
        const shade = j < 3 ? T.clouds.dark : T.clouds.light;
        g.fillStyle = `rgba(${shade},${T.clouds.a * (0.5 + rnd() * 0.5)})`;
        g.beginPath(); g.ellipse(cx + (rnd() - 0.5) * w * 1.6, cy + (j < 3 ? 8 : -4) + (rnd() - 0.5) * 14, w * (0.3 + rnd() * 0.5), 9 + rnd() * 15, 0, 0, 7); g.fill();
      }
    }
    g.filter = 'none';
    const skyTex = new THREE.CanvasTexture(sc); skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, toneMapped: false })));

    // Licht
    scene.add(new THREE.HemisphereLight(T.hemi[0], T.hemi[1], T.hemi[2]));
    const sun = new THREE.DirectionalLight(T.sun[0], T.sun[1]);
    sun.position.set(-60, 90, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 280 });
    sun.shadow.bias = -0.0006;
    sun.target.position.set(0, 2, -25);
    scene.add(sun, sun.target);

    // Wiese (Farbe je Jahreszeit, optional Schneeflecken)
    const geo = new THREE.PlaneGeometry(560, 440, 160, 126);
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -180);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    const snowAt = (x, z) => T.snow > 0 && fbm(x * 0.06 + 11, z * 0.06 + 4) + noise2(x * 0.5, z * 0.5) * 0.08 < T.snow;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, this.groundAt(x, z));
      const n = fbm(x * 0.05, z * 0.05), d = noise2(x * 0.4, z * 0.4);
      if (snowAt(x, z)) c.setHSL(0.6, 0.2, 0.9 + d * 0.06); else T.ground(c, n, d);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    ground.receiveShadow = true;
    scene.add(ground);

    // Bergketten (hinten heller = Luftperspektive)
    this._ridge(-330, 1500, 34, 120, 1.3 + this.variant, T.ridges[0]);
    this._ridge(-520, 1900, 70, 230, 2.7 + this.variant, T.ridges[1]);
    this._ridge(-760, 2400, 120, 340, 4.1 + this.variant, T.ridges[2]);

    // Bachlauf
    if (T.water) {
      const seg = 80, wg = new THREE.PlaneGeometry(1, 1, seg, 1), wp = wg.attributes.position;
      for (let i = 0; i <= seg; i++) {
        const x = -70 + i * 140 / seg, zc = -38 + Math.sin(x * 0.11) * 4.5 + Math.sin(x * 0.04 + 1) * 5, w = 2.2 + noise2(x * 0.1, 3) * 3.5;
        for (const [row, dz] of [[0, -w], [1, w]]) {
          const idx = row * (seg + 1) + i;
          wp.setXYZ(idx, x, this.groundAt(x, zc) + 0.12, zc + dz);
        }
      }
      wg.computeVertexNormals();
      const water = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: T.water, roughness: 0.12, metalness: 0.35, side: THREE.DoubleSide }));
      scene.add(water);
    }

    // Gras
    const blade = new THREE.BufferGeometry();
    blade.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.05, 0, 0, 0.05, 0, 0, 0.012, 0.62, 0.05]), 3));
    blade.computeVertexNormals();
    const N = T.grass.n;
    const grass = new THREE.InstancedMesh(blade, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), N);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) {
      const z = 5 - Math.pow(rnd(), 1.7) * 60, x = (rnd() - 0.5) * (30 + (5 - z) * 1.4);
      p.set(x, this.groundAt(x, z) - 0.02, z);
      q.setFromAxisAngle(up, rnd() * Math.PI * 2);
      s.set(1 + rnd(), (0.6 + rnd() * 1.1) * T.grass.h, 1);
      grass.setMatrixAt(i, m.compose(p, q, s));
      grass.setColorAt(i, c.setHSL(T.grass.hue + rnd() * 0.05, T.grass.sat, T.grass.l + rnd() * 0.16));
    }
    scene.add(grass);

    if (T.flowers) {
      const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 5, 4), new THREE.MeshLambertMaterial(), 500);
      const fcol = [0xffd94a, 0xb48cff, 0xffffff, 0xff8a5c];
      for (let i = 0; i < 500; i++) {
        const z = 4 - rnd() * 40, x = (rnd() - 0.5) * 60;
        p.set(x, this.groundAt(x, z) + 0.35 + rnd() * 0.3, z);
        fl.setMatrixAt(i, m.compose(p, q.identity(), s.setScalar(0.7 + rnd())));
        fl.setColorAt(i, c.set(fcol[Math.floor(rnd() * 4)]));
      }
      scene.add(fl);
    }

    // Nadelwald am Hang, dazu Espen-Tupfer im Herbst
    const cone = new THREE.ConeGeometry(1, 4.6, 7); cone.translate(0, 2.3, 0);
    const trees = new THREE.InstancedMesh(cone, new THREE.MeshLambertMaterial({ flatShading: true }), 700);
    let ti = 0;
    for (let k = 0; k < 7000 && ti < 700; k++) {
      const x = (rnd() - 0.5) * 520, z = -80 - rnd() * 270;
      if (noise2(x * 0.016 + 40, z * 0.016) < 0.46) continue;
      const h = 1.8 + rnd() * 2.2;
      p.set(x, this.groundAt(x, z) - 0.3, z);
      trees.setMatrixAt(ti, m.compose(p, q.identity(), s.set(h * 0.8, h, h * 0.8)));
      trees.setColorAt(ti, c.setHSL(T.conifer[0] + rnd() * 0.04, T.conifer[1], T.conifer[2] + rnd() * 0.07));
      ti++;
    }
    trees.count = ti; trees.castShadow = true;
    scene.add(trees);
    if (T.aspen) {
      const blob = new THREE.IcosahedronGeometry(1, 1); blob.translate(0, 1.4, 0);
      const asp = new THREE.InstancedMesh(blob, new THREE.MeshLambertMaterial({ flatShading: true }), 260);
      let ai = 0;
      for (let k = 0; k < 5000 && ai < 260; k++) {
        const x = (rnd() - 0.5) * 420, z = -62 - rnd() * 150;
        if (noise2(x * 0.03 + 9, z * 0.03 + 2) < 0.62) continue;
        const h = 2 + rnd() * 2.2;
        p.set(x, this.groundAt(x, z), z);
        asp.setMatrixAt(ai, m.compose(p, q.identity(), s.set(h * 0.7, h, h * 0.7)));
        asp.setColorAt(ai, c.setHSL(T.aspen[0] + rnd() * T.aspen[1], T.aspen[2] ?? 0.85, (T.aspen[3] ?? 0.42) + rnd() * 0.12));
        ai++;
      }
      asp.count = ai; scene.add(asp);
    }
    // einzelne Kiefern im Mittelgrund
    [[-38, -44, 9], [-30, -56, 11], [34, -42, 10], [44, -58, 12], [20, -66, 9], [-14, -74, 10], [58, -40, 8], [-58, -50, 10], [4, -92, 12]]
      .forEach(([x, z, h]) => this._pine(x, z, h * (0.8 + rnd() * 0.4), rnd));

    // Gebüsch: Vordergrund (rahmt das Bild), Startplätze, knorrige Büsche hinten
    [[-6.4, 1.6, 1.5], [6.8, 1.9, 1.6], [-10.5, -1.5, 1.7], [11.2, -2, 1.9], [-3.6, 3.2, 0.8], [4.1, 3.4, 0.8]]
      .forEach(([x, z, sz]) => this._bush(x, z, sz, T.bushNear, rnd));
    this.launch = { left: [], right: [], mid: [] };
    for (let i = 0; i < 4; i++) {
      const zl = -15 - i * 3.5, zr = -16 - i * 3.5;
      this._bush(-27 - rnd() * 3, zl, 2.3 + rnd(), T.bushFar, rnd); this.launch.left.push(zl);
      this._bush(27 + rnd() * 3, zr, 2.3 + rnd(), T.bushFar, rnd); this.launch.right.push(zr);
    }
    for (let i = 0; i < 5; i++) {
      const x = -9 + i * 4.5 + rnd() * 2, z = -24 - rnd() * 5;
      this._bush(x, z, 1.7 + rnd() * 0.8, T.bushNear, rnd); this.launch.mid.push([x, z]);
    }
    [[-34, -48], [-14, -58], [8, -52], [27, -64], [46, -50], [-52, -70], [16, -82]]
      .forEach(([x, z]) => this._gnarly(x, z, 1.6 + rnd() * 1.2, rnd));

    // Felsen (im Winter mit Schneehaube)
    const rockMat = new THREE.MeshLambertMaterial({ color: T.rock, flatShading: true });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xf4f7fa });
    for (let i = 0; i < 18; i++) {
      const x = (rnd() - 0.5) * 110, z = -6 - rnd() * 75, r = 0.5 + rnd() * 1.7;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
      rock.position.set(x, this.groundAt(x, z) + r * 0.15, z);
      rock.scale.set(1 + rnd() * 0.6, 0.6 + rnd() * 0.3, 1);
      rock.rotation.set(rnd() * 3, rnd() * 3, 0);
      rock.castShadow = rock.receiveShadow = true;
      scene.add(rock);
      if (T.snow > 0.5) {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.95, 8, 5, 0, 7, 0, 1.1), capMat);
        cap.position.copy(rock.position).y += r * 0.12; cap.scale.set(rock.scale.x, 0.55, 1);
        scene.add(cap);
      }
    }

    // Kamera + Flinte
    camera.fov = 55; camera.updateProjectionMatrix();
    camera.position.set(0, this.groundAt(0, 6) + 1.75, 6);
    camera.lookAt(0, this.groundAt(0, -24) + 5.2, -24);
    this.gun = this._gun();
    camera.add(this.gun);
  }

  _ridge(z, width, base, peak, seed, pal) {
    const depth = 190;
    const geo = new THREE.PlaneGeometry(width, depth, 130, 16);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    const cF = new THREE.Color(pal.forest), cR = new THREE.Color(pal.rock), cS = new THREE.Color(0xf5f8fb), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), v = pos.getZ(i) / depth + 0.5;           // 0 hinten … 1 vorn
      const ridged = 1 - Math.abs(2 * fbm(x * 0.0042 + seed * 31, seed, 5) - 1);
      const crest = base + peak * Math.pow(ridged, 2.1) * (0.6 + 0.4 * noise2(x * 0.0012 + seed, 3));
      const bell = Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.15)), 0.8);
      const h = crest * bell + (fbm(x * 0.03, v * 9 + seed) - 0.5) * peak * 0.14 * bell;
      pos.setY(i, h);
      const rel = h / (base + peak) + (noise2(x * 0.05, v * 20) - 0.5) * 0.12;
      if (rel > pal.snowline) c.copy(cS);
      else if (rel > pal.tree) c.copy(cR).lerp(cS, Math.max(0, (rel - pal.tree) / (pal.snowline - pal.tree) - 0.55) * 1.4);
      else c.copy(cF).lerp(cR, noise2(x * 0.02, v * 30) * 0.25);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    mesh.position.set(0, this.groundAt(0, z + depth / 2) - 14, z);
    this.e.scene.add(mesh);
  }

  _pine(x, z, h, rnd) {
    const T = this.theme, grp = new THREE.Group(), c = new THREE.Color();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.02, h * 0.035, h * 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x4a3626 }));
    trunk.position.y = h * 0.25; trunk.castShadow = true; grp.add(trunk);
    for (let i = 0; i < 5; i++) {
      const k = i / 5, r = h * 0.2 * (1 - k * 0.72);
      c.setHSL(T.conifer[0] + rnd() * 0.03, T.conifer[1], T.conifer[2] + 0.03 + rnd() * 0.05);
      if (T.snow > 0.5) c.lerp(new THREE.Color(0xe8eef2), 0.35);
      const tier = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.3, 8), new THREE.MeshLambertMaterial({ color: c.clone(), flatShading: true }));
      tier.position.y = h * (0.3 + k * 0.62); tier.castShadow = true; grp.add(tier);
    }
    grp.position.set(x, this.groundAt(x, z) - 0.2, z);
    this.e.scene.add(grp);
  }

  _bush(x, z, size, palette, rnd) {
    const grp = new THREE.Group();
    const n = 7 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      const r = size * (0.35 + rnd() * 0.3);
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshLambertMaterial({ color: palette[Math.floor(rnd() * palette.length)], flatShading: true }),
      );
      mesh.position.set((rnd() - 0.5) * size * 1.5, r * 0.6 + rnd() * size * 0.45, (rnd() - 0.5) * size);
      mesh.scale.y = 0.75 + rnd() * 0.3;
      mesh.castShadow = true;
      grp.add(mesh);
    }
    grp.position.set(x, this.groundAt(x, z) - 0.15, z);
    this.e.scene.add(grp);
  }

  // Niedriger, knorriger Busch: verdrehter Stamm, flache Krone.
  _gnarly(x, z, size, rnd) {
    const grp = new THREE.Group();
    const bark = new THREE.MeshLambertMaterial({ color: 0x3a2c22, flatShading: true });
    const leaf = this.theme.bushFar;
    for (let b = 0; b < 3; b++) {
      let p = new THREE.Vector3((rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.4);
      let dir = new THREE.Vector3((rnd() - 0.5) * 1.6, 1, (rnd() - 0.5) * 1.6).normalize();
      for (let sgm = 0; sgm < 3; sgm++) {
        const len = size * (0.55 - sgm * 0.1), r = size * (0.13 - sgm * 0.035);
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, len, 5), bark);
        const end = p.clone().addScaledVector(dir, len);
        cyl.position.copy(p).lerp(end, 0.5);
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        cyl.castShadow = true;
        grp.add(cyl);
        p = end;
        dir = dir.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.5, 0.1, (rnd() - 0.5) * 1.5)).normalize();
      }
      for (let k = 0; k < 3; k++) {
        const r = size * (0.45 + rnd() * 0.3);
        const cl = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshLambertMaterial({ color: leaf[Math.floor(rnd() * leaf.length)], flatShading: true }));
        cl.position.copy(p).add(new THREE.Vector3((rnd() - 0.5) * size, (rnd() - 0.3) * size * 0.3, (rnd() - 0.5) * size));
        cl.scale.y = 0.5;
        cl.castShadow = true;
        grp.add(cl);
      }
    }
    grp.position.set(x, this.groundAt(x, z) - 0.1, z);
    this.e.scene.add(grp);
  }

  // Bockflinte aus der Ich-Perspektive: schwarze Läufe mit Schiene,
  // rotbrauner Vorderschaft, silberner Systemkasten, Holzschaft.
  _gun() {
    const g = new THREE.Group();
    const steel = new THREE.MeshLambertMaterial({ color: 0x24272c });
    const silver = new THREE.MeshLambertMaterial({ color: 0xc3c8cc });
    const wood = new THREE.MeshLambertMaterial({ color: 0x9a4a22 });
    for (const dy of [0, -0.04]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.021, 1.0, 12), steel);
      b.rotation.x = Math.PI / 2; b.position.set(0, dy, -0.72);
      g.add(b);
    }
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.008, 1.0), new THREE.MeshLambertMaterial({ color: 0x3a3e44 })); rib.position.set(0, 0.024, -0.72); g.add(rib);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c0 })); bead.position.set(0, 0.034, -1.2); g.add(bead);
    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.34, 10), wood);
    fore.rotation.x = Math.PI / 2; fore.scale.set(1, 1, 1.25); fore.position.set(0, -0.04, -0.4); g.add(fore);
    const rec = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.095, 0.2), silver); rec.position.set(0, -0.02, -0.12); g.add(rec);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.09), silver); lever.position.set(0, 0.034, -0.06); g.add(lever);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.075, 0.2), wood); grip.position.set(0, -0.05, 0.06); grip.rotation.x = -0.35; g.add(grip);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.13, 0.5), wood); stock.position.set(0, -0.1, 0.36); stock.rotation.x = -0.16; g.add(stock);
    return g;
  }

  // ------------------------------------------------------------ Truthahn
  _turkey(text) {
    const grp = new THREE.Group();
    const bodyM = new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 0.65, metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), bodyM);
    body.scale.set(0.78, 0.74, 1.2); body.castShadow = true; grp.add(body);
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), new THREE.MeshStandardMaterial({ color: 0x4a3323, roughness: 0.7, metalness: 0.2 }));
    breast.position.set(0, -0.06, 0.36); grp.add(breast);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x8a4b52, roughness: 0.8 }));
    neck.position.set(0, 0.2, 0.72); neck.rotation.x = 1.0; grp.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), new THREE.MeshStandardMaterial({ color: 0x86a9c9, roughness: 0.7 }));
    head.position.set(0, 0.36, 1.0); grp.add(head);
    const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc8261c, roughness: 0.6 }));
    wattle.scale.set(0.7, 1.5, 0.8); wattle.position.set(0, 0.23, 1.03); grp.add(wattle);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0xe2b45c }));
    beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.36, 1.16); grp.add(beak);
    for (const dx of [-0.09, 0.09]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      eye.position.set(dx, 0.39, 1.06); grp.add(eye);
    }
    // Schwanzfächer
    const fanOuter = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd8c39a, side: THREE.DoubleSide, roughness: 0.8 }));
    const fanInner = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x4d321f, side: THREE.DoubleSide, roughness: 0.8 }));
    const fanCore = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2c1c12, side: THREE.DoubleSide, roughness: 0.8 }));
    const fan = new THREE.Group();
    fanInner.position.z = 0.01; fanCore.position.z = 0.02;
    fan.add(fanOuter, fanInner, fanCore);
    fan.position.set(0, 0.02, -0.5); fan.rotation.x = -1.05; fan.scale.set(1, 1.1, 1);
    grp.add(fan);
    // Flügel
    const wingTex = TurkeyScenario.wingTexture();
    const mk = (side) => {
      const pivot = new THREE.Group();
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.72, 4, 1), new THREE.MeshStandardMaterial({ map: wingTex, side: THREE.DoubleSide, roughness: 0.8, transparent: true, alphaTest: 0.4 }));
      w.rotation.x = -Math.PI / 2;
      w.position.x = side * 0.6;
      if (side < 0) w.scale.x = -1;
      w.castShadow = true;
      pivot.add(w); pivot.position.set(side * 0.28, 0.16, 0.05);
      grp.add(pivot);
      return pivot;
    };
    const wingL = mk(-1), wingR = mk(1);
    const label = makeLabel(text, { border: '#c0392b', height: 0.98 });
    label.material.depthTest = false;
    label.position.set(0, -0.02, 0);
    grp.add(label);
    grp.scale.setScalar(1.55);
    return { group: grp, wingL, wingR, label };
  }

  static wingTexture() {
    if (TurkeyScenario._wt) return TurkeyScenario._wt;
    const c = document.createElement('canvas'); c.width = 128; c.height = 64;
    const g = c.getContext('2d');
    g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(70, -6, 128, 22); g.quadraticCurveTo(100, 62, 20, 60); g.quadraticCurveTo(0, 50, 0, 14); g.closePath();
    g.fillStyle = '#3a271a'; g.fill(); g.clip();
    for (let x = 34; x < 128; x += 9) { g.fillStyle = x % 18 ? '#d9c8a6' : '#6b4a2d'; g.fillRect(x, 26, 4, 40); }
    g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 128, 22);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    TurkeyScenario._wt = t;
    return t;
  }

  // ------------------------------------------------------------ Wellen
  // labels: [{ text, ... }] – ein Truthahn pro Eintrag. Richtung wechselt je Welle.
  spawnWave(labels) {
    const dir = this.wave++ % 3;
    const n = labels.length;
    const lanes = labels.map((_, i) => 3.6 + (i + Math.random() * 0.6) * (7.2 / n)).sort(() => Math.random() - 0.5);
    labels.forEach((lab, i) => {
      const t = this._turkey(lab.text);
      let sx, sz, vx, vz;
      if (dir === 2) {
        const [bx, bz] = this.launch.mid[i % this.launch.mid.length];
        sx = bx; sz = bz;
        vx = (i % 2 ? 1 : -1) * (2.6 + Math.random() * 1.8) * (0.6 + i * 0.12); vz = -0.5 - Math.random() * 0.6;
      } else {
        const side = dir === 0 ? -1 : 1;
        const zs = side < 0 ? this.launch.left : this.launch.right;
        sx = side * 28; sz = zs[i % zs.length] - Math.random() * 2;
        vx = -side * (5.2 + Math.random() * 2.0); vz = (Math.random() - 0.5) * 0.5;
      }
      const start = new THREE.Vector3(sx, this.groundAt(sx, sz) + 1, sz);
      t.group.position.copy(start);
      t.group.visible = false;
      this.e.scene.add(t.group);
      this.targets.push({
        ...t, data: lab, center: start.clone(), radius: 1.25, hittable: false,
        state: 'wait', delay: 0.15 + i * (dir === 2 ? 0.45 : 0.75) / this.tempo, t: 0,
        start, vx: vx * this.tempo, vz: vz * this.tempo, lane: this.groundAt(sx, sz) + lanes[i],
        phase: Math.random() * 6, vy: 0, roll: 0, speedMul: 1, lift: 0,
      });
    });
  }

  waveDone() { return !this.targets.some((b) => ['wait', 'fly', 'lock'].includes(b.state)); }

  dismiss() {
    for (const b of this.targets) {
      if (b.state === 'wait') this._remove(b);
      else if (b.state === 'fly') { b.state = 'flee'; b.hittable = false; b.label.material.opacity = 0.35; }
    }
  }

  // outcome: 'correct' | 'wrong' | 'lock'
  resolve(b, outcome) {
    const fx = this.e.fx;
    if (outcome === 'lock') { b.state = 'lock'; b.hittable = false; fx.ring(b.center, this.e.camera, { color: '#ffe066', size: 3.5 }); return; }
    b.hittable = false;
    if (outcome === 'correct') {
      fx.flash(b.center, { color: '#fff6c8', size: 7 });
      fx.ring(b.center, this.e.camera, { color: '#ffe680', size: 7 });
      fx.burst(b.center, { count: 70, speed: 9, colors: FEATHERS, size: 0.55, life: 1.6, gravity: 5, drag: 2.2 });
      fx.burst(b.center, { count: 60, speed: 13, colors: ['#ffd84a', '#fff3b0', '#ff9d2e'], size: 0.5, life: 0.8, gravity: 2, drag: 2, additive: true });
      this._remove(b);
    } else {
      b.state = 'droop'; b.vy = 1.5; b.label.material.opacity = 0.3;
      fx.burst(b.center, { count: 10, speed: 3, colors: FEATHERS, size: 0.4, life: 1.2, gravity: 4, drag: 2 });
    }
  }

  _remove(b) {
    b.state = 'gone'; b.hittable = false;
    this.e.scene.remove(b.group);
    b.group.traverse((o) => { if (o.isSprite) { o.material.map.dispose(); o.material.dispose(); } });
  }

  onShoot(start, dir) {
    audio.play('shot');
    this.recoil = 1;
    this.e.fx.flash(start.clone().addScaledVector(dir, 0.3), { color: '#ffd9a0', size: 1.6, life: 0.09 });
    this.e.fx.burst(start, { count: 6, speed: 1.2, colors: ['#bbbbbb'], size: 0.5, life: 0.7, gravity: -0.6, drag: 1, alpha: 0.35 });
  }
  onGroundHit(p) {
    this.e.fx.burst(p, { count: 10, speed: 3, colors: ['#8a7a5a', '#6f8a58'], size: 0.4, life: 0.6, gravity: 7, up: 2.5 });
  }

  // ------------------------------------------------------------ Update
  update(dt) {
    this.time += dt;
    // Flinte folgt dem Fadenkreuz, Rückstoß klingt ab
    const mx = this.e.mouse.x, my = this.e.mouse.y;
    this.recoil = Math.max(0, this.recoil - dt * 5);
    this.gun.rotation.set(0.1 + my * 0.34 + this.recoil * 0.07, 0.2 - mx * 0.62, 0);
    this.gun.position.set(0.25 + mx * 0.07, -0.25 + my * 0.03, -0.42 + this.recoil * 0.07);

    const prev = new THREE.Vector3();
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const b = this.targets[i];
      if (b.state === 'gone') { this.targets.splice(i, 1); continue; }
      if (b.state === 'wait') {
        b.delay -= dt;
        if (b.delay > 0) continue;
        b.state = 'fly'; b.hittable = true; b.group.visible = true;
        this.e.fx.burst(b.start, { count: 14, speed: 3.5, colors: this.leafFx, size: 0.45, life: 0.8, gravity: 6, up: 3 });
      }
      const g = b.group;
      prev.copy(g.position);
      let flap = 15;
      if (b.state === 'fly' || b.state === 'flee') {
        if (b.state === 'flee') { b.speedMul = Math.min(3, b.speedMul + dt * 3); b.lift += dt * 5 * b.speedMul; }
        b.t += dt * b.speedMul;
        const x = b.start.x + b.vx * b.t, z = b.start.z + b.vz * b.t;
        const y = b.start.y + (b.lane - b.start.y) * (1 - Math.exp(-1.25 * b.t)) + Math.sin(b.t * 2.1 + b.phase) * 0.35 + b.lift
          + (this.groundAt(x, z) - this.groundAt(b.start.x, b.start.z)) * 0.6;
        g.position.set(x, y, z);
        g.lookAt(prev.clone().add(g.position.clone().sub(prev).multiplyScalar(40)));
        const out = Math.abs(x) > 33 || z < -75 || b.t > 16 || y > 45;
        if (out) {
          const escaped = b.state === 'fly';
          this._remove(b);
          if (escaped && this.onEscape) this.onEscape(b);
          continue;
        }
      } else if (b.state === 'lock') {
        g.position.y += Math.sin(this.time * 6) * 0.004;
        flap = 22;
      } else if (b.state === 'droop') {           // schlaff absinken
        b.vy -= 7 * dt; b.roll += dt * 1.6;
        g.position.x += b.vx * 0.35 * dt;
        g.position.y += b.vy * dt;
        g.rotation.z = Math.sin(b.roll) * 0.5; g.rotation.x = Math.min(1.1, b.roll * 0.6);
        flap = 0;
        if (g.position.y < this.groundAt(g.position.x, g.position.z) + 0.3) {
          this.e.fx.burst(g.position, { count: 8, speed: 2, colors: ['#8a7a5a', '#6f8a58'], size: 0.4, life: 0.5, gravity: 6, up: 2 });
          this._remove(b);
          continue;
        }
      }
      const a = flap ? Math.sin(this.time * flap + b.phase) * 0.85 + 0.1 : -1.15;
      b.wingL.rotation.z = -a; b.wingR.rotation.z = a;
      b.center.copy(g.position);
    }
  }

  dispose() { this.targets.length = 0; }
}

export { disposeTree };
