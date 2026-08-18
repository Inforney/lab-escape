// Efectos de sonido sintetizados con la Web Audio API.
// No requiere archivos de audio: se generan en el navegador.
let ctx = null;
let habilitado = true;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tono(freq, dur, tipo = 'sine', vol = 0.2, cuando = 0) {
  if (!habilitado) return;
  const a = ac();
  const t0 = a.currentTime + cuando;
  const osc = a.createOscillator();
  const gan = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);
  gan.gain.setValueAtTime(0.0001, t0);
  gan.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gan.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gan).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

let ambiente = null; // nodos del drone ambiental

export const SFX = {
  toggle(v) {
    habilitado = v;
    if (!v) this.ambienteOff();
  },
  get habilitado() {
    return habilitado;
  },
  // Drone ambiental de laboratorio (loop continuo y sutil).
  ambienteOn() {
    if (!habilitado || ambiente) return;
    const a = ac();
    const g = a.createGain();
    g.gain.value = 0.05;
    g.connect(a.destination);
    const o1 = a.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 55;
    const o2 = a.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = 82.5;
    // LFO que modula el volumen (respiración del ambiente)
    const lfo = a.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = a.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    o1.start();
    o2.start();
    lfo.start();
    ambiente = { o1, o2, lfo, g };
  },
  ambienteOff() {
    if (!ambiente) return;
    try {
      ambiente.o1.stop();
      ambiente.o2.stop();
      ambiente.lfo.stop();
    } catch (e) {}
    ambiente = null;
  },
  doorSlide() {
    if (!habilitado) return;
    const a = ac();
    const t0 = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.8);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + 0.95);
  },
  heartbeat() {
    tono(60, 0.12, 'sine', 0.22);
    tono(55, 0.14, 'sine', 0.2, 0.18);
  },
  click() {
    tono(520, 0.08, 'triangle', 0.15);
  },
  hover() {
    tono(680, 0.05, 'sine', 0.06);
  },
  pick() {
    tono(660, 0.1, 'square', 0.12);
    tono(880, 0.12, 'square', 0.12, 0.08);
  },
  ok() {
    tono(523, 0.12, 'sine', 0.18);
    tono(659, 0.12, 'sine', 0.18, 0.1);
    tono(784, 0.2, 'sine', 0.18, 0.2);
  },
  error() {
    tono(180, 0.25, 'sawtooth', 0.18);
    tono(140, 0.3, 'sawtooth', 0.16, 0.05);
  },
  unlock() {
    tono(392, 0.1, 'square', 0.15);
    tono(523, 0.1, 'square', 0.15, 0.1);
    tono(784, 0.25, 'square', 0.18, 0.2);
    tono(1047, 0.3, 'square', 0.18, 0.35);
  },
  tick() {
    tono(1200, 0.03, 'square', 0.05);
  },
  alarma() {
    tono(300, 0.4, 'sawtooth', 0.2);
    tono(300, 0.4, 'sawtooth', 0.2, 0.5);
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tono(f, 0.25, 'triangle', 0.2, i * 0.13)
    );
  },
};
