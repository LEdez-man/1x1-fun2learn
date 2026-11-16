// Truthahn-Skeet (2D): komplette Runde mit Etappen, Ballistik an/aus, Sichtbarkeit der Vögel.
// Aufruf: node tests/skeet.test.js [Bildordner]
const { open, start } = require('./helpers.js');

const problems = [];
const state = (p) => p.evaluate(() => {
  const pl = window.__play, s = pl.session, sc = window.__scenario;
  if (!sc) return { ended: true, done: s.done, total: s.total, state: 'ende' };
  return { state: pl.state, done: s.done, total: s.total, stage: s.stage, station: sc.station, fog: !!sc.storm, ended: pl.ended,
    banner: document.getElementById('stageBanner').classList.contains('in'), sub: document.getElementById('stageSub').textContent };
});
// Position des richtigen Vogels; lead = Vorhalt in Sekunden Flugzeit (0 = direkt auf den Rumpf zielen)
const target = (p, withLead) => p.evaluate((withLead) => {
  const sc = window.__scenario, e = window.__play.e;
  const t = sc.targets.find((t) => t.data.correct && t.hittable && t.t / t.dur > 0.2 && t.t / t.dur < 0.7);
  if (!t) return null;
  const v = (t.x1 - t.x0) / t.dur, flight = withLead ? sc._ballistics(t.center).flight : 0, drop = withLead ? sc._ballistics(t.center).drop : 0;
  const at = e.toScreen({ x: t.center.x + v * flight, y: t.center.y - drop });
  return { x: at.x, y: at.y, scale: t.scale };
}, withLead);
const click = async (p, k) => { await p.mouse.move(k.x, k.y); await p.mouse.down(); await p.mouse.up(); };
const fps = 0.02;

async function round(out) {
  const { b, p, errors } = await open({ width: 1280, height: 720 });
  await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('fun2learn.1x1.v1') || 'null'); if (st) localStorage.clear(); });
  await p.click('#optLead button[data-id="false"]');
  await start(p, { scenario: 'turkey', need: 2 });
  const inter = []; let shots = 0, s;
  const T0 = Date.now();
  for (let guard = 0; guard < 6000; guard++) {
    s = await state(p);
    if (s.ended || Date.now() - T0 > 400000) break;
    if (s.state === 'inter') {
      await p.evaluate(() => window.__step(1.6, undefined, true));
      const mid = await state(p);
      if (out) await p.screenshot({ path: `${out}/skeet-nebel-${inter.length + 1}.png`, animations: 'disabled', timeout: 20000 }).catch(() => {});
      let n = 0; while ((await state(p)).state === 'inter' && n++ < 100) await p.evaluate(() => window.__step(0.1));
      const after = await state(p);
      inter.push({ at: s.done, banner: mid.banner, fog: mid.fog, from: s.station, to: after.station, sub: mid.sub });
      continue;
    }
    const k = s.state === 'live' ? await target(p, false) : null;
    if (!k) { await p.evaluate(() => window.__step(0.2)); continue; }
    if (out && (shots === 0 || shots % 5 === 2)) { await p.evaluate(() => window.__step(0.02, undefined, true)); await p.screenshot({ path: `${out}/skeet-station-${s.station}.png`, animations: 'disabled', timeout: 20000 }).catch(() => {}); }
    await click(p, k); shots++;
    await p.evaluate(() => window.__step(0.1));
    if ((await state(p)).done === s.done) problems.push(`Runde: Schuss ${shots} ohne Treffer (Ballistik aus)`);
  }
  for (const i of inter) console.log('Zwischenrunde', JSON.stringify(i));
  if (inter.length !== 3) problems.push(`erwartet 3 Zwischenrunden, gefunden ${inter.length}`);
  inter.forEach((i, n) => {
    if (i.at !== (n + 1) * 5) problems.push(`Zwischenrunde ${n + 1} bei ${i.at} Lösungen`);
    if (!i.banner || !i.fog) problems.push(`Zwischenrunde ${n + 1}: Banner oder Nebel fehlt`);
    if (i.to <= i.from) problems.push(`Zwischenrunde ${n + 1}: Station unverändert`);
  });
  if (inter.length && inter[inter.length - 1].to !== 11) problems.push('letzte Etappe zeigt nicht die letzte Station');
  if (!s.ended || s.done !== s.total) problems.push(`Runde nicht beendet (${s.done}/${s.total})`);
  if (!(await p.evaluate(() => !document.getElementById('summary').hidden))) problems.push('Auswertung fehlt');
  if (errors.length) problems.push(`Runde: ${errors.length} Konsolenfehler`);
  console.log(`Runde: ${s.done}/${s.total} gelöst mit ${shots} Schüssen, ${inter.length} Zwischenrunden`);
  await b.close();
}

// Ballistik an: Mit Vorhalt muss jeder Schuss sitzen; direkt auf ferne Vögel gezielt geht er hinter dem Vogel durch.
async function ballistics() {
  const { b, p, errors } = await open({ width: 1280, height: 720 });
  await p.click('#optLead button[data-id="true"]');
  await start(p, { scenario: 'turkey', need: 5 });
  const res = { lead: [0, 0], direct: [0, 0] };
  for (let guard = 0; guard < 4000 && res.lead[1] < 10; guard++) {
    const s = await state(p);
    if (s.ended) break;
    const useLead = res.direct[1] >= 6;               // erst sechs Schüsse ohne Vorhalt auf ferne Vögel, dann zehn mit
    const k = s.state === 'live' ? await target(p, useLead) : null;
    if (!k || (!useLead && k.scale > 0.6)) { await p.evaluate(() => window.__step(0.15)); continue; }
    await click(p, k);
    await p.evaluate(() => window.__step(0.5));
    const hit = (await state(p)).done > s.done;
    const r = useLead ? res.lead : res.direct; r[1]++; if (hit) r[0]++;
  }
  console.log(`Ballistik an: mit Vorhalt ${res.lead[0]}/${res.lead[1]} Treffer, ohne Vorhalt auf ferne Vögel ${res.direct[0]}/${res.direct[1]}`);
  if (res.lead[1] < 10 || res.lead[0] !== res.lead[1]) problems.push('Ballistik: Schuss mit Vorhalt hat verfehlt');
  if (res.direct[1] < 6 || res.direct[0] === res.direct[1]) problems.push('Ballistik: ohne Vorhalt trifft trotzdem jeder Schuss auf ferne Vögel (oder Gegentest nicht gelaufen)');
  if (errors.length) problems.push(`Ballistik: ${errors.length} Konsolenfehler`);
  await b.close();
}

// Regeln spec 7.4.3 für fliegende Ziele: während des ganzen Flugs im Bild, nie überdeckt.
async function visibility() {
  for (const [w, h, waves] of [[1280, 720, 9], [1024, 768, 6], [2560, 1080, 6]]) {
    const { b, p, errors } = await open({ width: w, height: h });
    await start(p, { scenario: 'turkey', need: 3 });
    const r = await p.evaluate(({ waves, fps }) => {
      const sc = window.__scenario, e = window.__play.e, o = { samples: 0, outside: 0, overlap: 0, occluded: 0, worst: 0, px: 0, panX: e.view.panX };
      window.__play.state = 'idle';
      const grab = () => { e.app.renderer.render(e.app.stage); const c = document.createElement('canvas'); c.width = e.canvas.width; c.height = e.canvas.height; const g = c.getContext('2d'); g.drawImage(e.canvas, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
      const dpr = e.canvas.width / e.view.w;
      for (let n = 0; n < waves; n++) {
        sc.dismiss(); window.__step(1.5);
        const labels = n % 3 === 2 ? ['12×10', '17×8', '19×9'] : ['12', '48', '144', '7', '63'];
        sc.spawnWave(labels.map((text, i) => ({ text, correct: i === 0 })));
        for (let step = 0; step < 60 && !sc.waveDone(); step++) {
          window.__step(0.25);
          for (const cam of [-e.view.panX, e.view.panX]) {
            window.__step(fps * 0, cam);
            const k = sc.debugKids();
            o.samples += k.length;
            for (const q of k) if (q.fx0 < 0 || q.fx1 > e.view.w || q.fy0 < 0 || q.fy1 > e.view.h) o.outside++;
            for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (k[i].x0 < k[j].x1 && k[j].x0 < k[i].x1 && k[i].y0 < k[j].y1 && k[j].y0 < k[i].y1) o.overlap++;
            if (step % 6 === 3 && k.length) {
              sc.debugShow({ calm: true }); const full = grab();
              const front = e.layers.filter((l) => l.name === 'vorn' || l.name === 'flinte');
              front.forEach((l) => { l.c.visible = false; }); const back = grab();          // ohne die Ebenen vor den Vögeln
              sc.debugShow({ solo: true }); const solo = grab(); sc.debugShow({});
              const bg = [solo.data[0], solo.data[1], solo.data[2]];
              const isBg = (j) => Math.abs(solo.data[j] - bg[0]) + Math.abs(solo.data[j + 1] - bg[1]) + Math.abs(solo.data[j + 2] - bg[2]) < 12;
              for (const q of k) {
                let kid = 0, diff = 0, base = 0;
                for (let y = Math.ceil(q.y0 * dpr); y < q.y1 * dpr; y += 2) for (let x = Math.ceil(q.x0 * dpr); x < q.x1 * dpr; x += 2) {
                  const i = (y * solo.width + x) * 4;
                  if (isBg(i) || isBg(i - 12) || isBg(i + 12) || isBg(i - 12 * solo.width) || isBg(i + 12 * solo.width)) continue;
                  kid++;
                  const off = (im) => Math.abs(solo.data[i] - im.data[i]) + Math.abs(solo.data[i + 1] - im.data[i + 1]) + Math.abs(solo.data[i + 2] - im.data[i + 2]) > 40;
                  if (off(full)) diff++;
                  if (off(back)) base++;
                }
                o.px += kid; o.worst = Math.max(o.worst, kid ? diff / kid : 0);
                // Halbtransparente Kanten (Rumpf/Schild) weichen auch ohne Verdeckung ab (base). Gewertet wird,
                // was die vorderen Ebenen zusätzlich überdecken, sowie jede grobe Abweichung (anderer Vogel davor).
                if (kid && ((diff - base) / kid > 0.004 || diff / kid > 0.04)) o.occluded++;
              }
            }
          }
        }
      }
      return o;
    }, { waves, fps });
    const bad = r.outside + r.overlap + r.occluded + errors.length;
    console.log(`Sichtbarkeit ${w}x${h}: Schwenk ${Math.round(r.panX)}, ${r.samples} Stichproben, außerhalb ${r.outside}, überlappend ${r.overlap}, verdeckt ${r.occluded} (${r.px} Pixel, größte Abweichung ${(r.worst * 100).toFixed(1)} %) => ${bad ? 'FEHLER' : 'ok'}`);
    if (bad) problems.push(`Sichtbarkeit ${w}x${h}: ${bad} Verstöße`);
    await b.close();
  }
}

(async () => {
  const out = process.argv[2], only = process.argv[3];          // optional: nur 'runde', 'ballistik' oder 'sicht'
  if (!only || only === 'runde') await round(out);
  if (!only || only === 'ballistik') await ballistics();
  if (!only || only === 'sicht') await visibility();
  console.log(problems.length ? 'FEHLER:\n- ' + problems.join('\n- ') : 'ok');
  process.exit(problems.length ? 1 : 0);
})();
