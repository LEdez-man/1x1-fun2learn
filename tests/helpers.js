// Gemeinsame Hilfen für die Browsertests (Playwright, Chromium mit Software-Rendering).
// - Projektdateien werden per Request-Interception ausgeliefert: kein Webserver, kein Port.
// - Die Engine wird im Test von Hand getaktet (window.__step), weil die Echtzeitschleife
//   im Software-Renderer nur wenige Bilder pro Sekunde schafft.
// Aufruf der Tests aus dem Projektordner, z. B.:  node tests/round.test.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.md': 'text/plain' };
const BASE = 'http://app.test/';
exports.BASE = BASE;
const attach = exports.attach = async (ctx) => {
  await ctx.route('http://app.test/**', (route) => {
    let p = decodeURIComponent(new URL(route.request().url()).pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, path.normalize(p));
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: 'not found' });
    route.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
  });
};

exports.open = async (viewport, query = '?debug') => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport }); await attach(ctx);
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); console.log('[console.error]', m.text().slice(0, 300)); } });
  p.on('pageerror', (e) => { errors.push(e.message); console.log('[pageerror]', e.message); });
  await p.goto(BASE + 'index.html' + query);
  return { b, p, errors };
};
// Runde starten und die Engine von Hand takten (die Echtzeitschleife ist im Software-Renderer zu langsam).
exports.start = async (p, { scenario = 'snow', mode = 1, need = 3 } = {}) => {
  await p.click(`#optScenario button[data-id="${scenario}"]`);
  await p.click(`#optMode button[data-id="${mode}"]`);
  await p.click(`#optNeed button[data-id="${need}"]`);
  await p.click('#btnStart');
  await p.waitForFunction(() => window.__play && window.__scenario, null, { timeout: 30000 });
  await p.evaluate(() => {
    const e = window.__play.e;
    e.stop();
    window.__step = (sec, cam, render = false) => {
      const n = Math.max(1, Math.round(sec / 0.02));
      for (let i = 0; i < n; i++) {
        if (!e.world) break;
        const raw = 0.02, dt = raw * e.timeScale;
        e.cooldown = Math.max(0, e.cooldown - raw);
        if (cam === undefined) e.cam.x += (e.mouse.x * e.view.panX - e.cam.x) * (1 - Math.exp(-raw * 5)); else e.cam.x = cam;
        e._place(); e.scenario.update(dt, raw); e._stepProjectiles(raw); e.fx.update(raw); e.onFrame(raw);
      }
      if (render && e.world) e.app.renderer.render(e.app.stage);
    };
  });
};
