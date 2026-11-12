# Procedural harness

A working page for `templates/procedural/`: one seed or one data spec in, one
diorama out, plus the tests and captures that back every claim about it.

```bash
npm install                     # three, esbuild, playwright-core, gifenc
npm test                        # plan checks in node (23 tests, clearance gate included; under a minute)
npm run audit                   # occupied-space audit, gate set, any theme:seed or a spec .json
npm run sweep                   # the audit over every theme (seeds 1..25) and 60 data specs
npm run build                   # dist/app.js, index.html, procedural-diorama.html (standalone, file://)
npm run demo                    # procedural-demo.html: the interactive demo (standalone, file://)
npm run shots                   # frozen captures + gates + shots/sheet.png
node gif.mjs harbour 3 ../../media/procedural-harbour.gif
```

Open `procedural-diorama.html?seed=7&theme=village` (themes: village, harbour,
market, camp; optional `time=cycle|day|dusk|night`, `weather=clear|rain|snow|petals|leaves|fireflies`,
`t=` to freeze). `?example=studio` loads the bundled data spec in
`examples/studio.json`; `#spec=<base64url JSON>` loads any spec. Keys, since the
paper carries no UI: N / P seed, T theme, W weather, D time of day, Space pause.
Drag to orbit; with the canvas focused, arrows orbit and R resets the hero view.

`window.__diorama` exposes `{THREE, scene, camera, renderer, post, plan, summary,
entities, freeze(t), play(), stateAt(t), regenerate(spec)}` for the kit's QA
scripts (`templates/qa/frames.mjs` reads `entities`).

## The demo

`procedural-demo.html` (built by `npm run demo`, not committed) is a standalone
page that opens straight from disk with a control panel beside the paper: the four themes, a
scene built from `examples/studio.json`, seed stepping and dice, time of day,
weather, and a timeline with play, pause, scrub and 1x / 3x / 8x speed. The
"Hand-made: corner bakery" scene (`src/authored.js`) is a normal, hand-placed
diorama with variation rules; the Variation panel steps a variation seed, sets
strength and toggles placement, shapes, colours and details. On a generated
scene the same panel rerolls details and keeps the layout.
`shots/bakery-variations.png` shows the original and three variations. Rebuild
it with `npm run demo` (source: `src/demo.js`, `build-demo.mjs`).

## What the gates check

`shots.mjs` fails on any console or page error, any pixel that is not a palette
entry, two freezes of the same `t` that differ, a frame 1/30 s before the seam
that differs from `t = 0` by more than 3% of its pixels, or a frame with almost
nothing drawn. The last run passed all
ten captures (`shots/report.json`): four themes by day and by night, and the data
example.

`test.mjs` checks the plan without a browser: determinism, palette names, the
Detail Bar counts, non-overlapping flat lots with doors on the road network,
terraces one step apart, loop bounds and seam, a 40 Hz no-teleport sweep over
every loop, crates carried before they land, weather and birds under the sky
ceiling, the data contract (no event lost silently), variation bounds and replay,
a grep for clocks, `Math.random` and colour literals, parcels and reserved dressing
sizes, and the occupied-space gate: `templates/action-clearance.mjs` over every plan
of the gate set, plus mutation regressions that must name the offending pair.
`audit.mjs` takes theme:seed pairs or spec files (`npm run audit -- my-town.json`). The demo is a development tool beside the paper, not
a delivery pattern: a delivered narrative scene keeps the paper empty.

## Calibrated here

Slab 24 x 16 m (22 x 16 for market and camp), 0.5 m cells, 0.32 m terraces,
walking speed 1.15 m/s (1.45 or 1.75 when a loop runs long), keep-right lanes
0.36 m away from lots, personal space 0.7 m (more while walking), standing spots
1 m off the walks, lots three cells apart, `CAMERA.fillX/fillY` 0.9, loop 36 to
96 s. Captures use
SwiftShader (`--use-angle=swiftshader`) so they reproduce on a machine without
a GPU.
