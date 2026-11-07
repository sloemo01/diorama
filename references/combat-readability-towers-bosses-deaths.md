# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Combat Readability (towers, bosses, deaths)

A diorama is judged on whether the **cause and the consequence are both
visible at the reset hero camera**. Geometry that is correct in world space can
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

