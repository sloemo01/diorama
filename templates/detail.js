/**
 * Reusable detail assemblies. All colours come from the caller's materials so
 * the palette stays the single source of truth.
 */
import * as THREE from 'three';

export function mesh(parent, geo, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (opts.rotation) m.rotation.set(...opts.rotation);
  if (opts.scale) m.scale.set(...opts.scale);
  m.castShadow = opts.castShadow ?? true;
  m.receiveShadow = opts.receiveShadow ?? true;
  parent.add(m);
  return m;
}

/** A straight bone/rope/bar between two points. */
export function seg(parent, a, b, r0, r1, mat, opts = {}) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(0.001, dir.length());
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const m = mesh(
    parent,
    new THREE.CylinderGeometry(r1, r0, len, opts.segments ?? 5),
    mat,
    mid.x,
    mid.y,
    mid.z,
    opts
  );
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

/** Horizontal iron band around a shaft. */
export function band(parent, radius, tube, mat, y, opts = {}) {
  return mesh(
    parent,
    new THREE.TorusGeometry(radius, tube, 4, opts.segments ?? 10),
    mat,
    0,
    y,
    0,
    { rotation: [Math.PI / 2, 0, 0], ...opts }
  );
}

/** A ring of rivets/studs around a horizontal circle. */
export function rivets(parent, mat, count, radius, y, size = 0.03, opts = {}) {
  const g = new THREE.Group();
  g.position.y = y;
  parent.add(g);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    mesh(g, new THREE.SphereGeometry(size, 4, 3), mat, Math.sin(a) * radius, 0, Math.cos(a) * radius, {
      castShadow: false,
      ...opts,
    });
  }
  return g;
}

/** Simple spoked wheel in the YZ plane, axle along X. */
export function wheel(parent, mat, rimMat, x, y, z, radius = 0.3, width = 0.06, spokes = 6) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  mesh(g, new THREE.TorusGeometry(radius, width, 4, 12), mat, 0, 0, 0, {
    rotation: [0, Math.PI / 2, 0],
  });
  mesh(g, new THREE.TorusGeometry(radius + 0.02, 0.018, 4, 12), rimMat, 0, 0, 0, {
    rotation: [0, Math.PI / 2, 0],
    castShadow: false,
  });
  for (let i = 0; i < spokes; i++) {
    mesh(g, new THREE.BoxGeometry(0.035, radius * 1.9, 0.035), mat, 0, 0, 0, {
      rotation: [(i / spokes) * Math.PI, 0, 0],
      castShadow: false,
    });
  }
  mesh(g, new THREE.CylinderGeometry(0.06, 0.06, width * 1.6, 6), rimMat, 0, 0, 0, {
    rotation: [0, 0, Math.PI / 2],
    castShadow: false,
  });
  return g;
}

/** A tied rectangular hay bale, with straw tufts. */
export function bale(parent, mat, tieMat, x, y, z, opts = {}) {
  const w = opts.w ?? 0.6;
  const h = opts.h ?? 0.3;
  const d = opts.d ?? 0.46;
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (opts.rotation) g.rotation.y = opts.rotation;
  parent.add(g);
  mesh(g, new THREE.BoxGeometry(w, h, d), mat, 0, 0, 0);
  for (const s of [-1, 1]) {
    mesh(g, new THREE.BoxGeometry(0.032, h * 1.04, d * 1.04), tieMat, s * w * 0.25, 0, 0, {
      castShadow: false,
    });
  }
  for (let i = 0; i < 5; i++) {
    mesh(g, new THREE.BoxGeometry(0.015, 0.11, 0.015), mat, -w * 0.35 + i * w * 0.17, h * 0.6, d * 0.3, {
      rotation: [0.2, 0, 0.4 - i * 0.2],
      castShadow: false,
    });
  }
  return g;
}

/** A horned skull facing +Z. Mount it on trophyBoard(), never in mid-air. */
export function skull(parent, boneMat, inkMat, x, y, z, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  mesh(g, new THREE.SphereGeometry(0.22 * s, 7, 6), boneMat, 0, 0, 0, { scale: [1, 0.92, 1.04] });
  mesh(g, new THREE.BoxGeometry(0.34 * s, 0.09 * s, 0.16 * s), boneMat, 0, 0.09 * s, 0.12 * s);
  mesh(g, new THREE.BoxGeometry(0.19 * s, 0.14 * s, 0.22 * s), boneMat, 0, -0.12 * s, 0.18 * s, {
    rotation: [0.12, 0, 0],
  });
  mesh(g, new THREE.BoxGeometry(0.17 * s, 0.07 * s, 0.18 * s), boneMat, 0, -0.2 * s, 0.2 * s);
  for (const side of [-1, 1]) {
    mesh(g, new THREE.BoxGeometry(0.075 * s, 0.09 * s, 0.06 * s), inkMat, side * 0.085 * s, 0.03 * s, 0.2 * s, {
      castShadow: false,
    });
    const a = new THREE.Vector3(side * 0.16 * s, 0.11 * s, 0.02 * s);
    const b = new THREE.Vector3(side * 0.31 * s, 0.25 * s, 0);
    const c = new THREE.Vector3(side * 0.41 * s, 0.43 * s, -0.02 * s);
    const d = new THREE.Vector3(side * 0.35 * s, 0.56 * s, -0.01 * s);
    seg(g, a, b, 0.06 * s, 0.048 * s, boneMat);
    seg(g, b, c, 0.048 * s, 0.034 * s, boneMat);
    seg(g, c, d, 0.034 * s, 0.02 * s, boneMat);
  }
  return g;
}


/** A rope/chain run through points. Returns the segment group. */
export function rope(parent, points, radius, mat, opts = {}) {
  const g = new THREE.Group();
  parent.add(g);
  for (let i = 1; i < points.length; i++) {
    seg(g, points[i - 1], points[i], radius, radius * 0.92, mat, {
      segments: opts.segments ?? 4,
      castShadow: opts.castShadow ?? true,
    });
    if (i < points.length - 1) {
      mesh(g, new THREE.SphereGeometry(radius * 1.05, 4, 3), mat, points[i].x, points[i].y, points[i].z, {
        castShadow: false,
      });
    }
  }
  return g;
}

/** A trophy board with studs and a rope loop; place a skull on its face. */
export function trophyBoard(parent, woodMat, ironMat, x, y, z, w = 0.62, h = 0.72) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  mesh(g, new THREE.BoxGeometry(w, h, 0.07), woodMat, 0, 0, 0);
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      mesh(g, new THREE.SphereGeometry(0.028, 4, 3), ironMat, sx * w * 0.38, sy * h * 0.38, 0.045, {
        castShadow: false,
      });
    }
  }
  mesh(g, new THREE.TorusGeometry(0.06, 0.012, 3, 6), ironMat, 0, h * 0.5, 0, {
    rotation: [Math.PI / 2, 0, 0],
    castShadow: false,
  });
  return g;
}

let _shadowTex = null;
function shadowTexture() {
  if (_shadowTex) return _shadowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
  g.addColorStop(0, 'rgba(0,0,0,0.72)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _shadowTex = new THREE.CanvasTexture(c);
  return _shadowTex;
}

/** Ground-projected contact shadow. Put it on the surface the object stands on. */
export function contactShadow(parent, x, y, z, size = 1, opacity = 0.62) {
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
    color: 0x000000,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y + 0.018, z);
  m.renderOrder = 1;
  parent.add(m);
  return m;
}

const _radialTex = new Map();

/**
 * Soft radial-alpha texture for halos, light pools and glow cards.
 * `rgb` is an "r,g,b" string so the texture bakes the palette colour.
 */
export function softDiscTexture(rgb = '255,255,255', size = 64) {
  const key = `${rgb}|${size}`;
  if (_radialTex.has(key)) return _radialTex.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.03, size / 2, size / 2, size * 0.49);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.45, `rgba(${rgb},0.55)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  _radialTex.set(key, tex);
  return tex;
}

/**
 * A glow card with a soft edge. Use this instead of an untextured additive
 * PlaneGeometry: a flat quad reads as a light-grey rectangle at the palette snap.
 * Add it to the prop so it moves with the lamp/board/sign.
 */
export function haloPlane(parent, width, height, rgb, opacity = 0.35, x = 0, y = 0, z = 0, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map: softDiscTexture(rgb),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    color: 0xffffff,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  m.position.set(x, y, z);
  if (opts.rotation) m.rotation.set(...opts.rotation);
  m.renderOrder = opts.renderOrder ?? 3;
  parent.add(m);
  return m;
}
