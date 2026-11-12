/**
 * Pure checks of the procedural generator (node --test test.mjs). No browser:
 * the plan is data, so every claim is checked against numbers.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { generate, stateAt, summary, encode, printMap, SCATTER_BOX } from '../../templates/procedural/generate.js';
import { THEME_NAMES } from '../../templates/procedural/themes.js';
import { C, PALETTE_HEX } from '../../templates/procedural/palette.js';
import { levelOf, inside, walkable } from '../../templates/procedural/layout.js';
import { skyCeiling, particleAt, birdAt } from '../../templates/procedural/ambient.js';
import * as THREE from 'three';
import { variationFor, makeVariable, vary as RULES, KINDS } from '../../templates/procedural/vary.js';
import { createActionClearance } from '../../templates/action-clearance.mjs';
import { auditPlan, requiredIds, REGIONS, localEnvelope, pieceBox } from '../../templates/procedural/clearance.js';
import { STYLES } from '../../templates/procedural/grammar.js';

const CASES = THEME_NAMES.flatMap((theme) => [1, 2, 3].map((seed) => ({ theme, seed })));
const plans = new Map(CASES.map((c) => [`${c.theme}:${c.seed}`, generate(c)]));
const strip = (p) => JSON.stringify({ ...p, grid: [...p.grid.level, ...p.grid.kind], layout: { ...p.layout, grid: null, groupCentres: [...p.layout.groupCentres] } });
const HATS = ['straw', 'cap', 'beanie', 'hood', 'souwester', 'kerchief', 'none'];

test('palette: exactly 64 unique entries', () => {
  assert.equal(PALETTE_HEX.length, 64);
  assert.equal(new Set(PALETTE_HEX).size, 64);
});

test('same spec, same plan; different seed, different plan', () => {
  for (const c of CASES.slice(0, 4)) assert.equal(strip(generate(c)), strip(plans.get(`${c.theme}:${c.seed}`)));
  assert.notEqual(strip(plans.get('village:1')), strip(plans.get('village:2')));
});

test('every part and every outfit uses a palette tone', () => {
  for (const [key, p] of plans) {
    for (const pc of p.pieces) for (const pt of pc.parts.concat(pc.glow)) assert.ok(C[pt.c], `${key} ${pc.id} uses unknown tone ${pt.c}`);
    for (const a of p.actors.concat(p.crew)) {
      for (const v of Object.values(a.look)) if (typeof v === 'string') assert.ok(C[v] || HATS.includes(v), `${key} look ${v}`);
    }
  }
});

test('Detail Bar: every building has at least 8 assemblies, every prop at least 3', () => {
  for (const [key, p] of plans) {
    for (const pc of p.pieces) {
      const n = pc.parts.length + pc.glow.length;
      if (pc.kind === 'building' || pc.kind === 'landmark') assert.ok(n >= 8, `${key} ${pc.id} has ${n} parts`);
      else assert.ok(n >= 3, `${key} ${pc.id} (${pc.kind}) has ${n} parts`);
    }
  }
});

test('layout: lots never overlap, sit flat, and every door is on the road network', () => {
  for (const [key, p] of plans) {
    const g = p.grid;
    const owners = new Map();
    for (const lot of p.layout.lots) {
      for (const [i, k] of lot.cells) {
        const id = `${i},${k}`;
        assert.ok(!owners.has(id), `${key}: ${lot.id} overlaps ${owners.get(id)}`);
        owners.set(id, lot.id);
        assert.equal(levelOf(g, i, k), lot.level, `${key}: ${lot.id} not flat`);
      }
      assert.ok(walkable(g, lot.doorCell[0], lot.doorCell[1]), `${key}: ${lot.id} door cell is not on a road`);
    }
    assert.equal(p.layout.roads.failed.length, 0, `${key}: unrouted roads ${JSON.stringify(p.layout.roads.failed)}`);
  }
});

// A wider sweep for the size rules: every style, every theme, details rerolled.
const WIDE = THEME_NAMES.flatMap((theme) => [1, 2, 3, 4, 5, 6].flatMap((seed) => [undefined, 3, 7].map((vary) => generate({ theme, seed, vary }))));

// Story details (ladders, woodpiles, an awning's guy line) may lean into the one-cell band
// round a lot where no road runs; nothing may reach the yard or past the front.
const LEAN = 0.2;
test('parcels: every building stays out of its yard, behind its front, and within LEAN of its lot', () => {
  const seen = new Set();
  for (const p of WIDE) for (const lot of p.layout.lots) {
    const piece = p.pieces.find((x) => x.id === 'building:' + lot.id);
    const e = localEnvelope(piece.parts);
    const tol = 0.02;
    seen.add(lot.style);
    const where = `${p.themeName ?? ''}:${p.seed} ${lot.id} (${lot.style})`;
    assert.ok(e.x0 >= -lot.w / 2 - LEAN && e.z0 >= -lot.d / 2 - LEAN, `${where}: leans more than ${LEAN} m off the back or side of its lot`);
    assert.ok(e.x1 <= lot.w / 2 - lot.frame.yard + tol, `${where}: into its yard by ${(e.x1 - (lot.w / 2 - lot.frame.yard)).toFixed(2)} m`);
    assert.ok(e.z1 <= lot.d / 2 + tol, `${where}: past its front by ${(e.z1 - lot.d / 2).toFixed(2)} m`);
  }
  for (const style of Object.keys(STYLES)) assert.ok(seen.has(style), `style ${style} never generated in the sweep`);
});

test('dressing: every roll stays inside the space its kind reserves', () => {
  for (const p of WIDE) for (const pc of p.pieces.filter((x) => SCATTER_BOX[x.kind])) {
    const b = pieceBox(pc);
    if (!b) continue;
    const t = 2 * Math.atan2(b.q[1], b.q[3]);
    const rx = Math.abs(Math.cos(t)) * b.half[0] + Math.abs(Math.sin(t)) * b.half[2];
    const rz = Math.abs(Math.sin(t)) * b.half[0] + Math.abs(Math.cos(t)) * b.half[2];
    const reach = Math.max(Math.abs(b.center[0] - pc.at.x) + rx, Math.abs(b.center[2] - pc.at.z) + rz);
    const top = b.center[1] + b.half[1] - pc.at.y;
    const [R, H] = SCATTER_BOX[pc.kind];
    assert.ok(reach <= R && top <= H, `${pc.id}: needs ${reach.toFixed(2)} x ${top.toFixed(2)} m, ${pc.kind} reserves ${R} x ${H}`);
  }
});

test('terrain: neighbouring cells differ by at most one terrace', () => {
  for (const [key, p] of plans) {
    const g = p.grid;
    for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) {
      for (const [di, dk] of [[1, 0], [0, 1]]) {
        if (!inside(g, i + di, k + dk)) continue;
        assert.ok(Math.abs(levelOf(g, i, k) - levelOf(g, i + di, k + dk)) <= 1, `${key}: cliff at ${i},${k}`);
      }
    }
  }
});

test('loop: within bounds, wraps exactly, and is continuous across the seam', () => {
  const eps = 1e-3;
  for (const [key, p] of plans) {
    assert.ok(p.loop >= 36 && p.loop <= 96, `${key}: loop ${p.loop}`);
    assert.deepEqual(stateAt(p, 3.3), stateAt(p, 3.3 + 2 * p.loop), `${key}: wrap differs`);
    // The frame just before the seam against the frame at 0 (stateAt wraps t, so comparing
    // 0 with loop would compare a frame with itself and prove nothing).
    const a = stateAt(p, p.loop - eps), b = stateAt(p, 0);
    a.actors.forEach((s, i) => assert.ok(Math.hypot(s.x - b.actors[i].x, s.z - b.actors[i].z) <= p.speed * eps * 2 + 1e-9, `${key}: ${s.id} jumps at the seam`));
    const ang = Math.acos(Math.min(1, a.sky.sun.dir.reduce((m, v, i) => m + v * b.sky.sun.dir[i], 0) / Math.hypot(...a.sky.sun.dir) / Math.hypot(...b.sky.sun.dir)));
    assert.ok(ang < 0.01, `${key}: sun jumps ${(ang * 180 / Math.PI).toFixed(2)} deg at the seam`);
    assert.ok(Math.abs(a.sky.sun.intensity - b.sky.sun.intensity) < 0.01 && Math.abs(a.sky.lamps - b.sky.lamps) < 0.01, `${key}: light jumps at the seam`);
    const W = p.ambient.weather;
    for (const pt of W.particles.slice(0, 40)) {
      const q0 = particleAt(p, W, pt, p.loop - eps), q1 = particleAt(p, W, pt, 0);
      const wrapFall = Math.abs(q0.y - q1.y) > 1; // a drop leaving the bottom and starting at the top is a fall, not the seam
      const dr = (((q0.ry - q1.ry) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (!wrapFall) assert.ok(Math.hypot(q0.x - q1.x, q0.z - q1.z) < 0.01 && Math.min(dr, 2 * Math.PI - dr) < 0.02, `${key}: ${W.kind} particle jumps at the seam`);
    }
    for (const bd of p.ambient.birds) {
      const q0 = birdAt(p, bd, p.loop - eps), q1 = birdAt(p, bd, 0);
      assert.ok(Math.hypot(q0.x - q1.x, q0.y - q1.y, q0.z - q1.z) < 0.02, `${key}: bird jumps at the seam`);
    }
  }
});

test('motion: nobody teleports (40 Hz sweep over the whole loop and the seam)', () => {
  for (const [key, p] of plans) {
    const maxStep = (p.speed * 1.5) / 40; // the plan's walking pace, with headroom for corners
    let prev = stateAt(p, -1 / 40).actors;
    for (let n = 0; n <= Math.ceil(p.loop * 40); n++) {
      const cur = stateAt(p, n / 40).actors;
      cur.forEach((s, i) => {
        const d = Math.hypot(s.x - prev[i].x, s.z - prev[i].z);
        assert.ok(d <= maxStep, `${key}: ${s.id} jumps ${d.toFixed(3)} m at t=${(n / 40).toFixed(3)}`);
        // Stairs climb at most a terrace (0.32 m) over a quarter cell: anything steeper is a pop.
        const dy = Math.abs(s.y - prev[i].y);
        assert.ok(dy <= (p.speed / 40) * 1.5 + 0.005, `${key}: ${s.id} pops ${dy.toFixed(3)} m vertically at t=${(n / 40).toFixed(3)}`);
      });
      prev = cur;
    }
  }
});

test('motion: actions happen standing still', () => {
  for (const [key, p] of plans) {
    for (let t = 0; t < p.loop; t += 0.5) {
      for (const s of stateAt(p, t).actors) assert.ok(!(s.moving && s.action), `${key}: ${s.id} acts while walking at ${t}`);
    }
  }
});

test('every delivered crate is carried before it lands, and lands in a yard', () => {
  for (const [key, p] of plans) {
    for (const pr of p.props) {
      if (pr.tDrop === null) continue;
      const before = stateAt(p, pr.tDrop - 0.05).props.find((x) => x.id === pr.id);
      const after = stateAt(p, pr.tDrop + 0.05).props.find((x) => x.id === pr.id);
      assert.ok(before.carried, `${key}: ${pr.id} not carried before the drop`);
      assert.ok(after.placed, `${key}: ${pr.id} not placed after the drop`);
    }
  }
});

test('weather and birds stay under the sky ceiling (the paper stays empty)', () => {
  for (const [key, p] of plans) {
    const W = p.ambient.weather;
    if (W.kind !== 'fireflies') {
      for (const pt of W.particles) {
        for (const t of [0, 1.7, 9.1]) {
          const q = particleAt(p, W, pt, t);
          assert.ok(q.y <= Math.max(pt.ground + 1.1, skyCeiling(p.layout, pt.x, pt.z) + 0.6), `${key}: particle above the ceiling`);
        }
      }
    }
    for (const b of p.ambient.birds) {
      for (const t of [0, 4.2, 11]) {
        const q = birdAt(p, b, t);
        assert.ok(q.y <= skyCeiling(p.layout, q.x, q.z) + 0.4 || q.y <= 2.8, `${key}: bird over the paper`);
      }
    }
  }
});

test('data: records become lots, events become errands, encodings are monotonic', () => {
  const spec = {
    seed: 'data', theme: 'harbour',
    lots: [
      { id: 'atlas', group: 'tools', size: 80, stock: 40, alerts: 2, progress: 0.7, active: true },
      { id: 'kite', group: 'tools', size: 12, stock: 3, progress: 0.2 },
      { id: 'reef', group: 'research', size: 30, stock: 0, alerts: 5 },
      { id: 'tide', group: 'research', size: 2 },
      { id: 'buoy', group: 'ops', size: 25, stock: 9 },
    ],
    events: [
      { actor: 'ana', home: 'atlas', verb: 'deliver', target: 'reef' },
      { actor: 'bot', verb: 'deliver', target: 'kite' },
      { actor: 'ana', home: 'atlas', verb: 'visit', target: 'tide' },
    ],
  };
  const p = generate(spec);
  assert.deepEqual(p.layout.lots.map((l) => l.id).sort(), ['atlas', 'buoy', 'kite', 'reef', 'tide']);
  assert.equal(p.layout.lots.find((l) => l.id === 'atlas').tier, 3);
  assert.ok(p.pieces.some((x) => x.id === 'pole:atlas'));
  // Every event is either performed or reported as left out, with a reason: never lost silently.
  const done = p.actors.flatMap((a) => a.actions.filter((x) => x.kind === 'drop' || x.kind === 'look').map((x) => `${a.name}:${x.kind === 'drop' ? 'deliver' : 'visit'}`));
  const left = p.leftOut.map((d) => `${d.actor}:${d.verb}`);
  for (const e of spec.events) assert.ok(done.includes(`${e.actor}:${e.verb}`) || left.includes(`${e.actor}:${e.verb}`), `${e.actor}:${e.verb} vanished`);
  p.leftOut.forEach((d) => assert.ok(d.why, 'a left-out item says why'));
  // ...including what cannot be staged at all: a chat from data, an unknown target, records past the caps.
  const odd = generate({ ...spec, lots: [...spec.lots, ...Array.from({ length: 12 }, (_, n) => ({ id: 'extra' + n, size: 3 }))],
    events: [...spec.events, { actor: 'cy', verb: 'chat', target: 'kite' }, { actor: 'dee', verb: 'visit', target: 'nowhere' }] });
  const why = (pred) => odd.leftOut.some(pred);
  assert.ok(why((d) => d.actor === 'cy' && /chat/.test(d.why)), 'a data chat is reported');
  assert.ok(why((d) => d.actor === 'dee' && /target/.test(d.why)), 'an unknown target is reported');
  assert.ok(why((d) => d.lot && /more than/.test(d.why)), 'records past the cap are reported');
  for (const pr of p.props) assert.ok(['kite', 'reef'].includes(pr.lot));
  assert.ok(p.actors.some((a) => a.kind === 'visitor'));
  for (let n = 0; n < 200; n++) {
    assert.ok(encode.stock(n + 1, 99) >= encode.stock(n, 99));
    assert.ok(encode.alerts(n + 1) >= encode.alerts(n));
    assert.ok(encode.tier(n + 1) >= encode.tier(n));
  }
});

test('no clock, no Math.random and no colour literals in the procedural modules', () => {
  const dir = new URL('../../templates/procedural/', import.meta.url);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(new URL(f, dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random|Date\.now|performance\.now/.test(src), `${f} reads a clock or Math.random`);
    if (f !== 'palette.js') assert.ok(!/['"]#[0-9a-fA-F]{6}['"]/.test(src), `${f} has a colour literal outside the palette`);
  }
});

test('summary and map print', () => {
  const p = plans.get('village:1');
  const s = summary(p);
  assert.ok(s.lots > 4 && s.actors > 2 && s.parts > 300);
  assert.equal(printMap(p.layout).split('\n').length, p.grid.nz);
});

/* ---- variation: same composition, new details ---------------------------------------------- */

test('vary seed: layout, roads, lots, dressing places and camera stay; details reroll', () => {
  const a = generate({ seed: 4, theme: 'village' });
  const b = generate({ seed: 4, theme: 'village', vary: 9 });
  assert.equal(printMap(a.layout), printMap(b.layout));
  assert.deepEqual(a.layout.lots.map((l) => [l.id, l.x, l.z, l.yaw]), b.layout.lots.map((l) => [l.id, l.x, l.z, l.yaw]));
  const places = (p) => p.pieces.filter((x) => x.id.startsWith('scatter:')).map((x) => [x.id, x.at.x, x.at.z]);
  assert.deepEqual(places(a), places(b), 'the same dressing in the same places');
  assert.deepEqual(a.fit, b.fit, 'the camera must not move between variations');
  // The cast is rescheduled against the rerolled details: anything a new detail blocks is reported.
  b.droppedErrands.forEach((d) => assert.ok(d.why));
  const parts = (p) => JSON.stringify(p.pieces.filter((x) => x.kind === 'building').map((x) => x.parts));
  assert.notEqual(parts(a), parts(b));
  assert.notEqual(JSON.stringify(a.actors.map((x) => x.look)), JSON.stringify(b.actors.map((x) => x.look)));
});

test('variationFor: pure, bounded, identity at strength 0 or seed null, kinds independent', () => {
  const rule = { move: 0.3, turn: 0.5, scale: 0.2, tint: 1, keep: 0.5, pick: true };
  for (let s = 0; s < 200; s++) {
    const v = variationFor(rule, s, 'obj', { strength: 1, alternatives: 3 });
    assert.deepEqual(v, variationFor(rule, s, 'obj', { strength: 1, alternatives: 3 }));
    assert.ok(Math.hypot(v.dx, v.dz) <= 0.3 + 1e-9 && Math.abs(v.dyaw) <= 0.5 && Math.abs(v.scale - 1) <= 0.2 && v.pick < 3);
    const only = variationFor(rule, s, 'obj', { strength: 1, alternatives: 3, kinds: ['place'] });
    assert.equal(only.dx, v.dx);
    assert.ok(only.keep && only.pick === 0 && only.tintSeed === null);
  }
  const id = { dx: 0, dz: 0, dyaw: 0, scale: 1, pick: 0, keep: true, tintSeed: null };
  assert.deepEqual(variationFor(rule, 5, 'obj', { strength: 0 }), id);
  assert.deepEqual(variationFor(rule, null, 'obj'), id);
  assert.deepEqual(variationFor({ ...rule, lock: true }, 5, 'obj'), id);
  assert.deepEqual(KINDS, ['place', 'shape', 'colour', 'detail']);
});

test('makeVariable: replays from the original, keeps doors clear, never touches untagged objects', () => {
  const root = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: C.roof1 });
  const fixed = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  fixed.position.set(2, 0, 2);
  root.add(fixed);
  const items = [];
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat), new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat));
    g.children[1].visible = false;
    g.position.set(i - 6, 0, 0.1);
    g.name = 'item' + i;
    g.userData.vary = RULES.tree;
    root.add(g);
    items.push(g);
  }
  const snap = () => JSON.stringify(root.children.map((o) => [o.position.toArray(), o.rotation.y, o.scale.toArray(), o.visible, o.children.map((c) => [c.visible, c.material?.color.getHexString()])]));
  const original = snap();
  const v = makeVariable(root);
  const keepOut = [{ x: 0, z: 0, r: 0.3 }];
  const rep = v.apply({ seed: 8, keepOut });
  assert.ok(rep.changed.length > 6);
  assert.ok(rep.maxMove <= RULES.tree.move + 1e-9);
  items.forEach((g) => assert.ok(Math.hypot(g.position.x, g.position.z) >= 0.3 - 1e-9 || Math.hypot(g.position.x, g.position.z - 0.1) < 1e-9, 'keep-out'));
  assert.deepEqual(fixed.position.toArray(), [2, 0, 2]);
  const eight = snap();
  v.apply({ seed: 3 });
  v.apply({ seed: 8, keepOut });
  assert.equal(snap(), eight, 'seed 3 then 8 must equal 8 alone');
  v.apply({ seed: null });
  assert.equal(snap(), original);
  v.apply({ seed: 8, strength: 0 });
  assert.equal(snap(), original);
  // A locked part inside a tinted parent keeps its colour (the sign on an awning, say).
  const shop = new THREE.Group();
  shop.userData.vary = RULES.awning;
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: C.roof1 }));
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: C.roof1 }));
  sign.userData.vary = RULES.locked;
  shop.add(cloth, sign);
  const scene = new THREE.Group();
  scene.add(shop);
  const vs = makeVariable(scene);
  let recoloured = 0;
  for (let seed = 1; seed <= 30; seed++) {
    vs.apply({ seed });
    assert.equal(sign.material.color.getHexString(), new THREE.Color(C.roof1).getHexString(), `seed ${seed}: the locked sign changed colour`);
    if (cloth.material.color.getHexString() !== new THREE.Color(C.roof1).getHexString()) recoloured++;
  }
  assert.ok(recoloured > 0, 'the tinted parent itself still varies');
});


/* ---- occupied space: the kit's own checker over the generated plans ------------------------ */

test('clearance: no person, crate or piece overlaps another (gate set, sampled at 10 Hz + events)', () => {
  const studio = JSON.parse(readFileSync(new URL('./examples/studio.json', import.meta.url), 'utf8'));
  for (const [key, p] of [...plans, ['example:studio', generate(studio)]]) {
    const r = auditPlan(p, THREE, createActionClearance);
    const worst = r.worstCases?.[0];
    assert.ok(r.coverageVerified, `${key}: proxy coverage not verified`);
    assert.ok(r.clear, `${key}: ${worst ? JSON.stringify(worst).slice(0, 300) : 'collision'}`);
    assert.equal(p.unresolved.length, 0, `${key}: unresolved crossing`);
  }
});

test('clearance: data with repeated errands, odd records and no events audits clean', () => {
  const specs = [
    // one person knocking twice on one door, and delivering twice to one yard
    { theme: 'village', seed: 1, lots: [{ id: 'a', stock: 5 }, { id: 'b', stock: 5 }, { id: 'c' }], events: [{ actor: 'q', home: 'a', verb: 'visit', target: 'b' }, { actor: 'q', home: 'a', verb: 'visit', target: 'b' }] },
    { theme: 'village', seed: 1, lots: [{ id: 'a', stock: 5 }, { id: 'b', stock: 5 }, { id: 'c' }], events: [{ actor: 'q', home: 'a', verb: 'deliver', target: 'b' }, { actor: 'q', home: 'a', verb: 'deliver', target: 'b' }] },
    // records only: the generator's own cast against data lots
    { theme: 'village', seed: 1, lots: [{ id: 'a' }, { id: 'b' }] },
    // a duplicate id, a style named after an Object method, an unknown verb
    { seed: 2, lots: [{ id: 'a' }, { id: 'a' }, { id: 'b', style: 'toString' }], events: [{ actor: 'x', verb: 'dance', target: 'a' }] },
  ];
  for (const spec of specs) {
    const p = generate(spec);
    const r = auditPlan(p, THREE, createActionClearance);
    assert.ok(r.clear && r.coverageVerified, `${JSON.stringify(spec).slice(0, 80)}: ${JSON.stringify(r.worstCases[0])}`);
  }
  const odd = generate(specs[3]);
  assert.ok(odd.leftOut.some((d) => d.lot === 'a' && /duplicate/.test(d.why)), 'a duplicate lot id is reported');
  assert.ok(odd.leftOut.some((d) => d.verb === 'dance' && /unknown verb/.test(d.why)), 'an unknown verb is reported');
  assert.ok(odd.layout.lots.every((l) => l.style !== 'toString'), 'a style off the prototype chain is not taken');
});

test('clearance: the inventory names every piece, person, crew member and crate', () => {
  const p = plans.get('harbour:1');
  const ids = requiredIds(p);
  assert.equal(ids.length, p.pieces.length + REGIONS.length * (p.actors.length + p.crew.length) + p.props.length);
  assert.equal(new Set(ids).size, ids.length);
});

test('clearance: the same predicate catches real mutations', () => {
  const base = generate({ theme: 'village', seed: 2 });
  // a crew member moved into a building
  const intoHouse = generate({ theme: 'village', seed: 2 });
  const house = intoHouse.pieces.find((x) => x.kind === 'building');
  if (intoHouse.crew.length) Object.assign(intoHouse.crew[0], { x: house.at.x, z: house.at.z });
  else intoHouse.crew.push({ id: 'crew:test', lot: house.lot, x: house.at.x, y: house.at.y, z: house.at.z, yaw: 0, seed: 0.5, look: {} });
  assert.equal(auditPlan(intoHouse, THREE, createActionClearance).clear, false, 'a crew member inside a house must be flagged');
  // two people walking the same route at the same time
  const twins = generate({ theme: 'village', seed: 2 });
  const walker = twins.actors.find((a) => a.legs.length > 1);
  twins.actors.push({ ...structuredClone(walker), id: walker.id + '-twin' });
  assert.equal(auditPlan(twins, THREE, createActionClearance).clear, false, 'two bodies in one place must be flagged');
  // a carried crate pushed into a building: its box must be the one flagged
  const crateIn = generate({ theme: 'village', seed: 2 });
  const pr = crateIn.props.find((x) => x.tDrop !== null);
  if (pr) {
    const lotHouse = crateIn.pieces.find((x) => x.id === 'building:' + pr.lot);
    pr.pos = { ...pr.pos, x: lotHouse.at.x, z: lotHouse.at.z };
    const r = auditPlan(crateIn, THREE, createActionClearance);
    assert.equal(r.clear, false);
    assert.ok(r.worstCases.some((w) => [w.a, w.b].includes(pr.id)), 'the crate itself is named');
  }
  // two parcels overlapping: a building moved onto its neighbour
  const overlap = generate({ theme: 'village', seed: 2 });
  const [h1, h2] = overlap.pieces.filter((x) => x.kind === 'building');
  h2.at = { ...h2.at, x: h1.at.x + 0.3, z: h1.at.z };
  const ro = auditPlan(overlap, THREE, createActionClearance);
  assert.ok(ro.worstCases.some((w) => [w.a, w.b].includes('piece:' + h1.id) && [w.a, w.b].includes('piece:' + h2.id)), 'the two buildings are named');
  // a named contact pushed past its tolerance: a knock delivered from inside the door
  const deep = generate({ theme: 'village', seed: 2 });
  const knocker = deep.actors.find((x) => x.actions.some((y) => y.kind === 'look' && y.lot));
  if (knocker) {
    const act = knocker.actions.find((y) => y.kind === 'look' && y.lot);
    const door = deep.layout.lots.find((l) => l.id === act.lot).door;
    Object.assign(act, { x: door.x, z: door.z });
    const r = auditPlan(deep, THREE, createActionClearance);
    assert.equal(r.clear, false);
    assert.ok(r.samples.some((smp) => smp.collisions.some((c) => [c.a, c.b].includes(`${knocker.id}/arm`) && [c.a, c.b].includes('piece:building:' + act.lot))), 'the knocking arm past its 0.3 m allowance is named');
  }
  // the untouched plan still passes
  assert.ok(auditPlan(base, THREE, createActionClearance).clear);
});
