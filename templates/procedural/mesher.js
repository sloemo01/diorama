/**
 * Mesher: turns part lists into one vertex-coloured geometry.
 *
 * Everything static in a procedural diorama (terrain, every building, every
 * tree) lands in one Mesher: one material, one draw call, one shadow draw,
 * however many pieces the seed produced. Colours are palette tone names looked
 * up in palette.js, so the palette stays the single source of truth.
 */
import * as THREE from 'three';
import { chamferBoxGeometry } from '../geometry.js';
import { tone } from './palette.js';

const _color = new THREE.Color();
const _m = new THREE.Matrix4();
const _n = new THREE.Matrix3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();

// Shared materials, cached per clip-plane array (a rebuilt slab brings new planes, and
// with them new materials). disposeShared() releases them all.
const _materials = new Map();
let _clipIds = new WeakMap(), _nextClip = 1;
const clipKey = (clip) => {
  if (!clip) return 0;
  if (!_clipIds.has(clip)) _clipIds.set(clip, _nextClip++);
  return _clipIds.get(clip);
};
function cached(key, make) {
  if (!_materials.has(key)) _materials.set(key, make());
  return _materials.get(key);
}
/** The one lit material of the scene: vertex colours, Lambert, shadows. */
export function paletteMaterial(clip = null) {
  return cached('lit|' + clipKey(clip), () => new THREE.MeshLambertMaterial({ vertexColors: true, clippingPlanes: clip }));
}
/** Unlit vertex colours, for windows and lanterns at night. */
export function glowMaterial(clip = null) {
  return cached('glow|' + clipKey(clip), () => new THREE.MeshBasicMaterial({ vertexColors: true, clippingPlanes: clip }));
}
/** Release every shared material (call it before building a new diorama). */
export function disposeShared() {
  _materials.forEach((m) => m.dispose());
  _materials.clear();
  _clipIds = new WeakMap();
}

/** Gable prism: ridge along x, base at y 0. */
export function prismGeometry(w, h, d) {
  const x = w / 2, z = d / 2;
  const P = [
    [-x, 0, z], [x, 0, z], [x, h, 0], [-x, 0, z], [x, h, 0], [-x, h, 0],
    [x, 0, -z], [-x, 0, -z], [-x, h, 0], [x, 0, -z], [-x, h, 0], [x, h, 0],
    [x, 0, z], [x, 0, -z], [x, h, 0],
    [-x, 0, -z], [-x, 0, z], [-x, h, 0],
    [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, -z], [x, 0, z], [-x, 0, z],
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P.flat(), 3));
  geo.computeVertexNormals();
  return geo;
}

/** Four-sided pyramid on a w x d rectangle, base at y 0 (a hip roof). */
export function pyramidGeometry(w, h, d) {
  const x = w / 2, z = d / 2;
  const A = [-x, 0, z], B = [x, 0, z], Cc = [x, 0, -z], D = [-x, 0, -z], T = [0, h, 0];
  const P = [A, B, T, B, Cc, T, Cc, D, T, D, A, T, A, D, Cc, A, Cc, B];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P.flat(), 3));
  geo.computeVertexNormals();
  return geo;
}

export function geometryOf(part) {
  const a = part.a;
  switch (part.g) {
    case 'box':
      return part.ch ? chamferBoxGeometry(a[0], a[1], a[2], { top: part.ch, bottom: part.ch }) : new THREE.BoxGeometry(a[0], a[1], a[2]);
    case 'cyl':
      return new THREE.CylinderGeometry(a[0], a[1], a[2], part.seg ?? 8, 1, false);
    case 'cone':
      return new THREE.ConeGeometry(a[0], a[1], part.seg ?? 8);
    case 'sphere':
      return new THREE.SphereGeometry(a[0], part.ws ?? 8, part.hs ?? 6);
    case 'prism':
      return prismGeometry(a[0], a[1], a[2]);
    case 'pyramid':
      return pyramidGeometry(a[0], a[1], a[2]);
    case 'torus':
      return new THREE.TorusGeometry(a[0], a[1], part.rs ?? 5, part.ts ?? 12);
    default:
      throw new Error('unknown part geometry: ' + part.g);
  }
}

export class Mesher {
  constructor() {
    this.pos = [];
    this.nor = [];
    this.col = [];
    this.stack = [new THREE.Matrix4()];
  }

  /** Run fn with an extra transform (a piece placed in the world). */
  at(x, y, z, ry, scale, fn) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry || 0, 0)),
      new THREE.Vector3(scale || 1, scale || 1, scale || 1));
    this.stack.push(new THREE.Matrix4().multiplyMatrices(this.stack[this.stack.length - 1], m));
    try { fn(this); } finally { this.stack.pop(); }
    return this;
  }

  add(geometry, toneName, x = 0, y = 0, z = 0, o = {}) {
    const geo = geometry.index ? geometry.toNonIndexed() : geometry;
    _m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(o.rx || 0, o.ry || 0, o.rz || 0)), _s.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1));
    _m.premultiply(this.stack[this.stack.length - 1]);
    _n.getNormalMatrix(_m);
    const p = geo.attributes.position, n = geo.attributes.normal;
    _color.set(tone(toneName));
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i).applyMatrix4(_m);
      this.pos.push(_v.x, _v.y, _v.z);
      _v.fromBufferAttribute(n, i).applyMatrix3(_n).normalize();
      this.nor.push(_v.x, _v.y, _v.z);
      this.col.push(_color.r, _color.g, _color.b);
    }
    if (geo !== geometry) geo.dispose();
    geometry.dispose();
    return this;
  }

  /** One part from the grammar. */
  part(pt) {
    return this.add(geometryOf(pt), pt.c, pt.p[0], pt.p[1], pt.p[2], { rx: pt.rx, ry: pt.ry, rz: pt.rz, sx: pt.sx, sy: pt.sy, sz: pt.sz });
  }
  parts(list) {
    for (const pt of list) this.part(pt);
    return this;
  }
  box(w, h, d, c, x, y, z, o = {}) { return this.part({ g: 'box', a: [w, h, d], c, p: [x, y, z], ...o }); }

  get triangles() { return this.pos.length / 9; }

  geometry() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }

  mesh(o = {}) {
    const mesh = new THREE.Mesh(this.geometry(), o.material || paletteMaterial(o.clip));
    mesh.castShadow = o.cast ?? true;
    mesh.receiveShadow = o.receive ?? true;
    if (o.name) mesh.name = o.name;
    return mesh;
  }
}

/** Parts -> one small mesh (a moving piece). */
export function partsMesh(list, o = {}) {
  const m = new Mesher();
  m.parts(list);
  return m.mesh(o);
}


/**
 * Parts -> a Group with one mesh per part and one shared material per tone. Heavier
 * than a merged mesh, but each tone is its own material, so vary.js can retint an
 * authored object. Use it for hand-made pieces you want to vary; merge the rest.
 */
export function partsGroup(list, o = {}) {
  const g = new THREE.Group();
  for (const pt of list) {
    const mat = cached('tone|' + pt.c + '|' + clipKey(o.clip), () => new THREE.MeshLambertMaterial({ color: tone(pt.c), clippingPlanes: o.clip ?? null }));
    const mesh = new THREE.Mesh(geometryOf(pt), mat);
    mesh.position.set(pt.p[0], pt.p[1], pt.p[2]);
    mesh.rotation.set(pt.rx || 0, pt.ry || 0, pt.rz || 0);
    mesh.scale.set(pt.sx ?? 1, pt.sy ?? 1, pt.sz ?? 1);
    mesh.castShadow = o.cast ?? true;
    mesh.receiveShadow = true;
    g.add(mesh);
  }
  if (o.name) g.name = o.name;
  return g;
}
