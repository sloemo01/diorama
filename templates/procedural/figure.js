/**
 * Procedural cast: a toy figure built from an outfit (palette names), and the
 * poses the errands need.
 *
 * Same rig as templates/peopleModel.js: 1.69 m, hip 0.86, head 0.584, the same
 * joint hierarchy, geometry hung down from each pivot, a sphere filler in every
 * joint, the same sign convention (+hip X swings the thigh back, +knee X bends
 * the heel back, -elbow X folds the forearm). Each joint is ONE vertex-coloured
 * mesh (11 draws per figure), because a seed can put twenty people on the slab.
 */
import * as THREE from 'three';
import { contactShadow } from '../detail.js';
import { Mesher } from './mesher.js';
import { lerp, clamp, smooth, TAU } from './rng.js';
import { figureScale } from './cast.js';

export const RIG = {
  hipY: 0.86, hipX: 0.1, thigh: 0.42, shin: 0.4,
  shoulderY: 0.415, shoulderX: 0.205, upperArm: 0.3, foreArm: 0.27, headY: 0.584,
};

function joint(fn, clip) {
  const m = new Mesher();
  fn(m);
  return m.mesh({ cast: true, receive: false, clip });
}
const box = (m, w, h, d, c, x, y, z, o = {}) => m.part({ g: 'box', a: [w, h, d], c, p: [x, y, z], ...o });
const cyl = (m, rt, rb, h, c, x, y, z, o = {}) => m.part({ g: 'cyl', a: [rt, rb, h], c, p: [x, y, z], ...o });
const sph = (m, r, c, x, y, z, o = {}) => m.part({ g: 'sphere', a: [r], c, p: [x, y, z], ...o });

function head(m, L) {
  cyl(m, 0.05, 0.056, 0.09, L.skin, 0, 0.02, 0, { seg: 6 });
  sph(m, 0.118, L.skin, 0, 0.125, 0, { sy: 1.1, ws: 9, hs: 7 });
  box(m, 0.03, 0.036, 0.022, 'hair0', -0.045, 0.14, 0.106);
  box(m, 0.03, 0.036, 0.022, 'hair0', 0.045, 0.14, 0.106);
  box(m, 0.03, 0.045, 0.04, L.skin, 0, 0.105, 0.122);
  box(m, 0.2, 0.09, 0.08, L.hair, 0, 0.1, -0.075);
  const h = L.hat;
  if (h === 'straw') {
    cyl(m, 0.22, 0.23, 0.02, 'earth0', 0, 0.2, 0, { seg: 10 });
    sph(m, 0.12, 'earth0', 0, 0.21, 0, { sy: 0.6, ws: 9, hs: 5 });
    cyl(m, 0.122, 0.122, 0.03, L.accent === 'paper' ? 'red' : L.accent, 0, 0.225, 0, { seg: 9 });
  } else if (h === 'cap') {
    sph(m, 0.126, L.coat, 0, 0.185, -0.004, { sy: 0.74, ws: 9, hs: 6 });
    box(m, 0.18, 0.02, 0.11, L.coat, 0, 0.18, 0.12);
  } else if (h === 'beanie') {
    sph(m, 0.128, L.accent === 'paper' ? 'red' : L.accent, 0, 0.185, -0.004, { sy: 0.8, ws: 9, hs: 6 });
    cyl(m, 0.13, 0.13, 0.045, 'paper2', 0, 0.165, 0, { seg: 9 });
    sph(m, 0.036, 'paper2', 0, 0.3, 0, { ws: 5, hs: 4 });
  } else if (h === 'hood') {
    sph(m, 0.15, L.coat, 0, 0.15, -0.02, { sy: 1.05, ws: 9, hs: 7 });
    box(m, 0.2, 0.2, 0.05, L.skin, 0, 0.12, 0.11);
    box(m, 0.03, 0.036, 0.022, 'hair0', -0.045, 0.14, 0.14);
    box(m, 0.03, 0.036, 0.022, 'hair0', 0.045, 0.14, 0.14);
  } else if (h === 'souwester') {
    sph(m, 0.128, 'amber', 0, 0.185, -0.004, { sy: 0.7, ws: 9, hs: 6 });
    cyl(m, 0.2, 0.21, 0.022, 'amber', 0, 0.165, -0.03, { seg: 9, sz: 1.12 });
  } else if (h === 'kerchief') {
    sph(m, 0.124, L.accent === 'paper' ? 'pink' : L.accent, 0, 0.18, -0.01, { sy: 0.72, ws: 9, hs: 6 });
    box(m, 0.06, 0.08, 0.04, L.accent === 'paper' ? 'pink' : L.accent, 0, 0.1, -0.13, { rx: 0.4 });
  } else {
    sph(m, 0.122, L.hair, 0, 0.16, -0.02, { sy: 0.8, ws: 9, hs: 6 });
  }
}

/** Build a figure from an outfit. Returns { group, joints, shadow, height }. */
export function buildFigure(L, seed = 0.5, clip = null) {
  const root = new THREE.Group();
  const J = {};
  const pelvis = new THREE.Group();
  pelvis.position.y = RIG.hipY;
  root.add(pelvis);
  J.pelvis = pelvis;
  pelvis.add(joint((m) => {
    box(m, 0.35, 0.23, 0.24, L.legs, 0, -0.045, 0, { ch: 0.04 });
    box(m, 0.36, 0.045, 0.25, 'wood4', 0, 0.075, 0);
  }, clip));

  const torso = new THREE.Group();
  torso.position.y = 0.02;
  pelvis.add(torso);
  J.torso = torso;
  torso.add(joint((m) => {
    cyl(m, 0.19, 0.155, 0.46, L.coat, 0, 0.27, 0, { seg: 8, sz: 0.74 });
    cyl(m, 0.165, 0.178, 0.09, L.coat, 0, 0.05, 0, { seg: 8, sz: 0.78 });
    cyl(m, 0.085, 0.19, 0.08, L.coat, 0, 0.535, 0, { seg: 8, sz: 0.74 });
    box(m, 0.03, 0.34, 0.02, L.accent, 0, 0.3, 0.136);
    if (L.apron) box(m, 0.26, 0.42, 0.03, L.apron, 0, 0.12, 0.13);
    if (L.pack) {
      box(m, 0.26, 0.32, 0.14, 'wood2', 0, 0.3, -0.18, { ch: 0.03 });
      box(m, 0.28, 0.06, 0.16, 'wood3', 0, 0.48, -0.18);
      cyl(m, 0.05, 0.05, 0.3, 'grass4', 0, 0.52, -0.2, { rz: Math.PI / 2, seg: 6 });
    }
  }, clip));

  const headG = new THREE.Group();
  headG.position.y = RIG.headY;
  torso.add(headG);
  J.head = headG;
  headG.add(joint((m) => head(m, L), clip));

  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(s * RIG.shoulderX, RIG.shoulderY, 0);
    torso.add(shoulder);
    shoulder.add(joint((m) => {
      sph(m, 0.072, L.coat, 0, 0, 0, { ws: 6, hs: 5 });
      cyl(m, 0.06, 0.054, RIG.upperArm, L.coat, 0, -RIG.upperArm / 2, 0, { seg: 6 });
    }, clip));
    const elbow = new THREE.Group();
    elbow.position.y = -RIG.upperArm;
    shoulder.add(elbow);
    elbow.add(joint((m) => {
      sph(m, 0.056, L.coat, 0, 0, 0, { ws: 6, hs: 5 });
      cyl(m, 0.052, 0.046, 0.23, L.coat, 0, -0.115, 0, { seg: 6 });
      box(m, 0.075, 0.095, 0.062, L.skin, 0, -0.29, 0.004, { ch: 0.02 });
    }, clip));
    const hand = new THREE.Object3D();
    hand.position.set(0, -0.3, 0.02);
    elbow.add(hand);
    J[s < 0 ? 'shoulderL' : 'shoulderR'] = shoulder;
    J[s < 0 ? 'elbowL' : 'elbowR'] = elbow;
    J[s < 0 ? 'handL' : 'handR'] = hand;

    const hip = new THREE.Group();
    hip.position.set(s * RIG.hipX, -0.02, 0);
    pelvis.add(hip);
    hip.add(joint((m) => {
      sph(m, 0.086, L.legs, 0, 0, 0, { ws: 6, hs: 5 });
      cyl(m, 0.084, 0.07, RIG.thigh, L.legs, 0, -RIG.thigh / 2, 0, { seg: 6 });
    }, clip));
    const knee = new THREE.Group();
    knee.position.y = -RIG.thigh;
    hip.add(knee);
    knee.add(joint((m) => {
      sph(m, 0.071, L.legs, 0, 0, 0, { ws: 6, hs: 5 });
      cyl(m, 0.068, 0.058, 0.34, L.legs, 0, -0.17, 0, { seg: 6 });
      box(m, 0.115, 0.105, 0.225, L.boots, 0, -0.37, 0.04, { ch: 0.03 });
      box(m, 0.12, 0.022, 0.235, 'ink', 0, -0.412, 0.04);
    }, clip));
    J[s < 0 ? 'hipL' : 'hipR'] = hip;
    J[s < 0 ? 'kneeL' : 'kneeR'] = knee;
  }

  const k = figureScale(seed);
  root.scale.setScalar(k);
  return { group: root, joints: J, look: L, height: 1.69 * k };
}

/** A contact shadow for a figure, parented to the scene (it lies on the ground, not on the body). */
export function figureShadow(parent, clip) {
  const s = contactShadow(parent, 0, 0, 0, 0.95, 0.6);
  if (clip) s.material.clippingPlanes = clip;
  return s;
}

const KEYS = ['torso', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'hipL', 'hipR', 'kneeL', 'kneeR'];

/** Pelvis drop that keeps the straighter leg's foot on the ground: crouches sink, walks bob. */
export function dropOf(pose) {
  const one = (hip, knee) => {
    const hx = hip ? hip[0] : 0, kx = knee ? knee[0] : 0;
    return RIG.thigh * (1 - Math.cos(hx)) + RIG.shin * (1 - Math.cos(hx + kx));
  };
  return Math.min(one(pose.hipL, pose.kneeL), one(pose.hipR, pose.kneeR));
}

/** Absolute pose: every joint is written, so nothing accumulates between frames. */
export function setPose(fig, pose) {
  const J = fig.joints;
  for (const key of KEYS) {
    const v = pose[key];
    J[key].rotation.set(v ? v[0] || 0 : 0, v ? v[1] || 0 : 0, v ? v[2] || 0 : 0);
  }
  J.pelvis.position.y = RIG.hipY - dropOf(pose);
}

/* ---- poses (same convention as templates/poses.js) ------------------------------------------ */

export const STAND = {
  torso: [0.03, 0, 0], head: [0, 0, 0],
  shoulderL: [0.02, 0, -0.1], shoulderR: [0.02, 0, 0.1], elbowL: [-0.17, 0, 0], elbowR: [-0.17, 0, 0],
  hipL: [0, 0, 0.02], hipR: [0, 0, -0.02], kneeL: [0.05, 0, 0], kneeR: [0.05, 0, 0],
};
export const CROUCH = {
  torso: [0.3, 0, 0], head: [-0.16, 0, 0],
  shoulderL: [-0.3, 0, -0.22], shoulderR: [-0.26, 0, 0.24], elbowL: [-0.7, 0, 0], elbowR: [-0.62, 0, 0],
  hipL: [-0.98, 0, 0.14], hipR: [-0.86, 0, -0.12], kneeL: [1.52, 0, 0], kneeR: [1.38, 0, 0],
};
/** Crate hugged to the chest: hands about 0.44 m in front at 1.04 m at scale 1 (cast.js CARRY). */
export const CARRY_BOX = { ...STAND, torso: [0.14, 0, 0], shoulderL: [-0.42, 0, 0.1], shoulderR: [-0.42, 0, -0.1], elbowL: [-1.35, 0, 0], elbowR: [-1.35, 0, 0] };
export const LOWER = { ...CROUCH, torso: [0.52, 0, 0], head: [-0.2, 0, 0], shoulderL: [-0.92, 0, 0.08], shoulderR: [-0.92, 0, -0.08], elbowL: [-0.3, 0, 0], elbowR: [-0.3, 0, 0] };
export const SHADE_EYES = { ...STAND, torso: [-0.04, 0, 0], head: [-0.12, 0, 0], shoulderR: [-2.05, 0, 0.5], elbowR: [-2.0, 0, 0], shoulderL: [0.1, 0, -0.5], elbowL: [-1.3, 0, 0] };
export const KNOCK = { ...STAND, torso: [0.06, 0, 0], shoulderR: [-1.45, 0, 0.12], elbowR: [-1.25, 0, 0] };
export const WAVE = { ...STAND, shoulderR: [-2.7, 0, 0.5], elbowR: [-0.5, 0, 0] };
export const TALK = { ...STAND, shoulderR: [-0.7, 0, 0.25], elbowR: [-1.2, 0, 0], shoulderL: [-0.2, 0, -0.2], elbowL: [-0.5, 0, 0] };

export function mixPose(a, b, k) {
  const out = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const av = a[key] ?? [0, 0, 0];
    const bv = b[key] ?? [0, 0, 0];
    out[key] = [lerp(av[0] ?? 0, bv[0] ?? 0, k), lerp(av[1] ?? 0, bv[1] ?? 0, k), lerp(av[2] ?? 0, bv[2] ?? 0, k)];
  }
  return out;
}

/** Distance-driven walk: phase from metres travelled, so the feet never skate. */
export function walkPose(phase, opts = {}) {
  const amp = opts.amp ?? 0.32, armAmp = opts.armAmp ?? 0.44, lean = opts.lean ?? 0.05, kneeBase = opts.kneeBase ?? 0.06;
  const swing = Math.sin(phase), cs = Math.cos(phase);
  const kneeL = kneeBase + 0.46 * Math.max(0, -cs) + 0.22 * Math.max(0, swing);
  const kneeR = kneeBase + 0.46 * Math.max(0, cs) + 0.22 * Math.max(0, -swing);
  return {
    torso: [lean, swing * 0.05, 0], head: [0, -swing * 0.04, 0],
    shoulderL: [-swing * armAmp, 0, -0.09], shoulderR: [swing * armAmp, 0, 0.09],
    elbowL: [-0.16 - Math.max(0, swing) * 0.28, 0, 0], elbowR: [-0.16 - Math.max(0, -swing) * 0.28, 0, 0],
    hipL: [swing * amp, 0, 0.03], hipR: [-swing * amp, 0, -0.03], kneeL: [kneeL, 0, 0], kneeR: [kneeR, 0, 0],
  };
}

const AMP = 0.32;
/** Metres per full stride cycle at the walk amplitude. */
export const STRIDE = 4 * (RIG.thigh + RIG.shin) * Math.sin(AMP);

/** Idle: breathing, a slow look around, now and then a hand to the brow, a wave on cue. */
export function idlePose(t, loop, seed, wave = 0, w) {
  const ph = seed * 40;
  const pose = { ...STAND };
  pose.torso = [0.03 + Math.sin(t * w(0.28) + ph) * 0.012, Math.sin(t * w(0.07) + ph * 1.7) * 0.14, 0];
  pose.head = [0, Math.sin(t * w(0.11) + ph * 2.3) * 0.5, 0];
  const cyc = ((t / loop) * Math.max(1, Math.round(loop / 14)) + seed) % 1;
  const look = Math.sin(clamp(cyc / 0.22, 0, 1) * Math.PI);
  let out = look > 0.01 ? mixPose(pose, { ...SHADE_EYES, head: pose.head }, smooth(look)) : pose;
  if (wave > 0.01) out = mixPose(out, { ...WAVE, shoulderR: [-2.7, 0, 0.5 + Math.sin(t * w(1.5)) * 0.28], torso: pose.torso }, smooth(wave));
  return out;
}

/** The pose for one actor state from castAt. `w(hz)` gives a loop-closing frequency. */
export function actorPose(s, seed, t, loop, w) {
  if (s.moving) {
    const phase = (s.dist / STRIDE) * TAU + seed * 6;
    let pose = walkPose(phase, { amp: AMP });
    if (s.carry) {
      pose.shoulderL = CARRY_BOX.shoulderL; pose.shoulderR = CARRY_BOX.shoulderR;
      pose.elbowL = CARRY_BOX.elbowL; pose.elbowR = CARRY_BOX.elbowR;
      pose.torso = [pose.torso[0] + 0.08, pose.torso[1] * 0.4, 0];
    }
    // Ease out of and into standing over the first and last 0.3 m: a pose switch is not a transition.
    const k = smooth(s.edge / 0.3);
    const rest = s.carry ? CARRY_BOX : STAND;
    return k < 1 ? mixPose(rest, pose, k) : pose;
  }
  const a = s.action;
  if (a && (a.kind === 'drop' || a.kind === 'pickup')) {
    if (a.kind === 'drop') return a.dt < 0 ? mixPose(CARRY_BOX, LOWER, s.carry ? s.carry.lower : 1) : mixPose(LOWER, STAND, smooth(a.dt / 0.45));
    return a.dt < 0 ? mixPose(STAND, LOWER, smooth(1 + a.dt / 0.55)) : mixPose(LOWER, CARRY_BOX, smooth(a.dt / 0.4));
  }
  if (a && a.kind === 'look') {
    const k = Math.sin(clamp(a.u, 0, 1) * Math.PI);
    const knock = a.lot ? Math.max(0, Math.sin(a.dt * TAU * 2.2)) * smooth(1 - Math.abs(a.dt - 0.3) / 0.5) : 0;
    const base = mixPose(idlePose(t, loop, seed, 0, w), { ...SHADE_EYES, head: [-0.1, Math.sin(a.u * TAU) * 0.5, 0] }, smooth(k * 1.4));
    return knock > 0.01 ? mixPose(base, { ...KNOCK, elbowR: [-1.25 - knock * 0.5, 0, 0] }, smooth(Math.min(1, k * 3))) : base;
  }
  if (a && a.kind === 'chat') {
    const k = smooth(Math.min(1, a.u * 6, (1 - a.u) * 6));
    const g = Math.sin(t * w(1.1) + seed * 9);
    const talk = { ...TALK, shoulderR: [-0.7 - g * 0.3, 0, 0.25], elbowR: [-1.2 + g * 0.3, 0, 0], head: [Math.sin(t * w(0.9) + seed) * 0.08, 0, 0] };
    return mixPose(STAND, talk, k);
  }
  if (s.carry) return CARRY_BOX;
  return idlePose(t, loop, seed, 0, w);
}
