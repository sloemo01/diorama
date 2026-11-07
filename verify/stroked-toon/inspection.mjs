import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPixelStroke } from '../../templates/pixel-stroke.js';
import { createDioramaOrbit } from '../../templates/orbit.js';

test('hybrid low-resolution nearest target, single outline path and restore', () => {
  const previous = {}; let active = previous; const passes = [];
  const renderer = { shadowMap: {}, domElement: {}, autoClear: true,
    setPixelRatio(v) { this.dpr = v; }, setClearColor() {}, clear() {},
    getRenderTarget() { return active; }, setRenderTarget(t) { active = t; },
    render(scene) { passes.push(active); },
  };
  const look = createPixelStroke(renderer, { width: 320, height: 180 });
  assert.equal(look.target.width, 320); assert.equal(look.target.height, 180);
  assert.equal(look.target.texture.magFilter, THREE.NearestFilter);
  assert.equal(renderer.dpr, 1);
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.BoxGeometry(), look.toon(0xabcdef)));
  look.render(scene, new THREE.PerspectiveCamera());
  assert.deepEqual(passes, [look.target, look.target, previous]);
  assert.equal(active, previous);
  assert.throws(() => look.setSize(0, 1)); look.setSize(160, 90);
  assert.equal(look.target.width, 160);
  renderer.render = () => { throw new Error('GPU failure'); };
  assert.throws(() => look.render(scene, new THREE.PerspectiveCamera()));
  assert.equal(active, previous); look.dispose();
});

function canvasStub() {
  const listeners = new Map(), attributes = new Map();
  return { style: {}, clientWidth: 800, clientHeight: 600,
    getRootNode() { return { addEventListener() {}, removeEventListener() {} }; },
    addEventListener(name, fn, capture) { if (capture) listeners.set(name, fn); },
    removeEventListener() {}, getAttribute(k) { return attributes.get(k) ?? null; },
    removeAttribute(k) { attributes.delete(k); }, setPointerCapture() {}, releasePointerCapture() {},
    fire(name, data) { listeners.get(name)?.({ pointerId: 1, clientX: 10, clientY: 10, button: 0, ...data }); },
  };
}
test('orbit separates click, drag, multi-touch and cancellation; deterministic reset', () => {
  const camera = new THREE.PerspectiveCamera(); camera.position.set(4, 3, 5);
  const canvas = canvasStub(); let selected = 0;
  const orbit = createDioramaOrbit(camera, canvas, { onSelect() { selected++; } });
  assert.equal(orbit.controls.autoRotate, false); assert.equal(orbit.controls.enablePan, false);
  canvas.fire('pointerdown'); canvas.fire('pointerup'); assert.equal(selected, 1);
  canvas.fire('pointerdown'); canvas.fire('pointermove', { clientX: 40 }); canvas.fire('pointerup'); assert.equal(selected, 1);
  canvas.fire('pointerdown'); canvas.fire('pointerdown', { pointerId: 2 });
  canvas.fire('pointerup', { pointerId: 2 }); canvas.fire('pointerup'); assert.equal(selected, 1);
  canvas.fire('pointerdown'); canvas.fire('pointercancel'); canvas.fire('pointerup'); assert.equal(selected, 1);
  canvas.fire('keydown', { target: canvas, key: 'ArrowLeft', preventDefault() {} });
  assert.notDeepEqual(camera.position.toArray(), [4, 3, 5]);
  orbit.reset(); assert.deepEqual(camera.position.toArray().map(n => +n.toFixed(8)), [4, 3, 5]);
  orbit.dispose();
});
