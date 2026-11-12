# Reference scope

Load only when routed by SKILL.md. The core profile, intake gates, scale, construction-first and evidence rules take precedence. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Procedural Dioramas (5.8)

A hand-placed diorama is one scene. A procedural one is a function from a seed,
or from data, to a scene. Route here only when the ask is explicitly generative:
"a new village for every seed", "many variations", "build it from this list of
shops / projects / events", or "remix this scene's details". An ordinary "a
village" commission is a hand-built diorama. `templates/procedural/` ships the
generator; `verify/procedural/` is the working harness (tests, clearance audit,
gated captures, a GIF renderer and an interactive demo).

### Intake

- **Look.** Ask the Render Preset Gate as usual. The generator is verified with
  `pixel` only (`templates/post.js` with the procedural 64-entry palette). Its plan
  and part lists are renderer-agnostic, so `stroked-toon` or `pixel-stroke` means
  swapping `build3d.js`'s materials and post pass for that preset's and running that
  preset's own checks; that path is not verified here, so say so in DESIGN.
- **Sourcing.** The generator authors every piece: an explicitly procedural
  commission answers the Model Sourcing Gate as `authored-only`. With `hybrid` or
  `internet-full`, use the plan for layout, roads and cast and replace pieces with
  sourced models that keep the same envelope (re-measure with `clearance.js`); no
  such adapter ships here.
- **Profile.** `narrative`, no educational UI. Free orbit and the hero reset are
  attached by the page (`templates/orbit.js`). The narrative shape maps as: place =
  the generated town; ritual = the errands (deliveries, visits, the cart, a chat);
  interruption = the day-night cycle and weather; consequence = crates left in
  yards, windows lit at dusk.

### Filling templates/DESIGN.md

Record the spec (seed or data file, theme, time, weather, `vary`), the preset and
sourcing answers, `printMap(plan.layout)`, and `summary(plan)`. Every item in
`plan.leftOut` (data the scene does not show, with the reason) goes in the
commission notes. The Occupied space / Non-Penetration section takes the
clearance audit's result: `clear`, `coverageVerified`, samples, the worst pair and
its depth (`npm run audit -- <spec.json>` prints them), plus two hero and night
frames from `npm run shots`. Lot `label`s are kept in the plan for the page around
the scene; nothing on the slab draws text.

### Randomness moves to build time

Look-contract rule 9 still holds: nothing reads `Math.random` or a clock. Every
choice is drawn from `rng(seed, label)`, a stream that is a pure function of the
seed and a subsystem label, so the same seed builds the same diorama byte for
byte and a change in one subsystem does not reshuffle another. The plan is built
once; `stateAt(plan, t)` is pure; every periodic motion uses a period that divides
the loop (`loopFreq`, `loopPeriod`), and the sun's swing is periodic too, so the
frame just before the seam runs into the frame at `t = 0` without a jump.

### Plan first, THREE last

`generate(spec)` returns plain data: a cell grid, lots, roads, part lists in
palette tone names, legs and actions. Test it in node before drawing anything:
`printMap(plan.layout)` shows the layout as text; the Detail Bar counts, palette,
parcels, seam, teleport and clearance checks all run on numbers. Only
`build3d.js`, `mesher.js` and `figure.js` touch THREE.

| Stage | Module | Output |
| --- | --- | --- |
| spec | `generate.js` | theme, time, weather, lot records (at most 14), events (at most 24); invented from the seed when absent |
| terrain | `layout.js` | terraces one step apart rising toward the back corner; one water body; flat shores |
| square | `layout.js` | 7 x 7 plaza with a landmark footprint; a cart just outside the rim |
| lots | `layout.js` | scored candidates (district, doors to square and camera, flat ground), three cells apart |
| roads | `layout.js` | MST over doors, A* with a turn penalty; stairs and bridges; never beside a lot; doors entered only from the front |
| dressing, lamps | `layout.js`, `generate.js` | dressing three cells off any walk (tall trees four), judged by the space its kind reserves; lamps two cells off a straight run |
| grammar | `grammar.js` | ten building styles, four landmarks, props, as part lists; windows on every face (the viewer can orbit to any of them) |
| cast | `cast.js` | residents, visitors, crew; deliver / visit / browse / chat; one beat at a time; legs and actions |
| ambient | `ambient.js` | day-night cycle, weather, birds, smoke, glints, ducks, boats, landmark machines |
| mesh | `mesher.js`, `build3d.js`, `figure.js` | one static mesh, night-glow meshes, figures, instanced particles, `apply(t)` |

### Occupied space is reserved, not repaired

The generator follows the Default occupied-space pass and `action-clearance.md`:

- **Bodies.** A person is legs, feet, torso, head and one arm region that follows
  the gesture (rest, reach, set down, carry, wave), sized from the posed rig with
  `templates/pose-bounds.mjs` (`cast.js BODY`: shoulders 0.32 m, a stride 0.44 m,
  a reach or wave 0.55 to 0.6 m, top 1.82 m) and scaled with each figure.
- **Parcels.** A lot is building + yard strip + apron. Buildings are set back
  0.45 m and 0.3 m clear of the yard; story details go on the left and may lean up
  to 0.2 m off the lot into the band where no road runs. Every style is measured
  against its parcel (`test.mjs`). Lots stand three cells apart.
- **Routes.** Roads never run beside a lot, never through another lot's door cell,
  and enter a door cell only from its front. People keep right (0.36 m lanes) except
  within two cells of a lot, on bridges and on the square.
- **Standing.** Every place someone stands is off the walks: door stands are in
  dead-end door cells, yard stands on the apron, the cart's customer and chat
  partners on the square's rim (not the ring people walk round), residents' home
  spots and crew 1 m or more from every walk's centre line and clear of every piece.
- **Turns.** One person goes out at a time (a beat), the next may set off while the
  last walks home; a chat's two partners share the first beat. At any remaining
  meeting, someone walking waits for someone standing, otherwise the later in the
  cast waits before the leg that brought them there. Never a random nudge, a hidden
  body or a fade of a solid.
- **Crates.** Slots are given once the timing is final: in landing order, ground
  level before the level above, never the front row (a resident lifts from there),
  never wrapping. A crate appears in the hands when it is lifted (growing over
  0.3 s) and delivered crates are cleared at the seam (shrinking over the last
  1.1 s) so the loop closes; both are deliberate.
- **Build-time check.** After scheduling, every person and carried crate is checked
  against every placed piece, the crew and each other. An errand that cannot be
  staged cleanly is left out; a loop that runs long first walks faster (1.15, 1.45,
  1.75 m/s; the stride is distance-driven, so feet never skate). Loops run 36 to
  96 s. Everything left out is in `plan.leftOut` with its reason.

**Acceptance is the kit's own checker.** `clearance.js auditPlan(plan, THREE,
createActionClearance)` registers an envelope per placed piece (a vertical capsule
for round pieces, an OBB otherwise, from the vertices the mesher draws), the five
body regions per person, an OBB per crate, an independent `requiredIds`
inventory named from the plan's own lists, and scoped contacts, each limited to its pair and to the windows of the
errands it belongs to: a person's own joints; a crate in its own carrier's hands; a
crate lifted off the cart; a hand knocking on the door it visits or resting on the
cart; hands reaching over a stack. It samples the whole loop at 10 Hz plus every
leg and action boundary. It is sampled evidence, not continuous proof; envelopes
are conservative, not mesh surfaces. Run it on the seeds or data you ship.

### Data in

Records become lots, events become errands; every encoding is monotonic and
capped. Because one person goes out at a time, one loop stages roughly three to six
errands (at most 96 s); further events are reported in `plan.leftOut` as "loop too long".
For a longer log, give each loop or each scene a window of it.

| Field | Becomes |
| --- | --- |
| `size` | tier: footprint and storeys (< 5, < 20, < 60, 60+) |
| `group` | district: clustered lots, shared roof and cloth tone |
| `stock` | crates in the yard, `round(1.2 sqrt(n))`, capped by the yard |
| `alerts` | red pennants on the lot's pole, `ceil(log2(n + 1))`, at most 3 |
| `progress` | banner height on the pole (0..1 or a percent) |
| `active` / `lit` | chimney smoke / windows lit before dusk |
| `label` | kept in the plan for the page; not drawn |
| event `deliver` | carry a crate (own yard, the cart, or in over the slab edge) to the target's yard; it stays until the seam |
| event `visit` / `browse` | knock at a door (the crew waves) / look over the cart |
| event `chat` | not taken from data (a chat needs two partners at one time); reported |

### Varying a diorama without changing its big picture

`templates/procedural/vary.js` makes a hand-made scene variable by seed with no
model or prompt in the loop. Tag what is free (`obj.userData.vary = vary.tree`,
`{ tint: 1 }`, `vary.locked`), capture the original with `makeVariable(root)`,
then `apply({ seed, strength, kinds, keepOut })`. Moves, turns, scales, species
swaps, tone shifts along a palette family ramp and optional details are each
bounded by the rule; untagged objects never change; keep-out zones hold doors and
paths; every variation replays from the original and seed `null` is the original.
For a generated scene the same idea is a second seed: `generate({ seed, theme,
vary })` keeps the layout, roads, lots, dressing places and camera and rerolls
building details, prop shapes, crate colours and outfits; the cast is rescheduled
against the rerolled details (anything a new detail blocks is reported). A
variation is a new scene: rerun its clearance and captures.

### Acceptance

`npm test` in `verify/procedural` (determinism, palette names, Detail Bar counts,
parcels, terraces, loop bounds, wrap and seam continuity, 40 Hz no-teleport sweep,
carried-before-placed crates, weather under the sky ceiling, the data contract,
variation bounds and replay, and the clearance gate with mutation regressions that
must name the offending pair), `npm run audit` (any theme:seed or spec file), then
`npm run shots`: zero console errors, every pixel a palette entry, two freezes of
one `t` identical, the frame just before the seam within 3% of the frame at 0, by
day and by night for each theme. Read the sheet; the numbers only say where to
look.
