// Sichtbarkeit und Verdeckung der Kinder bei vollem Schwenk in mehreren Bildschirmgrößen
// (Regeln spec.md 7.4.3). Pixelvergleich: Kinder allein gegen ganze Szene innerhalb der Trefferflächen.
// Aufruf: node tests/visibility.test.js [Bildordner]   (Laufzeit im Software-Renderer einige Minuten)
const { open, start } = require('./helpers.js');
(async () => {
  const out = process.argv[2];
  const sizes = [[1280, 720, 30], [1920, 1080, 8], [1600, 900, 8], [1024, 768, 8], [2560, 1080, 8], [1366, 768, 6]];
  let fail = 0;
  for (const [w, h, waves] of sizes) {
    const { b, p, errors } = await open({ width: w, height: h });
    await start(p, { need: 3 });
    const view = await p.evaluate(() => window.__play.e.view);
    const res = await p.evaluate(async ({ waves }) => {
      const sc = window.__scenario, e = window.__play.e, pl = window.__play, out = { kids: 0, missing: 0, outside: 0, overlap: 0, occluded: 0, checkedPx: 0, rows: {}, worst: 0 };
      pl.state = 'idle';                                   // Spielablauf anhalten, nur das Szenario testen
      const grab = () => { e.app.renderer.render(e.app.stage); const c = document.createElement('canvas'); c.width = e.canvas.width; c.height = e.canvas.height; const g = c.getContext('2d'); g.drawImage(e.canvas, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
      const dpr = e.canvas.width / e.view.w;
      for (let n = 0; n < waves; n++) {
        sc.dismiss(); window.__step(1.5);
        const labels = n % 4 === 3 ? ['12×10', '17×8', '19×9'] : ['12', '48', '144', '7', '63'];
        sc.spawnWave(labels.map((text, i) => ({ text, correct: i === 0 })));
        window.__step(3.2);
        const up = sc.debugKids();
        out.kids += up.length; out.missing += labels.length - up.length;
        for (const k of up) out.rows[k.row] = (out.rows[k.row] || 0) + 1;
        for (const cam of [-e.view.panX, 0, e.view.panX]) {
          window.__step(0.02, cam);
          const r = sc.debugKids();
          for (const k of r) if (k.x0 < 0 || k.x1 > e.view.w || k.y0 < 0 || k.y1 > e.view.h) out.outside++;
          for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
            if (r[i].x0 < r[j].x1 && r[j].x0 < r[i].x1 && r[i].y0 < r[j].y1 && r[j].y0 < r[i].y1) out.overlap++;
          }
          if (n < 12) {                                     // Pixelvergleich: Kinder allein gegen ganze Szene
            sc.debugShow({ calm: true }); const full = grab();
            sc.debugShow({ solo: true }); const solo = grab();
            sc.debugShow({});
            const bg = [solo.data[0], solo.data[1], solo.data[2]];
            for (const k of r) {
              let kidPx = 0, diff = 0;
              for (let y = Math.ceil(k.y0 * dpr); y < k.y1 * dpr; y += 2) for (let x = Math.ceil(k.x0 * dpr); x < k.x1 * dpr; x += 2) {
                const i = (y * solo.width + x) * 4;
                const isBg = (j) => Math.abs(solo.data[j] - bg[0]) + Math.abs(solo.data[j + 1] - bg[1]) + Math.abs(solo.data[j + 2] - bg[2]) < 12;
                // nur Pixel im Inneren der Figur werten (Kantenpixel mischen sich mit dem Hintergrund)
                if (isBg(i) || isBg(i - 12) || isBg(i + 12) || isBg(i - 3 * 4 * solo.width) || isBg(i + 3 * 4 * solo.width)) continue;
                kidPx++;
                if (Math.abs(solo.data[i] - full.data[i]) + Math.abs(solo.data[i + 1] - full.data[i + 1]) + Math.abs(solo.data[i + 2] - full.data[i + 2]) > 40) diff++;
              }
              out.checkedPx += kidPx;
              const share = kidPx ? diff / kidPx : 1;
              out.worst = Math.max(out.worst, share);
              if (share > 0.01) out.occluded++;
            }
          }
        }
      }
      return out;
    }, { waves });
    const bad = res.missing + res.outside + res.overlap + res.occluded + errors.length;
    fail += bad;
    console.log(`${w}x${h}: s=${view.s.toFixed(2)} V=${Math.round(view.V)} H=${Math.round(view.H)} Schwenk=${Math.round(view.panX)} | Kinder ${res.kids} (Reihen ${JSON.stringify(res.rows)}), fehlend ${res.missing}, außerhalb ${res.outside}, überlappend ${res.overlap}, verdeckt ${res.occluded} (geprüfte Pixel ${res.checkedPx}, größter Abweichungsanteil ${(res.worst * 100).toFixed(1)} %), Fehler ${errors.length} => ${bad ? 'FEHLER' : 'ok'}`);
    if (out) { await p.evaluate(() => window.__step(0.02, -window.__play.e.view.panX, true)); await p.screenshot({ path: `${out}/pan-links-${w}x${h}.png`, timeout: 15000 }).catch(() => console.log('shot timeout')); await p.evaluate(() => window.__step(0.02, window.__play.e.view.panX, true)); await p.screenshot({ path: `${out}/pan-rechts-${w}x${h}.png`, timeout: 15000 }).catch(() => console.log('shot timeout')); }
    await b.close();
  }
  console.log(fail ? `GESAMT: ${fail} Fehler` : 'GESAMT: ok');
  process.exit(fail ? 1 : 0);
})();
