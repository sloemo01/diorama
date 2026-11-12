/**
 * Seeded randomness for procedural dioramas.
 *
 * Rule 9 of the look contract says no Math.random. Procedural generation does
 * not break that rule, it moves the randomness to build time: every choice is
 * drawn from a stream that is a pure function of (seed, label), so the same
 * seed always builds the same diorama and the same t always draws the same
 * frame.
 *
 * Streams are forked by label (`rng.fork('lots')`, `rng.fork('scatter')`) so
 * adding one more tree does not reshuffle every building: each subsystem reads
 * its own stream, and a change in one leaves the others byte-identical.
 */

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (u) => {
  const k = clamp(u, 0, 1);
  return k * k * (3 - 2 * k);
};
export const smoothstep = (a, b, x) => smooth((x - a) / (b - a));
export const fract = (x) => x - Math.floor(x);
export function lerpAngle(a, b, k) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return a + d * k;
}

/** 32-bit FNV-1a with a murmur finaliser. Any number of parts, any types. */
export function hash32(...parts) {
  const s = parts.map(String).join('␟');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Deterministic 0..1 from any parts. */
export const hash = (...parts) => hash32(...parts) / 4294967296;

/**
 * A seeded stream (mulberry32). `fork(label)` gives an independent child stream.
 */
export function rng(seed, label = '') {
  let a = hash32(seed, label) || 0x9e3779b9;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    seed,
    label,
    next,
    float: (lo = 0, hi = 1) => lo + (hi - lo) * next(),
    /** Integer in [lo, hi], inclusive. */
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length) % arr.length],
    /** pairs: [[item, weight], ...] or {item: weight}. */
    weighted(pairs) {
      const list = Array.isArray(pairs) ? pairs : Object.entries(pairs);
      const total = list.reduce((n, [, w]) => n + Math.max(0, w), 0);
      if (total <= 0) return list[0]?.[0];
      let u = next() * total;
      for (const [item, w] of list) {
        u -= Math.max(0, w);
        if (u < 0) return item;
      }
      return list[list.length - 1][0];
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    fork: (child) => rng(seed, label + '/' + child),
  };
  return r;
}

/* ---- value noise ------------------------------------------------------------------------- */

function lattice(seed, ix, iz) {
  return hash32(seed, ix, iz) / 4294967296;
}

/** Smooth 2D value noise in 0..1. */
export function noise2(seed, x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = lattice(seed, ix, iz);
  const b = lattice(seed, ix + 1, iz);
  const c = lattice(seed, ix, iz + 1);
  const d = lattice(seed, ix + 1, iz + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uz);
}

/** Fractal noise, 0..1. */
export function fbm(seed, x, z, octaves = 4) {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(hash32(seed, 'o', i), x * f, z * f);
    norm += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return sum / norm;
}

/* ---- loop-closing time helpers ------------------------------------------------------------- */

/**
 * Angular frequency that closes on the loop: a whole number of cycles per loop,
 * as near to `hz` as possible. Every ambient oscillator uses this, so frame 0 and
 * frame `loop` are the same picture.
 */
export function loopFreq(loop, hz) {
  return (TAU * Math.max(1, Math.round(loop * hz))) / loop;
}

/** A period (seconds) that divides the loop a whole number of times. */
export function loopPeriod(loop, seconds) {
  return loop / Math.max(1, Math.round(loop / Math.max(1e-3, seconds)));
}

/** sin(w t + phase) with a loop-closing w. */
export const loopWave = (t, loop, hz, phase = 0) => Math.sin(loopFreq(loop, hz) * t + phase);

/** t wrapped into [0, loop), stable against float noise from adding whole loops. */
export function wrapT(loop, t) {
  const w = (((Number(t) || 0) % loop) + loop) % loop;
  const r = Math.round(w * 1e6) / 1e6;
  return r >= loop ? 0 : r;
}
