/**
 * Frozen captures of procedural dioramas, with the gates that matter:
 *   - zero console / page errors
 *   - every pixel is a palette entry (the post pass snapped everything)
 *   - two freezes of the same t are pixel-identical (determinism)
 *   - the frame 1/30 s before the seam differs from t = 0 by under 3% of pixels (it closes)
 *
 *   CHROME_PATH=... node shots.mjs                     # default set
 *   SHOTS="village:7:day@hero,harbour:3:cycle@night,example:studio@hero" node shots.mjs
 *   SHEET=0 skips the contact sheet (shots/sheet.png)
 *
 * Writes shots/<theme>-<seed>-<label>.png and shots/report.json. Exit 1 on any failure.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/opt/pw-browsers/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p));
const PAGE = pathToFileURL(path.resolve('procedural-diorama.html')).href;
const OUT = process.env.OUT || 'shots';
const W = Number(process.env.W || 1200), H = Number(process.env.H || 820);
const DEFAULT = 'village:2:cycle@hero,village:2:cycle@night,harbour:3:cycle@hero,harbour:3:cycle@night,market:2:cycle@hero,market:2:cycle@night,camp:2:cycle@hero,camp:2:cycle@night,example:studio@hero,example:studio@night'; // all in the audit's gate set
const SHOTS = (process.env.SHOTS || DEFAULT).split(',').map((s) => {
  const [cfg, when] = s.split('@');
  const [theme, seed, time = 'cycle', weather] = cfg.split(':');
  return { theme, seed, time, weather, when: when || 'hero' };
});

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

async function grab() {
  return page.evaluate(() => {
    const src = document.getElementById('stage');
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i += 4) { h ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); h = Math.imul(h, 16777619); }
    const pal = new Set(window.__palette);
    let off = 0;
    for (let i = 0; i < d.length; i += 4) if (!pal.has((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])) off++;
    let ink = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) ink++;
    return { hash: h >>> 0, offPalette: off, coverage: ink / (d.length / 4), px: Array.from(d.filter((_, i) => i % 4 === 0)) };
  });
}

const report = [];
let failed = false;
for (const s of SHOTS) {
  const q = s.theme === 'example' ? new URLSearchParams({ example: s.seed }) : new URLSearchParams({ seed: s.seed, theme: s.theme, time: s.time, ...(s.weather ? { weather: s.weather } : {}) });
  await page.goto(`${PAGE}?${q}`);
  await page.waitForFunction(() => window.__dioramaReady === true, null, { timeout: 60000 });
  await page.evaluate(() => {
    window.__palette = window.__diorama.post.uniforms.uPalette.value.map((v) => (Math.round(v.x * 255) << 16) | (Math.round(v.y * 255) << 8) | Math.round(v.z * 255));
  });
  const info = await page.evaluate(() => window.__diorama.summary);
  const t = s.when === 'hero' ? info.heroT : s.when === 'night' ? info.nightT : Number(s.when);
  await page.evaluate((tt) => window.__diorama.freeze(tt), t);
  const a = await grab();
  await page.evaluate(() => window.__diorama.freeze(0.37));
  await page.evaluate((tt) => window.__diorama.freeze(tt), t);
  const b = await grab();
  // Continuity across the seam: the frame 1/30 s before the loop ends against t = 0. (stateAt
  // wraps t, so freeze(loop) would be the same frame as freeze(0) and prove nothing.)
  await page.evaluate(() => window.__diorama.freeze(0));
  const z0 = await grab();
  await page.evaluate((L) => window.__diorama.freeze(L - 1 / 30), info.loop);
  const zL = await grab();
  await page.evaluate((tt) => window.__diorama.freeze(tt), t);
  const name = `${s.theme}-${s.seed}-${s.when}`;
  await page.locator('#stage').screenshot({ path: `${OUT}/${name}.png` });
  const row = { name, t, ...info, offPalette: a.offPalette, coverage: +a.coverage.toFixed(3), deterministic: a.hash === b.hash, seamChange: +(z0.px.reduce((n, v, i) => n + (v !== zL.px[i] ? 1 : 0), 0) / z0.px.length).toFixed(4), errors: errors.splice(0) };
  // A 1/30 s step changes a few pixels (people walk, rain falls); a seam jump repaints the scene.
  const bad = row.offPalette > 0 || !row.deterministic || row.seamChange > 0.03 || row.errors.length || row.coverage < 0.15;
  if (bad) failed = true;
  report.push(row);
  console.log(`${bad ? 'FAIL' : 'ok  '} ${name} t=${t} loop=${info.loop} weather=${info.weather} lots=${info.lots} actors=${info.actors} offPalette=${row.offPalette} coverage=${row.coverage} det=${row.deterministic} seamChange=${row.seamChange}${row.errors.length ? ' errors=' + row.errors.join(' | ') : ''}`);
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

// A contact sheet of every shot, two per row, with the seed under each.
if (process.env.SHEET !== '0' && report.length > 1) {
  const cells = report.map((r) => {
    const b64 = readFileSync(`${OUT}/${r.name}.png`).toString('base64');
    return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${r.theme} · seed ${r.seed} · ${r.weather} · t ${r.t}</figcaption></figure>`;
  }).join('');
  await page.setViewportSize({ width: 1560, height: 600 });
  await page.setContent(`<style>body{margin:0;background:#fff;font:13px ui-monospace,monospace;color:#555}main{display:grid;grid-template-columns:1fr 1fr;gap:0 8px;padding:8px;width:1544px}figure{margin:0}img{width:100%;display:block}figcaption{text-align:center;margin:-18px 0 8px}</style><main>${cells}</main>`);
  await page.locator('main').screenshot({ path: `${OUT}/sheet.png` });
  console.log(`sheet: ${OUT}/sheet.png`);
}
await browser.close();
process.exit(failed ? 1 : 0);
