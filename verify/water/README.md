# Water harness

A working scene for `water.js`, `wake.js` and `splash.js`, and a worked example
of the QA loop. No story, no cast: two swimmers crossing a pool on a sine, a
timed splash, and the post pass.

```bash
npm i three esbuild playwright-core     # or link a project that already has them
node build.mjs                          # dist/app.js + index.html
python3 -m http.server 4181 &
BASE_URL=http://127.0.0.1:4181/index.html QA_DIR=shots SHOTS="1.75:splash" \
  node ../../templates/qa/shoot.mjs     # copy the qa folder into the root first
```

## What the verification found

- `water.js` is sound: the vertex ramp reads as depth provided the pool's shallow
  to deep axis matches the plane's local X, and the basin under it is dark. A deck
  box spanning the whole slab puts beige under the water and the surface reads as
  a stain, which is a scene bug, not an effect bug.
- `wake.js` works; rings are pooled and one `spawn` tick is shared by every
  swimmer, so more than four bodies will exhaust the ring pool.
- `splash.js` used `Math.random` in `trigger`, so two identical frames never
  matched. It now takes a `burstSeed`. Both effects also gained `reset()`: they
  integrate `dt`, so freezing the clock does not reset them, and a frozen frame
  showed the last played state. Re-simulating from zero in fixed steps took a
  two-frame diff from 334 differing pixels to 18.
