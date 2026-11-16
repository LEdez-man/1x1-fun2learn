// Bildschirmfotos aller Tageszeiten und des Schneesturms (Zwischenrunden über den echten Spielablauf).
// Aufruf: node tests/gallery.js <Bildordner>
const { open, start } = require('./helpers.js');
(async () => {
  const out = process.argv[2], scale = Number(process.argv[3] || 1);
  const { b, p } = await open({ width: 1280, height: 720 });
  await start(p, { need: 3 });
  const shot = (name) => p.screenshot({ path: `${out}/${name}.png`, timeout: 20000, animations: 'disabled' }).then(() => console.log('ok', name)).catch(() => console.log('TIMEOUT', name));
  const wave = () => p.evaluate(() => { const sc = window.__scenario; window.__play.state = 'idle'; sc.dismiss(); window.__step(1.2); sc.spawnWave(['35', '42', '36', '48', '45'].map((text, i) => ({ text, correct: i === 1 }))); window.__step(3, 0, true); });
  await p.evaluate(() => { document.getElementById('prompt').innerHTML = '6 × 7 = <span class="q">?</span>'; document.getElementById('prompt').classList.add('in'); });
  await wave(); await shot('tag-0-morgen');
  for (let st = 1; st <= 5; st++) {
    await p.evaluate((st) => {
      const pl = window.__play, s = pl.session, sc = window.__scenario;
      sc.dismiss(); window.__step(1.2);
      // Etappe abschließen: fünf Aufgaben als gelöst verbuchen, dann den echten Ablauf starten
      let need = st * 5 - s.done;
      for (const it of s.items) while (need > 0 && it.hits < s.need) { s.record(it, true, 900); need--; }
      pl._hud(); pl.state = 'outro'; pl.timer = 0.01; window.__step(0.05);
      window.__step(1.6, 0, true);
    }, st);
    if (st === 1 || st === 4) await shot(`sturm-${st}`);
    await p.evaluate(() => { let n = 0; while (window.__play.state === 'inter' && n++ < 100) window.__step(0.1); });
    await wave(); await shot(`tag-${st}-${await p.evaluate(() => window.__scenario.phase)}`);
  }
  await b.close();
})();
