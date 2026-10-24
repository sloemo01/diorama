import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';

/**
 * Motion strip: N evenly spaced frames across a window, cropped to the subject
 * and laid out left to right in one PNG. A still cannot show a bad knee, a foot
 * skating, a figure climbing through a door, or a phase pop at a boundary; six
 * frames in a row usually can.
 *
 *   FROM / TO   window in seconds
 *   N           frame count (default 6)
 *   CROP        "x,y,w,h" in page pixels (default: whole frame)
 *   OUT         output path (default qa/strip.png)
 *   QA_DIR      frame directory (default qa)
 *
 * Then read the strip, not the individual frames.
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const FROM = Number(process.env.FROM || 0);
const TO = Number(process.env.TO || 2);
const N = Number(process.env.N || 6);
const OUT = process.env.OUT || 'qa/strip.png';
const QA_DIR = process.env.QA_DIR || 'qa';
const W = Number(process.env.W || 900);
const H = Number(process.env.H || 700);

const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

mkdirSync(`${QA_DIR}/frames`, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(BASE_URL, { waitUntil: 'load' });
await page.waitForFunction(
  () => window.__dioramaReady === true || window.__ready === true,
  null,
  { timeout: 30000 }
);

const paths = [];
const frames = [];
for (let i = 0; i < N; i++) {
  const t = FROM + ((TO - FROM) * i) / Math.max(1, N - 1);
  await page.evaluate((tt) => {
    const d = window.__diorama;
    (d.freeze || d.draw)(tt);
  }, t);
  await page.waitForTimeout(120);
  const p = `${QA_DIR}/frames/f${String(i).padStart(2, '0')}.png`;
  await page.screenshot({ path: p });
  paths.push(p);
  frames.push(readFileSync(p));
}
await browser.close();

let identical = false;
if (frames.length > 1) {
  const first = frames[0];
  identical = frames.every((b) => b.equals(first));
  if (identical) {
    console.error('strip failed: every frame is byte-identical; the clock or the animation is frozen');
    process.exitCode = 1;
  }
}
console.log(paths.join('\n'));
console.log(`\nmotion: ${frames.length} frame(s), ${identical ? 'IDENTICAL' : 'varying'}`);
console.log(`\nNow tile them:\n  python3 templates/qa/tile.py ${OUT} ${paths.join(' ')}`);
