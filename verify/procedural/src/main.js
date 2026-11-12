/**
 * Procedural diorama harness: one seed (or one data spec) in, one diorama out.
 *
 *   index.html?seed=7&theme=harbour&time=cycle&weather=auto&t=12.5
 *   index.html#spec=<base64url JSON spec>         (lots and events from real data)
 *   index.html?example=studio                     (the bundled data example)
 *
 * Keys (no on-page UI, the paper stays empty): N / P next or previous seed,
 * T next theme, W next weather, D next time of day, Space pause. Drag to orbit;
 * with the canvas focused, arrows orbit and R resets the hero view (templates/orbit.js).
 */
import * as THREE from 'three';
import { PixelPost } from '../../../templates/post.js';
import { CAMERA, createCamera, updateCamera } from '../../../templates/camera.js';
import { createDioramaOrbit } from '../../../templates/orbit.js';
import { PALETTE_RGB } from '../../../templates/procedural/palette.js';
import { generate, stateAt, summary, WEATHERS, TIMES } from '../../../templates/procedural/generate.js';
import { THEME_NAMES } from '../../../templates/procedural/themes.js';
import { buildDiorama } from '../../../templates/procedural/build3d.js';
import { disposeShared } from '../../../templates/procedural/mesher.js';
import studio from '../examples/studio.json';

/** Data specs bundled into the page (file:// cannot fetch): ?example=studio */
const EXAMPLES = { studio };

CAMERA.fillX = 0.9;
CAMERA.fillY = 0.9;

const canvas = document.getElementById('stage');
const fallback = document.getElementById('fallback');

function readSpec() {
  const q = new URLSearchParams(location.search);
  let spec = {};
  const m = location.hash.match(/spec=([A-Za-z0-9_\-=]+)/);
  if (m) {
    try { spec = JSON.parse(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { console.warn('bad #spec, ignored'); }
  }
  if (q.has('example') && EXAMPLES[q.get('example')]) spec = JSON.parse(JSON.stringify(EXAMPLES[q.get('example')]));
  if (q.has('seed')) spec.seed = q.get('seed');
  if (q.has('theme')) spec.theme = q.get('theme');
  if (q.has('time')) spec.time = q.get('time');
  if (q.has('weather')) spec.weather = q.get('weather');
  if (spec.seed === undefined) spec.seed = 7;
  if (!spec.theme) spec.theme = 'village';
  return { spec, t: q.has('t') ? Number(q.get('t')) : null };
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
} catch (e) {
  fallback.hidden = false;
  throw e;
}
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // the post pass does the gamma itself
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.background = null;
const post = new PixelPost(renderer, 2000, 1, PALETTE_RGB);
let camera = null, plan = null, diorama = null;

/** Hero pose from the fit points, then free orbit on top (every preset: hero reset + user orbit). */
let orbit = null;
function fitCamera(fit) {
  const r = canvas.getBoundingClientRect();
  if (!camera) camera = createCamera(r.width / r.height, fit);
  else updateCamera(camera, r.width / r.height, fit);
  if (orbit) orbit.dispose();
  const d = camera.userData.distance;
  orbit = createDioramaOrbit(camera, canvas, { target: CAMERA.target, minDistance: d * 0.35, maxDistance: d * 1.8, maxPolarAngle: Math.PI * 0.47 });
}

let { spec, t: frozen } = readSpec();
let t0 = performance.now();

function build(next) {
  if (diorama) { scene.remove(diorama.group); diorama.dispose(); disposeShared(); }
  spec = next;
  plan = generate(spec);
  diorama = buildDiorama(plan);
  scene.add(diorama.group);
  fitCamera(diorama.fit);
  document.title = `${plan.label} · seed ${plan.seed} — a procedural diorama`;
  window.__diorama.plan = plan;
  window.__diorama.entities = diorama.entities;
  window.__diorama.summary = summary(plan);
}

function resize() {
  const r = canvas.getBoundingClientRect();
  post.setSize(Math.max(2, Math.round(r.width)), Math.max(2, Math.round(r.height)));
  if (camera) fitCamera(diorama.fit);
}

function draw(t) {
  diorama.apply(t);
  post.render(scene, camera);
}

window.__diorama = {
  THREE, scene, camera: null, renderer, post, plan: null, entities: {},
  freeze(t) { frozen = Number(t); draw(frozen); return stateAt(plan, frozen).t; },
  resetCamera() { orbit.reset(); draw(frozen ?? 0); },
  play() { frozen = null; t0 = performance.now(); },
  stateAt: (t) => stateAt(plan, t),
  regenerate(next) { build(next); resize(); window.__diorama.camera = camera; draw(frozen ?? 0); return summary(plan); },
};

build(spec);
window.__diorama.camera = camera;
resize();
window.addEventListener('resize', resize);

function cycle(list, v, step = 1) { const i = list.indexOf(v); return list[(i + step + list.length) % list.length]; }
window.addEventListener('keydown', (e) => {
  if (e.target === canvas) return; // the canvas's own keys orbit (arrows) and reset (R)
  const s = { ...spec };
  if (e.key === 'n' || e.key === 'p') s.seed = String((parseInt(s.seed, 10) || 0) + (e.key === 'n' ? 1 : -1));
  else if (e.key === 't') s.theme = cycle(THEME_NAMES, s.theme);
  else if (e.key === 'w') s.weather = cycle(WEATHERS, s.weather || plan.weather);
  else if (e.key === 'd') s.time = cycle(TIMES, s.time || 'cycle');
  else if (e.key === ' ') {
    // pause at the current time, or resume from where it was paused
    if (frozen === null) frozen = stateAt(plan, (performance.now() - t0) / 1000).t;
    else { t0 = performance.now() - frozen * 1000; frozen = null; }
    return;
  }
  else return;
  delete s.lots; delete s.events;
  const q = new URLSearchParams({ seed: s.seed, theme: s.theme, ...(s.time ? { time: s.time } : {}), ...(s.weather ? { weather: s.weather } : {}) });
  history.replaceState(null, '', '?' + q.toString());
  build(s);
  resize();
});

function frame() {
  const t = frozen ?? (performance.now() - t0) / 1000;
  draw(t);
  if (!window.__dioramaReady) window.__dioramaReady = true;
  requestAnimationFrame(frame);
}
draw(frozen ?? 0);
window.__dioramaReady = true;
requestAnimationFrame(frame);
