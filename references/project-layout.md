# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Project Layout

```
DESIGN.md              filled design sheet: premise, cast, systems, beats, budget
CREDITS.md             every imported model: URL, author, licence (CC0/CC-BY/owned)
refs/                  reference frames: contact sheets stepped from the source clip
refs/SOURCES.md        research log: query -> found -> decision, per question
src/
  config.js            scene constants + clamp/lerp/smooth/pulse/hash
  main.js              renderer, scene, clip planes, resize, rAF, ?t= freeze
  core/
    palette.js         N entries + named C map
    post.js            PixelPost: gamma, grade, ink, dither, snap, rim (pixel only)
    stroked-toon.js    optional approved OutlineEffect + four-step toon materials
    materials.js       every material, palette-validated
    geometry.js        roundedBox, addBox, lathe helpers
    mechanism-contract.mjs  shared anchors, coverage/end-plane budgets + scoped contact policy
    inspection.js      rigid assembly/piece emphasis, reveal authorization, exact restoration
  ui/
    education-dock.mjs education-dock.css  dependency-free single lesson surface
    merge.js           mergeSiblingMeshes: one draw per material per group
  scene/
    camera.js  lighting.js  street.js  bank.js  props.js
    car.js             shell, doors, boot, seats, cargo
    peopleModel.js     base rig (swimwear/aquatic)
    peopleModel-street.js  clothed rig: heads, layers, hats, hands
    people.js          the cast: poses, walk/run, tracks, buildCast
    stage.js           the beat sheet + every actor as a function of t
    effects.js         contact shadows, smoke, spill, siren
build.mjs              esbuild bundle, index.html, standalone HTML
qa/
  shoot.mjs            viewports + console errors + named timestamps
  inspection.test.mjs  helper state/identity/ownership and injected failure regressions
  inspection-browser.mjs  synthetic contrast/depth/restoration fixture, three presets
  probe-*.mjs          one-off numeric probes (facing, anchors, NaN, spawn pose)
  audit.mjs            scene lint: halos, fades, camera/render scale, exits, FX
  portrait.mjs         isolated figure/framing shots through a debug camera
  strip.mjs            N-frame motion strips (fails on a frozen loop)
  probe.py             colour runs across an edge
  sweep.mjs            pairwise distances + jam/teleport verdict
  tile.py              tile a motion strip
  README.md            audit contract, commands, failure table
```

Wire order in `main.js`: renderer → scene → camera → post → clip planes → lights →
materials → street/bank/props → cars → cast → effects → merge → stage. Merge once,
before the stage is created, so the timeline binds to the surviving meshes.

A defence or arena subject replaces `street/bank/car` with `path/towers/keep`:

```
src/scene/
  path.js          route samples, arc length, at(d), ground height
  towers.js        foundations, machines, crew, recoil pivots
  monsters.js      rig, poses, walk/fly/hop, boss club
  keep.js          gate, walls, door leaves, cracks, goal response
  roster.js        species stats and wave table
  battle.js        deterministic 40 Hz sim, shots, impacts, deaths, gate hits
  props.js         camp, skull tree, cart, torches, trees, portal dressing
  effects.js       beams, projectiles, dust, smoke, shards, rings, souls
```

The same wire order applies: build the set, then the cast, then effects, then
merge once before the battle timeline reads the survivors.

When the beat sheet moves into its own module, delete the superseded director and
update the README's beat table in the same pass. An unreferenced six-hundred-line
timeline and a table that disagrees with the code are exactly what the next reader
trusts.

`templates/` carries runnable copies, not excerpts. Foundations: `post.js`,
`palette.js`, `camera.js`, `lighting.js`, `geometry.js`, `build.mjs`. Cast and
motion: `peopleModel.js`, `peopleModel-street.js`, `poses.js` (the pose library,
including the four climb poses and the walk/run cycles), `transfer.js` (seating,
the climb, stand spots, facing), `track.js` (arc-length paths with lane offsets
and smoothed ground height), `stage.js` (beat table, `keysAt`, `place`, the
actor loop, a car state machine). Props and systems: `detail.js` for prop
assemblies (including `haloPlane`/`softDiscTexture` for soft light cards),
`combat.js` for deterministic timing and death grammar, `creature.js` for a
fight between two rigged actors (stage-local `aimYaw`, bone-space `headAnchor`,
`uprightQuat`, the `makeHurtModel` severity table and `sendOut` throw-and-return
geometry). Effects: `water.js`, `wake.js`, `splash.js`. Sheets: `DESIGN.md`,
`CREDITS.md`, `SOURCES.md` (the research log, filled before the first mesh).

`stage.js` ships as a **skeleton with one worked actor chain**: a figure leaves a
car, walks a route, comes back and climbs in. It is deliberately not a story. The
structure it does ship is the part that is tedious and easy to get wrong: beats
ordered monotonically in `t`, one branch per actor per frame, the contact shadow
following `place()`, and the door as a timeline rather than a state. Replace the
cast, the routes and the beat table; keep the skeleton.

`car.js` is still not in the kit. A vehicle is the most subject-specific prop in
the scene, and the recipe (dimensions, door pivots, windscreen versus seat, boot
well, livery split) is written above at the length it needs. Everything else you
need is a file.

`qa/` is the harness: `shoot.mjs` (viewports, named timestamps, console errors,
the buffer/camera/draw-call line), `audit.mjs` (flat-glow, whole-object fade,
camera/render-scale, early-hide, teleport, idle/orphan emitter and margin checks
against the optional scene contract), `portrait.mjs` (isolated figures through the debug
camera), `strip.mjs` plus `tile.py` (motion strips, which fail on a frozen
loop), `probe.py` (colour runs across an edge, the tool for "why is there a band
here"), and `sweep.mjs` (pairwise distances across a beat, with a two-sample jam
verdict and a teleport limit). They need `playwright-core` and a page that
exposes `window.__diorama` with `freeze(t)`; `verify/water/` is a worked example
that exercises the three water modules and shows what the acceptance output
looks like.

