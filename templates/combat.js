/**
 * Deterministic combat helpers for a diorama.
 *
 * Everything here is pure: no Date, no Math.random, no state carried between
 * frames. Feed the same t and seed and you get the same frame.
 */

export const DT = 1 / 40;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const pulse = (t, t0, tau) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));
export const win = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
export const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
export const easeInOut = (u) => u * u * (3 - 2 * u);

/** Decaying oscillation; +1 at t0, settles to 0. */
export const spring = (t, t0, freq = 9, damp = 6) => {
  const a = t - t0;
  return a < 0 ? 0 : Math.exp(-damp * a) * Math.cos(freq * a);
};

/** Stable 0..1 hash for per-actor phase offsets. */
export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const phase = (i, turns = 1) => hash(i) * Math.PI * 2 * turns;

/** Stagger a group so they do not move like a chorus line. */
export const stagger = (i, step = 0.18, base = 0) => base + i * step;

/** Absolute event times, sorted once. */
export function finalize(events) {
  events.sort((a, b) => a.t - b.t);
  return events;
}

/** The last event of a kind at or before t. */
export function lastEvent(events, kind, t) {
  let found = null;
  for (const e of events) {
    if (e.t > t) break;
    if (e.kind === kind) found = e;
  }
  return found;
}

/** All events of a kind in [t0, t1). */
export function eventsIn(events, kind, t0, t1) {
  return events.filter((e) => e.kind === kind && e.t >= t0 && e.t < t1);
}

/**
 * Species death grammar. Counts are the minimum; add one signature piece if
 * the species carries a weapon or trophy.
 */
export function deathPieces(type, seed = 0) {
  const n = 1 + Math.floor(hash(seed + 3) * 3);
  switch (type) {
    case 'goblin':
      return { debris: 'cloth', count: 2 + n, dropped: 'knife', stain: 'blood' };
    case 'orc':
      return { debris: 'iron', count: 3 + n, dropped: 'sword', stain: 'blood' };
    case 'slime':
      return { debris: 'goo', count: 5 + n, dropped: null, stain: 'goo' };
    case 'flyer':
      return { debris: 'feather', count: 4 + n, dropped: null, stain: 'feather' };
    case 'human':
      return { debris: 'cloth', count: 3 + n, dropped: 'tool', stain: 'blood' };
    case 'boss':
      return { debris: 'iron', count: 6 + n, dropped: 'club', stain: 'scorch' };
    default:
      // Never default to a grey dust puff; cloth at least reads as a body.
      return { debris: 'cloth', count: 3 + n, dropped: null, stain: 'dust' };
  }
}

/**
 * A fixed-flight projectile position. `u` is 0 at launch, 1 at impact.
 * `arc` is the height gained at mid-flight, in metres.
 */
export function projectileAt(from, to, u, arc = 0) {
  const k = clamp(u, 0, 1);
  return {
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k + Math.sin(k * Math.PI) * arc,
    z: from.z + (to.z - from.z) * k,
  };
}

/** A boss contact pose weight: telegraph, snap, recover. */
export function contactWeight(t, hitT, wind = 0.45, recover = 0.4) {
  if (t < hitT - wind || t > hitT + recover) return 0;
  if (t < hitT) {
    const u = (t - (hitT - wind)) / wind;
    return 1 - Math.pow(1 - u, 3); // accelerating wind-up
  }
  return 1 - (t - hitT) / recover; // follow-through then rest
}
