import * as THREE from 'three';
import { clamp, lerp, smooth } from '../config.js';
import {
  STAND,
  SEATED,
  REACH,
  CROUCH_IN,
  SIT_EDGE,
  LEGS_IN,
  mixPose,
} from './poses.js';

/**
 * Getting in and out of a seat: the whole move, authored in the CAR's own frame
 * so it works at any parking angle.
 *
 * Why this ships as code rather than as advice: it is the single most fragile
 * thing in a vehicle play. Every previous attempt failed the same three ways,
 * and none of them are visible in a still:
 *
 *   1. A straight lerp from the pavement to the seat drags the body through the
 *      door skin. The climb has to be keyed: knees drop, hips land on the sill,
 *      then the legs swing in.
 *   2. The outbound yaw points away from the car. Reused on the way in, it makes
 *      the figure climb in backwards, face to the street, and turn a half circle
 *      during the first frames. On the way in, every key before the seated ones
 *      faces the car.
 *   3. Taking that facing from the approach path's tangent is wrong: the path's
 *      opening segment runs along the street, so `path.at(0).yaw + PI` points
 *      down the kerb. Resolve it from the seat and stand positions.
 *
 * Usage, per figure:
 *
 *   const seat  = { x: side * 0.40, z: 0.30, y: SEAT_ROOT_Y };
 *   const stand = toWorld(car, side * 2.00, seat.z - 0.30);
 *   const r = transfer(t, t0, 1.15, car, side, seat, stand, face, false);
 *   place(actor, r.pos, r.yaw, r.pose);
 *
 * where `face = Math.atan2(seatWorld.x - stand.x, seatWorld.z - stand.z)`.
 */

const PI = Math.PI;

/** Seat root: cushion top minus hipY, so the hips settle into the cushion. */
export const SEAT_ROOT_Y = -0.38;
/** How far out from the car's centreline the stand spot sits. */
export const DOOR_STAND_X = 2.0;
/** Stand this far behind the hinge, so the open leaf clears the shoulders. */
export const DOOR_STAND_DZ = -0.06;
/** The stand spot used by the climb itself, inside the outer stand spot. */
export const DOOR_NEAR_X = 1.34;
/** Share of the transfer window spent taking the stride to the door. */
export const STEP_SHARE = 0.26;

export function toWorld(base, x, z) {
  const c = Math.cos(base.yaw);
  const s = Math.sin(base.yaw);
  return new THREE.Vector3(base.x + x * c + z * s, 0, base.z - x * s + z * c);
}

export function clampAngle(a) {
  let x = a;
  while (x > PI) x -= PI * 2;
  while (x < -PI) x += PI * 2;
  return x;
}

export const lerpAngle = (a, b, k) => a + clampAngle(b - a) * k;

/**
 * The climb. k runs 0 at the open door to 1 at the seat; dy is the root height
 * above the seated root. The body only reaches cushion height once the hips are
 * over the sill, which is what stops it sinking, floating or sliding through the
 * bodywork.
 */
export const CLIMB = [
  { u: 0.0, k: 0.0, dy: 0.38, pose: STAND },
  { u: 0.16, k: 0.03, dy: 0.33, pose: REACH }, // hand to the roof edge
  { u: 0.36, k: 0.16, dy: 0.12, pose: CROUCH_IN }, // knees deep, hips dropping
  { u: 0.56, k: 0.38, dy: 0.01, pose: SIT_EDGE }, // perched, feet still down
  { u: 0.76, k: 0.66, dy: 0.0, pose: LEGS_IN }, // knees up, feet over the sill
  { u: 0.9, k: 0.88, dy: 0.0, pose: mixPose(LEGS_IN, SEATED, 0.55) },
  { u: 1.0, k: 1.0, dy: 0.0, pose: SEATED },
];

export function climbAt(u) {
  let a = CLIMB[0];
  let b = CLIMB[CLIMB.length - 1];
  for (let i = 1; i < CLIMB.length; i++) {
    if (u <= CLIMB[i].u) {
      a = CLIMB[i - 1];
      b = CLIMB[i];
      break;
    }
  }
  const f = smooth(clamp((u - a.u) / Math.max(0.0001, b.u - a.u), 0, 1));
  return { k: lerp(a.k, b.k, f), dy: lerp(a.dy, b.dy, f), pose: mixPose(a.pose, b.pose, f) };
}

/** One stride on the pavement, used at both ends of the climb. */
export function stepPose(f) {
  const lift = Math.sin(PI * clamp(f, 0, 1));
  return {
    ...STAND,
    torso: [0.06 + 0.08 * f, 0, 0],
    head: [-0.02, 0, 0],
    hipL: [-0.36 * lift, 0, 0.04],
    hipR: [0.22 * lift, 0, -0.04],
    kneeL: [0.1 + 0.55 * lift, 0, 0],
    kneeR: [0.16, 0, 0],
    ankleL: [-0.1 - 0.16 * lift, 0, 0],
    ankleR: [-0.1, 0, 0],
  };
}

/**
 * The whole move between the pavement and a seat.
 *
 *   t          timeline seconds
 *   t0         window start
 *   dur        window length; 1.05 to 1.20 s each way, never under 0.9
 *   state      the car: { x, z, yaw } (plus optional y offset)
 *   side       -1 or +1: which flank the door is on, in car space
 *   seat       { x, z, y } seat root in car space
 *   standPos   pavement spot, world Vector3 ({x,y,z})
 *   standYaw   heading to hold when standing (only used on the way out)
 *   inward     true to climb in, false to climb out
 *
 * Returns { pos, yaw, pose }. Assign it to the actor's group and call setPose.
 */
export function transfer(t, t0, dur, state, side, seat, standPos, standYaw, inward) {
  const u = clamp((t - t0) / Math.max(0.1, dur), 0, 1);
  const A = STEP_SHARE;
  const faceYaw = state.yaw - side * (PI / 2); // square to the open door
  const door = toWorld(state, side * DOOR_NEAR_X, seat.z + DOOR_STAND_DZ);
  door.y = 0;

  const climbPos = (v) => {
    const c = climbAt(clamp(v, 0, 1));
    const p = toWorld(
      state,
      lerp(side * DOOR_NEAR_X, seat.x, c.k),
      lerp(seat.z + DOOR_STAND_DZ, seat.z, c.k)
    );
    p.y = seat.y + c.dy + (state.y ?? 0);
    return { c, p };
  };

  if (inward) {
    // One stride up to the door, facing the car the whole way.
    if (u < A) {
      const f = smooth(u / A);
      const pos = new THREE.Vector3().lerpVectors(standPos, door, f);
      return { pos, yaw: lerpAngle(standYaw, faceYaw, f), pose: stepPose(f) };
    }
    const v = (u - A) / (1 - A);
    const { c, p } = climbPos(v);
    // Turn to face the windscreen only once the hips are on the cushion, so the
    // shoulders never sweep through the door frame or the roof.
    const turn = smooth(clamp((v - 0.62) / 0.3, 0, 1));
    return { pos: p, yaw: lerpAngle(faceYaw, state.yaw, turn), pose: c.pose };
  }

  if (u < 1 - A) {
    const v = u / (1 - A);
    const { c, p } = climbPos(1 - v);
    const turn = smooth(clamp(v / 0.34, 0, 1));
    return { pos: p, yaw: lerpAngle(state.yaw, faceYaw, turn), pose: c.pose };
  }
  const f = smooth((u - (1 - A)) / A);
  const pos = new THREE.Vector3().lerpVectors(door, standPos, f);
  return { pos, yaw: lerpAngle(faceYaw, standYaw, f), pose: stepPose(f) };
}

/**
 * Where to stand. 2.00 m out and 0.30 behind the hinge for a front seat, 0.55
 * for a rear: an open leaf hangs in its hinge's plane, so an exit level with the
 * seat puts shoulders and head through the door skin, and 0.72 behind the front
 * leaves the two occupants 1.2 m apart instead of 0.8, where two figures merge
 * into one silhouette at this scale.
 */
export function standSpot(state, side, seatZ) {
  return toWorld(state, side * DOOR_STAND_X, seatZ + DOOR_STAND_DZ - (seatZ > 0 ? 0.24 : 0.49));
}
