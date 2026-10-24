import * as THREE from 'three';
import { roundedBoxGeometry } from '../core/geometry.js';

/**
 * Diorama clothed rig: the 1.69 m skeleton with a skull/jaw head, layered
 * street clothing (tee, jacket, puffer, hoodie, scrubs, apron, trousers, hats,
 * packs, gloves) and tapered lathe limbs. Faces +Z. Positive hip/shoulder X
 * swings a limb backward. Copy beside the base rig and pick per scene: this one
 * for clothed social/street casts, the base one for swimwear/aquatic casts.
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
  m.castShadow = opts.castShadow ?? true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function capsule(parent, r, len, mat, x, y, z, opts = {}) {
  return part(parent, new THREE.CapsuleGeometry(r, Math.max(0.01, len), 6, 14), mat, x, y, z, opts);
}
function sphere(parent, r, mat, x, y, z, scale = [1, 1, 1], opts = {}) {
  return part(parent, new THREE.SphereGeometry(r, 20, 14), mat, x, y, z, { ...opts, scale });
}
function box(parent, w, h, d, r, mat, x, y, z, opts = {}) {
  const geo = roundedBoxGeometry(w, h, d, Math.min(r, Math.min(w, h, d) * 0.48), 2);
  return part(parent, geo, mat, x, y, z, opts);
}
function lathe(parent, profile, flatten, mat, y, x = 0, z = 0) {
  const pts = profile.map(([r, h]) => new THREE.Vector2(r, h));
  const geo = new THREE.LatheGeometry(pts, 22);
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
const wide = (profile, k) => profile.map(([r, h]) => [r * k, h]);

export function buildPerson(mats, opts = {}) {
  const cloth = mats.cloth ?? mats.suits ?? {};
  const skin = opts.skin ?? mats.skinTones?.[2] ?? mats.skin;
  const hairMat = opts.hair ?? mats.hair?.[0] ?? mats.hairColor ?? cloth.charcoal;
  const top = opts.top ?? cloth.navy ?? cloth.coral;
  const bottom = opts.bottom ?? cloth.charcoal ?? cloth.navy ?? top;
  const shoe = opts.shoe ?? mats.leather ?? mats.eye ?? bottom;
  const shade = skin.clone();
  shade.color = skin.color.clone().multiplyScalar(0.84);
  const trim = top.clone();
  trim.color = top.color.clone().multiplyScalar(0.78);
  // Every material below can be supplied by the scene; fall back to a cloth
  // tone rather than throwing on a missing key in a new palette.
  const leather = mats.leather ?? bottom;
  const metal = mats.steelDark ?? mats.ink ?? bottom;
  const pale = mats.chrome ?? mats.bone ?? mats.paper ?? top;
  const bone = mats.bone ?? mats.paper ?? top;
  const eye = mats.eye ?? mats.ink ?? mats.steelDark ?? bottom;
  const mouth = mats.mouth ?? eye;
  const glass = mats.glass ?? eye;
  const rose = mats.roseDeep ?? cloth.rose ?? top;
  const rustLight = mats.rustLight ?? mats.rust ?? top;

  const root = new THREE.Group();
  const J = {};
  const sleeve = opts.sleeve ?? 'short'; // short | long | none
  const puffer = opts.topStyle === 'puffer';
  const jacket = opts.topStyle === 'jacket' || opts.topStyle === 'hoodie' || puffer;
  const topK = puffer ? 1.12 : jacket ? 1.05 : 1.0;

  const loose = opts.loose === true;
  const pelvis = new THREE.Group();
  pelvis.position.y = RIG.hipY;
  root.add(pelvis);
  J.pelvis = pelvis;
  lathe(pelvis, PELVIS, 0.86, bottom, 0);

  // Belt / waistband.
  part(
    pelvis,
    new THREE.CylinderGeometry(0.171, 0.178, 0.045, 18),
    leather,
    0,
    0.03,
    0,
    { scale: [1, 1, 0.88] }
  );

  const torso = new THREE.Group();
  torso.position.y = 0.02;
  pelvis.add(torso);
  J.torso = torso;
  lathe(torso, wide(TORSO, topK), 0.72, top, 0);

  // Jacket details: lapels, zip, hem band, chest pocket.
  if (jacket) {
    box(torso, 0.014, 0.35, 0.016, 0.005, metal, 0, 0.25, 0.150);
    box(torso, 0.028, 0.022, 0.010, 0.005, pale, 0, 0.410, 0.152, { castShadow: false });
    part(torso, new THREE.CylinderGeometry(0.202 * topK, 0.198 * topK, 0.05, 18), trim, 0, 0.02, 0, {
      scale: [1, 1, 0.74],
    });
    box(torso, 0.10, 0.045, 0.012, 0.006, rustLight, -0.105, 0.30, 0.146);
  }
  if (jacket && !opts.hood) {
    // Stand collar: open at the front so the throat stays visible.
    part(
      torso,
      new THREE.CylinderGeometry(0.078 * topK, 0.088 * topK, 0.044, 16, 1, true, Math.PI / 2 + 0.36, Math.PI * 2 - 0.72),
      top,
      0,
      0.538,
      0.004,
      { scale: [1, 1, 0.94] }
    );
  }
  if (puffer) {
    for (let i = 0; i < 3; i++) {
      part(
        torso,
        new THREE.CylinderGeometry(0.196 * topK, 0.198 * topK, 0.075, 18),
        top,
        0,
        0.12 + i * 0.13,
        0,
        { scale: [1, 1, 0.735] }
      );
    }
  }
  if (opts.topStyle === 'hoodie') {
    // Kangaroo pocket and drawstrings.
    box(torso, 0.22, 0.13, 0.02, 0.02, top, 0, 0.16, 0.145);
    for (const s of [-1, 1]) {
      part(torso, new THREE.CylinderGeometry(0.007, 0.007, 0.16, 5), bone, s * 0.045, 0.40, 0.15, {
        castShadow: false,
      });
      sphere(torso, 0.014, bone, s * 0.045, 0.32, 0.15, [1, 1, 1], { castShadow: false });
    }
  }
  if (opts.topStyle === 'scrubs') {
    // V-neck binding: two narrow strips down to the sternum.
    for (const s of [-1, 1]) {
      box(torso, 0.022, 0.180, 0.012, 0.005, cloth.tealDeep, s * 0.035, 0.455, 0.142, {
        rotation: [0.01, 0, -s * 0.30],
      });
    }
    part(torso, new THREE.CylinderGeometry(0.072, 0.080, 0.030, 14), cloth.tealDeep, 0, 0.540, 0.004);
    // Loose tunic hem over the hips.
    part(torso, new THREE.CylinderGeometry(0.184, 0.204, 0.085, 18), top, 0, 0.012, 0, {
      scale: [1, 1, 0.80],
    });
    part(torso, new THREE.CylinderGeometry(0.204, 0.206, 0.016, 18), cloth.tealDeep, 0, -0.030, 0, {
      scale: [1, 1, 0.80],
    });
    box(torso, 0.095, 0.050, 0.012, 0.006, cloth.tealDeep, 0.09, 0.31, 0.145);
    for (const s of [-1, 1]) {
      box(torso, 0.070, 0.080, 0.014, 0.006, cloth.tealDeep, s * 0.115, 0.105, 0.142);
    }
    // Drawstring at the waist.
    for (const s of [-1, 1]) {
      part(torso, new THREE.CylinderGeometry(0.005, 0.005, 0.09, 5), bone, s * 0.022, 0.085, 0.150, {
        rotation: [0.1, 0, s * 0.25],
        castShadow: false,
      });
    }
  }

  // Apron: bib, skirt, waist ties, pocket, towel.
  if (opts.apron) {
    const ap = new THREE.Group();
    ap.position.set(0, 0.20, 0.155);
    torso.add(ap);
    box(ap, 0.28, 0.38, 0.018, 0.01, opts.apron, 0, 0.22, 0.0);
    box(ap, 0.36, 0.52, 0.018, 0.012, opts.apron, 0, -0.22, 0.0);
    box(ap, 0.20, 0.13, 0.022, 0.01, opts.apron, 0, -0.16, 0.012);
    for (const s of [-1, 1]) {
      box(ap, 0.06, 0.30, 0.016, 0.006, opts.apron, s * 0.15, 0.36, -0.01, {
        rotation: [0, 0, s * 0.22],
      });
    }
    // Waist knot with two short tails, not rigid horizontal straps.
    box(ap, 0.07, 0.06, 0.03, 0.012, bone, 0, -0.02, 0.012);
    for (const s of [-1, 1]) {
      box(ap, 0.034, 0.19, 0.014, 0.006, bone, s * 0.035, -0.12, 0.012, {
        rotation: [0.12, 0, s * 0.18],
      });
    }
    if (opts.towel) {
      box(ap, 0.10, 0.22, 0.02, 0.006, opts.towel, 0.17, 0.03, 0.016, {
        rotation: [0, 0, 0.08],
      });
    }
  }

  // Neck and head: a skull, jaw and cheeks rather than stacked spheres.
  capsule(torso, 0.050, 0.080, skin, 0, 0.545, -0.004);
  sphere(torso, 0.078, skin, 0, 0.512, 0, [1.18, 0.42, 0.92]);

  const head = new THREE.Group();
  head.position.y = RIG.headY;
  torso.add(head);
  J.head = head;
  head.scale.setScalar(0.97);

  sphere(head, 0.100, skin, 0, 0.118, -0.004, [0.98, 1.16, 0.98]);
  sphere(head, 0.079, skin, 0, 0.054, 0.012, [0.78, 0.80, 0.86]);
  sphere(head, 0.029, skin, 0, 0.029, 0.079, [1.15, 0.62, 0.68]);
  for (const s of [-1, 1]) {
    sphere(head, 0.030, shade, s * 0.064, 0.090, 0.078, [0.55, 0.34, 0.18], { castShadow: false });
    // Ear with a shadowed bowl.
    sphere(head, 0.028, skin, s * 0.098, 0.101, 0.018, [0.36, 1.0, 0.72]);
    sphere(head, 0.014, shade, s * 0.102, 0.102, 0.030, [0.28, 0.9, 0.5], { castShadow: false });
  }

  // Eyes sit proud of the face plane, under a brow and a soft socket.
  for (const s of [-1, 1]) {
    box(head, 0.036, 0.010, 0.008, 0.003, shade, s * 0.038, 0.123, 0.100, { castShadow: false });
sphere(head, 0.0145, eye, s * 0.037, 0.110, 0.101, [1.0, 0.84, 0.42], { castShadow: false });
    sphere(head, 0.0045, bone, s * 0.033, 0.114, 0.105, [1, 1, 0.6], { castShadow: false });
    box(head, 0.034, 0.007, 0.010, 0.003, hairMat, s * 0.037, 0.131, 0.097, {
      rotation: [0, 0, s * 0.09],
      castShadow: false,
    });
    box(head, 0.031, 0.005, 0.009, 0.002, shade, s * 0.037, 0.120, 0.101, {
      rotation: [0, 0, -s * 0.08],
      castShadow: false,
    });
    box(head, 0.033, 0.005, 0.008, 0.002, shade, s * 0.040, 0.098, 0.101, {
      rotation: [0, 0, -s * 0.06],
      castShadow: false,
    });
  }

  // Nose: a small bridge and tip, no beak.
  box(head, 0.022, 0.058, 0.020, 0.007, skin, 0, 0.099, 0.103, { rotation: [-0.04, 0, 0] });
  sphere(head, 0.018, skin, 0, 0.084, 0.113, [1.0, 0.8, 0.9]);
  for (const s of [-1, 1]) {
    sphere(head, 0.005, shade, s * 0.009, 0.081, 0.117, [1, 0.7, 0.7], { castShadow: false });
  }

  // Mouth: two lips and a dark seam.
  box(head, 0.036, 0.007, 0.010, 0.003, shade, 0, 0.060, 0.099);
  box(head, 0.033, 0.008, 0.011, 0.004, mouth, 0, 0.052, 0.101, { castShadow: false });
  box(head, 0.033, 0.003, 0.012, 0.001, eye, 0, 0.056, 0.104, { castShadow: false });
  box(head, 0.010, 0.014, 0.008, 0.003, shade, 0, 0.073, 0.103, { castShadow: false });

  if (opts.glasses) {
    for (const s of [-1, 1]) {
      box(head, 0.070, 0.045, 0.012, 0.008, metal, s * 0.042, 0.111, 0.107, {
        castShadow: false,
      });
      box(head, 0.054, 0.030, 0.006, 0.004, (mats.glass ?? eye), s * 0.042, 0.111, 0.114, {
        castShadow: false,
      });
    }
    box(head, 0.028, 0.006, 0.006, 0.002, metal, 0, 0.116, 0.111, { castShadow: false });
  }

  // Hair: a cap that stops at the hairline, a back mass and sideburns.
  const hairStyle = opts.hairStyle ?? 'short';
  const hatType = opts.hatType ?? null;
  if (hairStyle !== 'bald' && hairStyle !== 'buzz') {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.108, 20, 14, 0, Math.PI * 2, 0, hairStyle === 'bun' ? 1.18 : 1.22),
      hairMat
    );
    cap.position.set(0, hairStyle === 'bun' ? 0.136 : 0.132, -0.006);
    cap.scale.set(1.03, 1.04, 1.02);
    cap.castShadow = true;
    head.add(cap);
    sphere(head, 0.098, hairMat, 0, 0.098, -0.045, [1.0, 1.05, 0.75]);
    for (const s of [-1, 1]) {
      box(head, 0.020, 0.060, 0.034, 0.008, hairMat, s * 0.094, 0.108, 0.028, {
        rotation: [0.05, 0, -s * 0.05],
      });
    }
    if (hairStyle === 'long') {
      box(head, 0.052, 0.024, 0.024, 0.008, hairMat, -0.032, 0.166, 0.080, {
        rotation: [0.22, 0.02, -0.16],
      });
      box(head, 0.045, 0.022, 0.024, 0.008, hairMat, 0.031, 0.168, 0.079, {
        rotation: [0.22, 0.02, 0.20],
      });
    } else if (hairStyle !== 'bun') {
      box(head, 0.098, 0.026, 0.026, 0.009, hairMat, -0.006, 0.167, 0.079, {
        rotation: [0.24, 0.04, 0.16],
      });
    }
    if (hairStyle === 'long' || hairStyle === 'bun') {
      sphere(head, 0.075, hairMat, 0, 0.070, -0.075, [1.0, 1.25, 0.7]);
      if (hairStyle === 'long') {
        for (const s of [-1, 1]) {
          capsule(head, 0.018, 0.13, hairMat, s * 0.090, 0.055, -0.045, {
            rotation: [0.1, 0, s * 0.04],
          });
        }
      }
    }
    if (hairStyle === 'bun') {
      sphere(head, 0.062, hairMat, 0, 0.204, -0.072, [1, 0.94, 0.92]);
      // Hairline of hair pulled back, not a fringe.
      box(head, 0.160, 0.014, 0.020, 0.006, hairMat, 0, 0.180, 0.084, {
        rotation: [-0.16, 0, 0],
      });
      for (const s of [-1, 1]) {
        capsule(head, 0.010, 0.050, hairMat, s * 0.092, 0.128, 0.048, {
          rotation: [0.1, 0, s * 0.08],
        });
      }
    }
  }
  if (hairStyle === 'buzz') {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 20, 14, 0, Math.PI * 2, 0, 1.08),
      hairMat
    );
    cap.position.set(0, 0.130, -0.004);
    cap.scale.set(1.01, 1.02, 1.01);
    cap.castShadow = true;
    head.add(cap);
  }

  // A little hair at the nape shows under every hat.
  if (hatType && hairStyle !== 'bald') {
    sphere(head, 0.090, hairMat, 0, 0.095, -0.055, [0.95, 0.9, 0.55]);
  }

  if (hatType === 'beanie') {
    const mat = opts.hatMat ?? cloth.rust;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.118, 20, 14, 0, Math.PI * 2, 0, 1.55),
      mat
    );
    cap.position.set(0, 0.134, -0.018);
    cap.scale.set(1.01, 1.05, 1.04);
    cap.castShadow = true;
    head.add(cap);
    part(head, new THREE.TorusGeometry(0.112, 0.016, 6, 20), mat, 0, 0.156, -0.004, {
      rotation: [Math.PI / 2, 0, 0],
      scale: [1, 1, 0.98],
    });
    sphere(head, 0.024, mat, 0, 0.252, -0.024);
  }
  if (hatType === 'cap') {
    const mat = opts.hatMat ?? cloth.navy;
    part(head, new THREE.CylinderGeometry(0.108, 0.120, 0.075, 18), mat, 0, 0.198, 0);
    box(head, 0.176, 0.016, 0.098, 0.022, mat, 0, 0.164, 0.122, {
      rotation: [-0.12, 0, 0],
      scale: [1, 1, 1.02],
    });
    box(head, 0.200, 0.022, 0.045, 0.006, opts.hatBand ?? metal, 0, 0.170, 0.040);
    sphere(head, 0.012, mat, 0, 0.238, 0);
  }
  if (hatType === 'bandana') {
    const mat = opts.hatMat ?? rose;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.114, 18, 12, 0, Math.PI * 2, 0, 1.38),
      mat
    );
    cap.position.set(0, 0.132, 0);
    cap.scale.set(1.03, 1.0, 1.03);
    head.add(cap);
    part(head, new THREE.CylinderGeometry(0.118, 0.118, 0.032, 18), mat, 0, 0.152, 0);
    box(head, 0.070, 0.050, 0.030, 0.010, mat, 0, 0.148, -0.125, { rotation: [0.2, 0, 0] });
    box(head, 0.030, 0.100, 0.020, 0.006, mat, 0.060, 0.095, -0.110, {
      rotation: [0, 0, -0.5],
    });
  }
  if (hatType === 'helmet') {
    const mat = opts.hatMat ?? cloth.tealDeep;
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.132, 20, 14, 0, Math.PI * 2, 0, 1.42),
      mat
    );
    shell.position.set(0, 0.125, -0.004);
    shell.scale.set(1.0, 0.98, 1.04);
    shell.castShadow = true;
    head.add(shell);
    // Visor and brow bar sit above the eyes.
    box(head, 0.205, 0.032, 0.060, 0.012, (mats.glass ?? eye), 0, 0.160, 0.150, {
      rotation: [-0.10, 0, 0],
      castShadow: false,
    });
    box(head, 0.245, 0.022, 0.024, 0.008, metal, 0, 0.150, 0.118);
    box(head, 0.150, 0.018, 0.060, 0.012, mat, 0, 0.184, 0.118, { rotation: [-0.20, 0, 0] });
    // Ear pads and chin strap.
    for (const s of [-1, 1]) {
      box(head, 0.022, 0.062, 0.062, 0.010, mat, s * 0.106, 0.098, 0.004);
      box(head, 0.012, 0.100, 0.012, 0.004, metal, s * 0.078, 0.055, 0.020, {
        rotation: [0, 0, s * 0.18],
      });
    }
        // Open-face shell with cheek guards and a chin bar.
    for (const s of [-1, 1]) {
      box(head, 0.026, 0.058, 0.060, 0.011, mat, s * 0.080, 0.046, 0.058);
    }
    box(head, 0.138, 0.026, 0.036, 0.012, mat, 0, 0.012, 0.082);
  }
  if (opts.hoodDown) {
    // Hood pushed back: a soft roll of fabric across the shoulders.
    box(torso, 0.235, 0.095, 0.110, 0.035, opts.hoodMat ?? top, 0, 0.468, -0.135, {
      rotation: [0.22, 0, 0],
    });
    for (const s of [-1, 1]) {
      sphere(torso, 0.055, opts.hoodMat ?? top, s * 0.095, 0.505, -0.105, [1.25, 0.85, 0.95]);
    }
  }
  if (opts.hood) {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 24, 18, Math.PI * 0.740, Math.PI * 1.34, 0, Math.PI * 0.72),
      opts.hoodMat ?? top
    );
    shell.position.set(0, 0.098, -0.038);
    shell.scale.set(1.06, 1.10, 1.06);
    shell.castShadow = true;
    head.add(shell);
    // Cowl around the neck.
    part(torso, new THREE.CylinderGeometry(0.148, 0.172, 0.14, 16), opts.hoodMat ?? top, 0, 0.548, -0.030, {
      scale: [1, 1, 0.9],
    });

  }

  if (opts.scarf) {
    part(torso, new THREE.TorusGeometry(0.106, 0.026, 6, 18), opts.scarf, 0, 0.548, 0, {
      rotation: [Math.PI / 2, 0, 0],
      scale: [1.02, 1, 1.08],
    });
    box(torso, 0.060, 0.055, 0.055, 0.018, opts.scarf, 0.070, 0.512, 0.105, {
      rotation: [0.1, 0.2, 0.1],
    });
    box(torso, 0.060, 0.21, 0.026, 0.010, opts.scarf, 0.058, 0.41, 0.135, {
      rotation: [0.06, 0, 0.05],
    });
    box(torso, 0.055, 0.10, 0.026, 0.010, opts.scarf, 0.070, 0.29, 0.140, {
      rotation: [0.1, 0, 0.08],
    });
  }

  if (opts.lanyard) {
    for (const s of [-1, 1]) {
      box(torso, 0.014, 0.30, 0.012, 0.004, opts.lanyard, s * 0.055, 0.36, 0.145, {
        rotation: [0, 0, s * 0.12],
        castShadow: false,
      });
    }
    box(torso, 0.085, 0.11, 0.014, 0.006, bone, 0.0, 0.19, 0.15, { castShadow: false });
    box(torso, 0.06, 0.035, 0.016, 0.004, rose, 0.0, 0.21, 0.155, { castShadow: false });
  }

  if (opts.backpack) {
    const pack = new THREE.Group();
    pack.position.set(0, 0.30, -0.19);
    torso.add(pack);
    box(pack, 0.33, 0.42, 0.20, 0.035, opts.backpack, 0, 0, 0);
    box(pack, 0.27, 0.12, 0.06, 0.02, opts.backpack, 0, -0.14, 0.08);
    box(pack, 0.10, 0.03, 0.02, 0.006, metal, 0, -0.02, 0.105);
    for (const s of [-1, 1]) {
      box(torso, 0.045, 0.32, 0.022, 0.008, opts.backpack, s * 0.12, 0.33, -0.005, {
        rotation: [0.1, 0, s * 0.06],
      });
    }
  }

  // Arms.
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(s * RIG.shoulderX, RIG.shoulderY, 0);
    torso.add(shoulder);
    // The rounded top of the upper-arm capsule is the deltoid; no joint ball.
    const upperMat = sleeve === 'none' ? skin : top;
    lathe(
      shoulder,
      puffer
        ? [[0.012, 0.044], [0.040, 0.034], [0.064, 0.010], [0.072, -0.03], [0.068, -0.12], [0.058, -0.26], [0.052, -0.30]]
        : [[0.010, 0.040], [0.034, 0.030], [0.052, 0.010], [0.058, -0.03], [0.054, -0.12], [0.046, -0.26], [0.042, -0.30]],
      1,
      upperMat,
      0
    );
    if (puffer) {
      part(shoulder, new THREE.TorusGeometry(0.059, 0.018, 4, 10), top, 0, -0.09, 0, {
        rotation: [Math.PI / 2, 0, 0],
      });
      part(shoulder, new THREE.TorusGeometry(0.057, 0.018, 4, 10), top, 0, -0.19, 0, {
        rotation: [Math.PI / 2, 0, 0],
      });
    }

    const elbow = new THREE.Group();
    elbow.position.y = -RIG.upperArm;
    shoulder.add(elbow);
    sphere(elbow, puffer ? 0.055 : 0.046, sleeve === 'long' ? top : skin, 0, 0, 0, [1, 0.9, 1]);
    lathe(
      elbow,
      puffer
        ? [[0.030, -0.27], [0.036, -0.23], [0.048, -0.10], [0.054, -0.02], [0.052, 0.0]]
        : [[0.028, -0.27], [0.033, -0.23], [0.042, -0.10], [0.047, -0.02], [0.045, 0.0]],
      1,
      sleeve === 'long' ? top : skin,
      0
    );
    if (sleeve === 'long') {
      part(elbow, new THREE.CylinderGeometry(0.056, 0.056, 0.040, 12), trim, 0, -0.247, 0);
    } else {
      part(shoulder, new THREE.CylinderGeometry(0.058, 0.059, 0.022, 12), trim, 0, -0.292, 0);
    }

    const wrist = new THREE.Group();
    wrist.position.y = -RIG.foreArm + 0.01;
    elbow.add(wrist);
    const handMat = opts.glove ?? skin;
    box(wrist, 0.070, 0.078, 0.054, 0.020, handMat, 0, -0.040, 0.002);
    // Fingers as one soft block, with two grooves, and a thumb across the side.
    box(wrist, 0.062, 0.048, 0.046, 0.016, handMat, 0, -0.088, 0.010);
    for (let f = -1; f <= 1; f += 2) {
      box(wrist, 0.004, 0.036, 0.006, 0.001, opts.glove ? metal : shade, f * 0.013, -0.092, 0.032, {
        castShadow: false,
      });
    }
    capsule(
      wrist,
      0.014,
      0.030,
      handMat,
      s * 0.036,
      -0.052,
      0.020,
      { rotation: [0.5, 0, -s * 0.5] }
    );

    J[s < 0 ? 'shoulderL' : 'shoulderR'] = shoulder;
    J[s < 0 ? 'elbowL' : 'elbowR'] = elbow;
    J[s < 0 ? 'wristL' : 'wristR'] = wrist;
  }

  // Legs.
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * RIG.hipX, -0.04, 0);
    pelvis.add(hip);
    sphere(hip, 0.068, bottom, 0, 0, 0, [0.95, 0.76, 0.95]);
    lathe(
      hip,
      loose
        ? [[0.066, -0.42], [0.074, -0.38], [0.090, -0.24], [0.104, -0.08], [0.100, 0.03]]
        : [[0.060, -0.42], [0.067, -0.38], [0.082, -0.24], [0.094, -0.08], [0.090, 0.03]],
      1,
      bottom,
      0
    );

    const knee = new THREE.Group();
    knee.position.y = -RIG.thigh;
    hip.add(knee);
    sphere(knee, 0.062, bottom, 0, 0, 0, [0.95, 0.82, 0.95]);
    lathe(
      knee,
      loose
        ? [[0.044, -0.40], [0.052, -0.36], [0.078, -0.18], [0.073, -0.08], [0.068, 0.0]]
        : [[0.040, -0.40], [0.046, -0.36], [0.068, -0.18], [0.064, -0.08], [0.060, 0.0]],
      1,
      bottom,
      0
    );
    // Cuff.
    part(knee, new THREE.CylinderGeometry(loose ? 0.082 : 0.073, loose ? 0.082 : 0.073, 0.04, 10), bottom, 0, -0.36, 0);

    const ankle = new THREE.Group();
    ankle.position.y = -RIG.shin;
    knee.add(ankle);
    box(ankle, 0.105, 0.07, 0.215, 0.03, shoe, 0, 0.017, 0.045);
    box(ankle, 0.098, 0.04, 0.055, 0.016, shoe, 0, 0.006, 0.158);
    // Sole.
    box(ankle, 0.108, 0.018, 0.225, 0.006, eye, 0, -0.018, 0.045);

    J[s < 0 ? 'hipL' : 'hipR'] = hip;
    J[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    J[s < 0 ? 'ankleL' : 'ankleR'] = ankle;
  }

  if (opts.scale) root.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
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

export function blendPose(base, add) {
  const out = {};
  for (const k of new Set([...Object.keys(base), ...Object.keys(add)])) {
    const a = base[k] ?? [0, 0, 0];
    const b = add[k] ?? [0, 0, 0];
    out[k] = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  return out;
}

export function mixPose(a, b, k) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const av = a[key] ?? [0, 0, 0];
    const bv = b[key] ?? [0, 0, 0];
    out[key] = [
      av[0] + (bv[0] - av[0]) * k,
      av[1] + (bv[1] - av[1]) * k,
      av[2] + (bv[2] - av[2]) * k,
    ];
  }
  return out;
}
