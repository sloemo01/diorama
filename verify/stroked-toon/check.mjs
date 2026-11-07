// Run with node --test when three is resolvable, or bundle using a project's
// esbuild + nodePaths to its node_modules. No browser/GPU is needed here.
// This tests configuration and material restoration, NOT visual appearance.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeToonRamp, setToonOutline, createStrokedToon } from '../../templates/stroked-toon.js';

test('four-step ramp uses nearest filtering without mipmaps', () => {
  const t = makeToonRamp();
  assert.deepEqual([...t.image.data], [68, 122, 184, 246]);
  assert.equal(t.image.width, 4);
  assert.equal(t.image.height, 1);
  assert.equal(t.format, THREE.RedFormat);
  assert.equal(t.minFilter, THREE.NearestFilter);
  assert.equal(t.magFilter, THREE.NearestFilter);
  assert.equal(t.generateMipmaps, false);
  assert.throws(() => makeToonRamp([0, 1, 2]));
  assert.throws(() => makeToonRamp([0, 1, 2, 256]));
  t.dispose();
});

test('cavities and flat surfaces can opt out of contours', () => {
  const m = new THREE.MeshToonMaterial();
  assert.equal(setToonOutline(m, false), m);
  assert.equal(m.userData.outlineParameters.visible, false);
  setToonOutline(m, true, 0.0024);
  assert.equal(m.userData.outlineParameters.thickness, 0.0024);
  m.dispose();
});

function fakeRenderer() {
  return {
    shadowMap: {}, domElement: {}, autoClear: true, passes: [],
    setPixelRatio(v) { this.dpr = v; },
    setClearColor(c, a) { this.clearColor = c; this.clearAlpha = a; },
    render(s) {
      const visible = [];
      s.traverse(o => { if (o.isMesh) visible.push(o.material.visible); });
      this.passes.push(visible);
    },
  };
}

test('renderer preset caps DPR and uses a separate no-outline flat material', () => {
  const r = fakeRenderer();
  const look = createStrokedToon(r, { dpr: 3 });
  assert.equal(r.dpr, 2);
  assert.equal(r.outputColorSpace, THREE.SRGBColorSpace);
  assert.equal(r.toneMapping, THREE.NoToneMapping);
  assert.equal(r.shadowMap.type, THREE.PCFSoftShadowMap);
  assert.equal(r.clearAlpha, 0);
  const surface = look.toon(0x6688aa);
  const inner = look.toon(0x557799, { outline: false, side: THREE.FrontSide });
  const film = look.flat(0xabcdef, { transparent: true, opacity: 0.3 });
  assert.equal(surface.gradientMap, look.ramp);
  assert.equal(inner.userData.outlineParameters.visible, false);
  assert.equal(film.userData.outlineParameters.visible, false);
  let disposed = 0;
  for (const x of [surface, inner, film, look.ramp]) x.addEventListener('dispose', () => disposed++);
  look.dispose();
  assert.equal(disposed, 4);
});

test('outline pass restores scene/material state and skips cavity outlines', () => {
  const r = fakeRenderer();
  const look = createStrokedToon(r);
  const s = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const outer = new THREE.Mesh(new THREE.BoxGeometry(), look.toon(0x6688aa));
  const inner = new THREE.Mesh(new THREE.BoxGeometry(), look.toon(0x557799, { outline: false }));
  s.add(outer, inner);
  const material = outer.material;
  look.render(s, camera);
  assert.equal(r.passes.length, 2);
  assert.deepEqual(r.passes[1], [true, false]);
  assert.equal(outer.material, material);
  assert.equal(r.autoClear, true);
  assert.equal(r.shadowMap.enabled, true);
  assert.equal(s.matrixWorldAutoUpdate, true);
  outer.geometry.dispose(); inner.geometry.dispose(); look.dispose();
});
