import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/**
 * Per-entity frame recorder.
 *
 * Records one dense frame series per entity across a window and prints a numeric
 * verdict for each. This is the harness that catches what a single still never
 * shows: an actor that never moves, one that teleports, a prop that drifts out of
 * frame, an ear that pops, a foot that skates, a hand that phases through a body.
 *
 *   BASE_URL   default http://127.0.0.1:4180/index.html
 *   ENTITIES   JS expression evaluated in the page, returning {name: Object3D}.
 *              Falls back to window.__diorama.entities, then window.__diorama.cast.
 *   FROM / TO  window in seconds (default 0 .. 4)
 *   FPS        frames per second to sample (default 12)
 *   OUT        output dir (default qa/frames)
 *   VIEW       "portrait" (default) fits a camera to the entity's swept bounds so
 *              it fills the frame for the whole move; "scene" keeps the locked
 *              camera and crops to the entity instead
 *   ISOLATE    "scene" (default) hides every mesh that is not on the entity's
 *              branch; "siblings" hides only the other registered entities;
 *              "none" keeps the whole scene
 *   PAD        padding in px for VIEW=scene (default 24)
 *   MIN_ENERGY mean luminance delta per frame under which an entity counts as
 *              frozen (default 0.35)
 *   MAX_STEP   NDC jump between frames that counts as a teleport (default 0.22)
 *   STATIC     comma separated names allowed to hold still (a guard, a seated
 *              figure); they still get teleport and offscreen checks
 *   COLS       columns in the contact sheet (default 6)
 *
 * Output per entity: OUT/<name>/f###.png, OUT/<name>/sheet.png, and a line in
 * OUT/report.json. Exit code 1 when any entity is flagged, so CI can gate on it.
 * Read the sheets; the numbers only say where to look.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const ENTITIES = process.env.ENTITIES || '';
const FROM = Number(process.env.FROM || 0);
const TO = Number(process.env.TO || 4);
const FPS = Number(process.env.FPS || 12);
const OUT = process.env.OUT || 'qa/frames';
const VIEW = process.env.VIEW || 'portrait';
const ISOLATE = process.env.ISOLATE || 'scene';
const PAD = Number(process.env.PAD || 24);
const MIN_ENERGY = Number(process.env.MIN_ENERGY || 0.35);
const MAX_STEP = Number(process.env.MAX_STEP || 0.22);
const COLS = Number(process.env.COLS || 6);
const W = Number(process.env.W || 900);
const H = Number(process.env.H || 700);

const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const STATIC = new Set(
  (process.env.STATIC || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
);
const N = Math.max(2, Math.round((TO - FROM) * FPS));

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const url = m.location()?.url || '';
  if (/favicon/i.test(url)) return; // a stub favicon 404 is not a scene error
  errors.push(url ? `${m.text()} (${url})` : m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(BASE_URL, { waitUntil: 'load' });
await page.waitForFunction(() => window.__dioramaReady === true || window.__ready === true, null, {
  timeout: 30000,
});

const names = await page.evaluate((expr) => {
  const d = window.__diorama;
  let reg = null;
  if (expr) reg = new Function('d', `return (${expr});`)(d);
  else if (d.entities) reg = d.entities;
  else if (Array.isArray(d.cast)) {
    reg = {};
    for (const c of d.cast) reg[c.name || `cast${Object.keys(reg).length}`] = c.model || c.group || c;
  }
  if (!reg) throw new Error('no entity registry: set ENTITIES or expose window.__diorama.entities');
  window.__entityRegistry = reg;
  return Object.keys(reg).filter((k) => reg[k] && reg[k].isObject3D);
}, ENTITIES);

if (!names.length) {
  console.error('frames failed: the registry has no Object3D entries');
  process.exit(1);
}

// Isolation is installed once so the fit, the signature and the captures all
// agree on what is on screen.
await page.evaluate(
  ({ isolateMode }) => {
    const d = window.__diorama;
    window.__iso = {
      apply(name) {
        const reg = window.__entityRegistry;
        const target = reg[name];
        const out = { others: [], meshes: [] };
        if (isolateMode === 'siblings' || isolateMode === 'scene') {
          for (const [k, o] of Object.entries(reg)) {
            if (k === name) continue;
            out.others.push([o, o.visible]);
            o.visible = false;
          }
        }
        if (isolateMode === 'scene') {
          const keep = new Set();
          target.traverseAncestors((o) => keep.add(o));
          target.traverse((o) => keep.add(o));
          d.scene.traverse((o) => {
            if (o.isMesh && !keep.has(o)) {
              out.meshes.push([o, o.visible]);
              o.visible = false;
            }
          });
        }
        return out;
      },
      restore(saved) {
        for (const [o, v] of saved.others) o.visible = v;
        for (const [o, v] of saved.meshes) o.visible = v;
      },
    };
  },
  { isolateMode: ISOLATE }
);

const report = [];

for (const name of names) {
  const dir = `${OUT}/${name}`;
  mkdirSync(dir, { recursive: true });

  // Swept bounds over the window, then one camera fitted to them: the framing is
  // stable while the entity moves, because a per-frame follow hides travel.
  const fit = await page.evaluate(
    ({ name, from, to, n, view }) => {
      const d = window.__diorama;
      const T = d.THREE;
      const saved = window.__iso.apply(name);
      const box = new T.Box3();
      const tmp = new T.Box3();
      for (let i = 0; i < n; i++) {
        const t = from + ((to - from) * i) / Math.max(1, n - 1);
        (d.freeze || d.draw)(t);
        tmp.setFromObject(window.__entityRegistry[name]);
        if (isFinite(tmp.min.x)) box.union(tmp);
      }
      const cam = d.camera;
      const prev = { pos: cam.position.clone(), quat: cam.quaternion.clone(), zoom: cam.zoom, fov: cam.fov };
      let rect = null;
      if (view === 'portrait') {
        // Centre on the mean of the sampled poses, not the union centre: one
        // outlier frame (a leap, a spin) drags the union box and pushes the actor
        // out of its own portrait. Skinned bounds are bind-pose approximations,
        // so pad generously too.
        const c = new T.Vector3();
        let samples = 0;
        for (let i = 0; i < n; i++) {
          const t = from + ((to - from) * i) / Math.max(1, n - 1);
          (d.freeze || d.draw)(t);
          tmp.setFromObject(window.__entityRegistry[name]);
          if (!isFinite(tmp.min.x)) continue;
          c.add(tmp.getCenter(new T.Vector3()));
          samples++;
        }
        if (samples) c.multiplyScalar(1 / samples);
        const size = box.getSize(new T.Vector3());
        const dir = new T.Vector3(0.62, 0.52, 0.86).normalize();
        cam.position.copy(c).addScaledVector(dir, 6);
        cam.lookAt(c);
        if (cam.isPerspectiveCamera) {
          cam.fov = 32;
          // Fit the subject, not its diagonal: height and width each get their
          // own distance, take the larger, then 30% of paper. Fitting the
          // diagonal is what leaves a character at a third of the frame, and a
          // tight fit clips a spin or a leap that the sampled boxes missed.
          const aspect = Math.max(0.2, window.innerWidth / window.innerHeight);
          const tan = Math.tan((cam.fov * Math.PI) / 360);
          const dv = (size.y * 0.5) / tan;
          const dh = (size.x * 0.5) / (tan * aspect);
          const dist = Math.max(0.6, Math.max(dv, dh) * 1.6);
          cam.position.copy(c).addScaledVector(dir, dist);
          cam.lookAt(c);
        } else {
          const span = Math.max(size.y, size.x / Math.max(0.2, window.innerWidth / window.innerHeight));
          cam.zoom = (H * 0.5) / (Math.max(0.08, span * 0.58));
        }
        cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
      } else {
        cam.updateMatrixWorld(true);
        const v = new T.Vector3();
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let c = 0; c < 8; c++) {
          v.set(c & 1 ? box.max.x : box.min.x, c & 2 ? box.max.y : box.min.y, c & 4 ? box.max.z : box.min.z);
          v.project(cam);
          const px = (v.x * 0.5 + 0.5) * innerWidth;
          const py = (-v.y * 0.5 + 0.5) * innerHeight;
          x0 = Math.min(x0, px); x1 = Math.max(x1, px);
          y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        }
        rect = { x0, y0, x1, y1 };
      }
      window.__iso.restore(saved);
      return {
        cam: { pos: prev.pos.toArray(), quat: prev.quat.toArray(), zoom: prev.zoom, fov: prev.fov },
        size: box.getSize(new T.Vector3()).toArray().map((v) => +v.toFixed(2)),
        center: box.getCenter(new T.Vector3()).toArray().map((v) => +v.toFixed(2)),
        rect,
      };
    },
    { name, from: FROM, to: TO, n: Math.min(N, 16), view: VIEW }
  );

  let clip = { x: 0, y: 0, width: W, height: H };
  if (VIEW !== 'portrait' && fit.rect) {
    const { x0, y0, x1, y1 } = fit.rect;
    const cw = Math.max(48, Math.min(W, x1 - x0 + PAD * 2));
    const ch = Math.max(48, Math.min(H, y1 - y0 + PAD * 2));
    clip = {
      x: Math.round(Math.max(0, Math.min(W - cw, x0 - PAD))),
      y: Math.round(Math.max(0, Math.min(H - ch, y0 - PAD))),
      width: Math.round(cw),
      height: Math.round(ch),
    };
  }

  const frames = [];
  for (let i = 0; i < N; i++) {
    const t = FROM + ((TO - FROM) * i) / Math.max(1, N - 1);
    const sig = await page.evaluate(
      ({ name, t }) => {
        const d = window.__diorama;
        const saved = window.__iso.apply(name);
        (d.freeze || d.draw)(t);
        const gl = d.renderer.getContext();
        const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
        const buf = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        // A 32x32 luminance signature is enough to feel motion, and cheap to send
        // back. It is a detector, not a proof, so read the sheet too.
        const G = 32, grid = new Array(G * G).fill(0), counts = new Array(G * G).fill(0);
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x += 2) {
            const i2 = (y * w + x) * 4;
            const l = 0.2126 * buf[i2] + 0.7152 * buf[i2 + 1] + 0.0722 * buf[i2 + 2];
            const gx = Math.min(G - 1, Math.floor((x / w) * G));
            const gy = Math.min(G - 1, Math.floor((y / h) * G));
            grid[gy * G + gx] += l;
            counts[gy * G + gx]++;
          }
        }
        for (let k = 0; k < grid.length; k++) grid[k] = counts[k] ? grid[k] / counts[k] : 0;
        let inkPx = 0, allPx = 0;
        for (let y = 0; y < h; y += 4) {
          for (let x = 0; x < w; x += 4) {
            const i2 = (y * w + x) * 4;
            const l = 0.2126 * buf[i2] + 0.7152 * buf[i2 + 1] + 0.0722 * buf[i2 + 2];
            allPx++;
            if (l < 232) inkPx++;
          }
        }
        const box = new d.THREE.Box3().setFromObject(window.__entityRegistry[name]);
        const c = box.getCenter(new d.THREE.Vector3()).project(d.camera);
        window.__iso.restore(saved);
        return { l: grid, ndc: [c.x, c.y], ink: +(inkPx / Math.max(1, allPx)).toFixed(4) };
      },
      { name, t }
    );
    const file = `${dir}/f${String(i).padStart(3, '0')}.png`;
    await page.screenshot({ path: file, clip });
    frames.push({ t, file, ...sig });
  }

  // Put the locked camera back before the next entity.
  await page.evaluate((cam) => {
    const d = window.__diorama;
    d.camera.position.fromArray(cam.pos);
    d.camera.quaternion.fromArray(cam.quat);
    if (cam.fov) d.camera.fov = cam.fov;
    if (cam.zoom) d.camera.zoom = cam.zoom;
    d.camera.updateProjectionMatrix();
    d.camera.updateMatrixWorld(true);
  }, fit.cam);

  let energy = 0, step = 0, offscreen = 0;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1], cur = frames[i];
    // Only compare frames where the entity is actually on screen: a blank frame
    // next to a full one would otherwise supply all the "motion" for the window.
    if (prev.ink > 0.002 && cur.ink > 0.002) {
      let sum = 0;
      for (let k = 0; k < prev.l.length; k++) sum += Math.abs(prev.l[k] - cur.l[k]);
      energy = Math.max(energy, sum / prev.l.length);
    }
    const dx = cur.ndc[0] - prev.ndc[0], dy = cur.ndc[1] - prev.ndc[1];
    step = Math.max(step, Math.hypot(dx, dy));
  }
  const empty = frames.filter((f) => f.ink <= 0.002).length;
  for (const f of frames) if (f.ink > 0.002 && (Math.abs(f.ndc[0]) > 1 || Math.abs(f.ndc[1]) > 1)) offscreen++;

  const verdict = [];
  if (empty === frames.length) verdict.push('NOT-IN-WINDOW');
  else if (empty > frames.length / 2) verdict.push(`EMPTY ${empty}/${frames.length}`);
  if (energy < MIN_ENERGY && !STATIC.has(name) && empty < frames.length) verdict.push('FROZEN');
  if (step > MAX_STEP) verdict.push('TELEPORT');
  if (offscreen) verdict.push(`OFFSCREEN ${offscreen}/${frames.length}`);

  const sheet = `${dir}/sheet.png`;
  const rows = Math.ceil(frames.length / COLS);
  const tiled = spawnSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-i', `${dir}/f%03d.png`, '-vf', `tile=${COLS}x${rows}:padding=4:color=white`, '-frames:v', '1', sheet],
    { encoding: 'utf8' }
  );

  report.push({
    entity: name,
    frames: frames.length,
    size: fit.size,
    center: fit.center,
    clip,
    energy: +energy.toFixed(3),
    maxStep: +step.toFixed(3),
    empty,
    verdict: verdict.length ? verdict.join(' ') : 'ok',
    sheet: tiled.status === 0 ? sheet : null,
  });
}

await browser.close();

writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE_URL, from: FROM, to: TO, fps: FPS, view: VIEW, report }, null, 1));

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('entity', 16), pad('frames', 7), pad('empty', 6), pad('energy', 8), pad('step', 7), pad('bounds', 18), 'verdict');
for (const r of report) {
  console.log(pad(r.entity, 16), pad(r.frames, 7), pad(r.empty, 6), pad(r.energy, 8), pad(r.maxStep, 7), pad(r.size.join(' '), 18), r.verdict);
}
if (errors.length) {
  console.log(`\nconsole errors (${errors.length}):`);
  for (const e of errors.slice(0, 6)) console.log(' ', e);
}
const failed = report.filter((r) => r.verdict !== 'ok');
console.log(`\n${report.length} entities, ${failed.length} flagged. Sheets in ${OUT}/<entity>/sheet.png`);
if (failed.length || errors.length) process.exitCode = 1;
