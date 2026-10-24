import { chromium } from 'playwright-core';

/**
 * Pairwise distance sweep. Freezes the clock in steps across a multi-actor beat
 * and prints every pair closer than THRESH (0.6 m by default).
 *
 * A pair that holds that close for more than one sample is genuinely jammed; a
 * single sample is two actors passing each other. At 12 px a figure, a
 * screenshot cannot tell those apart, and nudging spacing by eye fixes the wrong
 * thing: the usual cause is a route that ends where another actor already stands.
 *
 *   FROM / TO / STEP   window and sampling interval (default 0.3 s)
 *   THRESH             metres
 *   MAX_STEP           metres between samples before a jump is reported
 *                      (default 3.0; a real teleport, not a fast walk)
 *   CAST               JS expression returning the actor list, default
 *                      `window.__diorama.cast`, each entry `{ group }`
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4180/index.html';
const FROM = Number(process.env.FROM || 0);
const TO = Number(process.env.TO || 20);
const STEP = Number(process.env.STEP || 0.3);
const THRESH = Number(process.env.THRESH || 0.6);
const MAX_STEP = Number(process.env.MAX_STEP || 3.0);
const CAST = process.env.CAST || 'window.__diorama.cast';

const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
await page.goto(BASE_URL, { waitUntil: 'load' });
await page.waitForFunction(
  () => window.__dioramaReady === true || window.__ready === true,
  null,
  { timeout: 30000 }
);

const rows = await page.evaluate(
  ({ from, to, step, thresh, maxStep, castExpr }) => {
    const d = window.__diorama;
    const freeze = d.freeze || d.draw;
    const actors = eval(castExpr);
    const out = [];
    let prev = null;
    for (let t = from; t <= to; t += step) {
      freeze(t);
      const p = actors.map((a, i) => {
        const g = a.group ?? a;
        const name = a.name || g.name || `actor${i}`;
        return { i, name, vis: g.visible, x: g.position.x, z: g.position.z };
      });
      const close = [];
      for (let i = 0; i < p.length; i++) {
        for (let j = i + 1; j < p.length; j++) {
          if (!p[i].vis || !p[j].vis) continue;
          const d2 = Math.hypot(p[i].x - p[j].x, p[i].z - p[j].z);
          if (d2 < thresh) close.push(`${p[i].i}-${p[j].i}:${d2.toFixed(2)}`);
        }
      }
      const jumps = [];
      if (prev) {
        for (const a of p) {
          const b = prev.find((q) => q.i === a.i);
          if (!b || !a.vis || !b.vis) continue;
          const dist = Math.hypot(a.x - b.x, a.z - b.z);
          if (dist > maxStep) jumps.push(`${a.name}:${dist.toFixed(2)}m`);
        }
      }
      out.push({ t: +t.toFixed(2), close, jumps });
      prev = p;
    }
    return out;
  },
  { from: FROM, to: TO, step: STEP, thresh: THRESH, maxStep: MAX_STEP, castExpr: CAST }
);

let strikes = 0;
let jammed = false;
let jumped = false;
for (let idx = 0; idx < rows.length; idx++) {
  const r = rows[idx];
  if (r.close.length) {
    strikes++;
    console.log(r.t.toFixed(2), r.close.join(' '));
    const now = new Set(r.close.map((s) => s.split(':')[0]));
    const prev = rows[idx - 1];
    if (prev) {
      const prevPairs = new Set(prev.close.map((s) => s.split(':')[0]));
      for (const pair of now) {
        if (prevPairs.has(pair)) {
          console.log(`  JAMMED pair ${pair} held under ${THRESH} m at ${prev.t} and ${r.t}`);
          jammed = true;
        }
      }
    }
  }
  if (r.jumps.length) {
    jumped = true;
    console.log(`${r.t.toFixed(2)} JUMP ${r.jumps.join(' ')}`);
  }
}
console.log(
  strikes
    ? `\n${strikes} sample(s) under ${THRESH} m. A pair repeating for two or more consecutive samples is jammed.`
    : `no pair under ${THRESH} m across the window`
);
if (jammed) console.log('sweep failed: jammed pair(s)');
if (jumped) console.log(`sweep failed: mover jumped more than ${MAX_STEP} m between samples`);
if (jammed || jumped) process.exitCode = 1;
await browser.close();
