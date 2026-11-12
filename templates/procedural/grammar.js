/**
 * Shape grammar: buildings, landmarks and props as lists of parts.
 *
 * A part is plain data, `{ g, a, p, r, c, ... }`: geometry kind, its dimensions,
 * a position and rotation in the lot's local frame, and a palette tone NAME. The
 * grammar never touches THREE, so a building can be counted, audited and diffed
 * in node (does every cottage have at least eight assemblies? does any part use
 * a colour outside the palette?) before anything is drawn.
 *
 * Every style follows the Detail Bar: a silhouette (walls + roof), construction
 * (posts, trims, frames, steps, ridge caps) and at least one story detail drawn
 * from the seed (a ladder left against the wall, a patched roof, a woodpile).
 * Free orbit shows every side, so every face gets its windows (the guide's
 * "detail lives on every orbit-exposed surface").
 *
 * Parts in `glow` are the night windows and lanterns (drawn unlit, switched on by
 * the day-night cycle). `smoke` lists chimney mouths. `dyn` lists moving parts
 * (windmill sails, a lighthouse lamp, a fountain, a fire) the stage animates.
 */

const PI = Math.PI;

export class Parts {
  constructor() {
    this.list = [];
    this.glow = [];
    this.smoke = [];
    this.dyn = [];
    this.top = 0;
  }
  _add(target, g, a, c, x, y, z, o = {}) {
    const part = { g, a, p: [x, y, z], c, ...o };
    target.push(part);
    const up = g === 'box' ? a[1] / 2 : g === 'prism' || g === 'pyramid' ? a[1] : g === 'cyl' ? a[2] / 2 : g === 'cone' ? a[1] / 2 : a[0];
    this.top = Math.max(this.top, y + up * (o.sy ?? 1));
    return this;
  }
  box(w, h, d, c, x, y, z, o) { return this._add(this.list, 'box', [w, h, d], c, x, y, z, o); }
  cyl(rt, rb, h, c, x, y, z, o) { return this._add(this.list, 'cyl', [rt, rb, h], c, x, y, z, o); }
  cone(r, h, c, x, y, z, o) { return this._add(this.list, 'cone', [r, h], c, x, y, z, o); }
  sphere(r, c, x, y, z, o) { return this._add(this.list, 'sphere', [r], c, x, y, z, o); }
  prism(w, h, d, c, x, y, z, o) { return this._add(this.list, 'prism', [w, h, d], c, x, y, z, o); }
  torus(r, tube, c, x, y, z, o) { return this._add(this.list, 'torus', [r, tube], c, x, y, z, o); }
  glowBox(w, h, d, c, x, y, z, o) { return this._add(this.glow, 'box', [w, h, d], c, x, y, z, o); }
  /** Number of visible assemblies, for the Detail Bar audit. */
  get count() { return this.list.length + this.glow.length; }
}

/* ---- shared construction ----------------------------------------------------------------- */

const FACE = {
  front: { lx: 0, lz: 1 },
  right: { lx: 1, lz: 0 },
  left: { lx: -1, lz: 0 },
  back: { lx: 0, lz: -1 },
};
/** The faces that get windows and trim: all four, because the viewer can orbit to any of them. */
export function cameraFaces(yaw) {
  return Object.keys(FACE);
}

function box3(b) {
  return { w: b.x1 - b.x0, d: b.z1 - b.z0, cx: (b.x0 + b.x1) / 2, cz: (b.z0 + b.z1) / 2 };
}

/** One window with frame, sill and a night glow pane. `face` decides its plane. */
function windowOn(P, b, face, u, y, o = {}) {
  const { w, d, cx, cz } = box3(b);
  const ww = o.w ?? 0.3, wh = o.h ?? 0.34, frame = o.frame ?? 'paper2', glass = o.glass ?? 'slate2';
  const e = 0.012;
  if (face === 'front' || face === 'back') {
    const s = face === 'front' ? 1 : -1;
    const x = cx + u * w, z = (face === 'front' ? b.z1 : b.z0) + s * e;
    P.box(ww + 0.07, wh + 0.07, 0.03, frame, x, y, z);
    P.box(ww, wh, 0.03, glass, x, y, z + s * 0.008);
    P.box(0.025, wh, 0.035, frame, x, y, z + s * 0.012);
    P.box(ww + 0.12, 0.04, 0.08, frame, x, y - wh / 2 - 0.05, z + s * 0.03);
    P.glowBox(ww - 0.02, wh - 0.02, 0.02, 'lamp', x, y, z + s * 0.016);
    if (o.box) {
      P.box(ww + 0.06, 0.08, 0.1, 'wood2', x, y - wh / 2 - 0.12, z + s * 0.05);
      for (let i = -1; i <= 1; i++) P.sphere(0.04, o.box, x + i * 0.1, y - wh / 2 - 0.06, z + s * 0.06, { ws: 5, hs: 4 });
    }
  } else {
    const s = face === 'right' ? 1 : -1;
    const z = cz + u * d, x = (face === 'right' ? b.x1 : b.x0) + s * e;
    P.box(0.03, wh + 0.07, ww + 0.07, frame, x, y, z);
    P.box(0.03, wh, ww, glass, x + s * 0.008, y, z);
    P.box(0.035, wh, 0.025, frame, x + s * 0.012, y, z);
    P.box(0.08, 0.04, ww + 0.12, frame, x + s * 0.03, y - wh / 2 - 0.05, z);
    P.glowBox(0.02, wh - 0.02, ww - 0.02, 'lamp', x + s * 0.016, y, z);
  }
}

/** Windows on every face, keeping clear of the door. */
function windows(P, b, faces, y, r, o = {}) {
  const { w, d } = box3(b);
  for (const f of faces) {
    const span = f === 'front' || f === 'back' ? w : d;
    const n = Math.max(1, Math.floor(span / 0.78));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n - 0.5;
      if (f === 'front' && o.doorU !== undefined && Math.abs(u - o.doorU) * span < 0.42) continue;
      windowOn(P, b, f, u, y, { ...o, box: o.flowers && r.chance(0.5) ? r.pick(['pink', 'red', 'amber']) : null });
    }
  }
}

function door(P, x, z, w, h, tone, r, o = {}) {
  P.box(w + 0.08, h + 0.05, 0.04, o.frame ?? 'wood3', x, h / 2, z + 0.01);
  P.box(w, h, 0.04, tone, x, h / 2, z + 0.025);
  P.box(w * 0.8, 0.03, 0.045, 'wood4', x, h * 0.3, z + 0.03);
  P.box(w * 0.8, 0.03, 0.045, 'wood4', x, h * 0.72, z + 0.03);
  P.sphere(0.022, 'amber', x + w * 0.32, h * 0.5, z + 0.055, { ws: 4, hs: 3 });
  P.box(w + 0.2, 0.06, 0.2, o.step ?? 'stone2', x, 0.03, z + 0.1);
}

/** Gable roof with the ridge along local x, eaves trim, ridge cap and tile rows. */
function gableRoof(P, b, y, o) {
  const { w, d, cx, cz } = box3(b);
  const ov = o.overhang ?? 0.14;
  const h = o.pitch ?? d * 0.42;
  const tone = o.tone, dark = o.dark ?? tone;
  P.prism(w + ov * 2, h, d + ov * 2, tone, cx, y, cz);
  P.box(w + ov * 2 + 0.04, 0.06, 0.08, dark, cx, y + h + 0.01, cz);
  // tile rows on the front slope (local +z)
  const ang = Math.atan2(h, d / 2 + ov);
  const rows = 3;
  for (let i = 1; i <= rows; i++) {
    const u = i / (rows + 1);
    const zz = cz + (d / 2 + ov) * (1 - u);
    P.box(w + ov * 2 + 0.01, 0.022, 0.05, dark, cx, y + h * u + 0.012, zz, { rx: -ang });
  }
  // gable boards and the eave board under the front slope
  P.box(0.04, 0.05, d + ov * 2, o.trim ?? 'wood3', cx + w / 2 + ov, y + 0.01, cz);
  P.box(0.04, 0.05, d + ov * 2, o.trim ?? 'wood3', cx - w / 2 - ov, y + 0.01, cz);
  P.box(w + ov * 2, 0.05, 0.04, o.trim ?? 'wood3', cx, y + 0.01, cz + d / 2 + ov);
  if (o.patch) P.box(0.3, 0.025, 0.24, o.patch, cx + w * 0.2, y + h * 0.4 + 0.02, cz + d * 0.22, { rx: -ang });
  return y + h;
}

/** Pyramid (hip) roof: a four-sided cone, scaled to the footprint. */
function hipRoof(P, b, y, o) {
  const { w, d, cx, cz } = box3(b);
  const ov = o.overhang ?? 0.12;
  const h = o.pitch ?? Math.min(w, d) * 0.45;
  P._add(P.list, 'pyramid', [w + ov * 2, h, d + ov * 2], o.tone, cx, y, cz);
  P.box(w + ov * 2 + 0.02, 0.06, d + ov * 2 + 0.02, o.trim ?? 'wood3', cx, y + 0.03, cz);
  P.sphere(0.06, o.finial ?? 'amber', cx, y + h + 0.03, cz, { ws: 5, hs: 4 });
  return y + h;
}

function chimney(P, x, z, y0, top, tone = 'stone2') {
  P.box(0.24, top - y0, 0.24, tone, x, (y0 + top) / 2, z);
  P.box(0.3, 0.06, 0.3, 'stone3', x, top + 0.03, z);
  P.box(0.14, 0.06, 0.14, 'ink', x, top + 0.07, z);
  P.smoke.push({ x, y: top + 0.12, z });
}

/** Corner posts and a belt beam: the half-timbered look. */
function timber(P, b, h, tone) {
  const { w, d, cx, cz } = box3(b);
  for (const [x, z] of [[b.x0, b.z1], [b.x1, b.z1], [b.x1, b.z0], [b.x0, b.z0]]) P.box(0.07, h, 0.07, tone, x, h / 2, z);
  P.box(w + 0.02, 0.06, 0.04, tone, cx, h * 0.52, b.z1 + 0.012);
  P.box(0.04, 0.06, d + 0.02, tone, b.x1 + 0.012, h * 0.52, cz);
  P.box(w + 0.04, 0.12, d + 0.04, 'stone3', cx, 0.06, cz);
}

/** One story detail, drawn from the seed: who used this place, and how. Always on
 *  the left side (the yard is on the right), or on the porch. */
function storyDetail(P, b, r, kinds) {
  const { w, d, cx, cz } = box3(b);
  const k = r.pick(kinds);
  const x0 = b.x0;
  if (k === 'ladder') {
    const x = x0 - 0.12, z = cz + d * 0.2;
    P.box(0.03, 1.3, 0.03, 'wood1', x, 0.64, z - 0.12, { rz: -0.16 });
    P.box(0.03, 1.3, 0.03, 'wood1', x, 0.64, z + 0.12, { rz: -0.16 });
    for (let i = 0; i < 4; i++) P.box(0.03, 0.025, 0.26, 'wood1', x + 0.03 + i * 0.045, 0.22 + i * 0.28, z, { rz: -0.16 });
  } else if (k === 'woodpile') {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) {
      P.cyl(0.06, 0.06, 0.5, i % 2 ? 'wood1' : 'wood2', x0 - 0.1, 0.07 + i * 0.11, cz - 0.15 + j * 0.13 + i * 0.065, { rx: PI / 2, seg: 6 });
    }
  } else if (k === 'bench') {
    P.box(0.62, 0.05, 0.2, 'wood1', cx - w * 0.22, 0.3, b.z1 + 0.18);
    P.box(0.05, 0.3, 0.18, 'wood3', cx - w * 0.22 - 0.26, 0.15, b.z1 + 0.18);
    P.box(0.05, 0.3, 0.18, 'wood3', cx - w * 0.22 + 0.26, 0.15, b.z1 + 0.18);
  } else if (k === 'barrel') {
    P.cyl(0.13, 0.11, 0.34, 'wood1', x0 - 0.04, 0.17, b.z1 - 0.2, { seg: 9 });
    P.cyl(0.135, 0.135, 0.03, 'steel2', x0 - 0.04, 0.08, b.z1 - 0.2, { seg: 9 });
    P.cyl(0.135, 0.135, 0.03, 'steel2', x0 - 0.04, 0.27, b.z1 - 0.2, { seg: 9 });
  } else if (k === 'broom') {
    P.box(0.025, 0.95, 0.025, 'wood1', x0 + 0.1, 0.48, b.z1 + 0.06, { rz: -0.12 });
    P.cone(0.08, 0.2, 'mustard', x0 + 0.14, 0.08, b.z1 + 0.06, { seg: 6 });
  } else if (k === 'sign') {
    P.box(0.34, 0.03, 0.03, 'ink', x0 + 0.17, 1.0, b.z1 + 0.04);
    P.box(0.03, 0.22, 0.3, 'wood0', x0 + 0.3, 0.86, b.z1 + 0.12);
  }
}

/* ---- building styles ---------------------------------------------------------------------- */

const STOREY = 1.12;

function cottage(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, cx } = box3(b);
  const h = STOREY * lot.storeys;
  const faces = cameraFaces(lot.yaw);
  P.box(w, h, b.z1 - b.z0, r.pick(['paper2', 'paper3', 'stone0', 'earth0']), cx, h / 2, (b.z0 + b.z1) / 2);
  timber(P, b, h, 'wood3');
  door(P, lot.frame.door.x, b.z1, 0.42, 0.86, r.pick(['wood2', 'teal', 'red', 'blue']), r);
  for (let s = 0; s < lot.storeys; s++) {
    windows(P, b, faces, 0.62 + s * STOREY + (s ? -0.05 : 0), r, { doorU: (lot.frame.door.x - cx) / w, flowers: s === 0 });
  }
  const top = gableRoof(P, b, h, { tone: tone.roof, dark: r.pick(['roof2', 'slate2', 'wood3']), patch: r.chance(0.4) ? 'wood1' : null });
  chimney(P, b.x0 + w * 0.22, (b.z0 + b.z1) / 2 - 0.1, h, top + 0.18);
  storyDetail(P, b, r, ['ladder', 'woodpile', 'bench', 'barrel', 'broom']);
  return top;
}

function barn(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const h = 1.45 + (lot.storeys > 1 ? 0.35 : 0);
  P.box(w, h, d, r.pick(['roof1', 'roof2', 'wood2']), cx, h / 2, cz);
  // plank seams on the front, the big door with its brace, the hayloft
  for (let i = 1; i < 6; i++) P.box(0.02, h, 0.02, 'wood4', b.x0 + (w * i) / 6, h / 2, b.z1 + 0.01);
  const dx = lot.frame.door.x;
  P.box(0.95, 1.1, 0.04, 'wood1', dx, 0.55, b.z1 + 0.02);
  P.box(1.1, 0.05, 0.05, 'paper2', dx, 0.55, b.z1 + 0.05, { rz: 0.86 });
  P.box(1.1, 0.05, 0.05, 'paper2', dx, 0.55, b.z1 + 0.05, { rz: -0.86 });
  P.box(1.02, 0.05, 0.05, 'paper2', dx, 1.12, b.z1 + 0.04);
  P.box(0.36, 0.3, 0.04, 'wood4', cx, h + 0.32, b.z1 + 0.13);
  P.glowBox(0.3, 0.24, 0.02, 'lamp', cx, h + 0.32, b.z1 + 0.16);
  const top = gableRoof(P, b, h, { tone: tone.roof === 'roof1' ? 'slate1' : tone.roof, dark: 'slate2', pitch: d * 0.5, overhang: 0.18 });
  P.cyl(0.24, 0.24, 0.4, 'amber', b.x0 + 0.02, 0.24, b.z1 + 0.14, { rz: PI / 2, seg: 10 });
  P.cyl(0.245, 0.245, 0.04, 'mustard', b.x0 + 0.02, 0.24, b.z1 + 0.14, { rz: PI / 2, seg: 10 });
  P.box(0.28, 0.28, 0.28, 'amber', b.x0 + 0.42, 0.14, b.z1 + 0.24, { ch: 0.03 });
  windows(P, b, cameraFaces(lot.yaw).filter((f) => f !== 'front'), 0.95, r);
  return top;
}

function shed(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const h = 1.05;
  P.box(w, h, d, r.pick(['wood1', 'wood2', 'slate0']), cx, h / 2, cz);
  for (let i = 1; i < 5; i++) P.box(0.018, h, 0.02, 'wood3', b.x0 + (w * i) / 5, h / 2, b.z1 + 0.01);
  door(P, lot.frame.door.x, b.z1, 0.4, 0.8, 'wood3', r);
  // lean-to roof: one slab tilted toward the back
  const ang = 0.28;
  P.box(w + 0.24, 0.07, d + 0.28, tone.roof, cx, h + 0.14, cz, { rx: -ang });
  P.box(w + 0.26, 0.04, 0.05, 'wood4', cx, h + 0.14 + Math.sin(ang) * (d / 2 + 0.14) - 0.02, cz + d / 2 + 0.12);
  storyDetail(P, b, r, ['barrel', 'woodpile', 'broom']);
  P.box(0.5, 0.05, 0.05, 'steel1', cx, h * 0.82, b.z1 + 0.03);
  return h + 0.3;
}

function tower(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const rad = Math.min(w, d) * 0.45;
  const h = STOREY * (lot.storeys + 1);
  P.cyl(rad + 0.06, rad + 0.1, 0.24, 'stone3', cx, 0.12, cz, { seg: 12 });
  P.cyl(rad * 0.92, rad, h, r.pick(['stone0', 'stone1', 'paper3']), cx, h / 2, cz, { seg: 12 });
  for (let i = 1; i <= lot.storeys; i++) P.cyl(rad + 0.02, rad + 0.02, 0.05, 'stone2', cx, i * STOREY, cz, { seg: 12 });
  // slit windows on the camera side, door at the front
  const faces = cameraFaces(lot.yaw);
  for (let i = 0; i < lot.storeys + 1; i++) {
    const a = faces.includes('right') ? PI / 2 - 0.4 : 0.4;
    const x = cx + Math.sin(a) * rad * 0.95, z = cz + Math.cos(a) * rad * 0.95;
    P.box(0.1, 0.3, 0.06, 'slate2', x, 0.7 + i * STOREY, z, { ry: a });
    P.glowBox(0.07, 0.26, 0.03, 'lamp', x + Math.sin(a) * 0.02, 0.7 + i * STOREY, z + Math.cos(a) * 0.02, { ry: a });
  }
  door(P, cx, cz + rad * 0.94, 0.36, 0.8, 'wood2', r);
  P.cyl(rad + 0.14, rad + 0.04, 0.12, 'wood3', cx, h + 0.06, cz, { seg: 12 });
  P.cone(rad + 0.22, rad * 2.1, tone.roof, cx, h + 0.12 + rad * 1.05, cz, { seg: 12 });
  const top = h + 0.12 + rad * 2.1;
  P.box(0.025, 0.55, 0.025, 'ink', cx, top + 0.27, cz);
  P.box(0.3, 0.18, 0.012, tone.flag, cx + 0.16, top + 0.44, cz);
  return top + 0.55;
}

function boathouse(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const h = 1.25;
  P.box(w, h, d, r.pick(['wood1', 'wood2', 'slate0']), cx, h / 2, cz);
  for (let i = 1; i < 7; i++) P.box(0.018, h, 0.02, 'wood3', b.x0 + (w * i) / 7, h / 2, b.z1 + 0.01);
  P.box(w * 0.62, 0.95, 0.04, 'wood4', cx, 0.475, b.z1 + 0.02);
  P.box(w * 0.66, 0.06, 0.06, 'wood0', cx, 0.98, b.z1 + 0.04);
  P.box(w * 0.3, 0.92, 0.035, 'wood3', cx - w * 0.15, 0.46, b.z1 + 0.045, { ry: 0.0 });
  const top = gableRoof(P, b, h, { tone: tone.roof, dark: 'slate2', pitch: d * 0.38 });
  // a lifebuoy and a coil of rope: this house keeps boats
  P.torus(0.15, 0.045, 'red', b.x0 - 0.03, 0.82, cz + d * 0.2, { ry: PI / 2, ts: 10, rs: 4 });
  P.torus(0.15, 0.048, 'paper', b.x0 - 0.03, 0.82, cz + d * 0.2, { ry: PI / 2, ts: 4, rs: 4 });
  P.torus(0.12, 0.04, 'earth0', cx + w * 0.3, 0.04, b.z1 + 0.24, { rx: PI / 2, ts: 10, rs: 4 });
  P.torus(0.07, 0.04, 'earth1', cx + w * 0.3, 0.09, b.z1 + 0.24, { rx: PI / 2, ts: 8, rs: 4 });
  windows(P, b, cameraFaces(lot.yaw).filter((f) => f !== 'front'), 0.7, r);
  P.box(0.03, 0.03, 0.2, 'ink', cx, h * 0.95, b.z1 + 0.1);
  P.glowBox(0.1, 0.12, 0.1, 'lampHot', cx, h * 0.95 - 0.08, b.z1 + 0.2);
  return top;
}

function warehouse(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const h = 1.3 + 0.55 * (lot.storeys - 1);
  P.box(w, h, d, r.pick(['stone1', 'roof0', 'earth1']), cx, h / 2, cz);
  P.box(w + 0.06, 0.14, d + 0.06, 'stone3', cx, 0.07, cz);
  P.box(w + 0.08, 0.1, d + 0.08, 'stone2', cx, h + 0.05, cz);
  // loading door, hoist beam, rope and hook
  P.box(0.7, 0.95, 0.04, 'wood2', lot.frame.door.x, 0.475, b.z1 + 0.02);
  P.box(0.76, 0.05, 0.05, 'wood4', lot.frame.door.x, 0.97, b.z1 + 0.04);
  P.box(0.08, 0.08, 0.36, 'wood3', lot.frame.door.x, h - 0.12, b.z1 + 0.16);
  P.box(0.012, 0.42, 0.012, 'earth0', lot.frame.door.x, h - 0.37, b.z1 + 0.3);
  P.torus(0.04, 0.012, 'steel2', lot.frame.door.x, h - 0.6, b.z1 + 0.3, { ts: 8, rs: 3 });
  const top = hipRoof(P, b, h + 0.1, { tone: tone.roof, pitch: Math.min(w, d) * 0.28 });
  windows(P, b, cameraFaces(lot.yaw), h * 0.72, r, { doorU: (lot.frame.door.x - cx) / w, w: 0.36, h: 0.22 });
  for (let i = 0; i < 2; i++) P.box(0.3, 0.28, 0.3, i ? 'wood1' : 'wood0', b.x0 + 0.24 + i * 0.34, 0.14, b.z1 + 0.22, { ch: 0.02, ry: i * 0.2 });
  return top;
}

function shop(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const n = Math.max(2, lot.storeys);
  const h = STOREY * n;
  P.box(w, STOREY, d, 'stone0', cx, STOREY / 2, cz);
  // the upper floor oversails the street by a hand's width (a jetty)
  P.box(w + 0.12, h - STOREY, d + 0.12, r.pick(['paper2', 'pink', 'earth0', 'water0']), cx, STOREY + (h - STOREY) / 2, cz + 0.06);
  P.box(w + 0.16, 0.07, d + 0.16, 'wood3', cx, STOREY + 0.02, cz + 0.06);
  door(P, lot.frame.door.x, b.z1, 0.42, 0.86, 'teal', r);
  // shop window and striped awning in the group colour
  const sx = lot.frame.door.x > cx ? cx - w * 0.2 : cx + w * 0.2;
  P.box(w * 0.4, 0.5, 0.03, 'paper2', sx, 0.6, b.z1 + 0.02);
  P.box(w * 0.36, 0.44, 0.03, 'slate2', sx, 0.6, b.z1 + 0.03);
  P.glowBox(w * 0.34, 0.42, 0.02, 'lamp', sx, 0.6, b.z1 + 0.045);
  const stripes = 5;
  for (let i = 0; i < stripes; i++) {
    P.box((w * 0.5) / stripes, 0.03, 0.3, i % 2 ? 'paper' : tone.cloth, sx - w * 0.25 + ((i + 0.5) * w * 0.5) / stripes, 1.0, b.z1 + 0.15, { rx: 0.35 });
  }
  for (let s = 1; s < n; s++) windows(P, { ...b, z1: b.z1 + 0.12 }, cameraFaces(lot.yaw), 0.56 + s * STOREY, r, { flowers: true });
  const top = hipRoof(P, { ...b, z1: b.z1 + 0.12 }, h, { tone: tone.roof, pitch: Math.min(w, d) * 0.4 });
  // hanging sign on a bracket
  P.box(0.34, 0.03, 0.03, 'ink', b.x0 + 0.15, 1.5, b.z1 + 0.16);
  P.box(0.03, 0.24, 0.26, tone.flag, b.x0 + 0.28, 1.33, b.z1 + 0.2);
  chimney(P, b.x0 + 0.25, cz - 0.1, h, top + 0.1, 'roof2');
  return top;
}

function stall(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const ww = Math.min(w, 1.5), dd = Math.min(d, 0.95);
  const z1 = b.z1, z0 = z1 - dd;
  for (const [x, z] of [[cx - ww / 2, z1], [cx + ww / 2, z1], [cx - ww / 2, z0], [cx + ww / 2, z0]]) P.box(0.05, 1.45, 0.05, 'wood2', x, 0.72, z);
  P.box(ww, 0.62, 0.42, 'wood1', cx, 0.31, z1 - 0.21, { ch: 0.02 });
  P.box(ww + 0.04, 0.04, 0.46, 'wood0', cx, 0.63, z1 - 0.21);
  // produce on the counter
  const goods = r.pick([['red', 'amber', 'grass2'], ['amber', 'mustard', 'earth0'], ['violet', 'pink', 'red'], ['water1', 'steel0', 'blue']]);
  for (let i = 0; i < 6; i++) P.sphere(0.07, goods[i % 3], cx - ww / 2 + 0.16 + i * ((ww - 0.3) / 5), 0.71, z1 - 0.22 + (i % 2) * 0.1, { ws: 6, hs: 4 });
  // striped awning, front lower than back
  const stripes = 6;
  for (let i = 0; i < stripes; i++) {
    P.box(ww / stripes + 0.01, 0.035, dd + 0.3, i % 2 ? 'paper' : tone.cloth, cx - ww / 2 + ((i + 0.5) * ww) / stripes, 1.5, (z0 + z1) / 2 + 0.08, { rx: 0.24 });
  }
  P.box(ww + 0.06, 0.12, 0.03, tone.cloth, cx, 1.36, z1 + 0.21);
  P.box(0.36, 0.3, 0.36, 'wood0', cx + ww / 2 - 0.25, 0.15, z0 + 0.2, { ch: 0.02 });
  P.box(0.3, 0.26, 0.3, 'wood1', cx - ww / 2 + 0.22, 0.13, z0 + 0.22, { ch: 0.02, ry: 0.3 });
  P.cyl(0.012, 0.012, 0.25, 'ink', cx, 1.3, z1 + 0.05, { seg: 4 });
  P.glowBox(0.1, 0.12, 0.1, 'lampHot', cx, 1.13, z1 + 0.05);
  return 1.6;
}

function tent(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const tw = Math.min(w, 1.3), td = Math.min(d, 1.3);
  const h = 1.15;
  const canvas = r.pick(['amber', 'teal', 'paper3', 'red', 'grass3']);
  P.prism(td, h, tw, canvas, cx, 0, cz, { ry: PI / 2 });
  P.prism(td * 0.36, h * 0.66, tw + 0.02, 'ink', cx, 0, cz, { ry: PI / 2, offset: true });
  P.box(0.04, 0.04, td + 0.2, 'wood3', cx, h + 0.01, cz, { ry: 0 });
  P.box(0.035, h + 0.1, 0.035, 'wood3', cx, (h + 0.1) / 2, cz + td / 2 + 0.02);
  P.box(0.035, h + 0.1, 0.035, 'wood3', cx, (h + 0.1) / 2, cz - td / 2 - 0.02);
  // guy ropes and pegs on the camera side
  for (const s of [-1, 1]) {
    P.box(0.012, 0.012, 0.75, 'earth0', cx + s * (tw / 2 + 0.2), h * 0.45, cz + td / 2 - 0.1, { rz: s * 1.0, ry: 0 });
    P.box(0.04, 0.08, 0.04, 'wood3', cx + s * (tw / 2 + 0.42), 0.04, cz + td / 2 - 0.1);
  }
  P.box(0.6, 0.04, 0.2, 'red', cx + tw * 0.15, 0.03, cz + td / 2 + 0.3, { ry: 0.2 });
  P.glowBox(0.18, 0.3, 0.02, 'lampHot', cx, 0.24, cz + td / 2 - 0.02);
  storyDetail(P, { x0: cx - tw / 2, x1: cx + tw / 2, z0: cz - td / 2, z1: cz + td / 2 }, r, ['barrel', 'woodpile', 'broom']);
  return h + 0.12;
}

function cabin(P, lot, r, tone) {
  const b = lot.frame.building;
  const { w, d, cx, cz } = box3(b);
  const h = 1.2;
  P.box(w - 0.08, h, d - 0.08, 'wood2', cx, h / 2, cz);
  // log courses on the walls, with the log ends proud at the corners
  const faces = cameraFaces(lot.yaw);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const y = 0.1 + (i * (h - 0.12)) / (n - 1);
    const c = i % 2 ? 'wood1' : 'wood2';
    if (faces.includes('front')) P.cyl(0.06, 0.06, w + 0.16, c, cx, y, b.z1 - 0.04, { rz: PI / 2, seg: 6 });
    if (faces.includes('right')) P.cyl(0.06, 0.06, d + 0.16, c, b.x1 - 0.04, y, cz, { rx: PI / 2, seg: 6 });
    if (faces.includes('left')) P.cyl(0.06, 0.06, d + 0.16, c, b.x0 + 0.04, y, cz, { rx: PI / 2, seg: 6 });
  }
  door(P, lot.frame.door.x, b.z1, 0.42, 0.84, 'wood3', r, { step: 'wood3' });
  windows(P, b, faces, 0.66, r, { doorU: (lot.frame.door.x - cx) / w, frame: 'wood3' });
  const top = gableRoof(P, b, h, { tone: r.pick(['wood3', 'slate2', 'grass4']), dark: 'wood4', pitch: d * 0.5, overhang: 0.2, trim: 'wood4' });
  chimney(P, b.x1 - 0.2, cz - 0.15, h * 0.4, top + 0.15, 'stone2');
  storyDetail(P, b, r, ['woodpile', 'woodpile', 'bench']);
  return top;
}

export const STYLES = { cottage, barn, shed, tower, boathouse, warehouse, shop, stall, tent, cabin };

export function building(lot, r, groupTone) {
  const P = new Parts();
  const fn = STYLES[lot.style] || cottage;
  const top = fn(P, lot, r, groupTone);
  P.top = Math.max(P.top, top);
  return P;
}

/* ---- landmarks ---------------------------------------------------------------------------- */

export function landmark(kind, r, ctx = {}) {
  const P = new Parts();
  if (kind === 'windmill') {
    const h = 3.0;
    P.cyl(0.7, 0.75, 0.3, 'stone2', 0, 0.15, 0, { seg: 10 });
    P.cyl(0.46, 0.66, h, 'paper3', 0, 0.3 + h / 2, 0, { seg: 10 });
    for (let i = 1; i < 4; i++) P.cyl(0.66 - (0.2 * i) / 4 + 0.02, 0.66 - (0.2 * i) / 4 + 0.02, 0.05, 'wood3', 0, 0.3 + (h * i) / 4, 0, { seg: 10 });
    P.cone(0.68, 0.75, 'roof2', 0, 0.3 + h + 0.37, 0, { seg: 10 });
    door(P, 0, 0.7, 0.34, 0.76, 'wood2', r);
    P.box(0.16, 0.24, 0.06, 'slate2', 0.55, 1.9, 0.38, { ry: 0.9 });
    P.glowBox(0.12, 0.2, 0.02, 'lamp', 0.58, 1.9, 0.42, { ry: 0.9 });
    P.cyl(0.11, 0.11, 0.3, 'wood3', 0.36, 0.3 + h - 0.1, 0.36, { rx: PI / 2, ry: PI / 4, seg: 8 });
    P.dyn.push({ kind: 'sails', x: 0.47, y: 0.3 + h - 0.1, z: 0.47, yaw: PI / 4, r: 1.55 });
    P.box(0.3, 0.26, 0.28, 'amber', -0.42, 0.13, 0.42, { ch: 0.03 });
    P.top = 0.3 + h + 0.75 + 0.9;
  } else if (kind === 'lighthouse') {
    const rows = 4, h = 0.95;
    P.cyl(0.95, 1.05, 0.34, 'stone2', 0, 0.17, 0, { seg: 10 });
    for (let i = 0; i < rows; i++) {
      const r0 = 0.7 - (0.26 * i) / rows, r1 = 0.7 - (0.26 * (i + 1)) / rows;
      P.cyl(r1, r0, h, i % 2 ? 'red' : 'paper', 0, 0.34 + h * (i + 0.5), 0, { seg: 12 });
    }
    const gy = 0.34 + rows * h;
    P.cyl(0.66, 0.56, 0.1, 'ink', 0, gy + 0.05, 0, { seg: 12 });
    P.torus(0.62, 0.018, 'ink', 0, gy + 0.42, 0, { rx: PI / 2, ts: 14, rs: 4 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      P.cyl(0.014, 0.014, 0.36, 'ink', Math.sin(a) * 0.62, gy + 0.26, Math.cos(a) * 0.62, { seg: 4 });
    }
    P.cyl(0.34, 0.36, 0.12, 'paper', 0, gy + 0.16, 0, { seg: 10 });
    P.glowBox(0.42, 0.4, 0.42, 'lampHot', 0, gy + 0.44, 0);
    P.cyl(0.4, 0.4, 0.05, 'ink', 0, gy + 0.68, 0, { seg: 10 });
    P.cone(0.48, 0.44, 'roof2', 0, gy + 0.92, 0, { seg: 10 });
    P.sphere(0.06, 'amber', 0, gy + 1.17, 0, { ws: 6, hs: 4 });
    door(P, 0, 0.72, 0.32, 0.66, 'wood3', r);
    P.dyn.push({ kind: 'beacon', x: 0, y: gy + 0.44, z: 0 });
    P.top = gy + 1.25;
  } else if (kind === 'fountain') {
    P.cyl(0.72, 0.75, 0.3, 'stone1', 0, 0.15, 0, { seg: 14 });
    P.cyl(0.6, 0.6, 0.04, 'water2', 0, 0.27, 0, { seg: 14 });
    P.torus(0.68, 0.06, 'stone0', 0, 0.31, 0, { rx: PI / 2, ts: 16, rs: 4 });
    P.cyl(0.14, 0.2, 0.9, 'stone0', 0, 0.6, 0, { seg: 8 });
    P.cyl(0.42, 0.18, 0.14, 'stone1', 0, 1.06, 0, { seg: 10 });
    P.cyl(0.36, 0.36, 0.03, 'water1', 0, 1.12, 0, { seg: 10 });
    P.sphere(0.09, 'stone0', 0, 1.24, 0, { ws: 6, hs: 4 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2 + PI / 4;
      P.box(0.1, 0.1, 0.1, 'stone2', Math.sin(a) * 0.68, 0.35, Math.cos(a) * 0.68, { ry: a });
    }
    P.dyn.push({ kind: 'jets', x: 0, y: 1.26, z: 0, r: 0.5, basin: 0.27 });
    P.top = 1.6;
  } else if (kind === 'campfire') {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * PI * 2;
      P.sphere(0.12, i % 2 ? 'stone2' : 'stone3', Math.sin(a) * 0.48, 0.07, Math.cos(a) * 0.48, { ws: 5, hs: 4, sy: 0.7 });
    }
    P.cyl(0.4, 0.42, 0.03, 'ink', 0, 0.015, 0, { seg: 10 });
    for (let i = 0; i < 4; i++) P.cyl(0.05, 0.05, 0.7, i % 2 ? 'wood2' : 'wood3', 0, 0.1, 0, { rz: PI / 2 - 0.35, ry: (i * PI) / 4, seg: 6 });
    // seating logs around the fire, one with a mug and a kettle
    for (let i = 0; i < 3; i++) {
      const a = PI * 0.25 + i * PI * 0.66;
      P.cyl(0.1, 0.1, 0.4, 'wood2', Math.sin(a) * 0.64, 0.1, Math.cos(a) * 0.64, { rz: PI / 2, ry: a + PI / 2, seg: 7 });
    }
    P.box(0.05, 0.9, 0.05, 'steel2', -0.45, 0.45, 0);
    P.box(0.05, 0.9, 0.05, 'steel2', 0.45, 0.45, 0);
    P.box(0.95, 0.04, 0.04, 'steel2', 0, 0.9, 0);
    P.cyl(0.1, 0.12, 0.16, 'steel1', 0, 0.62, 0, { seg: 8 });
    P.dyn.push({ kind: 'fire', x: 0, y: 0.05, z: 0 });
    P.top = 1.0;
  } else if (kind === 'well') {
    P.cyl(0.42, 0.46, 0.42, 'stone1', 0, 0.21, 0, { seg: 10 });
    P.cyl(0.32, 0.32, 0.02, 'water4', 0, 0.4, 0, { seg: 10 });
    P.box(0.06, 1.0, 0.06, 'wood3', -0.38, 0.6, 0);
    P.box(0.06, 1.0, 0.06, 'wood3', 0.38, 0.6, 0);
    P.prism(1.0, 0.32, 0.7, 'roof1', 0, 1.08, 0, { ry: PI / 2 });
    P.cyl(0.04, 0.04, 0.8, 'wood2', 0, 0.86, 0, { rz: PI / 2, seg: 6 });
    P.box(0.012, 0.3, 0.012, 'earth0', 0.05, 0.68, 0);
    P.cyl(0.08, 0.07, 0.12, 'wood1', 0.05, 0.48, 0, { seg: 8 });
    P.top = 1.42;
  }
  return P;
}

/* ---- props -------------------------------------------------------------------------------- */

export function prop(type, r, ctx = {}) {
  const P = new Parts();
  const snow = ctx.snow, autumn = ctx.autumn;
  if (type === 'tree') {
    const h = r.float(0.8, 1.15);
    P.cyl(0.06, 0.09, h, 'wood3', 0, h / 2, 0, { seg: 6 });
    P.box(0.04, 0.04, 0.3, 'wood3', 0.08, h * 0.7, 0, { ry: r.float(0, PI), rz: 0.5 });
    const leaves = autumn ? ['leaf0', 'leaf1', 'mustard'] : ['grass3', 'grass4', 'grass2'];
    P.sphere(0.5, leaves[0], 0, h + 0.3, 0, { ws: 7, hs: 5, sy: 0.9 });
    P.sphere(0.34, leaves[1], -0.2, h + 0.62, 0.1, { ws: 6, hs: 4 });
    P.sphere(0.3, leaves[2], 0.22, h + 0.48, -0.12, { ws: 6, hs: 4 });
    if (snow) P.sphere(0.36, 'snow', 0, h + 0.62, 0, { ws: 6, hs: 4, sy: 0.4 });
    P.top = h + 0.9;
  } else if (type === 'pine') {
    const h = r.float(0.3, 0.45);
    P.cyl(0.06, 0.08, h + 0.2, 'wood3', 0, (h + 0.2) / 2, 0, { seg: 6 });
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const rr = 0.55 - i * 0.14, hh = 0.62 - i * 0.08;
      P.cone(rr, hh, i % 2 ? 'grass5' : 'grass4', 0, h + 0.15 + i * 0.36 + hh / 2, 0, { seg: 7 });
      if (snow) P.cone(rr * 0.6, hh * 0.4, 'snow', 0, h + 0.15 + i * 0.36 + hh * 0.82, 0, { seg: 7 });
    }
    P.top = h + 1.4;
  } else if (type === 'bush') {
    const t = autumn ? 'leaf1' : 'grass3';
    P.sphere(0.26, t, 0, 0.2, 0, { ws: 6, hs: 4, sy: 0.75 });
    P.sphere(0.2, autumn ? 'leaf0' : 'grass2', 0.2, 0.18, 0.08, { ws: 6, hs: 4, sy: 0.8 });
    P.sphere(0.04, r.pick(['red', 'pink', 'amber']), 0.12, 0.34, 0.16, { ws: 4, hs: 3 });
    if (snow) P.sphere(0.2, 'snow', 0.05, 0.32, 0, { ws: 6, hs: 4, sy: 0.35 });
    P.top = 0.45;
  } else if (type === 'rock') {
    P.sphere(0.24, 'stone2', 0, 0.12, 0, { ws: 5, hs: 4, sy: 0.65, sx: 1.2 });
    P.sphere(0.14, 'stone3', 0.2, 0.08, 0.1, { ws: 5, hs: 3, sy: 0.7 });
    P.sphere(0.06, 'grass4', -0.12, 0.2, 0.06, { ws: 4, hs: 3, sy: 0.5 });
    P.top = 0.3;
  } else if (type === 'flowers') {
    P.sphere(0.18, 'grass3', 0, 0.06, 0, { ws: 6, hs: 3, sy: 0.4 });
    const c = r.pick([['pink', 'red'], ['amber', 'paper'], ['violet', 'pink'], ['red', 'amber']]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2 + r.next();
      P.box(0.05, 0.05, 0.05, c[i % 2], Math.sin(a) * 0.12, 0.13 + (i % 2) * 0.03, Math.cos(a) * 0.12);
    }
    P.top = 0.2;
  } else if (type === 'reed') {
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.06, z = ((i * 7) % 3) * 0.05 - 0.05, h = 0.42 + ((i * 5) % 3) * 0.08;
      P.cyl(0.012, 0.015, h, 'grass3', x, h / 2 - 0.1, z, { seg: 4, rz: (i - 2) * 0.08 });
      if (i % 2 === 0) P.cyl(0.025, 0.025, 0.1, 'wood3', x + (i - 2) * 0.03, h - 0.08, z, { seg: 5 });
    }
    P.top = 0.5;
  } else if (type === 'barrels') {
    const n = r.int(2, 3);
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.3, z = (i % 2) * 0.12;
      P.cyl(0.13, 0.12, 0.34, i % 2 ? 'wood1' : 'wood2', x, 0.17, z, { seg: 9 });
      P.cyl(0.135, 0.135, 0.025, 'steel2', x, 0.08, z, { seg: 9 });
      P.cyl(0.135, 0.135, 0.025, 'steel2', x, 0.27, z, { seg: 9 });
    }
    P.top = 0.36;
  } else if (type === 'nets') {
    P.box(0.05, 1.0, 0.05, 'wood3', -0.45, 0.5, 0);
    P.box(0.05, 1.0, 0.05, 'wood3', 0.45, 0.5, 0);
    P.box(1.0, 0.04, 0.04, 'wood3', 0, 0.98, 0);
    P.box(0.8, 0.6, 0.02, 'slate1', 0, 0.66, 0);
    for (let i = 0; i < 4; i++) P.box(0.012, 0.6, 0.025, 'earth0', -0.3 + i * 0.2, 0.66, 0.01);
    P.sphere(0.05, 'amber', 0.22, 0.4, 0.02, { ws: 5, hs: 4 });
    P.top = 1.0;
  } else if (type === 'logs') {
    for (let i = 0; i < 3; i++) P.cyl(0.09, 0.09, 0.8, i === 1 ? 'wood1' : 'wood2', 0, 0.09 + (i === 2 ? 0.15 : 0), (i - 1) * 0.15 * (i === 2 ? 0 : 1), { rz: PI / 2, seg: 7 });
    P.box(0.06, 0.25, 0.06, 'steel1', 0.15, 0.32, 0.05, { rz: 0.4 });
    P.top = 0.4;
  } else if (type === 'fence') {
    P.box(0.05, 0.46, 0.05, 'wood2', -0.24, 0.23, 0);
    P.box(0.05, 0.46, 0.05, 'wood2', 0.24, 0.23, 0);
    P.box(0.56, 0.04, 0.03, 'wood1', 0, 0.36, 0);
    P.box(0.56, 0.04, 0.03, 'wood1', 0, 0.17, 0);
    P.box(0.05, 0.03, 0.05, 'wood3', -0.24, 0.47, 0);
    P.top = 0.48;
  } else if (type === 'lamp') {
    P.cyl(0.08, 0.1, 0.08, 'ink', 0, 0.04, 0, { seg: 6 });
    P.cyl(0.03, 0.04, 1.7, 'ink', 0, 0.85, 0, { seg: 6 });
    P.box(0.04, 0.04, 0.32, 'ink', 0, 1.66, 0.14);
    P.box(0.16, 0.04, 0.16, 'ink', 0, 1.6, 0.28);
    P.box(0.12, 0.16, 0.12, 'stone0', 0, 1.5, 0.28);
    P.glowBox(0.1, 0.14, 0.1, 'lampHot', 0, 1.5, 0.28);
    P.box(0.08, 0.04, 0.08, 'ink', 0, 1.4, 0.28);
    P.top = 1.7;
  } else if (type === 'crate') {
    P.box(0.34, 0.32, 0.34, ctx.tone ?? 'wood0', 0, 0.16, 0, { ch: 0.02 });
    P.box(0.36, 0.04, 0.36, ctx.lid ?? 'wood2', 0, 0.33, 0);
    P.box(0.35, 0.05, 0.05, 'wood3', 0, 0.16, 0.155);
    P.box(0.05, 0.05, 0.35, 'wood3', 0.155, 0.16, 0);
    P.box(0.05, 0.28, 0.05, 'wood3', 0.155, 0.16, 0.155);
    P.top = 0.35;
  } else if (type === 'boat') {
    const tone = ctx.tone ?? 'red';
    P.box(0.62, 0.2, 1.3, tone, 0, 0.0, 0, { ch: 0.04 });
    P.prism(0.62, 0.36, 0.2, tone, 0, -0.1, 0.75, { rx: PI / 2, ry: 0 });
    P.box(0.66, 0.04, 1.34, 'wood1', 0, 0.11, 0);
    P.box(0.56, 0.04, 0.16, 'wood2', 0, 0.06, -0.15);
    P.box(0.56, 0.04, 0.16, 'wood2', 0, 0.06, 0.3);
    P.cyl(0.02, 0.025, 1.1, 'wood3', 0, 0.62, 0.12, { seg: 5 });
    P.prism(0.02, 0.8, 0.5, 'paper2', 0, 0.2, -0.12, { rz: 0, ry: PI / 2, sx: 1 });
    P.torus(0.07, 0.025, 'earth0', 0.15, 0.13, -0.52, { rx: PI / 2, ts: 8, rs: 3 });
    P.top = 1.2;
  }
  return P;
}
