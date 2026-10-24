import { chromium } from 'playwright-core';

/**
 * Mechanical scene audit. Run this in addition to shoot.mjs.
 *
 * It catches the post-build failures that screenshots alone miss:
 *   FLAT_GLOW      a flat, untextured, low-opacity plane (the grey rectangle)
 *   GROUP_FADE     a whole object made translucent by material opacity
 *   EARLY_HIDE     a mover hidden while its world bounds still touch the slab
 *   TELEPORT       a mover jumping more than MAX_SPEED between samples
 *   IDLE_EMITTER   particles alive while the effect's event window is closed
 *   ORPHAN_EMITTER particle cloud far from its declared nozzle/source
 *   CAMERA_SCALE   actual camera distance does not match fit / subjectScale
 *   RENDER_SCALE   post buffer does not match CSS size * renderScale
 *   MARGIN_LEAK    geometry/FX pixels in the paper margin
 *
 * BASE_URL and CHROME_PATH as in shoot.mjs.
 * LOOP=20 STEP=0.1 MAX_SPEED=12 MARGIN_RATIO=0.0002 STRICT=0
 *
 * Optional audit contract in main.js (strongly recommended):
 *
 * window.__diorama.audit = {
 *   loop: 46,
 *   slab: { x0: -12, x1: 12, z0: -8, z1: 8, margin: 0.35 },
 *   movers: [
 *     { name: 'hero', group: hero.group, required: true, allowSpawn: false }
 *   ],
 *   emitters: [
 *     { name: 'hero-exhaust', points: smoke.points,
 *       source: () => exhaustTip.getWorldPosition(new THREE.Vector3()),
 *       active: (t) => t > 12.9 && t < 13.8,
 *       maxOffset: 2.2, tail: 0.8 }
 *   ]
 * };
 *
 * `source` may be a Vector3, an Object3D, or a function returning either.
 * `points` may be omitted when `count(t)` / `centroid(t)` are supplied.
 * With no contract, the flat-glow and fade checks still run; the margin scan
 * needs the slab rectangle.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const LOOP = Number(process.env.LOOP || 20);
const STEP = Number(process.env.STEP || 0.1);
const MAX_SPEED = Number(process.env.MAX_SPEED || 12);
const STRICT = process.env.STRICT === '1';
const FLAT_AREA = Number(process.env.FLAT_AREA || 0.75);
const MARGIN_RATIO = Number(process.env.MARGIN_RATIO || 0.0002);

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});

await page.goto(BASE_URL, { waitUntil: 'load' });
await page.waitForFunction(
  () => window.__dioramaReady === true || window.__ready === true,
  null,
  { timeout: 30000 }
);

const report = await page.evaluate(
  ({ step, flatArea, loopDefault, maxSpeed }) => {
    const d = window.__diorama;
    const THREE = d && d.THREE;
    if (!d || !d.scene || !THREE) {
      return { fatal: 'window.__diorama.scene/THREE is missing', errors: [], warnings: [] };
    }
    const freeze = d.freeze || d.draw;
    if (typeof freeze !== 'function') {
      return { fatal: 'window.__diorama.freeze(t) (or draw(t)) is missing', errors: [], warnings: [] };
    }

    const audit = d.audit || {};
    const loop = Number(audit.loop ?? d.loop ?? d.WORLD?.loop ?? loopDefault);
    const slab = audit.slab || null;
    const errors = [];
    const warnings = [];
    const seen = new Set();
    const add = (bucket, kind, message, data = {}) => {
      const key = `${kind}:${message}`;
      if (seen.has(key)) return;
      seen.add(key);
      bucket.push({ kind, message, ...data });
    };
    const shown = (o) => {
      for (let p = o; p; p = p.parent) if (p.visible === false) return false;
      return true;
    };
    const vec = (value) => {
      if (!value) return null;
      if (value.isVector3) return value.clone();
      if (Array.isArray(value)) return new THREE.Vector3(value[0], value[1], value[2]);
      if (value.isObject3D) {
        value.updateWorldMatrix(true, false);
        return new THREE.Vector3().setFromMatrixPosition(value.matrixWorld);
      }
      return null;
    };
    const resolve = (ref) => {
      if (!ref) return null;
      if (typeof ref === 'string') return d.scene.getObjectByName(ref);
      return ref;
    };
    const boxOf = (g) => {
      g.updateWorldMatrix(true, true);
      const b = new THREE.Box3().setFromObject(g);
      return b.isEmpty() ? null : b;
    };
    const cleared = (box, s, margin) =>
      box.max.x < s.x0 - margin ||
      box.min.x > s.x1 + margin ||
      box.max.z < s.z0 - margin ||
      box.min.z > s.z1 + margin;
    const touchesSlab = (box, s, margin) =>
      box.max.x > s.x0 - margin &&
      box.min.x < s.x1 + margin &&
      box.max.z > s.z0 - margin &&
      box.min.z < s.z1 + margin;

    // 0. Camera scale. A post-fit subjectScale must be the only size change:
    // actual distance is fitDistance / subjectScale. No metadata, no check.
    const cam = d.camera;
    const fit = Number(cam?.userData?.fitDistance);
    const scale = Number(cam?.userData?.subjectScale);
    if (Number.isFinite(fit) && fit > 0 && Number.isFinite(scale) && scale > 0) {
      const actual = Number(cam.userData.distance);
      const expected = fit / scale;
      if (!Number.isFinite(actual) || Math.abs(actual / expected - 1) > 0.02) {
        add(errors, 'CAMERA_SCALE',
          `camera scale ${scale.toFixed(2)}: actual distance ${Number.isFinite(actual) ? actual.toFixed(2) : '?'} vs fit/scale ${expected.toFixed(2)} — apply subjectScale after solveDistance`,
          { scale, fit, actual });
      }
    }

    // 0b. Render buffer. A 1.25x post has to report 1.25x the CSS canvas; if it
    // silently stayed at 1x, the screenshot looks soft but nothing else fails.
    const post = d.post;
    const rect = d.renderer?.domElement?.getBoundingClientRect?.();
    const renderScale = Number(post?.renderScale);
    let renderChecked = false;
    if (post?.size && Number.isFinite(renderScale) && renderScale > 0 && rect?.width > 0) {
      renderChecked = true;
      const expected = Math.min(renderScale, (post.maxDim || Infinity) / Math.max(rect.width, rect.height));
      const actual = post.size.x / rect.width;
      if (Math.abs(actual / expected - 1) > 0.02) {
        add(errors, 'RENDER_SCALE',
          `post buffer ${post.size.x}x${post.size.y} is ${actual.toFixed(2)}x CSS ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}; expected ${expected.toFixed(2)}x — check renderScale / maxDim`,
          { renderScale, actual });
      }
    }

    // 1. Flat untextured halo quads. This is the light-grey rectangle bug.
    d.scene.traverse((o) => {
      if (!o.isMesh || !shown(o)) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m || !m.transparent || (m.opacity ?? 1) < 0.01) continue;
        if (m.map || m.alphaMap) continue;
        if ((m.transmission || 0) > 0.01) continue;
        if (o.userData.qaAllowGlow === true) continue;
        const flatTypes = new Set(['PlaneGeometry', 'ShapeGeometry', 'CircleGeometry']);
        if (!flatTypes.has(o.geometry?.type)) continue;
        o.updateWorldMatrix(true, true);
        const bb = new THREE.Box3().setFromObject(o);
        if (bb.isEmpty()) continue;
        const dims = bb.getSize(new THREE.Vector3()).toArray().sort((a, b) => b - a);
        // A glow card is large in two axes and effectively zero in the third.
        if (dims[2] >= 0.08 || dims[0] * dims[1] < flatArea) continue;
        const additive = m.blending === THREE.AdditiveBlending;
        const lowAlpha = (m.opacity ?? 1) <= 0.28;
        if (!additive && !lowAlpha) continue;
        const wp = new THREE.Vector3();
        o.getWorldPosition(wp);
        add(errors, 'FLAT_GLOW',
          `flat untextured ${additive ? 'additive' : 'translucent'} ${o.geometry.type} ${dims[0].toFixed(1)}x${dims[1].toFixed(1)} at ${wp.x.toFixed(2)},${wp.y.toFixed(2)},${wp.z.toFixed(2)} — use a radial-alpha map or remove`,
          { name: o.name || '(unnamed)' });
      }
    });

    // 2. Whole-group material fades. A hero turning see-through is not a fade.
    const groups = [];
    d.scene.traverse((o) => {
      if (o.isGroup) groups.push(o);
    });
    const flagged = new Set();
    for (const g of groups) {
      if (!shown(g) || g.userData.qaAllowFade === true) continue;
      let meshes = 0;
      let faded = 0;
      g.traverse((o) => {
        if (!o.isMesh || o === g || o.visible === false) return;
        meshes++;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const f = mats.some((m) => m && m.transparent && (m.opacity ?? 1) < 0.95 &&
          !m.map && !m.alphaMap && (m.transmission || 0) <= 0.01 &&
          (m.isMeshStandardMaterial === true || m.isMeshLambertMaterial === true || m.isMeshPhongMaterial === true));
        if (f) faded++;
      });
      if (meshes < 6 || faded < 4 || faded / meshes < 0.45) continue;
      let parent = g.parent;
      let covered = false;
      while (parent) { if (flagged.has(parent)) { covered = true; break; } parent = parent.parent; }
      if (covered) continue;
      flagged.add(g);
      add(errors, 'GROUP_FADE',
        `${g.name || '(unnamed group)'}: ${faded}/${meshes} meshes use transparent opacity<0.95 without a texture — whole-object ghosting`,
        { name: g.name || '(unnamed group)' });
    }

    // 3. Mover bounds: no early hide, no teleport.
    for (const spec of audit.movers || []) {
      const g = resolve(spec.group || spec.name);
      if (!g) { add(errors, 'MOVER_MISSING', `mover ${spec.name || '?'} has no group`); continue; }
      const samples = Math.max(2, Math.ceil(loop / step));
      let prevVisible = false;
      let prevCenter = null;
      let everVisible = false;
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * loop;
        freeze(t);
        const vis = shown(g);
        // Box3 still measures an invisible group; that is what lets us prove a
        // hide happened inside the slab instead of after the bounds cleared.
        const box = boxOf(g);
        const center = box ? box.getCenter(new THREE.Vector3()) : null;
        everVisible ||= vis;
        if (prevVisible && !vis && t > 0.3 && t < loop - 0.05 && box && slab) {
          if (!cleared(box, slab, slab.margin ?? 0.35)) {
            add(errors, 'EARLY_HIDE',
              `${spec.name || g.name} disappears at t=${t.toFixed(2)} while its bounds still touch the slab — carry the full run-out`,
              { name: spec.name || g.name, t: +t.toFixed(2) });
          }
        }
        if (!prevVisible && vis && t > 0.1 && t < loop - 0.1 && !spec.allowSpawn && box && slab) {
          if (touchesSlab(box, slab, slab.margin ?? 0.35)) {
            add(errors, 'POP_IN',
              `${spec.name || g.name} appears inside the slab at t=${t.toFixed(2)} — spawn outside or set allowSpawn`,
              { name: spec.name || g.name, t: +t.toFixed(2) });
          }
        }
        if (vis && prevVisible && prevCenter && center && t > step && t < loop - step) {
          const dist = center.distanceTo(prevCenter);
          const limit = (spec.maxSpeed ?? maxSpeed) * step * 1.8;
          if (dist > limit) {
            add(errors, 'TELEPORT',
              `${spec.name || g.name} jumps ${dist.toFixed(2)} m in ${step.toFixed(2)} s at t=${t.toFixed(2)} (limit ${limit.toFixed(2)} m)`,
              { name: spec.name || g.name, t: +t.toFixed(2) });
          }
        }
        prevVisible = vis;
        prevCenter = center || prevCenter;
      }
      if (!everVisible && spec.required !== false) {
        add(warnings, 'NEVER_VISIBLE', `mover ${spec.name || g.name} is never visible in the loop`);
      }
    }

    // 4. Emitter windows and anchor distance.
    for (const spec of audit.emitters || []) {
      if (typeof spec.active !== 'function') continue;
      const samples = Math.max(2, Math.ceil(loop / step));
      const points = resolve(spec.points);
      let lastActive = -Infinity;
      let idleReported = false;
      let missingRun = 0;
      let orphanReported = false;
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * loop;
        freeze(t);
        const active = !!spec.active(t);
        if (active) lastActive = t;
        else missingRun = 0;
        let n = 0;
        let centroid = null;
        if (typeof spec.count === 'function') {
          n = spec.count(t) || 0;
        } else if (points && !shown(points)) {
          n = 0;
        } else if (points?.geometry?.attributes?.aAlpha) {
          const al = points.geometry.attributes.aAlpha;
          const pos = points.geometry.attributes.position;
          let sx = 0, sy = 0, sz = 0, sw = 0;
          for (let k = 0; k < al.count; k++) {
            const a = al.getX(k);
            if (a <= 0.02) continue;
            n++;
            sx += pos.getX(k) * a;
            sy += pos.getY(k) * a;
            sz += pos.getZ(k) * a;
            sw += a;
          }
          if (sw > 0) centroid = new THREE.Vector3(sx / sw, sy / sw, sz / sw);
        } else if (typeof spec.count !== 'function') {
          continue;
        }
        if (typeof spec.centroid === 'function') {
          const c = vec(spec.centroid(t));
          if (c) centroid = c;
        }
        if (active && n === 0) {
          missingRun++;
          if (missingRun === 2) {
            add(errors, 'MISSING_EMITTER',
              `${spec.name || 'emitter'} is active at t=${t.toFixed(2)} but has no live particles — check the bake window`);
          }
        } else if (n > 0) {
          missingRun = 0;
        }
        if (!active && n > 0 && !idleReported && t - lastActive > (spec.tail ?? 1.2)) {
          idleReported = true;
          add(errors, 'IDLE_EMITTER',
            `${spec.name || 'emitter'} has ${n} live puffs at t=${t.toFixed(2)} while its event window is closed — make FX event-driven`,
            { name: spec.name || 'emitter', t: +t.toFixed(2) });
        }
        if (centroid && typeof spec.source !== 'undefined') {
          const raw = typeof spec.source === 'function' ? spec.source(t) : spec.source;
          const src = vec(raw);
          if (src) {
            const dist = centroid.distanceTo(src);
            if (dist > (spec.maxOffset ?? 2.5) && !orphanReported) {
              orphanReported = true;
              add(errors, 'ORPHAN_EMITTER',
                `${spec.name || 'emitter'} puffs are ${dist.toFixed(2)} m from their source at t=${t.toFixed(2)} — anchor at the real nozzle`,
                { name: spec.name || 'emitter', t: +t.toFixed(2) });
            }
          }
        }
      }
    }

    return { loop, errors, warnings, camera: Number.isFinite(fit) && fit > 0 && Number.isFinite(scale) && scale > 0, render: renderChecked, contract: {
      slab,
      movers: (audit.movers || []).length,
      emitters: (audit.emitters || []).length,
      camera: Number.isFinite(fit) && fit > 0 && Number.isFinite(scale) && scale > 0,
      render: renderChecked,
    } };
  },
  { step: STEP, flatArea: FLAT_AREA, loopDefault: LOOP, maxSpeed: MAX_SPEED }
);

if (report.fatal) {
  console.error(`AUDIT FATAL: ${report.fatal}`);
  await browser.close();
  process.exit(1);
}

// 5. Paper-margin scan. A border pixel that is not paper means a read-through
// FX or geometry leaked past the slab window.
const times = report.loop ? [0, report.loop * 0.5, report.loop - 0.15] : [0];
const margin = await page.evaluate(
  ({ loop, ratio, times, slab }) => {
    if (!slab) return { skipped: 'no audit.slab contract' };
    const d = window.__diorama;
    const freeze = d.freeze || d.draw;
    const canvas = d.renderer?.domElement || document.querySelector('canvas');
    if (!canvas || !d.camera) return { skipped: 'no canvas/camera' };
    const camera = d.camera;
    camera.updateMatrixWorld();
    const corners = [];
    for (const x of [slab.x0, slab.x1]) {
      for (const y of [-0.6, 0.6]) {
        for (const z of [slab.z0, slab.z1]) {
          const p = new d.THREE.Vector3(x, y, z).project(camera);
          corners.push({ x: (p.x * 0.5 + 0.5) * canvas.width, y: (-p.y * 0.5 + 0.5) * canvas.height });
        }
      }
    }
    const pad = 6;
    const minX = Math.min(...corners.map((c) => c.x)) - pad;
    const maxX = Math.max(...corners.map((c) => c.x)) + pad;
    const minY = Math.min(...corners.map((c) => c.y)) - pad;
    const maxY = Math.max(...corners.map((c) => c.y)) + pad;

    const out = [];
    for (const t of times) {
      freeze(t);
      const w = canvas.width, h = canvas.height;
      const gl = d.renderer.getContext();
      const pixels = new Uint8Array(w * h * 4);
      // Read in the same task as the render, so it does not depend on
      // preserveDrawingBuffer. Origin is bottom-left.
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let nonPaper = 0, total = 0, lit = 0;
      const at = (x, y) => ((h - 1 - y) * w + x) * 4;
      // Read the paper colour from the frame, not a hard-coded white: the
      // palette paper may be warm, and a hard 245 test would flag all of it.
      const cornerIdx = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
      let pi = cornerIdx[0];
      for (const i of cornerIdx) {
        if (pixels[i] + pixels[i + 1] + pixels[i + 2] > pixels[pi] + pixels[pi + 1] + pixels[pi + 2]) pi = i;
      }
      const paper = [pixels[pi], pixels[pi + 1], pixels[pi + 2]];
      const isPaper = (i) =>
        Math.abs(pixels[i] - paper[0]) <= 6 &&
        Math.abs(pixels[i + 1] - paper[1]) <= 6 &&
        Math.abs(pixels[i + 2] - paper[2]) <= 6;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Only the paper between the projected slab and the frame edge.
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) continue;
          total++;
          const i = at(x, y);
          if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 12) lit++;
          if (!isPaper(i)) nonPaper++;
        }
      }
      out.push({ t: +t.toFixed(2), nonPaper, total, lit, ratio: total ? nonPaper / total : 0 });
    }
    return { samples: out };
  },
  { loop: report.loop, ratio: MARGIN_RATIO, times, slab: report.contract.slab }
);

if (process.env.DEBUG === '1') console.log('margin', JSON.stringify(margin));
const marginChecked = !!margin.samples?.some((s) => s.total > 0);
const errors = [...report.errors];
const warnings = [...report.warnings];
if (margin.skipped) {
  if (report.contract.slab) warnings.push({ kind: 'MARGIN_UNVERIFIED', message: margin.skipped });
  else console.log('note: margin scan skipped (add audit.slab to enable)');
} else {
  for (const s of margin.samples || []) {
    if (s.total === 0) continue; // slab fills the frame; no paper margin to inspect
    if (s.lit === 0) {
      warnings.push({ kind: 'MARGIN_UNVERIFIED', message: `readback black at t=${s.t}` });
      continue;
    }
    if (s.ratio > MARGIN_RATIO) {
      errors.push({
        kind: 'MARGIN_LEAK',
        message: `${s.nonPaper}/${s.total} border pixels are non-paper at t=${s.t} (${(s.ratio * 100).toFixed(2)}%, limit ${(MARGIN_RATIO * 100).toFixed(2)}%)`,
        t: s.t,
      });
    }
  }
}
for (const e of consoleErrors) errors.push({ kind: 'CONSOLE', message: e });

console.log(`audit loop=${report.loop} contract=${JSON.stringify({
  slab: !!report.contract.slab,
  camera: !!report.contract.camera,
  render: !!report.contract.render,
  movers: report.contract.movers,
  emitters: report.contract.emitters,
})}`);
for (const e of errors) console.log(`ERROR ${e.kind}  ${e.message}`);
for (const w of warnings) console.log(`WARN  ${w.kind}  ${w.message}`);
if (!errors.length && !warnings.length) {
  const checks = ['flat halos', 'whole-object fades'];
  if (report.contract.movers) checks.push('early hides/teleports');
  if (report.contract.emitters) checks.push('idle emitters/orphan puffs');
  if (report.contract.camera) checks.push('camera scale');
  if (report.contract.render) checks.push('render scale');
  if (marginChecked) checks.push('margin leaks');
  let suffix = '';
  if (!report.contract.slab) suffix = ' (margin scan skipped: add audit.slab)';
  else if (!marginChecked) suffix = ' (slab fills frame: no margin to scan)';
  console.log(`audit passed: no ${checks.join(', ')}${suffix}`);
}
if (errors.length) console.log(`audit failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
else if (STRICT && warnings.length) console.log(`audit failed (STRICT): ${warnings.length} warning(s)`);
if (errors.length || (STRICT && warnings.length)) process.exitCode = 1;

await browser.close();
