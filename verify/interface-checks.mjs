import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const source = process.env.THREE_MODULE || '/Users/apple/Desktop/monstertruck/node_modules/three/build/three.module.js';
const THREE = await import(source.startsWith('file:') ? source : pathToFileURL(source).href);
const helper = await readFile(new URL('../templates/interface-checks.js', import.meta.url), 'utf8');
const { createInterfaceChecks } = await import(`data:text/javascript;base64,${Buffer.from(helper).toString('base64')}`);
const c = createInterfaceChecks(THREE);
let count = 0;
function test(name, fn) { fn(); count++; console.log(`PASS ${name}`); }
const box = (x = 2, y = 1, z = 2) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshBasicMaterial());
const root = new THREE.Group(), frame = new THREE.Group(); root.add(frame);
const lower = box(), upper = box(); frame.add(lower, upper); upper.position.y = 1;
test('same seated function: baseline passes, lifted fails', () => {
  assert.equal(c.seated(upper, lower, { frame }).pass, true);
  upper.position.y = 1.1;
  assert.equal(c.seated(upper, lower, { frame }).pass, false);
  assert.ok(c.seated(upper, lower, { frame }).gap > 0);
  upper.position.y = 1;
});
test('working pocket is candidate; short support is clear', () => {
  const pocket = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
  assert.equal(c.outsideBox(lower, { frame, box: pocket }).status, 'candidate');
  const short = box(0.2, 0.2, 0.2); frame.add(short); short.position.x = 1;
  assert.equal(c.outsideBox(short, { frame, box: pocket, clearance: 0.1 }).status, 'clear');
});
test('nested rotated parent leaves local mating invariant', () => {
  root.position.set(10, 3, -7); root.rotation.set(0.4, 0.6, 0.2);
  frame.rotation.set(0.2, -0.3, 0.1); frame.position.set(2, 1, 3);
  assert.equal(c.seated(upper, lower, { frame }).pass, true);
  assert.throws(() => c.seated(upper, lower), /axis-aligned/);
});
test('hidden transparent physical geometry remains included', () => {
  lower.visible = false; lower.material.transparent = true; lower.material.opacity = 0;
  assert.ok(Math.abs(c.bounds(lower, { frame }).max.x - 1) < 1e-7);
  assert.equal(c.seated(upper, lower, { frame }).pass, true);
});
test('indexed unused outliers ignored; nonindexed active range respected', () => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,1,0, 999,999,999], 3));
  g.setIndex([0,1,2]);
  assert.equal(c.bounds(new THREE.Mesh(g)).max.x, 1);
  const n = g.toNonIndexed(); n.setDrawRange(0, 3);
  assert.equal(c.bounds(new THREE.Mesh(n)).max.y, 1);
});
test('missing/empty/range/malformed/NaN/deformed rejected', () => {
  assert.throws(() => c.bounds(new THREE.Mesh(new THREE.BufferGeometry())));
  const m = box(); m.geometry.drawRange = undefined; assert.throws(() => c.bounds(m));
  m.geometry.drawRange = { start: 0, count: 0 }; assert.throws(() => c.bounds(m));
  m.geometry.setDrawRange(1, 3); assert.throws(() => c.bounds(m));
  m.geometry.setDrawRange(0, Infinity); m.geometry.attributes.position.setX(0, NaN); assert.throws(() => c.bounds(m));
  const morph = box(); morph.geometry.morphAttributes.position = [morph.geometry.attributes.position.clone()];
  assert.throws(() => c.bounds(morph));
  assert.throws(() => c.bounds(new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 1)));
  const bad = new THREE.BufferGeometry(); bad.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,1,0], 3)); bad.setIndex([0,1,12]);
  assert.throws(() => c.bounds(new THREE.Mesh(bad)));
});
test('selected glazed scope detects omission/extra/duplicate', () => {
  const glass = box(), extra = box(); glass.material.transparent = true; glass.visible = false;
  assert.deepEqual(c.scopedMeshes({ required: [lower, glass], registered: [lower] }).missing, [glass]);
  assert.deepEqual(c.scopedMeshes({ required: [lower], registered: [lower, extra] }).extra, [extra]);
  assert.throws(() => c.scopedMeshes({ required: [lower], registered: [lower, lower] }));
  assert.throws(() => c.scopedMeshes({ required: [], registered: [lower] }));
  assert.equal(c.scopedMeshes({ required: [glass], registered: [glass] }).pass, true);
});
test('anchors follow transform/new geometry; detached root fails', () => {
  const mesh = box(); root.add(mesh);
  const local = geometry => [geometry.parameters.width / 2, 0, 0];
  const a = c.worldAnchor({ mesh, local, root });
  mesh.position.set(2, 3, 4); mesh.rotation.z = Math.PI / 2;
  const b = c.worldAnchor({ mesh, local, root }); assert.ok(a.distanceTo(b) > 1);
  mesh.geometry = new THREE.BoxGeometry(6, 1, 1);
  const d = c.worldAnchor({ mesh, callback: local, root });
  assert.ok(Math.abs(b.distanceTo(d) - 2) < 1e-7);
  assert.ok(d.distanceTo(mesh.localToWorld(new THREE.Vector3(3, 0, 0))) < 1e-7);
  root.remove(mesh); assert.throws(() => c.worldAnchor({ mesh, local, root }), /detached/);
});
test('projected clipping fails; valid points pass; invalid input rejected', () => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  assert.equal(c.projectPoints([[0,0,-2], [0.1,0.1,-2]], camera, { margin: 0.1 }).pass, true);
  for (const p of [[100,0,-2], [0,0,2], [0,0,-101], [0,0,-0.01]]) assert.equal(c.projectPoints([p], camera).pass, false);
  assert.throws(() => c.projectPoints([], camera));
  assert.throws(() => c.projectPoints([[NaN,0,-2]], camera));
});
test('same production scope rejects missing, empty, collapsed and nonfinite geometry', () => {
  const empty = new THREE.Mesh(new THREE.BufferGeometry());
  const collapsedGeometry = new THREE.BufferGeometry();
  collapsedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(Array(9).fill(0), 3));
  const collapsed = new THREE.Mesh(collapsedGeometry), missing = box(), nonfinite = box();
  missing.geometry = null; nonfinite.geometry.attributes.position.setX(0, NaN);
  assert.equal(c.scopedMeshes({ required: [lower], registered: [lower] }).pass, true);
  for (const broken of [missing, empty, collapsed, nonfinite])
    assert.throws(() => c.scopedMeshes({ required: [broken], registered: [broken] }));
  assert.throws(() => c.outsideBox(collapsed, { box: new THREE.Box3(new THREE.Vector3(-1,-1,-1), new THREE.Vector3(1,1,1)) }), /nondegenerate/);
  root.add(empty);
  assert.throws(() => c.worldAnchor({ mesh: empty, local: [0,0,0], root }), /geometry/);
});
test('singular and nonfinite camera transforms/projections rejected', () => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.scale.set(0, 1, 1); assert.throws(() => c.projectPoints([[0,0,-2]], camera), /camera/);
  camera.scale.set(1, 1, 1); camera.projectionMatrix.makeScale(0, 1, 1);
  assert.throws(() => c.projectPoints([[0,0,-2]], camera), /camera/);
  camera.projectionMatrix.elements[0] = NaN;
  assert.throws(() => c.projectPoints([[0,0,-2]], camera), /camera/);
});
console.log(`SUMMARY ${count} regression groups passed; AABB overlap reports candidate, never collision.`);
