// Komplette Runde Schneeballschlacht (10 Aufgaben × 3): richtige Kinder per Mausklick treffen,
// einmal absichtlich falsch werfen; prüft Etappen, Zwischenrunden, Balken und Auswertung.
// Aufruf: node tests/round.test.js [Bildordner]   (mit Bildordner werden Bildschirmfotos gespeichert)
const { open, start } = require('./helpers.js');
(async () => {
  const out = process.argv[2];
  const { b, p, errors } = await open({ width: 1280, height: 720 });
  const shot = async (path) => { if (!out) return; try { await p.screenshot({ path, timeout: 5000, animations: 'disabled' }); } catch (e) { console.log('!! Screenshot-Timeout', path.split('/').pop(), 'rAF/s:', await p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }))); } };
  await start(p, { need: 3 });
  const st = () => p.evaluate(() => { const pl = window.__play, s = pl.session, sc = window.__scenario; if (!sc) return { ended: true, done: s.done, total: s.total, state: 'ende' }; return { state: pl.state, done: s.done, total: s.total, stage: s.stage, stages: s.stageCount, phase: sc.phase, storm: !!sc.storm, ended: pl.ended, banner: document.getElementById('stageBanner').classList.contains('in'), info: document.getElementById('stageInfo').textContent, fill: document.getElementById('progressFill').style.width, ticks: document.querySelectorAll('#progressTicks i').length, ticksDone: document.querySelectorAll('#progressTicks i.done').length, extras: Object.fromEntries(Object.entries(sc.extras).map(([k, v]) => [k, +v.alpha.toFixed(2)])) }; });
  let s = await st(); console.log('start', JSON.stringify(s));
  const log = []; let inter = 0, shots = 0, wrongDone = false;
  const T0 = Date.now(); let lastKey = '', same = 0;
  for (let guard = 0; guard < 4000; guard++) {
    s = await st();
    const key = s.state + s.done; same = key === lastKey ? same + 1 : 0; lastKey = key;
    if (same === 400 || Date.now() - T0 > 500000) { console.log('!! hängt/Zeit', JSON.stringify(s), JSON.stringify(await p.evaluate(() => window.__scenario.targets.map(t => [t.row.id, t.state, t.data.correct, +t.k.toFixed(2), +t.delay.toFixed(2)])))); break; }
    if (s.ended) break;
    if (s.state === 'inter') {
      inter++;
      await p.evaluate(() => window.__step(1.7));                   // Mitte des Sturms
      const mid = await st();
      await shot(`${out}/inter-${inter}-sturm.png`);
      let n = 0; while ((await st()).state === 'inter' && n++ < 200) await p.evaluate(() => window.__step(0.1));
      const after = await st();
      log.push({ inter, doneAt: s.done, bannerMid: mid.banner, stormMid: mid.storm, phaseBefore: s.phase, phaseAfter: after.phase, extras: after.extras, info: after.info, ticksDone: after.ticksDone, bannerAfter: after.banner });
      continue;
    }
    if (s.state !== 'live') { await p.evaluate(() => window.__step(0.3)); continue; }
    // warten, bis das richtige Kind oben ist
    const k = await p.evaluate(() => { const sc = window.__scenario, e = window.__play.e; const t = sc.targets.find((t) => t.data.correct && t.state === 'up'); const w = sc.targets.find((t) => !t.data.correct && t.state === 'up'); const f = (t) => t && e.toScreen(t.center); return { ok: f(t), wrong: f(w), n: sc.targets.length }; });
    if (!k.ok) { await p.evaluate(() => window.__step(0.25)); continue; }
    if (inter === 1 && !wrongDone && k.wrong) {                    // einmal absichtlich falsch werfen
      wrongDone = true;
      await p.mouse.move(k.wrong.x, k.wrong.y); await p.mouse.down(); await p.mouse.up();
      await p.evaluate(() => window.__step(0.6));
      await shot(`${out}/falsch.png`);
      continue;
    }
    if (shots === 0) await shot(`${out}/phase-0.png`);
    await p.mouse.move(k.ok.x, k.ok.y); await p.mouse.down(); await p.mouse.up();
    shots++;
    await p.evaluate(() => window.__step(0.25));
    if (shots === 2) await shot(`${out}/wurf.png`);
    await p.evaluate(() => window.__step(0.3));
    if (shots === 2) await shot(`${out}/treffer.png`);
    const a = await st();
    if (a.state === 'live' && a.done === s.done) { console.log('!! Wurf ohne Treffer bei', JSON.stringify(k.ok)); errors.push('Wurf ohne Treffer'); }
  }
  for (const l of log) console.log(JSON.stringify(l));
  const problems = [];
  if (log.length !== 5) problems.push(`erwartet 5 Zwischenrunden, gefunden ${log.length}`);
  log.forEach((l, i) => {
    if (l.doneAt !== (i + 1) * 5) problems.push(`Zwischenrunde ${i + 1} bei ${l.doneAt} statt ${(i + 1) * 5} Lösungen`);
    if (!l.bannerMid || !l.stormMid) problems.push(`Zwischenrunde ${i + 1}: Banner oder Sturm fehlt`);
    if (l.phaseAfter <= l.phaseBefore) problems.push(`Zwischenrunde ${i + 1}: Tageszeit unverändert`);
    if (l.ticksDone !== i + 1) problems.push(`Zwischenrunde ${i + 1}: ${l.ticksDone} Etappenmarken erreicht`);
  });
  s = await st();
  console.log('ende', JSON.stringify({ ended: s.ended, done: s.done, total: s.total, shots, inter }), 'summary sichtbar:', await p.evaluate(() => !document.getElementById('summary').hidden), await p.textContent('#sumRate'));
  await shot(`${out}/auswertung.png`);
  if (!s.ended || s.done !== s.total) problems.push('Runde nicht vollständig beendet');
  if (errors.length) problems.push(`${errors.length} Fehler in der Konsole`);
  console.log(problems.length ? 'FEHLER:\n- ' + problems.join('\n- ') : 'ok');
  await b.close();
  process.exit(problems.length ? 1 : 0);
})();
