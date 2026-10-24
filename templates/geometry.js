import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * A crisp, flat-shaded box with geometrically chamfered top / bottom edges.
 * The chamfer lives in the geometry (not in a normal map), so it catches a real
 * specular highlight and reads as thickness at small scale.
 */
export function chamferBoxGeometry(w, h, d, opts = {}) {
  const top = opts.top ?? Math.min(w, d, h) * 0.06;
  const bottom = opts.bottom ?? 0;
  const hw = w * 0.5;
  const hd = d * 0.5;
  const hh = h * 0.5;
  const t = Math.min(top, hw * 0.35, hd * 0.35, h * 0.35);
  const b = Math.min(bottom, hw * 0.35, hd * 0.35, h * 0.35);
  const yt = hh - t;
  const yb = -hh + b;
  const tx = hw - t;
  const tz = hd - t;
  const bx = hw - b;
  const bz = hd - b;

  const pos = [];
  const nor = [];
  const center = new THREE.Vector3();

  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  function tri(a, b, c, n) {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    for (let i = 0; i < 3; i++) nor.push(n.x, n.y, n.z);
  }

  function quad(a, b, c, d, hint) {
    const n = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();
    if (n.dot(hint) < 0) {
      const tmp = b;
      b = d;
      d = tmp;
      n.negate();
    }
    tri(a, b, c, n);
    tri(a, c, d, n);
  }

  // Bottom cap
  if (b > 0.0001) {
    quad(
      v(-bx, -hh, -bz), v(bx, -hh, -bz), v(bx, -hh, bz), v(-bx, -hh, bz),
      v(0, -1, 0)
    );
  } else {
    quad(
      v(-hw, -hh, -hd), v(hw, -hh, -hd), v(hw, -hh, hd), v(-hw, -hh, hd),
      v(0, -1, 0)
    );
  }

  // Four sides
  quad(v(hw, yb, -hd), v(hw, yb, hd), v(hw, yt, hd), v(hw, yt, -hd), v(1, 0, 0));
  quad(v(-hw, yb, hd), v(-hw, yb, -hd), v(-hw, yt, -hd), v(-hw, yt, hd), v(-1, 0, 0));
  quad(v(-hw, yb, hd), v(hw, yb, hd), v(hw, yt, hd), v(-hw, yt, hd), v(0, 0, 1));
  quad(v(hw, yb, -hd), v(-hw, yb, -hd), v(-hw, yt, -hd), v(hw, yt, -hd), v(0, 0, -1));

  // Top chamfer band
  quad(v(hw, yt, -hd), v(hw, yt, hd), v(tx, hh, tz), v(tx, hh, -tz), v(1, 1, 0));
  quad(v(-hw, yt, hd), v(-hw, yt, -hd), v(-tx, hh, -tz), v(-tx, hh, tz), v(-1, 1, 0));
  quad(v(-hw, yt, hd), v(hw, yt, hd), v(tx, hh, tz), v(-tx, hh, tz), v(0, 1, 1));
  quad(v(hw, yt, -hd), v(-hw, yt, -hd), v(-tx, hh, -tz), v(tx, hh, -tz), v(0, 1, -1));

  // Top cap
  quad(v(-tx, hh, -tz), v(tx, hh, -tz), v(tx, hh, tz), v(-tx, hh, tz), v(0, 1, 0));

  // Bottom chamfer band
  if (b > 0.0001) {
    quad(v(bx, -hh, -bz), v(hw, yb, -hd), v(hw, yb, hd), v(bx, -hh, bz), v(1, -1, 0));
    quad(v(-bx, -hh, bz), v(-hw, yb, hd), v(-hw, yb, -hd), v(-bx, -hh, -bz), v(-1, -1, 0));
    quad(v(-bx, -hh, bz), v(bx, -hh, bz), v(hw, yb, hd), v(-hw, yb, hd), v(0, -1, 1));
    quad(v(bx, -hh, -bz), v(-bx, -hh, -bz), v(-hw, yb, -hd), v(hw, yb, -hd), v(0, -1, -1));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.computeBoundingSphere();
  return geo;
}

export function roundedBoxGeometry(w, h, d, radius = 0.02, segments = 2) {
  return new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, w * 0.45, h * 0.45, d * 0.45));
}

/** A chamfered rectangle path, used for the plan section of the concrete shell. */
export function chamferedRectShape(w, d, chamfer = 0.12) {
  const hw = w * 0.5;
  const hd = d * 0.5;
  const c = Math.min(chamfer, hw * 0.4, hd * 0.4);
  const s = new THREE.Shape();
  s.moveTo(-hw + c, -hd);
  s.lineTo(hw - c, -hd);
  s.lineTo(hw, -hd + c);
  s.lineTo(hw, hd - c);
  s.lineTo(hw - c, hd);
  s.lineTo(-hw + c, hd);
  s.lineTo(-hw, hd - c);
  s.lineTo(-hw, -hd + c);
  s.closePath();
  return s;
}

/** Rectangular ring slab with an actual hole and chamfered edges. */
export function ringSlabGeometry(outerW, outerD, innerW, innerD, thickness, bevel = 0.02) {
  const shape = chamferedRectShape(outerW, outerD, bevel * 2.2);
  const hole = new THREE.Path();
  const hw = innerW * 0.5;
  const hd = innerD * 0.5;
  hole.moveTo(-hw, -hd);
  hole.lineTo(hw, -hd);
  hole.lineTo(hw, hd);
  hole.lineTo(-hw, hd);
  hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 1,
    steps: 1,
  });
  geo.rotateX(-Math.PI / 2);
  // After rotateX(-90) the extrusion runs from y=0 to y=thickness.
  geo.translate(0, -thickness, 0);
  geo.computeVertexNormals();
  return geo;
}

/** Extrude a plan ring vertically (concrete pool walls). */
export function extrudedWallRing(outerW, outerD, innerW, innerD, height, opts = {}) {
  const shape = chamferedRectShape(outerW, outerD, opts.chamfer ?? 0.14);
  const hole = new THREE.Path();
  const hw = innerW * 0.5;
  const hd = innerD * 0.5;
  hole.moveTo(-hw, -hd);
  hole.lineTo(hw, -hd);
  hole.lineTo(hw, hd);
  hole.lineTo(-hw, hd);
  hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: opts.bevel ?? 0.015,
    bevelSize: opts.bevel ?? 0.015,
    bevelSegments: 2,
    curveSegments: 1,
    steps: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -height, 0);
  geo.computeVertexNormals();
  return geo;
}

/** Plane whose height follows a function of x (used for the sloping pool floor). */
export function heightFieldGeometry(width, depth, segX, segZ, heightFn) {
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, heightFn(x, z));
  }
  geo.computeVertexNormals();
  return geo;
}

export function quatFromBasis(u, normal) {
  const x = u.clone().normalize();
  const y = normal.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

export function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function hash3(x, y, z) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453123;
  return s - Math.floor(s);
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build an InstancedMesh from a list of { position, quaternion, scale, color }.
 * A tiny custom varying (vInstColor) is injected into the material so instance
 * tint works reliably on MeshStandardMaterial / MeshPhysicalMaterial.
 */
export function instancedMesh(geometry, material, items, opts = {}) {
  const mesh = new THREE.InstancedMesh(geometry, material, items.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    q.copy(it.quaternion);
    s.copy(it.scale ?? { x: 1, y: 1, z: 1 });
    m.compose(it.position, q, s);
    mesh.setMatrixAt(i, m);
    if (it.color) mesh.setColorAt(i, it.color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = opts.castShadow ?? false;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  mesh.frustumCulled = false;
  return mesh;
}

export function colorVariation(base, rand, h = 0.01, s = 0.05, l = 0.03) {
  const c = base.clone();
  c.offsetHSL((rand() - 0.5) * h, (rand() - 0.5) * s, (rand() - 0.5) * l);
  return c;
}

export function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function addBox(group, w, h, d, material, x, y, z, opts = {}) {
  const geo = opts.chamfer
    ? chamferBoxGeometry(w, h, d, { top: opts.chamfer, bottom: opts.chamferBottom ?? 0 })
    : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rotation) mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  group.add(mesh);
  return mesh;
}

export function addCylinder(group, rTop, rBottom, h, material, x, y, z, opts = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, opts.segments ?? 16, opts.heightSegments ?? 1, opts.open ?? false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rotation) mesh.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  group.add(mesh);
  return mesh;
}

export function addSphere(group, r, material, x, y, z, scale = [1, 1, 1], opts = {}) {
  const geo = new THREE.SphereGeometry(r, opts.widthSegments ?? 20, opts.heightSegments ?? 14);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  group.add(mesh);
  return mesh;
}

export function makeTube(points, radius, material, opts = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.35);
  const geo = new THREE.TubeGeometry(curve, opts.segments ?? 48, radius, opts.radialSegments ?? 8, false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}
