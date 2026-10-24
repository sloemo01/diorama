# QA harness

Eight scripts and no framework. The point is that every claim about the build is
checked against a frozen frame, a printed number or a scene-graph rule, never
against a memory of what the code should do.

## Setup

The scripts drive a real Chromium through `playwright-core`, so they need it
installed where Node can find it, plus a page that exposes the debug handle:

```js
window.__diorama = {
  THREE, scene, camera, renderer, post,
  freeze(t) { /* draw(t) synchronously */ },
  view(pos, tgt) { /* optional debug camera */ }
};
window.__dioramaReady = true;   // after the first frame
```

`freeze(t)` must draw synchronously. Without it every screenshot is a race, and
a screenshot that might be showing a different frame than you think is not
evidence. The harness also accepts the older `window.__ready` + `draw(t)` pair.

```bash
npm i -D playwright-core
python3 -m http.server 4180 &          # serve the project root
```

## The eight checks

| Script | Answers | Fails when |
| --- | --- | --- |
| `shoot.mjs` | does it load and frame at three viewports? | any console/page error, or a viewport that writes no frame |
| `audit.mjs` | are the seams, scale, halos, exits and emitters honest? | flat glow quad, whole-object fade, camera/render-scale mismatch, early hide, teleport, idle/orphan emitter, paper-margin leak |
| `portrait.mjs` | is the rig sound up close? | joint gap, floating part, knee bending forward, oversized head |
| `strip.mjs` + `tile.py` | does the motion read over six frames? | a phase pop, a skate, a body through a door, or every frame identical |
| `frames.mjs` | does *each* entity animate, stay in frame, and avoid snapping? | `FROZEN`, `TELEPORT`, `EMPTY`, `NOT-IN-WINDOW` or `OFFSCREEN` on any entity |
| `probe.py` | what colour is on screen, and how thick is that band? | a stray palette entry, a band that should not exist |
| `sweep.mjs` | are two actors jammed, or did one teleport? | the same pair under 0.6 m for two consecutive samples, or a jump over `MAX_STEP` |
| `verify/` | does an effect reproduce after a clock jump? | two identical freezes differ because the effect integrates `dt` |

```bash
BASE_URL=http://127.0.0.1:4180/index.html \
SHOTS="3.2:exit,9.0:mid,24.4:getin" \
node qa/shoot.mjs

BASE_URL=http://127.0.0.1:4180/index.html LOOP=46 \
node qa/audit.mjs

FROM=15.4 TO=16.6 N=8 OUT=qa/strip-exit.png node qa/strip.mjs
python3 qa/tile.py qa/strip-exit.png --crop 420,300,640,450 --zoom 3 qa/frames/f*.png

python3 qa/probe.py qa/wide-edge.png 520 425 560   # colour runs down a column

FROM=20 TO=26 STEP=0.3 node qa/sweep.mjs
```

Every script that can fail sets a nonzero exit code. A green screenshot tour is
not a QA pass if `audit.mjs` or `sweep.mjs` printed a failure.

## The audit contract

`audit.mjs` always runs the graph checks. The paper-margin scan needs the
`slab` rectangle; add the optional contract when the scene has movers, particles
or a visible slab edge. The mechanical checks then cover exits, FX timing and
edge leaks too.

```js
window.__diorama.audit = {
  loop: 46,
  // World-space slab, plus how far outside it counts as clear.
  slab: { x0: -12, x1: 12, z0: -8, z1: 8, margin: 0.35 },

  // Every vehicle, animal or walker that leaves. Bounds are measured from the
  // group, so the whole body/lights/shadow must clear the slab before hiding.
  movers: [
    { name: 'hero', group: hero.group, required: true, allowSpawn: false },
    { name: 'rival', group: rival.group }
  ],

  // One entry per event-driven cloud. `source` is the actual nozzle/tip object,
  // not the engine centre. `active(t)` is the authored event window.
  emitters: [
    {
      name: 'hero-exhaust',
      points: smoke.points,                 // or count(t) / centroid(t)
      source: () => exhaustTip.getWorldPosition(new THREE.Vector3()),
      active: (t) => t > 12.9 && t < 13.8,
      maxOffset: 2.2,                       // puff centroid to source, metres
      tail: 0.8                             // allowed fade-out after the window
    }
  ]
};
```

If the camera exposes `userData.fitDistance` and `userData.subjectScale`,
`audit.mjs` also proves `distance ≈ fitDistance / subjectScale` without a
contract key. That is the 30%-smaller camera move: the set and clip stay full
size, only the camera pulls back. If `post.renderScale` is exposed, it checks
`post.size ≈ CSS size × renderScale` (capped by `maxDim`) too.

`allowSpawn: true` is for a mover that legitimately appears inside the frame
(an actor already seated, a prop revealed by a cutaway). `qaAllowGlow = true`
on a mesh and `qaAllowFade = true` on a group are explicit exemptions; use them
only with a written reason in `DESIGN.md`.

## What "passing" looks like

- `no console errors` at 1280×800, 1388×950 and 390×844, and the camera position
  identical across all three samples of the same viewport (the angle is locked).
- `audit passed` with no `ERROR` lines. Warnings are allowed at the default
  strictness; `STRICT=1` makes them fail too. The margin limit is
  `MARGIN_RATIO=0.0002` (0.02% of the sampled margin).
- Two screenshots 1.5 s apart differ (the loop is alive).
- A 1:1 crop shows square pixels, a dark contour, no speckle on flat deck, no
  flat grey rectangle beside a sign, no step at a slab edge.
- A strip reads as one continuous motion; consecutive positions differ by
  centimetres, never by a body length.
- The sweep prints no jammed pair and no jump over `MAX_STEP`.

## Effects and the frozen clock

Anything that integrates `dt` (wake, splash, smoke) is not a function of `t`
until it is reset and re-simulated. Both effect templates expose `reset()`; the
pattern is:

```js
function simulateTo(t) {
  wake.reset(); splash.reset();
  const dt = 1 / 30;
  for (let s = 0; s < t; s += dt) { /* fire triggers, then step updates */ }
}
```

`verify/water/` is a working example. Two identical freezes there differ by 18
pixels, against 334 before the reset was added.

## Common audit failures and what they mean

| Finding | Usual cause | Fix |
| --- | --- | --- |
| `FLAT_GLOW` | untextured additive plane behind a board/lamp | radial-alpha texture, real lens, or delete |
| `GROUP_FADE` | material opacity applied to a whole vehicle/figure | cut/clip/hide after bounds clear; never fade solids |
| `CAMERA_SCALE` | actual distance is not `fitDistance / subjectScale` | apply `subjectScale` after the fit; do not scale geometry |
| `RENDER_SCALE` | post buffer is not CSS × `renderScale` | pass `renderScale` to `PixelPost`; check `maxDim` and CSS size |
| `EARLY_HIDE` | `visible=false` at the gate or before the bounds clear | carry the full run-out; hide after slab + margin |
| `TELEPORT` | a keyed position jumps between samples | add the missing key or move the cut outside frame |
| `POP_IN` | a mover appears inside the slab | spawn outside, or set `allowSpawn` with a reason |
| `MOVER_MISSING` | the contract names a group that does not exist | fix the name/group reference |
| `MISSING_EMITTER` | the event window is open but the cloud is empty | fix the bake window or the count/points hook |
| `IDLE_EMITTER` | continuous smoke while parked | gate emission by an event window; add a fade tail |
| `ORPHAN_EMITTER` | plume starts at engine centre/cab roof | source at the real exhaust tip/nozzle |
| `MARGIN_LEAK` | read-through FX or geometry past the slab | taper/fade before the edge, or clip the solid |

## Per-entity frames

`strip.mjs` samples the *scene*. `frames.mjs` samples one *entity* at a time, which
is the only way to catch the third character in a shot whose neighbours are
moving, or a prop that drifts while the camera follows an actor.

```bash
ENTITIES='({ hero: d.cast[0].model, guard: d.cast[1].model })' \
FROM=4 TO=9 FPS=12 OUT=qa/frames STATIC=guard \
  node templates/qa/frames.mjs
```

- `ENTITIES` is a JS expression evaluated in the page, returning `{name: Object3D}`.
  The build should expose `window.__diorama.entities` so the default works.
- `VIEW=portrait` (default) fits one camera to the entity's swept bounds, so the
  whole move stays in frame and fills it. `VIEW=scene` keeps the locked camera and
  crops to the entity instead.
- `ISOLATE=scene` hides every mesh that is not on the entity's branch, so the
  motion signature is about that actor alone. `siblings` hides only the other
  registry entries.
- `STATIC=name,name` exempts actors that are supposed to hold still from `FROZEN`
  (they still get the teleport and offscreen checks).

Each entity gets `qa/frames/<name>/f###.png`, a contact sheet, and a row in
`report.json` with `empty`, `energy`, `maxStep` and a verdict. The script exits 1
on any flag, so a build can gate on it. Read the sheets; the numbers only say
which sheet to open first.

