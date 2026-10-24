import * as THREE from 'three';
import { PixelPost } from './core/post.js';
import { createMaterials, timeUniform } from './core/materials.js';
import { createCamera, updateCamera } from './scene/camera.js';
import { createLighting } from './scene/lighting.js';
import { createWater } from './scene/water.js';
import { createWake } from './scene/wake.js';
import { createSplash } from './scene/splash.js';
import { POOL, SCENE } from './config.js';

/**
 * Water harness: a slab with a pool, two swimmers crossing on a deterministic
 * path, a wake behind each and two timed splash bursts. Its only job is to put
 * templates/water.js, wake.js and splash.js in front of a camera so they can be
 * looked at, frozen and judged. It is not a play; there is no story.
 *
 * Run:
 *   npm i three esbuild playwright-core
 *   node build.mjs
 *   python3 -m http.server 4180 &
 *   node ../templates/qa/shoot.mjs            (BASE_URL=http://127.0.0.1:4180/index.html)
 */

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
scene.background = null;
const camera = createCamera();
const post = new PixelPost(renderer, 1600);
const { hx, hz, thick } = SCENE.slab;

const CLIP = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3(0, 0, 1), hz + 0.05),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), hz + 0.05),
];

createLighting(renderer, scene);
const mats = createMaterials();

// ---- slab, basin, coping ---------------------------------------------------
const slab = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, thick, hz * 2), mats.slabEdge);
slab.position.y = -thick / 2;
slab.receiveShadow = true;
scene.add(slab);

// Deck as a frame around the pool opening, so the water sits over the dark
// basin and not over beige. A deck covering the whole slab is the fastest way
// to make transparent water look like a stain.
const deckStrips = [
  [hx * 2, POOL.hz + (hz - POOL.hz), 0, (POOL.hz + hz) / 2],
  [hx * 2, hz - POOL.hz, 0, -(POOL.hz + hz) / 2],
  [hx - POOL.hx, POOL.hz * 2, (POOL.hx + hx) / 2, 0],
  [hx - POOL.hx, POOL.hz * 2, -(POOL.hx + hx) / 2, 0],
];
for (const [w, d, x, z] of deckStrips) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), mats.deck);
  strip.position.set(x, 0.01, z);
  strip.receiveShadow = true;
  scene.add(strip);
}

const floor = new THREE.Mesh(new THREE.BoxGeometry(POOL.hx * 2, 0.1, POOL.hz * 2), mats.tile);
floor.position.y = POOL.bottomY;
scene.add(floor);

for (const [sx, sz] of [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]) {
  const w = sz === 0 ? 0.12 : POOL.hx * 2;
  const d = sz === 0 ? POOL.hz * 2 : 0.12;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, -POOL.bottomY, d), mats.tile);
  wall.position.set(sx * POOL.hx, POOL.bottomY / 2, sz * POOL.hz);
  scene.add(wall);
}

for (const [w, d, x, z] of [
  [POOL.hx * 2 + 0.5, 0.25, 0, POOL.hz + 0.12],
  [POOL.hx * 2 + 0.5, 0.25, 0, -(POOL.hz + 0.12)],
  [0.25, POOL.hz * 2, POOL.hx + 0.12, 0],
  [0.25, POOL.hz * 2, -(POOL.hx + 0.12), 0],
]) {
  const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mats.coping);
  c.position.set(x, 0.03, z);
  c.receiveShadow = true;
  scene.add(c);
}

// ---- water, wake, splash ---------------------------------------------------
const water = createWater();
scene.add(water);

const wake = createWake(2);
scene.add(wake.group);

const splash = createSplash();
scene.add(splash.group);

// Two swimmers on a pure function of t: back and forth across the pool.
const SWIM = { y0: 0.42, spanX: 4.2, period: 6.0 };
function swimmerAt(i, t) {
  const phase = (t / SWIM.period) * Math.PI * 2 + i * 1.9;
  const x = Math.sin(phase) * SWIM.spanX;
  const z = i === 0 ? -1.1 : 1.0;
  const vx = Math.cos(phase) * SWIM.spanX * (Math.PI * 2) / SWIM.period;
  const yaw = Math.atan2(vx, 0);
  return { x, z, yaw, vx };
}

const bodies = [];
for (let i = 0; i < 2; i++) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 10), mats.suit);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.02;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mats.skin);
  head.position.set(0, 0.03, 0.34);
  head.castShadow = true;
  g.add(head);
  scene.add(g);
  bodies.push(g);
}

// Two splashes, at fixed times and places, so a frozen frame is reproducible.
const BURSTS = [
  { t: 1.6, x: 2.1, z: -1.1, power: 1.0 },
  { t: 4.3, x: -2.6, z: 1.0, power: 1.3 },
];

const LOOP = 9.0;

/** Re-simulate the dt-driven effects from zero whenever the clock jumps. */
function simulateTo(t) {
  wake.reset();
  splash.reset();
  const dt = 1 / 30;
  for (let s = 0; s < t; s += dt) {
    const tt = Math.min(s, t);
    const entries = [0, 1].map((i) => {
      const p = swimmerAt(i, tt);
      return { x: p.x, z: p.z, yaw: p.yaw, active: true };
    });
    wake.update(dt, tt, entries);
    for (const b of BURSTS) {
      if (s <= b.t && b.t < s + dt) splash.trigger(b.x, b.z, b.power, Math.round(b.t * 100));
    }
    splash.update(dt);
  }
}

function draw(T) {
  const t = ((T % LOOP) + LOOP) % LOOP;
  timeUniform.value = t;

  for (let i = 0; i < 2; i++) {
    const p = swimmerAt(i, t);
    bodies[i].position.set(p.x, POOL.waterY + SWIM.y0 - 0.42, p.z);
    bodies[i].rotation.y = p.yaw;
  }

  simulateTo(t);
  post.render(scene, camera, CLIP);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return;
  updateCamera(camera, Math.max(0.3, rect.width / rect.height));
  post.setSize(rect.width, rect.height);
}
resize();
window.addEventListener('resize', resize);

let frozen = null;
let origin = performance.now();
function tick(now) {
  if (frozen == null) draw((now - origin) / 1000);
  requestAnimationFrame(tick);
}

draw(0);
resize();
requestAnimationFrame(tick);

window.__diorama = {
  THREE,
  scene,
  camera,
  renderer,
  post,
  CLIP,
  water: { wake, splash },
  freeze(t) {
    frozen = t;
    draw(t);
  },
  play() {
    origin = performance.now() - (frozen ?? 0) * 1000;
    frozen = null;
  },
  view(pos, target) {
    if (!pos) {
      resize();
      return;
    }
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  },
};
window.__dioramaReady = true;
