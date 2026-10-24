# Diorama

A playbook and code kit for building small pixel-art dioramas in Three.js.

A diorama here means a tiny staged scene on a slab: a locked three-quarter camera,
a flat cut-out against white paper, a 64-colour palette with ordered dither and an
inked contour, and toy-scale people with real joint animation. The subject changes
(pool, night market, bakery, harbour, bank job); the slab, the cast and the
presentation stay.

Everything is deterministic. The scene is a pure function of `t`, so any frame can
be frozen, screenshotted and compared.

## Preview

Three scenes built with this playbook. Each tile loops in place; click one to open
the full capture.

<p>
<a href="media/dust-kings.mp4"><img src="media/dust-kings.gif" width="31%" alt="Dust Kings, a Saturday-night arena show diorama, looping"></a>
<a href="media/pool.mp4"><img src="media/pool.gif" width="31%" alt="Swimming pool diorama, swimmers crossing the water, looping"></a>
<a href="media/bank-job.mp4"><img src="media/bank-job.gif" width="31%" alt="Bank job diorama, police cars arriving on the street, looping"></a>
</p>

<sub><b>Dust Kings</b>, 38 s &nbsp;·&nbsp; <b>Pool</b>, 26 s &nbsp;·&nbsp; <b>Bank job</b>, 48 s</sub>

The Dust Kings loop follows one night's billing: cars on the arena floor, the
billboard running through LIVE, NEW RECORD and THANK YOU, and a fire that gets
away from them.

The pool loop is a slow afternoon: one swimmer working laps with a wake trailing
behind, one standing waist-deep by the ladder, one folding into a dive beside the
board, a lifebuoy and a ball left floating, a lifeguard pacing the far edge, and a
sunbather who does not move from the towel.

The bank job loop runs in daylight: a sedan noses into the curb, a group in dark
clothes climbs the bank steps and the windows go red behind them, the sedan pulls
away, two cruisers arrive and officers fan out across the street, and then the
street empties again.

## What is in here

| Path | What it is |
| --- | --- |
| `SKILL.md` | The whole playbook: look contract, detail and animation bars, pipeline, recipes, QA and pitfalls. Start here. |
| `templates/` | Copy-in modules: palette, post pass, camera, lighting, geometry, props, rig, poses, vehicle transfer, paths, combat, water, effects, build script. |
| `templates/DESIGN.md` | The design sheet you fill before modelling. |
| `templates/qa/` | Seven verification scripts that check a build against frozen frames and printed numbers. |
| `verify/water/` | A worked scene that exercises the water modules, with the screenshots the QA loop produced. |
| `verify/climb/` | A unit test for the vehicle transfer maths. |
| `media/` | The preview GIFs and source captures shown above. |

## Start a diorama

1. Read `SKILL.md`: `One Prompt, One Build`, `The Look Contract`, `The Detail Bar`,
   `The Animation Bar`, `Pipeline`.
2. Copy `templates/DESIGN.md` into the project as `DESIGN.md` and fill it. Premise
   as a verb, cast, systems, five beats with timestamps, detail budget.
3. Copy the modules you need into `src/core/` and `src/scene/`, then a `config.js`
   that holds the scene's numbers. `verify/water/src/` is the reference layout.
4. Block out in grey at the locked camera before any production pass, then run the
   pipeline: palette, materials, detail, animation, effects, post.
5. Verify with `templates/qa/` before calling it done.

The QA scripts drive Chromium through `playwright-core` and expect the page to
expose a debug handle:

```js
window.__diorama = {
  THREE, scene, camera, renderer, post,
  freeze(t) { /* draw(t) synchronously */ },
  view(pos, tgt) { /* optional debug camera */ }
};
window.__dioramaReady = true;
```

`freeze(t)` has to draw synchronously. Without it a screenshot is a race, and a
screenshot that may show a different frame than you asked for is not evidence.

`verify/water/` and `verify/climb/` show the full loop end to end.

## Using it as a skill

`SKILL.md` carries skill frontmatter (`name`, `description`, `version`), so a
skill-capable coding agent can load it as-is. It is self-contained: no external
reference documents, everything needed to build a diorama is in the file plus
`templates/`.

## Licence

MIT. See `LICENSE`.
