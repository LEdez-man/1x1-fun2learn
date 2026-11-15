// Aufgabenlogik: Zahlenräume, Aufgabenpools, Distraktoren.
// Eine "Aufgabe" (Fakt) ist ein Faktorenpaar a × b mit Schlüssel "axb".

export const RANGES = {
  small: { id: 'small', label: 'Kleines 1×1', aMin: 1, aMax: 10 },
  big: { id: 'big', label: 'Großes 1×1', aMin: 11, aMax: 20 },
};

// Königsaufgaben: Reihen, die schnell gelernt sind und als Stützpunkte
// für Ableitungen dienen (1er, 2er, 5er, 10er).
export const KING = [1, 2, 5, 10];

export const key = (a, b) => `${a}x${b}`;
export const parse = (k) => {
  const [a, b] = k.split('x').map(Number);
  return { a, b, key: k };
};

export function allFacts(rangeId) {
  const r = RANGES[rangeId];
  const out = [];
  for (let a = r.aMin; a <= r.aMax; a++) for (let b = 1; b <= 10; b++) out.push(key(a, b));
  return out;
}

export function isKing(k, rangeId) {
  const { a, b } = parse(k);
  return rangeId === 'small' ? KING.includes(a) || KING.includes(b) : KING.includes(b);
}

// Empirisch fehleranfällige Aufgaben (Problemgrößeneffekt: große Faktoren,
// keine Stützpunkt-Reihe). Quadrataufgaben sind bewusst nur teilweise enthalten.
export function isHard(k, rangeId) {
  const { a, b } = parse(k);
  if (rangeId === 'small') {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    if (lo >= 6 && hi <= 9) return true;            // 6×6 … 9×9
    return (lo === 3 || lo === 4) && hi >= 7 && hi <= 9; // 3×7 … 4×9
  }
  return [13, 14, 16, 17, 18, 19].includes(a) && b >= 6 && b <= 9;
}

export function rowFacts(rangeId, rows) {
  return allFacts(rangeId).filter((k) => {
    const { a, b } = parse(k);
    return rangeId === 'small' ? rows.includes(a) || rows.includes(b) : rows.includes(a);
  });
}

// Fehlerquote einer Aufgabe über alle Aufgabentypen.
export function factStats(facts, k) {
  const f = facts[k];
  let c = 0, w = 0, ms = 0;
  if (f) for (const op of ['mul', 'div', 'type']) if (f[op]) { c += f[op].c; w += f[op].w; ms += f[op].ms; }
  const n = c + w;
  return { c, w, n, rate: n ? c / n : null, avgMs: c ? ms / c : null };
}

// Schwächewert: hoch = sollte geübt werden.
export function weakness(facts, k) {
  const s = factStats(facts, k);
  if (!s.n) return 0.35;                            // ungesehen: mittlere Priorität
  let v = 1 - s.rate;
  if (s.avgMs && s.avgMs > 4000) v += 0.15;         // richtig, aber langsam
  if (s.n < 3) v += 0.1;                            // wenig Daten
  return v;
}

export function errorFacts(facts, rangeId, max = 10) {
  return allFacts(rangeId)
    .map((k) => ({ k, s: factStats(facts, k) }))
    .filter((x) => x.s.w > 0)
    .sort((x, y) => (x.s.rate - y.s.rate) || (y.s.w - x.s.w))
    .slice(0, max)
    .map((x) => x.k);
}

// Automatische Zusammenstellung durch die Spiellogik.
export function autoFacts(facts, rangeId, max = 10) {
  const scored = allFacts(rangeId).map((k) => ({
    k,
    v: weakness(facts, k) + (isHard(k, rangeId) ? 0.12 : 0) + Math.random() * 0.05,
  }));
  scored.sort((x, y) => y.v - x.v);
  return scored.slice(0, max).map((x) => x.k);
}

export const POOLS = [
  { id: 'mixed', label: 'Durcheinander', hint: 'alle Aufgaben gemischt' },
  { id: 'king', label: 'Königsaufgaben', hint: '1er-, 2er-, 5er- und 10er-Reihe' },
  { id: 'rest', label: 'Übrige Reihen', hint: 'alles außer Königsaufgaben' },
  { id: 'rows', label: 'Einzelne Reihen', hint: 'Reihen selbst wählen' },
  { id: 'hard', label: 'Schwierige Aufgaben', hint: 'die bekannten Stolpersteine' },
  { id: 'errors', label: 'Meine Fehler', hint: 'was zuletzt oft danebenging' },
  { id: 'custom', label: 'Lernraster', hint: 'eigene Auswahl im Raster' },
  { id: 'auto', label: 'Trainer-Auswahl', hint: 'das Spiel stellt zusammen' },
];

export function buildPool(poolId, rangeId, profile, rows = []) {
  const all = allFacts(rangeId);
  switch (poolId) {
    case 'king': return all.filter((k) => isKing(k, rangeId));
    case 'rest': return all.filter((k) => !isKing(k, rangeId));
    case 'rows': return rowFacts(rangeId, rows);
    case 'hard': return all.filter((k) => isHard(k, rangeId));
    case 'errors': {
      const e = errorFacts(profile.facts, rangeId);
      return e.length >= 3 ? e : autoFacts(profile.facts, rangeId);
    }
    case 'custom': return (profile.custom[rangeId] || []).slice();
    case 'auto': return autoFacts(profile.facts, rangeId);
    default: return all;
  }
}

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
export { shuffle };

// Konkrete Fragestellung zu einem Fakt.
// op 'mul'  : "a × b = ?"  → Ergebnis
// op 'div'  : "p : a = ?"  → anderer Faktor
export function makeQuestion(k, op) {
  const { a, b } = parse(k);
  const p = a * b;
  if (op === 'div') {
    const byA = Math.random() < 0.5;
    const d = byA ? a : b, ans = byA ? b : a;
    return { key: k, op, text: `${p} : ${d}`, answer: ans, full: `${p} : ${d} = ${ans}`, a, b, divisor: d };
  }
  return { key: k, op: 'mul', text: `${a} × ${b}`, answer: p, full: `${a} × ${b} = ${p}`, a, b };
}

// Plausible falsche Ergebnisse: Nachbarn in der Reihe, Zehnerfehler,
// Ziffernvertauschung, ±1/±2. Rein zufällige Zahlen wären zu leicht auszuschließen.
export function distractors(q, n) {
  const set = new Set();
  const add = (v) => { if (Number.isInteger(v) && v > 0 && v !== q.answer) set.add(v); };
  const cand = [];
  if (q.op === 'mul') {
    const { a, b, answer: p } = q;
    cand.push(a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 10, p - 10, p + 1, p - 1, p + 2, p - 2, a + b);
    const s = String(p);
    if (s.length === 2 && s[0] !== s[1] && s[1] !== '0') cand.push(Number(s[1] + s[0]));
  } else {
    const x = q.answer;
    cand.push(x + 1, x - 1, x + 2, x - 2, q.divisor, x + 10 > 20 ? x - 3 : x + 3);
  }
  shuffle(cand).forEach(add);
  let guard = 0;
  while (set.size < n && guard++ < 200) add(q.answer + Math.floor(Math.random() * 13) - 6);
  return shuffle([...set]).slice(0, n);
}
