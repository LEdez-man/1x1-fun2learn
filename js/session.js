// Eine Übungsrunde: höchstens 10 Aufgaben, jede muss `need`-mal im ersten
// Versuch richtig beantwortet werden. Fehler führen zu früherer Wiedervorlage.
import { parse, weakness, shuffle } from './tasks.js';

export const MAX_ITEMS = 10;

export class Session {
  constructor({ pool, need, mode, facts }) {
    this.need = need;
    this.mode = mode;            // 1 Ergebnis treffen, 2 Eintippen, 3 Division, 4 gemischt
    this.started = Date.now();
    let keys = [...new Set(pool)];
    if (keys.length > MAX_ITEMS) {
      // gewichtete Auswahl: schwache Aufgaben bevorzugt
      keys = keys
        .map((k) => ({ k, v: weakness(facts, k) + Math.random() * 0.6 }))
        .sort((x, y) => y.v - x.v)
        .slice(0, MAX_ITEMS)
        .map((x) => x.k);
    }
    this.items = shuffle(keys).map((k) => ({
      ...parse(k), hits: 0, correct: 0, wrong: 0, ms: 0, boost: 0, lastAsked: -99,
    }));
    this.turn = 0;
    this.gameOver = false;
  }

  get open() { return this.items.filter((i) => i.hits < this.need); }
  get finished() { return this.gameOver || this.open.length === 0; }
  get progress() {
    const done = this.items.reduce((s, i) => s + Math.min(i.hits, this.need), 0);
    return done / (this.items.length * this.need);
  }

  // Aufgabentyp für die nächste Batterie.
  nextOp() {
    if (this.mode === 2) return 'type';
    if (this.mode === 3) return 'div';
    if (this.mode === 4) return ['mul', 'div', 'type'][Math.floor(Math.random() * 3)];
    return 'mul';
  }

  // Wählt n verschiedene offene Aufgaben; zuletzt gestellte werden gemieden,
  // fehlerhafte nach kurzer Pause bevorzugt (Leitner-Prinzip in Kurzform).
  next(n = 1) {
    this.turn++;
    const open = this.open;
    const scored = open.map((i) => {
      const gap = this.turn - i.lastAsked;
      let v = Math.random();
      if (gap <= 1 && open.length > n) v -= 5;         // nicht direkt wiederholen
      if (i.boost > 0 && gap >= 2) v += 2;             // Fehler kommt bald wieder
      v += (this.need - i.hits) * 0.15;
      return { i, v };
    }).sort((x, y) => y.v - x.v);
    const picked = scored.slice(0, n).map((x) => x.i);
    picked.forEach((i) => { i.lastAsked = this.turn; });
    return picked;
  }

  record(item, ok, ms) {
    if (ok) {
      item.correct++; item.hits++; item.ms += ms;
      if (item.boost > 0) item.boost--;
    } else {
      item.wrong++; item.boost = 2;
    }
  }

  results() {
    const items = this.items.map((i) => {
      const n = i.correct + i.wrong;
      return {
        key: i.key, a: i.a, b: i.b, correct: i.correct, wrong: i.wrong,
        rate: n ? i.correct / n : null,
        avgMs: i.correct ? Math.round(i.ms / i.correct) : null,
      };
    });
    const c = items.reduce((s, i) => s + i.correct, 0);
    const w = items.reduce((s, i) => s + i.wrong, 0);
    return {
      date: new Date().toISOString(),
      durationSec: Math.round((Date.now() - this.started) / 1000),
      mode: this.mode, need: this.need, gameOver: this.gameOver,
      completed: !this.gameOver && this.open.length === 0,
      correct: c, wrong: w, rate: c + w ? c / (c + w) : 0, items,
    };
  }
}

// Empfehlung nach der Runde: Aufgaben mit Fehlern oder deutlich langsamer Antwort.
export function recommend(result) {
  const times = result.items.map((i) => i.avgMs).filter(Boolean).sort((a, b) => a - b);
  const median = times.length ? times[Math.floor(times.length / 2)] : 0;
  return result.items
    .filter((i) => i.rate === null || i.rate < 0.8 || (median && i.avgMs > median * 1.6 && i.avgMs > 3500))
    .sort((x, y) => (x.rate ?? 0) - (y.rate ?? 0))
    .map((i) => i.key);
}
