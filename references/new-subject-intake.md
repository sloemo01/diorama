# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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
- **Stage for the hero camera.** Put the threshold and the hero action on the
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

