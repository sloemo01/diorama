import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// Use the host project's Three installation; do not download dependencies.
const THREE = await import(process.env.THREE_MODULE
  ? pathToFileURL(resolve(process.env.THREE_MODULE)).href : 'three');
import { createSceneContract } from '../templates/scene-contract.js';

let passed = 0;
function test(label, run) {
  run(); passed++; console.log(`ok ${passed} - ${label}`);
}
function fixture(offset = 1) {
  const root = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2));
  const load = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
  load.position.y = offset;
  root.add(floor, load);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 2, expectedMeshes: 2 });
  c.mesh('floor', floor).mesh('load', load)
    .assembly('support', { meshes: ['floor'] })
    .assembly('payload', { meshes: ['load'], anchors: { tip: { mesh: 'load', local: [0, 0.5, 0] } } });
  return { root, floor, load, c };
}
function contact(c, extra = {}) {
  return c.contact({ id: 'rests', upper: 'payload', lower: 'support', ...extra });
}

test('valid support contact and complete ownership pass', () => {
  const { c } = fixture();
  const result = contact(c).evaluate();
  assert.equal(result.ok, true);
  assert.deepEqual(result.anchors.payload.tip, [0, 1.5, 0]);
});
test('overlap is detected', () => {
  const { c } = fixture(0.75);
  assert.equal(c.evaluate().errors[0].type, 'keep-out');
});
test('floating contact fails', () => {
  const { c } = fixture(1.1);
  assert.equal(contact(c).evaluate().contacts[0].ok, false);
});
test('reversed support bounds/roles cannot certify contact', () => {
  const { c } = fixture();
  assert.equal(contact(c, { upper: 'support', lower: 'payload' }).evaluate().ok, false);
});
test('missing assembly reference throws', () => {
  const { c } = fixture();
  assert.throws(() => contact(c, { upper: 'absent' }), /missing assembly/);
});
test('missing mesh reference throws', () => {
  const { c } = fixture();
  assert.throws(() => c.assembly('bad', { meshes: ['absent'] }), /missing mesh/);
});
test('NaN position vertex throws, even with cached geometry bounds', () => {
  const { c, load } = fixture();
  load.geometry.computeBoundingBox();
  load.geometry.attributes.position.setX(0, NaN);
  assert.throws(() => c.evaluate(), /vertex/);
});
test('moving parent and dynamic local anchors are evaluated at explicit states', () => {
  const root = new THREE.Group(), parent = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry());
  root.add(parent); parent.add(mesh);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 1, expectedMeshes: 1 });
  c.mesh('m', mesh).assembly('moving', { meshes: ['m'], anchors: {
    tip: { mesh: 'm', local: state => [state.local, 0, 0] },
  } });
  const result = c.sample([{ x: 0, local: 1 }, { x: 3, local: 2 }], state => {
    parent.position.x = state.x; parent.rotation.z = Math.PI / 2;
  });
  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.samples[0].anchors.moving.tip[1] - 1) < 1e-9);
  assert.ok(Math.abs(result.samples[1].anchors.moving.tip[0] - 3) < 1e-9);
  assert.ok(Math.abs(result.samples[1].anchors.moving.tip[1] - 2) < 1e-9);
});
test('off-axis rotated cylinder uses all transformed vertices', () => {
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 3, 13));
  mesh.rotation.set(0.6, 0.2, 0.9); mesh.scale.set(1.1, 0.8, 1.2);
  root.add(mesh);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 1, expectedMeshes: 1 });
  c.mesh('c', mesh).assembly('cylinder', { meshes: ['c'] });
  const actual = c.evaluate().meshBounds.c;
  const points = Array.from({ length: mesh.geometry.attributes.position.count }, (_, i) =>
    new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position, i).applyMatrix4(mesh.matrixWorld));
  for (let axis = 0; axis < 3; axis++) {
    assert.equal(actual.min[axis], Math.min(...points.map(p => p.getComponent(axis))));
    assert.equal(actual.max[axis], Math.max(...points.map(p => p.getComponent(axis))));
  }
});
test('inherited BoxGeometry metadata and reversed stale boundingBox are ignored', () => {
  const { c, load } = fixture(5);
  load.geometry.scale(4, 2, 3);
  assert.equal(load.geometry.parameters.width, 1);
  load.geometry.boundingBox = new THREE.Box3(new THREE.Vector3(100, 100, 100), new THREE.Vector3(-100, -100, -100));
  const bounds = c.evaluate().meshBounds.load;
  assert.deepEqual(bounds, { min: [-2, 4, -1.5], max: [2, 6, 1.5] });
});
test('negative, infinite, NaN tolerances and empty expected counts fail closed', () => {
  for (const tolerance of [-1, NaN, Infinity, '0']) {
    assert.throws(() => createSceneContract(THREE, {
      root: new THREE.Group(), expectedAssemblies: 1, expectedMeshes: 1, tolerance,
    }), /tolerance/);
    assert.throws(() => contact(fixture().c, { tolerance }), /tolerance/);
  }
  assert.throws(() => createSceneContract(THREE, {
    root: new THREE.Group(), expectedAssemblies: 0, expectedMeshes: 0,
  }), /positive integer/);
});
test('expected counts and unregistered root meshes are enforced', () => {
  const { root, c } = fixture();
  root.add(new THREE.Mesh(new THREE.BoxGeometry()));
  assert.throws(() => c.evaluate(), /unregistered/);
  const incomplete = createSceneContract(THREE, { root, expectedAssemblies: 1, expectedMeshes: 1 });
  assert.throws(() => incomplete.evaluate(), /expected/);
});
test('blanket, wildcard, missing and broad exemptions are invalid', () => {
  const { c } = fixture();
  for (const spec of [
    { assemblies: ['payload', 'support'], reason: 'broad' },
    { meshes: ['*', 'load'], reason: 'all' },
    { meshes: ['floor', 'load', 'other'], reason: 'broad' },
    { meshes: ['floor', 'load'], reason: '' },
  ]) assert.throws(() => c.exclude(spec));
});
test('targeted exemption does not hide another owned mesh collision', () => {
  const root = new THREE.Group();
  const a = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
  const b = new THREE.Mesh(new THREE.BoxGeometry());
  const cMesh = new THREE.Mesh(new THREE.BoxGeometry());
  root.add(a, b, cMesh);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 2, expectedMeshes: 3 });
  c.mesh('a', a).mesh('b', b).mesh('c', cMesh)
    .assembly('A', { meshes: ['a'] }).assembly('B', { meshes: ['b', 'c'] })
    .exclude({ meshes: ['a', 'b'], reason: 'intentional socket', maxDepth: [1, 1, 1] });
  const result = c.evaluate();
  assert.equal(result.excluded.length, 1);
  assert.equal(result.errors.length, 1);
  assert.deepEqual(result.errors[0].meshes, ['a', 'c']);
});
test('animation sampling catches a collision at the provided middle state', () => {
  const { c, load } = fixture();
  const result = c.sample([2, 0.5, 2], y => { load.position.y = y; });
  assert.equal(result.ok, false);
  assert.deepEqual(result.samples.map(s => s.ok), [true, false, true]);
  assert.throws(() => c.sample([], () => {}), /nonempty/);
});
test('nonfinite transforms and dynamic anchors fail closed', () => {
  const f = fixture(); f.load.position.x = NaN;
  assert.throws(() => f.c.evaluate(), /matrix/);
  const root = new THREE.Group(), mesh = new THREE.Mesh(new THREE.BoxGeometry()); root.add(mesh);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 1, expectedMeshes: 1 });
  c.mesh('m', mesh).assembly('a', { meshes: ['m'], anchors: { bad: { mesh: 'm', local: () => [NaN, 0, 0] } } });
  assert.throws(() => c.evaluate(), /finite/);
});
test('full assembly union keep-out is conservative across empty interior gaps', () => {
  const root = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry()); left.position.x = -2;
  const right = new THREE.Mesh(new THREE.BoxGeometry()); right.position.x = 2;
  const middle = new THREE.Mesh(new THREE.BoxGeometry()); root.add(left, right, middle);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 2, expectedMeshes: 3 });
  c.mesh('left', left).mesh('right', right).mesh('middle', middle)
    .assembly('span', { meshes: ['left', 'right'] }).assembly('middle', { meshes: ['middle'] });
  const result = c.evaluate();
  assert.equal(result.ok, false);
  assert.match(result.errors[0].evidence, /union bounds/);
});
test('reversed computed bounds fail closed', () => {
  class ReversedBox extends THREE.Box3 {
    union(box) { super.union(box); [this.min.x, this.max.x] = [this.max.x, this.min.x]; return this; }
  }
  const root = new THREE.Group(), mesh = new THREE.Mesh(new THREE.BoxGeometry()); root.add(mesh);
  const c = createSceneContract({ ...THREE, Box3: ReversedBox }, {
    root, expectedAssemblies: 1, expectedMeshes: 1,
  });
  c.mesh('m', mesh).assembly('a', { meshes: ['m'] });
  assert.throws(() => c.evaluate(), /reversed bounds/);
});
test('bounded exemptions reject oversize depth and inactive windows', () => {
  const { c, load } = fixture(0.9);
  c.exclude({ meshes: ['floor', 'load'], reason: 'limited contact', maxDepth: [1, 0.2, 1],
    active: state => state.enabled });
  assert.equal(c.evaluate({ enabled: true }).ok, true);
  assert.equal(c.evaluate({ enabled: false }).ok, false);
  load.position.y = 0.5;
  assert.equal(c.evaluate({ enabled: true }).ok, false);
});
test('exemption budgets are required, finite, nonnegative triples', () => {
  for (const maxDepth of [undefined, [1, 1], [-1, 0, 0], [NaN, 1, 1], [Infinity, 1, 1]]) {
    assert.throws(() => fixture().c.exclude({ meshes: ['floor', 'load'], reason: 'test', maxDepth }));
  }
});
test('morph attributes are rejected for rigid contracts', () => {
  const { c, load } = fixture();
  load.geometry.morphAttributes.position = [load.geometry.attributes.position.clone()];
  assert.throws(() => c.evaluate(), /unsupported deformed/);
});
test('async apply and async active callbacks fail closed', () => {
  assert.throws(() => fixture().c.sample([1], async () => {}), /synchronous/);
  assert.throws(() => fixture().c.sample([1], () => ({ then() {} })), /synchronous/);
  const { c } = fixture(0.9);
  c.exclude({ meshes: ['floor', 'load'], reason: 'test', maxDepth: [1, 1, 1], active: async () => true });
  assert.throws(() => c.evaluate(), /synchronous boolean/);
});
function triangleFixture() {
  const root = new THREE.Group(), geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 1, 0, 0, 0, 1, 0, 100, 100, 100, 101, 100, 100, 100, 101, 100,
  ], 3));
  const mesh = new THREE.Mesh(geometry); root.add(mesh);
  const c = createSceneContract(THREE, { root, expectedAssemblies: 1, expectedMeshes: 1 });
  c.mesh('m', mesh).assembly('a', { meshes: ['m'] });
  return { geometry, mesh, c };
}
test('unused indexed vertex outliers do not enlarge physical bounds', () => {
  const { geometry, c } = triangleFixture(); geometry.setIndex([0, 1, 2]);
  assert.deepEqual(c.evaluate().meshBounds.m, { min: [0, 0, 0], max: [1, 1, 0] });
});
test('indexed and nonindexed partial draw ranges use only active triangles', () => {
  for (const indexed of [false, true]) {
    const { geometry, c } = triangleFixture();
    if (indexed) geometry.setIndex([0, 1, 2, 3, 4, 5]);
    geometry.setDrawRange(3, 3);
    assert.deepEqual(c.evaluate().meshBounds.m, { min: [100, 100, 100], max: [101, 101, 100] });
  }
});
test('no triangles, malformed indices and invalid draw ranges fail closed', () => {
  for (const indices of [[0], [0, 1], [0, 1, 6], [0, 0, 0], [0, 1, -1]]) {
    const { geometry, c } = triangleFixture(); geometry.setIndex(indices);
    assert.throws(() => c.evaluate(), /triangle|index/);
  }
  const fractional = triangleFixture();
  fractional.geometry.setIndex(new THREE.BufferAttribute(new Float32Array([0, 1, 1.5]), 1));
  assert.throws(() => fractional.c.evaluate(), /index/);
  for (const [start, count] of [[-1, 3], [0.5, 3], [0, 0], [0, 4], [0, 9], [0, NaN]]) {
    const { geometry, c } = triangleFixture(); geometry.setDrawRange(start, count);
    assert.throws(() => c.evaluate(), /drawRange/);
  }
});
test('collapsed geometry and zero scale cannot count as physical meshes', () => {
  const collapsed = triangleFixture();
  collapsed.geometry.attributes.position.array.fill(0);
  assert.throws(() => collapsed.c.evaluate(), /nondegenerate/);
  const scaled = fixture(); scaled.load.scale.y = 0;
  assert.throws(() => scaled.c.evaluate(), /collapsed transform/);
  const lone = triangleFixture();
  lone.geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  assert.throws(() => lone.c.evaluate(), /triangle/);
  const mode = triangleFixture(); mode.mesh.drawMode = 1;
  assert.throws(() => mode.c.evaluate(), /draw mode/);
});
console.log(`Passed ${passed} scene contract tests.`);
