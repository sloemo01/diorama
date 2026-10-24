import * as THREE from 'three';
import { clamp, lerp, smooth, groundY } from '../config.js';
import { STAND } from './poses.js';
import { transfer, standSpot, SEAT_ROOT_Y, toWorld } from './transfer.js';

/**
 * The beat sheet, and the actor loop that reads it.
 *
 * Everything here is a pure function of `t`. No state is carried between frames,
 * nothing integrates, nothing calls Math.random: any frame can be frozen with
 * ?t= and the loop restarts without drift. That property is what makes the QA
 * harness possible, so keep it.
 *
 * This file is scaffolding, not a scene. It ships the one structure that is easy
 * to get wrong and tedious to rewrite: a table of beats, a keyed scalar curve, a
 * place() that keeps the contact shadow glued to the actor, and an actor loop
 * whose branches are ordered by time so exactly one of them runs per frame.
 * Replace the cast, the tracks and the beats; keep the skeleton.
 */

export const TL = {
  loop: 20.0,
  driveIn: [0.4, 3.0],
  doorsOpen: [3.1, 3.5],
  out: [3.4, 3.65, 3.9], // one start per actor
  outDur: 1.15,
  walk: [4.9, 5.2, 5.5],
  walkDur: 4.0,
  back: [11.0, 11.2, 11.4],
  backDur: 2.4,
  in: [15.0, 15.25, 15.5],
  inDur: 1.05,
  doorsClose: [16.6, 17.0],
  pull: [17.1, 19.6],
};

const PI = Math.PI;

const CAR_PARK = { x: -2.0, z: 2.4, yaw: PI / 2 };
const CAR_IN = { x: -12.0, z: CAR_PARK.z, yaw: PI / 2 };
const CAR_OUT_X = 14.0;

/** Keyed scalar: [[t, value, ease], ...]. Ease applies to the segment. */
export function keysAt(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease = 'smooth'] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = clamp((t - t0) / Math.max(0.0001, t1 - t0), 0, 1);
      const e = ease === 'out' ? 1 - (1 - u) ** 3 : ease === 'in' ? u ** 3 : smooth(u);
      return lerp(v0, v1, e);
    }
  }
  return keys[keys.length - 1][1];
}

/**
 * Put an actor somewhere with a pose, and keep its contact shadow on the ground
 * underneath it. `ground` overrides the sampled height for a figure standing on
 * something (a car roof, a table).
 */
export function place(actor, pos, yaw, pose, opts = {}) {
  const visible = opts.visible !== false;
  actor.group.visible = visible;
  actor.group.position.set(pos.x, pos.y, pos.z);
  actor.group.rotation.set(0, yaw, 0);
  const p = { ...pose };
  if (opts.headTurn) {
    p.head = [p.head?.[0] ?? 0, (p.head?.[1] ?? 0) + opts.headTurn, p.head?.[2] ?? 0];
  }
  actor.setPose(p);
  if (!actor.shadow) return;
  actor.shadow.visible = visible && opts.shadow !== false;
  if (!actor.shadow.visible) return;
  const gy = opts.ground ?? groundY(pos.x, pos.z);
  actor.shadow.position.set(pos.x, gy + 0.018, pos.z);
  const s = opts.shadowScale ?? 1;
  actor.shadow.scale.set(s, s * 0.82, 1);
  actor.shadow.material.opacity = opts.shadowOpacity ?? 0.62;
}

/** Car position as a function of time: in, parked, out. Never reversing. */
export function carState(t) {
  if (t < TL.driveIn[0]) return { ...CAR_IN, present: false };
  if (t < TL.driveIn[1]) {
    const u = clamp((t - TL.driveIn[0]) / (TL.driveIn[1] - TL.driveIn[0]), 0, 1);
    const e = 1 - (1 - u) ** 2.3;
    return { x: lerp(CAR_IN.x, CAR_PARK.x, e), z: CAR_PARK.z, yaw: CAR_PARK.yaw, present: true };
  }
  if (t < TL.pull[0]) return { ...CAR_PARK, present: true };
  if (t < TL.pull[1]) {
    const u = clamp((t - TL.pull[0]) / (TL.pull[1] - TL.pull[0]), 0, 1);
    const e = 0.32 * u + 0.68 * u * u;
    return { x: lerp(CAR_PARK.x, CAR_OUT_X, e), z: CAR_PARK.z, yaw: CAR_PARK.yaw, present: true };
  }
  return { x: CAR_OUT_X, z: CAR_PARK.z, yaw: CAR_PARK.yaw, present: false };
}

/**
 * @param world { scene, car, cast, doorPivot, doorSwing, makeTrack }
 */
export function createStage(world) {
  const { car, cast, makeTrack, setDoor } = world;

  // Seats, one per actor. Left flank (side -1) because that is the camera side.
  const side = -1;
  const seats = [
    { x: side * 0.4, z: 0.3, y: SEAT_ROOT_Y },
    { x: side * 0.4, z: -0.5, y: SEAT_ROOT_Y },
  ];
  const stands = seats.map((s) => standSpot(CAR_PARK, side, s.z));

  // Routes: pavement -> place -> back.
  const outTracks = stands.map((s, i) =>
    makeTrack([
      [s.x, s.z, 0],
      [s.x + 1.2, s.z + 0.5, 1],
      [1.0 + i * 0.9, 4.6, 0.6],
    ])
  );

  function seatPos(state, seat) {
    const p = toWorld(state, seat.x, seat.z);
    p.y = seat.y + (state.y ?? 0);
    return p;
  }

  function update(T) {
    const t = ((T % TL.loop) + TL.loop) % TL.loop;
    const state = carState(t);

    car.group.visible = state.present !== false;
    car.group.position.set(state.x, 0, state.z);
    car.group.rotation.y = state.yaw;

    // Doors are a timeline, not a state: open before a transfer, shut after.
    const open = keysAt(t, [
      [0, 0],
      [TL.doorsOpen[0], 0, 'out'],
      [TL.doorsOpen[1], 1],
      [TL.doorsClose[0], 1, 'in'],
      [TL.doorsClose[1], 0],
    ]);
    setDoor(world.doorPivot, open * world.doorSwing);

    for (let i = 0; i < cast.length; i++) {
      const a = cast[i];
      const seat = seats[i];
      const sp = seatPos(state, seat);
      const stand = stands[i];
      const track = outTracks[i];
      const out = TL.out[i];
      const walk = TL.walk[i];
      const back = TL.back[i];
      const into = TL.in[i];

      // Exactly one branch runs. Order matters: keep them monotonic in t.
      if (t < out) {
        place(a, sp, state.yaw, STAND, { shadow: false });
      } else if (t < out + TL.outDur) {
        const face = Math.atan2(sp.x - stand.x, sp.z - stand.z);
        const r = transfer(t, out, TL.outDur, state, side, seat, stand, face, false);
        place(a, r.pos, r.yaw, r.pose);
      } else if (t < walk) {
        const at = track.at(0);
        place(a, at.pos, at.yaw, STAND, { headTurn: Math.sin(t * 1.2 + i) * 0.18 });
      } else if (t < walk + TL.walkDur) {
        const u = clamp((t - walk) / TL.walkDur, 0, 1);
        const d = smooth(u) * track.length;
        const at = track.at(d);
        place(a, at.pos, at.yaw, world.walkPose(d * 5.2), { headTurn: Math.sin(t * 0.9) * 0.1 });
      } else if (t < back) {
        const at = track.at(track.length);
        place(a, at.pos, at.yaw + PI, STAND);
      } else if (t < back + TL.backDur) {
        const u = clamp((t - back) / TL.backDur, 0, 1);
        const d = track.length * (1 - smooth(u));
        const at = track.at(d);
        place(a, at.pos, at.yaw + PI, world.runPose(d * 5.6));
      } else if (t < into) {
        // A standing beat at the door. Never hand a run straight into a climb.
        const face = Math.atan2(sp.x - stand.x, sp.z - stand.z);
        place(a, stand, face, STAND, { headTurn: Math.sin(t * 0.9 + i) * 0.05 });
      } else if (t < into + TL.inDur) {
        const face = Math.atan2(sp.x - stand.x, sp.z - stand.z);
        const r = transfer(t, into, TL.inDur, state, side, seat, stand, face, true);
        place(a, r.pos, r.yaw, r.pose);
      } else {
        // Seated figures stay visible: an empty car driving off reads as a bug.
        place(a, sp, state.yaw, world.seatedPose ?? STAND, { shadow: false });
      }
    }
  }

  return { update, TL, carState };
}
