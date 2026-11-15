// Synthetische Hinweistöne (WebAudio) – keine Audiodateien nötig.
let ctx = null;
let master = null;
let enabled = true;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, t0, dur, { type = 'sine', vol = 0.3, slide = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise(t0, dur, { vol = 0.3, freq = 1200, q = 0.7, type = 'lowpass' } = {}) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

const sounds = {
  correct(t) { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.22, { type: 'triangle', vol: 0.28 })); },
  wrong(t) { tone(196, t, 0.28, { type: 'sawtooth', vol: 0.16, slide: -70 }); tone(147, t + 0.05, 0.3, { type: 'square', vol: 0.08, slide: -40 }); },
  task(t) { tone(880, t, 0.12, { vol: 0.2 }); tone(1175, t + 0.11, 0.2, { vol: 0.2 }); },
  shot(t) { noise(t, 0.22, { vol: 0.5, freq: 900 }); tone(140, t, 0.12, { type: 'square', vol: 0.15, slide: -90 }); },
  throw(t) { noise(t, 0.16, { vol: 0.18, freq: 2500, type: 'bandpass', q: 1.2 }); },
  thud(t) { noise(t, 0.12, { vol: 0.35, freq: 500 }); },
  lock(t) { tone(660, t, 0.08, { type: 'square', vol: 0.12 }); },
  key(t) { tone(990, t, 0.04, { vol: 0.1 }); },
  miss(t) { tone(330, t, 0.18, { vol: 0.14, slide: -120 }); },
  gameover(t) { [392, 330, 262, 196].forEach((f, i) => tone(f, t + i * 0.18, 0.3, { type: 'triangle', vol: 0.25 })); },
  fanfare(t) { [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.25, { type: 'triangle', vol: 0.26 })); },
};

export const audio = {
  unlock() { ensure(); },
  setEnabled(v) { enabled = v; },
  play(name) {
    if (!enabled) return;
    const c = ensure();
    if (c && sounds[name]) sounds[name](c.currentTime + 0.005);
  },
};
