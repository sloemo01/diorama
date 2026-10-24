import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const minify = process.argv.includes('--minify');

await mkdir('dist', { recursive: true });

await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/app.js',
  minify,
  sourcemap: minify ? false : 'inline',
  legalComments: 'none',
  logLevel: 'info',
});

const js = await readFile('dist/app.js', 'utf8');
const safeJs = js.replace(/<\/script/gi, '<\\/script');

const css = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #ffffff;
  }
  body { -webkit-tap-highlight-color: transparent; }
  #frame {
    position: fixed;
    left: 50%;
    top: 50%;
    width: 64vw;
    height: 64vh;
    transform: translate(-50%, -50%);
    background: #ffffff;
  }
  @media (max-width: 620px) {
    #frame { width: 94vw; height: 94vh; }
  }
  #stage {
    display: block;
    width: 100%;
    height: 100%;
    background: #ffffff;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    outline: none;
  }
  #fallback {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: #ffffff;
    color: #333a3d;
    font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.02em;
    text-align: center;
    padding: 2rem;
  }
  #fallback[hidden] { display: none; }
`;

function page(scriptTag) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="icon" href="data:," />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#ffffff" />
<title>Swimming Pool — a small diorama</title>
<style>${css}</style>
</head>
<body>
<div id="frame"><canvas id="stage" aria-label="A real-time rendered miniature swimming pool diorama" tabindex="-1"></canvas></div>
<div id="fallback" hidden>This diorama needs a browser with WebGL2 enabled.</div>
${scriptTag}
</body>
</html>
`;
}

await writeFile('index.html', page('<script src="./dist/app.js"></script>'));
await writeFile('pool-diorama.html', page(`<script>${safeJs}</script>`));

console.log(`built dist/app.js (${(js.length / 1024).toFixed(0)} kB), index.html, pool-diorama.html`);
