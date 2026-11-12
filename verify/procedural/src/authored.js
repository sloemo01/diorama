/**
 * A hand-made diorama: "The corner bakery". Every object is placed by hand, the
 * way a normal (not procedural) diorama is built. Some objects carry a variation
 * rule (`userData.vary`), so a seed can remix the details without touching the
 * composition: the bakery, the shed, the stall, the well and the lamps stay put;
 * trees turn and swap species, crates shift, roofs and awnings retint, optional
 * flowers come and go.
 */
import * as THREE from 'three';
import { Mesher } from '../../../templates/procedural/mesher.js';
import { building, landmark, prop } from '../../../templates/procedural/grammar.js';
import { lotFrame } from '../../../templates/procedural/layout.js';
import { GROUP_TONES } from '../../../templates/procedural/palette.js';
import { rng, loopFreq } from '../../../templates/procedural/rng.js';
import { vary, makeVariable } from '../../../templates/procedural/vary.js';
import { partsGroup } from '../../../templates/procedural/mesher.js';
import { buildFigure, figureShadow, setPose, idlePose } from '../../../templates/procedural/figure.js';
import { puffAt, PUFFS } from '../../../templates/procedural/ambient.js';

const PI = Math.PI;
export const SLAB = { hx: 6, hz: 4, base: -0.5 };
const LOOP = 30;

function lot(style, W, D, x, z, yaw, storeys) {
  return { style, W, D, x, z, yaw, storeys, frame: lotFrame(W, D, style), w: W * 0.5, d: D * 0.5 };
}

export function buildAuthored(clip) {
  const root = new THREE.Group();
  root.name = 'corner-bakery';
  const entities = {};
  const r = rng('corner-bakery', 'author'); // fixed: this is the authored original, not a variation

  // ---- the ground: authored, never varied ------------------------------------------------
  const M = new Mesher();
  M.box(SLAB.hx * 2, -SLAB.base - 0.07, SLAB.hz * 2, 'earth2', 0, (SLAB.base - 0.07) / 2, 0);
  M.box(SLAB.hx * 2, 0.07, SLAB.hz * 2, 'grass1', 0, -0.035, 0);
  M.box(5.2, 0.075, 3.0, 'stone1', 0.2, -0.03, 0.9);
  for (let i = 0; i < 9; i++) for (let k = 0; k < 5; k++) if ((i + k) % 2) M.box(0.56, 0.077, 0.58, 'stone0', -2.0 + i * 0.56, -0.03, -0.25 + k * 0.58);
  M.box(1.1, 0.074, 4.0, 'earth0', -1.6, -0.03, 2.0);
  M.box(5.0, 0.074, 1.0, 'earth0', 3.4, -0.03, -0.9);
  M.box(2.2, 0.075, 1.6, 'grass2', -4.4, -0.03, -0.2);
  M.box(1.8, 0.075, 1.4, 'grass2', 4.6, -0.03, 2.6);
  const ground = M.mesh({ clip, name: 'ground' });
  root.add(ground);

  const place = (obj, x, z, yaw = 0, rule = null, name = '') => {
    obj.position.set(x, 0, z);
    obj.rotation.y = yaw;
    if (rule) obj.userData.vary = rule;
    if (name) obj.name = name;
    root.add(obj);
    return obj;
  };
  const smoke = [];

  // ---- the composition: three buildings, the well, two lamps -----------------------------
  const bakeryLot = lot('cottage', 6, 5, -2.0, -2.0, 0, 2);
  const bakery = building(bakeryLot, r.fork('bakery'), GROUP_TONES[0]);
  place(partsGroup(bakery.list.concat(bakery.glow), { clip }), bakeryLot.x, bakeryLot.z, 0, vary.building, 'bakery');
  bakery.smoke.forEach((e) => smoke.push({ x: bakeryLot.x + e.x, y: e.y, z: bakeryLot.z + e.z, phase: 0.2 }));

  const shedLot = lot('shed', 4, 3, 3.6, -2.4, 0, 1);
  const shed = building(shedLot, r.fork('shed'), GROUP_TONES[2]);
  place(partsGroup(shed.list, { clip }), shedLot.x, shedLot.z, 0, vary.building, 'shed');

  const stallLot = lot('stall', 4, 3, 2.4, 1.6, -PI / 2, 1);
  const stall = building(stallLot, r.fork('stall'), GROUP_TONES[1]);
  place(partsGroup(stall.list.concat(stall.glow), { clip }), stallLot.x, stallLot.z, -PI / 2, vary.awning, 'stall');

  place(partsGroup(landmark('well', r.fork('well')).list, { clip }), -0.2, 0.9, 0, vary.locked, 'well');
  place(partsGroup(prop('lamp', r).list, { clip }), 0.9, -0.5, PI, vary.locked, 'lamp-a');
  place(partsGroup(prop('lamp', r).list, { clip }), -3.3, 1.4, PI / 2, vary.locked, 'lamp-b');

  // ---- details the author left free --------------------------------------------------------
  const TREES = ['tree', 'pine', 'bush'];
  [[-5.1, -3.1, 'tree'], [-5.0, 2.9, 'pine'], [5.1, 3.0, 'tree'], [5.2, -3.3, 'pine'], [2.9, 3.4, 'tree'], [-4.3, -0.4, 'tree']].forEach(([x, z, type], i) => {
    // children are alternatives: the authored species first, then the others
    const g = new THREE.Group();
    [type, ...TREES.filter((t) => t !== type)].forEach((t, k) => {
      const c = partsGroup(prop(t, rng('corner-bakery', `tree${i}:${t}`)).list, { clip });
      c.visible = k === 0;
      g.add(c);
    });
    place(g, x, z, r.float(0, PI * 2), vary.tree, 'tree' + i);
  });
  [[-3.9, 2.4], [4.4, 1.6], [-0.9, 3.4], [1.2, -3.4]].forEach(([x, z], i) => place(partsGroup(prop('bush', rng('cb', 'bush' + i)).list, { clip }), x, z, i, vary.bush, 'bush' + i));
  [[-3.6, -0.2], [-2.8, 0.75], [-0.9, 0.7], [0.2, -3.5], [4.0, 3.5]].forEach(([x, z], i) => place(partsGroup(prop('flowers', rng('cb', 'fl' + i)).list, { clip }), x, z, i, vary.flowers, 'flowers' + i));
  [[5.3, 0.4], [-5.3, 1.0]].forEach(([x, z], i) => place(partsGroup(prop('rock', rng('cb', 'rock' + i)).list, { clip }), x, z, i, vary.rock, 'rock' + i));
  [[0.6, -1.4, 0], [0.95, -1.35, 0], [0.75, -1.38, 0.36]].forEach(([x, z, y], i) => {
    const c = place(partsGroup(prop('crate', rng('cb', 'crate' + i), { tone: i % 2 ? 'wood1' : 'wood0', lid: 'wood2' }).list, { clip }), x, z, 0.1 * i, vary.crate, 'crate' + i);
    c.position.y = y;
  });
  [[2.2, 2.7], [2.6, 2.75]].forEach(([x, z], i) => place(partsGroup(prop('crate', rng('cb', 'sc' + i), { tone: 'wood0', lid: 'red' }).list, { clip }), x, z, 0.2, vary.crate, 'stallcrate' + i));
  place(partsGroup(prop('barrels', rng('cb', 'barrels')).list, { clip }), 5.1, -1.6, 0.3, vary.barrel, 'barrels');
  for (let i = 0; i < 5; i++) place(partsGroup(prop('fence', rng('cb', 'fence' + i)).list, { clip }), -2.3, 1.7 + i * 0.6, PI / 2, { keep: 0.7, turn: 0.08 }, 'fence' + i);

  // ---- the cast: the baker, a customer at the stall, a child at the well ---------------
  const people = [
    { id: 'baker', x: -1.3, z: 0.25, yaw: 0.3, look: { skin: 'skin1', hair: 'hair1', legs: 'ink', boots: 'wood4', accent: 'paper', hat: 'kerchief', coat: 'paper3', apron: 'paper' } },
    { id: 'customer', x: 1.55, z: 1.4, yaw: PI / 2, look: { skin: 'skin2', hair: 'hair0', legs: 'navy', boots: 'ink', accent: 'amber', hat: 'straw', coat: 'teal', pack: true } },
    { id: 'child', x: 0.6, z: 1.8, yaw: -2.3, look: { skin: 'skin0', hair: 'hair2', legs: 'wood3', boots: 'wood4', accent: 'red', hat: 'cap', coat: 'amber' } },
  ];
  const figs = people.map((p, i) => {
    const holder = new THREE.Group();
    const fig = buildFigure(p.look, 0.3 + i * 0.2, clip);
    if (p.id === 'child') fig.group.scale.multiplyScalar(0.72);
    holder.add(fig.group);
    const shadow = figureShadow(holder, clip);
    shadow.position.y = 0.018;
    place(holder, p.x, p.z, p.yaw, vary.figure, p.id);
    entities[p.id] = holder;
    return { fig, seed: 0.3 + i * 0.27 };
  });

  // chimney smoke (closed form in t, like everything else)
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const puffs = new THREE.InstancedMesh(unit, new THREE.MeshLambertMaterial({ color: 0xd9d2c3, clippingPlanes: clip }), Math.max(1, smoke.length * PUFFS));
  puffs.count = smoke.length * PUFFS;
  root.add(puffs);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

  // ---- light: one fixed afternoon --------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xd6ecf6, 0x6f6a60, 0.3);
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.1);
  sun.position.set(-14, 19, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 4, far: 70 });
  sun.shadow.bias = -0.00022;
  sun.shadow.normalBias = 0.025;
  sun.shadow.camera.updateProjectionMatrix();
  const fill = new THREE.DirectionalLight(0xa9cbe2, 0.46);
  fill.position.set(19, 13, -15);
  root.add(hemi, sun, sun.target, fill);

  const variable = makeVariable(root);
  // Keep doors, the stall counter and the paths clear whatever the seed says.
  const keepOut = [
    { x: -2.0 + bakeryLot.frame.door.x, z: -2.0 + bakeryLot.d / 2 + 0.5, r: 0.7 },
    { x: 1.6, z: 1.6, r: 0.55 },
    { x: -1.6, z: 2.6, r: 0.6 }, { x: -1.6, z: 3.6, r: 0.6 },
    { x: 2.4, z: -0.9, r: 0.6 }, { x: 4.4, z: -0.9, r: 0.6 },
  ];

  const plan = { loop: LOOP };
  const w = (f) => loopFreq(LOOP, f);
  function apply(time) {
    const t = ((time % LOOP) + LOOP) % LOOP;
    figs.forEach((f) => setPose(f.fig, idlePose(t, LOOP, f.seed, 0, w)));
    let n = 0;
    smoke.forEach((em) => {
      for (let k = 0; k < PUFFS; k++) {
        const q = puffAt(plan, em, k, t);
        _m.compose(_p.set(q.x, q.y, q.z), _q.identity(), _s.set(q.s, q.s, q.s));
        puffs.setMatrixAt(n++, _m);
      }
    });
    puffs.instanceMatrix.needsUpdate = true;
    return { t };
  }

  const fit = [];
  for (const y of [0.1, SLAB.base]) for (const [x, z] of [[-SLAB.hx, -SLAB.hz], [SLAB.hx, -SLAB.hz], [SLAB.hx, SLAB.hz], [-SLAB.hx, SLAB.hz]]) fit.push(new THREE.Vector3(x, y, z));
  fit.push(new THREE.Vector3(-2.0, bakery.top, -2.0));

  function dispose() {
    variable.dispose();
    root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  return { group: root, apply, fit, entities, variable, keepOut, loop: LOOP, dispose, label: 'The corner bakery (hand-made)' };
}
