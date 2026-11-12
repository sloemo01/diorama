/**
 * The procedural demo: the same diorama as the harness, with a control panel
 * beside the paper so a person can explore seeds, themes, time of day, weather
 * and the timeline. The diorama itself still carries no UI (the panel sits
 * outside the frame); the harness page stays the QA surface.
 */
import * as THREE from 'three';
import { PixelPost } from '../../../templates/post.js';
import { CAMERA, createCamera, updateCamera } from '../../../templates/camera.js';
import { createDioramaOrbit } from '../../../templates/orbit.js';
import { PALETTE_RGB } from '../../../templates/procedural/palette.js';
import { generate, stateAt, summary, WEATHERS, TIMES } from '../../../templates/procedural/generate.js';
import { THEMES, THEME_NAMES } from '../../../templates/procedural/themes.js';
import { buildDiorama } from '../../../templates/procedural/build3d.js';
import { disposeShared } from '../../../templates/procedural/mesher.js';
import studio from '../examples/studio.json';
import { buildAuthored, SLAB } from './authored.js';
import { KINDS } from '../../../templates/procedural/vary.js';

CAMERA.fillX = 0.92;
CAMERA.fillY = 0.92;

const $ = (id) => document.getElementById(id);
const canvas = $('stage');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const post = new PixelPost(renderer, 2000, 1, PALETTE_RGB);
let camera = null, plan = null, diorama = null, authored = null;

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


const state = { seed: '7', theme: 'village', time: 'cycle', weather: 'auto', data: false, hand: false, speed: 1, playing: true, vary: null, strength: 0.8, kinds: new Set(KINDS) };
let clock = 0;
let last = performance.now();

function spec() {
  const v = state.vary === null ? {} : { vary: state.vary };
  if (state.data) return { ...JSON.parse(JSON.stringify(studio)), time: state.time, weather: state.weather === 'auto' ? studio.weather : state.weather, ...v };
  return { seed: state.seed, theme: state.theme, time: state.time, weather: state.weather === 'auto' ? undefined : state.weather, ...v };
}

function clear() {
  if (diorama) { scene.remove(diorama.group); diorama.dispose(); disposeShared(); diorama = null; }
  if (authored) { scene.remove(authored.group); authored.dispose(); authored = null; }
}

function buildHand() {
  clear();
  const clip = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), SLAB.hx + 0.002), new THREE.Plane(new THREE.Vector3(-1, 0, 0), SLAB.hx + 0.002),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), SLAB.hz + 0.002), new THREE.Plane(new THREE.Vector3(0, 0, -1), SLAB.hz + 0.002),
  ];
  authored = buildAuthored(clip);
  scene.add(authored.group);
  fitCamera(authored.fit);
  plan = { loop: authored.loop };
  clock = 4;
  $('scrub').max = String(authored.loop);
  $('title').textContent = authored.label;
  $('weatherNow').textContent = '';
  document.title = 'The corner bakery - variations';
  revary();
  syncButtons();
  window.__diorama.entities = authored.entities;
}

/** Re-apply the variation to the hand-made scene: always from the original. */
function revary() {
  if (!authored) return;
  const rep = authored.variable.apply({ seed: state.vary, strength: state.strength, kinds: [...state.kinds], keepOut: authored.keepOut });
  $('stats').textContent = state.vary === null
    ? `the original - ${authored.variable.tagged.length} objects carry a variation rule`
    : `variation ${state.vary} - ${rep.changed.length} of ${authored.variable.tagged.length} objects changed - largest slide ${rep.maxMove.toFixed(2)} m`;
  window.__diorama.variation = rep;
}

function build() {
  if (state.hand) return buildHand();
  const t0 = performance.now();
  clear();
  plan = generate(spec());
  diorama = buildDiorama(plan);
  scene.add(diorama.group);
  fitCamera(diorama.fit);
  clock = plan.heroT;
  const s = summary(plan);
  $('scrub').max = String(plan.loop);
  $('stats').textContent = `${s.lots} lots · ${s.actors + s.crew} people · ${s.crates} deliveries · ${s.parts} parts · loop ${s.loop}s · built in ${Math.round(performance.now() - t0)} ms`;
  $('weatherNow').textContent = plan.weather;
  $('title').textContent = (state.data ? 'Studio (from data)' : `${plan.label} · seed ${plan.seed}`) + (state.vary === null ? '' : ` · variation ${state.vary}`);
  document.title = `${$('title').textContent} — procedural diorama`;
  syncButtons();
  window.__diorama.plan = plan;
  window.__diorama.entities = diorama.entities;
  window.__diorama.summary = s;
}

function resize() {
  const r = canvas.getBoundingClientRect();
  post.setSize(Math.max(2, Math.round(r.width)), Math.max(2, Math.round(r.height)));
  if (camera) fitCamera((diorama ?? authored).fit);
}

function draw(t) {
  const st = (diorama ?? authored).apply(t);
  post.render(scene, camera);
  return st;
}

/* ---- controls ------------------------------------------------------------------------------- */

function chips(id, items, key, label = (x) => x) {
  const host = $(id);
  items.forEach((v) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.key = key;
    b.dataset.value = v;
    b.textContent = label(v);
    b.addEventListener('click', () => {
      state[key] = v;
      if (key === 'theme') { state.data = false; state.hand = false; }
      build();
    });
    host.appendChild(b);
  });
}
function syncButtons() {
  document.querySelectorAll('button[data-key]').forEach((b) => {
    const on = b.dataset.key === 'theme' ? !state.data && !state.hand && state[b.dataset.key] === b.dataset.value : String(state[b.dataset.key]) === b.dataset.value;
    b.classList.toggle('on', on);
  });
  $('dataBtn').classList.toggle('on', state.data && !state.hand);
  $('handBtn').classList.toggle('on', state.hand);
  $('varySeed').value = state.vary ?? '';
  $('original').classList.toggle('on', state.vary === null);
  document.querySelectorAll('.genOnly').forEach((el) => el.classList.toggle('off', state.hand));
  document.querySelectorAll('.handOnly').forEach((el) => el.classList.toggle('off', !state.hand));
  $('seed').value = state.seed;
  $('play').textContent = state.playing ? 'Pause' : 'Play';
}

chips('themes', THEME_NAMES, 'theme', (n) => THEMES[n].label);
chips('times', TIMES, 'time', (n) => ({ cycle: 'Day → night', day: 'Day', dusk: 'Dusk', night: 'Night' })[n]);
chips('weathers', ['auto', ...WEATHERS], 'weather');

const setSeed = (v) => { state.seed = String(v); state.data = false; build(); };
$('seed').addEventListener('change', (e) => setSeed(e.target.value.trim() || '1'));
$('prev').addEventListener('click', () => setSeed((parseInt(state.seed, 10) || 0) - 1));
$('next').addEventListener('click', () => setSeed((parseInt(state.seed, 10) || 0) + 1));
$('dice').addEventListener('click', () => setSeed(Math.floor(performance.now() * 7919) % 100000));
$('dataBtn').addEventListener('click', () => { state.data = true; state.hand = false; build(); });
$('handBtn').addEventListener('click', () => { state.hand = true; build(); });

// ---- variation: same composition, new details -------------------------------------------
function setVary(v) {
  state.vary = v === null || v === '' ? null : String(v);
  if (state.hand) { revary(); syncButtons(); } else build();
}
$('varySeed').addEventListener('change', (e) => setVary(e.target.value.trim()));
$('varyPrev').addEventListener('click', () => setVary(Math.max(1, (parseInt(state.vary, 10) || 1) - 1)));
$('varyNext').addEventListener('click', () => setVary((parseInt(state.vary, 10) || 0) + 1));
$('varyDice').addEventListener('click', () => setVary(1 + (Math.floor(performance.now() * 7919) % 9999)));
$('original').addEventListener('click', () => setVary(null));
$('strength').addEventListener('input', (e) => { state.strength = Number(e.target.value); $('strengthVal').textContent = Math.round(state.strength * 100) + '%'; revary(); });
document.querySelectorAll('input[data-kind]').forEach((el) => el.addEventListener('change', () => {
  if (el.checked) state.kinds.add(el.dataset.kind); else state.kinds.delete(el.dataset.kind);
  revary();
}));
$('play').addEventListener('click', () => { state.playing = !state.playing; syncButtons(); });
$('scrub').addEventListener('input', (e) => { clock = Number(e.target.value); state.playing = false; syncButtons(); });
document.querySelectorAll('button[data-speed]').forEach((b) => b.addEventListener('click', () => {
  state.speed = Number(b.dataset.speed);
  document.querySelectorAll('button[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
}));
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target === canvas) return; // canvas keys orbit / reset
  if (e.key === ' ') { e.preventDefault(); state.playing = !state.playing; syncButtons(); }
  else if (e.key === 'ArrowRight' || e.key === 'n') $('next').click();
  else if (e.key === 'ArrowLeft' || e.key === 'p') $('prev').click();
  else if (e.key === 'g') $('dice').click();
  else if (e.key === 'v') $('varyNext').click();
  else if (e.key === 'o') $('original').click();
});

window.__diorama = {
  THREE, scene, renderer, post, plan: null, entities: {},
  get camera() { return camera; },
  resetCamera() { orbit.reset(); },
  freeze(t) { state.playing = false; clock = Number(t); draw(clock); syncButtons(); return authored ? clock : stateAt(plan, clock).t; },
  stateAt: (t) => stateAt(plan, t),
};

build();
resize();
window.addEventListener('resize', resize);

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (state.playing) clock = (clock + dt * state.speed) % plan.loop;
  const st = draw(clock);
  $('scrub').value = String(clock);
  const h = !st.sky ? 'afternoon' : st.sky.night > 0.6 ? 'night' : st.sky.golden > 0.35 ? (st.sky.e > 0 ? 'golden hour' : 'dusk') : 'day';
  $('clock').textContent = `${clock.toFixed(1)}s / ${plan.loop}s · ${h}`;
  window.__dioramaReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
