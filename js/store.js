// Speicherung von Profilen, Lernstand und Rundenhistorie.
// Ein statisches Browserspiel kann nicht in das Repository schreiben; die Daten
// liegen daher im localStorage des Browsers und lassen sich als JSON-Datei
// exportieren/importieren (Format: data/profile.schema.json).

const LS_KEY = 'fun2learn.1x1.v1';
export const SCHEMA_VERSION = 1;
const MAX_SESSIONS = 60;

export const DEFAULT_SETTINGS = {
  range: 'small', pool: 'king', rows: [2], mode: 1, scenario: 'turkey',
  need: 3, tempo: 1, lead: true, typeTimeout: 3, sound: true, round: 0,
};

function newProfile(name) {
  return {
    schema: SCHEMA_VERSION,
    id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    name, created: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    facts: {},                       // "7x8": { mul:{c,w,ms}, div:{…}, type:{…}, last }
    custom: { small: [], big: [] },  // Lernraster-Auswahl
    recommended: { range: 'small', keys: [] },
    sessions: [],
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY));
    if (raw && raw.profiles && Object.keys(raw.profiles).length) return raw;
  } catch { /* leer oder defekt → neu anlegen */ }
  const p = newProfile('Spieler 1');
  return { schema: SCHEMA_VERSION, active: p.id, profiles: { [p.id]: p } };
}

let db = load();

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch { /* Speicher gesperrt/voll */ }
}

export const store = {
  get profile() { return db.profiles[db.active] || Object.values(db.profiles)[0]; },
  get profiles() { return Object.values(db.profiles); },
  save,
  select(id) { if (db.profiles[id]) { db.active = id; save(); } },
  add(name) {
    const p = newProfile(name.trim().slice(0, 24) || 'Spieler');
    db.profiles[p.id] = p; db.active = p.id; save();
    return p;
  },
  remove(id) {
    if (Object.keys(db.profiles).length < 2) return;
    delete db.profiles[id];
    if (db.active === id) db.active = Object.keys(db.profiles)[0];
    save();
  },

  recordAnswer(k, op, ok, ms) {
    const f = (this.profile.facts[k] ||= {});
    const s = (f[op] ||= { c: 0, w: 0, ms: 0 });
    if (ok) { s.c++; s.ms += Math.round(ms); } else s.w++;
    f.last = new Date().toISOString();
  },

  addSession(result, meta) {
    const p = this.profile;
    p.sessions.push({ ...meta, ...result });
    if (p.sessions.length > MAX_SESSIONS) p.sessions.splice(0, p.sessions.length - MAX_SESSIONS);
    save();
  },

  exportProfile() {
    return JSON.stringify(this.profile, null, 2);
  },
  importProfile(text) {
    const p = JSON.parse(text);
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || typeof p.facts !== 'object') {
      throw new Error('Keine gültige Profildatei');
    }
    const base = newProfile(p.name);
    const merged = {
      ...base, ...p, id: base.id,
      settings: { ...DEFAULT_SETTINGS, ...(p.settings || {}) },
      custom: { small: [], big: [], ...(p.custom || {}) },
      recommended: p.recommended || base.recommended,
      sessions: Array.isArray(p.sessions) ? p.sessions : [],
    };
    db.profiles[merged.id] = merged; db.active = merged.id; save();
    return merged;
  },
};
