/**
 * Build the procedural demo: procedural-demo.html, one standalone file that runs
 * from file:// (three.js and the generator inlined). `node build-demo.mjs`
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['src/demo.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/demo.js',
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
  nodePaths: [path.resolve('node_modules')],
});
const js = (await readFile('dist/demo.js', 'utf8')).replace(/<\/script/gi, '<\\/script');

const css = `
  :root { color-scheme: light; --ink: #2a2a33; --muted: #6b6a66; --line: #e6e1d6; --chip: #f6f2e8; --accent: #c4523b; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; background: #fff; color: var(--ink); font: 14px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  body { display: grid; grid-template-columns: 1fr 320px; height: 100vh; }
  #frame { position: relative; min-width: 0; min-height: 0; display: grid; place-items: center; }
  #stage { width: 100%; height: 100%; display: block; image-rendering: pixelated; outline: none; }
  aside { border-left: 1px solid var(--line); padding: 20px 18px; overflow: auto; display: flex; flex-direction: column; gap: 18px; }
  h1 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 0; font-weight: 600; }
  #title { font-size: 20px; font-weight: 650; margin: 2px 0 0; }
  #stats, #clock { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  section > label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; font-weight: 600; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  button { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--chip); color: var(--ink); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
  button:hover { border-color: #cfc6b4; }
  button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
  .row { display: flex; gap: 6px; align-items: center; }
  input[type=text] { font: inherit; width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  input[type=range] { width: 100%; accent-color: var(--accent); }
  kbd { font: 11px ui-monospace, monospace; border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 4px; padding: 0 4px; background: #fff; }
  .hint { color: var(--muted); font-size: 12px; margin-top: auto; }
  .off { opacity: .4; pointer-events: none; }
  .note { color: var(--muted); font-size: 12px; margin-top: 6px; }
  .checks { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; margin-top: 6px; }
  #vary { border: 1px solid var(--line); border-radius: 10px; padding: 12px; background: #fcfaf5; }
  @media (max-width: 820px) { body { grid-template-columns: 1fr; grid-template-rows: 58vh auto; height: auto; } aside { border-left: 0; border-top: 1px solid var(--line); } }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="icon" href="data:," />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Procedural diorama — demo</title>
<style>${css}</style>
</head>
<body>
<div id="frame"><canvas id="stage" aria-label="A procedurally generated pixel-art diorama" tabindex="-1"></canvas></div>
<aside>
  <div><h1>Procedural diorama</h1><div id="title"></div><div id="stats"></div></div>
  <section><label>Theme</label><div class="chips" id="themes"></div>
    <div class="chips" style="margin-top:6px"><button type="button" id="dataBtn" title="Lots and errands from examples/studio.json">Built from data: studio</button>
    <button type="button" id="handBtn" title="A hand-placed diorama whose details can be varied">Hand-made: corner bakery</button></div></section>
  <section id="vary"><label>Variation: same composition, new details</label>
    <div class="row"><button type="button" id="varyPrev">‹</button><input type="text" id="varySeed" placeholder="original" /><button type="button" id="varyNext">›</button><button type="button" id="varyDice" title="Random variation">🎲</button><button type="button" id="original">Original</button></div>
    <div class="handOnly"><div class="row" style="margin-top:8px"><span style="font-size:12px;color:var(--muted);width:64px">Strength</span><input type="range" id="strength" min="0" max="1" step="0.01" value="0.8" /><span id="strengthVal" style="font-size:12px;width:36px">80%</span></div>
      <div class="checks"><label><input type="checkbox" data-kind="place" checked> placement</label><label><input type="checkbox" data-kind="shape" checked> shapes</label><label><input type="checkbox" data-kind="colour" checked> colours</label><label><input type="checkbox" data-kind="detail" checked> details</label></div></div>
    <div class="note genOnly">Keeps the layout, roads, people and errands; rerolls building details, props and outfits.</div>
    <div class="note handOnly">Only objects the author tagged can change, each within its own bounds. Doors and paths stay clear.</div></section>
  <section class="genOnly"><label>Seed</label><div class="row"><button type="button" id="prev">‹</button><input type="text" id="seed" /><button type="button" id="next">›</button><button type="button" id="dice" title="Random seed">🎲</button></div></section>
  <section class="genOnly"><label>Time of day</label><div class="chips" id="times"></div></section>
  <section class="genOnly"><label>Weather <span id="weatherNow" style="font-weight:400"></span></label><div class="chips" id="weathers"></div></section>
  <section><label>Timeline</label>
    <input type="range" id="scrub" min="0" max="60" step="0.01" />
    <div class="row" style="justify-content:space-between"><span id="clock"></span></div>
    <div class="row" style="margin-top:6px"><button type="button" id="play">Pause</button>
      <button type="button" data-speed="1" class="on">1×</button><button type="button" data-speed="3">3×</button><button type="button" data-speed="8">8×</button></div></section>
  <div class="hint"><kbd>Space</kbd> play/pause · <kbd>←</kbd><kbd>→</kbd> seed · <kbd>G</kbd> random seed · <kbd>V</kbd> next variation · <kbd>O</kbd> original · drag the scene to orbit, <kbd>R</kbd> on it resets the view. Every scene is a pure function of its seed and t: the same seed always builds the same place.</div>
</aside>
<script>${js}</script>
</body>
</html>
`;
await writeFile('procedural-demo.html', html);
console.log(`built procedural-demo.html (${(html.length / 1024).toFixed(0)} kB)`);
