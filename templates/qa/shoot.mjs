import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

/**
 * Screenshot the play at named timestamps across the viewports that matter.
 *
 *   BASE_URL   default http://127.0.0.1:4180/index.html
 *   QA_DIR     default ./qa
 *   SHOTS      "3.2:exit,9.0:mid,24.4:getin"      (t:name pairs, comma separated)
 *   VIEWPORTS  '[{"w":1280,"h":800,"tag":"wide"}, ...]'
 *
 * Requires the page to expose window.__diorama with freeze(t), and to set
 * window.__dioramaReady = true (or the older window.__ready) once the first
 * frame has drawn. Without the freeze hook every screenshot is a race and a
 * screenshot stops being evidence.
 *
 * Prints one line per viewport: buffer size, css size, camera position, draw
 * calls, triangles, and any page errors. "no console errors" is the only
 * acceptable result, and this line is the proof of it.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const QA_DIR = process.env.QA_DIR || 'qa';
const SHOTS = process.env.SHOTS || '2.0:frame';
const VIEWPORTS = JSON.parse(
  process.env.VIEWPORTS ||
    '[{"w":1280,"h":800,"tag":"wide"},{"w":1388,"h":950,"tag":"ipad"},{"w":390,"h":844,"tag":"phone"}]'
);

const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const shots = SHOTS.split(',')
  .map((s) => s.split(':'))
  .map(([t, name]) => ({ t: parseFloat(t), name: name || `t${t}` }))
  .filter((s) => Number.isFinite(s.t));

mkdirSync(QA_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});

let failed = false;
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.waitForFunction(
    () => window.__dioramaReady === true || window.__ready === true,
    null,
    { timeout: 30000 }
  );

  for (const s of shots) {
    await page.evaluate((t) => {
      const d = window.__diorama;
      (d.freeze || d.draw)(t);
    }, s.t);
    await page.waitForTimeout(140);
    await page.screenshot({ path: `${QA_DIR}/${vp.tag}-${s.name}.png` });
  }

  const info = await page.evaluate(() => {
    const d = window.__diorama;
    const canvas = d.renderer.domElement;
    const size = d.post?.size || { x: canvas.width, y: canvas.height };
    const rect = canvas.getBoundingClientRect();
    const c = d.camera.position;
    return {
      buffer: `${size.x},${size.y}`,
      css: `${Math.round(rect.width)},${Math.round(rect.height)}`,
      cam: [c.x, c.y, c.z].map((n) => n.toFixed(2)).join(','),
      calls: d.renderer.info.render.calls,
      tris: d.renderer.info.render.triangles,
    };
  });

  console.log(
    `[${vp.tag}] buffer=${info.buffer} css=${info.css} cam=${info.cam} calls=${info.calls} tris=${info.tris} ` +
      (errors.length ? `ERRORS: ${errors.join(' | ')}` : 'no console errors')
  );
  if (errors.length) failed = true;
  await page.close();
}

await browser.close();
if (failed) process.exitCode = 1;
