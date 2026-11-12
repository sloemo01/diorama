# Procedural dioramas

A seed, or a list of records, in; a whole diorama out: terraced terrain with a
river, coast, pond or lake, a square with a landmark, lots and buildings, roads
with stairs and bridges, trees and props, a cast with errands, and ambient life
(day-night cycle, weather, birds, smoke, ducks, boats, windmill sails, a
lighthouse beam, a fountain, a campfire). It keeps the classic `pixel` look
contract (64-colour palette snap, clipped slab edge, empty paper, everything a
pure function of `t`) and reserves occupied space, checked with the kit's own
clearance audit. The routed guide is `references/procedural.md`.

**Copying it into a project.** Copy this folder as `procedural/` next to copies of
`geometry.js`, `detail.js` and `action-clearance.mjs` (the modules import them as
`../geometry.js`, `../detail.js`, `../action-clearance.mjs`), with `camera.js`,
`orbit.js` and `post.js` wherever the page keeps them. For example
`src/scene/procedural/` beside `src/scene/geometry.js`, `src/scene/detail.js` and
`src/scene/action-clearance.mjs`. `verify/procedural/` imports straight from
`templates/`.

```js
// a page module next to the copied files
import * as THREE from 'three';
import { generate, stateAt, summary, printMap } from './procedural/generate.js';
import { buildDiorama } from './procedural/build3d.js';
import { PALETTE_RGB } from './procedural/palette.js';
import { disposeShared } from './procedural/mesher.js';
import { CAMERA, createCamera } from './camera.js';
import { createDioramaOrbit } from './orbit.js';
import { PixelPost } from './post.js';

const plan = generate({ seed: 'harbour-7', theme: 'harbour' }); // pure data
console.log(printMap(plan.layout));                              // look before you render
const d = buildDiorama(plan);                                    // THREE
scene.add(d.group);
const camera = createCamera(aspect, d.fit);                      // templates/camera.js (hero pose)
const orbit = createDioramaOrbit(camera, canvas, { target: CAMERA.target }); // templates/orbit.js
const post = new PixelPost(renderer, 2000, 1, PALETTE_RGB);      // templates/post.js
renderer.localClippingEnabled = true;                            // the slab-edge clip planes
d.apply(t); post.render(scene, camera);                          // any t, any order
// rebuilding (a new seed): scene.remove(d.group); d.dispose(); disposeShared();
```

`verify/procedural/` is the working harness: build, tests, clearance audit,
frozen captures, a GIF renderer and an interactive demo.

| Module | THREE? | What it is |
| --- | --- | --- |
| `rng.js` | no | seeded streams, value noise, loop-closing frequencies |
| `palette.js` | no | the named 64-entry palette and tone families |
| `themes.js` | no | the four themes and size tiers, as data |
| `layout.js` | no | grid, terrain, parcels, roads, walks, scatter, lamps, `printMap` |
| `grammar.js` | no | buildings, landmarks and props as part lists |
| `cast.js` | no | looks, errands, schedule, crossing priority, build-time clearance, `castAt` |
| `ambient.js` | no | sky, weather, birds, smoke, water, landmark machines |
| `generate.js` | no | `generate(spec)`, `stateAt(plan, t)`, `summary` |
| `boxes.js`, `clearance.js` | no (THREE injected) | piece envelopes; `auditPlan` on `templates/action-clearance.mjs` |
| `vary.js` | no (works on THREE objects you hand it) | seeded variation of a hand-made scene |
| `mesher.js`, `figure.js`, `build3d.js` | yes | parts to meshes, the cast's figures and poses, `buildDiorama(plan).apply(t)` |

## Pipeline

| Stage | Module | Output |
| --- | --- | --- |
| spec | `generate.js` `normalizeSpec` | theme, time, weather, lot records, events (invented from the seed when absent) |
| terrain | `layout.js` `buildTerrain` | grid of cells: terrace level (neighbours differ by at most one), water |
| square | `layout.js` | 7 x 7 plaza, landmark footprint, cart on the camera side |
| lots | `layout.js` `placeLots` | scored candidates: near the group's district, doors facing the square and the camera, flat ground; never overlapping |
| roads | `layout.js` `buildRoads` | MST over doors, A* with a turn penalty (straight runs), stairs on terraces, bridges over water |
| scatter | `layout.js`, `generate.js` | Poisson-spaced dressing three cells off any walk (tall trees four); lamps beside straight runs; dressing that touches a placed piece is left out |
| grammar | `grammar.js` | every building, landmark and prop as a part list in palette tone names |
| cast | `cast.js` | residents, visitors, crew; legs and actions; crossing priority; build-time clearance; loop length |
| ambient | `ambient.js` | sky, weather, birds, smoke, glints, ducks, boats, machines: closed forms in t |
| mesh | `mesher.js` `build3d.js` `figure.js` | one static mesh, glow meshes, figures, instanced particles, `apply(t)` |

Streams are forked by label (`rng(seed, 'lots')`), so changing one subsystem
does not reshuffle another.

## Occupied space

People, carried crates and pieces never share space (the Default occupied-space
pass; `references/procedural.md` has the full account). Bodies are five regions
sized from the posed rig and scaled per figure. Parcels set every building back
from its apron and clear of its yard; lots stand three cells apart; roads never run
beside a lot, never through another lot's door cell, and enter a door cell only
from the front; everyone stands off the walks; one person goes out at a time.
Slots are given in landing order. A build-time check leaves out any errand that
cannot be staged cleanly; everything the scene does not show is in `plan.leftOut`
with its reason; long loops first walk faster (`plan.speed`).

```js
import * as THREE from 'three';
import { createActionClearance } from './action-clearance.mjs';
import { auditPlan } from './procedural/clearance.js';
const r = auditPlan(plan, THREE, createActionClearance);   // sampled, independent inventory
if (!r.clear || !r.coverageVerified) console.table(r.worstCases);
```

## Themes

`village` (river, windmill), `harbour` (coast, lighthouse, boats), `market`
(pond, fountain, stalls), `camp` (lake, campfire, tents, pines). A theme is a
data entry in `themes.js`: water body, hilliness, ground and road tones, the
styles and scatter it allows with weights, the landmark, hats, weather odds.
Add a theme by adding an entry.

Building styles: cottage, barn, shed, tower, boathouse, warehouse, shop, stall,
tent, cabin. Each one has walls and roof, construction (posts, trims, frames,
steps, ridge caps, tile rows) and a seeded story detail; windows on every face (the
viewer can orbit to any of them).

## Data in, diorama out

```js
generate({
  seed: 'studio', theme: 'harbour',
  lots: [{ id: 'atlas', group: 'tools', size: 84, stock: 46, alerts: 1, progress: 0.72, active: true }, ...],
  events: [{ actor: 'ana', home: 'atlas', verb: 'deliver', target: 'reef' }, ...],
});
```

| Field | Becomes |
| --- | --- |
| `size` | tier: footprint and storeys (< 5, < 20, < 60, 60+) |
| `group` | district: clustered lots, shared roof and cloth tone |
| `stock` | crates in the yard, `round(1.2 sqrt(n))`, capped by the yard |
| `alerts` | red pennants on the lot's pole, `ceil(log2(n + 1))`, at most 3 |
| `progress` | banner height on the pole (0..1 or a percent) |
| `active` / `lit` | chimney smoke / windows lit before dusk |
| `style`, `crew`, `storeys` | overrides |
| event `deliver` | carry a crate (own yard, the cart, or in over the slab edge) to the target's yard; it stays until the seam |
| event `visit` / `browse` | knock at a door (the crew waves) / look over the cart |
| event `chat` | not taken from data (a chat needs two partners at one time); reported in `leftOut` |

One person goes out at a time, so one loop (at most 96 s) stages roughly three to
six errands; the rest, duplicate lot ids, unknown verbs and unknown targets are
reported in `plan.leftOut`. For a longer log, give each loop or scene a window of it.

An event without a `home` lot is a visitor who walks on over the slab edge and
leaves the same way (cut by the clip planes).

## Varying a diorama without changing the big picture

Two mechanisms, one idea: a second seed that only touches details.

**A hand-made diorama** (`vary.js`). Tag what the author leaves free, capture
the original once, then apply any variation seed. Untagged objects never move,
every change is bounded by its rule, `keepOut` zones keep doors and paths clear (a
zone tests the object's origin, so size zones by the object's reach),
and every variation replays from the captured original (seed `null` or strength
0 is the original, exactly). No model or prompt is involved: one seed in, the
same variant out every time.

```js
import { vary, makeVariable } from './procedural/vary.js';
import { partsGroup } from './procedural/mesher.js';   // per-tone materials, so colours can vary

tree.userData.vary   = vary.tree;              // turn, slide, scale, swap species (children are alternatives)
crates.userData.vary = vary.crate;             // shift a hand's width, sometimes absent
bakery.userData.vary = { tint: 1 };            // one step along its tone ramp, never moved
well.userData.vary   = vary.locked;            // never changes, nor anything inside it

const v = makeVariable(sceneRoot);
v.apply({ seed: 42, strength: 0.8, kinds: ['place', 'shape', 'colour', 'detail'], keepOut: [{ x, z, r }] });
v.apply({ seed: null });                       // the original
```

| Rule field | Bound |
| --- | --- |
| `move` | metres an object may slide in x/z |
| `turn` | radians of yaw |
| `scale` | fraction of size |
| `tint` | steps along the tone's family ramp (`FAMILIES` in palette.js), or `'any'` within the family: a roof stays a roof |
| `keep` | probability an optional detail stays |
| `pick` | children are alternatives; the first is the authored one |
| `lock` | never varies, nor do its descendants |

Every number is drawn whatever the toggles, so switching one kind off never
changes another. `variationFor(rule, seed, id)` is the pure core (tested in
node); `apply` returns a report (what changed, the largest slide).

**A generated diorama** (`generate({ ..., vary: 9 })`). The layout, roads, lots,
dressing places and camera come from `seed`; building details, prop shapes, crate
colours and outfits come from `seed~vary`. Same town, new details. The cast is
rescheduled against the rerolled details, so an errand a new detail blocks is left
out and reported.

## Rules the generator keeps (and the tests prove)

- Same spec, same plan; nothing reads a clock or `Math.random`.
- Every part samples a palette tone by name; no colour literal outside `palette.js`.
- Buildings and landmarks have at least 8 assemblies; props at least 3.
- Lots never overlap and sit flat; every door is on the road network.
- The loop is 36 to 96 s; `stateAt` wraps exactly; the frame just before the seam
  runs into `t = 0` (people, sun, weather, birds); no one moves more than the plan's
  walking pace between 40 Hz samples.
- No person, carried crate or piece overlaps another in the clearance audit: seeds
  1 to 3 of every theme and the data example in `npm test`, and 160 of 160
  plans in `npm run sweep` (seeds 1 to 25 of every theme and 60 data specs with
  repeated actors and targets). Audit the specs you ship
  (`npm run audit -- my-town.json`). The same predicate names the
  offending pair when a crew member is moved into a house, two people are put in
  one place, a crate is pushed into a building, two buildings overlap, or a knock
  goes past its 0.3 m allowance.
- Every building style stays out of its yard and behind its front (details lean at
  most 0.2 m off the lot); every dressing roll stays inside the
  space its kind reserves.
- Everything from the spec the scene does not show is in `plan.leftOut` with a reason.
- Every periodic motion uses a period that divides the loop (`loopFreq`, `loopPeriod`).
- Weather and birds stay under `skyCeiling(x, z)`, the height at which a point
  would rise past the slab's silhouette onto the paper.
