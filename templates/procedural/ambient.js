/**
 * Ambient life: the day-night cycle, weather, birds, smoke, water glints, ducks,
 * boats, and the landmark machines (windmill sails, lighthouse beam, fountain,
 * campfire).
 *
 * Every function here is a closed form in t. Nothing integrates. Every periodic
 * motion uses a period that divides the loop a whole number of times
 * (`loopFreq`, `loopPeriod`), so the frame at t = 0 and the frame at t = loop
 * are the same picture, and a seek anywhere in the loop is exact. A falling
 * snowflake is `top - H * fract(t / P + phase)`, not `y -= v * dt`.
 */
import { rng as makeRng, clamp, lerp, smooth, smoothstep, fract, loopFreq, loopPeriod, TAU } from './rng.js';
import { K, kindOf, centre, inside, WATER_Y, groundAt } from './layout.js';

/* ---- sky --------------------------------------------------------------------------------- */

const hexLerp = (a, b, k) => {
  const ch = (x, s) => (x >> s) & 255;
  const m = (s) => Math.round(lerp(ch(a, s), ch(b, s), clamp(k, 0, 1)));
  return (m(16) << 16) | (m(8) << 8) | m(0);
};

/**
 * Sun height `e` in -1..1 over the loop. 'cycle' runs morning -> noon -> dusk ->
 * night -> dawn once per loop; the fixed modes hold one light.
 */
export function sunHeight(plan, t) {
  if (plan.time === 'day') return 0.9;
  if (plan.time === 'dusk') return 0.1;
  if (plan.time === 'night') return -0.75;
  const u = t / plan.loop;
  return Math.sin(TAU * (u + 0.08)) + 0.45;
}

/** All the light in the scene at second t, as plain numbers. */
export function skyAt(plan, t) {
  const e = sunHeight(plan, t);
  const night = smoothstep(0.12, -0.4, e);
  const golden = smoothstep(0.6, 0.12, e) * (1 - night);
  const wet = plan.weather === 'rain' ? 1 : plan.weather === 'snow' ? 0.5 : 0;
  const u = plan.time === 'cycle' ? t / plan.loop : 0.3;
  const el = lerp(0.12, 1.02, smoothstep(-0.1, 1.2, e));
  // Periodic in the loop (one swing east to west and back), so the shadows close on the seam.
  const az = 2.29 + (plan.time === 'cycle' ? Math.sin(TAU * (u + 0.08)) * 0.55 : 0);
  const dir = [Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)];
  // At night the "sun" is the moon: high, cool and weak, from the same side.
  const moon = [Math.cos(2.0) * 0.6, 0.8, Math.sin(2.0) * 0.6];
  const k = night;
  const sunDir = dir.map((v, i) => lerp(v, moon[i], k));
  let sunColor = hexLerp(0xfff8ee, 0xffb36b, golden);
  sunColor = hexLerp(sunColor, 0x9fb8e8, night);
  const sunI = (lerp(3.3, 2.2, golden) * (1 - night) + 0.85 * night) * (1 - wet * 0.45);
  let hemiSky = hexLerp(0xd6ecf6, 0xffd2b0, golden);
  hemiSky = hexLerp(hemiSky, 0x4d68a8, night);
  hemiSky = hexLerp(hemiSky, 0xc8d0d8, wet * 0.6 * (1 - night));
  const hemiGround = hexLerp(0x6f6a60, 0x23224a, night);
  const hemiI = lerp(0.26, 0.9, night) + wet * 0.25 * (1 - night);
  const fillI = lerp(0.46, 0.28, night) * (1 - wet * 0.3);
  const fillColor = hexLerp(0xa9cbe2, 0x6a7fd6, night);
  // Lamps come on before full dark; each building has its own threshold.
  const lamps = smoothstep(0.42, -0.05, e) * (plan.time === 'day' ? 0 : 1);
  return { e, night, golden, wet, sun: { dir: sunDir, color: sunColor, intensity: sunI }, hemi: { sky: hemiSky, ground: hemiGround, intensity: hemiI },
    fill: { color: fillColor, intensity: fillI }, lamps };
}

/* ---- weather ----------------------------------------------------------------------------- */

const WEATHER = {
  rain: { n: 260, top: 6.5, speed: 8.5, size: [0.02, 0.32, 0.02], tone: 'water1' },
  snow: { n: 230, top: 6.0, speed: 0.75, size: [0.06, 0.06, 0.06], tone: 'snow' },
  petals: { n: 90, top: 5.5, speed: 0.55, size: [0.07, 0.015, 0.05], tone: 'pink' },
  leaves: { n: 70, top: 5.5, speed: 0.7, size: [0.08, 0.015, 0.06], tone: 'leaf0' },
  fireflies: { n: 46, top: 1.6, speed: 0, size: [0.05, 0.05, 0.05], tone: 'lampHot' },
};

export function makeWeather(plan, layout, seed) {
  const W = WEATHER[plan.weather];
  if (!W) return { kind: plan.weather, tone: null, size: null, particles: [] };
  const r = makeRng(seed, 'weather');
  const { hx, hz } = layout.grid;
  const particles = [];
  for (let i = 0; i < W.n; i++) {
    const x = r.float(-hx + 0.3, hx - 0.3), z = r.float(-hz + 0.3, hz - 0.3);
    const ground = groundAt(layout.grid, x, z);
    const H = Math.max(0.6, Math.min(W.top, skyCeiling(layout, x, z)) - ground + 0.5);
    const period = W.speed ? loopPeriod(plan.loop, H / (W.speed * r.float(0.85, 1.15))) : loopPeriod(plan.loop, r.float(5, 9));
    particles.push({ x, z, ground, H, period, phase: r.next(), ph2: r.float(0, TAU), tone: plan.weather === 'petals' ? r.pick(['pink', 'paper', 'pink']) : plan.weather === 'leaves' ? r.pick(['leaf0', 'leaf1', 'mustard']) : W.tone });
  }
  return { kind: plan.weather, tone: W.tone, size: W.size, particles };
}

/**
 * How high something may fly at (x, z) and still be drawn over the slab, not over
 * the paper. At the locked 33 degree elevation a point at height y rises on screen
 * by y cos 33; it stays inside the slab's silhouette while the slab behind it (along
 * the view direction) is longer than that: y < tan 33 * sqrt 2 * min(x + hx, z + hz).
 * Rain, snow and birds keep under this ceiling, so the paper stays empty (rule 10).
 */
export function skyCeiling(layout, x, z) {
  const { hx, hz } = layout.grid;
  return 0.6494 * Math.SQRT2 * Math.max(0, Math.min(x + hx, z + hz));
}

/** One particle at second t: position, spin and scale (0 = hidden). */
export function particleAt(plan, w, p, t) {
  const L = plan.loop;
  if (w.kind === 'fireflies') {
    const sky = plan._skyCache?.(t) ?? skyAt(plan, t);
    const a = loopFreq(L, 1 / p.period) * t + p.ph2;
    const b = loopFreq(L, 1.7 / p.period) * t + p.ph2 * 1.3;
    const blink = Math.max(0, Math.sin(loopFreq(L, 0.4 + p.phase * 0.3) * t + p.ph2 * 3));
    return { x: p.x + Math.sin(a) * 0.5, y: p.ground + 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(b)), z: p.z + Math.cos(b) * 0.4, rx: 0, ry: 0, s: sky.night * (blink > 0.25 ? 1 : 0) };
  }
  const f = fract(t / p.period + p.phase);
  const y = p.ground - 0.35 + p.H * (1 - f);
  if (w.kind === 'rain') return { x: p.x, y, z: p.z, rx: 0, ry: 0, s: 1 };
  const sway = loopFreq(L, 0.16) * t + p.ph2;
  const amp = w.kind === 'snow' ? 0.22 : 0.45;
  const spin = loopFreq(L, 0.5) * t + p.ph2;
  const sway2 = loopFreq(L, 0.11) * t + p.ph2 * 1.7;
  const spin2 = loopFreq(L, 0.35) * t + p.ph2;
  return { x: p.x + Math.sin(sway) * amp, y, z: p.z + Math.cos(sway2) * amp * 0.6, rx: w.kind === 'snow' ? 0 : spin, ry: spin2, s: 1 };
}

/* ---- birds, smoke, glints, ducks, boats -------------------------------------------------- */

export function makeBirds(plan, layout, seed) {
  const r = makeRng(seed, 'birds');
  const { hx, hz } = layout.grid;
  const n = r.int(3, 5);
  const c = layout.landmark ?? layout.plaza;
  const birds = [];
  for (let i = 0; i < n; i++) {
    const R = r.float(2.0, 4.0);
    const cx = clamp(c.x + r.float(-1.5, 1.5), -hx + R + 0.8, hx - R - 0.8);
    const cz = clamp(c.z + r.float(-1, 1), -hz + R * 0.7 + 0.8, hz - R * 0.7 - 0.8);
    let ceil = Infinity;
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU;
      ceil = Math.min(ceil, skyCeiling(layout, cx + Math.cos(a) * R * 1.12, cz + Math.sin(a) * R * 0.7));
    }
    birds.push({ cx, cz, R, h: Math.max(2.4, Math.min(r.float(3.8, 5.4), ceil - 0.5)), period: r.float(11, 17), dir: r.chance(0.5) ? 1 : -1, phase: r.float(0, TAU), tone: r.pick(['paper', 'paper2', 'ink']) });
  }
  return birds;
}

export function birdAt(plan, b, t) {
  const L = plan.loop;
  const a = b.phase + b.dir * loopFreq(L, 1 / b.period) * t;
  const x = b.cx + Math.cos(a) * b.R * (1 + 0.12 * Math.sin(2 * a));
  const z = b.cz + Math.sin(a) * b.R * 0.7;
  const y = b.h + 0.35 * Math.sin(3 * a);
  const dx = -Math.sin(a) * b.dir, dz = Math.cos(a) * 0.7 * b.dir;
  const glide = 0.5 + 0.5 * Math.sin(loopFreq(L, 0.09) * t + b.phase);
  const flap = Math.sin(loopFreq(L, 3.1) * t + b.phase * 5) * (0.25 + 0.75 * (1 - glide));
  return { x, y, z, yaw: Math.atan2(dx, dz), bank: -b.dir * 0.3, flap };
}

export const PUFFS = 5;
export function puffAt(plan, em, k, t) {
  const P = loopPeriod(plan.loop, 3.4);
  const age = fract(t / P + k / PUFFS + em.phase);
  const s = (0.07 + age * 0.2) * (1 - smoothstep(0.72, 1, age));
  return { x: em.x + age * 0.45 + Math.sin(age * 6 + em.phase * 9) * 0.04, y: em.y + age * 1.15, z: em.z - age * 0.25, s, dark: age < 0.35 };
}

export function makeGlints(plan, layout, seed) {
  const r = makeRng(seed, 'glints');
  const g = layout.grid;
  const wet = [];
  for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) if (kindOf(g, i, k) === K.WATER) wet.push([i, k]);
  return r.shuffle(wet).slice(0, Math.min(36, Math.ceil(wet.length / 8))).map(([i, k]) => {
    const c = centre(g, i, k);
    return { x: c.x + r.float(-0.2, 0.2), z: c.z + r.float(-0.2, 0.2), hz: r.float(0.15, 0.45), phase: r.float(0, TAU), w: r.float(0.2, 0.5) };
  });
}
export function glintAt(plan, gl, t) {
  const v = Math.sin(loopFreq(plan.loop, gl.hz) * t + gl.phase);
  return Math.max(0, v) ** 6;
}

export function makeDucks(plan, layout, seed) {
  const r = makeRng(seed, 'ducks');
  const g = layout.grid;
  const ducks = [];
  const open = [];
  for (let k = 2; k < g.nz - 2; k++) for (let i = 2; i < g.nx - 2; i++) {
    let all = true;
    for (let dk = -2; dk <= 2 && all; dk++) for (let di = -2; di <= 2 && all; di++) all = inside(g, i + di, k + dk) && kindOf(g, i + di, k + dk) === K.WATER;
    if (all) open.push([i, k]);
  }
  const n = Math.min(open.length ? r.int(2, 3) : 0, open.length);
  for (const [i, k] of r.shuffle(open)) {
    if (ducks.length >= n) break;
    const c = centre(g, i, k);
    if (ducks.some((d) => Math.hypot(d.cx - c.x, d.cz - c.z) < 1.2)) continue;
    ducks.push({ cx: c.x, cz: c.z, R: r.float(0.3, 0.55), period: r.float(9, 15), dir: r.chance(0.5) ? 1 : -1, phase: r.float(0, TAU) });
  }
  return ducks;
}
export function duckAt(plan, d, t) {
  const a = d.phase + d.dir * loopFreq(plan.loop, 1 / d.period) * t;
  return { x: d.cx + Math.cos(a) * d.R, y: WATER_Y, z: d.cz + Math.sin(a) * d.R, yaw: Math.atan2(-Math.sin(a) * d.dir, Math.cos(a) * d.dir),
    dip: Math.max(0, Math.sin(loopFreq(plan.loop, 0.11) * t + d.phase * 3)) ** 8 };
}

export function boatAt(plan, b, t) {
  const L = plan.loop;
  return { y: WATER_Y + 0.06 + 0.04 * Math.sin(loopFreq(L, 0.32) * t + b.seed * TAU), roll: 0.06 * Math.sin(loopFreq(L, 0.21) * t + b.seed * 9), pitch: 0.03 * Math.sin(loopFreq(L, 0.27) * t + b.seed * 4) };
}

/* ---- landmark machines -------------------------------------------------------------------- */

export const sailsAngle = (plan, t) => loopFreq(plan.loop, 0.11) * t;
export const beaconAngle = (plan, t) => loopFreq(plan.loop, 0.16) * t;

export const JETS = 4, DROPS = 7;
export function dropAt(plan, jet, j, k, t) {
  const P = loopPeriod(plan.loop, 1.25);
  const age = fract(t / P + k / DROPS + j * 0.13);
  const a = (j / JETS) * TAU + Math.PI / 4;
  const rr = jet.r * age;
  const y = jet.y + 0.55 * 4 * age * (1 - age) - age * (jet.y - jet.basin);
  return { x: jet.x + Math.sin(a) * rr, y, z: jet.z + Math.cos(a) * rr, s: 1 - smoothstep(0.85, 1, age) * 0.6 };
}

export const FLAMES = 5, EMBERS = 8;
export function flameAt(plan, f, k, t) {
  const L = plan.loop;
  const ph = k * 1.7;
  const a = (k / FLAMES) * TAU;
  const lick = 0.75 + 0.25 * Math.sin(loopFreq(L, 2.3 + k * 0.4) * t + ph) + 0.12 * Math.sin(loopFreq(L, 5.1) * t + ph * 2);
  return { x: f.x + Math.sin(a) * (k ? 0.12 : 0), y: f.y, z: f.z + Math.cos(a) * (k ? 0.12 : 0), h: (k ? 0.32 : 0.5) * lick, r: k ? 0.09 : 0.14, tone: k % 2 ? 'amber' : k ? 'lampHot' : 'red' };
}
export function emberAt(plan, f, k, t) {
  const P = loopPeriod(plan.loop, 1.9);
  const age = fract(t / P + k / EMBERS);
  return { x: f.x + Math.sin(k * 2.3 + age * 4) * 0.18 * age, y: f.y + 0.3 + age * 1.3, z: f.z + Math.cos(k * 1.7 + age * 3) * 0.18 * age, s: 1 - age };
}
export function fireLight(plan, t) {
  const L = plan.loop;
  return 0.8 + 0.2 * Math.sin(loopFreq(L, 3.3) * t) + 0.1 * Math.sin(loopFreq(L, 7.1) * t + 1.3);
}
