import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
const modulePath = process.env.THREE_MODULE;
if (!modulePath) throw new Error('Set THREE_MODULE to an existing Three.js ESM module path or URL');
const THREE = await import(modulePath.startsWith('/') ? pathToFileURL(modulePath).href : modulePath);
// Load as ESM even when the surrounding workspace has no package.json type.
const source = await readFile(new URL('../templates/construction-kit.js', import.meta.url), 'utf8');
const { createConstructionKit } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const kit = createConstructionKit(THREE), root = new THREE.Group();
const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
const v = a => new THREE.Vector3(...a);
const close = (a, b, epsilon = 1e-5) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);
const box = kit.boxAtBase(root, mat, { size: [2, 6, 4], base: [8, 9, -3] });
box.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(box);
close(bounds.min.y, 9); close(bounds.max.y, 15); close(bounds.getCenter(v([0,0,0])).x, 8);
for (const [a, b] of [[[1,2,3],[7,-5,9]], [[0,0,0],[0,-8,0]], [[-2,1,3],[4,1,3]], [[1,2,3],[1,2,9]]]) {
  const cylinder = kit.between(root, mat, { a, b, radius: 0.3 }); cylinder.updateMatrixWorld(true);
  const length = v(a).distanceTo(v(b));
  assert.ok(v([0,-length/2,0]).applyMatrix4(cylinder.matrixWorld).distanceTo(v(a)) < 1e-6);
  assert.ok(v([0,length/2,0]).applyMatrix4(cylinder.matrixWorld).distanceTo(v(b)) < 1e-6);
  // Actual generated cap-center vertices must coincide with both endpoints.
  const vertices = kit.collectWorldPoints(cylinder);
  for (const endpoint of [a,b]) assert.ok(vertices.some(p => p.distanceTo(v(endpoint)) < 1e-5));
}
const plate = kit.plateWithHoles(root, mat, { width: 10, depth: 8, thickness: 0.75, holes: [{ x: 2, z: -1, radius: 0.7 }, { x: -2, z: 2, radius: 0.5 }], base: [11,5,17] });
plate.updateMatrixWorld(true);
const plateBounds = new THREE.Box3().setFromObject(plate);
close(plateBounds.min.x, 6); close(plateBounds.max.x, 16); close(plateBounds.min.y, 5); close(plateBounds.max.y, 5.75);
close(plateBounds.min.z, 13); close(plateBounds.max.z, 21);
function ray(origin, direction) { return new THREE.Raycaster(v(origin), v(direction), 0, 100).intersectObject(plate); }
for (const [x,z] of [[13,16],[9,19]]) {
  assert.equal(ray([x,10,z],[0,-1,0]).length, 0); assert.equal(ray([x,0,z],[0,1,0]).length, 0);
}
close(ray([11,10,17],[0,-1,0])[0].point.y, 5.75);
close(ray([11,0,17],[0,1,0])[0].point.y, 5);
assert.ok(ray([13,5.4,16],[1,0,0]).length > 0, 'bore must have a real inner wall');
for (const offset of [[0,0,0],[123,-47,89]]) for (const aspect of [0.4,2]) for (const direction of [[1,2,3],[0,1,0],[0,-1,0],[-3,0.1,1]]) for (const fov of [7,50]) {
  const points = [[-80,-2,-4],[100,3,5],[0,6,-7],[-70,1,9]].map(p => v(p).add(v(offset)));
  const camera = new THREE.PerspectiveCamera(fov, 1, 4, 5);
  const pose = kit.fitPerspective(camera, { points, direction: v(direction), aspect, margin: 0.2 });
  assert.ok(pose.distance > 0); assert.ok(pose.position.distanceTo(camera.position) < 1e-9);
  for (const point of points) {
    const ndc = point.clone().project(camera);
    assert.ok(Math.abs(ndc.x) <= 0.800001 && Math.abs(ndc.y) <= 0.800001, JSON.stringify(ndc));
    assert.ok(ndc.z > -1 && ndc.z < 1, 'near/far clipping');
  }
}
const transformed = new THREE.Group(); transformed.position.set(4,5,6); transformed.rotation.set(0.2,0.8,-0.4); transformed.scale.set(2,3,4);
const child = kit.boxAtBase(transformed, mat, { size:[1,2,3], base:[0,0,0] });
const actual = kit.collectWorldPoints(transformed); assert.equal(actual.length, child.geometry.index.count);
assert.ok(actual[0].distanceTo(new THREE.Vector3().fromBufferAttribute(child.geometry.attributes.position, child.geometry.index.getX(0)).applyMatrix4(child.matrixWorld)) < 1e-9);
child.visible = false; assert.equal(kit.collectWorldPoints(transformed).length, 0); child.visible = true;
child.geometry.morphAttributes.position = [child.geometry.attributes.position]; assert.throws(() => kit.collectWorldPoints(transformed));
for (const invalid of [0,-1,NaN,Infinity]) {
  assert.throws(() => kit.boxAtBase(root,mat,{size:[1,invalid,1],base:[0,0,0]}));
  assert.throws(() => kit.between(root,mat,{a:[0,0,0],b:[1,2,3],radius:invalid}));
}
assert.throws(() => kit.between(root,mat,{a:[1,2,3],b:[1,2,3],radius:1}));
assert.throws(() => kit.plateWithHoles(root,mat,{width:4,depth:4,thickness:1,base:[0,0,0],holes:[{x:2,z:0,radius:1}]}));
const camera = new THREE.PerspectiveCamera();
for (const patch of [{direction:v([0,0,0])},{aspect:0},{margin:0.5},{points:[]},{points:[v([NaN,0,0])]}]) assert.throws(() => kit.fitPerspective(camera,{points:[v([0,0,0])],direction:v([1,1,1]),...patch}));
const grid = kit.gridFrames({columns:2,rows:2,spacing:[4,6],center:[10,3,20]});
assert.equal(grid.length,4); assert.equal(new Set(grid.map(f=>f.position.toArray().join(','))).size,4);
assert.deepEqual(grid.map(f=>f.position.toArray()),[[8,3,17],[12,3,17],[8,3,23],[12,3,23]]);
const radial = kit.radialFrames({count:8,radius:7,center:[2,5,-3],phase:.2});
assert.equal(radial.length,8); assert.equal(new Set(radial.map(f=>f.position.toArray().join(','))).size,8);
for(const f of radial){close(f.position.distanceTo(v([2,5,-3])),7);const ray=v([1,0,0]).applyQuaternion(f.quaternion);assert.ok(ray.distanceTo(f.position.clone().sub(v([2,5,-3])).normalize())<1e-8);}
assert.throws(()=>kit.gridFrames({columns:0,rows:2,spacing:[1,1],center:[0,0,0]}));
assert.throws(()=>kit.gridFrames({columns:2,rows:2,spacing:[0,1],center:[0,0,0]}));
assert.throws(()=>kit.radialFrames({count:1.5,radius:7,center:[0,0,0]}));
assert.throws(()=>kit.radialFrames({count:8,radius:-1,center:[0,0,0]}));
console.log('construction-kit: base contacts, real bores, endpoints, transformed vertices, 32 camera-fit cases, unique grid/radial frames, and invalid inputs passed');
