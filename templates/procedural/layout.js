/**
 * Layout: the slab as a grid of cells, and everything that stands on it.
 *
 *   terrain   terraced heightfield + one water body (coast, river, pond, lake)
 *   plaza     the square every road leads to, with the landmark
 *   lots      one per building, placed by scored candidates, never overlapping
 *   roads     minimum spanning tree over doors, routed by A* with a turn
 *             penalty (so roads are straight runs, not staircases), stairs where
 *             a road climbs a terrace and bridges where it crosses water
 *   scatter   trees, rocks, reeds, barrels: Poisson-spaced on the free ground
 *   lamps     along the roads, lit by the day-night cycle
 *
 * Pure data. No THREE, no DOM. `printMap(layout)` draws the layout as text, which is
 * the cheapest QA there is: look at the map before you look at a render.
 */
import { rng as makeRng, fbm, noise2, clamp, hash } from './rng.js';
import { TIERS, STYLE_TIER_CAP } from './themes.js';

export const CELL = 0.5; // metres per grid cell
export const STEP = 0.32; // height of one terrace
export const WATER_Y = -0.14; // water surface
export const BED_Y = -0.42; // water bed
export const BRIDGE_Y = 0.12; // bridge deck
export const BASE_Y = -0.62; // slab underside

export const K = { LAND: 0, WATER: 1, ROAD: 2, LOT: 3, PLAZA: 4, BRIDGE: 5 };
/** People keep this far right of a road's centre line, so two can pass on one cell. */
export const LANE = 0.36;
const PI = Math.PI;
export const YAWS = [0, PI / 2, PI, -PI / 2];

/* ---- the grid ------------------------------------------------------------------------------ */

export function makeGrid(hx, hz) {
  const nx = Math.round((2 * hx) / CELL);
  const nz = Math.round((2 * hz) / CELL);
  return {
    hx, hz, nx, nz,
    level: new Int8Array(nx * nz),
    kind: new Uint8Array(nx * nz),
    owner: new Int16Array(nx * nz).fill(-1),
    reserved: new Uint8Array(nx * nz), // kept clear of scatter and lamps (door aprons, the square's rim)
  };
}
export const idx = (g, i, k) => k * g.nx + i;
export const inside = (g, i, k) => i >= 0 && k >= 0 && i < g.nx && k < g.nz;
export const centre = (g, i, k) => ({ x: -g.hx + (i + 0.5) * CELL, z: -g.hz + (k + 0.5) * CELL });
export function cellAt(g, x, z) {
  return [clamp(Math.floor((x + g.hx) / CELL), 0, g.nx - 1), clamp(Math.floor((z + g.hz) / CELL), 0, g.nz - 1)];
}
export const kindOf = (g, i, k) => g.kind[idx(g, i, k)];
export const levelOf = (g, i, k) => g.level[idx(g, i, k)];
const isWet = (g, i, k) => {
  const kd = kindOf(g, i, k);
  return kd === K.WATER || kd === K.BRIDGE;
};

/** Height of a cell's walking surface. */
export function topY(g, i, k) {
  const kd = kindOf(g, i, k);
  if (kd === K.WATER) return WATER_Y;
  if (kd === K.BRIDGE) return BRIDGE_Y;
  return levelOf(g, i, k) * STEP;
}
export function groundAt(g, x, z) {
  const [i, k] = cellAt(g, x, z);
  return topY(g, i, k);
}

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/* ---- terrain ------------------------------------------------------------------------------- */

function waterFn(theme, r, g) {
  const s = r.next() * 1e9;
  if (theme.water === 'coast') {
    const depth = r.float(2.6, 3.4);
    return (x, z) => z > g.hz - depth - (noise2(s, x * 0.22, 0.5) - 0.5) * 2.2;
  }
  if (theme.water === 'river') {
    const x0 = r.float(-g.hx * 0.3, g.hx * 0.4);
    const A = r.float(1.0, 2.0);
    const f = r.float(0.16, 0.26);
    const ph = r.float(0, Math.PI * 2);
    const w = r.float(0.55, 0.8);
    return (x, z) => Math.abs(x - (x0 + A * Math.sin(z * f + ph))) < w + (noise2(s, z * 0.4, 1.5) - 0.5) * 0.35;
  }
  if (theme.water === 'pond' || theme.water === 'lake') {
    const lake = theme.water === 'lake';
    const cx = lake ? g.hx - r.float(2.2, 3.4) : r.pick([-1, 1]) * r.float(g.hx * 0.35, g.hx * 0.6);
    const cz = lake ? g.hz - r.float(1.6, 2.6) : r.float(g.hz * 0.15, g.hz * 0.45);
    const rx = lake ? r.float(3.0, 4.2) : r.float(1.3, 1.9);
    const rz = lake ? r.float(2.0, 2.8) : r.float(0.9, 1.3);
    return (x, z) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 + (noise2(s, x * 0.5, z * 0.5) - 0.5) * 0.6 < 1;
  }
  return () => false;
}

export function buildTerrain(g, theme, r) {
  const wet = waterFn(theme, r.fork('water'), g);
  const s = r.next() * 1e9;
  const L = Math.max(1, theme.levels);
  for (let k = 0; k < g.nz; k++) {
    for (let i = 0; i < g.nx; i++) {
      const { x, z } = centre(g, i, k);
      const j = idx(g, i, k);
      if (wet(x, z)) {
        g.kind[j] = K.WATER;
        g.level[j] = 0;
        continue;
      }
      // Back corner (-x, -z) rises: terraces climb away from the camera, so the
      // high ground never hides the low ground at the locked three-quarter angle.
      const back = clamp(((-x / g.hx) + (-z / g.hz)) * 0.25 + 0.5, 0, 1);
      const v = fbm(s, x * 0.085, z * 0.085, 3);
      const h = v * (1 - theme.rise) + back * theme.rise;
      g.level[j] = clamp(Math.floor(((h - 0.32) / 0.6) * L), 0, L - 1);
    }
  }
  // Shores are flat: every land cell within one cell of water sits at level 0.
  for (let k = 0; k < g.nz; k++) {
    for (let i = 0; i < g.nx; i++) {
      if (kindOf(g, i, k) !== K.LAND) continue;
      if (N8.some(([di, dk]) => inside(g, i + di, k + dk) && kindOf(g, i + di, k + dk) === K.WATER)) g.level[idx(g, i, k)] = 0;
    }
  }
  // No single-cell spikes or pits: a lone cell takes its neighbours' level.
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 0; k < g.nz; k++) {
      for (let i = 0; i < g.nx; i++) {
        if (kindOf(g, i, k) !== K.LAND) continue;
        const me = levelOf(g, i, k);
        const ns = N4.filter(([di, dk]) => inside(g, i + di, k + dk) && kindOf(g, i + di, k + dk) === K.LAND)
          .map(([di, dk]) => levelOf(g, i + di, k + dk));
        if (!ns.length || ns.includes(me)) continue;
        const counts = new Map();
        ns.forEach((l) => counts.set(l, (counts.get(l) || 0) + 1));
        let best = ns[0];
        counts.forEach((n, l) => { if (n > counts.get(best) || (n === counts.get(best) && l < best)) best = l; });
        g.level[idx(g, i, k)] = best;
      }
    }
  }
  limitCliffs(g);
}

/** Neighbouring cells differ by at most one terrace: every cliff is climbable by a stair. */
function limitCliffs(g) {
  for (let pass = 0; pass < 4; pass++) {
    for (let k = 0; k < g.nz; k++) {
      for (let i = 0; i < g.nx; i++) {
        let lo = 99;
        N4.forEach(([di, dk]) => { if (inside(g, i + di, k + dk)) lo = Math.min(lo, levelOf(g, i + di, k + dk)); });
        const j = idx(g, i, k);
        if (g.level[j] > lo + 1) g.level[j] = lo + 1;
      }
    }
  }
}

function flatten(g, cells, level) {
  cells.forEach(([i, k]) => { if (kindOf(g, i, k) !== K.WATER) g.level[idx(g, i, k)] = level; });
}

/* ---- plaza, landmark, entry -------------------------------------------------------------- */

function rect(i0, k0, w, d) {
  const out = [];
  for (let k = k0; k < k0 + d; k++) for (let i = i0; i < i0 + w; i++) out.push([i, k]);
  return out;
}
const modeLevel = (g, cells) => {
  const counts = new Map();
  cells.forEach(([i, k]) => { const l = levelOf(g, i, k); counts.set(l, (counts.get(l) || 0) + 1); });
  let best = 0;
  let n = -1;
  counts.forEach((c, l) => { if (c > n || (c === n && l < best)) { best = l; n = c; } });
  return best;
};

function placePlaza(g, r) {
  const R = 3; // 7 x 7 cells: a walking ring around the landmark
  let best = null;
  for (let t = 0; t < 80; t++) {
    const x = r.float(-g.hx * 0.35, g.hx * 0.2);
    const z = r.float(-g.hz * 0.35, g.hz * 0.15);
    const [ci, ck] = cellAt(g, x, z);
    const cells = rect(ci - R, ck - R, 2 * R + 1, 2 * R + 1);
    const ring = rect(ci - R - 1, ck - R - 1, 2 * R + 3, 2 * R + 3);
    if (!ring.every(([i, k]) => inside(g, i, k) && kindOf(g, i, k) === K.LAND)) continue;
    const lv = modeLevel(g, cells);
    const spread = cells.filter(([i, k]) => levelOf(g, i, k) !== lv).length;
    const score = spread * 0.5 + Math.hypot(x, z) * 0.12 + r.next() * 0.5;
    if (!best || score < best.score) best = { ci, ck, cells, lv, score };
  }
  if (!best) {
    const ci = Math.floor(g.nx / 2), ck = Math.floor(g.nz / 2);
    const cells = rect(ci - R, ck - R, 2 * R + 1, 2 * R + 1).filter(([i, k]) => inside(g, i, k));
    best = { ci, ck, cells, lv: 0 };
    cells.forEach(([i, k]) => { g.kind[idx(g, i, k)] = K.LAND; });
  }
  flatten(g, best.cells, best.lv);
  best.cells.forEach(([i, k]) => { g.kind[idx(g, i, k)] = K.PLAZA; });
  limitCliffs(g);
  const c = centre(g, best.ci, best.ck);
  return { i: best.ci, k: best.ck, x: c.x, z: c.z, y: best.lv * STEP, level: best.lv, r: (R + 0.5) * CELL, cells: best.cells };
}

/** A lighthouse belongs on the point nearest the water, not on the square. */
function placeShoreLandmark(g, r) {
  let best = null;
  for (let k = 1; k < g.nz - 2; k++) {
    for (let i = 1; i < g.nx - 2; i++) {
      const cells = rect(i, k, 3, 3);
      if (!cells.every(([a, b]) => kindOf(g, a, b) === K.LAND)) continue;
      const wetNear = N8.some(([di, dk]) => inside(g, i + 1 + di * 2, k + 1 + dk * 2) && kindOf(g, i + 1 + di * 2, k + 1 + dk * 2) === K.WATER);
      if (!wetNear) continue;
      const { x } = centre(g, i + 1, k + 1);
      const score = x + r.next() * 1.5;
      if (!best || score < best.score) best = { i, k, cells, score };
    }
  }
  if (!best) return null;
  flatten(g, best.cells, 0);
  best.cells.forEach(([a, b]) => { g.kind[idx(g, a, b)] = K.LOT; g.owner[idx(g, a, b)] = -2; });
  const c = centre(g, best.i + 1, best.k + 1);
  return { x: c.x, z: c.z, y: 0, cells: best.cells };
}

function placeEntry(g, r, plaza) {
  // Visitors arrive over a far edge (-x or -z): the clip planes cut them at the slab boundary.
  const cand = [];
  for (let k = 2; k < g.nz - 2; k++) if (kindOf(g, 0, k) === K.LAND) cand.push([0, k]);
  for (let i = 2; i < g.nx - 2; i++) if (kindOf(g, i, 0) === K.LAND) cand.push([i, 0]);
  if (!cand.length) return null;
  const scored = cand.map(([i, k]) => {
    const c = centre(g, i, k);
    return { i, k, x: c.x, z: c.z, s: Math.abs(Math.hypot(c.x - plaza.x, c.z - plaza.z) - 6) + r.next() * 3 };
  }).sort((a, b) => a.s - b.s);
  const e = scored[0];
  const out = e.i === 0 ? { x: -g.hx - 1.4, z: e.z } : { x: e.x, z: -g.hz - 1.4 };
  return { i: e.i, k: e.k, x: e.x, z: e.z, out };
}

/* ---- lots -------------------------------------------------------------------------------- */

/** Lot-local point -> world point. yaw 0 faces +Z; local +x is to the lot's right seen from behind. */
export function toWorld(lot, lx, lz) {
  const c = Math.cos(lot.yaw), s = Math.sin(lot.yaw);
  return { x: lot.x + lx * c + lz * s, z: lot.z - lx * s + lz * c };
}
/** World direction of a lot's front. */
export const frontOf = (yaw) => ({ x: Math.sin(yaw), z: Math.cos(yaw) });
/** Does a local face (normal lx, lz) face the hero camera (which sits at +x, +z)? Used to prefer doors the hero view sees. */
export function facesCamera(yaw, lx, lz) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return lx * c + lz * s + (-lx * s + lz * c) > 0.05;
}

function footprint(g, i0, k0, yaw, W, D) {
  const turned = Math.abs(Math.sin(yaw)) > 0.5;
  const ww = turned ? D : W, dd = turned ? W : D;
  const cells = rect(i0, k0, ww, dd);
  const f = frontOf(yaw);
  let apron;
  if (f.z > 0.5) apron = rect(i0, k0 + dd, ww, 1);
  else if (f.z < -0.5) apron = rect(i0, k0 - 1, ww, 1);
  else if (f.x > 0.5) apron = rect(i0 + ww, k0, 1, dd);
  else apron = rect(i0 - 1, k0, 1, dd);
  // Three cells around: lots never sit closer than that, so a road between two lots
  // has a cell beside neither (roads never run beside a building).
  const margin = rect(i0 - 3, k0 - 3, ww + 6, dd + 6);
  return { cells, apron, margin, ww, dd };
}

/**
 * The lot as a parcel, in lot-local metres (front = +z, toward the apron):
 *
 *   building  set back 0.45 m from the front edge, so porches, awnings, benches
 *             and signs stay inside the lot; 0.3 m clear of the yard strip, so
 *             roof overhangs do not reach the crates
 *   yard      a 0.6 m strip on the right with crate slots in rows, two high,
 *             and the lot's pole in its back corner
 *   apron     the row of cells in front of the lot: the door stand, the yard
 *             stand, the resident's home spot and the crew stand on it, at least
 *             PERSONAL apart
 *
 * Story details (ladders, woodpiles, barrels) go on the left side. The grammar
 * keeps every part inside this envelope; `clearance.js` measures it.
 */
export const PARCEL = { setback: 0.45, yard: 0.6, yardGap: 0.3, side: 0.12, back: 0.12, stand: 0.42, crew: 0.96 };
export function lotFrame(W, D, style) {
  const w = W * CELL, d = D * CELL;
  const yard = PARCEL.yard;
  const bx0 = -w / 2 + PARCEL.side, bx1 = w / 2 - yard - PARCEL.yardGap;
  const b = { x0: bx0, x1: bx1, z0: -d / 2 + PARCEL.back, z1: d / 2 - PARCEL.setback };
  const door = { x: (bx0 + bx1) / 2, z: b.z1 };
  const slots = [];
  const rows = Math.max(1, Math.floor((d - 0.3) / 0.46));
  for (let lv = 0; lv < 2; lv++) {
    for (let row = 0; row < rows; row++) slots.push({ x: w / 2 - yard / 2 - 0.04, z: d / 2 - 0.34 - row * 0.46, level: lv });
  }
  return { w, d, yard, building: b, door, slots, pole: { x: w / 2 - yard / 2 - 0.04 - 0.2, z: -d / 2 + 0.1 } };
}

export function placeLots(g, specs, r, plaza, groupCentres) {
  const lots = [];
  const dropped = [];
  const order = specs.map((s, n) => ({ s, n })).sort((a, b) => b.s.tier - a.s.tier || a.n - b.n);
  for (const { s, n } of order) {
    const tier = Math.min(s.tier, STYLE_TIER_CAP[s.style] ?? 3);
    const T = TIERS[tier];
    const lr = r.fork('lot:' + s.id);
    let best = null;
    for (let t = 0; t < 110; t++) {
      const yaw = YAWS[lr.int(0, 3)];
      const turned = Math.abs(Math.sin(yaw)) > 0.5;
      const ww = turned ? T.d : T.w, dd = turned ? T.w : T.d;
      const i0 = lr.int(2, g.nx - ww - 3), k0 = lr.int(2, g.nz - dd - 3);
      const fp = footprint(g, i0, k0, yaw, T.w, T.d);
      if (!fp.margin.every(([i, k]) => inside(g, i, k))) continue;
      if (!fp.cells.concat(fp.apron).every(([i, k]) => kindOf(g, i, k) === K.LAND)) continue;
      if (fp.margin.some(([i, k]) => { const kd = kindOf(g, i, k); return kd === K.LOT || kd === K.PLAZA; })) continue;
      const lv = modeLevel(g, fp.cells);
      if (fp.cells.concat(fp.apron).some(([i, k]) => Math.abs(levelOf(g, i, k) - lv) > 1)) continue;
      const spread = fp.cells.filter(([i, k]) => levelOf(g, i, k) !== lv).length / fp.cells.length;
      if (spread > 0.45) continue;
      const c0 = centre(g, i0, k0), c1 = centre(g, i0 + fp.ww - 1, k0 + fp.dd - 1);
      const x = (c0.x + c1.x) / 2, z = (c0.z + c1.z) / 2;
      const goal = groupCentres?.get(s.group) || plaza;
      const toPlaza = Math.hypot(x - plaza.x, z - plaza.z);
      const toGoal = Math.hypot(x - goal.x, z - goal.z);
      const f = frontOf(yaw);
      const faceCam = f.x + f.z > 0.5 ? 0 : 1.1;
      // Doors should look at the square, roughly: the dot of front and the way to the plaza.
      const look = -((plaza.x - x) * f.x + (plaza.z - z) * f.z) / Math.max(0.5, toPlaza);
      const score = toGoal * 0.55 + toPlaza * (0.12 + tier * 0.08) + spread * 2 + faceCam + look * 0.5 + lr.next() * 1.4;
      if (!best || score < best.score) best = { i0, k0, yaw, fp, lv, x, z, score };
    }
    if (!best) { dropped.push(s.id); continue; }
    flatten(g, best.fp.cells.concat(best.fp.apron), best.lv);
    best.fp.cells.forEach(([i, k]) => { const j = idx(g, i, k); g.kind[j] = K.LOT; g.owner[j] = n; });
    best.fp.apron.forEach(([i, k]) => { g.reserved[idx(g, i, k)] = 1; });
    limitCliffs(g);
    const frame = lotFrame(T.w, T.d, s.style);
    const lot = {
      ...s, tier, index: n, x: best.x, z: best.z, yaw: best.yaw, level: best.lv, y: best.lv * STEP,
      W: T.w, D: T.d, w: frame.w, d: frame.d, frame, cells: best.fp.cells, apron: best.fp.apron,
      storeys: s.storeys ?? lr.int(T.storeys[0], T.storeys[1]),
    };
    const door = toWorld(lot, frame.door.x, frame.door.z);
    lot.door = door;
    const st = toWorld(lot, frame.door.x, frame.d / 2 + PARCEL.stand);
    lot.stand = { x: st.x, z: st.z, yaw: lot.yaw + PI };
    lot.doorCell = cellAt(g, lot.stand.x, lot.stand.z);
    lot.slots = frame.slots.map((sl) => {
      const p = toWorld(lot, sl.x, sl.z);
      return { x: p.x, y: lot.y + sl.level * 0.37, z: p.z };
    });
    // Where a carrier stands to set a crate down: on the apron, in front of the yard.
    const ys = toWorld(lot, frame.slots[0].x, frame.d / 2 + PARCEL.stand);
    lot.yardStand = { x: ys.x, z: ys.z, yaw: lot.yaw + PI };
    lots.push(lot);
  }
  lots.sort((a, b) => a.index - b.index);
  return { lots, dropped };
}

/* ---- roads ------------------------------------------------------------------------------- */

class Heap {
  constructor() { this.a = []; }
  push(n, p) {
    const a = this.a;
    a.push([p, n]);
    let i = a.length - 1;
    while (i > 0) {
      const j = (i - 1) >> 1;
      if (a[j][0] <= a[i][0]) break;
      [a[i], a[j]] = [a[j], a[i]];
      i = j;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top[1];
  }
  get size() { return this.a.length; }
}

const effLevel = (g, i, k) => (isWet(g, i, k) ? 0 : levelOf(g, i, k));

/**
 * A* over cells with direction in the state, so a turn costs extra and roads
 * come out as straight runs with few corners. `step(i, k, ni, nk)` returns the
 * cost of entering (ni, nk), or Infinity.
 */
export function astar(g, from, to, step, turnCost = 0.45, minStep = 0.35) {
  const S = g.nx * g.nz;
  const dist = new Float64Array(S * 5).fill(Infinity);
  const prev = new Int32Array(S * 5).fill(-1);
  const heap = new Heap();
  const start = idx(g, from[0], from[1]) * 5 + 4;
  const goal = idx(g, to[0], to[1]);
  dist[start] = 0;
  heap.push(start, 0);
  const h = (i, k) => (Math.abs(i - to[0]) + Math.abs(k - to[1])) * minStep;
  let found = -1;
  while (heap.size) {
    const st = heap.pop();
    const cell = Math.floor(st / 5), dir = st % 5;
    const i = cell % g.nx, k = Math.floor(cell / g.nx);
    if (cell === goal) { found = st; break; }
    const base = dist[st];
    for (let d = 0; d < 4; d++) {
      const ni = i + N4[d][0], nk = k + N4[d][1];
      if (!inside(g, ni, nk)) continue;
      const c = step(i, k, ni, nk);
      if (!isFinite(c)) continue;
      const nd = base + c + (dir !== 4 && dir !== d ? turnCost : 0);
      const ns = idx(g, ni, nk) * 5 + d;
      if (nd < dist[ns]) {
        dist[ns] = nd;
        prev[ns] = st;
        heap.push(ns, nd + h(ni, nk));
      }
    }
  }
  if (found < 0) return null;
  const path = [];
  for (let st = found; st >= 0; st = prev[st]) {
    const cell = Math.floor(st / 5);
    const c = [cell % g.nx, Math.floor(cell / g.nx)];
    if (!path.length || path[path.length - 1][0] !== c[0] || path[path.length - 1][1] !== c[1]) path.push(c);
  }
  return path.reverse();
}

/**
 * A door cell is entered and left only straight through its front (never along the
 * apron, past the house front). `fronts` maps a door cell index to its front step.
 */
function throughFront(g, fronts, i, k, ni, nk) {
  const a = fronts.get(idx(g, i, k)), b = fronts.get(idx(g, ni, nk));
  if (a && (ni - i !== a[0] || nk - k !== a[1])) return false;
  if (b && (i - ni !== b[0] || k - nk !== b[1])) return false;
  return true;
}

export function buildRoads(g, nodes, r) {
  const doors = new Set(nodes.filter((n) => n.door).map((n) => idx(g, n.i, n.k)));
  const fronts = new Map(nodes.filter((n) => n.door).map((n) => [idx(g, n.i, n.k), n.front]));
  // Prim's MST over the nodes by straight distance; each edge then routed on the grid.
  const n = nodes.length;
  const inTree = new Array(n).fill(false);
  inTree[0] = true;
  const edges = [];
  for (let added = 1; added < n; added++) {
    let best = null;
    for (let a = 0; a < n; a++) {
      if (!inTree[a]) continue;
      for (let b = 0; b < n; b++) {
        if (inTree[b]) continue;
        const d = Math.hypot(nodes[a].i - nodes[b].i, nodes[a].k - nodes[b].k) + hash('edge', r.seed, a, b) * 0.3;
        if (!best || d < best.d) best = { a, b, d };
      }
    }
    inTree[best.b] = true;
    edges.push(best);
  }
  // Longest edges last, so short spurs join roads that already exist.
  edges.sort((p, q) => p.d - q.d);
  const routed = [];
  const failed = [];
  for (const e of edges) {
    const A = nodes[e.a], B = nodes[e.b];
    const target = idx(g, B.i, B.k), source = idx(g, A.i, A.k);
    const step = (i, k, ni, nk) => {
      const j = idx(g, ni, nk);
      const kd = g.kind[j];
      if (kd === K.LOT && j !== target) return Infinity;
      // A road keeps one clear cell from every building (roofs, ladders and barrels
      // overhang their lot), except the door cell it is heading to or leaving from.
      // Somebody may be standing at another lot's door: never route through it.
      if (doors.has(j) && j !== target && j !== source) return Infinity;
      if (!throughFront(g, fronts, i, k, ni, nk)) return Infinity;
      const tight = j !== target && j !== source && besideLot(g, ni, nk);
      const dl = Math.abs(effLevel(g, ni, nk) - effLevel(g, i, k));
      if (dl > 1) return Infinity;
      let c = kd === K.ROAD || kd === K.BRIDGE ? 0.35 : kd === K.PLAZA ? 0.5 : kd === K.WATER ? 5.5 : 1;
      // Never start a bridge from a stair, and never bridge along the river: one straight crossing.
      if (kd === K.WATER && isWet(g, i, k) === false && dl) return Infinity;
      if (dl) c += 2.2;
      if (tight) return Infinity; // lots stand two cells apart, so there is always a cell beside neither
      if (ni === 0 || nk === 0 || ni === g.nx - 1 || nk === g.nz - 1) c += 1.5;
      return c;
    };
    const path = astar(g, [A.i, A.k], [B.i, B.k], step);
    if (!path) { failed.push([A.id, B.id]); continue; }
    path.forEach(([i, k]) => {
      const j = idx(g, i, k);
      if (g.kind[j] === K.WATER) g.kind[j] = K.BRIDGE;
      else if (g.kind[j] === K.LAND) g.kind[j] = K.ROAD;
    });
    routed.push({ from: A.id, to: B.id, cells: path });
  }
  return { edges: routed, failed };
}

/** Is a building lot (or the shore landmark) within `r` cells (Chebyshev)? */
function nearLot(g, i, k, r) {
  for (let dk = -r; dk <= r; dk++) for (let di = -r; di <= r; di++) {
    if (!inside(g, i + di, k + dk)) continue;
    const j = idx(g, i + di, k + dk);
    if (g.kind[j] === K.LOT && (g.owner[j] >= 0 || g.owner[j] === -2)) return true;
  }
  return false;
}

/** Is any of the eight neighbours a building lot (or the shore landmark)? */
function besideLot(g, i, k) {
  return N8.some(([di, dk]) => {
    if (!inside(g, i + di, k + dk)) return false;
    const j = idx(g, i + di, k + dk);
    return g.kind[j] === K.LOT && (g.owner[j] >= 0 || g.owner[j] === -2);
  });
}

/** Is any of the eight neighbours occupied (a lot, lamp, cart or the landmark)? */
function besideOccupied(g, i, k) {
  return N8.some(([di, dk]) => inside(g, i + di, k + dk) && g.kind[idx(g, i + di, k + dk)] === K.LOT);
}

/**
 * Chebyshev distance (in cells, capped at `cap`) from every cell to the nearest
 * walkable cell. Scatter keeps its distance from where people walk.
 */
export function walkDistance(g, cap = 4) {
  const d = new Uint8Array(g.nx * g.nz).fill(cap);
  for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) {
    if (!walkable(g, i, k)) continue;
    for (let dk = -cap; dk <= cap; dk++) for (let di = -cap; di <= cap; di++) {
      if (!inside(g, i + di, k + dk)) continue;
      const j = idx(g, i + di, k + dk);
      d[j] = Math.min(d[j], Math.max(Math.abs(di), Math.abs(dk)));
    }
  }
  return d;
}

/** Walkable for people: roads, bridges, the square, and the door cell of every lot. */
export function walkable(g, i, k) {
  const kd = kindOf(g, i, k);
  return kd === K.ROAD || kd === K.BRIDGE || kd === K.PLAZA;
}

/** Shortest walk between two walkable cells, as world points with heights.
 *  `avoid` is a set of cell indices (other lots' door cells) never walked through. */
export function walkPath(g, a, b, avoid = null) {
  const ta = idx(g, a[0], a[1]), tb = idx(g, b[0], b[1]);
  const step = (i, k, ni, nk) => {
    if (!walkable(g, ni, nk)) return Infinity;
    if (avoid) { const j = idx(g, ni, nk); if (avoid.has(j) && j !== ta && j !== tb) return Infinity; }
    if (g.fronts && !throughFront(g, g.fronts, i, k, ni, nk)) return Infinity;
    return Math.abs(effLevel(g, ni, nk) - effLevel(g, i, k)) > 1 ? Infinity : 1;
  };
  const cells = astar(g, a, b, step, 0.3, 1);
  if (!cells) return null;
  // Where a road has to run beside a lot, walk on the far side of the cell (0.18 m over),
  // away from the roof overhangs. Between two lots there is no far side: stay central.
  return cells.map(([i, k], n) => {
    const c = centre(g, i, k);
    // `lane`: how far people keep right of the centre line here (see cast.js lanes).
    const kd = kindOf(g, i, k);
    // No lane within two cells of a building (its door cell and the cell in front of
    // it): keep central there, so nobody is steered toward a house corner.
    const lane = nearLot(g, i, k, 2) ? 0 : kd === K.BRIDGE ? 0.12 : kd === K.PLAZA ? 0 : LANE;
    if (n === 0 || n === cells.length - 1) return { ...c, y: topY(g, i, k), lane };
    let ox = 0, oz = 0;
    for (const [di, dk] of N8) {
      if (!inside(g, i + di, k + dk)) continue;
      const j = idx(g, i + di, k + dk);
      if (g.kind[j] === K.LOT && (g.owner[j] >= 0 || g.owner[j] === -2)) { ox -= di; oz -= dk; }
    }
    if (ox || oz) return { x: c.x + Math.sign(ox) * 0.18, z: c.z + Math.sign(oz) * 0.18, y: topY(g, i, k), lane: 0 };
    return { ...c, y: topY(g, i, k), lane };
  });
}

/* ---- scatter and lamps ------------------------------------------------------------------- */

/** Scatter that reaches head height needs two clear cells from a walk; the rest one. */
const TALL = new Set(['tree', 'pine', 'nets']);
const SCATTER_R = { tree: 1.0, pine: 0.8, bush: 0.55, rock: 0.5, flowers: 0.4, reed: 0.32, barrels: 0.7, nets: 0.7, logs: 0.8, fence: 0.6 };

export function scatter(g, theme, r) {
  const out = [];
  const near = (x, z, rad) => out.some((p) => Math.hypot(p.x - x, p.z - z) < (rad + SCATTER_R[p.type]) * 0.5 + 0.2);
  const types = Object.entries(theme.scatter);
  const dist = walkDistance(g);
  for (let k = 0; k < g.nz; k++) {
    for (let i = 0; i < g.nx; i++) {
      const kd = kindOf(g, i, k);
      const shore = kd === K.LAND && N4.some(([di, dk]) => inside(g, i + di, k + dk) && kindOf(g, i + di, k + dk) === K.WATER);
      if (kd !== K.LAND || g.reserved[idx(g, i, k)]) continue;
      // Nothing on a cell next to where people walk (their swept width reaches it).
      const d = dist[idx(g, i, k)];
      // ...and nothing beside a door apron either: carriers cross it to reach the yard.
      if (d < 3 || besideOccupied(g, i, k) || N8.some(([a, b]) => inside(g, i + a, k + b) && g.reserved[idx(g, i + a, k + b)])) continue;
      // A fence runs parallel to the nearest road three cells away, on the road side of its cell.
      const toRoad = d === 3 ? N4.find(([di, dk]) => inside(g, i + 3 * di, k + 3 * dk) && walkable(g, i + 3 * di, k + 3 * dk)) : null;
      const p = theme.density * (d === 3 ? 0.6 : 1) * (shore ? 1.6 : 1);
      if (!r.chance(p)) continue;
      const type = r.weighted(types.filter(([t]) => (t === 'reed' ? shore : t === 'fence' ? !!toRoad : TALL.has(t) ? d >= 4 : true)));
      if (!type) continue;
      const c = centre(g, i, k);
      const x = c.x + r.float(-0.14, 0.14), z = c.z + r.float(-0.14, 0.14);
      if (near(x, z, SCATTER_R[type])) continue;
      const item = { type, x, z, y: topY(g, i, k), yaw: r.float(0, Math.PI * 2), s: r.float(0.82, 1.18), seed: r.next() };
      if (type === 'fence') {
        item.yaw = toRoad[0] !== 0 ? Math.PI / 2 : 0;
        item.x = c.x + toRoad[0] * 0.18;
        item.z = c.z + toRoad[1] * 0.18;
      }
      out.push(item);
    }
  }
  return out;
}

export function placeLamps(g, roadEdges, r, max = 9) {
  const lamps = [];
  for (const e of roadEdges) {
    for (let n = 2; n < e.cells.length - 1; n++) {
      const [i, k] = e.cells[n];
      if (lamps.some((l) => Math.hypot(l.i - i, l.k - k) < 7)) continue;
      // Only in the middle of a straight run (two cells each way, no side turnings), so
      // nobody turns beside the lamp and a carried crate never swings into it.
      const walk = (a, b) => inside(g, a, b) && walkable(g, a, b);
      const run = (ax, az) => [-2, -1, 0, 1, 2].every((t) => walk(i + ax * t, k + az * t))
        && [-1, 0, 1].every((t) => !walk(i + ax * t + az, k + az * t + ax) && !walk(i + ax * t - az, k + az * t - ax));
      if (!run(1, 0) && !run(0, 1)) continue;
      if (hash('lamp', r.seed, i, k) > 0.35) continue;
      // The post stands two cells off the road (people keep to their lane on it); the
      // lantern arm reaches back over the cell between, toward the road.
      const side = N4.find(([di, dk]) => {
        const mi = i + di, mk = k + dk, si = i + 2 * di, sk = k + 2 * dk;
        if (!inside(g, si, sk) || kindOf(g, mi, mk) !== K.LAND || kindOf(g, si, sk) !== K.LAND) return false;
        if (g.reserved[idx(g, mi, mk)] || g.reserved[idx(g, si, sk)]) return false;
        const nearReserved = N8.some(([a, b]) => inside(g, si + a, sk + b) && g.reserved[idx(g, si + a, sk + b)]);
        // ...and two cells from every other walk too (the one it serves is exactly two away).
        const nearWalk = N8.some(([a, b]) => inside(g, si + a, sk + b) && walkable(g, si + a, sk + b));
        return !besideOccupied(g, si, sk) && !besideLot(g, mi, mk) && !nearReserved && !nearWalk;
      });
      if (!side) continue;
      const si = i + 2 * side[0], sk = k + 2 * side[1];
      if (lamps.some((l) => l.si === si && l.sk === sk)) continue;
      g.kind[idx(g, si, sk)] = K.LOT; // keep scatter off the lamp's cell
      g.owner[idx(g, si, sk)] = -3;
      const c = centre(g, si, sk);
      // The lantern arm points along the road, so its lantern never leans over the walk.
      lamps.push({ i, k, si, sk, x: c.x, z: c.z, y: topY(g, si, sk), yaw: Math.atan2(side[1], -side[0]) });
      if (lamps.length >= max) return lamps;
    }
  }
  return lamps;
}

export function placeBoats(g, count, r) {
  const boats = [];
  if (!count) return boats;
  const cand = [];
  for (let k = 1; k < g.nz - 1; k++) {
    for (let i = 1; i < g.nx - 1; i++) {
      if (kindOf(g, i, k) !== K.WATER) continue;
      let land = 99;
      for (let dk = -3; dk <= 3; dk++) for (let di = -3; di <= 3; di++) {
        if (inside(g, i + di, k + dk) && kindOf(g, i + di, k + dk) !== K.WATER) land = Math.min(land, Math.hypot(di, dk));
      }
      if (land >= 2 && land < 3.5) cand.push([i, k]);
    }
  }
  const pool = r.shuffle(cand);
  for (const [i, k] of pool) {
    const c = centre(g, i, k);
    if (boats.some((b) => Math.hypot(b.x - c.x, b.z - c.z) < 2.2)) continue;
    boats.push({ x: c.x, z: c.z, yaw: r.float(-0.6, 0.6) + (r.chance(0.5) ? 0 : Math.PI), seed: r.next(), tone: r.pick(['red', 'blue', 'teal', 'amber']) });
    if (boats.length >= count) break;
  }
  return boats;
}

/* ---- the whole layout -------------------------------------------------------------------- */

export function generateLayout(theme, lotSpecs, seed) {
  const r = makeRng(seed, 'layout');
  const { hx, hz } = theme.slab;
  const g = makeGrid(hx, hz);
  buildTerrain(g, theme, r.fork('terrain'));
  const plaza = placePlaza(g, r.fork('plaza'));
  const shore = theme.landmark === 'lighthouse' ? placeShoreLandmark(g, r.fork('landmark')) : null;
  const landmark = shore ? { kind: 'lighthouse', ...shore } : { kind: theme.landmark, x: plaza.x, z: plaza.z, y: plaza.y };
  const entry = placeEntry(g, r.fork('entry'), plaza);

  // Groups cluster: each group gets a home direction around the square.
  const groups = [...new Set(lotSpecs.map((s) => s.group))];
  const gr = r.fork('groups');
  const base = gr.float(0, Math.PI * 2);
  const groupCentres = new Map(groups.map((id, n) => {
    const a = base + (n / Math.max(1, groups.length)) * Math.PI * 2;
    const rad = groups.length > 1 ? Math.min(hx, hz) * 0.55 : 0;
    return [id, { x: clamp(plaza.x + Math.cos(a) * rad * 1.3, -hx + 2, hx - 2), z: clamp(plaza.z + Math.sin(a) * rad, -hz + 2, hz - 2) }];
  }));
  const { lots, dropped } = placeLots(g, lotSpecs, r.fork('lots'), plaza, groupCentres);

  const nodes = [{ id: 'plaza', i: plaza.i, k: plaza.k }];
  lots.forEach((l) => {
    const f = frontOf(l.yaw);
    nodes.push({ id: l.id, i: l.doorCell[0], k: l.doorCell[1], door: true, front: [Math.round(f.x), Math.round(f.z)] });
  });
  if (entry) nodes.push({ id: 'entry', i: entry.i, k: entry.k });
  if (shore) {
    const [i, k] = cellAt(g, shore.x + 1.0, shore.z);
    nodes.push({ id: 'landmark', i, k });
  }
  const roads = buildRoads(g, nodes, r.fork('roads'));

  // The landmark's footprint in the middle of the square is not walkable: people go round it.
  const centrePiece = shore ? 'well' : theme.landmark;
  const inner = 2;
  for (let dk = -inner; dk <= inner; dk++) for (let di = -inner; di <= inner; di++) {
    const j = idx(g, plaza.i + di, plaza.k + dk);
    g.kind[j] = K.LOT;
    g.owner[j] = -4;
  }
  plaza.piece = centrePiece;
  plaza.ring = (plaza.cells.length ? 3 : 2) * CELL;
  // Every cell around the square's rim stays clear; the cart takes one on the camera side.
  const rim = rect(plaza.i - 4, plaza.k - 4, 9, 9).filter(([i, k]) => inside(g, i, k) && kindOf(g, i, k) === K.LAND);
  rim.forEach(([i, k]) => { g.reserved[idx(g, i, k)] = 1; });
  // People stand off the walks: the cart stands just outside the rim, and its customer
  // on the rim (not on the ring people walk round), 0.7 m out from the ring's centre
  // line. Chat spots use the rim the same way (cast.js).
  const free = (i, k) => inside(g, i, k) && kindOf(g, i, k) === K.LAND && !besideLot(g, i, k);
  const notWalk = (a, b) => !inside(g, a, b) || !walkable(g, a, b);
  const cand = [];
  for (let m = -1; m <= 1; m++) cand.push([plaza.i + 5, plaza.k + m], [plaza.i + m, plaza.k + 5], [plaza.i - 5, plaza.k + m], [plaza.i + m, plaza.k - 5]);
  const cartCell = cand
    .filter(([i, k]) => {
      const di = i - plaza.i, dk = k - plaza.k;
      const out = Math.abs(di) === 5 ? [Math.sign(di), 0] : [0, Math.sign(dk)];
      const t = out[0] ? [0, 1] : [1, 0];
      const si = i - out[0], sk = k - out[1]; // the customer's rim cell
      return [-1, 0, 1].every((m) => free(i + t[0] * m, k + t[1] * m) && free(i + t[0] * m + out[0], k + t[1] * m + out[1]))
        && notWalk(i + 2 * t[0], k + 2 * t[1]) && notWalk(i - 2 * t[0], k - 2 * t[1])
        && inside(g, si, sk) && kindOf(g, si, sk) === K.LAND && walkable(g, si - out[0], sk - out[1]);
    })
    .sort((a, b) => (a[0] - plaza.i + a[1] - plaza.k < 0) - (b[0] - plaza.i + b[1] - plaza.k < 0) || hash('cart', seed, a[0], a[1]) - hash('cart', seed, b[0], b[1]))[0];
  let cart = null;
  if (cartCell) {
    const [ci, ck] = cartCell;
    const di = ci - plaza.i, dk = ck - plaza.k;
    const out = Math.abs(di) === 5 ? [Math.sign(di), 0] : [0, Math.sign(dk)];
    const t = out[0] ? [0, 1] : [1, 0];
    // The cart overhangs into the row behind it: both rows are its footprint.
    for (const m of [-1, 0, 1]) for (const b of [0, 1]) {
      const j = idx(g, ci + t[0] * m + out[0] * b, ck + t[1] * m + out[1] * b);
      g.kind[j] = K.LOT;
      g.owner[j] = -5;
    }
    const c = centre(g, ci, ck), s = centre(g, ci - out[0], ck - out[1]);
    const cx = c.x + out[0] * 0.4, cz = c.z + out[1] * 0.4; // pushed out, clear of a customer's stride
    const sx = s.x + out[0] * 0.2, sz = s.z + out[1] * 0.2;   // 0.7 m off the ring's centre line
    cart = { x: cx, z: cz, y: topY(g, ci, ck), yaw: Math.atan2(-out[0], -out[1]),
      stand: { x: sx, z: sz, yaw: Math.atan2(out[0], out[1]) }, standCell: [ci - 2 * out[0], ck - 2 * out[1]] };
  }
  const lamps = placeLamps(g, roads.edges, r.fork('lamps'));
  const items = scatter(g, theme, r.fork('scatter'));
  const boats = placeBoats(g, theme.boats, r.fork('boats'));
  g.fronts = new Map(nodes.filter((n) => n.door).map((n) => [idx(g, n.i, n.k), n.front]));
  return { grid: g, plaza, landmark, entry, lots, dropped, roads, lamps, scatter: items, boats, groupCentres, cart };
}

/** The layout as text: one character per cell. */
export function printMap(layout) {
  const g = layout.grid;
  const rows = [];
  for (let k = 0; k < g.nz; k++) {
    let s = '';
    for (let i = 0; i < g.nx; i++) {
      const kd = kindOf(g, i, k);
      if (kd === K.WATER) s += '~';
      else if (kd === K.BRIDGE) s += '=';
      else if (kd === K.PLAZA) s += '#';
      else if (kd === K.ROAD) s += '+';
      else if (kd === K.LOT) {
        const o = g.owner[idx(g, i, k)];
        s += o === -2 ? 'L' : o === -3 ? '!' : o === -4 ? 'O' : o === -5 ? 'c' : String.fromCharCode(65 + (o % 26));
      } else s += '.,:'[levelOf(g, i, k)] ?? String(levelOf(g, i, k));
    }
    rows.push(s);
  }
  return rows.join('\n');
}
