import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

/**
 * Isolated portraits: pull the debug camera close and shoot one subject, so
 * joint gaps, floating parts, a reversed knee or an oversized nose can be seen.
 * At 30 to 45 px on the diorama a figure hides all four.
 *
 *   BASE_URL  QA_DIR  CHROME_PATH as in shoot.mjs
 *   SHOTS     '[{"name":"car","t":4.2,"pos":[1.4,2.2,7.4],"tgt":[-2.2,0.95,2.9]}]'
 *
 * pos/tgt are world coordinates for window.__diorama.view(pos, tgt). Call
 * view() with no arguments to restore the locked three-quarter camera.
 * Accepts either window.__dioramaReady/freeze(t) or __ready/draw(t).
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const QA_DIR = process.env.QA_DIR || 'qa';
const SHOTS = JSON.parse(process.env.SHOTS || '[]');
const W = Number(process.env.W || 900);
const H = Number(process.env.H || 700);

const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

if (!SHOTS.length) {
  console.error('SHOTS is empty: pass a JSON array of {name, t, pos, tgt}');
  process.exit(1);
}

mkdirSync(QA_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE_URL, { waitUntil: 'load' });
await page.waitForFunction(
  () => window.__dioramaReady === true || window.__ready === true,
  null,
  { timeout: 30000 }
);

for (const s of SHOTS) {
  await page.evaluate(
    ({ t, pos, tgt }) => {
      const d = window.__diorama;
      (d.freeze || d.draw)(t);
      d.view(pos, tgt);
      d.post.render(d.scene, d.camera, d.CLIP || []);
    },
    { t: s.t, pos: s.pos, tgt: s.tgt }
  );
  await page.waitForTimeout(140);
  await page.screenshot({ path: `${QA_DIR}/p-${s.name}.png` });
  console.log('shot', s.name);
}

await page.evaluate(() => window.__diorama.view());
console.log(errors.length ? `ERRORS: ${errors.join(' | ')}` : 'no console errors');
if (errors.length) process.exitCode = 1;
await browser.close();
