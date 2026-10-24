// Creature-combat module for the diorama kit.
//
// The four things that break in a two-actor fight, fixed once:
//   aimYaw        stage-local aiming (world bearings into local rotations is a bug)
//   headAnchor    effect anchors in bone space, so flames stay on the mouth
//   uprightQuat   flat effects facing the lens without an arbitrary roll
//   hurtAt        one severity model instead of four ad-hoc hit blocks
//   sendOut       throw, arc, open, burst, exit, ball returns
//
// Import what you need. Nothing here touches the scene graph directly.

import * as THREE from 'three';

const TAU = Math.PI * 2;
export const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const outCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const inOut = (t) => 0.5 - 0.5 * Math.cos(clamp(t) * Math.PI);
export const shortAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _u = new THREE.Vector3();
const _m = new THREE.Matrix4();

/**
 * Yaw for an actor that must look at a target, computed inside the stage frame.
 *
 * Both rigs look down their own +Z and sit under a stage root that may be
 * rotated. Reading a world bearing and writing it to a local rotation aims the
 * pair past each other, toward the lens. Pass the camera direction converted
 * into stage-local space as camLocalX, plus a small cheat so they favour the
 * camera by a few degrees.
 *
 * @param {{x:number,z:number}} from    actor position, stage-local
 * @param {{x:number,z:number}} to      target position, stage-local
 * @param {number} camLocalX            stage-local camera bearing
 * @param {number} [cheat=0]            radians to lean toward camera
 * @returns {number} rotation.y for the actor's pivot
 */
export function aimYaw(from, to, camLocalX, cheat = 0) {
  const want = Math.atan2(to.x - from.x, to.z - from.z);
  const d = shortAngle(camLocalX - want);
  return want + Math.sign(d) * Math.min(Math.abs(d), cheat);
}

/**
 * A point in a bone's local space, offset by the pivot's forward/up/side.
 * Bake it once at build time; use the result every frame.
 *
 * @param {THREE.Object3D} bone
 * @param {THREE.Object3D} pivot   the actor root that defines forward
 * @param {number} forward         metres forward of the pivot
 * @param {number} up              metres above the pivot
 * @param {number} [side=0]        metres to the pivot's left
 * @returns {THREE.Vector3} point in bone-local space
 */
export function headAnchor(bone, pivot, forward, up, side = 0) {
  pivot.updateMatrixWorld(true);
  bone.updateMatrixWorld(true);
  pivot.getWorldDirection(_f).setY(0).normalize();
  _r.crossVectors(UP, _f).normalize().negate(); // pivot's left
  _v.copy(pivot.localToWorld(new THREE.Vector3(0, up, 0))).addScaledVector(_f, forward).addScaledVector(_r, side);
  return bone.worldToLocal(_v);
}

/**
 * Orient a flat effect (kanji blast, rune, splash card) to face the lens with a
 * guaranteed upright roll. setFromUnitVectors picks an arbitrary roll and is the
 * reason blasts arrive upside down.
 *
 * @param {THREE.Object3D} mesh
 * @param {THREE.Vector3} viewDir  unit vector from effect toward camera
 */
export function uprightQuat(mesh, viewDir) {
  _r.crossVectors(UP, viewDir).normalize();
  _u.crossVectors(viewDir, _r).normalize();
  _m.makeBasis(_r, _u, viewDir);
  mesh.quaternion.setFromRotationMatrix(_m);
}

/**
 * Build a severity table for hits. Feed it every blow in the beat sheet, sorted
 * by time, and it returns the pose weight for the current frame.
 *
 * @param {Array<{t0:number,dur:number,tip:number,air:number,settle:[number,number]}>} hits
 * @returns {(t:number) => {h:object,a:number,k:number}|null}
 */
export function makeHurtModel(hits) {
  return function hurtAt(t) {
    let best = null;
    for (const h of hits) {
      const a = (t - h.t0) / h.dur;
      if (a < 0 || a > 1) continue;
      const rise = outCubic(clamp(a / 0.16));
      const settle = smoothstep(h.settle[0], h.settle[1], a);
      const k = rise * (1 - settle);
      if (!best || k > best.k) best = { h, a, k };
    }
    return best && best.k > 0.002 ? best : null;
  };
}

/**
 * Mix a flinch pose into an existing pose and add the physical arc.
 *
 * @param {object} pose     the actor's current pose object
 * @param {object} flinch   pose fragment for a hurt reaction
 * @param {{h:object,a:number,k:number}} hurt  from hurtAt()
 * @param {(a:object,b:object,w:number)=>object} mixP  the rig's pose mixer
 * @param {{t:number, heavyRef?:number}} ctx
 * @returns {object} pose
 */
export function applyHurt(pose, flinch, hurt, mixP, ctx) {
  const { h, a, k } = hurt;
  const heavy = k * clamp(h.tip / (ctx.heavyRef ?? 1.25), 0.45, 1);
  const out = mixP(pose, flinch, heavy);
  // a small vertical arc so the feet leave the ground on the big ones
  out.rootY = (out.rootY ?? 0) + Math.sin(clamp(a / 0.55) * Math.PI) * h.air;
  // and a shudder while he is still stunned
  if (a > 0.30 && a < 0.85) out.rootTilt = (out.rootTilt ?? 0) + Math.sin(ctx.t * 24) * 0.035 * k;
  return out;
}

/**
 * Send-out geometry: the trainer throws the ball, it arcs to the mark, opens
 * with a burst, and the ball comes back to the hand. Pure function of time.
 *
 * @param {number} t
 * @param {{release:number,land:number,open:number,retStart:number,retEnd:number}} at
 * @param {THREE.Vector3} hand   release point (the trainer's wrist, world or stage-local)
 * @param {THREE.Vector3} mark   where the creature will stand
 * @param {number} [arc=1.2]     apex of the throw, metres above the straight line
 * @returns {{visible:boolean,pos:THREE.Vector3,open:number,held:boolean,emerge:number,roll?:number}}
 */
export function sendOut(t, at, hand, mark, arc = 1.2) {
  const out = { visible: false, pos: new THREE.Vector3(), open: 0, held: true, emerge: 0 };
  const land = mark.clone().setY(mark.y + 0.10);
  if (t < at.release - 0.02) return out;

  out.visible = true;
  out.held = false;

  if (t < at.land) {
    const u = clamp((t - at.release) / (at.land - at.release));
    out.pos.copy(hand).lerp(land, outCubic(u));
    out.pos.y += Math.sin(u * Math.PI) * arc * (0.55 + 0.45 * (1 - u));
    out.roll = u * 14;
    return out;
  }

  if (t < at.retStart) {
    out.pos.copy(land);
    out.pos.y += Math.sin((t - at.land) * 9) * 0.012;
    // wide open to let it out, shut again before the return
    out.open = smoothstep(at.open - 0.04, at.open + 0.06, t) * (1 - smoothstep(at.retStart - 0.16, at.retStart - 0.02, t));
    out.emerge = smoothstep(at.open, at.open + 0.34, t);
    return out;
  }

  const u = clamp((t - at.retStart) / (at.retEnd - at.retStart));
  out.pos.copy(land).lerp(hand, inOut(u));
  out.pos.y += Math.sin(u * Math.PI) * 0.55;
  out.open = 1 - smoothstep(0, 0.25, u);
  out.roll = u * 10;
  if (u >= 1) out.held = true;
  return out;
}
