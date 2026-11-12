/**
 * generate(spec) -> plan, and stateAt(plan, t) -> everything that moves at t.
 *
 * The whole procedural diorama in two pure functions. A spec is a seed plus a
 * theme, or real data: records that become lots and events that become errands.
 *
 *   spec = {
 *     seed: 'harbour-7',                  // any string or number
 *     theme: 'village' | 'harbour' | 'market' | 'camp',
 *     time: 'cycle' | 'day' | 'dusk' | 'night',          // default 'cycle'
 *     weather: 'auto' | 'clear' | 'rain' | 'snow' | 'petals' | 'leaves' | 'fireflies',
 *     lots: [                             // optional: one per record (project, shop, team)
 *       { id, label, group, size, style, stock, alerts, progress, active, lit, crew, storeys },
 *     ],
 *     vary: 3,                            // optional: reroll the details, keep the big picture
 *     events: [                           // optional: one errand per event
 *       { actor, home, verb: 'deliver' | 'visit' | 'browse' | 'chat', target, ref },
 *     ],
 *   }
 *
 * How data becomes things (every encoding monotonic and capped):
 *   size      -> tier (footprint and storeys): < 5, < 20, < 60, 60 and more
 *   group     -> district: lots of a group cluster together and share a roof/cloth tone
 *   stock     -> crates in the yard, round(1.2 sqrt(n)), capped by the yard
 *   alerts    -> red pennants on the lot's pole, ceil(log2(n + 1)), at most 3
 *   progress  -> banner height on the pole, 0..1
 *   active    -> chimney smoke
 *   lit       -> windows lit before dusk
 *   events    -> errands: a delivered crate is left in the target's yard
 *
 * The plan is plain data (typed arrays for the grid, part lists for every piece),
 * so it can be tested, diffed and printed in node before anything is drawn.
 */
import { rng as makeRng, hash, clamp, wrapT } from './rng.js';
import { THEMES } from './themes.js';
import { GROUP_TONES } from './palette.js';
import { generateLayout, printMap, toWorld, BASE_Y } from './layout.js';
import { building, landmark, prop, Parts } from './grammar.js';
import { makeCast, castAt } from './cast.js';
import { skyAt, makeWeather, makeBirds, makeGlints, makeDucks } from './ambient.js';
import { pieceBox, boxesTouch } from './clearance.js';

export const VERSION = '1.0.0';
/**
 * The space each kind of dressing reserves, [half width, height], at the largest scale
 * it is drawn at and turned to any yaw: a rerolled shape (`vary`) always fits inside it.
 */
export const SCATTER_BOX = { tree: [0.95, 2.6], pine: [0.95, 2.3], bush: [0.7, 0.55], rock: [0.66, 0.4], flowers: [0.34, 0.26], reed: [0.3, 0.75], barrels: [0.7, 0.45], nets: [0.8, 1.25], logs: [0.68, 0.6], fence: [0.45, 0.55] };
/** Data caps: a slab holds about this many lots, and one loop about this many events. */
export const MAX_LOTS = 14, MAX_EVENTS = 24;
export const WEATHERS = ['clear', 'rain', 'snow', 'petals', 'leaves', 'fireflies'];
export const TIMES = ['cycle', 'day', 'dusk', 'night'];

const num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);
const str = (v) => (v === null || v === undefined ? '' : String(v));

export const encode = {
  tier: (size) => (size >= 60 ? 3 : size >= 20 ? 2 : size >= 5 ? 1 : 0),
  stock: (n, cap) => (n > 0 ? clamp(Math.round(1.2 * Math.sqrt(n)), 1, cap) : 0),
  alerts: (n) => (n > 0 ? clamp(Math.ceil(Math.log2(n + 1)), 1, 3) : 0),
  progress: (p) => (typeof p === 'number' && isFinite(p) ? clamp(p > 1 ? p / 100 : p, 0, 1) : null),
};

/** Normalise a spec: fill defaults, invent lots and events from the seed when none are given. */
export function normalizeSpec(spec = {}) {
  const seed = spec.seed ?? 1;
  const left = []; // everything from the data that will not appear, with the reason
  const r = makeRng(seed, 'spec');
  const themeName = THEMES[spec.theme] ? spec.theme : r.pick(Object.keys(THEMES));
  const theme = THEMES[themeName];
  const time = TIMES.includes(spec.time) ? spec.time : 'cycle';
  let weather = WEATHERS.includes(spec.weather) ? spec.weather : r.weighted(theme.weather);
  const styleNames = Object.keys(theme.styles);
  let lots;
  if (Array.isArray(spec.lots) && spec.lots.length) {
    const seen = new Set();
    const all = spec.lots.filter((l) => l && str(l.id)).filter((l) => {
      if (seen.has(str(l.id))) { left.push({ lot: str(l.id), why: 'duplicate lot id (the first record is used)' }); return false; }
      seen.add(str(l.id));
      return true;
    });
    all.slice(MAX_LOTS).forEach((l) => left.push({ lot: str(l.id), why: `more than ${MAX_LOTS} lots` }));
    lots = all.slice(0, MAX_LOTS).map((l, n) => {
      const lr = r.fork('lot:' + l.id);
      const size = l.size ?? l.tier ?? lr.int(1, 70);
      return {
        id: str(l.id), label: str(l.label) || str(l.id), group: str(l.group) || 'main',
        tier: typeof l.tier === 'number' ? clamp(l.tier, 0, 3) : encode.tier(num(size)),
        style: typeof l.style === 'string' && (Object.hasOwn(theme.styles, l.style) || Object.hasOwn(STYLE_SET, l.style)) ? l.style : lr.weighted(theme.styles),
        stockRaw: num(l.stock), alerts: encode.alerts(num(l.alerts)), progress: encode.progress(l.progress),
        active: l.active === undefined ? lr.chance(0.6) : !!l.active, lit: !!l.lit, crew: l.crew, storeys: l.storeys, facts: l,
      };
    });
  } else {
    const n = r.int(theme.lots[0], theme.lots[1]);
    const groups = r.int(1, 3);
    lots = Array.from({ length: n }, (_, i) => {
      const lr = r.fork('lot:' + i);
      const tier = i === 0 ? 3 : lr.weighted({ 0: 2, 1: 4, 2: 3, 3: 1 }) * 1;
      return {
        id: 'lot' + i, label: 'Lot ' + (i + 1), group: 'g' + (i % groups), tier: Number(tier),
        style: i === 0 ? theme.landmarkStyle : lr.weighted(theme.styles),
        stockRaw: lr.chance(0.7) ? lr.int(1, 30) : 0, alerts: lr.chance(0.15) ? lr.int(1, 3) : 0,
        progress: lr.chance(0.5) ? lr.next() : null, active: lr.chance(0.6), lit: false,
      };
    });
  }
  const VERBS = ['deliver', 'visit', 'browse', 'chat'];
  const given = (Array.isArray(spec.events) ? spec.events.filter((e) => e && str(e.actor)) : []).filter((e) => {
    if (e.verb === undefined || VERBS.includes(e.verb)) return true;
    left.push({ actor: str(e.actor), verb: e.verb, target: e.target ?? null, why: `unknown verb (one of ${VERBS.join(', ')})` });
    return false;
  });
  given.slice(MAX_EVENTS).forEach((e) => left.push({ actor: str(e.actor), verb: e.verb, target: e.target ?? null, why: `more than ${MAX_EVENTS} events` }));
  const events = Array.isArray(spec.events) ? given.slice(0, MAX_EVENTS).map((e) => ({
    actor: str(e.actor), home: e.home ? str(e.home) : null, verb: e.verb ?? 'visit',
    target: e.target ? str(e.target) : null, from: e.from ?? null, ref: e.ref ?? null,
  })) : null;
  if (weather === 'snow' && themeName === 'market') weather = 'clear';
  const vary = spec.vary === undefined || spec.vary === null || spec.vary === '' ? null : String(spec.vary);
  return { seed, themeName, theme, time, weather, lots, events, styleNames, vary, left };
}
const STYLE_SET = { cottage: 1, barn: 1, shed: 1, tower: 1, boathouse: 1, warehouse: 1, shop: 1, stall: 1, tent: 1, cabin: 1 };

/* ---- pieces: everything static, as part lists in place ------------------------------------- */

function lotPole(lot) {
  // A pole by the yard: banner height is progress, red pennants are alerts.
  if (lot.progress === null && !lot.alerts) return null;
  const P = new Parts();
  const tone = GROUP_TONES[lot.groupIndex % GROUP_TONES.length];
  const H = 1.9;
  P.cyl(0.03, 0.035, H, 'wood3', 0, H / 2, 0, { seg: 5 });
  P.cyl(0.06, 0.07, 0.06, 'stone2', 0, 0.03, 0, { seg: 6 });
  P.sphere(0.04, 'amber', 0, H + 0.02, 0, { ws: 5, hs: 4 });
  if (lot.progress !== null) {
    const y = 0.35 + (H - 0.55) * lot.progress;
    P.box(0.36, 0.2, 0.014, tone.flag, 0.19, y, 0);
    P.box(0.36, 0.04, 0.016, 'ink', 0.19, y - 0.08, 0);
  }
  for (let i = 0; i < lot.alerts; i++) P.cone(0.06, 0.2, 'red', 0.12, H - 0.15 - i * 0.18, 0, { rz: -Math.PI / 2, seg: 3 });
  // Behind the last crate row in the yard; the banner flies along the yard, inside the lot.
  const p = toWorld(lot, lot.frame.pole.x, lot.frame.pole.z);
  return { id: 'pole:' + lot.id, kind: 'pole', at: { x: p.x, y: lot.y, z: p.z, yaw: lot.yaw, s: 1 }, parts: P.list, glow: [], smoke: [], dyn: [], top: H, lot: lot.id };
}

function piece(id, kind, P, at, extra = {}) {
  return { id, kind, at, parts: P.list, glow: P.glow, smoke: P.smoke, dyn: P.dyn, top: P.top, ...extra };
}

/* ---- the plan ------------------------------------------------------------------------------ */

export function generate(specIn = {}) {
  const spec = normalizeSpec(specIn);
  const { seed, theme, themeName } = spec;
  const layout = generateLayout(theme, spec.lots, seed);
  // The layout, roads, lots, cast and errands come from `seed`. Building details, prop
  // shapes, crate colours and outfits come from `detail`: a `vary` seed rerolls only those.
  const detail = spec.vary === null ? seed : `${seed}~${spec.vary}`;
  const groupIndex = new Map();
  spec.lots.forEach((l) => { if (!groupIndex.has(l.group)) groupIndex.set(l.group, groupIndex.size); });
  layout.lots.forEach((l) => {
    l.groupIndex = groupIndex.get(l.group);
    l.stock = encode.stock(l.stockRaw, Math.max(0, l.slots.length - 3));
  });

  const pieces = [];
  const snow = spec.weather === 'snow', autumn = spec.weather === 'leaves';
  const ctx = { snow, autumn };

  // buildings
  layout.lots.forEach((lot) => {
    const br = makeRng(detail, 'building:' + lot.id);
    const P = building(lot, br, GROUP_TONES[lot.groupIndex % GROUP_TONES.length]);
    if (!lot.active) P.smoke.length = 0;
    pieces.push(piece('building:' + lot.id, 'building', P, { x: lot.x, y: lot.y, z: lot.z, yaw: lot.yaw, s: 1 },
      { lot: lot.id, threshold: lot.lit ? -1 : 0.15 + hash('lights', seed, lot.id) * 0.6 }));
    for (let i = 0; i < lot.stock; i++) {
      const cr = makeRng(detail, 'stock:' + lot.id + ':' + i);
      const C = prop('crate', cr, { tone: cr.pick(['wood0', 'wood1']), lid: cr.pick(['wood2', 'wood3']) });
      const s = lot.slots[i];
      pieces.push(piece('stock:' + lot.id + ':' + i, 'crate', C, { x: s.x, y: s.y, z: s.z, yaw: lot.yaw + cr.float(-0.15, 0.15), s: 1 }, { lot: lot.id }));
    }
    const pole = lotPole(lot);
    if (pole) pieces.push(pole);
  });

  // the landmark
  const lr = makeRng(detail, 'landmark');
  const lm = layout.landmark;
  const LP = landmark(lm.kind, lr);
  const lmYaw = lm.kind === 'lighthouse' ? Math.PI / 4 : 0;
  pieces.push(piece('landmark', 'landmark', LP, { x: lm.x, y: lm.y, z: lm.z, yaw: lmYaw, s: 1 }, { threshold: 0.1 }));
  if (lm.kind === 'lighthouse') {
    const WP = landmark('well', lr);
    pieces.push(piece('well', 'landmark', WP, { x: layout.plaza.x, y: layout.plaza.y, z: layout.plaza.z, yaw: 0, s: 1 }));
  }
  // the cart on the square's rim: a source of crates and a place to browse
  if (layout.cart) {
    // Local +z faces the customer; the cart spans three rim cells along local x.
    const P = new Parts();
    const c = layout.cart;
    P.box(1.0, 0.07, 0.36, 'wood1', 0, 0.42, -0.04);
    P.box(1.0, 0.2, 0.04, 'wood2', 0, 0.55, -0.2);
    P.box(1.0, 0.12, 0.04, 'wood2', 0, 0.51, 0.12);
    P.box(0.04, 0.2, 0.36, 'wood2', -0.48, 0.55, -0.04);
    for (const x of [-0.3, 0.3]) {
      P.cyl(0.2, 0.2, 0.05, 'wood3', x, 0.2, -0.2, { rx: Math.PI / 2, seg: 10 });
      P.cyl(0.05, 0.05, 0.06, 'steel2', x, 0.2, -0.23, { rx: Math.PI / 2, seg: 6 });
    }
    P.box(0.04, 0.38, 0.04, 'wood3', -0.44, 0.2, 0.14);
    P.box(0.2, 0.04, 0.04, 'wood3', 0.58, 0.4, 0.1);
    P.box(0.2, 0.04, 0.04, 'wood3', 0.58, 0.4, -0.16);
    for (let i = 0; i < 3; i++) P.box(0.24, 0.22, 0.24, i % 2 ? 'wood0' : 'earth0', -0.28 + i * 0.27, 0.57, -0.04, { ch: 0.02, ry: i * 0.2 });
    P.sphere(0.07, 'red', 0.05, 0.73, 0.0, { ws: 5, hs: 4 });
    pieces.push(piece('cart', 'cart', P, { x: c.x, y: c.y, z: c.z, yaw: c.yaw, s: 1 }));
  }
  // lamps along the roads
  layout.lamps.forEach((l, i) => {
    pieces.push(piece('lamp:' + i, 'lamp', prop('lamp', makeRng(detail, 'lamp' + i)), { x: l.x, y: l.y, z: l.z, yaw: l.yaw, s: 1 }, { threshold: 0.05 + (i % 3) * 0.12 }));
  });
  // scatter: dressing comes last and gives way. A piece whose envelope would touch
  // anything already placed is left out (fewer, well-spaced props over overlaps).
  const placed = pieces.map((p) => pieceBox(p)).filter(Boolean);
  layout.scatter.forEach((s, i) => {
    const vr = makeRng(detail, 'scatter:' + i);
    const P = prop(s.type, vr, ctx);
    const yaw = spec.vary === null || s.type === 'fence' ? s.yaw : vr.float(0, Math.PI * 2);
    const sc = s.type === 'fence' ? 1 : spec.vary === null ? s.s : vr.float(0.82, 1.18);
    const pc = piece('scatter:' + i, s.type, P, { x: s.x, y: s.y, z: s.z, yaw, s: sc });
    // Judged by the space its kind reserves (not this roll's shape), so a variation keeps
    // exactly the same dressing in exactly the same places.
    const [r, h] = SCATTER_BOX[s.type];
    const box = { center: [s.x, s.y + h / 2, s.z], half: [r, h / 2, r], q: [0, 0, 0, 1] };
    if (placed.some((b) => boxesTouch(b, box, 0.04))) return;
    placed.push(box);
    pieces.push(pc);
  });

  // the cast
  // Everything placed so far is an obstacle the cast must keep clear of, by its measured
  // envelope. (A `vary` reroll can change an envelope, so the cast is scheduled against
  // the rerolled details: layout, roads, lots and camera stay; a route a new detail
  // blocks is reported in plan.leftOut.)
  const obstacles = pieces.map((pc) => { const b = pieceBox(pc); return b && { id: pc.id, ...b }; }).filter(Boolean);
  const cast = makeCast(layout, theme, seed, spec.events, { lookSeed: detail, obstacles });
  const loop = cast.loop;

  // emitters in world space
  const smoke = [];
  pieces.forEach((p) => p.smoke.forEach((e, k) => {
    const c = Math.cos(p.at.yaw), s = Math.sin(p.at.yaw);
    smoke.push({ x: p.at.x + e.x * c + e.z * s, y: p.at.y + e.y, z: p.at.z - e.x * s + e.z * c, phase: hash('smoke', seed, p.id, k) });
  }));
  const machines = [];
  pieces.forEach((p) => p.dyn.forEach((d) => {
    const c = Math.cos(p.at.yaw), s = Math.sin(p.at.yaw);
    machines.push({ ...d, x: p.at.x + d.x * c + d.z * s, y: p.at.y + d.y, z: p.at.z - d.x * s + d.z * c, yaw: (d.yaw ?? 0) + p.at.yaw, basin: d.basin !== undefined ? p.at.y + d.basin : undefined });
  }));

  const plan = {
    version: VERSION, seed, vary: spec.vary, theme: themeName, label: theme.label, time: spec.time, weather: spec.weather, loop,
    slab: { hx: layout.grid.hx, hz: layout.grid.hz, base: BASE_Y }, grid: layout.grid, layout, pieces,
    crew: cast.crew, actors: cast.actors, props: cast.props, unresolved: cast.unresolved, droppedErrands: cast.droppedErrands, speed: cast.speed, smoke, machines,
    // Everything from the spec that does not appear, each with a reason: records past the
    // cap, lots with no room on the slab, events past the cap or that could not be staged.
    leftOut: [...spec.left, ...layout.dropped.map((id) => ({ lot: id, why: 'no room on the slab' })), ...cast.droppedErrands],
  };
  plan.ambient = {
    weather: makeWeather(plan, layout, seed),
    birds: makeBirds(plan, layout, seed),
    glints: makeGlints(plan, layout, seed),
    ducks: makeDucks(plan, layout, seed),
    boats: layout.boats,
  };
  const beats = [];
  plan.actors.forEach((a) => a.actions.forEach((x) => beats.push(x.t)));
  plan.beats = beats.sort((a, b) => a - b);
  plan.heroT = pickHero(plan, false);
  plan.nightT = spec.time === 'cycle' ? pickHero(plan, true) : plan.heroT;
  plan.fit = fitPoints(plan);
  return plan;
}

/** The still that shows the most: most people mid-action, in good light (or at night). */
function pickHero(plan, night) {
  let best = 0, bestScore = -1;
  for (let t = 0.5; t < plan.loop - 3; t += 0.25) {
    const sky = skyAt(plan, t);
    if (night ? sky.night < 0.85 : sky.night > 0.05 || sky.golden > 0.6) continue;
    const st = castAt(plan, t);
    const score = st.actors.reduce((n, a) => n + (a.action ? 2 : a.moving ? 1 : 0), 0) + (night ? 0 : -sky.golden);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return Math.round(best * 100) / 100;
}

/** Camera fit points: the slab corners top and bottom, and the top of every tall piece. */
function fitPoints(plan) {
  const { hx, hz, base } = plan.slab;
  const pts = [];
  for (const y of [0.1, base]) for (const [x, z] of [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]]) pts.push([x, y, z]);
  // Landmarks, buildings and lamps only: scatter rerolls under `vary`, and the camera must not move with it.
  const fixed = new Set(['building', 'landmark', 'lamp', 'pole', 'cart']);
  plan.pieces.forEach((p) => { if (fixed.has(p.kind) && p.top > 1.8) pts.push([p.at.x, p.at.y + p.top, p.at.z]); });
  return pts;
}

/** Everything that moves at second t. Pure. */
export function stateAt(plan, time) {
  const t = wrapT(plan.loop, time);
  return { t, sky: skyAt(plan, t), ...castAt(plan, t) };
}

/** Counts for logs, tests and the debug handle. */
export function summary(plan) {
  const parts = plan.pieces.reduce((n, p) => n + p.parts.length + p.glow.length, 0);
  return {
    seed: plan.seed, theme: plan.theme, time: plan.time, weather: plan.weather, loop: plan.loop,
    lots: plan.layout.lots.length, dropped: plan.layout.dropped.length, roads: plan.layout.roads.edges.length,
    pieces: plan.pieces.length, parts, crew: plan.crew.length, actors: plan.actors.length, crates: plan.props.length,
    birds: plan.ambient.birds.length, particles: plan.ambient.weather.particles.length, heroT: plan.heroT, nightT: plan.nightT,
  };
}

export { printMap };
