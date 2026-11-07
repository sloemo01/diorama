# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## One Prompt, One Build

When the user gives a subject in one line, treat it as a **commission**, not a
questionnaire. Make the creative decisions, state them in one short assumption
line, and build the whole diorama. Do not stop at a plan, a blockout or a design
sheet and wait for approval.

The only reasons to ask are credentials, a destructive action, a path that
would overwrite the user's work, **or the `Render Preset Gate`**. That gate is a
deliberate exception to autonomous assumptions: one question, once per project,
before the first mesh. Everything else is a default.

### Step 0, before the assumption line

Ask the `Render Preset Gate` question first, then run the three lookups in
`Research Before You Model`:

1. Step the real subject into frames and write down its motion grammar.
2. Walk the sourcing ladder for every hero asset (disk, CC0, CC-BY, hand-build),
   with a `CREDITS.md` line per import and the search in `refs/SOURCES.md`.
3. Stand up the capture loop (`qa/shoot.mjs`, a frozen `?t=` frame, a contact
   sheet) so every beat can be reviewed as a picture.

For an invented subject, spend the same time on reference density instead: find
three images that agree on what the place looks like, list the props they share,
and build those before any invented detail.

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

### Long builds and context

A scene like this runs for hours of agent time and thousands of messages: render
loops, one screenshot per beat, one probe per bug. The session will need to
compress its context, more than once, and compaction is lossy. Build so that a
compact does not cost you the work:

- **State lives in files, not in the chat.** `DESIGN.md`, `refs/SOURCES.md`,
  `CREDITS.md`, `qa/report.json` and the beat table in `stage.js` must carry every
  decision. If a fact only exists in a message, it is already gone.
- **Write the rule down when you learn it.** A fix found at 3 a.m. is worthless if
  it only exists in the transcript; put it in the skill or a comment next to the
  code, with the reason.
- **Name the shots.** `qa/frames/<entity>/sheet.png` and `shots/t-12.40.png` are
  stable handles a post-compact agent can re-read without rerunning anything.
- **Re-derive, do not remember.** After a compact, re-run `frames.mjs` and
  `shoot.mjs` rather than trusting your summary of what the last frame looked
  like: the numbers are cheap, and a confident memory of an old build is the
  most expensive thing in the session.
- **Keep one open task list** in the repo (a `TODO.md` or an issue) so the thread
  that survives compaction is the plan, not the chat.

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
- **Build for orbit inspection.** Prioritise the hero view, but construct every exposed back, support, cavity and joint coherently.
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

