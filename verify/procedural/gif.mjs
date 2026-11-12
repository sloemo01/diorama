/**
 * A looping GIF of one procedural diorama over its whole loop (a time-lapse of
 * the day-night cycle). Every pixel is already a palette entry, so the GIF uses
 * the exact 64-colour palette: no quantisation, no colour drift.
 *
 *   node gif.mjs harbour 3 ../../media/procedural-harbour.gif
 *   node gif.mjs example studio out.gif          (a bundled data example)
 *   FRAMES=120 WIDTH=480 FPS=12 node gif.mjs ...
 */
import { chromium } from 'playwright-core';
import { writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import gifenc from 'gifenc';

const { GIFEncoder } = gifenc;
const [theme = 'harbour', seed = '3', out = 'shots/loop.gif'] = process.argv.slice(2);
const FRAMES = Number(process.env.FRAMES || 120);
const WIDTH = Number(process.env.WIDTH || 480);
const FPS = Number(process.env.FPS || 12);
const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/opt/pw-browsers/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/chromium'].find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: Math.round(WIDTH / 0.64), height: Math.round((WIDTH * 0.68) / 0.64) } });
const q = theme === 'example' ? `example=${seed}` : `seed=${seed}&theme=${theme}`;
await page.goto(pathToFileURL(path.resolve('procedural-diorama.html')).href + '?' + q);
await page.waitForFunction(() => window.__dioramaReady === true);
const info = await page.evaluate(() => window.__diorama.summary);
const palette = await page.evaluate(() => window.__diorama.post.uniforms.uPalette.value.map((v) => [Math.round(v.x * 255), Math.round(v.y * 255), Math.round(v.z * 255)]));
const key = new Map(palette.map((c, i) => [(c[0] << 16) | (c[1] << 8) | c[2], i]));

const gif = GIFEncoder();
let w = 0, h = 0;
for (let f = 0; f < FRAMES; f++) {
  const t = (f / FRAMES) * info.loop;
  const frame = await page.evaluate((tt) => {
    window.__diorama.freeze(tt);
    const src = document.getElementById('stage');
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    return { w: c.width, h: c.height, data: Array.from(g.getImageData(0, 0, c.width, c.height).data) };
  }, t);
  w = frame.w; h = frame.h;
  const idx = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const k = (frame.data[i * 4] << 16) | (frame.data[i * 4 + 1] << 8) | frame.data[i * 4 + 2];
    idx[i] = key.get(k) ?? 0;
  }
  gif.writeFrame(idx, w, h, { palette, delay: Math.round(1000 / FPS) });
}
gif.finish();
writeFileSync(out, gif.bytes());
console.log(`${out}: ${FRAMES} frames ${w}x${h}, loop ${info.loop} s, ${(gif.bytes().length / 1024).toFixed(0)} kB`);
await browser.close();
