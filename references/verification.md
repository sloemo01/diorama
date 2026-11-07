# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Verification

- **Build first, then shoot, then prove the edit landed.** A failed bundle leaves
  the previous `dist/` in place, and a refused or blocked edit leaves the source
  untouched, so in both cases every screenshot shows the old app and the fix
  looks like it did not land. Read the build's own output line, grep for a
  sentinel string from the change, and only then judge the frame.
- **Non-vacuous, fresh proof (3.18 evidence + test).** Quartz-watch's rounded
  box reported runtime `type: BoxGeometry`; a type-name filter produced zero
  magnet samples and `magnetRadius: 0`, falsely passing clearance. Assert expected
  object counts, nonempty finite sample sets, positive applicable radii and actual
  geometry attributes/topology before measuring; never trust a constructor label
  as shape proof. `templates/mechanism-contract.mjs` assertCoverage and
  `templates/qa/mechanism-contract.test.mjs` cover helper failure detection;
  scene probes must additionally inject an empty/type-mismatched sample set,
  zero radius and a known actual-geometry overlap and reject each. Record fresh
  source/build hash, successful build command, loaded artifact identity, probe
  method, counts, tolerances, worst pair/phase and evidence paths in the report.
  Failures or missing browser/visual/sweep coverage remain FAIL/UNVERIFIED.
  Never infer full mechanical certification from scalar budgets, 26 numerical
  highlight states, screenshots alone or a stale successful report. Evidence:
  historical `quartz-watch/qa/construction-report.json`; no workspace dependency.
- **Judge orientation from the transform, not the pixels.** At diorama scale a
  back and a front read the same: a 4x-downscaled strip once made a
  correctly-facing figure look like he was climbing in backwards, and the
  "spin" it appeared to do was an artefact of re-reading the crop. Print
  `group.rotation.y` and compare it with `atan2(dx, dz)` of the expected facing
  vector before re-shooting a facing fix.
- Screenshot 1280x800, 1388x950 (iPad landscape) and 390x844 (phone). Zero page
  errors in all three, and the framing holds at each aspect.
- Two shots 1.5 s apart differ (the loop is alive) and the camera position is
  identical after resetting the hero pose.
- For pixel only, a 1:1 crop shows square pixels, a dark contour and no speckle on flat deck. Toon uses native-resolution smooth contours; hybrid uses one nearest upscale.
- **Pairwise distance sweep** across every multi-actor beat: freeze in 0.3 s
  steps, log x/z and the pairs under 0.6 m. Held for two samples means jammed.
- **Position logs across every one-shot boundary**: consecutive samples differ by
  centimetres, never by a body length.
- Isolated portraits per figure: no gaps, knees bend backward, nothing floats.
- **Queue gate strip.** Sample a walking customer every 0.15 s across two
  strides; log root speed, `state.moving`, hip/shoulder angles and slot. No
  standing gesture may be non-zero while speed is non-zero; the leg angles must
  alternate; serve must be at least 0.25 s after arrival.
- **Carry contact log.** During every carry beat, print both wrist positions,
  the prop's world bounds and the distance from each palm to the prop. The palms
  stay within 0.08 m until release; the prop does not move more than 0.05 m in one
  frame except during the authored handoff blend.
- **Mount strip.** Nine side frames from load to seat; log wrists, ankles, prop
  base and seat. No boot passes through the bars/seat/body, both soles reach the
  boards, and the rider root follows the seat after departure.
- **Scale check.** The 30%-smaller request is a camera move; assert
  `actualDistance / fitDistance ≈ 1 / subjectScale`, the projected slab width fell
  by the same factor, `post.size ≈ CSS size × renderScale` (capped), the
  slab/world clip/shadow camera and CSS frame are unchanged, and the standalone
  still frames on the page.
- **Night 1:1.** Three distinct dark values, a visible practical with a pool, no
  clipped white, no pure black. For an interior, the glass must not tint the
  room; for a passing bus, the occlusion frame at the hero timestamp must still
  show the hero.
- **Quadruped strip.** Profile, three-quarter, sit and jump. Ears read as ears,
  pupils are vertical, rear hocks bend backward, the tail curves; a rabbit or a
  dog silhouette fails.
- **Exit strip.** For a social actor: contact, turn, walk out, prop in hand. No
  debris or stain unless the scene is a death; the residue is the changed place.
- When a prop never appears, print its world position rather than trusting
  `visible`. `getWorldPosition` on a merge-eaten object returns local coordinates
  because the original was unparented; that is the signature of the merge pass.

### Per-entity frame recording

A still cannot prove a jump. A six-frame strip cannot prove that the third
character in the scene is animating, because the other two are moving in the
same picture. `qa/frames.mjs` records **one dense series per entity**, and prints
a verdict for each, so a dead actor cannot hide behind a live neighbour.

```bash
BASE_URL=http://127.0.0.1:4180/index.html \
ENTITIES='({ hero: d.cast[0].model, guard: d.cast[1].model })' \
FROM=4 TO=9 FPS=12 OUT=qa/frames STATIC=guard \
  node templates/qa/frames.mjs
```

What it does per entity:

- **Isolates it.** `ISOLATE=scene` (default) hides every mesh not on that
  entity's branch, so the signature is really about this actor; `siblings` hides
  the other registry entries only. Restored afterwards.
- **Fits one camera to the swept bounds** and keeps it for the whole window, so
  travel stays visible. A camera that follows the actor hides exactly the drift
  you are looking for.
- **Samples at `FPS`** (12 by default) across `FROM..TO`, and for each frame logs
  the world bounds centre in NDC, plus a 32x32 luminance signature.
- **Scores four ways.** `empty` counts frames where the entity is not on screen,
  `energy` is the largest mean luminance delta between consecutive on-screen
  frames (a flat line means the actor is not animating), `step` is the largest
  NDC jump (a teleport), and `OFFSCREEN` counts frames outside the frustum.
- **Writes a contact sheet** per entity, `qa/frames/<name>/sheet.png`, and the
  numbers to `report.json`. Exit code 1 when anything is flagged, so CI can gate.

Reading it:

| Verdict | Means | What to do |
| --- | --- | --- |
| `ok` | moved, stayed inside, no jump | still read the sheet for pose quality |
| `FROZEN` | energy under `MIN_ENERGY` | the pose blend is not reaching this actor |
| `TELEPORT` | an NDC jump over `MAX_STEP` | a state boundary is snapping, not blending |
| `EMPTY n/N` | not rendered for over half the window | wrong window, or it spawns later than you think |
| `NOT-IN-WINDOW` | never rendered in the window | the entity name is wrong, or it is invisible |
| `OFFSCREEN` | left the frustum | staging, camera fit, or a run that goes too far |

Two rules for the numbers. A blank frame beside a full one must never be allowed
to supply the energy for a window, so only consecutive on-screen pairs are
compared. And an entity that is meant to hold still (a seated figure, a guard at
a post) goes in `STATIC=`, or you will get a `FROZEN` that means nothing.

Run it for every hero actor, and for each scripted beat that involves them:
send-out, attack, hit, death, exit. The sheet is the evidence; the verdict only
tells you which sheet to open first.

### Detail And Animation Audit

Run the subject-applicable rows after the build and before shipping.
Use measured contact plus images; neither alone proves convincing construction.

1. **Grey silhouette.** Hide the palette/post (or desaturate) and shoot the hero
   frame at 1:1. Every tower, creature, landmark and prop must be nameable from
   its outline. If two objects merge, restage.
2. **Hero crops.** One 1:1 crop per tower, one per species, one per landmark, one
   per large prop. Look for: floating parts, untextured primitives, duplicate
   silhouettes, sub-pixel speckle, missing contact shadows.
3. **Threshold crop.** The gate/portal/spawn mouth is empty for 2 m. No smoke,
   crates, rocks, bones or vines. The boss's weapon is visible against the door.
4. **Attack strip.** For each weapon tower: acquire, release, travel, impact,
   recovery. The muzzle/rail/crystal must be visible at release. For a support,
   aura or field: source, area, ramp, affected-target change, decay. A defence
   with zero events is a bug in the sim or the data, not "atmosphere".
5. **Death strip.** For each species: impact, mid-collapse, residue. Debris must
   be species-specific. A grey puff, sphere burst or rock shower fails.
6. **Boss contact.** Contact frame plus 0.2 s later. Contact must show the weapon
   on the goal, the goal's response (flash/crack, spray/gauge drop, sag/snap) and
   the first consequence; +0.2 s must show recoil or follow-through. The haft
   and bands must be visible at contact.
7. **Beam/field on/off.** Full channel, then the frame after the target dies or
   the field expires. No black band, no beam through the keep, no beam on the
   corpse, no field left glowing after its timer.
8. **Crowd strip.** 6 frames at 0.1 s across a group. Actors must not share a
   phase, stack at one waypoint, or walk through each other.
9. **Numbers.** Print `events`, `shots` per tower, `deaths` per species, `maxD`
   per species, loop length and console errors. A species with zero deaths did
   not finish its route; a tower with zero shots never joined the fight.
10. **Rectangle and seam test.** Look at every large translucent plane and every
    slab edge in a 1:1 crop. A hard-edged grey rectangle near a sign is a flat
    quad halo; a step/lip/black slot at the surface is an unfinished edge. Fix
    both before the standalone pass.
11. **Standalone.** Open the built HTML over `file://` once. `ready: true`, no
    console errors, and a frame that matches the served page.

Keep the proof pack: `shots/hero.png`, `shots/tower-*.png`, `shots/death-*.png`,
`shots/boss-contact.png`, `shots/boss-recoil.png`, `shots/beam-off.png`. A future
chat can compare its own pack to these crops.

### New-Chat Handoff

When a different diorama is requested in a fresh chat, the skill should produce
the same level without re-deriving it:

1. Read SKILL.md and its routed references, then fill `templates/DESIGN.md`. Do not load all references.
2. Fill the design sheet before coding: premise, camera side, cast, systems,
   five beats, detail budget.
3. Block out in grey and shoot the five beats at 1:1.
4. Build the pipeline in the order in this file: palette, camera, light, post,
   props, cast, detail pass, animation/systems, effects, QA.
5. Apply the detail bar per hero object and the animation bar per actor.
6. Run the detail and animation audit plus `qa/audit.mjs`, not just "does it
   load".
7. Ship the standalone and leave `DESIGN.md`, `README.md` and the code agreeing.

If the new subject has no combat, replace tower grammar with **Machine Grammar**
(loom, press, crane, oven, pump) and creature grammar with **character grammar**
(customer, worker, animal, vehicle). Audit outputs as fields when there is no
projectile. The five layers and the audit still apply: idle, locomotion, action,
reaction, residue.

### Comment Triage

When the user marks a region, project the object instead of guessing pixels:
`obj.getWorldPosition(v); v.project(camera); px = (v.x*0.5+0.5)*w`.
If it is not obvious, raycast that pixel and read the first few hits' materials and
heights: the first hit is the surface they see, the second is what is under it.
Then fix the marked region and nothing else, and prove it with a zoomed crop at the
same timestamp.

