---
name: diorama
description: Use when building a pixel diorama in Three.js — one-prompt autonomous builds with staged systems, detailed props, real animation, and social/service choreography.
version: 3.6.0
author: Nehal Kanak (sloemo)
license: MIT
platforms: [linux, macos, windows]
---

# Diorama

A diorama is a tiny staged scene on a slab: a locked three-quarter camera, a
flat cut-out against white, a palette-snapped pixel grid with an ink contour, and
toy-scale people with real joint animation. Any subject works (pool, market,
kitchen, bank job, launch pad, aquarium). The slab and the cast stay; the props
change.

**This file is the whole guide.** It carries no external reference documents:
everything needed to build a diorama is here, plus copy-in modules and a design
sheet template in `templates/`.

Read `One Prompt, One Build`, `The Look Contract`, `The Detail Bar`,
`The Animation Bar` and `Pipeline` first. Then read the sections for the systems
you are actually building; the rest is reference. Do not spend the first pass
reading every vehicle or water note for a kitchen scene.

### Fast path by scene

| If the commission is... | Read next, in this order |
| --- | --- |
| market, food truck, bakery, cafe, shop, laundromat | Cast → Clothed Cast: Heads, Layers, Hands → Service And Queue → Machine Grammar → Carrying, Loading And Mounting → Verification |
| heist, defence, combat | Detail Bar → Tool/Tower recipes → System And Combat Animation → Combat Readability → Verification |
| aquarium, pool, harbour | Cast → base rig → Water templates → Vehicles (boat) → Effects → Verification |
| station, airport, hotel, transit | Service And Queue → Vehicles → Crowd Variation → Verification |
| stage, festival, parade | Cast → Secondary Motion → Crowd Variation → System Grammar → Verification |
| farm, garden, nature | Creature Anatomy → Ambient Loops → Effects → Verification |

The universal shape still applies: place + repeated ritual + interruption +
consequence. The fast path only decides which reference notes to read first.

## When to Use

- "Make a small diorama / miniature scene / pixel scene of X"
- A clip or still shows a flat cut-out scene with chunky pixels and little
  people, and the ask is to match that look
- An existing 3D scene needs the pixel-art presentation (palette, dither, ink,
  locked angle) rather than a smooth render
- The figures need believable motion: walking, climbing into a car, sitting,
  swimming, diving, and it has to survive close inspection
- The ask is for a *staged diorama*, not a model: several systems, a cast, a goal or boss,
  and a loop that can be frozen at any second
- The user gives only one line ("a bakery at closing", "a lighthouse under
  siege"); this skill is designed to turn that into a complete commission
  without an interview

Don't use for full-resolution product renders, photoreal scenes, or anything
that needs free orbit controls.

## One Prompt, One Build

When the user gives a subject in one line, treat it as a **commission**, not a
questionnaire. Make the creative decisions, state them in one short assumption
line, and build the whole diorama. Do not stop at a plan, a blockout or a design
sheet and wait for approval.

The only reasons to ask are credentials, a destructive action, or a path that
would overwrite the user's work. Everything else is a default.

### The default commission

Use these unless the prompt explicitly says otherwise:

| Knob | Default |
| --- | --- |
| Slab | 21 x 14 x 0.42 m; 16 x 12 for one room, 24 x 16 for a street, port or launch pad |
| Loop | 46 s at 40 Hz; one readable cycle plus a quiet seam |
| Palette | 64 entries |
| Systems | 4 defences/machines/service stations/attractions; 3 is acceptable, 6 is the ceiling |
| Cast | 4 to 6 roles total, including one disruption; 2 ambient loops |
| Props / landmarks | 2 hero props, 1 landmark, 3 to 6 supporting props |
| Hero detail | every hero object meets the Detail Bar |
| Animation | every hero actor has all five layers |
| Output | `index.html`, `<slug>.html`, `README.md`, `DESIGN.md`, `src/`, `dist/` |
| Path | `<cwd>/<slug>/` unless the user named a folder |
| Minimum viable | 3 systems, 3 roles + 1 disruption, 1 hero prop + 1 landmark, 30 s loop; still passes the bars |

State the assumption in one line before coding:

> Assumption: market archetype, 46 s loop, 4 service systems, 6 roles plus a
> late customer, 21 x 14 slab, 64 colours. Say if you want a different scale or
> genre.

That line is the contract. State it, then continue in the same turn; do not wait
for approval. It gives the user a chance to redirect after seeing the assumption,
without blocking the build.

### Reading the prompt

| Prompt shape | What to do |
| --- | --- |
| one noun ("a bakery") | pick the closest router row; invent the verb, disruption and goal |
| one sentence ("a lighthouse under siege") | take its nouns and verbs literally; fill the missing cast/systems from the router |
| a reference image | match its composition, camera side and palette first; keep this skill's detail/animation bars |
| "like X but Y" | reuse X's structure, replace the subject and the detail anchors; do not copy X's nouns |
| "make it detailed" | use the full Detail Bar and five animation layers; do not add more systems |
| "keep it simple" | cut systems and cast, not detail per hero; two rich objects beat six blockouts |

A prompt that names only a place is still a commission. Decide what the place
does, who arrives, and what goes wrong. State the assumption and build.

### The scene router

Pick the closest row. Do not invent a new genre from scratch unless none fit.

| If the prompt is... | Systems (3–5) | Cast | Goal / disruption | Detail anchor |
| --- | --- | --- | --- | --- |
| defence, siege, castle, base, zombies | 4 towers + gate guns | defenders, 4 species, boss | boss reaches the gate | gatehouse |
| heist, bank, museum, casino | drill, lasers, cameras, getaway | 3 crew, guards, manager | vault opens / escape | vault door |
| market, kitchen, bakery, cafe, food truck, night market | stalls, ovens, prep, pass, dispatch | vendors, cooks, cashier, courier, customers, inspector | closing time / service rush / last bag | counter, hatch or oven |
| laundromat, workshop, gym, repair shop, arcade | washers, dryers, benches, tools, machine slots, ticket rail | folder, attendant, customer, courier, cat | last load / closing / power cut | machine bank or workbench |
| launch, factory, port, mine | gantry, press, crane, conveyor | crew, inspector, cargo | launch / ship / lift | gantry |
| aquarium, pool, harbour, reef | filters, pumps, slides, lights | fish, swimmers, diver, lifeguard | feeding / party / storm | reef or tank |
| station, airport, bus, hotel | signal, platform, desk, luggage | commuters, guard, porter | last departure | clock |
| festival, temple, carnival, funeral | stage, rides, altar, procession | performers, crowd, official | climax / storm | big top or altar |
| farm, garden, safari, nature | irrigation, harvester, weather vane | animals, farmer, crows | harvest / storm | barn |
| home, shop, library, workshop | rooms, counter, shelves, tools | family, clerk, customer, pet | opening / closing | window |
| arena, battle, mech, gladiator | traps, weapons, doors, lifts | fighters, champion, beast | champion enters | gate |

If none fit, use the universal shape: **place + repeated ritual + interruption
+ consequence**. Give it 3 to 5 systems, 4 roles and one goal. A quiet subject
still needs a verb: a library needs a closing, a bakery needs a service, a
lighthouse needs a sweep that fails.

### If the router misses

Do not freeze. Answer four questions about the noun:

1. **What does this place produce or repeat?** Bread, light, trains, fish, money,
   quiet, laundry, coffees.
2. **Who operates it?** Baker, keeper, guard, diver, clerk, mechanic.
3. **What interrupts the output?** A critic, a storm, a thief, a shutdown, a
   delivery, a leak, a closing-time crowd.
4. **What is the visible consequence?** Burnt batch, dark lens, missed train,
   flooded tank, empty till, closed sign.

Those four answers give you the system, cast, goal and residue. Then use the
five beats: **normal output → first interruption → escalation → goal contact →
residue and seam**. No combat required. A deadline, an inspection, a storm or a
closing bell is a valid boss.

Worked one-prompt example:

> "a tiny bakery at closing time"

- Archetype: market/kitchen. Slab 16 x 12. Loop 42 s.
- Systems: oven, proofing rack, counter, till. Cast: baker, apprentice, last
  customer, food inspector (the disruption).
- Goal: the inspector reaches the counter before the last loaf is sold.
- Beats: 0 s oven glow and bread out; 8 s first customer; 16 s inspector at the
  door; 26 s last loaf contested; 34 s sign turns, flour settles, cat sleeps.
- Detail anchors: oven door (hinges, soot, peel), bread rack (trays, crumbs,
  cloth), counter (ledger, bell, worn edge), inspector's clipboard.
- No towers: use machine grammar for the oven and till; field audit for the
  oven's heat; death/exit for the inspector's departure.

### The autonomous pass

1. **Interpret.** Pick the archetype; write the assumption line; fill
   `DESIGN.md` yourself. Do not ask the user to fill it.
2. **Blockout.** Grey slab, camera, five beats at 1:1. No palette, no post, no
   materials. If the beats do not read, restage before adding detail.
3. **Presentation.** Palette, light, post, ink, dither, camera solve.
4. **Set and props.** Landmark, two hero props, supporting dressing. Clear the
   2 m threshold. No duplicate silhouettes.
5. **Cast and detail.** Rig the cast; apply the Detail Bar to every hero object.
   Cut a role before cutting detail per role.
6. **Animation and systems.** Five layers per hero; tower acquire/fire/impact/
   recovery; field ramp/area/affect/decay; machine input/motion/output/residue.
7. **Effects and residue.** Contact shadows, species deaths, dropped gear,
   stains, ambient loops, loop seam.
8. **QA and package.** Detail/animation audit, numbers, 1:1 crops, standalone
   `file://`, README and `DESIGN.md` agreeing.

If time is tight, **cut the number of systems or actors, never the detail per
hero or the animation layers**. Two detailed towers with five layers beat six
blockout towers with one fire animation.

### Efficiency rules

- **One project, one build loop.** Scaffold once, then build, shoot and fix in
  place. Do not rewrite the entry file for a detail that lives in a prop module.
- **Build only what the locked camera sees.** Spend the polygon and part budget
  on the +Z face and the top; simplify the back.
- **Cut systems before detail.** A tight build with two rich towers and five
  animation layers reads better than six thin towers with one recoil.
- **Use the templates.** Camera, post, palette, lighting, the cast rig and the
  detail helpers are already solved; do not re-derive them from prose.
- **Shoot known timestamps.** Freeze at the five beat times and the five QA
  frames; do not scrub for a good frame.
- **Package last, once.** Build the standalone only after the QA frames pass;
  rebuilding it after every tweak wastes the pass.

### One-prompt acceptance

Do not report "done" until all of these are true:

- `DESIGN.md` exists and matches the build.
- Five beats have timestamps and proof frames.
- Every system has events; every actor has a death, exit or residue.
- Each hero has three detail passes and at least one story detail.
- Each hero actor has idle, locomotion, action, reaction and death/exit.
- Every carry, handoff, load and mount has a contact timestamp and a nine-frame
  strip; palms are on the prop and boots are on the vehicle.
- A queue serves after arrival, never before; no standing gesture is blended
  into a walking root.
- No generic sphere burst, floating prop, clipped landmark or beam on a target
  that has already expired.
- No fixed deck prop, ammo store, tool or crew member moves with a turret,
  flywheel or machine pivot.
- Standalone opens over `file://` with zero console errors.
- The final message gives the path, loop length, system/shot counts and the QA
  frames, not a request for feedback.

## Starting A New Diorama

When the subject is new, the first deliverable is a design sheet, not a scene.
With a one-line prompt, fill it from the defaults in `One Prompt, One Build` and
do not ask the user to complete it.

1. Copy `templates/DESIGN.md` into the project as `DESIGN.md`.
2. Write the premise as a verb, not a noun. Name the place, the repeated action,
   who interrupts it, and the payoff.
3. Fill the cast and system sheets. If a role has no action, cut it. If a system
   has no visible consequence, cut it.
4. Pick five beats and five QA timestamps. A beat without a timestamp is not
   staged.
5. Block out in grey at the locked camera and shoot the five beats at 1:1.
   This is a staging check, not a production pass: no palette, no post, no
   materials. Redesign staging before committing to it.
6. Once the blockout reads, run the production pipeline below. Palette is the
   first production pass; the grey blockout does not count as one. Detail
   multiplies a readable blockout; it cannot rescue an unreadable one.

The rest of this file is the recipe for each pass.

## The Look Contract

Ten rules. Break one and it stops reading as a diorama.

1. **Locked angle.** One three-quarter view, no drift, no orbit. Azimuth 45,
   elevation 33, fov 20.5, target just under the slab centre. When the user says
   "this angle", it means this one, for the whole loop.
2. **Flat cut-out.** A slab with no plinth, no soil sides, background null, page
   white. Everything below the deck plane hides in the overhang at 33 degrees.
3. **Palette snap.** Every pixel resolves to one entry of a fixed palette. No
   gradients survive; banding is the material.
4. **Ink contour.** A luminance-neighbour edge mixes toward warm near-black at
   about 0.62, suppressed on the outer rim so figures are not haloed.
5. **Dither only where tones move.** Ordered Bayer gated by local edge contrast.
   Flat decks stay flat; ramps stipple.
6. **Contact shadows, not just cast shadows.** A soft radial patch under every
   figure and prop is what anchors it to the ground at this scale.
7. **People read at 30 to 45 px.** Faces need eyes, brows, nose, mouth, ears.
   Bodies need joint fillers so a bend never opens a wedge.
8. **Clipped edge.** The slab is a window, not a stage: four world-space clip
   planes sit on its edges and anything driving in or out is cut at the
   boundary. Nothing ever floats on the white page outside the block.
9. **Everything is a pure function of `t`.** No integration that carries state
   between frames, no `Math.random`, no drift across the loop.
10. **Empty paper.** The white page carries no DOM title, caption, HUD or
   instructions. Put copy on a modelled sign/screen or in the browser title; a
   label floating on the paper breaks the cut-out.

## The Detail Bar

A blockout with a camera is not a diorama. The difference between a demo and a
diorama is **three passes**, and every hero object has to survive all three.

1. **Silhouette.** At 1:1 the object is recognisable from its outline in about
   0.2 seconds, before colour or detail.
2. **Construction.** The silhouette is explained by visible assemblies: posts,
   rails, bands, plates, wheels, hinges, ropes, fasteners. A single primitive is
   a placeholder, not a prop.
3. **Story.** One detail tells you who used it and what happened: a chipped edge,
   a trophy skull, a repair strap, a spare bolt, a rag, a tally mark, a spent
   shell. If the detail could be removed without changing the read, it is
   greeble, not story.

The numbers below are **reference density** from The Hollow Toll, a 21 x 14 m
slab with four towers, two gate guns, five species, 42 units, one boss, 527
events and 183 shots. Treat them as a calibration target, not a cap.

| Element | Minimum visible assemblies | Hero target | Required story detail |
| --- | --- | --- | --- |
| Tower | 6 | 25 to 45 parts | crew, ammo, livery, wear |
| Creature | 8 | 12 to 20 parts; boss 40 to 60 | gear, scar, trophy |
| Prop | 5 | 8 to 15 parts | contents, tool, repair, rag |
| Landmark | 8 | 30 to 60 parts | one unmistakable silhouette |
| Death | 3 stages | 5 to 8 pieces + stain + soul | species-specific debris |
| Environment | 3 scale cues, 3 story props | 2 ambient loops | a before/after trace |

In a social diorama, read the Death row as **Exit**: a role-specific departure
(turn, walk out, shutter down) with the prop and no debris. The five layers are
unchanged; the residue is the changed place, not a stain.

**An object can hold two roles.** A lighthouse that is also a beam tower gets
the landmark budget for its structure **plus** the machine's moving parts; list
both rows in the design sheet. A boss weapon is a separate group: budget 8 to 12
parts for the weapon on top of the body, and say so, or the body will be blamed
for a thin haft.

**Primitive discipline.** No naked box, sphere or cylinder at hero scale. A box
gets a chamfer, a frame, plank divisions or a band. A sphere becomes a skull,
bale, sack or head with a snout, ties or a neck. A cylinder gets a foot, cap,
taper or iron rings. If a shape is still a primitive after the detail pass, it
will read as a rock, a blob or a placeholder at 30 to 45 px.

**Two to four palette entries per object, plus one accent.** More entries
turns into noise after the palette snap; fewer turns into a silhouette cut-out.
Use value contrast for construction and hue for story.

**Detail lives on the camera-facing surfaces.** At the locked angle, model the
front and the top; simplify the back. A perfect back is wasted geometry. Do not
add detail under about 1.5 screen pixels: it aliases into speckle, not craft.

**Every prop must touch the ground.** Feet, wheels, a base, a contact shadow, a
stain. A prop hovering by two centimetres is the single most common "it looks
cheap" report. Check the shadow and the lowest vertex, not the group origin.

**Every landmark must be the only one of its silhouette.** Two skull trees, two
red tents or two identical towers read as duplication, not composition. Move,
scale or redesign the second one. Check overlap by projecting both bounding
boxes to screen: if they merge into one blob, one is invisible detail.

**Clear thresholds.** Keep at least 2 m of empty ground in front of a gate,
portal, spawn mouth or door. No crates, barrels, boulders, bones, vines or
rising smoke in that pocket. A grey billboard above an arch reads as a rock
flying out of the entrance even when it is transparent.

## The Animation Bar

An actor is animated when it has all five of these, not just a walk cycle:

1. **Idle / ambient.** Breathing, sway, scan, flame, flag, wing settle. Two
   loops minimum in the environment.
2. **Locomotion.** Distance-driven walk, run, hop, flap or slither, with feet
   planted and joints filled.
3. **Action.** A readable wind-up, contact and recovery: fire, swing, slam,
   dive, throw, open, build.
4. **Reaction.** A directional flinch, hit flash, knockback, stagger or squash
   that recovers to the same pose.
5. **Exit / consequence.** In a combat diorama, a body-specific collapse plus
   debris, dropped gear, a ground stain and a brief residue — never a generic
   sphere burst. In a social diorama, the equivalent is a role-specific exit:
   turn, walk out with the bag, close the shutter, or sit back down. The scene
   must show that the actor changed the place.

Background actors need 1, 2 and 5. Hero actors need all five. A tower is an
actor too: idle hum, aim, fire, recoil, reload. A service actor's action is
order/pay/receive, its reaction is a look-up or step-back, and its exit is the
walk-out with the prop. A prop with a moving part (door, flag, wheel, pulley,
cauldron) needs its own loop.

**Motion is data.** Author beats as absolute times or travel distances, then
read them at `t`. Do not hide a state machine inside render-frame conditionals;
it will pop on a seek, drift on a loop, and be impossible to screenshot.

**Nothing at hero scale is static.** A tower that spawns a projectile from its
centre without recoil, a boss that stands at a door without touching it, a
creature that slides without a step: all read as unfinished, even with good
geometry.

## Numbers That Make It Read

| Knob | Value | Why |
| --- | --- | --- |
| Camera | fov 20.5, az 45, elev 33 | long lens, near-ortho miniature |
| Framing | `fillX 0.84–0.94`, `fillY 0.86–0.94` | fit margin only: slab plus landmark tops |
| Subject scale | `1.0`, or `0.70` for 30% smaller | post-fit camera multiplier; never geometry |
| Camera distance | solved, 5 to 300 | bisection; actual distance = fit / subjectScale |
| Post buffer | 1× CSS; 1.2–1.5× for a small subject; 2× faces | extra detail without resizing the diorama |
| Palette | 64 entries (any N, but the shader array and loop must match) | skin, stone, asphalt, glass, livery, props |
| Dither | `d*(0.0012 + 0.019*gate) + sparkle*0.0012` | stipple in ramps only; gate = edge |
| Ink | `smoothstep(0.13,0.34,edge)`, mix 0.62 | outline without scribble |
| Palette tie-break | `secondD-bestD < 0.0005` → lighter | flat surfaces come out flat |
| Sun | `0xfff8ee` at 3.3, hemi 0.24, fill 0.46, env 0.18 | hard shadows, cool fill |
| Shadow cam | ±13, near 4, far 70, 2048 map, bias -0.00022 | tight around the whole slab, no acne |
| Figure | 1.69 m, hip 0.86, head 0.584 | toy proportions that read |
| Car | L 4.4, W 1.86, belt 0.90, roof 1.44 | door 1.30, leaf sits between 0.34 and 0.90 |
| Scooter | wheel r 0.26, board 0.30, seat 0.83, bars 1.06 | boots and hands land on built surfaces |
| Loop | 41 to 47 s | one robbery beat plus police, and a quiet seam |

The table mixes two different kinds of number, and treating them alike is how a
new subject comes out wrong.

**Invariants.** Come from the look itself and hold on every subject: azimuth 45,
elevation 33, fov 20.5; one locked camera for the whole loop; palette discipline
(every material samples a palette entry, the shader array length equals the
palette length); gated dither, ink at 0.13/0.34 mixed 0.62, the palette tie-break;
the rig's proportions and joint signs; 2048 shadow map with a frustum tight to
the slab; everything a pure function of `t`.

**Calibrated.** Measured against one subject and only evidence for it: palette
count (64 for the bank job, 66 here), buffer size and renderScale (1×/1.25×/2×),
`fillX`/`fillY`, `subjectScale` and the camera `size` divisor, slab dimensions
and deck height,
loop length, sun and hemisphere intensities, and every prop dimension in the
vehicle and scooter rows. Re-derive these per build: start from the value, then
look at a screenshot and change it.

A scene may change any calibrated number if the subject needs it; change the
template and `DESIGN.md` in the same edit and record the reason. A template that
silently uses a 2x different sun is worse than no template, because the next
reader trusts it.

## Pipeline

Each step ends in something you can look at.

1. **Palette first.** The palette array in `palette.js` plus a named `C` map.
   Every material samples a palette hex, nothing else. Done when a grep for
   colour literals in `materials.js` finds only palette names.
2. **Frame the slab.** Camera constants from `templates/camera.js`, slab sized so
   its projected diamond leaves a margin. Done when a grey slab shot has roughly
   25 to 40 percent white around it at `subjectScale: 1.0`; for a smaller subject,
   apply `subjectScale` after the fit and expect more paper, not a smaller set.
3. **Light it.** Sun plus low hemisphere for daylight; the **Night, Practicals
   And Headlights** rig for a night scene. Tighten the shadow camera to the slab
   and call `updateProjectionMatrix()` after changing the frustum. Done when every
   figure has a readable contact shadow (crisp by day, a soft pool by night).
4. **Post pass.** `templates/post.js`: gamma, grade, ink, gated dither, palette
   snap, rim dither. Done when a 1:1 crop shows square pixels and a dark contour,
   and flat pavement shows no speckle.
5. **Props.** Flat-colour boxes and lathes, no textures, coarse detail. Done when
   the 1:1 crop reads the object's silhouette without colour.
6. **Cast.** `templates/peopleModel.js` (base) or `templates/peopleModel-street.js`
   (clothed) rig, one entry per figure with a base pose. Done when isolated portraits show no gaps, no floating parts, knees
   bending the right way.
7. **Detail pass.** Apply the Detail Bar to every hero object: construction
   layers, attachment, story detail, contact shadow. Done when the object meets
   its row's minimum (5 prop, 6 tower, 8 creature, 8 landmark), has one
   asymmetry and one story detail. "Three assemblies" is a blockout; it is not
   a pass. Do not animate a placeholder.
8. **Animation and systems.** Locomotion, idle, tower/machine actions, reactions,
   exits/deaths, goal contact, crowd variation. Done when each hero actor has all five
   animation layers and each tower has acquire/fire/impact/recovery.
9. **Effects.** Contact shadows, smoke, splash, spill light, debris. Done when the
   effect is visible but never the subject.
10. **QA.** Detail and animation audit, `qa/audit.mjs` for seams/glows/fades,
    camera/render scale, exits and emitters, desktop/iPad/phone, `file://` standalone,
    zero page errors, motion and camera proven from numbers and strips. See
    Verification.

## New Subject Intake

A new subject is not a new pile of props. Before modelling, fill this sheet.
Copy `templates/DESIGN.md` into the project and keep it in sync with the code.

```
PREMISE
  [place] + [a repeated verb/ritual] + [who or what interrupts it] + [payoff].
  One sentence. If it has no verb, it is a shelf model, not a diorama.

CAMERA SIDE
  Which face is +Z? Where is the threshold, the hero tower, the foreground prop?
  Which silhouette must never be occluded from this angle?

CAST SHEET
  role | silhouette feature | locomotion | action | reaction | exit/death | signature
  ...

SYSTEM SHEET
  loop length | three or four systems | crew | three or four visitor roles |
  goal/disruption (optional) | economy/score (optional) | what changes

BEAT SHEET (absolute seconds)
  0.0  establish / portal / doors
  ...  first signal, first system output, first consequence
  ...  disruption reaches the goal (or the last customer arrives)
  ...  contact / handoff / finale, residue, loop seam

DETAIL BUDGET
  systems n x parts | vehicles n | creatures/people n | props n | landmark n |
  exits/deaths n | ambient loops n | triangle / draw-call ceiling
```

Rules that keep a new subject from becoming a blockout:

- **Invent the conflict.** If the user says "a diorama of a lighthouse", decide
  what the lighthouse does, who arrives, what goes wrong, and what the keeper
  does about it. A subject plus a verb is a diorama.
- **Give every machine an operator.** If a tower, loom or pump needs a crew,
  model the crew and decide what happens when they die: the machine slows, stops,
  or runs unmanned with a visible consequence. A gun that fires itself while its
  crew lies dead is a ghost. If the machine is autonomous, say so in the sheet.
- **Choose five signature moments before modelling.** Establish, first system
  output, first consequence, goal/handoff contact, final residue. A social diorama
  may use establish, ritual, disruption, handoff, residue. Every object earns its
  place by serving one of those five.
- **Stage for the locked camera.** Put the threshold and the hero action on the
  +Z face; put tall landmarks at the back but offset in screen x so they do not
  stack. Put one foreground prop at the near corner for depth and one mid-ground
  prop to lead the eye.
- **Blockout in grey first.** Boxes, cylinders and the camera, no palette, no
  post. Shoot 1:1. If the five moments do not read in grey, detail will not save
  them. Redesign the staging, not the textures.
- **Name every hero object.** `totem`, `hayCart`, `gatehouse`, `troll`, not
  `prop12`. Unnamed objects become clutter because nobody owns their silhouette.
- **One boss goal, one tower verb.** The boss must visibly act on a place
  (door, bridge, pump, nest); the tower must visibly act on a target (pierce,
  blast, freeze, chain). Repeat the verbs with variation, not new nouns.
- **Write the QA timestamps now.** Pick the five frames you will inspect before
  you build them. If you cannot name a timestamp for a beat, it is not staged.

### Reference Density

The Hollow Toll shipped at this density. Use it to calibrate a new subject; a
smaller subject should have fewer objects at the same detail per object, not
fewer details per object.

| Measure | Value |
| --- | --- |
| Slab | 21 x 14 x 0.42 m, 64-colour palette |
| Towers | 4 + 2 gate cannons |
| Species | 5 (goblin, orc, slime + split, bat/imp, troll) |
| Units | 42, one boss |
| Combat events | 527 |
| Tower shots | 183 |
| Scene meshes | ~3,100 |
| Triangles | ~164,000 |
| Scene draw calls | ~1,700 at 1440 x 900 |
| Textures | 5 |
| Loop / sim | 46.0 s at 40 Hz pre-sim |
| Standalone | ~783 kB with three.js inlined |

A 12 x 9 m scene with two towers and three species should land around
1,000 to 1,600 meshes and 60 to 100k triangles. Raw count is not the goal;
the detail per hero object and the number of readable beats are.

### Worked Example: The Hollow Toll

This is the reference build the numbers above come from. Read it as a calibration
of **what "finished" looks like**, not as a scene to copy.

- **Set.** A 21 x 14 m slab, purple portal at the back-left, winding road, goblin
  camp, moat and drawbridge, gatehouse at the near-right. Four towers and two
  gate swivels; keep gate faces +Z.
- **Cast.** 14 goblins, 4 orcs, 7 slimes plus 10 split slimelets, 6 imps and one
  Toll-Troll: 42 units, 5 death grammars, one boss goal.
- **System.** 46 s loop at 40 Hz, 527 events, 183 shots. Ballista single target,
  bombard splash, frost lance channel, tesla chain, gate swivels on the last
  stretch. The troll reaches the gate at 38.6 s and hits it eight times.
- **Detail.** The gatehouse has a plinth, two towers, crenellations, a gate arch,
  door leaves with cracks, two swivel cannons, banners and torches. The skull
  warning tree has a trunk, fork, trophy board, horned skull, rope collar, bone
  chimes, rags, tally marks and roots. The hay cart has a bed, slats, two spoked
  wheels with iron tyres, corner straps, three tied bales, loose straw, a
  pitchfork, a sack, a rag and two shafts.
- **Animation.** The frost spire pulses, flares at the crystal, holds a scrolling
  band lance, ramps heat, and shuts off on the target's death. The troll stops
  outside the threshold, turns three-quarter, swings an iron-banded maul, and
  drives the door flash, shake and cracks from the same gate-hit timestamp.
  Every species has its own collapse and debris.

Fixes that became rules in this file:

| Report | Root cause | Rule |
| --- | --- | --- |
| "rocks flying out of the entrance" | camp smoke billboards above the portal | clear the threshold of smoke, props and fireflies |
| troll inside the gatehouse | stop at `length - 1.05`, body through wall | stop at body depth + weapon reach; keep the door visible |
| club looked like a rock | end-on pose, haft hidden, no bands | yaw 0.35 rad, build haft + bands + studs, sync contact |
| beam had a black segment | black backing plate in the additive beam texture | clear the canvas; transparent gaps, never black |
| deaths were spheres/rocks | generic burst | species collapse + debris + dropped gear + residue |
| skull tree looked like a monster | a second totem overlapped the tree | one landmark per silhouette; mount the skull on a board |
| cart looked like a blob | pale spheres in an open box | five-part prop: bed, slats, wheels, load, tools, story |
| standalone broke over `file://` | `String.replace` expanded `$&` in the bundle | function replacer; test the standalone |

A new subject should copy the **density and audit discipline**, not these nouns.
A lighthouse, market or launch pad needs the same number of readable systems,
the same five animation layers and the same proof frames.

### Worked Example: Night Market

The social-scene calibration: no combat, no boss, no deaths. A food truck, a
queue, a courier, one scooter and a cat. It proves the same discipline applies to
a life scene.

- **Set.** 21 x 14 x 0.42 slab; truck at (0.15, -3.35) with the hatch facing +Z;
  counter at z 1.10; parked scooter at (5.55, -0.72) facing +Z; bench, rail,
  lamps, bins, service block behind. Camera azimuth 45, elevation 33, fov 20.5,
  fill 0.93.
- **Cast.** Cook, cashier, customers A/B/C, courier, late customer D, cat. The cat
  is an actor with its own idle, walk, sit and tail loop, not set dressing.
- **Systems.** Grill flare, order rail, bag pass, scooter dispatch. Four readable
  systems, no towers.
- **Loop.** 46 s at 40 Hz. Queue forms 0–16 s; four paper bags + one insulated
  bag; courier loads 21.2–22.5, mounts 22.7–23.5, departs 23.5–27.3; D arrives
  26.0–33.4, last bag 34.0, exits 34.8; quiet seam 40–46.
- **Scale.** The user asked for 30% smaller. The fix was `subjectScale: 0.70`
  after the fit (`distance = fit / 0.70`), not scaling the slab, cast or canvas;
  geometry scaling breaks the world clip and shadow maps, and shrinking the
  canvas breaks the 1:1 crops. Backing buffer 2x CSS for the faces, CSS
  downscale.
- **Proof.** Nine 1280x800 frames plus two close strips: courier mount, D walk.
  The strip camera was a fixed side view, not the hero camera.

Fixes that became rules in this file:

| Report | Root cause | Rule |
| --- | --- | --- |
| "the building bottom/right is cut" | slab edge/backdrop closed too tight | close side walls and undersides; camera fit includes the slab corners |
| "bike lights look unnatural" | large additive disc | emissive lens + small halo; cone only at night |
| "doesn't put the box on the bike" | prop teleported from hands to crate | carry in world space from wrists; lower over the rim; release with a beat |
| "doesn't sit on the bike naturally" | car seat/root constants reused | measure scooter seat; board for the left boot; abduction swing; bars to hands |
| "the human/cat doesn't look human" | sphere head, cap at theta 1.85 | skull+jaw head, hair cap 1.22, ears/brow/lids, tapered limbs |
| "carry the bags more human-like" | prop at root, hands nearby | two-hand hold at the prop's top, object origin at its bottom |
| "no text outside the diorama" | DOM overlay on the paper | empty-paper rule; copy on modelled signs only |
| "30% smaller" | scaling the scene | move the camera; keep world clipping and shadow scale |
| "leg swings over the handlebar" | hip X flexion for a side mount | abduct with hip Z; knee tucked; root arc 0.1–0.2 m |
| "single human slides near the shop" | standing gesture blended during walk | gate gestures on `!state.moving`; serve after arrival |

A new subject should copy the **timing discipline and contact logs**, not the
food truck. A pool, a station or a bakery needs the same queue/service,
carry/load and close-up proof.

## Palette And The Post Pass

`templates/post.js` renders the scene to an offscreen target, then a full-screen
shader turns it into pixel art. Order matters; each stage assumes the last.

1. **Coverage gather.** ~12 taps in a small disc read alpha, so the silhouette can
   be softened and stippled without blurring the interior. The target is
   transparent outside the slab.
2. **Composite onto paper.** `mix(vec3(1.0), c, smoothstep(0.26, 0.72, cov))`.
3. **Gamma.** `c = pow(c, 1/2.2)`. The target is linear; skip this and the frame is
   dark and muddy, which reads as a lighting bug.
4. **Grade.** Saturation 1.07 and contrast 1.028 *before* quantising, or the snap
   flattens everything to mid tones.
5. **Ink.** Neighbour luma differences, `edge = max(abs(d))`, brought to display
   scale with `pow(edge, 0.4545)`, then
   `ink = smoothstep(0.13,0.34,edge) * smoothstep(0.20,0.55,cov) * (1 - smoothstep(0.86,0.985,cov))`
   mixed 0.62 toward `vec3(0.085,0.082,0.076)`.
6. **Dither, gated.** `d = bayer8(gl_FragCoord.xy) - 0.5`,
   `gate = smoothstep(0.004,0.055,edge)`,
   `c += (d*(0.0012 + 0.019*gate) + sparkle*0.0012) * uDither`. Keep `uDither` as a
   uniform: it is the fastest way to prove whether a speckle is the dither.
7. **Palette snap.** Nearest entry with channel weighting `(1.0, 1.12, 0.93)` so
   greens do not beat skin. Keep the runner-up and break near-ties toward the
   lighter entry, or a surface halfway between two entries flips entry per pixel
   on the dither noise and stipples a whole pavement.
8. **Rim dither.** Where coverage is 0.78 to 0.995, threshold against Bayer so the
   cut-out edge is stippled, not anti-aliased.

The palette length is a shader constant: `uniform vec3 uPalette[N]` in the
fragment source and the JS array must be the same length. A mismatch loses the
last colours or reads out of bounds, and the symptom is a colour that "does not
exist in the palette" appearing on screen.

### Tuning Table

| Symptom | Cause | Fix |
| --- | --- | --- |
| Water looks like TV static | dither ungated | add the edge gate |
| Frame dark and muddy | missing gamma | `pow(c, 1/2.2)` before grade |
| Everything mid-grey | no grade before snap | saturate 1.07, contrast 1.028 |
| Scribble outlines | ink threshold too low | 0.13 / 0.34 |
| Missing outline on figures | rim suppression too wide | narrow to 0.86 / 0.985 |
| White speckle on flat deck | material grain aliasing | cut grain, not resolution |
| Bands with hard edges | palette hole | add 4 to 6 intermediate entries |
| Speckle only where a tone sits between entries | palette tie | break near-ties toward lighter |
| Speckle at zero dither | sub-pixel geometry | widen detail to ~1.5 px or delete it |
| Beam goes flat or vanishes on paper | additive white over white | saturated palette core + dark halo; fade before the edge |
| Glow disappears after the snap | sub-pixel or pure-white FX | widen to 2 px+, use a palette entry, add a contour |
| Beam ends in a hard vertical cut | world clip plane on a read-through FX | taper intensity to zero before the slab edge |
| Flame reads as a grey smudge | normal-alpha smoke over a bright source | lighten/remove smoke in the flame corridor, draw flame last |

Isolate noise in this order and stop at the first that removes it: dither
uniform to 0 → widen or delete sub-pixel geometry → disable `shadowMap`. Judge on
a 1:1 crop; a downscaled preview softens all three into "texture".

### Resolution

Default: `setSize` renders one target pixel per CSS pixel, capped by `maxDim`
(1600), and CSS `image-rendering: pixelated` handles the upscale. The chunky
look comes from the palette snap and the ink, not from a low buffer.

When the diorama is deliberately small on the page (`subjectScale` under ~0.8),
raise the buffer **a little** instead of enlarging the subject:
`new PixelPost(renderer, 2000, 1.25)` renders 1.25 target pixels per CSS pixel;
at a 1312 × 760 CSS canvas that is a 1640 × 950 buffer, CSS still 1312 × 760.
The post pass quantises at the finer grid and the browser downsamples; the page
size, camera solve, slab and clip do not move. 1.2–1.5× is the useful range; 2×
on a full arena is usually a frame-rate tax, not more art. Log `post.size` and
`canvas.getBoundingClientRect()` and check a 1:1 crop for shimmer.

For faces and close-up contact beats, use `renderScale: 2` and
`image-rendering: auto` (not pixelated), with `maxDim` high enough (2400) to
avoid the cap. The post pass still quantises at 2×; the CSS downscale is a clean
box filter, not a change to the art. Keep the CSS size as the layout size so the
camera solve and the 1:1 QA crops stay comparable. Re-run the portraits after
any resolution change: raising the buffer exposes hats, stripes and noses that
hid at the old grid.

## Camera And Framing

```js
CAMERA = { fov: 20.5, azimuth: 45°, elevation: 33°, target: (0,-0.15,0),
           fillX: 0.84, fillY: 0.86,
           subjectScale: 1.0 } // 0.70 = 30% smaller, more paper
```

The distance is solved, not typed: build a direction vector from the angles,
project each fit point (slab corners at deck and underside, plus the tallest
building corners) into camera axes, and bisect the distance until every point's
`|x|/(depth*tan*aspect)` and `|y|/(depth*tan)` fit inside `fillX` and
`fillY`. 48 iterations is plenty. `fillX`/`fillY` are the **fit margin**, not the
page-size control; tune them together, because raising one alone crops the other
axis on a portrait phone.

**Subject scale is a second, post-fit move.** Solve the fit first, then pull the
camera back:

```js
const fit = solveDistance(aspect, points);
const scale = CAMERA.subjectScale ?? 1;
const distance = fit / Math.max(0.1, scale);
camera.userData.fitDistance = fit;
camera.userData.subjectScale = scale;
camera.userData.distance = distance;
```

`subjectScale: 0.70` renders the diorama at 70% width/height — 30% smaller
linearly and about 49% less screen area — so the paper margin grows. `1.0` is the
fitted size. Keep the slab, cast, world clip, shadow camera, CSS canvas and
frame at full size; raise the backing buffer only with `renderScale` (next
section), never by scaling geometry. Shrinking the geometry also shrinks contact
shadows and the clip volume; shrinking the frame/canvas changes the 1:1 crop
and does not change the model's scale. **Move the camera.**

A phone is already height-limited, so 0.70 can make the trucks unreadable. Try
0.70, then 0.80–0.90 if needed; the scale is per scene, not a universal 30%.

**Verification.** Log both distances and assert
`actualDistance ≈ fitDistance / subjectScale` within 2%. Also project the slab
and compare its width to the fitted width: the ratio must be the scale, not just
the distance. On Dust Kings at 1.73 aspect: fit 67.93, scale 0.70, actual 97.05;
projected slab width 872 → 611 px (0.70), with slab, clip and shadows unchanged.

`updateCamera(camera, aspect)` on every resize and orientation change, with a
debounced call after `orientationchange`. A canvas measured at under 2 px is a
layout race: return early rather than dividing by zero.

## Scene Furniture

- **Slab** 21 x 14 x 0.42 with the street on the camera side (+Z) and the
  building block at the back (-Z) for an exterior. For an interior cutaway, see
  **Cutaways And Glass** before placing the street. Deck at y 0 is the street;
  the pavement is a raised 0.16 slab with a kerb face.
- **Pavement joints** 2.6 m apart, 0.085 m wide. Anything thinner rasterises to
  dots that read as noise. `groundY(x,z)` returns street, pavement or step height
  so every track and shadow samples the same function.
- **Buildings** are boxes with a parapet, a sign band, recessed windows and a
  door pivot. At 33 degrees you look down onto roofs: a 4.6 m wall in front of a
  5.2 m deep building hides none of its roof, so model the parapet, plant,
  skylight or stair head, or keep it lower than it is tall.
- **Doors** are pivots at the jamb with the leaf extending into the opening.
  Recess them 0.15 so the opening shows a shadow gap, and light the interior so
  an open door reads as a room, not a hole.
- **Contact shadows** are one unlit radial-gradient plane per figure, opacity
  0.55 to 0.95, scaled to the footprint, 0.018 above the ground it belongs to.

### Night, Practicals And Headlights

Night is a new light ratio and a new palette, not the day rig dimmed. The sun
table is a daylight default; a 2am scene needs its own numbers and its own test.

| Key | Night default | Why |
| --- | --- | --- |
| moon / key | `0x93a7c4` at 0.45 to 0.65 | cool, low, soft shadows |
| hemisphere | sky `0x1b2740`, ground `0x090b12`, 0.16 | blue ambient, never black |
| fill | `0x6d7f9e` at 0.10 to 0.16 | keeps the shadow side readable |
| practical | `0xffb066` at 1.0 to 1.4 | warm bulb/lamp, 2700 K |
| pool | unlit radial plane, opacity 0.28 to 0.45 | light on the ground, cheap |
| headlight | `0xfff0c8`, lens + cone + floor ellipse | source, throw and landing |

- **A practical is an object, not a glow.** Bulb sphere, shade/guard, bracket,
  emissive lens, small halo, and a pool on the surface below. A floating halo with
  no fixture reads as a firefly.
- **Use one real point light at the hero practical**, not one per bulb. The rest
  are emissive + pool decals. Ten point lights flatten the darks and cost more
  than they return.
- **Keep three dark values.** Deep shadow, mid shadow and lit edge must be
  different palette entries; if the night is one black silhouette, lift the
  hemisphere or add a cool rim. `0x000000` is forbidden, as in daylight.
- **Headlights are a moving pool, not a global spotlight.** Two lenses, two
  tapered cones, one elongated floor ellipse that travels with the vehicle.
  Do not let the cone light the whole facade: it will read as dawn.
- **Windows are dark glass with a warm interior.** A blue-grey pane, two
  reflection streaks, and a visible warm room behind it. A fully transparent
  plane tints the whole interior and kills the cutaway.
- **Grade for night after the snap:** lift black to about `0x0b1020`, keep warm
  highlights from clipping. Test a 1:1 crop: three dark values, a visible source,
  a readable pool, no white blob.

A night scene passes when the unlit areas still have shape and the light sources
are in the frame. "It is dark" is not a pass.

### Cutaways And Glass

The +Z street convention is for an **exterior**. If the hero action is inside a
shop and the street is between the camera and the hero, the bus/traffic will
occlude the beat. Choose one:

- **Exterior scene:** street on +Z, facade behind it, action on the pavement.
- **Interior cutaway:** omit the camera-side wall entirely (or keep a 0.25 m
  header and sill), put the street **behind** the room at -Z behind glazing, and
  keep the camera-side floor open. The room is the stage; the street is the
  cyclorama.
- **Foreground traffic:** allowed only if it crosses before or after the hero's
  contact beat; check the occlusion frame, not just the still.

For glazing, build the frame, mullions, sill and a few reflection streaks. Do not
lay one transparent plane across the opening: it tints the interior, hides the
practical lights and turns the cutaway into a fish tank. If the bus must read
through the glass, give it lit windows and a dark body against the warm interior;
do not brighten the whole room to compensate.

## Detail Recipes

Detail is a hierarchy, not a texture. Build in this order and stop adding when
the silhouette is explained.

### The Five-Part Prop

Every readable prop answers five questions with geometry:

1. **What touches the ground?** Feet, skids, wheels, a stone base, roots. Add a
   contact shadow at 0.018 above the deck.
2. **What holds it up?** Posts, frame, legs, axle, brace. This is the
   construction layer and it must be visible from the camera.
3. **What is its working surface?** Planks, slats, a lid, a blade, a trough, a
   table. Divide it into pieces; a single slab reads as a box.
4. **What attaches the parts?** Rope, iron straps, nails, hinges, lashings,
   rivets. Two or three are enough; a row of identical studs is noise.
5. **What is the story?** Contents, a tool, a repair, a trophy, a rag, wear on
   the edge that is used. One or two, placed where the camera sees them.

A hay cart from the reference build: bed, six side slats, two spoked wheels with
iron tyres, four corner straps, three tied bales, loose straw, pitchfork, sack,
red rag, two draft shafts. That is ten assemblies for a prop the user sees for
two seconds. A crate with a pale sphere inside is none of them.

### Tower Anatomy

A defence tower is a small building, a machine and a crew in one silhouette.

| Layer | What it adds | Failure if missing |
| --- | --- | --- |
| 1 foundation | plinth, steps, rubble, contact | tower floats or looks pasted on |
| 2 shaft | taper, buttresses, bands, ladder | reads as a cylinder |
| 3 platform | deck, rail, hatch, brackets | machine has nowhere to stand |
| 4 machine | weapon, pivot, rail, recoil travel | attack has no origin |
| 5 crew | gunner, cranks, spotter, ammo | tower feels automated/empty |
| 6 livery | banner, number, pennant, paint | tower has no owner |
| 7 wear | scorch, chips, rope, spent cases | tower looks unplaced |

The animation pivot belongs to layer 4. The muzzle or launch point belongs to
the weapon, never the tower centre. Recoil travel is 0.1 to 0.25 m for a ballista
or cannon, 0.02 to 0.06 for a beam crystal. A tower with no recoil, no crew and
no ammo is a monument.

**A hollow object must show its opening.** A cannon with a solid brass cap is a
baton, not a gun; the same failure turns a pipe into a rod, a chimney into a
post, a lamp into a mushroom and a tunnel into a painted arch. Build the opening
as geometry, not a dark decal:

- replace the end cap with one or two **open-ended collars** (no front face);
- add a recessed **dark bore tube**, open at the mouth, with its inner wall
  visible (`DoubleSide` on a cloned material, never on the shared palette
  material);
- close the back with a **dark disc** so the barrel interior is not see-through;
- add an **iron inner lip ring** and a **brass outer lip ring** so the edge
  catches the light at 1:1;
- put the muzzle/effect origin at the lip, not inside the bore.

At 1:1 the opening needs a dark centre at least 5 to 6 px across and a lit lip.
If the centre is brass, the hole failed.

**A rotating assembly owns only its moving parts.** The yaw/turret group may
contain the carriage, barrel, recoil slide and muzzle. Fixed stores — powder
keg, shot pile, rammer, tools, ready rack, crew — belong to a static group on the
tower root, never the yaw group. If they are children of the yaw group they sweep
around the tower when it tracks a target, which reads as the whole gun deck
rotating.

Do not simply reparent the props at deck height: the barrel and carriage sweep
through that volume at some yaw. Put them outside both the yaw sweep and the
barrel's vertical arc. If the deck has no clear sector, bolt a ready locker to
the outer wall below the deck: shelf, two iron brackets, powder chest with corner
straps, shot tray, and a rammer hung on two hooks. It reads as part of the tower
and never collides.

Test two ways at minimum and maximum yaw: each fixed child's world position
delta must be 0, and each fixed mesh's world bounding box must not intersect any
mesh under the yaw group. Both checks pass, or the station is still in the arc.

Worked example, Bombard Bastion: 17 fixed parts — shelf, two iron brackets,
powder chest, lid, two corner straps, rope handle, shot tray, tray lip, three
iron shot, rammer shaft, iron cap and two wall hooks. It sits at y 1.1 to 1.6 on
the outer shaft, below the deck and outside the barrel arc. At both yaw extremes
all 17 world positions are identical and the station has zero bounding-box hits
against the yaw group.

### Creature Anatomy

A creature needs a silhouette feature before it needs a face.

1. **Core mass.** One dominant volume: hunched torso, round slime, long bat.
2. **Silhouette feature.** Horns, ears, hump, wings, tail, crest, antlers. This
   is what the user recognises at 30 px.
3. **Face.** Two eyes, brow, jaw or beak. Eye sockets must be dark and set in,
   not painted on the surface.
4. **Limbs.** Joint groups with fillers; hands and feet larger than anatomy
   suggests, or they disappear at this scale.
5. **Gear.** One weapon, one strap, one trophy. Not a full armour set.
6. **Colour break.** One hue for skin, one for cloth, one metal accent.
7. **Asymmetry.** A chipped horn, a single pauldron, a dragging club. Perfect
   symmetry reads as a toy soldier.

The boss gets 40 to 60 parts and one signature weapon. Build the weapon as a
separate group with a haft, head, bands, studs or spikes, and a hand attachment.
A stone head with no haft reads as a rock floating at the door.

### Small Quadrupeds (Cats, Dogs)

A cat is not a small human on all fours. Build a horizontal spine and four
contact legs; the silhouette is the back line, ears and tail.

- **Body:** chest sphere r 0.085 at y 0.24, belly capsule 0.24 long, hip sphere
  r 0.080. Shoulder height 0.26, nose-to-tail base 0.46. A cat at human scale is
  about 0.25 m at the shoulder; measure, do not scale a person by 0.2.
- **Head:** skull r 0.075, muzzle 0.045 forward, jaw, nose, two triangular ears
  (cones or three-vertex prisms) at the top corners. Eyes face forward with a
  dark socket and a vertical pupil; at 30 px the ears and pupils carry the read.
- **Legs:** four chains (upper 0.10, lower 0.11, paw 0.05). Front legs are
  straighter; rear legs have a hock that bends backward. Paws land flat, toes
  forward. Do not use the human knee sign for a hock.
- **Tail:** four to six segments with a slow S-curve, root at the sacrum. It
  counter-sways against the walk and curls when sitting; a rigid stick tail is
  the fastest way to lose the animal.
- **Walk:** lateral-sequence four-beat, phase offsets roughly LF 0, RH 0.25,
  RF 0.5, LH 0.75. The spine dips and rises twice per cycle; the head stays
  level. Drive phase from distance travelled, like the bipeds.
- **Sit:** haunches down, rear hocks folded, front legs straight, chest up, tail
  curled around the paws. A sitting cat is a triangle, not a crouched person.
- **Jump:** crouch (hips down, spine compressed), extend (all four legs push),
  airborne (legs tucked, tail up), land (front paws first, then rear). Two
  seconds of anticipation and recovery, not a linear hop.
- **Fur:** one base colour, a lighter chest/muzzle, darker ears/tail tip and two
  or three stripe bands. Do not model individual hairs; the palette snap eats
  them. Contact shadow is one stretched ellipse under the body, not four paw
  blobs.

Shoot the cat at 1:1 in profile, three-quarter and sitting. If it reads as a
rabbit, the ears are too long; if it reads as a dog, the muzzle is too broad and
the back line too straight. No gear, no trophy, no human jacket.

### Environment Anatomy

- **Three scale cues.** One small (grass, bones, cobbles), one human (cart,
  barrel, spear), one tall (tower, tree, gate). Without all three the slab has
  no scale.
- **Three story props.** A camp, a repair, a warning, a toll, a shrine. Place
  them off the main path but inside the camera cone.
- **Two ambient loops.** Fire, flag, smoke, fireflies, grass, water, hanging
  bones. Phase them differently; synchronized loops read as a screensaver.
- **A path with a memory.** Ruts, footprints, dropped goods, a worn threshold.
  A clean path is a diagram.
- **A boundary treatment.** Trees, rocks, posts or a wall that explains why the
  slab ends. Do not let props clutter the threshold.

### Detail Audit At 1:1

Before the animation pass, inspect each hero object at 1:1 and answer:

- Can I name its three construction layers without guessing?
- Does it cast a contact shadow and touch the ground?
- Is there one asymmetry or story detail I can point to?
- Does it overlap another object of the same silhouette?
- Is any detail under 1.5 px, and therefore speckle?
- Does every hollow object — cannon, pipe, chimney, lamp, tunnel — show a real
  opening, or does it end in a cap?
- Does it read in grey, without colour?

If any answer is no, fix the object before animating it. Animation multiplies
detail; it does not create it.

## The Cast

A 1.69 m figure built from primitives, with an anatomical group per joint so
limbs overlap when they bend. Faces +Z.

| Constant | Value | Notes |
| --- | --- | --- |
| hipY | 0.86 | pelvis group height above the root |
| hipX | 0.10 | half stance width |
| thigh | 0.42 | hip to knee |
| shin | 0.40 | knee to ankle |
| shoulderY | 0.415 | above the pelvis |
| shoulderX | 0.182 | half shoulder width |
| upperArm | 0.30 | shoulder to elbow |
| foreArm | 0.27 | elbow to wrist |
| headY | 0.584 | neck to head group |

The base swimwear rig uses two spheres (cranium 0.115, jaw 0.089) plus a nose
box. For a clothed cast, replace that with the skull/jaw/cheek head below. Torso
and pelvis are lathes (0.135→0.198 and 0.105→0.180), flattened 0.72 in Z so the
body is an oval, not a tube.

Construction rules:

1. Build joint groups at the pivot, hang geometry **down (-Y)** from them, so a
   rotation is an anatomical rotation.
2. Every joint gets a sphere filler just inside the limb radius. Without it a 90
   degree bend shows a wedge-shaped hole.
3. Limbs are capsules; torso and pelvis are lathes for a tapered silhouette.
4. Clothing is layered over the body as its own lathe slightly larger than the
   pelvis or torso, plus a band cylinder at the waist or chest.
5. Never parent a part to a group that has not been created yet in the function
   body: straps added before the torso exists throw on load.

Pose API: `setPose(person, pose)`, `easePose(p, pose, 1-exp(-22*dt))`,
`blendPose(a, b)` (component-wise add). Angles are `[x,y,z]` radians per joint:
`torso, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R`,
optional `pelvis`.

**Sign conventions, get these right once:**

- Facing +Z. Positive hip X swings the thigh **backward**; negative forward.
- Positive knee X bends the heel **backward**. Negative hyperextends and reads as
  a broken leg. This single sign error is the most common "the walk is broken".
- Positive shoulder X swings the arm backward, negative forward.
- Negative elbow X folds the forearm toward the face.
- Positive shoulder Z abducts an arm away from the body; mirror the sign.

Detail that pays, in order: the skull/jaw head in **Clothed Cast** (hair cap
theta 1.22, eyes at ±0.037, 0.110, 0.101); cap as a crown cylinder, band and
brim; brow and lid creases; a narrow nose bridge; a three-layer mouth; ears as
flattened spheres; hands as a palm plus a finger block and thumb; feet with a toe
box. Fingers, nostrils and micro-seams do not survive 30 px.

Balaclava: one sphere shell over cranium and jaw (r 0.134, scale 1.0/1.10/0.99)
plus a neck gaiter cylinder running into the collar. A cover cut at the equator
leaves a band of skin under the hem that reads as a bare head, and eye openings
tucked under the shell disappear: put pale lids a few millimetres proud of it. A
darker skin material is `skin.clone()` with `color.multiplyScalar(0.86)`.

### Clothed Cast: Heads, Layers, Hands

The skeleton is shared; the person is made by the head, the garment silhouette
and the hand contact. For a clothed cast, start from
`templates/peopleModel-street.js`; `templates/peopleModel.js` remains the
swimwear/aquatic variant.

**Head.** A skull plus a jaw, not two stacked balls.

- Cranium: sphere r 0.100 at y 0.118, scale [0.98, 1.16, 0.98]. Jaw: r 0.079
  at y 0.054, scale [0.78, 0.80, 0.86]; chin r 0.029 at y 0.029, z 0.079.
- Ears: flattened spheres at x ±0.098, y 0.101, with a darker inner bowl. They
  are what makes the head read in profile.
- Eyes: a shade socket, a dark iris r 0.0145 scaled flat, a pale catchlight.
  Brow above, lid crease below, cheek plane under that. At 30 px the socket and
  brow carry the expression; the iris just anchors the look.
- Nose: a narrow bridge box plus a tip sphere, 0.022 wide. A single box reads as
  a beak from three-quarter.
- Mouth: upper lip in shade, dark seam, lower lip in skin. Three thin layers at
  most; a wide box reads as a letterbox.
- Hair: a sphere cap with `thetaLength` 1.22, positioned at y 0.132 and stopping
  at the hairline. A 1.85 cap swallows the forehead and reads as a helmet. Add a
  back mass, sideburns, and for a bun a high sphere at y 0.204. Under a hat show
  a nape tuft; under a full helmet show none.
- Hats are their own silhouette: beanie (dome + rolled torus + pom), cap (crown
  + brim + band), bandana (cap + knot + tail), helmet (shell + visor + chin
  strap + reflective bands). Never draw hair through a helmet or a cap.

**Clothing is geometry, not paint.**

- Base body: torso lathe 0.135→0.198, pelvis lathe 0.105→0.180, flattened 0.72
  in Z.
- Garment: a second lathe 4 to 12% larger (`topK` 1.0 tee, 1.05 jacket, 1.12
  puffer), plus a hem/waistband cylinder. The garment must have a thickness step
  at the cuff, collar and hem or it reads as body paint.
- Sleeves: short sleeve ends above the elbow with a cuff ring; long sleeve is a
  second lathe down the forearm with a ribbed cuff. Do not texture a bare arm and
  call it a sleeve.
- Trousers: tapered lathes over thigh and shin with a cuff at the ankle and a
  break over the shoe. Loose trousers get a wider profile and a deeper cuff, not
  a scaled leg.
- Outerwear: jacket shell + zip/lapel/hem; puffer gets 3 horizontal quilt bands;
  hoodie gets a kangaroo pocket and drawstrings; apron is a front panel with a
  bib, waist ties and a towel, never a full cylinder around the body.
- Backpack sits behind the torso with two shoulder straps that cross the front;
  a bag floating at the spine reads as a growth.
- High-vis, reflective bands and lanyards are thin boxes proud of the cloth,
  following the body curve at 2 to 4 mm.

**Hands are the contact proof.** Palm box 0.070 x 0.078 x 0.054, a finger block
with two grooves and a thumb capsule. A glove is the same geometry in glove
material, with a cuff. When a hand holds something, the palm and finger block
must touch it; a wrist near a handle is not a hold.

If the head or the clothing is wrong, fix it before the walk. A good gait cannot
rescue a sphere head or a painted jacket.

## Animation

Every motion is a pure function of `t` or of a distance along a track.

```js
const swing = Math.sin(phase), cs = Math.cos(phase);
const kneeL = 0.05 + 0.46*Math.max(0,-cs) + 0.22*Math.max(0, swing);
const kneeR = 0.05 + 0.46*Math.max(0, cs) + 0.22*Math.max(0,-swing);
pose = {
  torso: [lean, swing*0.05, 0],
  shoulderL: [-swing*arm, 0, -0.09], shoulderR: [swing*arm, 0, 0.09],
  elbowL: [-0.16 - Math.max(0, swing)*0.28, 0, 0],
  elbowR: [-0.16 - Math.max(0,-swing)*0.28, 0, 0],
  hipL: [swing*amp, 0, 0.03], hipR: [-swing*amp, 0, -0.03],
  kneeL: [kneeL,0,0], kneeR: [kneeR,0,0],
  ankleL: [-kneeL*0.32,0,0], ankleR: [-kneeR*0.32,0,0],
};
```

- Hips above ±0.35 read as a march; 0.30 to 0.34 is a walk, 0.5+ is a run with
  lean 0.26 and elbows near -0.75.
- Match travel to stride or feet skate: `footTravel = 2*legLength*sin(amp)`,
  `speed = footTravel * phaseRate / PI`. A 0.86 leg at 0.34 rad and 5.2 rad/s is
  about 0.9 m/s. Drive `phase` from distance travelled, not from time, and the
  walk always matches the path.
- A track is a Catmull-Rom sampled to an arc-length table with `groundY` heights
  smoothed by three 1-2-1 passes, so steps read as ramps. `at(d)` returns
  position and heading.
- Sit: hip X around -1.35 to -1.50, knee +0.5 to +1.3 so the shin drops
  vertically, torso back 0.05 to 0.1. Seat height is a measured constant.
- Climb: hands start above the head, opposite hand and foot move together, hips
  stay close to the ladder (0.12 to 0.2 m) and swing 0.06 to 0.10. Rung spacing
  0.30 m, climb 1.0 to 1.2 m/s, phase driven by height, not time. Feet land on
  rungs, not between them; the shadow belongs on the ladder/deck, not the slab.
- One-shot actions (jump, dive, kick) are phase tables with eased poses, never a
  blend between two loops. Hoist shared easing factors above the branch: a
  `const` declared in one branch and read in another throws every frame and
  freezes the figure. Pose targets are full poses, not deltas.
- Airborne arcs are solved backwards from the impact: for a fixed flight `T`,
  `vy = (landY - launchY + 4.9*T*T)/T`. A guessed `vy` either lands late or
  stops in mid-air.
- The rig root is at the feet, so a rigid-body spin sweeps the model around its
  toes: rotate about a pivot `C` with `p' = p + C - R*C`, C about 0.55 up.

### Carrying, Loading And Mounting

These are the beats closest to the camera and the ones users report first. A
prop that teleports, a hand that misses it, or a leg that swings through the
handlebars destroys the whole miniature.

**Carry.** Keep the prop in world space and solve its transform from the hands
every frame; do not parent a big prop to a wrist group (it inherits the wrist
roll and swims).

```js
const hl = new THREE.Vector3(), hr = new THREE.Vector3();
J.wristL.getWorldPosition(hl); J.wristR.getWorldPosition(hr);
const mid = hl.clone().add(hr).multiplyScalar(0.5);
bag.position.set(mid.x, Math.min(hl.y, hr.y) - 0.42, mid.z);
```

- Build the prop with its origin at the **bottom centre**. Then a hold offset is
  a single subtraction, and the same object seats on the ground/crate floor
  without a second pivot.
- Two hands for anything heavier than a paper bag. The palms must be within
  0.08 m of the prop surface at every sampled frame; log the wrist positions and
  the prop bounds.
- Match the carry pose to the weight: heavy box at the belly, shoulders -1.2 to
  -1.4, elbows -1.2 to -1.4, torso lean 0.2; a light bag hangs from one wrist
  with the elbow nearly straight.
- Reduce arm swing while carrying; the legs do the walking. A full arm swing
  with a box in the hands reads as a puppet.
- **Handoff:** at contact, set the prop to the receiver's hold for one frame, then
  blend ownership over 0.2 to 0.3 s. A hard parent switch pops even when the
  world positions match.

**Loading into a crate or hatch.**

1. Lift the prop above the rim in front of the chest, with both hands on it.
2. Tuck the prop's x/z over the opening while the hands stay on it.
3. Lower it until its base reaches the floor; keep the hands on it for a beat.
4. Release, step back, and only then close the lid, clip the bungee or turn away.

Never translate the prop from hands to slot in one frame, and never let it
descend outside the crate wall. A bungee or lid that intersects the prop on the
way in must animate open and closed; hiding it for the whole beat reads as a
missing part.

**Mounting a scooter, bike or horse.**

Author the mount in the vehicle's local frame, from a measured seat/board, not
by eye.

- Place the left boot on an outboard running board or peg. If the vehicle has
  none, add one; standing on the body or the seat reads as a doll being posed.
- Swing the right leg **out to the side** with hip Z abduction (about +0.9 to
  +1.25 rad), knee flexed 1.2 to 1.4. Hip X flexion swings the leg forward,
  through the handlebars; that is the common error.
- Raise the root in a small arc (0.10 to 0.20 m) so the boot clears the saddle,
  then drop onto the seat. Do not hop a body-height above it.
- Seat root = the pelvis mesh's contact point, not the rig origin. Sit with the
  pelvis on the cushion, both boots on the boards, knees 0.9 to 1.1 rad, toes
  forward; hands reach the grips with soft elbows. Move the bars to the hands
  before hyperextending the arms.
- A rider pose is not the standing pose rotated: torso upright 0.15 to 0.25,
  hips flexed -0.9 to -1.1, hips abducted ±0.25 to ±0.35, knees 1.0 to 1.1,
  ankles near -0.05.
- Keep the vehicle and rider on the same mover after departure, with the rider
  root attached to the seat anchor; a bob applied to one and not the other
  separates them.

**Proof.** A nine-frame side strip at 0.15 to 0.25 s spacing: approach, lift,
over-rim, lower, release, step, leg-swing, seat contact, ride. Shoot it at 1:1
and log wrists, ankles, prop base and seat. A still cannot prove a mount.

## System And Combat Animation

The character section above covers body mechanics. This section covers the
systems that carry a diorama: towers, projectiles, reactions, deaths,
bosses, crowds and secondary motion. Every one is a pure function of `t`, driven
by a pre-simulated event list.

### The Five Layers In Code

| Layer | Driver | Typical period | Use |
| --- | --- | --- | --- |
| ambient | `sin(t*f + phase)` | 1.5 to 5 s | breath, flame, flag, scan |
| locomotion | distance along a path | stride length | walk, fly, hop, slither |
| action | absolute event time | 0.3 to 1.2 s | fire, swing, slam, dive |
| reaction | event time + direction | 0.15 to 0.5 s | flinch, flash, knockback |
| death | absolute death time | 0.6 to 1.4 s | collapse, debris, residue |

If an action and a reaction share a clock, derive both from the **same event
timestamp**. Two independent cycles will drift apart even if they match on the
frame you happened to inspect.

### Deterministic Timeline

```js
const DT = 1 / 40;
const LOOP = 46.0;

const pulse = (t, t0, tau) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));
const win = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
const spring = (t, t0, freq = 9, damp = 6) => {
  const a = t - t0;
  return a < 0 ? 0 : Math.exp(-damp * a) * Math.cos(freq * a);
};
```

Run the battle at `DT` from 0 to `LOOP` once at load. Store:

```js
events.push({ t, kind: 'shot', tower, target, from, to, flight, damage });
events.push({ t, kind: 'impact', x, y, z, species, dir });
events.push({ t, kind: 'death', id, type, x, y, z, t });
events.push({ t, kind: 'gate', x, y, z, hit: n });
```

The render loop reads the events whose time has passed. It never re-simulates
and never carries state between frames. `?t=12.4` freezes the whole system,
including effects, so every QA shot is reproducible.

### Tower Attack Grammar

A tower attack needs five visible stages. Cut one and the tower reads as a
spawner, not a weapon.

| Stage | What the player sees | Time |
| --- | --- | --- |
| acquire | head/turret turns; crew leans; crystal brightens | 0.15 to 0.4 s |
| wind-up | rail pulls back, arm cocks, coil charges, barrel vents | 0.1 to 0.35 s |
| release | muzzle flash, string snap, beam origin flare, arc jump | 1 to 2 frames |
| travel | bolt, ball, beam, chain, projectile with trail | 0.05 to 0.6 s |
| impact | flash on target, dust/goo/ice/feathers, ring | 0.1 to 0.25 s |
| recovery | recoil returns, crew resets, smoke clears | 0.2 to 0.5 s |

Tower archetypes:

- **Ballista / arrow.** Slow traverse, rail recoil 0.15 m, string snap, bolt
  with a short trail, thunk and a small dust puff. Reload is a winch crank.
- **Cannon / bombard.** Breech recoil 0.2 m, muzzle flash and a smoke ring,
  arcing iron ball, impact dust and a ground ring. Never rock debris.
- **Beam / lance.** Crystal pulses, origin flare, a sustained channel with a
  scrolling texture, a target flash, a heat ramp. The beam dies on the frame its
  target dies and respects line of sight. Never a static white cylinder.
- **Tesla / chain.** Coil hum, charge glow, a jagged arc that hops to two or
  three targets, capacitor fade. The arc must visibly leave the coil.
- **Support / aura.** A ground ring with a clear radius, a pulse that travels
  outward, a colour shift on affected units, and a caster animation that shows
  the source. No invisible buff. Audit it as a field, not a shot: origin, area,
  ramp, affected-target change, decay.
- **Rotating emitter / lighthouse.** A continuous sweep is not a turret. Keep the
  base sweep `theta(t)`, add a short dwell window when a target crosses the
  beam, and ease in/out of the dwell so the housing never snaps. Fire inside the
  dwell; return to the sweep with the same phase it would have had. If the beam
  can point into the goal pocket, mask that sector physically (back-screen,
  shroud) rather than breaking line of sight with a special case.

If the tower has a crew, the crew reacts: brace, pull, cover ears, crank. A
crew that stands in the same pose through a cannon shot is a mannequin.

### Machine Grammar (non-combat)

A loom, press, crane, oven, pump or lighthouse lens is not a tower, but it needs
the same causality. Replace "attack" with **work**:

| Stage | What the player sees | Time |
| --- | --- | --- |
| engage | clutch drops, belt tightens, valve opens, lamp housing turns | 0.15 to 0.4 s |
| work | beam sweep, flywheel spin, ram stroke, dough stretch, water flow | 0.3 to 3 s |
| output | light pool, pressed sheet, lifted crate, baked loaf, water rise | 0.1 to 0.5 s |
| settle | flywheel coasts, valve closes, belt slackens, lamp returns | 0.2 to 1 s |

Audit: **input** (what feeds it), **motion** (what turns/strokes), **output**
(what changes in the world), **residue** (waste, heat, crumbs, steam). A machine
with a beautiful motion and no output is a kinetic sculpture; give it a product
and show the product.

### Goal Response Vocabulary

A boss or disaster must act on a **goal**, not just a door. Pick the response
from the goal's material:

| Goal | Contact response | Failure |
| --- | --- | --- |
| door / gate | flash, shake, crack, dust from the lintel | leaf hangs, ward closes |
| valve / pipe | spray, gauge drop, pipe shudder, hiss | pressure falls, lamp starves |
| rope / bridge | slack, sag, strands snap, deck drops | span falls, route closes |
| wall / dam | chip, crack, water seep, block falls | breach, flood |
| tree / mast | bark split, creak, tilt, leaves fall | trunk breaks, canopy drops |

Put the contact point on the **silhouette edge** of the goal, not buried in its
body, and keep it clear of the boss's shoulder/weapon. If the goal is tall, put
the contact at chest height and turn the boss 0.3 to 0.4 rad so the weapon shaft
crosses the frame. The response and the contact must share the same timestamp.

### Projectile Grammar

1. Spawn at the **muzzle, rail tip, hand or crystal**, not the tower centre.
2. Give it a fixed flight time or a solved arc; do not integrate physics in the
   render loop.
3. Add one trail or one tumble. A bare sphere is a debug object.
4. On impact, switch to a **species-specific** effect: dust and ring for iron,
   splinters for wood, goo for slime, feathers for flyers, ice shards for frost.
5. Remove it on the impact frame. No projectile survives its target.

A projectile that is visible after the target is dead is a bug, not a flourish.

### Creature Animation Grammar

| Archetype | Locomotion | Action | Reaction | Death |
| --- | --- | --- | --- | --- |
| small scrapper | scamper, 2-beat | quick stab | flinch + skid | cloth, knife, stain |
| brute | heavy walk, shoulder roll | overhead cleaver | stagger, shoulder dip | iron plates, sword, dust |
| slime | squash-hop | lunge | wobble, split | goo splat, two lets |
| flyer | flap, bank, hover | dive | spiral, feather burst | feathers, spiral fall |
| boss | weight shift, slow stride | telegraph + slam | recoil, knee dip | collapse, gear, weapon, soul |

Every creature gets a **hit flash** on the body material for 0.08 to 0.12 s and
a **directional flinch** opposite the impact. Do not reset the whole pose on a
hit; blend a flinch over the current pose and recover.

Death is a sequence, not a switch:

1. **Impact frame:** freeze or compress the body, flash, drop the weapon.
2. **Collapse:** 0.25 to 0.5 s; knees buckle, torso folds, flyer spirals.
3. **Species debris:** 5 to 8 pieces of cloth, iron, goo, feathers, bone.
4. **Residue:** a stain, scorch, splat or dropped gear that stays for 1 to 3 s.
5. **Soul:** a brief additive flicker or wisp, 0.2 to 0.4 s, then gone.

A death that is a sphere burst, a grey puff or a rock shower fails the bar even
if the particle count is high.

### Boss Choreography

A boss exists to **act on a place**, not to have more hit points.

- Stop it outside the threshold by **body depth + weapon reach**. At the gate,
  that was 2.0 m short of the path end, which left the troll on the drawbridge
  with the door visible behind the club.
- Turn it **three-quarter to the goal** (about 0.35 rad off the door axis) so
  the weapon shaft reads across the frame instead of end-on. An end-on club
  head is a grey rock at the door.
- Build the weapon as a separate group: haft, head, two iron bands, six studs,
  six spikes, and a visible hand attachment. A stone head with no haft is a
  floating rock.
- **Telegraph** 0.4 to 0.7 s, contact 0.1 s, recovery 0.3 to 0.5 s. The contact
  pose is driven by the same gate-hit pulse as the door flash and crack.
- Put the door response on the same timestamp: flash, shake, crack, dust. If
  the club hits at 41.075, the door cracks at 41.075, not 41.2.
- Lose the tower's line of sight to the gate pocket while the boss is there.
  A beam arriving at the same pixels as the club steals the beat.
- Prove it with two shots: contact frame and contact +0.2 s. The first shows
  contact and flash; the second shows recoil. If the club is hidden at contact
  and only appears on recoil, the pose is late.

### Crowd Variation

- Phase offset per actor: `phase = hash(i) * TAU`, never one global `sin(t)`.
- Vary speed by 4 to 8 percent, scale by 2 to 4 percent, and idle by phase.
- Stagger spawns and attack windows by at least 0.15 s. A shared window makes a
  group move like a chorus line.
- Give each actor a lane or offset on the path; two actors at the same waypoint
  stack into one silhouette.
- At a shared door or gate, one actor reaches the threshold; the rest hold back
  at `0.9 + i * 0.8` along their own path.

### Secondary Motion

Flags, banners, cloth, chains, hanging bones, smoke and fire are the cheapest
way to make a static scene feel alive. Rules:

- Drive with `sin(t * f + phase)` and a phase offset per object.
- Add a lag of 0.1 to 0.2 s behind the parent motion; cloth that moves exactly
  with the body looks rigid.
- Keep amplitude small: 0.03 to 0.12 rad for cloth, 0.02 to 0.06 for chains.
- Cap the count. Six flags at different phases read as wind; twenty read as
  noise.
- Never let a secondary object enter the threshold pocket or cover a face.

### Animation QA

For every hero actor, capture:

- a **6-frame strip** of locomotion at 0.1 s spacing;
- the **action contact frame** and contact +0.2 s;
- the **death** at impact, mid-collapse and residue;
- the **boss contact** at the door plus recoil;
- the **beam** at full channel and the frame after the target dies;
- a **pivot parentage strip**: freeze at minimum and maximum yaw and log the world
  positions of every fixed deck prop. They must not move; only the turret and its
  carriage should. Also check world bounding-box overlap between the fixed
  station and every mesh under the yaw group: zero hits.

The strip passes when feet plant, knees bend backward, no joint opens a wedge,
no part floats, and the silhouette changes between frames. A still cannot prove
an animation; a strip can.

## Service And Queue

A market, hatch, ticket window or bakery is a **queue machine**: people arrive,
advance one slot, order, pay, receive and leave. Build the queue before the
props; it is the scene's clock.

**Slots.** Lay four to six positions along the counter, 0.65 to 0.80 m apart,
perpendicular to the hatch. Everyone in the queue shares one lane and one
heading; a diagonal queue reads as a crowd, not a line.

```js
const SLOTS = [q0, q1, q2, q3]; // q0 is at the hatch, q3 is the tail
const toSlot = (p, slot) => ({ x: slot.x, z: slot.z });
```

- A customer's mover is a sequence of `seg(t0, t1, track)` legs: **enter →
  tail → advance one slot per serve → counter → exit**. Keep each leg on its own
  track; re-pathing every serve makes feet slide.
- Advance the whole queue on the serve timestamp, with a 0.06 to 0.12 s stagger
  by slot. The person at the hatch does not advance; they receive and turn away.
- When a customer leaves, the next walks **into** the vacated slot; do not teleport
  the queue forward while the camera is on it.

**Customer state machine.**

| State | Visible action | Gate |
| --- | --- | --- |
| arrive | walk with distance-driven gait | until slot reached |
| order | point at menu/board, head turns | only when speed = 0 |
| pay | hand to counter / phone | after order, only when still |
| wait | idle, weight shift, phone | until bag lands |
| receive | both hands or one hand out | at bag contact |
| exit | turn, walk out, carry bag | after receive + 0.3 s |

**The gate is the whole fix.** Never blend a standing gesture (`PAY`,
`POINT_MENU`, `RECEIVE`) into a walking pose. If the gesture has straight legs
and the walk has bent knees, the mix straightens the legs while the root keeps
translating: the figure glides. Compute `state.moving` from the mover and write:

```js
if (state.moving) pose = walkPose(phase, { amp, arm, carry });
else if (t < orderEnd) pose = mixPose(idle, POINT_MENU, bell(t, order));
else pose = idlePose(t, phase);
```

- Serve **after** the counter arrival, by at least 0.25 s. A bag that lands before
  the customer reaches the hatch is the second-most-reported queue bug.
- One action at a time: order, then pay, then receive. Overlapping windows make
  the arms fight.
- A late customer may arrive after the queue empties, but only once; reusing the
  same slot for a second invisible customer reads as a spawn.

**Machine slots.** A laundromat, workshop or gym uses the same clock with
machines in the slots: washer drum → dryer drum → fold table. Advance the batch
on the **end-of-cycle** timestamp, not on a fixed beat, and land the next action
0.25 s after the lid/door closes. A drum that starts tumbling before the door
shuts is the machine version of serving before arrival.

**Staff side.** The cook works the grill; the cashier takes payment and hands the
bag across the hatch. Their gestures are independent loops, but the bag's release
comes from the cashier's hand position, not a fixed world point. Keep a stack of
paper bags at the hatch and decrement it per serve; the last bag is the goal
object.

**Proof.** Freeze the approach every 0.25 s for two strides and log root speed,
`moving`, hip/shoulder angles and slot. The strip passes when the feet alternate,
the root advances smoothly, no standing gesture appears while `moving` is true,
and the serve timestamp is after the arrival timestamp.

## Vehicles

A vehicle is the prop the user inspects the moment a door opens, so build it to
be opened. Model facing +Z.

| Part | Size and place | Note |
| --- | --- | --- |
| floor pan | 1.62 x 0.10 x 4.02 at y 0.35 | dark; its top is the cabin floor |
| rockers | 0.12 x 0.16 x 3.92 at x ±0.87 | stay with the body |
| front fender | 0.10 x 0.56 x 1.05 at z 1.62 | body side ahead of the front door |
| rear quarter | 0.10 x 0.56 x 0.72 at z -1.84 | body side behind the rear door |
| belt moulding | 0.10 x 0.08, one per fixed panel | never one rail across the apertures |
| bulkheads | 1.84 x 0.56 x 0.16 at z ±2.12 | close the tub |
| roof | 1.48 x 0.08 x 1.94 at y 1.44 | drip rails at x ±0.76 |
| pillars | A raked -0.64, B upright, C raked +0.60, 0.075 thick | |
| windscreen | 1.44 x 0.62 x 0.05, rotation.x -0.64 | glass between the A pillars |
| side glass | none | windows down: open holes between the pillars |

Cabin: dash 1.46 x 0.15 x 0.30 at y 1.00 z 0.80; wheel torus r 0.125 at
(-0.40, 1.10, 0.68) rotated -0.42; front cushions 0.46 x 0.10 x 0.50 at y 0.57
**z 0.30** with backs at z 0.04; rear bench 1.20 wide at z -0.50 with its back at
z -0.74.

The windscreen is not a plane at the front of the cabin: rotated -0.64 it sweeps
back to about z 0.59 at its base. A front seat at z 0.72 therefore sits **inside
the glass volume**, and every occupant's head prints on the windscreen from every
angle. Keep the cushion's front edge at least 0.25 behind the glass base and move
the dash, wheel and column back with it.

**Doors.** Hinge at the shut line, leaf extends backward in -Z: front 1.15 to
-0.15, rear -0.15 to -1.45, leaf 1.30 long and 0.55 high. Pivot at
`(side*0.86, 0.62, hingeZ)`, children are outer skin, inner card, sill strip,
handle, and any livery; `rotation.y = -side * open` swings it out. Swing 1.28 rad
for a saloon, up to 1.52 for a cruiser. Split every full-length body moulding at
the shut lines: a moulding left on the shell reads as the top of the door left
behind when it opens.

**Boot.** Pivot at (0, 0.90, -1.46), lid extends -Z, `rotation.x = +0.95` lifts
the rear edge. Well floor y 0.44 against a lid underside at 0.89, so cargo must
fit 0.45: bags r 0.165 at y 0.63 (tops 0.80) clear it. Close the boot off from
the cabin with a parcel shelf (1.74 x 0.05 x 0.66 at y 0.86, z -1.10) and a
bulkhead behind the rear seat back (1.74 x 0.46 x 0.06 at y 0.63, z -0.82);
without them the boot is open to the cabin through the rear windows and the load
reads as sitting on the closed lid.

Cargo carries `visible = false` until it lands and `userData.noMerge = true`.
A throw needs an object that travels: keep one world-space bag per thrower and arc
it hand → slot with `p.y += sin(f*PI)*0.6`, switching the slot's bag on when the
flight lands, not at release.

### Scooters, Cargo Bikes And Mounts

A scooter is not a car with two wheels. Build it around the contact points: two
tyres on the ground, a floor pan for the boots, a seat the pelvis can sit on, bars
the hands can reach, and a cargo crate whose opening is visible from the camera.

Reference local frame, facing +Z, for a delivery scooter at 1.0 scale:

| Part | Place | Note |
| --- | --- | --- |
| wheels | r 0.26 at z ±0.62 | tyre + hub + fender; both touch y 0 |
| floor pan | 0.60 x 0.04 x 0.30 at y 0.30 | top is the boot surface |
| running boards | 0.12 wide at x ±0.235 | outboard, full length; the left boot lands here |
| body / shield | 0.46 wide, up to y 0.72 | front leg shield, not a box |
| seat | top 0.83 at z -0.18 | measure the cushion top, not the body |
| bars | y 1.06, grips x ±0.33, z 0.52 | raise bars to the rider's hands |
| cargo crate | 0.52 x 0.44 x 0.46, base y 0.86, z -0.56 | open top, interior floor ~0.91 |
| bungees | two cords across the opening | clip open during loading |

- **Seat anchor.** `seat = local(0, 0.83, -0.18)`; set the root so the **pelvis
  mesh** contacts the cushion, then prove it in a seated portrait. On the Night
  Market scooter that is root y 0.09 against a 0.83 seat; do not copy a
  `seatY - hipY` formula from a chair, because the pelvis mesh hangs below the
  hip joint. A copied root puts the rider on the front edge or floating.
- **Boots.** Add outboard running boards at y 0.30 if the floor pan is narrower
  than the rider's stance. Ankles at 0.30, knees 1.0 to 1.1, toes forward; both
  soles flat. Perching one boot on the body is the "doll on a toy" read.
- **Hands.** Grips at the wrist height; a rider with hands 0.15 m above the bars
  is not holding them. Move the bar/riser up or soften the elbow; do not
  hyperextend the shoulder.
- **Cargo.** A crate with an open top needs an interior floor and side walls;
  a bag lowered to `baseY + 0.01` sits inside. Keep bungees as a separate group so
  they can unclip during loading and close over the lid afterwards.
- **Lights.** One emissive lens plus a small halo sprite; a headlight cone only
  at night. A large additive disc reads as a floating balloon; a brake light is a
  second, smaller lens, not a copy of the headlight.
- **Clipping.** The whole vehicle + rider + cargo move as one mover after
  departure; clip the group at the slab edge, and hide rider shadow at the same
  time the vehicle shadow takes over.

Mounting is authored with the sequence in **Carrying, Loading And Mounting**:
left boot on the board, right leg abducted over the saddle, small root arc,
pelvis on the seat, hands to the grips. Prove it with the nine-frame side strip.

### Buses, Vans And Long Vehicles

A bus is a moving room. Its job is a window band, a door, a route sign and a
headlight sweep; the chassis is the least visible part.

| Part | Size / place | Note |
| --- | --- | --- |
| body | 9 to 12 m long, 2.5 wide, 3.0 high | one box with a chamfered roof |
| window band | y 1.35 to 2.45, full length | dark glass + warm interior, not a transparent plane |
| door | 1.1 wide, front or centre | step well, grab rail, lit interior |
| wheels | r 0.50, wheelbase 5.5 | two axles; arches cut into the skirt |
| route sign | front above the windscreen | emissive text/colour blocks, readable at 1:1 |
| livery | one band + one number | never a full advertising wrap at this scale |
| headlights | two lenses at y 0.65 | plus cones and a floor ellipse |
| interior | 4 to 6 lit windows + driver silhouette | a dark box with one warm strip reads as a bus |

- **Speed and weight.** 5 to 8 m/s, no bounce; one brake dip at the stop. A bus
  that bobs like a car reads as a toy. The body leans 0.01 to 0.02 rad on the
  brake, no more.
- **Headlight sweep.** Two cones and one long floor pool travel with the bus.
  Do not light the facade with the cone; a 12 m vehicle with a global spotlight
  turns night into noon.
- **Occlusion.** A bus between the camera and an interior hero covers the beat.
  Put its lane behind glazing at -Z, or time it before/after the contact. Check
  the occlusion frame at the hero timestamp.
- **Doors.** If the door opens, model the step well, a grab rail and an interior
  light; a black rectangle reads as a hole. For a passing bus, keep the door shut.
- **Clip.** The whole bus, lights, interior and driver move as one group; hide
  its contact shadow at the slab edge, same frame as the vehicle.

A bus that reads as a white box with black windows is not finished: the window
band, route sign, wheel arches and one warm interior strip are the minimum.

### Seats, Exits And Transfers

Seat root = cushion top minus hipY, which is **-0.38** in car space on this rig:
the hips settle into the cushion and a masked head clears the roof with 6 to 8 cm.
At -0.18 a hooded head lands about a centimetre under the roof panel and any bob
prints a dark pixel on the white roof. Measure against the head mesh, not the head
joint, and lower the seat rather than raising the roof, which is pinned to the
pillars.

The stand spot is 2.00 m out from the car's centreline and 0.30 behind the hinge
for a front seat, 0.55 for a rear:

```js
const exit = toWorld(car, side * 2.00, seatZ - 0.30);
```

An open leaf hangs in the plane of its hinge, so an exit level with the seat puts
shoulders and head through the door skin. 0.30 still sits inside the aperture and
leaves room for a torso plus a swinging arm. 2.00 out is about 1.07 of daylight
from the flank, and that is not padding: at 45/33 a figure 0.7 off the flank sits
wholly inside the car's silhouette with his feet on the rocker line and reads as
welded to the body.

The climb is authored in the **car's own frame**, so it works at any parking
angle. It ships: `templates/transfer.js` is the whole move (`transfer`,
`climbAt`, `CLIMB`, `stepPose`, `standSpot`), and `templates/poses.js` carries
the four climb poses plus the walk and run cycles it blends between. Copy them,
do not retype them. `k` runs 0 at the open door to 1 at the seat, `dy` is the root height
above the seated root, and the pose is a real sequence: stand, reach, crouch in,
sit on the edge, swing the legs in, settle.

```js
const CLIMB = [
  { u: 0.00, k: 0.00, dy: 0.380, pose: STAND },
  { u: 0.16, k: 0.03, dy: 0.330, pose: REACH },      // hand to the roof edge
  { u: 0.36, k: 0.16, dy: 0.120, pose: CROUCH_IN },  // knees deep, hips dropping
  { u: 0.56, k: 0.38, dy: 0.010, pose: SIT_EDGE },   // perched, feet still down
  { u: 0.76, k: 0.66, dy: 0.000, pose: LEGS_IN },    // knees up, feet over the sill
  { u: 0.90, k: 0.88, dy: 0.000, pose: mix(LEGS_IN, SEATED, 0.55) },
  { u: 1.00, k: 1.00, dy: 0.000, pose: SEATED },
];
```

The transfer wraps that climb: the first `STEP_SHARE` (0.26) of the window is one
stride from the stand spot to the door, the rest is the climb, and on the way out
the stride away comes last. The body only reaches cushion height once the hips are
over the sill, so nobody sinks, floats or slides through the bodywork. `DOOR_STAND_X`
1.34, `DOOR_STAND_DZ` -0.06, durations 1.05 to 1.20 s each way. Never derive the
duration from the next beat's start: under about 0.9 s the whole move reads as a
slide or a blur. Move the following beat later instead.

Facing is the trap. The outward yaw points away from the car, so a figure entering
with it climbs in backwards: body into the seat, face to the street. On the way in
every key before the seated ones faces the car, including the standing key that
gets forgotten. Resolve it from geometry, never from the approach path's tangent:
a path's opening segment runs along the street, so `path.at(0).yaw + PI` points
down the kerb and lands the figure a right angle off whichever way he arrived.

```js
const faceYaw = car.yaw - side * (PI / 2);       // square to the open door
const face = Math.atan2(seat.x - stand.x, seat.z - stand.z);   // stand -> seat
// turn to the windscreen only once the hips are on the cushion
const turn = smooth(clamp((v - 0.62) / 0.30, 0, 1));
yaw = lerpAngle(faceYaw, car.yaw, turn);
```

Staging rules that came out of real reports:

- **One window per actor, staggered 0.2 s or more.** A shared window climbs two
  men into a seat on the same frame, which reads as choreography, and at 0.1 s
  they climb through each other.
- **Separate a pair in screen space, not in world space.** At a locked 45/33
  view, moving a figure further out along the camera axis barely changes where it
  lands on screen: it stays stacked over the car's flank and still reads as one
  blob, which is why pushing the stand spot from 1.6 m to 2.0 m did not cure a
  "stuck" report. What separates them is offset along the car's axis, because that
  is screen x: rear occupant 0.72 behind his hinge against 0.30 for the front
  leaves 1.2 m of screen distance instead of 0.8, where two figures merge into one
  silhouette. Project both actors with `v.project(camera)` and compare pixels
  before concluding they are spaced.
- **Doors are a timeline, not a state.** Open the leaf 0.15 s before a transfer,
  shut it 0.5 s after the last man is clear, reopen just before the entry. A car
  left open for the eight seconds its crew is away reads as the crew stuck in the
  doorway, however clean the walk is.
- **A run that ends at the car must not hand straight into the transfer.** End it
  0.4 to 0.6 s early, blend out to STAND over the last 12 percent, hold a beat at
  the door, then climb.
- **Seated figures stay visible.** Hiding them when the entry ends sends an empty
  car down the street, which the user reads as a bug, not a cutaway.

### Clear Spots, Shut Doors

- **A shared doorway needs one lane per actor plus a hold-back on the approach.**
  Actors on the same waypoints put the second in the first's back and stack at the
  threshold. Offset the approach per actor, stop each one short of the door by
  `0.9 + i*0.8` along his own path, stagger the walk-in windows by 0.25 s, and let
  the lead actor alone reach the threshold: the kick, the first step through. Four
  men then read as a queue filing in rather than a scrum.
- **Diagnose "stuck" with numbers, not frames.** Freeze in 0.3 s steps across the
  beat and print every actor's x/z with the pairs closer than 0.6 m. A pair that
  holds that close for more than one sample is jammed; a single sample is two men
  passing. At 12 px a figure a screenshot cannot tell those apart, and nudging
  spacing by eye fixes the wrong thing: the real cause is usually a route that
  ends where another actor already stands.
- **Give every actor a route out of every beat.** Two officers left in a cover
  crouch at the kerb while everyone else moves is a direction bug, and the report
  is always "they are stuck" however correctly the two are separated.

### Clipping At The Diorama Edge

Vehicles enter and leave the block, and the slab is a window. Four world-space
planes on the renderer for the scene pass, cleared before the post quad:

```js
const CLIP = [
  new THREE.Plane(new THREE.Vector3( 1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3( 0, 0, 1), hz + 0.05),
  new THREE.Plane(new THREE.Vector3( 0, 0,-1), hz + 0.05),
];
r.clippingPlanes = clipPlanes; r.setRenderTarget(rt); r.render(scene, camera);
r.clippingPlanes = [];         // before the full-screen quad
```

A car entering nose-first shows its own front surfaces at the cut, so the cut
reads clean; one leaving tail-first exposes the cut face, so keep the interior
modelled and it reads as a cutaway. Route every vehicle one way, in at one end of
the street and out at the other, no reversing and no angled parking: an angled
park reads as a collision, and backing in reads as a bug. Two vehicles sharing a
lane need a departure gap (`pLeaveGap` ~1.15 s) or the far one drives through the
near one.

## Effects

- **Water**: `MeshPhysicalMaterial` with vertex colours, not a custom shader, so
  it receives shadows. Ramp shallow to deep teal, never to navy: a near-black end
  quantises into a hard band the user reads as a hole.
- **Wake**: unlit additive foam streak plus 8 to 12 expanding ripple rings spawned
  behind a moving body every 0.4 s, fading as `(1-k)^2`.
- **Splash**: 60ish unlit additive droplets with gravity plus four rings and a
  foam disc; normal-blended white over teal reads as a grey blob. Seed the burst
  (`trigger(x, z, power, burstSeed)`), never `Math.random`: a frozen frame must
  reproduce the same burst, and the same frame must reproduce it again after the
  clock jumps.
- **Effects that integrate dt need a `reset()`.** Wake and splash advance by
  `dt`, so jumping the clock to freeze a frame does not jump their state, and the
  frozen splash shows whatever the last played frame left behind. Both templates
  expose `reset()`; the harness calls it and re-simulates in fixed steps from
  zero, which took a two-frame diff from 334 differing pixels to 18.
- **Smoke**: camera-derived billboards. The camera is locked, so copy its
  quaternion once and every puff is a plane facing the lens.
- **Debris with history**: loose notes or paper use a solved arc, a drag term, a
  spin about a random-but-deterministic axis, then slerp to flat and lie there for
  the rest of the loop. Deterministic hashing (`sin(n*127.1)*43758.5` fractional)
  keeps every replay identical.

### FX And The Edge

The slab is a window, but not every effect is a solid. Split them:

- **Cut FX** — debris, props, vehicles, bodies. Let the world clip plane cut
  them; model the interior so the cut reads as a cutaway, and route them so they
  enter and leave rather than parking across the edge.
- **Read-through FX** — light beams, glow, wake, spray, horizon haze. Do **not**
  let a hard clip plane slice them. End the effect at its target, fade intensity
  to zero before the slab boundary, or mask it with a soft edge. A lighthouse
  beam that stops in a straight vertical cut reads as a broken cone.
- **Additive over white.** Additive white on a white page is invisible. Give a
  beam a saturated core from the palette plus a darker under-edge or halo, and
  test it at 1:1 against the page, not against a dark viewport. If the beam must
  cross the whole frame, let it dim toward the edge; a bright hard-ended beam is
  worse than a soft falloff.
- **Clipped water.** A hull cut at the slab edge needs its interior and a foam
  plane at the cut, or it reads as a hollow shell. A moored boat should sit fully
  inside the frame for the beat where it unloads.

### FX Under The Snap

Every scene effect goes through the palette snap. That is the look, but it
punishes sub-pixel tricks:

- Author FX at **2 px or wider** at the target buffer. A 1 px additive wisp
  disappears or becomes a single palette dot; enlarge it or delete it.
- Use a **palette-legal saturated colour** and a dark contour, not pure white.
  White clips to the page and the snap has nothing to quantise.
- Do not rely on a smooth gradient to carry an effect. Build it from 2 to 4
  palette steps, a scrolling band, or a shape with a hard edge.
- Test with `?dither=0` and at 1:1. If the effect only reads in a downscaled
  preview, it is not in the render.

### Contact Contexts

"Touching the ground" is not one rule:

- **Ground prop:** contact shadow plane 0.018 above the slab; lowest vertex on
  the deck, not floating.
- **Deck / gallery / table:** the shadow belongs on that surface at its Y, not on
  the slab below. Parent the figure and shadow to the deck, or project onto the
  deck plane; a gallery figure with a slab shadow reads as a ghost.
- **Water:** the hull sits below the waterline; use a foam ring at the waterline
  and a wake, not a contact shadow. A floating boat with a hard shadow on the
  water reads as a toy on a table.
- **Vertical / wall:** a ladder, hook or rope needs a contact mark at the rung,
  grille or rail it bites, plus a small recoil; a hook in mid-air is a prop.

## Combat Readability (towers, bosses, deaths)

A diorama is judged on whether the **cause and the consequence are both
visible at the locked camera**. Geometry that is correct in world space can
still read as a bug on screen. Run these gates before calling a combat beat
finished.

- **Clear the threshold.** Keep at least 2 m of empty ground in front of a
  portal mouth, gate, or spawn arch. No crates, barrels, boulders, bones, or
  hanging vines in that pocket. Remove fireflies over the mouth, and never put
  rising smoke there: a grey billboard above an arch reads as a rock flying out
  of the entrance, even when it is soft and transparent.
- **Give every tower a legible grammar.** Origin flare, a readable travel or
  channel, and an impact that lands on the target. A beam needs contrast against
  both the tower body and the page (there is no sky), plus motion along its
  length; a plain white
  cylinder over a white tower reads as a waterfall or a static icicle. Use a
  scrolling band texture, a darker halo, and a target flash. If the line of
  sight is blocked by the keep, a foreground tower, or a ruin, pick another
  target instead of drawing through the wall.
- **A beam that fires at a dead target is a bug.** Store the target id on every
  beam event and hide the beam on the frame its target dies.
- **A boss with a goal must act on the goal.** Stop it outside the threshold by
  at least its body depth plus weapon reach, face the door, and make the weapon
  visibly contact the door. Position alone is not enough: sync the contact pose
  to the door-hit timestamp (a decaying pulse from the simulation), so the
  club/ram/fist is low on the same frame the door flashes, shakes, and cracks.
  If the weapon is off-screen, through the wall, or on the ground at the hit
  frame, the beat is not finished.
- **Do not let an attack hide the story.** A boss at the gate and a tower beam
  arriving at the same spot fight for the same pixels. Let the tower lose line
  of sight to the gate pocket, or dim/shorten the beam there; the door beat
  wins. The player can see the beam elsewhere in the loop.
- **Deaths need a species, not an explosion.** No generic sphere, boulder, or
  rock burst on death. Use a body-specific collapse plus two or three
  type-coloured shards or cloth/armour/goo/feather pieces, a dropped weapon
  where the species carries one, a ground stain or splat, and a brief soul
  flicker. Cannon and mortar impacts land in dust and smoke with a ring, never
  in stone chunks. If a death reads as "grey puff", it is not done.
- **A stone weapon is not a floating rock.** A club, maul, or ram needs a
  visible haft connecting it to the hand, iron bands, studs, or spikes, and a
  colour that separates it from the wall it hits. Check the impact crop: if the
  head looks detached, add the haft/band contrast, not more debris.
- **Prove the beat with time, not a still.** Shoot the impact frame and the
  frame 0.2 s later. The first must show contact and the flash; the second must
  show recoil or follow-through. If the club is hidden at impact and only
  appears on the recoil, the pose is late.
- **Sync effects by timestamp.** Gate hits, door cracks, beam impacts, and
  death pulses must derive from the same simulated event time. Two independent
  cycles will drift apart on a long loop even if they match on the frame you
  happened to inspect.

### Attack Audit

Run one row per tower, at the timestamp it fires. A tower that never fires in
the loop is scenery, not a defence.

| Check | Pass condition |
| --- | --- |
| origin | muzzle, rail, crystal or hand is visible and offset from the body |
| wind-up | at least 0.1 s of visible anticipation |
| travel | projectile or beam is traceable across at least 4 frames |
| impact | lands on the target with a species-specific effect |
| recovery | weapon returns; crew resets; no snap to rest |
| count | `shots > 0` in the sim stats for this tower |
| no stale | no projectile or beam outlives its target |

If a tower fails "origin", move the spawn point; adding more impact particles
will not fix it. If it fails "travel", slow the projectile or widen the trail;
a 1-frame hit is a hitscan, which is fine only for a beam.

### Field Audit

A **support, aura or ground field** has no projectile and must not be failed for
that. Audit it on five field stages instead:

| Check | Pass condition |
| --- | --- |
| source | emitter, valve, horn mouth or caster hand is visible |
| area | radius/cone is readable on the deck; no floating ring |
| ramp | effect grows over at least 0.15 s; not an instant decal |
| affect | affected units visibly change (speed, colour, stagger, burn) |
| decay | effect fades/expires on the loop, leaving residue |
| count | `events > 0` for this field in the sim stats |

A field that never expires is a lighting change, not an attack.

### Death Grammar

| Species | Body collapse | Debris | Dropped | Residue |
| --- | --- | --- | --- | --- |
| goblin | fold forward, knees first | cloth scraps, 2 bone chips | knife or spear | dark stain |
| orc | drop to one knee, then side | 3 iron plates, 2 tusk chips | cleaver or sword | dust + blood |
| slime | flatten, then pop | 6 goo blobs, 1 core | none | glossy splat |
| flyer | spiral, wings fold | 5 feathers, 1 bone | none | feather on ground |
| human / crew | knees, then hat/coat fold | 3 cloth scraps, 1 tool | hat, keys or hook | oil or blood stain |
| boss | knee dip, torso fall, weapon drop | 6 armour plates, 2 horns | club | scorch + rubble |

Every death also gets a 0.2 to 0.4 s additive soul flicker. It is the punctuation
that says "this was a creature", not "this was a particle system".

### Beam And Impact Artifacts

- **A black band along a beam is a texture backing, not a shadow.** A canvas
  filled with black and then painted with white stripes still carries black RGB
  with alpha 1; under a render target it can survive as a dark segment. Clear the
  canvas and paint pale stripes with transparent gaps. Never use a black
  background for an additive beam texture.
- **A beam that looks like a waterfall** is a white cylinder against a white
  tower. Add a darker halo, a scrolling band texture, an origin flare and a
  target flash. The eye needs motion along the length and contrast at both ends.
- **A beam through a wall** is a line-of-sight bug. Sample the keep/foreground
  silhouette and drop the target if the segment crosses it; do not shorten the
  beam after it has already drawn through the wall.
- **A beam on a corpse** is a stale target. Store `targetId` on the beam event
  and hide the beam on the frame that id dies.
- **Dark smoke over a bright beam** reads as a black bite. Smoke is normal-alpha
  grey; if it crosses a beam, lighten it, move it out of the beam corridor, or
  draw the beam after the smoke. Do not assume additive blending saves it.
- **A projectile that looks like a floating rock** has no trail and no muzzle.
  Spawn it at the weapon, add a tumble or trail, and remove it on impact.
- **A muzzle flash with no recoil** reads as a sticker. Move the weapon back
  0.1 to 0.25 m and return it over 0.2 to 0.5 s.

### Prop And Landmark Failures

- **Two landmarks with one silhouette.** A skull tree behind a skull totem
  becomes one antlered monster; a cart beside a crate becomes a pile. Remove or
  move one. Project both to screen and check the union.
- **A trophy that floats.** Mount it on a board, plaque or branch with a visible
  rope, strap or nails. A skull in mid-air is a rock with eye sockets.
- **Loose skulls at the base read as white pebbles.** At diorama scale, a 0.1 m
  sphere with two dots is not a skull. Remove it or make it a clear bone pile
  with a jaw and horns.
- **A cart load made of pale spheres reads as a blob.** Use tied rectangular
  bales, straw tufts, a pitchfork and a sack. The load must have a construction
  logic, not just a colour.
- **Rising smoke over a threshold reads as rocks flying out.** Remove it from
  the pocket. Fire can glow without a smoke column.
- **A prop at the slab edge with its wheel or shaft over the void** breaks the
  cut-out. Move it in until the lowest contact and the full silhouette are on
  the deck.

## Build And Ship

`templates/build.mjs` bundles `src/main.js` to `dist/app.js` with esbuild (IIFE),
writes `index.html` and a standalone HTML with the bundle inlined, escapes
`</script` in the payload, and passes the replacement as a **function**, not a
string. `String.replace` expands `$&`, `$'`, `` $` `` and `$1` inside a string
replacement; a minified bundle routinely contains those sequences, which
silently injects the `<script src=...>` tag into the middle of the app and
breaks the standalone file. Always test the standalone over `file://`, not just
the served page. `--minify` for shipping; expect roughly 780 kB with
three.js inside.

Freeze and seek come free if everything is a function of `t`:

```js
const params = new URLSearchParams(location.search);
const frozen = params.has('t') ? parseFloat(params.get('t')) : null;
const startAt = params.has('from') ? parseFloat(params.get('from')) : 0;
window.__diorama = { THREE, scene, camera, renderer, post, director, cast,
  robbers, cops, mats, TL, CLIP, freeze(t){ frozen = t; draw(t); }, play(){}, view(){} };
```

`?t=12.4` is the whole QA surface: every screenshot and every diagnosis is a
frozen frame, so a screenshot never depends on timing luck.

## Surface, Motion And Event FX

These are the failures that survive a good first render: a finished-looking set
with one raw seam, a clean loop with a vehicle that teleports out, or an effect
that is technically present but reads as a grey rectangle. Audit them as a
system, on every subject.

- **Finish the edge, not just the field.** A heightfield, bank, road, water or
  terrain piece that meets the slab must feather to the slab height over the last
  0.5–1.0 m. Never end a terrain in a lip, a vertical wall or a portal-shaped
  hole. Prove it with a 1:1 crop of each visible slab edge at two nearby times,
  not a wide shot where the seam is 2 px.
- **A mover has not exited until its bounds clear the slab.** Keep the whole
  group — body, lights, shadow, cargo — visible through the complete run-out.
  Hide only after the world-space box is wholly outside the slab plus a 0.2–0.5 m
  margin. No early `visible = false`, no parking at the gate, no portal. If the
  scene uses a clip plane, the mover may be cut by it, but the cut body must
  continue moving out; a cut that freezes is the same bug.
- **Never fade a solid hero with material opacity.** Per-material opacity on a
  multi-mesh vehicle or figure produces ghosting and sort artefacts: some parts
  turn transparent before others, and the result is a see-through prop, not a
  fade. Cut, clip, or hide only when the bounds have cleared. Transparent glass
  and FX are exempt; whole-object fades are not.
- **Effects are events, not weather.** Exhaust, steam, dust bursts and impact
  puffs belong to explicit windows: start, rev, launch, hit, landing, open. If
  the brief does not ask for idle smoke, do not emit while the source is parked.
  A continuous plume erases the timing of the event it was meant to sell.
  One-shot exhaust is roughly **0.7–1.2 s**, with a short fade tail under 1 s.
  Check the event frame and event + 1.5 s: present then absent.
- **Anchor an emitter at the physical nozzle.** For a vehicle, the source is the
  exhaust-tip object (`(±0.66, 3.74, -0.74) * scale` on the truck recipe), not
  the engine centre, cab roof or a point chosen by eye. Put the tip
  in `userData` during construction and use that same object for the smoke. A
  plume that starts above or behind the stack reads as a floating cloud. If a
  canopy hides the tip, offset the birth point downstream in the open direction,
  not the source anchor; the audit's `maxOffset` allows that.
- **A halo is a sprite, not a quad.** A flat, untextured, low-opacity additive
  `PlaneGeometry` is a light-grey rectangle at the palette snap, especially over
  a dark board or wall. Use `haloPlane`/`softDiscTexture` from `detail.js`, a real
  emissive lens, or no halo. This is the single most common "what is that
  rectangle?" report.
- **Event FX must not cover the thing you are pointing at.** A smoke cloud that
  grows over a sign, jumbotron, face or gate has become the subject. Cap size,
  cap life, and move the source to the open side of the prop; verify at the
  event frame, not only at 60% of the burst.
- **Every correction gets a regression check.** For these failures the checks
  are: edge crop pair, mover bounds log, whole-group fade scan, emitter
  active/quiet windows, source-to-puff distance, flat-glow scan, and margin
  scan. `templates/qa/audit.mjs` runs the mechanical ones; the 1:1 crops remain
  human evidence.

## Verification

- **Build first, then shoot, then prove the edit landed.** A failed bundle leaves
  the previous `dist/` in place, and a refused or blocked edit leaves the source
  untouched, so in both cases every screenshot shows the old app and the fix
  looks like it did not land. Read the build's own output line, grep for a
  sentinel string from the change, and only then judge the frame.
- **Judge orientation from the transform, not the pixels.** At diorama scale a
  back and a front read the same: a 4x-downscaled strip once made a
  correctly-facing figure look like he was climbing in backwards, and the
  "spin" it appeared to do was an artefact of re-reading the crop. Print
  `group.rotation.y` and compare it with `atan2(dx, dz)` of the expected facing
  vector before re-shooting a facing fix.
- Screenshot 1280x800, 1388x950 (iPad landscape) and 390x844 (phone). Zero page
  errors in all three, and the framing holds at each aspect.
- Two shots 1.5 s apart differ (the loop is alive) and the camera position is
  identical (the angle is locked).
- A 1:1 crop shows square pixels, a dark contour, no speckle on flat deck.
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
  `actualDistance / fitDistance ≈ subjectScale`, the projected slab width fell
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

### Detail And Animation Audit

Run this after the build and before shipping. It is deliberately visual; a
number cannot prove that a club is touching a door.

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

1. Read this file and `templates/DESIGN.md`.
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

## Pitfalls

- **A building's roof is a large visible surface at 33 degrees.** Look down onto
  it and dress it, or keep buildings lower than they are deep.
- **A merge pass eats anything whose visibility is animated.** Batching
  same-material siblings keeps one `visible` flag, so hidden cargo comes back as a
  single invisible mesh that never appears, and the survivor's `getWorldPosition`
  reports local coordinates. Tag runtime-toggled meshes `userData.noMerge = true`.
- **Canvas size is presentation, resolution is the buffer.** Shrinking the display
  keeps the buffer; moving the buffer changes the art. `renderScale` 1.2–1.5×
  on a small subject sharpens it without making it larger; measure fps and inspect
  a 1:1 crop before keeping it.
- **Raising the buffer exposes geometry that hid at the old grid.** Re-run the
  portraits after any resolution change: floating hats, detached stripes and
  oversized noses show up there first.
- **A prop swallows a figure placed inside it.** Sit the figure on the near rim
  with the limbs outside; more detail inside will not read anyway.
- **Lying bodies convert joint Z rotations into vertical lifts.** Flatten
  shoulders to about ±0.15 and keep elbows near zero.
- **A springboard must move and the rider must follow it**: pivot at the root,
  integrate a spring on `rotation.z`, and put the feet on
  `pivotY + h*cos(flex) - arm*sin(flex)`.
- **A standing gesture blended into a walk straightens the legs and slides.**
  Gate `PAY`, `ORDER` and `POINT` on `!state.moving`; a still at one timestamp
  will not catch it, a 0.15 s strip will.
- **A carried prop parented to the root leaves the hands at the first turn.**
  Keep it in world space, solve from the wrists each frame, and log palm-to-prop
  distance.
- **A leg swung with hip X goes through the handlebars.** A side mount needs hip
  Z abduction, knee flex and a small root arc; hip X is for walking and sitting.
- **Shrinking the geometry or the canvas frame to satisfy "smaller"** shrinks
  the world clip, contact shadows and slab, or changes the 1:1 crop. Move the
  camera with `subjectScale` instead; the frame and backing buffer stay fixed.
- **A DOM caption on the white paper** is outside the diorama. Model the sign or
  use the browser title.
- **A hat hovering above the skull** is a brim at 0.225 instead of 0.192.
- **Oversized nose**: 0.044 at this camera is a snout, 0.038 is a nose.
- **Two figures at 0.8 m read as one silhouette.** Judge spacing from numbers.
- **A shared window synchronises a group.** Stagger every actor's window.
- **A door left open beside idle actors reads as stuck in the doorway.**
- **A pose switch is not a transition.** Cutting from a run into a transfer pops
  the whole body: blend out over the last 10 to 15 percent and hold a beat.
- **A cannon with a brass end cap is a baton.** Hollow collars, a recessed dark
  bore, a back disc and a lip ring; the hole must survive the 1:1 crop.
- **Fixed deck props parented to a yaw group sweep with the gun.** A powder keg,
  shot pile, rammer or crew member under the turret turns with every aim. Put
  them on a static wall locker outside the barrel arc, not just on the root at
  deck height; test world positions and bounding-box overlap at both yaw extremes.

## Project Layout

```
DESIGN.md              filled design sheet: premise, cast, systems, beats, budget
src/
  config.js            scene constants + clamp/lerp/smooth/pulse/hash
  main.js              renderer, scene, clip planes, resize, rAF, ?t= freeze
  core/
    palette.js         N entries + named C map
    post.js            PixelPost: gamma, grade, ink, dither, snap, rim
    materials.js       every material, palette-validated
    geometry.js        roundedBox, addBox, lathe helpers
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
`combat.js` for deterministic timing and death grammar. Effects:
`water.js`, `wake.js`, `splash.js`. Sheets: `DESIGN.md`.

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

## Skill Maintenance

The skill is part of the deliverable. After every shipped diorama, do a ten-minute
postmortem and write down what the user actually reported, not what you intended.

1. **Add at most three rules per routine project.** A skill that grows by fifty
   small rules becomes unreadable and the next reader skips it; a deliberate
   major overhaul is a versioned release, not a stealth append.
2. **Every rule needs evidence and a test.** "Clear the threshold" came from a
   screenshot of smoke above a portal; the test is a 1:1 crop of the pocket.
   "The club must touch the door" came from a still at 41.075; the test is the
   contact frame plus 0.2 s.
3. **Promote repeated fixes.** If the same bug appears twice, it is a missing
   rule, not a one-off.
4. **Retire stale rules.** If a template or pipeline change makes a rule
   obsolete, remove it in the same edit.
5. **Bump the version.** Patch for wording, minor for a new rule/section, major
   for a new contract or a reorganisation. Keep `SKILL.md.bak-v<old>` beside it.
6. **Update the templates and the project layout in the same pass.** A rule that
   points at a file that does not exist is worse than no rule.
7. **Test the skill on a new subject.** After a major edit, give a fresh model
   only this file and ask it to fill `DESIGN.md` for a different diorama. Fix
   every contradiction it finds; that is cheaper than discovering them after a
   build.

A useful postmortem entry has this shape:

```
BUG:    the club read as a rock at the gate
CAUSE:  end-on pose; haft hidden; no bands
RULE:   turn the boss 0.35 rad to the goal; build haft + bands + studs
TEST:   contact crop at the gate-hit timestamp; haft visible, head on door
```

Two entries from the truck-diorama correction pass:

```
BUG:    a light-grey rectangle floated beside the jumbotron
CAUSE:  a flat, untextured, additive PlaneGeometry used as a glow
RULE:   halos need a radial-alpha map, an emissive lens, or deletion
TEST:   qa/audit.mjs FLAT_GLOW plus a 1:1 crop of the board at the hero time
```

```
BUG:    both trucks vanished at the gate before the run-out finished
CAUSE:  visible=false keyed to a beat, not to world bounds clearing the slab
RULE:   hide only after the box is outside slab + 0.2–0.5 m; never fade solids
TEST:   qa/audit.mjs EARLY_HIDE over the full loop; exit strip at 0.2 s spacing
```

```
BUG:    the yellow truck smoked while parked, from a cloud above the cab
CAUSE:  continuous idle haze plus a guessed emitter point inside the body
RULE:   one start/rev event window, puffs born at the real stack tip; offset the
        birth point downstream if a canopy hides it, never the source anchor
TEST:   qa/audit.mjs IDLE_EMITTER / ORPHAN_EMITTER; event frame present,
        event + 1.5 s absent
```

## Changelog

- **3.6.0** — Renamed to Diorama throughout: the playbook, templates and QA docs
  now call the artifact a diorama. No code behaviour changed.
- **3.5.1** — Camera-scale rule made explicit: `subjectScale` is a post-fit
  multiplier (`0.70` = 30% smaller linearly), while `fillX`/`fillY` stay a fit
  margin. The camera template now exposes `fitDistance` and `subjectScale`;
  `qa/audit.mjs` now proves `distance ≈ fitDistance / subjectScale` when those
  two fields are exposed, and `post.size ≈ CSS × renderScale` when the post
  exposes it. Added the
  Dust Kings calibration (fit 67.93 → actual 97.05, projected slab 872 → 611 px)
  and a rule against shrinking the geometry or canvas frame to create margin.
  `PixelPost` gains a `renderScale` argument; Dust Kings renders at 1.25× (buffer
  1640 × 950 on a 1312 × 760 CSS canvas) so the smaller diorama keeps its edge
  detail without changing page size. The resolution section now separates buffer
  from layout and warns about the frame-rate cost.
- **3.5.0** — Surface/Motion/Event-FX correction release from a truck-diorama
  postmortem: finish heightfield/slab edges flush (no lip or portal), keep every
  exiting mover visible until its world bounds clear the slab, never fade a solid
  hero with material opacity, gate exhaust/steam/dust by authored event windows
  with the emitter at the physical nozzle, and replace flat untextured halo
  quads with radial-alpha sprites. New `qa/audit.mjs` checks flat glows,
  whole-group fades, early hides, teleports, idle/orphan emitters and paper-margin
  leaks; `shoot`, `portrait`, `sweep` and `strip` now fail with a nonzero exit
  code; QA README documents the optional audit contract. New DESIGN audit sheet;
  `detail.js` gains `haloPlane`/`softDiscTexture` so a soft light card is the
  default.
- **3.4.0** — The fragile code is now shipped, not described: `poses.js`,
  `transfer.js` (climb, stand spots, facing), `track.js` and a `stage.js`
  skeleton with a worked actor chain; `qa/` as runnable scripts (shoot, portrait,
  strip, probe, sweep) instead of a checklist; Numbers split into invariants and
  calibrated values. Water, wake and splash re-verified in `verify/water/`, which
  found two real defects: the splash used `Math.random` (now seeded) and neither
  effect could be frozen (both now expose `reset()`; the harness re-simulates from
  zero and a two-frame diff fell from 334 to 18 pixels). `build.mjs` writes a
  favicon stub so the 404 stops polluting the console gate.
- **3.3.0** — Social/life-scene release from the Night Market build: clothed-cast
  craft (skull/jaw head, hairline, layered garments, hands), carry/handoff and
  crate-loading rules, scooter/cargo-bike anatomy, two-wheeler mount with hip-Z
  abduction, service/queue state machine with `moving` gates, Night Market worked
  example and fix table, 2x backing/scale-by-camera guidance, empty-paper rule,
  social verification logs, night/practical/headlight guidance, cutaway and
  glazing rules, bus/van anatomy, cat/dog quadruped rig and gait, generalised
  `DESIGN.md` with Life/Service and Contact/Choreography sheets, new
  `peopleModel-street.js` template, scene fast path, and a laundromat/workshop
  router row.
- **3.2.3** — Hollow-object rule: cannon bores, pipe mouths, chimney flues, lamp
  chimneys and tunnels need open collars, a recessed dark bore, a back disc and
  a lip ring. Added 1:1 bore audit and the brass-end-cap pitfall; the Bombard
  cannon now has an open muzzle instead of a cap.
- **3.2.2** — Fixed cannon ammo station rebuilt as a wall-mounted locker below
  the deck: shelf, brackets, powder chest, shot tray and hung rammer, outside
  both yaw sweep and barrel arc. Added bounding-box overlap check to the pivot
  audit and recorded the wall-locker pattern.
- **3.2.1** — Rotating-assembly parentage rule: only the gun may live under yaw;
  fixed deck stores go on a static group. Added pivot-parentage strip and
  acceptance check; cannon keg, shot and rammer moved off the yaw group.
- **3.2.0** — One-prompt commission mode: default commission table, assumption
  line, ten-scene router, universal four-question generator, bakery worked
  example, autonomous eight-pass build, cut-count-not-detail rule and
  one-prompt acceptance; reading order trimmed to the sections needed.
- **3.1.0** — Canonical numbers/camera/light/post/palette contract; field and
  machine grammar; goal-response vocabulary; FX edge, snap and contact-context
  rules; crew/defender rule; human death grammar; climb and rotating-emitter
  rules; expanded `DESIGN.md`; new `detail.js` rope, trophy-board and
  contact-shadow helpers.
- **3.0.0** — Detail Bar, Animation Bar, new-subject intake, reference density,
  detail recipes, system/combat animation, attack/death audits, beam/artifact
  triage, detail-and-animation QA, `templates/DESIGN.md`, `templates/detail.js`,
  `templates/combat.js`.
- **2.1.0** — Combat Readability section; threshold clearing, tower grammar,
  boss goal contact, death species, standalone `String.replace` guard.
- **2.0.0** — Palette/post contract, camera solve, cast rig, vehicle/seat
  transfers, clipping, verification.
