/**
 * Occupied-space audit of a generated plan, with the kit's own checker
 * (templates/action-clearance.mjs). Nothing here is a second collision system:
 * it only turns the plan into named proxies and hands them to auditMotion.
 *
 *   import * as THREE from 'three';
 *   import { createActionClearance } from '../action-clearance.mjs';
 *   const result = auditPlan(plan, THREE, createActionClearance);
 *   if (!result.clear || !result.coverageVerified) report(result.worstCases);
 *
 * Proxies (world units):
 *   every static piece (building, landmark, lamp, pole, cart, crate, scatter):
 *     one OBB around all its parts above walking height (steps and ground
 *     plates are walked on). A piece is never accessible, so its envelope is
 *     the occupied space, conservatively including roofs and story details.
 *   every person (actors and crew): legs, feet, torso, head and an arm region
 *     that follows the gesture (rest, reach, set down, carry, wave), sized from the
 *     posed rig and scaled with the figure (cast.js BODY, figureScale).
 *   every delivered crate: an OBB in front of the carrier while carried, in its
 *     yard slot once dropped.
 * Named contacts, each exact in its pair and window: a person's own joints; a crate
 * in its own carrier's hands; a crate lifted off the cart; a hand knocking on the
 * door it visits; hands reaching over a stack to set down or lift a crate.
 * A person or crate that is not on the slab yet (a visitor beyond the edge, a
 * crate not picked up) is parked far below the slab, one slot each, so it
 * cannot meet anything: that is its absence, not an exemption.
 *
 * `requiredIds` is built from the plan's inventory (pieces, actors, crew,
 * crates) by a fixed naming scheme, independently of the proxy builder, so a
 * missing proxy fails coverage instead of passing silently.
 */
import { castAt, BODY, carryPoint, carryYaw, CARRY, figureScale, strideOf } from './cast.js';

const WALK_ON = 0.1; // parts whose top is below this (relative to the piece) are walked on
export { CARRY } from './cast.js';

function rotY(x, z, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return [x * c + z * s, -x * s + z * c];
}

/**
 * Axis-aligned local bounds of one grammar part, from the same vertices the mesher
 * draws: scale first, then the part's Euler rotation (XYZ), then its position,
 * which is the order THREE composes them in.
 */
function partBounds(pt) {
  const a = pt.a;
  const pts = [];
  if (pt.g === 'box') {
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) pts.push([x * a[0] / 2, y * a[1] / 2, z * a[2] / 2]);
  } else if (pt.g === 'cyl' || pt.g === 'cone') {
    const n = pt.seg ?? 8;
    const [rTop, rBottom, h] = pt.g === 'cyl' ? [a[0], a[1], a[2]] : [0, a[0], a[1]];
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2;
      pts.push([Math.sin(t) * rBottom, -h / 2, Math.cos(t) * rBottom]);
      pts.push([Math.sin(t) * rTop, h / 2, Math.cos(t) * rTop]);
    }
  } else if (pt.g === 'pyramid') {
    const [w, h, d] = a;
    pts.push([-w / 2, 0, -d / 2], [w / 2, 0, -d / 2], [w / 2, 0, d / 2], [-w / 2, 0, d / 2], [0, h, 0]);
  } else if (pt.g === 'prism') {
    const [w, h, d] = a;
    for (const x of [-w / 2, w / 2]) { pts.push([x, 0, -d / 2], [x, 0, d / 2], [x, h, 0]); }
  } else {
    // sphere and torus: their bounding box (conservative, a few percent)
    const r = pt.g === 'sphere' ? a[0] : a[0] + a[1];
    const ry = pt.g === 'sphere' ? r : a[0] + a[1];
    const rz = pt.g === 'sphere' ? r : a[1];
    for (const x of [-r, r]) for (const y of [-ry, ry]) for (const z of [-rz, rz]) pts.push([x, y, z]);
  }
  const [sx, sy, sz] = [pt.sx ?? 1, pt.sy ?? 1, pt.sz ?? 1];
  const [ax, ay, az] = [pt.rx || 0, pt.ry || 0, pt.rz || 0];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const v0 of pts) {
    let [x, y, z] = [v0[0] * sx, v0[1] * sy, v0[2] * sz];
    [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
    [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
    [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
    const v = [pt.p[0] + x, pt.p[1] + y, pt.p[2] + z];
    for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], v[i]); max[i] = Math.max(max[i], v[i]); }
  }
  return { min, max };
}

/** Local bounds of a part list above walking height, or null when it is all walk-on. */
export function localEnvelope(list) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const pt of list) {
    const b = partBounds(pt);
    if (b.max[1] < WALK_ON) continue;
    for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], b.min[i]); max[i] = Math.max(max[i], b.max[i]); }
  }
  return isFinite(min[0]) ? { x0: min[0], y0: Math.max(min[1], WALK_ON), z0: min[2], x1: max[0], y1: max[1], z1: max[2] } : null;
}

/**
 * Largest horizontal distance of any occupied vertex from the piece origin, and the
 * vertical range: the vertical capsule that bounds a round piece (a tree, a tower, a
 * fountain) far tighter than its box.
 */
export function pieceRadius(piece) {
  let r = 0, y0 = Infinity, y1 = -Infinity;
  for (const pt of piece.parts.concat(piece.glow)) {
    const b = partBounds(pt);
    if (b.max[1] < WALK_ON) continue;
    for (const x of [b.min[0], b.max[0]]) for (const z of [b.min[2], b.max[2]]) r = Math.max(r, Math.hypot(x, z));
    y0 = Math.min(y0, Math.max(b.min[1], WALK_ON)); y1 = Math.max(y1, b.max[1]);
  }
  const s = piece.at.s ?? 1;
  return isFinite(y0) ? { r: r * s, y0: y0 * s, y1: y1 * s } : null;
}

/** One world OBB around a piece's occupied parts, or null when it is all walk-on. */
export function pieceBox(piece) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const pt of piece.parts.concat(piece.glow)) {
    const b = partBounds(pt);
    if (b.max[1] < WALK_ON) continue;
    for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], b.min[i]); max[i] = Math.max(max[i], b.max[i]); }
  }
  if (!isFinite(min[0])) return null;
  const s = piece.at.s ?? 1;
  const c = [(min[0] + max[0]) / 2 * s, (Math.max(min[1], WALK_ON) + max[1]) / 2 * s, (min[2] + max[2]) / 2 * s];
  const half = [(max[0] - min[0]) / 2 * s, (max[1] - Math.max(min[1], WALK_ON)) / 2 * s, (max[2] - min[2]) / 2 * s].map((h) => Math.max(h, 0.01));
  const [wx, wz] = rotY(c[0], c[2], piece.at.yaw);
  const q = [0, Math.sin(piece.at.yaw / 2), 0, Math.cos(piece.at.yaw / 2)];
  return { center: [piece.at.x + wx, piece.at.y + c[1], piece.at.z + wz], half, q };
}

export { boxesTouch } from './boxes.js';

/** Somebody not on the slab yet (or a crate not lifted yet) waits here: far below, one slot each. */
const AWAY = (n) => [0, -1000 - n * 10, 0];

/** The body regions every person is audited with (see cast.js BODY). */
export const REGIONS = ['legs', 'feet', 'torso', 'head', 'arm'];

/**
 * The independent inventory: every proxy the plan must be audited with, named from the
 * plan's own lists (every piece, every person times REGIONS, every crate). A piece or
 * person the proxy builder forgot fails coverage instead of passing.
 */
export function requiredIds(plan) {
  const ids = [];
  for (const p of plan.pieces) ids.push('piece:' + p.id);
  for (const a of plan.actors) for (const r of REGIONS) ids.push(`${a.id}/${r}`);
  for (const c of plan.crew) for (const r of REGIONS) ids.push(`${c.id}/${r}`);
  for (const p of plan.props) ids.push(p.id);
  return ids;
}

export function auditPlan(plan, THREE, createActionClearance, opts = {}) {
  const c = createActionClearance(THREE);
  let state = castAt(plan, 0);
  const at = (t) => { state = castAt(plan, ((t % plan.loop) + plan.loop) % plan.loop); };
  const { hx, hz } = plan.slab;
  const parts = [];
  for (const p of plan.pieces) {
    const box = pieceBox(p);
    if (!box) {
      // Wholly walk-on (nothing above WALK_ON): a token proxy below its own ground.
      parts.push({ id: 'piece:' + p.id, owner: p.id, getShape: () => c.sphere([p.at.x, p.at.y - 0.5, p.at.z], 0.01) });
      continue;
    }
    // Whichever bound is tighter: the box, or (for round pieces) the vertical capsule
    // through the origin whose radius reaches the farthest occupied vertex corner.
    const rad = pieceRadius(p);
    const boxArea = 4 * box.half[0] * box.half[2];
    const shape = rad && Math.PI * rad.r * rad.r < boxArea
      ? c.capsule([p.at.x, p.at.y + rad.y0 + Math.min(rad.r, (rad.y1 - rad.y0) / 2), p.at.z], [p.at.x, p.at.y + rad.y1 - Math.min(rad.r, (rad.y1 - rad.y0) / 2), p.at.z], rad.r)
      : c.obb(box.center, box.half, box.q);
    parts.push({ id: 'piece:' + p.id, owner: p.id, getShape: () => shape });
  }

  // People: legs, feet (a stride fore and aft), torso (shoulder span), head (with hat)
  // and one arm region that follows the pose: at rest inside the torso, reaching
  // 0.5 m forward on a knock, talk or set-down, to the crate while carrying, up and
  // out on a wave. All scaled by the figure's scale.
  const body = (id, seed, where, gesture, n) => {
    const k = figureScale(seed);
    const away = (o) => c.sphere(AWAY(n + o), 0.05);
    const fwd = (w) => [Math.sin(w.yaw), Math.cos(w.yaw)];
    parts.push({ id: `${id}/legs`, owner: id, getShape: () => { const w = where(); return w ? c.capsule([w.x, w.y + 0.08 * k, w.z], [w.x, w.y + 0.8 * k, w.z], BODY.legs * k) : away(0); } });
    parts.push({ id: `${id}/feet`, owner: id, getShape: () => {
      const w = where(); if (!w) return away(0.15);
      const [fx, fz] = fwd(w);
      const stride = strideOf(w) * k; // feet together when standing, a full stride mid-walk
      return c.capsule([w.x - fx * stride, w.y + 0.12, w.z - fz * stride], [w.x + fx * stride, w.y + 0.12, w.z + fz * stride], BODY.foot * k);
    } });
    parts.push({ id: `${id}/torso`, owner: id, getShape: () => { const w = where(); return w ? c.capsule([w.x, w.y + 0.88 * k, w.z], [w.x, w.y + 1.32 * k, w.z], BODY.torso * k) : away(0.3); } });
    parts.push({ id: `${id}/head`, owner: id, getShape: () => { const w = where(); return w ? c.capsule([w.x, w.y + 1.5 * k, w.z], [w.x, w.y + 1.66 * k, w.z], BODY.head * k) : away(0.45); } });
    parts.push({ id: `${id}/arm`, owner: id, getShape: () => {
      const w = where(); if (!w) return away(0.6);
      const [fx, fz] = fwd(w);
      const g = gesture();
      const sh = [w.x + fx * 0.1 * k, w.y + 1.28 * k, w.z + fz * 0.1 * k];
      if (g === 'wave') {
        const rx = Math.cos(w.yaw), rz = -Math.sin(w.yaw); // the right hand, raised
        return c.capsule([w.x + rx * 0.2 * k, w.y + 1.3 * k, w.z + rz * 0.2 * k], [w.x + rx * 0.45 * k, w.y + 1.84 * k, w.z + rz * 0.45 * k], 0.08 * k);
      }
      if (g === 'reach') return c.capsule(sh, [w.x + fx * 0.5 * k, w.y + 1.1 * k, w.z + fz * 0.5 * k], BODY.arm * k);
      if (g === 'low') return c.capsule(sh, [w.x + fx * 0.5 * k, w.y + 0.6 * k, w.z + fz * 0.5 * k], BODY.arm * k);
      if (g === 'carry') return c.capsule(sh, [w.x + fx * CARRY.forward * k, w.y + CARRY.height * k, w.z + fz * CARRY.forward * k], BODY.arm * k);
      return c.capsule([w.x, w.y + 1.0 * k, w.z], [w.x, w.y + 1.2 * k, w.z], BODY.arm * k);
    } });
  };
  const onSlab = (s) => Math.abs(s.x) < hx + 0.3 && Math.abs(s.z) < hz + 0.3;
  const contacts = [];
  // A person's own regions meet at their joints, always (hip, ankle, neck, shoulder).
  const joints = (id) => {
    const J = (a, b, d, why) => contacts.push({ a: `${id}/${a}`, b: `${id}/${b}`, start: 0, end: plan.loop, maxPenetration: d, reason: why });
    J('legs', 'torso', 0.5, 'hip joint: legs meet torso');
    J('legs', 'feet', 0.4, 'ankle joint: legs meet feet');
    J('torso', 'head', 0.36, 'neck joint: torso meets head');
    J('arm', 'torso', 0.48, 'shoulder joint: the arm hangs from the torso');
    J('arm', 'head', 0.3, 'a hand raised to the brow or in a wave passes the head');
    J('arm', 'legs', 0.3, 'a hand lowered to set a crate down passes the knees');
  };
  plan.actors.forEach((a) => joints(a.id));
  plan.crew.forEach((cw) => joints(cw.id));
  const gestureOf = (s) => {
    if (s.carry && !(s.action && (s.action.kind === 'drop' || s.action.kind === 'pickup'))) return 'carry';
    if (!s.action) return 'rest';
    if (s.action.kind === 'drop' || s.action.kind === 'pickup') return 'low';
    return 'reach';
  };
  plan.actors.forEach((a, i) => body(a.id, a.seed, () => { const s = state.actors[i]; return onSlab(s) ? s : null; }, () => gestureOf(state.actors[i]), i));
  plan.crew.forEach((cw, i) => body(cw.id, cw.seed, () => cw, () => ((state.waves[cw.lot] || 0) > 0.01 ? 'wave' : 'rest'), 100 + i));

  // Scoped contacts for what the hands are meant to touch, in their windows only.
  const stockOf = (lotId) => plan.pieces.filter((x) => x.id.startsWith('stock:' + lotId + ':')).map((x) => 'piece:' + x.id);
  plan.actors.forEach((a) => a.actions.forEach((x) => {
    if (x.kind === 'look' && x.lot) contacts.push({ a: `${a.id}/arm`, b: 'piece:building:' + x.lot, start: x.t0, end: x.t1, maxPenetration: 0.3, reason: 'knocking on the door' });
    if (x.kind === 'look' && x.place === 'cart') contacts.push({ a: `${a.id}/arm`, b: 'piece:cart', start: x.t0, end: x.t1, maxPenetration: 0.3, reason: 'a hand on the cart while looking it over' });
    if (x.kind === 'drop' || x.kind === 'pickup') {
      const pr = plan.props.find((q) => q.id === x.prop);
      const lot = x.kind === 'drop' ? pr?.lot : pr?.from === 'yard' ? a.homeLot : null;
      if (lot) for (const sid of stockOf(lot)) contacts.push({ a: `${a.id}/arm`, b: sid, start: x.t0, end: x.t1, maxPenetration: 0.2, reason: 'hands reach over the stack to set down or lift a crate' });
      if (pr?.from === 'cart' && x.kind === 'pickup') contacts.push({ a: `${a.id}/arm`, b: 'piece:cart', start: x.t0, end: x.t1, maxPenetration: 0.25, reason: 'hands lift a crate off the cart' });
    }
  }));
  const actorIndex = new Map(plan.actors.map((a, i) => [a.id, i]));
  plan.props.forEach((pr, n) => {
    const carrier = plan.actors[actorIndex.get(pr.carriedBy)];
    const ks = figureScale(carrier ? carrier.seed : 0.5);
    parts.push({ id: pr.id, owner: pr.carriedBy, getShape: () => {
      const s = state.props[n];
      if (s.placed) return c.obb([pr.pos.x, pr.pos.y + 0.175, pr.pos.z], [0.18, 0.175, 0.18], [0, Math.sin(pr.pos.yaw / 2), 0, Math.cos(pr.pos.yaw / 2)]);
      if (!s.carried) return c.sphere(AWAY(200 + n), 0.05);
      const a = state.actors[actorIndex.get(pr.carriedBy)];
      if (!onSlab(a)) return c.sphere(AWAY(200 + n), 0.05);
      // Held where build3d.js draws it (between the hands of the carry pose, scaled with
      // the figure), on the shared carry path and turn when it is lifted or set down.
      const mine = a.carry && a.carry.prop === pr.id;
      const k = mine ? a.carry.lower : 0;
      const rest = mine && a.carry.toward === 'source' ? pr.src ?? pr.pos : pr.pos;
      const hand = { x: a.x + Math.sin(a.yaw) * CARRY.forward * ks, z: a.z + Math.cos(a.yaw) * CARRY.forward * ks, y: a.y + CARRY.height * ks - 0.175 };
      const q = carryPoint(hand, rest, k);
      const yaw = carryYaw(a.yaw, rest, k);
      return c.obb([q.x, q.y + 0.175, q.z], [0.18, 0.175, 0.18], [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)]);
    } });
    const start = pr.tPick === -1 ? 0 : pr.tPick ?? 0;
    const end = (pr.tDrop ?? plan.loop) + 0.01;
    for (const r of ['torso', 'legs', 'arm']) {
      contacts.push({ a: pr.id, b: `${pr.carriedBy}/${r}`, start: Math.max(0, start - 0.6), end: Math.min(plan.loop, end + 0.6), maxPenetration: r === 'arm' ? 0.4 : 0.2, reason: 'crate held in its own carrier hands' });
    }
    // Taken off the cart: the crate leaves the cart's load in the carrier's hands.
    if (pr.from === 'cart' && pr.tPick > 0) {
      contacts.push({ a: pr.id, b: 'piece:cart', start: pr.tPick - 0.7, end: pr.tPick + 1.0, maxPenetration: 0.15, reason: 'crate lifted off the top of the cart load' });
    }
  });
  const events = [];
  plan.actors.forEach((a) => {
    a.legs.forEach((l) => events.push(l.t0, l.t1));
    a.actions.forEach((x) => events.push(x.t0, x.t, x.t1));
  });
  const times = c.timesForInterval(0, plan.loop, { maxStep: opts.maxStep ?? 0.1, eventTimes: events.filter((t) => t >= 0 && t <= plan.loop) });
  // The kit's checker takes one contact rule per pair, but one person may knock on the same
  // door twice or set down two crates on one stack. Each pair keeps every window it was given:
  // a sample is judged with the window of that pair that holds its time (overlapping windows
  // merge), so an allowance never stretches across the gap between two errands.
  const windows = new Map();
  for (const ct of contacts) {
    const k = [ct.a, ct.b].sort().join('|');
    if (!windows.has(k)) windows.set(k, []);
    windows.get(k).push({ ...ct });
  }
  for (const [k, list] of windows) {
    list.sort((p, q) => p.start - q.start);
    const merged = [];
    for (const w of list) {
      const last = merged[merged.length - 1];
      if (last && w.start <= last.end) { last.end = Math.max(last.end, w.end); last.maxPenetration = Math.max(last.maxPenetration, w.maxPenetration); }
      else merged.push(w);
    }
    windows.set(k, merged);
  }
  const rulesAt = (t) => [...windows.values()].map((list) => list.find((w) => t >= w.start && t <= w.end) ?? list[0]);
  const required = requiredIds(plan);
  const clearance = opts.clearance ?? 0.01;
  // auditMotion's own aggregation, with the rules chosen per sample; each pose is judged by
  // the kit's auditPose unchanged.
  const samples = times.map((time) => { at(time); return { time, ...c.auditPose({ parts, requiredIds: required, clearance, contacts: rulesAt(time), time }) }; });
  const worst = new Map();
  for (const smp of samples) for (const x of smp.collisions) { const k = x.a + '|' + x.b; if (!worst.has(k) || x.separation < worst.get(k).separation) worst.set(k, x); }
  return { clear: samples.every((x) => x.clear), coverageVerified: samples.every((x) => x.coverageVerified), sampledOnly: true, samples, worstCases: [...worst.values()], methods: [...new Set(samples.flatMap((x) => x.methods))].sort() };
}
