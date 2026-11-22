/* Board sounds. Piece hits are real recordings of wooden chess pieces,
   trimmed from CC0 (public domain) clips on Freesound:
     "Chess Pieces Move (Close)" by JJTaynos, freesound.org/s/733927
   The start and game-over chimes are synthesised with the Web Audio API. */

const BASE = "/blog/arpeggio/sounds";
const CLIPS = ["move", "capture", "castle-1", "castle-2", "check"] as const;
type Clip = (typeof CLIPS)[number];

let ctx: AudioContext | null = null;
const buffers: Partial<Record<Clip, AudioBuffer>> = {};

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    const c = ctx;
    for (const name of CLIPS)
      fetch(`${BASE}/${name}.mp3`)
        .then((r) => r.arrayBuffer())
        .then((b) => c.decodeAudioData(b))
        .then((buf) => (buffers[name] = buf))
        .catch(() => {});
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function clip(name: Clip, at = 0, gain = 1) {
  const c = audio();
  const buf = buffers[name];
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g).connect(c.destination);
  src.start(c.currentTime + at);
}

function tone(at: number, freq: number, length: number, gain = 0.12, type: OscillatorType = "sine") {
  const c = audio();
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

export const sounds = {
  /** Call from a click: browsers only allow audio after one, and it starts loading the clips. */
  unlock: () => void audio(),
  move: () => clip("move", 0, 0.8),
  capture: () => clip("capture"),
  castle: () => {
    clip("castle-1", 0, 0.8);
    clip("castle-2", 0.11, 0.8);
  },
  check: () => {
    clip("check");
    tone(0.02, 880, 0.18, 0.06, "triangle");
  },
  start: () => {
    tone(0, 523.25, 0.25);
    tone(0.12, 783.99, 0.35);
  },
  end: () => {
    tone(0, 783.99, 0.25);
    tone(0.14, 659.25, 0.25);
    tone(0.28, 523.25, 0.5);
  },
};
