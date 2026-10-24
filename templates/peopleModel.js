import * as THREE from 'three';
import { roundedBoxGeometry } from '../core/geometry.js';

/**
 * Diorama proportions: a 1.69 m figure with a tapered lathe torso and
 * pelvis, chunky limbs, and joint fillers so a bend never opens a gap.
 * The figure faces +Z. Positive hip/shoulder X rotation swings a limb
 * backwards; negative swings it forwards.
 */
export const RIG = {
  hipY: 0.86,
  hipX: 0.10,
  thigh: 0.42,
  shin: 0.40,
  shoulderY: 0.415,
  shoulderX: 0.182,
  upperArm: 0.30,
  foreArm: 0.27,
  headY: 0.584,
};

function part(parent, geo, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (opts.rotation) m.rotation.set(...opts.rotation);
  if (opts.scale) m.scale.set(...opts.scale);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function capsule(parent, r, len, mat, x, y, z, opts = {}) {
  const geo = new THREE.CapsuleGeometry(r, Math.max(0.01, len), 8, 18);
  return part(parent, geo, mat, x, y, z, opts);
}

function sphere(parent, r, mat, x, y, z, scale = [1, 1, 1], opts = {}) {
  return part(parent, new THREE.SphereGeometry(r, 24, 18), mat, x, y, z, { ...opts, scale });
}

function box(parent, w, h, d, r, mat, x, y, z, opts = {}) {
  const geo = roundedBoxGeometry(w, h, d, Math.min(r, Math.min(w, h, d) * 0.48), 3);
  return part(parent, geo, mat, x, y, z, opts);
}

/** Lathe a side profile, then flatten it front-to-back. */
function lathe(parent, profile, flatten, mat, y, x = 0, z = 0) {
  const pts = profile.map(([r, h]) => new THREE.Vector2(r, h));
  const geo = new THREE.LatheGeometry(pts, 26);
  geo.scale(1, 1, flatten);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

const TORSO = [
  [0.135, -0.02],
  [0.165, 0.09],
  [0.190, 0.22],
  [0.198, 0.33],
  [0.196, 0.40],
  [0.168, 0.47],
  [0.090, 0.53],
  [0.062, 0.56],
];

const PELVIS = [
  [0.105, -0.24],
  [0.150, -0.17],
  [0.176, -0.07],
  [0.180, 0.04],
  [0.168, 0.12],
];

const SHORTS = [
  [0.150, -0.30],
  [0.182, -0.20],
  [0.190, -0.08],
  [0.188, 0.06],
  [0.178, 0.12],
];

const BRIEFS = [
  [0.100, -0.23],
  [0.152, -0.18],
  [0.184, -0.06],
  [0.183, 0.07],
  [0.172, 0.12],
];

export function buildPerson(mats, opts = {}) {
  const skin = opts.skin ?? mats.skinTones[0];
  const hairMat = opts.hair ?? mats.hair[0];
  const suit = opts.suit ?? mats.suits.coral;
  const suitStyle = opts.suitStyle ?? 'onepiece';
  // A darker clone of the skin for creases, lids and seams.
  const shade = skin.clone();
  shade.color = skin.color.clone().multiplyScalar(0.86);
  const root = new THREE.Group();
  const J = {};

  const pelvis = new THREE.Group();
  pelvis.position.y = RIG.hipY;
  root.add(pelvis);
  J.pelvis = pelvis;

  // Hips, always skin; swimwear is layered over them.
  lathe(pelvis, PELVIS, 0.86, suitStyle === 'trunks' || suitStyle === 'briefs' ? suit : skin, 0);

  const torso = new THREE.Group();
  torso.position.y = 0.02;
  pelvis.add(torso);
  J.torso = torso;

  const torsoMat = suitStyle === 'trunks' ? skin : suit;
  lathe(torso, TORSO, 0.72, torsoMat, 0);

  if (suitStyle === 'onepiece' || suitStyle === 'briefs') {
    if (opts.suitAccent) {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.201, 0.200, 0.06, 22),
        opts.suitAccent
      );
      band.position.set(0, 0.315, 0);
      band.scale.z = 0.735;
      band.castShadow = true;
      torso.add(band);
    }
    lathe(pelvis, BRIEFS, 0.88, suit, 0);

  } else if (suitStyle === 'trunks') {
    lathe(pelvis, SHORTS, 0.88, suit, 0);
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.187, 0.19, 0.045, 22),
      opts.suitAccent ?? suit
    );
    band.position.set(0, 0.015, 0);
    band.scale.z = 0.885;
    band.castShadow = true;
    pelvis.add(band);
    for (const s of [-1, 1]) {
      box(pelvis, 0.024, 0.20, 0.05, 0.01, opts.suitAccent ?? suit, s * 0.185, -0.12, 0.02);
    }
    box(pelvis, 0.07, 0.028, 0.02, 0.008, opts.suitAccent ?? suit, 0, 0.05, 0.155);
  }

  // Collarbones and chest planes on bare torsos.
  if (suitStyle === 'trunks' || suitStyle === 'briefs') {
    for (const s of [-1, 1]) {
      capsule(torso, 0.011, 0.10, shade, s * 0.095, 0.455, 0.098, {
        rotation: [0, 0, s * 1.32],
        castShadow: false,
      });
      sphere(torso, 0.062, skin, s * 0.078, 0.352, 0.10, [0.95, 0.72, 0.42]);
    }
    box(torso, 0.012, 0.012, 0.006, 0.005, shade, 0, 0.075, 0.148, { castShadow: false });
  }
  if (opts.suitAccent && (suitStyle === 'onepiece' || suitStyle === 'briefs')) {
    box(torso, 0.034, 0.030, 0.008, 0.008, opts.suitAccent, -0.085, 0.355, 0.132, {
      castShadow: false,
    });
  }

  // Neck and head.
  capsule(torso, 0.057, 0.075, skin, 0, 0.545, 0);
  const head = new THREE.Group();
  head.position.y = RIG.headY;
  torso.add(head);
  J.head = head;

  sphere(head, 0.115, skin, 0, 0.105, 0.004, [1.0, 1.1, 0.96]);
  sphere(head, 0.089, skin, 0, 0.028, 0.018, [0.94, 0.78, 0.92]);

  // Ears and a soft nose wedge keep the head from reading as a ball.
  for (const s of [-1, 1]) {
    sphere(head, 0.028, skin, s * 0.112, 0.10, 0.0, [0.55, 1.0, 0.85]);
  }
  box(head, 0.038, 0.054, 0.044, 0.018, skin, 0, 0.090, 0.106, {
    rotation: [-0.12, 0, 0],
  });

  if (!opts.goggles) {
    for (const s of [-1, 1]) {
      sphere(head, 0.017, mats.eye, s * 0.044, 0.115, 0.104, [1.0, 1.15, 0.5], {
        castShadow: false,
      });
      box(head, 0.05, 0.011, 0.012, 0.004, hairMat, s * 0.047, 0.146, 0.102, {
        rotation: [0, 0, s * 0.12],
      });
    }
    box(head, 0.052, 0.013, 0.012, 0.005, mats.mouth, 0, 0.045, 0.106);
    // Fine face detail: lids, cheek planes, chin, nostrils, lower lip.
    for (const s of [-1, 1]) {
      box(head, 0.046, 0.007, 0.010, 0.003, shade, s * 0.044, 0.101, 0.104, {
        rotation: [0, 0, s * 0.10],
        castShadow: false,
      });
      sphere(head, 0.030, skin, s * 0.060, 0.078, 0.078, [0.95, 0.62, 0.55]);
    }
    box(head, 0.046, 0.026, 0.036, 0.012, skin, 0, 0.026, 0.094);
    box(head, 0.038, 0.009, 0.012, 0.004, shade, 0, 0.034, 0.106, { castShadow: false });
    for (const s of [-1, 1]) {
      box(head, 0.008, 0.007, 0.008, 0.003, shade, s * 0.013, 0.060, 0.132, { castShadow: false });
    }
  }

  // Swim cap sits over a bald head.
  if (opts.cap) {
    const capMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.121, 24, 16, 0, Math.PI * 2, 0, 1.62),
      opts.cap
    );
    capMesh.position.set(0, 0.105, 0);
    capMesh.scale.set(1.02, 1.06, 1.0);
    capMesh.castShadow = true;
    head.add(capMesh);
  }

  // Hair: a rounded cap over the skull, with optional length at the back.
  if (opts.hairStyle !== 'bald' && !opts.cap) {
    const style = opts.hairStyle ?? 'short';
    const capMat = opts.cap ?? hairMat;
    const theta = style === 'buzz' ? 1.35 : 1.85;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.121, 24, 16, 0, Math.PI * 2, 0, theta),
      capMat
    );
    cap.position.set(0, 0.105, 0);
    cap.scale.set(1.02, 1.06, 1.0);
    cap.castShadow = true;
    head.add(cap);
    // Fringe across the forehead.
    box(head, 0.20, 0.055, 0.05, 0.02, capMat, 0, 0.175, 0.093, {
      rotation: [0.18, 0, 0],
    });

    if (style === 'long' || style === 'bun') {
      sphere(head, 0.10, capMat, 0, 0.075, -0.055, [1.0, 1.15, 0.7]);
      for (const s of [-1, 1]) {
        sphere(head, 0.05, capMat, s * 0.098, 0.055, -0.02, [0.8, 1.5, 0.9]);
      }
    }
    if (style === 'bun') {
      sphere(head, 0.07, capMat, 0, 0.165, -0.10, [1, 0.95, 0.9]);
    }
  }

  if (opts.sunglasses) {
    box(head, 0.175, 0.05, 0.024, 0.011, mats.goggle, 0, 0.118, 0.098);
  }
  if (opts.goggles) {
    for (const s of [-1, 1]) {
      box(head, 0.072, 0.048, 0.026, 0.012, mats.goggle, s * 0.05, 0.118, 0.10);
    }
    box(head, 0.045, 0.02, 0.024, 0.008, mats.goggleStrap, 0, 0.118, 0.104);
    box(head, 0.235, 0.03, 0.235, 0.012, mats.goggleStrap, 0, 0.135, -0.004);
  }

  if (opts.hat) {
    const hat = new THREE.Group();
    hat.position.y = 0.192;
    hat.rotation.x = -0.05;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.212, 0.018, 24), opts.hat);
    brim.castShadow = true;
    hat.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.100, 0.120, 0.115, 20), opts.hat);
    crown.position.y = 0.062;
    crown.castShadow = true;
    hat.add(crown);
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.112, 0.12, 0.026, 20),
      opts.hatBand ?? mats.suits.navy
    );
    band.position.y = 0.016;
    hat.add(band);
    head.add(hat);
  }

  // Arms: joint spheres sit just inside the limb radius so bends stay sealed.
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(s * RIG.shoulderX, RIG.shoulderY, 0);
    torso.add(shoulder);
    sphere(shoulder, 0.062, skin, 0, 0, 0, [1, 0.94, 1]);
    capsule(shoulder, 0.057, 0.166, skin, 0, -RIG.upperArm / 2, 0);

    const elbow = new THREE.Group();
    elbow.position.y = -RIG.upperArm;
    shoulder.add(elbow);
    sphere(elbow, 0.049, skin, 0, 0, 0);
    capsule(elbow, 0.05, 0.15, skin, 0, -RIG.foreArm / 2, 0);

    const wrist = new THREE.Group();
    wrist.position.y = -RIG.foreArm + 0.01;
    elbow.add(wrist);
    box(wrist, 0.072, 0.098, 0.058, 0.024, skin, 0, -0.045, 0.004);
    box(wrist, 0.026, 0.058, 0.03, 0.012, skin, s * 0.042, -0.032, 0.014, {
      rotation: [0, 0, -s * 0.55],
    });

    // Knuckle grooves and an optional band/watch at the wrist.
    for (let f = 0; f < 3; f++) {
      box(wrist, 0.006, 0.052, 0.012, 0.002, shade, -0.022 + f * 0.022, -0.062, 0.030, {
        castShadow: false,
      });
    }
    if (opts.band) {
      const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.060, 0.060, 0.024, 16), opts.band);
      strap.position.set(0, 0.008, 0.0);
      strap.castShadow = true;
      wrist.add(strap);
    }

    if (suitStyle === 'onepiece' && opts.suitSleeve) {
      capsule(shoulder, 0.066, 0.09, suit, 0, -0.065, 0);
    }

    J[s < 0 ? 'shoulderL' : 'shoulderR'] = shoulder;
    J[s < 0 ? 'elbowL' : 'elbowR'] = elbow;
    J[s < 0 ? 'wristL' : 'wristR'] = wrist;
  }

  // Legs.
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * RIG.hipX, -0.04, 0);
    pelvis.add(hip);
    sphere(hip, 0.078, suitStyle === 'trunks' || suitStyle === 'briefs' ? suit : skin, 0, 0, 0);
    capsule(hip, 0.086, 0.224, skin, 0, -RIG.thigh / 2, 0);

    const knee = new THREE.Group();
    knee.position.y = -RIG.thigh;
    hip.add(knee);
    sphere(knee, 0.069, skin, 0, 0, 0);
    capsule(knee, 0.068, 0.244, skin, 0, -RIG.shin / 2, 0);

    const ankle = new THREE.Group();
    ankle.position.y = -RIG.shin;
    knee.add(ankle);
    box(ankle, 0.105, 0.07, 0.215, 0.03, opts.shoe ?? skin, 0, 0.017, 0.045);
    box(ankle, 0.098, 0.04, 0.055, 0.016, opts.shoe ?? skin, 0, 0.006, 0.158);

    sphere(knee, 0.048, skin, 0, -0.012, 0.040, [1.0, 1.05, 0.62]);
    for (let f = 0; f < 2; f++) {
      box(ankle, 0.007, 0.036, 0.05, 0.003, shade, -0.014 + f * 0.026, 0.010, 0.168, {
        castShadow: false,
      });
    }
    box(ankle, 0.030, 0.018, 0.026, 0.008, shade, -0.030, 0.020, 0.196, { castShadow: false });

    J[s < 0 ? 'hipL' : 'hipR'] = hip;
    J[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    J[s < 0 ? 'ankleL' : 'ankleR'] = ankle;
  }

  return { group: root, joints: J, opts };
}

export function setPose(p, pose = {}) {
  const J = p.joints;
  const r = (obj, v) => {
    if (!obj) return;
    obj.rotation.set(v?.[0] ?? 0, v?.[1] ?? 0, v?.[2] ?? 0);
  };
  r(J.torso, pose.torso);
  r(J.head, pose.head);
  r(J.shoulderL, pose.shoulderL);
  r(J.shoulderR, pose.shoulderR);
  r(J.elbowL, pose.elbowL);
  r(J.elbowR, pose.elbowR);
  r(J.wristL, pose.wristL);
  r(J.wristR, pose.wristR);
  r(J.hipL, pose.hipL);
  r(J.hipR, pose.hipR);
  r(J.kneeL, pose.kneeL);
  r(J.kneeR, pose.kneeR);
  r(J.ankleL, pose.ankleL);
  r(J.ankleR, pose.ankleR);
  if (pose.pelvis) r(J.pelvis, pose.pelvis);
}

export function easePose(p, pose, k) {
  const J = p.joints;
  const apply = (obj, v) => {
    if (!obj) return;
    const tx = v?.[0] ?? 0;
    const ty = v?.[1] ?? 0;
    const tz = v?.[2] ?? 0;
    obj.rotation.x += (tx - obj.rotation.x) * k;
    obj.rotation.y += (ty - obj.rotation.y) * k;
    obj.rotation.z += (tz - obj.rotation.z) * k;
  };
  apply(J.torso, pose.torso);
  apply(J.head, pose.head);
  apply(J.shoulderL, pose.shoulderL);
  apply(J.shoulderR, pose.shoulderR);
  apply(J.elbowL, pose.elbowL);
  apply(J.elbowR, pose.elbowR);
  apply(J.wristL, pose.wristL);
  apply(J.wristR, pose.wristR);
  apply(J.hipL, pose.hipL);
  apply(J.hipR, pose.hipR);
  apply(J.kneeL, pose.kneeL);
  apply(J.kneeR, pose.kneeR);
  apply(J.ankleL, pose.ankleL);
  apply(J.ankleR, pose.ankleR);
  if (pose.pelvis) apply(J.pelvis, pose.pelvis);
}

export function blendPose(base, add) {
  const out = {};
  for (const k of new Set([...Object.keys(base), ...Object.keys(add)])) {
    const a = base[k] ?? [0, 0, 0];
    const b = add[k] ?? [0, 0, 0];
    out[k] = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  return out;
}
