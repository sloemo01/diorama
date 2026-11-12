/**
 * The cast and what they do: residents, visitors and the crew at the doors,
 * scheduled as legs (walk from A to B between t0 and t1) and actions (a timed
 * verb at a place). The errands come from a seed or from data (one event, one
 * errand).
 *
 * Verbs
 *   deliver  pick a crate up (own yard, the square's cart, or arrive carrying one
 *            from the slab edge), carry it, set it down in the target's yard. The
 *            crate stays: the place has changed (the Animation Bar's exit layer).
 *   visit    walk to a door and knock; the crew there waves.
 *   chat     two people meet on the square at the same moment and talk.
 *   browse   stop at the square's cart and look it over.
 *
 * Everything is scheduled once, at build time. `actorAt(actor, t)` and
 * `castAt(plan, t)` are pure: no state between frames, every frame freezable.
 */
import { rng as makeRng, hash, clamp, lerp, smooth, lerpAngle } from './rng.js';
import { walkPath, walkable, cellAt, groundAt, inside, centre, toWorld, PARCEL } from './layout.js';
import { GROUP_TONES } from './palette.js';
import { boxesTouch } from './boxes.js';

const PI = Math.PI;

export const TIMING = {
  pickup: { pre: 0.55, post: 0.45 },
  drop: { pre: 0.6, post: 0.5 },
  look: { pre: 0.3, post: 1.4 },
  chat: { pre: 0.3, post: 3.2 },
  settle: 0.15,
  seam: 2.6,
  fade: 1.1,
  minLoop: 36,
  maxLoop: 96,
};
export const SPEED = 1.15; // metres per second, walking
/** Seconds for the long turn away from a stack with a crate in hand. */
export const TURN_AWAY = 0.9;
/** Half the foot spread fore and aft at scale 1: a full stride mid-walk, easing to feet together at either end (as actorPose blends). */
export const strideOf = (s) => (s.moving ? 0.08 + 0.22 * smooth((s.edge ?? 1) / 0.3) : 0.08);

/** A figure's scale from its seed (figure.js builds it at this scale). */
export const figureScale = (seed) => 0.95 + seed * 0.09;

/**
 * Where a held crate's centre sits relative to its carrier's feet at scale 1, from the
 * carry pose (figure.js CARRY_BOX) measured on the posed rig: the hands meet about
 * 0.44 m in front at 1.04 m (0.42 / 0.99 at the smallest scale, 0.46 / 1.08 at the
 * largest). build3d.js draws the crate centred between the real hands; the scheduler
 * and the audit scale this by the figure's scale.
 */
export const CARRY = { forward: 0.44, height: 1.04 };

/**
 * The body as named regions, at scale 1, from templates/pose-bounds.mjs on the posed
 * rig: standing shoulders reach 0.32 m to the side, a walking stride 0.45 m fore and
 * aft (feet), a knock, talk or lowering reach 0.5 to 0.6 m forward, a wave 0.55 m to
 * the side and 1.92 m up. Hats top out near 1.82 m.
 */
export const BODY = { legs: 0.2, torso: 0.32, head: 0.16, foot: 0.14, arm: 0.09 };
/** Two people closer than this (centre to centre, metres) are in each other's space. */
export const PERSONAL = 2 * BODY.torso + 0.06;

/* ---- looks -------------------------------------------------------------------------------- */

const SKINS = ['skin0', 'skin1', 'skin2', 'skin3'];
const HAIRS = ['hair0', 'hair1', 'hair2', 'hair0'];
const LEGS = ['ink', 'navy', 'wood3', 'slate2', 'earth3'];

/** An outfit as palette names. Who is who must read from the silhouette and one colour. */
export function lookFor(role, r, theme, groupIndex = 0) {
  const g = GROUP_TONES[groupIndex % GROUP_TONES.length];
  const base = { skin: r.pick(SKINS), hair: r.pick(HAIRS), legs: r.pick(LEGS), boots: r.pick(['wood4', 'ink', 'wood3']), accent: r.pick(['paper', 'amber', 'red', 'paper2']) };
  if (role === 'visitor') return { ...base, hat: r.pick(['hood', 'cap', 'straw']), coat: r.pick(['navy', 'violet', 'teal', 'mustard']), pack: true };
  if (role === 'crew') return { ...base, hat: r.pick(theme.hats), coat: g.cloth, apron: r.chance(0.5) ? 'paper2' : null };
  return { ...base, hat: r.pick(theme.hats), coat: r.chance(0.7) ? g.cloth : r.pick(['amber', 'red', 'blue', 'teal', 'pink']) };
}

/* ---- paths -------------------------------------------------------------------------------- */

export function pathLength(pts) {
  let n = 0;
  for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
  return n;
}

/** Position, height and heading at arc length d. The heading is a chord across a short
 *  window around d, so it eases through every corner and can never snap. */
export function pathAt(pts, d) {
  const R = 0.3;
  let acc = 0;
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    if (len < 1e-6) continue;
    segs.push({ a: pts[i - 1], b: pts[i], len, start: acc });
    acc += len;
  }
  if (!segs.length) return { x: pts[0].x, y: pts[0].y, z: pts[0].z, yaw: 0 };
  const pos = (q) => {
    const dd = clamp(q, 0, acc);
    let k = 0;
    while (k < segs.length - 1 && dd > segs[k].start + segs[k].len) k++;
    const s = segs[k], u = (dd - s.start) / s.len;
    return { x: lerp(s.a.x, s.b.x, u), y: lerp(s.a.y, s.b.y, u), z: lerp(s.a.z, s.b.z, u), yaw: Math.atan2(s.b.x - s.a.x, s.b.z - s.a.z) };
  };
  const p = pos(d), a = pos(d - R), b = pos(d + R);
  const cx = b.x - a.x, cz = b.z - a.z;
  return { x: p.x, y: p.y, z: p.z, yaw: Math.hypot(cx, cz) > 1e-4 ? Math.atan2(cx, cz) : p.yaw };
}

/**
 * Keep right: every interior point moves `lane` metres to the right of the direction
 * of travel (mitred at corners), so two people meeting on a one-cell road pass each
 * other instead of one of them waiting for the road to clear. Ends stay put: they are
 * stand points.
 */
function keepRight(pts) {
  return pts.map((p, n) => {
    if (n === 0 || n === pts.length - 1 || !p.lane) return p;
    const a = pts[n - 1], b = pts[n + 1];
    const l1 = Math.hypot(p.x - a.x, p.z - a.z) || 1, l2 = Math.hypot(b.x - p.x, b.z - p.z) || 1;
    const r1 = [(p.z - a.z) / l1, -(p.x - a.x) / l1], r2 = [(b.z - p.z) / l2, -(b.x - p.x) / l2];
    let mx = r1[0] + r2[0], mz = r1[1] + r2[1];
    const ml = Math.hypot(mx, mz);
    if (ml < 1e-6) return p;
    mx /= ml; mz /= ml;
    const off = p.lane / Math.max(0.7, mx * r1[0] + mz * r1[1]);
    return { ...p, x: p.x + mx * off, z: p.z + mz * off };
  });
}

/** Drop interior points that change neither direction nor height. */
function simplify(pts) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1], b = pts[i], c = pts[i + 1];
    const cross = (b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x);
    const flatY = Math.abs(b.y - a.y) < 1e-4 && Math.abs(c.y - b.y) < 1e-4;
    if (Math.abs(cross) > 1e-6 || !flatY) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ---- the cast ----------------------------------------------------------------------------- */

function reachableFrom(g, start) {
  const seen = new Uint8Array(g.nx * g.nz);
  if (!start) return seen;
  const q = [start];
  seen[start[1] * g.nx + start[0]] = 1;
  while (q.length) {
    const [i, k] = q.pop();
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nk = k + dk;
      if (!inside(g, ni, nk) || seen[nk * g.nx + ni] || !walkable(g, ni, nk)) continue;
      seen[nk * g.nx + ni] = 1;
      q.push([ni, nk]);
    }
  }
  return seen;
}

/** Distance from point q to segment ab, in the ground plane. */
function segDist(a, b, q) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const L = dx * dx + dz * dz;
  const u = L > 0 ? clamp(((q.x - a.x) * dx + (q.z - a.z) * dz) / L, 0, 1) : 0;
  return Math.hypot(a.x + dx * u - q.x, a.z + dz * u - q.z);
}

/** Every walkable cell on the square's ring. */
function ringCells(layout) {
  const g = layout.grid, p = layout.plaza, R = 3, out = [];
  for (let dk = -R; dk <= R; dk++) for (let di = -R; di <= R; di++) {
    if (Math.max(Math.abs(di), Math.abs(dk)) !== R) continue;
    if (inside(g, p.i + di, p.k + dk) && walkable(g, p.i + di, p.k + dk)) out.push([p.i + di, p.k + dk]);
  }
  return out;
}

/** A walkable cell on the square's ring. */
function ringCell(layout, a) {
  const g = layout.grid, p = layout.plaza;
  const R = 3;
  const cand = [];
  for (let dk = -R; dk <= R; dk++) for (let di = -R; di <= R; di++) {
    if (Math.max(Math.abs(di), Math.abs(dk)) !== R) continue;
    const i = p.i + di, k = p.k + dk;
    if (inside(g, i, k) && walkable(g, i, k)) cand.push([i, k, Math.atan2(di, dk)]);
  }
  cand.sort((x, y) => Math.abs(lerpAngle(0, x[2] - a, 1)) - Math.abs(lerpAngle(0, y[2] - a, 1)));
  return cand[0] ? [cand[0][0], cand[0][1]] : null;
}

const pt = (g, x, z) => ({ x, y: groundAt(g, x, z), z });

/**
 * @param layout  from generateLayout
 * @param errands optional [{actor, kind, home, verb, target, from}] from data; generated when absent
 */
export function makeCast(layout, theme, seed, errands = null, opts = {}) {
  const r = makeRng(seed, 'cast');
  const g = layout.grid;
  const T = TIMING;
  const startRing = ringCell(layout, 0);
  const reach = reachableFrom(g, startRing);
  const ok = (cell) => cell && reach[cell[1] * g.nx + cell[0]];
  const lots = layout.lots.filter((l) => ok(l.doorCell));
  const lotById = new Map(layout.lots.map((l) => [l.id, l]));
  const groupIndex = new Map();
  layout.lots.forEach((l) => { if (!groupIndex.has(l.group)) groupIndex.set(l.group, groupIndex.size); });
  const entryOk = layout.entry && ok([layout.entry.i, layout.entry.k]);
  const cartOk = layout.cart && ok(layout.cart.standCell);

  // ---- crew: one figure by the door of a working lot, idle --------------------------------
  const crew = [];
  // Standing spots for people who stand still for a long time (a resident at home, the
  // crew): never where others walk. A spot keeps WALK_CLEAR from every walkable cell
  // centre (a walker can be a lane and a mitre off it), PERSONAL from the lot's door and
  // yard stands and from other spots, and a body's width outside the building's parcel.
  // Candidates: the apron line, then the lot's left side (the yard is on the right).
  const WALK_CLEAR = 1.0; // walks near lots keep to their centre line (no lane there)
  const walkCentres = [];
  for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) if (walkable(g, i, k)) walkCentres.push(centre(g, i, k));
  const farFromWalks = (p) => walkCentres.every((c) => Math.abs(c.x - p.x) >= WALK_CLEAR || Math.abs(c.z - p.z) >= WALK_CLEAR || Math.hypot(c.x - p.x, c.z - p.z) >= WALK_CLEAR);
  const spotsOf = (lot) => {
    const cand = [];
    for (let lx = -lot.w / 2 + 0.27; lx <= lot.w / 2 - 0.27; lx += 0.05) cand.push([lx, lot.d / 2 + PARCEL.stand]);
    for (let lz = lot.d / 2 - 0.3; lz >= -lot.d / 2 + 0.3; lz -= 0.05) cand.push([-lot.w / 2 - 0.58, lz]);
    const taken = [[lot.frame.door.x, lot.d / 2 + PARCEL.stand], [lot.frame.slots[0].x, lot.d / 2 + PARCEL.stand]];
    const out = [];
    for (const [lx, lz] of cand) {
      if (taken.concat(out).some(([x, z]) => Math.hypot(x - lx, z - lz) < PARCEL.crew)) continue;
      const w = toWorld(lot, lx, lz);
      if (claimed.some((c) => Math.hypot(c.x - w.x, c.z - w.z) < PARCEL.crew)) continue;
      if (Math.abs(w.x) > g.hx - 0.3 || Math.abs(w.z) > g.hz - 0.3) continue;
      if (!farFromWalks(w)) continue;
      if (opts.obstacles) {
        // The spot, and the walk from it (via the front corner for a side spot) to the door cell.
        const corner = lx < -lot.w / 2 ? toWorld(lot, lx, lot.d / 2 + PARCEL.stand) : w;
        const dc = centre(g, lot.doorCell[0], lot.doorCell[1]);
        const route = [w, corner, dc];
        let blocked = false;
        for (let n = 1; n < route.length && !blocked; n++) {
          const a = route[n - 1], b = route[n], L = Math.hypot(b.x - a.x, b.z - a.z);
          for (let u = 0; u <= L + 1e-9 && !blocked; u += 0.1) {
            const k = L > 0 ? u / L : 0, x = a.x + (b.x - a.x) * k, z = a.z + (b.z - a.z) * k;
            blocked = opts.obstacles.some((o) => boxDistance(o, x, z) < BODY.torso * 1.04 + 0.06);
          }
        }
        if (blocked) continue;
      }
      out.push([lx, lz]);
    }
    return out;
  };
  // Spots are claimed across lots too: two neighbours' crews never share a corner.
  const claimed = [];
  const freeSpots = new Map(layout.lots.map((lot) => [lot.id, spotsOf(lot)]));
  const claim = (lot, s) => claimed.push(toWorld(lot, s[0], s[1]));
  // A resident's home: the first free spot (they come and go from there).
  layout.lots.forEach((lot) => {
    const s = freeSpots.get(lot.id).find((c) => { const w = toWorld(lot, c[0], c[1]); return claimed.every((q) => Math.hypot(q.x - w.x, q.z - w.z) >= PARCEL.crew); });
    if (s) { lot.homeSpot = s; claim(lot, s); }
  });

  layout.lots.forEach((lot) => {
    const want = lot.crew ?? (lot.style === 'stall' || lot.style === 'shop' ? 1 : r.chance(0.45) ? 1 : 0);
    const spots = freeSpots.get(lot.id).filter((s) => !lot.homeSpot || Math.hypot(s[0] - lot.homeSpot[0], s[1] - lot.homeSpot[1]) >= PARCEL.crew);
    const chosen = [];
    for (const sp of spots) {
      if (chosen.length >= Math.min(2, want)) break;
      const w = toWorld(lot, sp[0], sp[1]);
      if (claimed.some((q) => Math.hypot(q.x - w.x, q.z - w.z) < PARCEL.crew)) continue;
      chosen.push(sp);
      claim(lot, sp);
    }
    for (let i = 0; i < chosen.length; i++) {
      const cr = r.fork('crew:' + lot.id + ':' + i);
      const p = toWorld(lot, chosen[i][0], chosen[i][1]);
      const side = chosen[i][0] < -lot.w / 2;
      crew.push({ id: 'crew:' + lot.id + ':' + i, lot: lot.id, x: p.x, y: lot.y, z: p.z, yaw: lot.yaw + (side ? -0.6 : 0) + cr.float(-0.4, 0.4), seed: cr.next(),
        look: lookFor('crew', makeRng(opts.lookSeed ?? seed, 'look:crew:' + lot.id + ':' + i), theme, groupIndex.get(lot.group)) });
    }
  });

  // ---- actors and their errands ------------------------------------------------------------
  let plans;
  const droppedErrands = [];
  if (errands && errands.length) plans = errandsFromData(errands, lots, lotById, entryOk, droppedErrands);
  else plans = generateErrands(r.fork('errands'), lots, theme, entryOk, cartOk);

  // Fit everything in one loop: first walk a little faster (the stride is distance-driven,
  // so feet never skate), and only then leave errands out, reporting each one left out.
  const SPEEDS = opts.speed ? [opts.speed] : [SPEED, 1.45, 1.75];
  let result;
  let speed = SPEEDS[0];
  // Crew stand still all loop: one standing in a placed piece's envelope is not hired.
  if (opts.obstacles) {
    for (let n = crew.length - 1; n >= 0; n--) {
      const c = crew[n];
      const k = figureScale(c.seed);
      const hx2 = c.x + Math.cos(c.yaw) * 0.45 * k, hz2 = c.z - Math.sin(c.yaw) * 0.45 * k; // the waving hand
      const hit = opts.obstacles.some((o) => boxDistance(o, c.x, c.z) < BODY.torso * k + 0.03
        || (o.center[1] + o.half[1] > c.y + 1.3 && boxDistance(o, hx2, hz2) < 0.11));
      if (hit) crew.splice(n, 1);
    }
  }
  let staged = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    // Nobody leaves home for nothing.
    for (let n = plans.length - 1; n >= 0; n--) if (!plans[n].errands.length) plans.splice(n, 1);
    for (const sp of SPEEDS) {
      speed = sp;
      result = schedule(plans, layout, theme, seed, { lotById, groupIndex, entryOk, cartOk, speed, lookSeed: opts.lookSeed });
      if (!result.unresolved.length && result.end + T.seam <= T.maxLoop) break;
    }
    let clash = null;
    if (!result.unresolved.length && result.overflow.length) {
      const o = result.overflow[0];
      const pl = plans.find((x) => x.id === o.actor);
      if (!pl) break;
      const n = o.errand >= 0 && o.errand < pl.errands.length ? o.errand : pl.errands.length - 1;
      const [dropped] = pl.errands.splice(n, 1);
      if (dropped) droppedErrands.push({ actor: pl.name ?? pl.id, ...dropped, why: 'the yard is full' });
      if (!pl.errands.length) plans.splice(plans.indexOf(pl), 1);
      continue;
    }
    if (!result.unresolved.length) {
      const late = firstCrossing(result.actors, layout, 0, null, 0.05);
      if (late) result.unresolved = [{ yielder: result.actors[Math.max(late.i, late.j)].id, other: result.actors[Math.min(late.i, late.j)].id, t: late.t }];
    }
    if (!result.unresolved.length && result.end + T.seam <= T.maxLoop) {
      if (!opts.obstacles) { staged = true; break; }
      clash = staticConflict(result.actors, result.props, opts.obstacles, crew, Math.ceil((result.end + T.seam) * 2) / 2);
      if (!clash) { staged = true; break; }
      // A route that cannot be walked cleanly: leave that errand out (or, going home,
      // the last one), and say so. Fewer, well-spaced errands over a collision.
      const pl = plans.find((x) => x.id === clash.actor);
      if (!pl) break;
      const n = clash.errand >= 0 && clash.errand < pl.errands.length ? clash.errand : pl.errands.length - 1;
      const [dropped] = pl.errands.splice(n, 1);
      if (dropped) {
        droppedErrands.push({ actor: pl.name ?? pl.id, ...dropped, why: 'touches ' + clash.what });
        if (dropped.verb === 'chat') {
          const q = plans.find((x) => x.id === dropped.partner);
          if (q) q.errands = q.errands.filter((e) => !(e.verb === 'chat' && e.partner === pl.id));
        }
      }
      if (!pl.errands.length) plans.splice(plans.indexOf(pl), 1);
      continue;
    }
    // Somebody could not get through, or the loop is too long even at the brisk pace:
    // drop the last errand of whoever yielded (or finishes last), and say so.
    const id = result.unresolved.length ? result.unresolved[0].yielder : result.actors.slice().sort((a, b) => b.end - a.end)[0].id;
    const pl = plans.find((p) => p.id === id);
    if (!pl) break;
    if (pl.errands.length) {
      const dropped = pl.errands.pop();
      droppedErrands.push({ actor: pl.name ?? pl.id, ...dropped, why: result.unresolved.length ? 'blocked crossing' : 'loop too long' });
      if (dropped.verb === 'chat') {
        const q = plans.find((x) => x.id === dropped.partner);
        if (q && q.errands[0]?.verb === 'chat') q.errands.shift();
      }
    }
    if (!pl.errands.length) plans.splice(plans.indexOf(pl), 1);
  }
  // Out of attempts with a problem left: stage nobody rather than a collision, and say so.
  if (!staged && plans.length) {
    for (const pl of plans) for (const e of pl.errands) droppedErrands.push({ actor: pl.name ?? pl.id, ...e, why: 'could not be staged cleanly' });
    speed = SPEEDS[0];
    result = schedule([], layout, theme, seed, { lotById, groupIndex, entryOk, cartOk, speed, lookSeed: opts.lookSeed });
  }
  const loop = Math.max(T.minLoop, Math.ceil((result.end + T.seam) * 2) / 2);
  return { crew, actors: result.actors, props: result.props, loop, unresolved: result.unresolved, droppedErrands, speed };
}

function generateErrands(r, lots, theme, entryOk, cartOk) {
  const plans = [];
  const pool = r.shuffle(lots.filter((l) => l.style !== 'tent' || r.chance(0.6)));
  const nRes = clamp(Math.round(lots.length * 0.4), 1, 4);
  const residents = pool.filter((l) => l.homeSpot).slice(0, Math.min(nRes, pool.length));
  residents.forEach((lot) => plans.push({ id: 'res:' + lot.id, kind: 'resident', home: lot.id, errands: [] }));
  // One chat on the square: the first two residents meet before anything else.
  if (residents.length >= 2) {
    plans[0].errands.push({ verb: 'chat', partner: plans[1].id, side: 0 });
    plans[1].errands.push({ verb: 'chat', partner: plans[0].id, side: 1 });
  }
  plans.forEach((p, n) => {
    const others = lots.filter((l) => l.id !== p.home);
    if (!others.length) return;
    if (n < 2 && residents.length >= 2) return; // the chat is their beat
    const count = 1;
    for (let i = 0; i < count; i++) {
      const verb = r.weighted({ deliver: 0.5, visit: 0.35, browse: cartOk ? 0.15 : 0 });
      const target = r.pick(others).id;
      p.errands.push(verb === 'browse' ? { verb } : { verb, target, from: verb === 'deliver' ? (r.chance(0.5) || !cartOk ? 'home' : 'cart') : null });
    }
  });
  if (entryOk) {
    const nv = Math.min(2, r.int(theme.visitors[0], theme.visitors[1]));
    for (let i = 0; i < nv && lots.length; i++) {
      const p = { id: 'vis:' + i, kind: 'visitor', home: null, errands: [] };
      p.errands.push({ verb: 'deliver', target: r.pick(lots).id, from: 'edge' });
      if (r.chance(0.6)) p.errands.push(r.chance(0.5) && cartOk ? { verb: 'browse' } : { verb: 'visit', target: r.pick(lots).id });
      plans.push(p);
    }
  }
  return plans;
}

function errandsFromData(errands, lots, lotById, entryOk, left) {
  const byActor = new Map();
  const skip = (e, why) => left.push({ actor: e.actor, verb: e.verb, target: e.target ?? null, ref: e.ref ?? null, why });
  for (const e of errands) {
    // A chat needs two partners meeting at one time: the generator stages chats itself.
    if (e.verb === 'chat') { skip(e, 'chat is staged by the generator, not taken from data'); continue; }
    const known = e.target && lotById.get(e.target);
    const target = known && lots.includes(known) ? e.target : null;
    if (!target && e.verb !== 'browse') { skip(e, e.target && !known ? 'unknown or unplaced target lot' : !e.target ? 'no target lot' : 'target lot has no road to its door'); continue; }
    // No standing room at the home lot (every spot near a walk): this person arrives over the edge.
    const home = e.home && lotById.get(e.home) && lots.includes(lotById.get(e.home)) && lotById.get(e.home).homeSpot ? e.home : null;
    if (!home && !entryOk) { skip(e, 'no home spot and no way onto the slab'); continue; }
    const kind = home ? 'resident' : 'visitor';
    const id = (kind === 'visitor' ? 'vis:' : 'res:') + e.actor;
    if (!byActor.has(id)) byActor.set(id, { id, name: e.actor, kind, home, errands: [] });
    const p = byActor.get(id);
    p.errands.push({ verb: e.verb || 'visit', target, from: e.from ?? (kind === 'visitor' && e.verb === 'deliver' && !p.errands.length ? 'edge' : 'home'), ref: e.ref ?? null });
  }
  return [...byActor.values()];
}

/* ---- scheduling --------------------------------------------------------------------------- */

function schedule(plans, layout, theme, seed, ctx) {
  const g = layout.grid;
  const T = TIMING;
  const v = ctx.speed;
  const actors = [];
  const props = [];

  // Two ring cells two apart (1 m): the partners face each other across the gap.
  // Chat spots stand on the square's rim, off the ring people walk round: two rim
  // cells three apart (1.5 m: a talking hand reaches half a metre) on one side, each 0.7 m out from the ring's centre line, the
  // partners facing each other. Each is reached from the ring cell inside it.
  const P0 = layout.plaza;
  const rimSpot = (i, k) => {
    const di = i - P0.i, dk = k - P0.k;
    if (Math.max(Math.abs(di), Math.abs(dk)) !== 4 || (Math.abs(di) === 4 && Math.abs(dk) === 4)) return null;
    if (!inside(g, i, k) || g.kind[k * g.nx + i] !== 0 /* LAND */) return null;
    const out = Math.abs(di) === 4 ? [Math.sign(di), 0] : [0, Math.sign(dk)];
    const ring = [i - out[0], k - out[1]];
    if (!inside(g, ring[0], ring[1]) || !walkable(g, ring[0], ring[1])) return null;
    const c = centre(g, i, k);
    return { x: c.x + out[0] * 0.2, z: c.z + out[1] * 0.2, ring };
  };
  const chatPairs = [];
  for (let dk = -4; dk <= 4; dk++) for (let di = -4; di <= 4; di++) {
    const a = rimSpot(P0.i + di, P0.k + dk);
    if (!a) continue;
    for (const [ti, tk] of [[3, 0], [0, 3]]) {
      const b = rimSpot(P0.i + di + ti, P0.k + dk + tk);
      if (b && (ti ? Math.abs(dk) === 4 : Math.abs(di) === 4)) chatPairs.push([a, b]);
    }
  }
  const spotAt = (a, b) => ({ ...pt(g, a.x, a.z), cell: a.ring, yaw: Math.atan2(b.x - a.x, b.z - a.z) });

  // One beat at a time: each person goes out, does their errands and is home again
  // before the next sets off (a chat's two partners share the first beat). Streets of
  // one cell leave no room to pass, so the town takes turns, like a beat sheet.
  const chatting = new Set(plans.filter((p) => p.errands[0]?.verb === 'chat').map((p) => p.id));
  let cursor = 0.6;
  const startOf = (p) => (chatting.has(p.id) ? 0.6 + hash('start', seed, p.id) * 0.8 : cursor);

  // Legs from a point/cell to a point/cell.
  const leg = (from, to) => {
    let cells = from.cell && to.cell ? walkPath(g, from.cell, to.cell, doorCells) ?? walkPath(g, from.cell, to.cell) : null;
    if (from.cell && to.cell && !cells) throw new Error(`no walk from ${from.cell} to ${to.cell}`);
    // A stand point sits inside its door cell: go straight to it, not via the cell centre.
    if (cells && cells.length > 1 && to.cell && doorCells.has(to.cell[1] * g.nx + to.cell[0])) cells = cells.slice(0, -1);
    if (cells && cells.length > 1 && from.cell && doorCells.has(from.cell[1] * g.nx + from.cell[0])) cells = cells.slice(1);
    let pts = [{ x: from.x, y: from.y, z: from.z }, ...(from.via ?? [])];
    if (cells) {
      // Join the road where it passes nearest (no walking back along it), and leave it the
      // same way; centres within 0.3 m of either end are skipped. A dogleg there would
      // swing the walker, and a carried crate, round at the very spot they stand.
      const d = (c, q) => Math.hypot(c.x - q.x, c.z - q.z);
      let i0 = 0, i1 = cells.length - 1;
      for (let n = 1; n < cells.length; n++) if (d(cells[n], from) < d(cells[i0], from)) i0 = n; else break;
      for (let n = cells.length - 2; n >= i0; n--) if (d(cells[n], to) < d(cells[i1], to)) i1 = n; else break;
      pts = pts.concat(cells.slice(i0, i1 + 1).filter((c) => d(c, from) > 0.3 && d(c, to) > 0.3));
    }
    pts.push(...(to.via ?? []).slice().reverse(), { x: to.x, y: to.y, z: to.z });
    pts = keepRight(simplify(pts));
    return { pts, len: pathLength(pts) };
  };

  // Where each place is: a stand point and the walkable cell it hangs off.
  const lotStand = (lot, kind) => {
    if (kind === 'home') {
      const v = toWorld(lot, lot.homeSpot[0], lot.homeSpot[1]);
      // A spot beside the house is left and reached via the front corner, never across it.
      const side = lot.homeSpot[0] < -lot.w / 2;
      const via = side ? [toWorld(lot, lot.homeSpot[0], lot.d / 2 + PARCEL.stand)] : [];
      return { ...pt(g, v.x, v.z), cell: lot.doorCell, yaw: side ? lot.yaw - PI / 2 : lot.yaw, via: via.map((q) => pt(g, q.x, q.z)) };
    }
    const s = kind === 'yard' ? lot.yardStand : lot.stand;
    const own = cellAt(g, s.x, s.z);
    return { ...pt(g, s.x, s.z), cell: walkable(g, own[0], own[1]) ? own : lot.doorCell, yaw: s.yaw };
  };
  const doorCells = new Set(layout.lots.map((l) => l.doorCell[1] * g.nx + l.doorCell[0]));
  const homeOf = (p) => {
    if (p.kind === 'visitor') {
      // Each visitor waits at their own spot beyond the edge (off the board, clipped).
      const e = layout.entry;
      const n = Number(String(p.id).split(':').pop()) || 0;
      const along = (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 0.7;
      const ox = e.i === 0 ? e.out.x - 0.4 * n : e.out.x + along;
      const oz = e.i === 0 ? e.out.z + along : e.out.z - 0.4 * n;
      // ...and crosses the edge in its own lane, side by side with the others.
      const lane = clamp(along, -0.36, 0.36);
      const ex = e.i === 0 ? e.x : e.x + lane, ez = e.i === 0 ? e.z + lane : e.z;
      return { x: ox, y: groundAt(g, e.x, e.z), z: oz, cell: null, edge: { x: ex, y: groundAt(g, e.x, e.z), z: ez, cell: [e.i, e.k] } };
    }
    const lot = ctx.lotById.get(p.home);
    return lotStand(lot, 'home');
  };

  // Chats are first errands: work out when both partners can be there, so they arrive together.
  const meetAt = new Map();
  const chatAt = new Map();
  plans.forEach((p, n) => {
    const e = p.errands[0];
    if (!e || e.verb !== 'chat' || meetAt.has(p.id)) return;
    const q = plans.find((x) => x.id === e.partner);
    if (!q) return;
    const hp = homeOf(p), hq = homeOf(q);
    // The first pair (in a seeded order) where neither approach passes the other's spot.
    let sp = null, sq = null, lp = 0, lq = 0;
    const order = chatPairs.slice().sort((x, y) => hash('chat', seed, x[0].x, x[0].z) - hash('chat', seed, y[0].x, y[0].z));
    for (const [ca, cb] of order) {
      for (const [c1, c2] of [[ca, cb], [cb, ca]]) {
        if (sp) break;
        const s1 = spotAt(c1, c2), s2 = spotAt(c2, c1);
        const L1 = leg(hp.edge ?? hp, s1), L2 = leg(hq.edge ?? hq, s2);
        const passes = (L, spot) => L.pts.some((q2, i) => i > 0 && segDist(L.pts[i - 1], q2, spot) < PERSONAL + 0.06);
        if (passes(L1, s2) || passes(L2, s1)) continue;
        sp = s1; sq = s2;
        lp = L1.len + (hp.edge ? Math.hypot(hp.x - hp.edge.x, hp.z - hp.edge.z) : 0);
        lq = L2.len + (hq.edge ? Math.hypot(hq.x - hq.edge.x, hq.z - hq.edge.z) : 0);
      }
      if (sp) break;
    }
    if (!sp) { p.errands.shift(); q.errands.shift(); return; }
    chatAt.set(p.id, sp);
    chatAt.set(q.id, sq);
    const tm = Math.max(startOf(p) + lp / v, startOf(q) + lq / v) + T.settle + T.chat.pre;
    meetAt.set(p.id, tm);
    meetAt.set(q.id, tm);
  });

  plans.forEach((p, n) => {
    const r = makeRng(seed, 'actor:' + p.id);
    const homeLot = p.home ? ctx.lotById.get(p.home) : null;
    const a = {
      id: p.id, name: p.name ?? p.id, kind: p.kind, home: null, homeLot: p.home, seed: r.next(),
      look: lookFor(p.kind === 'visitor' ? 'visitor' : 'resident', makeRng(ctx.lookSeed ?? seed, 'look:' + p.id), theme, homeLot ? ctx.groupIndex.get(homeLot.group) : n),
      legs: [], actions: [], end: 0,
    };
    const home = homeOf(p);
    let here = home;
    let free = startOf(p);
    let dist = 0;
    let carrying = null;

    const walk = (to, opts = {}) => {
      const L = leg(here, to);
      const t0 = opts.t0 ?? free;
      const t1 = t0 + L.len / v;
      if (L.len > 0.01) a.legs.push({ t0, t1, pts: L.pts, len: L.len, d0: dist, carry: carrying, home: !!opts.home, errand: errandNo });
      dist += L.len;
      free = t1;
      here = to;
      return t1;
    };
    const act = (kind, place, yaw, extra = {}) => {
      const tm = T[kind];
      const te = Math.max(free + T.settle + tm.pre, extra.at ?? 0);
      a.actions.push({ kind, t: te, t0: te - tm.pre, t1: te + tm.post, x: place.x, y: place.y, z: place.z, yaw, errand: errandNo, ...extra });
      free = te + tm.post + (extra.away ? TURN_AWAY + 0.05 : 0.2);
      return te;
    };
    // Where a picked-up crate is lifted from: the top of the cart's load, or the top of
    // the home yard's front stack (one level above the stock crates already there).
    const sourceOf = (from) => {
      if (from === 'cart' && layout.cart) return { x: layout.cart.x, y: layout.cart.y + 0.69, z: layout.cart.z, yaw: layout.cart.yaw };
      if (from === 'yard' && homeLot) {
        const rows = homeLot.slots.length / 2;
        const level = (homeLot.stock ?? 0) > rows ? 2 : (homeLot.stock ?? 0) > 0 ? 1 : 0;
        const s0 = homeLot.slots[0];
        return { x: s0.x, y: homeLot.y + level * 0.37, z: s0.z, yaw: homeLot.yaw };
      }
      return null;
    };
    const newProp = (lotId, from) => {
      const lot = ctx.lotById.get(lotId);
      // A placeholder slot: assignSlots gives the real one once the timing is final.
      const k = lot.slots.length - 1;
      const prop = { id: 'crate:' + props.length, lot: lotId, slot: k, pos: { ...lot.slots[k], yaw: lot.yaw }, src: sourceOf(from), carriedBy: a.id, tPick: null, tDrop: null, from,
        tone: r.pick(['wood0', 'wood1', 'earth0']), lid: r.pick(['wood2', ctx.groupIndex.has(lot.group) ? GROUP_TONES[ctx.groupIndex.get(lot.group) % 6].flag : 'red']) };
      props.push(prop);
      return prop;
    };

    let errandNo = -1;
    // A visitor walks on from beyond the slab edge, so their first leg starts off the board.
    if (home.edge) {
      const first = p.errands[0];
      if (first && first.verb === 'deliver' && first.from === 'edge') {
        carrying = newProp(first.target, 'edge');
        carrying.tPick = -1;
      }
      walk(home.edge, { t0: free });
    }

    for (const e of p.errands) {
      errandNo++;
      if (e.verb === 'chat') {
        const spot = chatAt.get(p.id);
        const tm = meetAt.get(p.id);
        if (!spot || tm === undefined) continue;
        const L = leg(here, spot);
        walk(spot, { t0: Math.max(free, tm - T.chat.pre - T.settle - L.len / v) });
        act('chat', spot, spot.yaw, { at: tm, partner: e.partner });
      } else if (e.verb === 'browse' && ctx.cartOk) {
        const c = layout.cart;
        const spot = { ...pt(g, c.stand.x, c.stand.z), cell: c.standCell };
        walk(spot);
        act('look', spot, c.stand.yaw, { place: 'cart' });
      } else if (e.verb === 'visit') {
        const lot = ctx.lotById.get(e.target);
        const s = lotStand(lot, 'door');
        walk(s);
        act('look', s, s.yaw, { lot: lot.id, ref: e.ref ?? null });
      } else if (e.verb === 'deliver') {
        const lot = ctx.lotById.get(e.target);
        if (!lot) continue;
        if (!carrying) {
          let src = null;
          if (e.from === 'cart' && ctx.cartOk) src = { ...pt(g, layout.cart.stand.x, layout.cart.stand.z), cell: layout.cart.standCell, yaw: layout.cart.stand.yaw };
          else if (homeLot) src = lotStand(homeLot, 'yard');
          if (!src) continue;
          walk(src);
          const prop = newProp(lot.id, e.from === 'cart' ? 'cart' : 'yard');
          // With a crate in hand, turn away by the right (the yard side, never across the
          // house front), through facing out, before setting off.
          const te = act('pickup', src, src.yaw, { prop: prop.id, away: [src.yaw - PI / 2, src.yaw - PI] });
          prop.tPick = te;
          carrying = prop;
        }
        const s = lotStand(lot, 'yard');
        walk(s);
        const te = act('drop', s, s.yaw, { prop: carrying.id, lot: lot.id, ref: e.ref ?? null });
        carrying.tDrop = te;
        carrying = null;
      }
    }
    // Home again: a resident to the door, a visitor back over the edge.
    errandNo = -1;
    // The next beat may set off while this one walks home (the crossing check sorts out
    // any meeting on the way).
    const doneAt = free;
    if (home.edge) {
      walk(home.edge);
      walk({ x: home.x, y: home.y, z: home.z, cell: null }, { home: true });
    } else walk(home, { home: true });
    a.end = free;
    // (A visitor leaves by the one entry the next visitor comes in by: wait till they are off the board.)
    cursor = Math.max(cursor, (home.edge ? free : doneAt) + 0.5);
    // Wait at home facing the way out, so the loop seam has no turn in it.
    a.home = { x: home.x, y: home.y, z: home.z, yaw: a.legs.length ? pathAt(a.legs[0].pts, 0).yaw : home.yaw ?? 0, offBoard: !!home.edge };
    actors.push(a);
  });
  const unresolved = yieldAtCrossings(actors, props, layout);
  const overflow = assignSlots(props, ctx.lotById, actors);
  const end = actors.reduce((m, a) => Math.max(m, a.end), 0);
  return { actors, props, end, unresolved, overflow };
}

/**
 * Static clearance at build time: a person (torso circle, BODY.torso) or a carried
 * crate (its box, carried CARRY.forward ahead) must never touch a placed piece's box
 * (`obstacles`, from clearance.js pieceBox) or a crew member. The same envelopes the
 * audit uses, checked in the plane with the boxes' heights, so the generator can drop
 * an errand whose route cannot be walked cleanly instead of shipping a collision.
 * Returns the first conflict { actor, errand, t } or null. Contacts the audit allows
 * (a crate on the cart while it is lifted off) are allowed here too.
 */
export function staticConflict(actors, props, obstacles, crew, loop, step = 0.05) {
  const yawOf = (q) => 2 * Math.atan2(q[1], q[3]);
  const inBox = (o, x, z, r) => {
    const t = yawOf(o.q), c = Math.cos(t), s = Math.sin(t);
    const dx = x - o.center[0], dz = z - o.center[2];
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    const ex = Math.max(0, Math.abs(lx) - o.half[0]), ez = Math.max(0, Math.abs(lz) - o.half[2]);
    return Math.hypot(ex, ez) < r;
  };
  const yOverlap = (o, y0, y1) => o.center[1] - o.half[1] < y1 && o.center[1] + o.half[1] > y0;
  const propBy = new Map(props.map((p) => [p.id, p]));
  // A fixed step plus every leg and action boundary (the audit samples those too: a
  // person still turning as an action ends is checked at that instant).
  const times = [];
  for (let t = 0; t <= loop + 1e-9; t += step) times.push(t);
  for (const a of actors) {
    for (const l of a.legs) times.push(l.t0, l.t1);
    for (const x of a.actions) times.push(x.t0, x.t0 + 1e-6, x.t, x.t1 - 1e-6, x.t1);
  }
  const sorted = [...new Set(times.filter((t) => t >= 0 && t <= loop))].sort((p, q) => p - q);
  for (const t of sorted) {
    for (const a of actors) {
      const s = actorAt(a, t);
      for (const o of obstacles) {
        const k = figureScale(a.seed);
        const st = strideOf(s) * k;
        const fx = Math.sin(s.yaw) * st, fz = Math.cos(s.yaw) * st;
        const hitBody = (yOverlap(o, s.y + 0.88 * k - 0.32, s.y + 1.82 * k) && inBox(o, s.x, s.z, BODY.torso * k + 0.05))
          || (yOverlap(o, s.y, s.y + 0.8 * k) && (inBox(o, s.x + fx, s.z + fz, BODY.foot * k + 0.05) || inBox(o, s.x - fx, s.z - fz, BODY.foot * k + 0.05) || inBox(o, s.x, s.z, BODY.legs * k + 0.05)));
        if (hitBody) return { actor: a.id, t, errand: errandAt(a, t), what: o.id };
        // The arm region the audit registers (clearance.js): reach on a knock or a look,
        // low on a set-down or lift, out to the crate while carrying. Hands may touch what
        // the errand is about (its door, the cart, the stack), as the audit allows.
        const act = s.action;
        const g = s.carry && !(act && (act.kind === 'drop' || act.kind === 'pickup')) ? 'carry' : !act ? null : act.kind === 'drop' || act.kind === 'pickup' ? 'low' : 'reach';
        if (g) {
          const allowed = (act && act.kind === 'look' && act.lot && o.id === 'building:' + act.lot) || (o.id === 'cart' && (act?.place === 'cart' || g === 'low'))
            || (g === 'low' && o.id.startsWith('stock:'));
          if (!allowed) {
            const ax = Math.sin(s.yaw), az = Math.cos(s.yaw);
            const reach = g === 'carry' ? CARRY.forward : 0.5, hy = g === 'low' ? 0.6 : g === 'carry' ? CARRY.height : 1.1;
            for (let u = 0.25; u <= 1.001; u += 0.25) {
              const px = s.x + ax * (0.1 + (reach - 0.1) * u) * k, pz = s.z + az * (0.1 + (reach - 0.1) * u) * k;
              const py = s.y + (1.28 + (hy - 1.28) * u) * k;
              if (yOverlap(o, py - BODY.arm * k, py + BODY.arm * k) && inBox(o, px, pz, BODY.arm * k + 0.03)) return { actor: a.id, t, errand: errandAt(a, t), what: o.id };
            }
          }
        }
        if (s.carry) {
          const pr = propBy.get(s.carry.prop);
          if (o.id === 'cart' && pr && pr.from === 'cart' && Math.abs(t - pr.tPick) < 1.0) continue;
          // Lifted off or set on a stack, a crate rests on the crate below it (the audit
          // still checks that pair at its own clearance).
          if (o.id.startsWith('stock:') && act && (act.kind === 'pickup' || act.kind === 'drop')) continue;
          const k = figureScale(a.seed);
          const hand = { x: s.x + Math.sin(s.yaw) * CARRY.forward * k, z: s.z + Math.cos(s.yaw) * CARRY.forward * k, y: s.y + CARRY.height * k - 0.175 };
          const rest = s.carry.toward === 'source' ? pr?.src ?? pr?.pos : pr?.pos;
          const q = rest ? carryPoint(hand, rest, s.carry.lower ?? 0) : hand;
          const yaw = carryYaw(s.yaw, rest, s.carry.lower ?? 0);
          const crate = { center: [q.x, q.y + 0.175, q.z], half: [0.18, 0.175, 0.18], q: [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)] };
          if (boxesTouch(crate, o, 0.02)) return { actor: a.id, t, errand: errandAt(a, t), what: o.id };
        }
      }
      for (const c of crew) {
        // crew may wave (a hand 0.55 m to the side): keep a wave's width as well
        if (Math.hypot(c.x - s.x, c.z - s.z) < PERSONAL + 0.25) return { actor: a.id, t, errand: errandAt(a, t), what: c.id };
        if (s.carry) {
          const k = figureScale(a.seed);
          const cx = s.x + Math.sin(s.yaw) * CARRY.forward * k, cz = s.z + Math.cos(s.yaw) * CARRY.forward * k;
          if (Math.hypot(c.x - cx, c.z - cz) < BODY.torso + 0.32 + 0.25) return { actor: a.id, t, errand: errandAt(a, t), what: c.id };
        }
      }
    }
  }
  return null;
}

/** Plane distance from a point to a yaw-only box. */
function boxDistance(o, x, z) {
  const t = 2 * Math.atan2(o.q[1], o.q[3]), c = Math.cos(t), s = Math.sin(t);
  const dx = x - o.center[0], dz = z - o.center[2];
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.hypot(Math.max(0, Math.abs(lx) - o.half[0]), Math.max(0, Math.abs(lz) - o.half[2]));
}

/** Which errand an actor is busy with at t (-1: going home or waiting at home). */
function errandAt(a, t) {
  for (const l of a.legs) if (t >= l.t0 && t < l.t1) return l.errand ?? -1;
  let best = -1, bt = -Infinity;
  for (const x of a.actions) if (x.t0 <= t && x.t0 > bt) { bt = x.t0; best = x.errand ?? -1; }
  for (const l of a.legs) if (l.t1 <= t && l.t1 > bt) { bt = l.t1; best = l.errand ?? -1; }
  return best;
}

/**
 * Yard slots for delivered crates, given once the timing is final: in the order the
 * crates land, ground level before the level above (a crate never lands on air), never
 * the front row (a resident lifts from there), never a slot taken by stock, no wrap.
 * A crate with no free slot is returned as overflow: its errand is left out.
 */
function assignSlots(props, lotById, actors) {
  const overflow = [];
  const byLot = new Map();
  props.forEach((p) => { if (p.tDrop !== null) (byLot.get(p.lot) ?? byLot.set(p.lot, []).get(p.lot)).push(p); });
  byLot.forEach((list, lotId) => {
    const lot = lotById.get(lotId);
    const rows = lot.slots.length / 2;
    const free = lot.slots.map((_, n) => n).filter((n) => n % rows !== 0 && n >= (lot.stock ?? 0));
    list.sort((a, b) => a.tDrop - b.tDrop);
    list.forEach((p, n) => {
      if (n >= free.length) {
        const a = actors.find((x) => x.id === p.carriedBy);
        const drop = a?.actions.find((x) => x.prop === p.id && x.kind === 'drop');
        overflow.push({ actor: p.carriedBy, errand: drop?.errand ?? -1, prop: p.id });
        return;
      }
      p.slot = free[n];
      p.pos = { ...lot.slots[free[n]], yaw: lot.yaw };
    });
  });
  return overflow;
}

/**
 * The first moment two people (or a carried crate and a person, or a reaching hand and
 * a person) share space, scanning from `from` to `end` every `step` seconds. People
 * beyond the slab edge are not on the board. Used by the crossing resolver and as the
 * final check of a schedule.
 */
export function firstCrossing(actors, layout, from = 0, end = null, step = 0.05) {
  const { hx, hz } = layout.grid;
  const onBoard = (s) => Math.abs(s.x) < hx + 0.3 && Math.abs(s.z) < hz + 0.3;
  const last = end ?? actors.reduce((m, a) => Math.max(m, a.end), 0);
  const crate = (s, a) => (s.carry ? { x: s.x + Math.sin(s.yaw) * CARRY.forward * figureScale(a.seed), z: s.z + Math.cos(s.yaw) * CARRY.forward * figureScale(a.seed) } : null);
  const reach = (s) => (s.action ? { x: s.x + Math.sin(s.yaw) * 0.45, z: s.z + Math.cos(s.yaw) * 0.45 } : null);
  const near = (c, s, r) => c && Math.hypot(c.x - s.x, c.z - s.z) < r;
  for (let t = Math.max(0, Math.floor(from / step) * step - step); t <= last + 1e-9; t += step) {
    const st = actors.map((a) => actorAt(a, t));
    for (let i = 0; i < st.length; i++) {
      for (let j = i + 1; j < st.length; j++) {
        const p = st[i], q = st[j];
        if (!onBoard(p) || !onBoard(q)) continue;
        // Two walking people also need room for their strides (feet 0.44 m out front).
        if (Math.hypot(p.x - q.x, p.z - q.z) < PERSONAL + (p.moving && q.moving ? 0.22 : p.moving || q.moving ? 0.1 : 0)) return { t, i, j };
        const cp = crate(p, actors[i]), cq = crate(q, actors[j]);
        if (near(cp, q, BODY.torso + 0.32) || near(cq, p, BODY.torso + 0.32) || (cp && cq && near(cp, cq, 0.6))) return { t, i, j };
        if (near(reach(p), q, BODY.torso + 0.15) || near(reach(q), p, BODY.torso + 0.15)) return { t, i, j };
      }
    }
  }
  return null;
}

/**
 * Crossing priority. Two people may not occupy the same space: when they would,
 * the one who set off later (or arrived later) waits where they are and leaves
 * a little after. Deterministic retiming, never a random nudge or a hidden body.
 * Shifting a leg that leads into a chat shifts the partner's chat with it.
 */
function yieldAtCrossings(actors, props, layout, step = 0.05, wait = 0.6) {
  let resume = 0;
  const shift = (a, from, dt, seen = new Set()) => {
    if (seen.has(a.id)) return;
    seen.add(a.id);
    resume = Math.min(resume, from);
    for (const l of a.legs) if (l.t0 >= from - 1e-9) { l.t0 += dt; l.t1 += dt; }
    for (const x of a.actions) {
      if (x.t0 < from - 1e-9) continue;
      x.t += dt; x.t0 += dt; x.t1 += dt;
      const pr = x.prop ? props.find((p) => p.id === x.prop) : null;
      if (pr && x.kind === 'pickup') pr.tPick = x.t;
      if (pr && x.kind === 'drop') pr.tDrop = x.t;
      if (x.kind === 'chat' && x.partner) {
        const b = actors.find((y) => y.id === x.partner);
        const bx = b && b.actions.find((y) => y.kind === 'chat' && y.partner === a.id);
        if (bx) shift(b, bx.t0, dt, seen);
      }
    }
    a.end += dt;
  };
  let last = null;
  let from = 0;
  const pairs = new Map();
  for (let iter = 0; iter < 2000; iter++) {
    const end = actors.reduce((m, a) => Math.max(m, a.end), 0);
    const hit = firstCrossing(actors, layout, from, end, step);
    if (!hit) return [];
    // Who yields: always the one later in the cast list (a fixed priority, so two people
    // never take turns giving way for ever). They wait before the leg that brought them
    // there: a walker waits short of the meeting; somebody standing arrives a little later.
    const legOf = (a, t) => a.legs.filter((l) => l.t0 <= t + 1e-9).pop() ?? a.legs[0];
    // Somebody walking into somebody standing waits for them; otherwise the fixed priority.
    const Pm = actorAt(actors[hit.i], hit.t).moving, Qm = actorAt(actors[hit.j], hit.t).moving;
    const k = Pm !== Qm ? (Pm ? hit.i : hit.j) : Math.max(hit.i, hit.j);
    const li = legOf(actors[hit.i], hit.t), lj = legOf(actors[hit.j], hit.t);
    const leg = k === hit.i ? li : lj;
    if (!leg) return [{ yielder: actors[k].id, other: actors[k === hit.i ? hit.j : hit.i].id, t: hit.t }];
    // The same two people meeting again and again: one of them is in the way for good
    // (standing at home, waiting for a partner). Give up early; the caller leaves an
    // errand out rather than pushing the whole cast minutes later.
    const pairKey = actors[hit.i].id + '|' + actors[hit.j].id;
    pairs.set(pairKey, (pairs.get(pairKey) || 0) + 1);
    if (pairs.get(pairKey) > 12) return [{ yielder: actors[k].id, other: actors[k === hit.i ? hit.j : hit.i].id, t: hit.t }];
    resume = leg.t0;
    shift(actors[k], leg.t0, wait);
    from = resume;
    last = { yielder: actors[k].id, other: actors[k === hit.i ? hit.j : hit.i].id, t: hit.t };
  }
  return [last];
}

/**
 * Where a crate is between the hands (`hand`) and where it rests (`rest`), for a blend
 * k in 0..1: first across at carrying height, then straight down (a drop), or the
 * reverse for a pickup, so a crate never cuts through a stack beside its slot.
 * Shared by the renderer and the clearance audit, with carryYaw for the crate's turn.
 */
export function carryYaw(handYaw, rest, k) {
  return rest && rest.yaw !== undefined ? lerpAngle(handYaw, rest.yaw, smooth(k)) : handYaw;
}

export function carryPoint(hand, rest, k) {
  const u = clamp(k * 2, 0, 1), v = clamp(k * 2 - 1, 0, 1);
  const top = Math.max(hand.y, rest.y);
  return { x: lerp(hand.x, rest.x, smooth(u)), z: lerp(hand.z, rest.z, smooth(u)), y: k < 0.5 ? lerp(hand.y, top, smooth(u)) : lerp(top, rest.y, smooth(v)) };
}

/* ---- the cast at second t ----------------------------------------------------------------- */

export function actorAt(a, t) {
  let leg = null, last = null, next = null;
  for (const l of a.legs) {
    if (t >= l.t0 && t < l.t1) leg = l;
    if (l.t1 <= t) last = l;
    if (!next && l.t0 > t) next = l;
  }
  let act = null, lastAct = null;
  for (const x of a.actions) {
    if (t >= x.t0 && t < x.t1) act = x;
    if (x.t0 <= t) lastAct = x;
  }
  const out = { id: a.id, x: a.home.x, y: a.home.y, z: a.home.z, yaw: a.home.yaw, moving: false, speed: 0, dist: 0, action: null, carry: null, edge: 0 };
  if (leg) {
    const dur = leg.t1 - leg.t0;
    const u = dur > 0 ? (t - leg.t0) / dur : 1;
    const p = pathAt(leg.pts, leg.len * u);
    Object.assign(out, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, moving: true, speed: dur > 0 ? leg.len / dur : 0, dist: leg.d0 + leg.len * u });
    out.edge = Math.min(leg.len * u, leg.len * (1 - u)); // metres from the nearer end: the walk blends in and out
    if (leg.carry) out.carry = { prop: leg.carry.id, lower: 0 };
    return out;
  }
  if (last) {
    const end = pathAt(last.pts, last.len);
    Object.assign(out, { x: end.x, y: end.y, z: end.z, yaw: end.yaw, dist: last.d0 + last.len });
    const since = t - last.t1;
    const after = a.actions.find((x) => x.t0 >= last.t1 - 1e-6);
    const standYaw = last.home ? a.home.yaw : after && (!next || after.t0 < next.t0) ? after.yaw : end.yaw;
    out.yaw = lerpAngle(end.yaw, standYaw, smooth(since / 0.3));
    if (last.carry && !(act && act.kind === 'drop')) {
      const dropped = last.carry.tDrop !== null && t >= last.carry.tDrop;
      if (!dropped) out.carry = { prop: last.carry.id, lower: 0 };
    }
    // Picked up and not yet walking: the crate is already in their hands.
    if (lastAct && lastAct.kind === 'pickup' && t >= lastAct.t1 && !act) out.carry = { prop: lastAct.prop, lower: 0 };
  }
  if (act) {
    out.x = act.x; out.y = act.y; out.z = act.z;
    out.action = { kind: act.kind, u: (t - act.t0) / (act.t1 - act.t0), dt: t - act.t, lot: act.lot ?? null, partner: act.partner ?? null };
    // `lower` blends the crate between the hands (0) and where it rests (1): the slot it is
    // set down in on a drop, the source it is lifted from on a pickup.
    if (act.kind === 'drop' && t < act.t) out.carry = { prop: act.prop, lower: smooth((t - act.t0) / (act.t - act.t0)), toward: 'slot' };
    if (act.kind === 'pickup' && t >= act.t) out.carry = { prop: act.prop, lower: 1 - smooth((t - act.t) / (act.t1 - act.t)), toward: 'source' };
  }
  if (next) {
    // Turn toward the way out in the last moment before leaving. After a pickup the turn
    // goes the long way round on purpose (`away`): yard side first, then facing out.
    const prev = a.actions.filter((x) => x.t1 <= next.t0 + 1e-9).pop();
    const B = pathAt(next.pts, 0).yaw;
    if (prev && prev.away && prev.t1 <= t) {
      const k = clamp((t - (next.t0 - TURN_AWAY)) / TURN_AWAY, 0, 1);
      if (k > 0) {
        const path = [prev.yaw, ...prev.away, B];
        const seg = Math.min(path.length - 2, Math.floor(k * (path.length - 1)));
        const u = smooth(k * (path.length - 1) - seg);
        out.yaw = lerpAngle(path[seg], path[seg + 1], u);
      }
    } else {
      const k = smooth((t - (next.t0 - 0.35)) / 0.35);
      if (k > 0) out.yaw = lerpAngle(out.yaw, B, k);
    }
  }
  return out;
}

/** Everything the cast does at second t (already wrapped). */
export function castAt(plan, t) {
  const T = TIMING;
  const fade = 1 - smooth((t - (plan.loop - T.fade - 0.3)) / T.fade);
  const actors = plan.actors.map((a) => actorAt(a, t));
  const props = plan.props.map((p) => {
    const start = p.tPick === -1 ? 0 : p.tPick;
    const carried = start !== null && t >= start && (p.tDrop === null || t < p.tDrop);
    const placed = p.tDrop !== null && t >= p.tDrop;
    return { id: p.id, carried, placed, visible: (carried || placed) && fade > 0.001, scale: placed ? fade : 1, grow: p.tPick > 0 ? smooth((t - p.tPick) / 0.3) : 1 };
  });
  // The crew at a lot wave when somebody arrives at their door or drops a crate in their yard.
  const waves = {};
  plan.actors.forEach((a) => a.actions.forEach((x) => {
    if (!x.lot) return;
    const u = (t - (x.t - 0.6)) / 1.8;
    if (u > 0 && u < 1) waves[x.lot] = Math.max(waves[x.lot] || 0, Math.sin(u * PI));
  }));
  return { actors, props, waves, fade };
}
