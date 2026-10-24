# <TITLE> — design sheet

> Fill this before modelling. Keep it in sync with `README.md` and the code.
> A new subject with no verb is a shelf model; give it a conflict.
> Delete rows that do not apply, but replace them with the equivalent
> (a machine's goal, a field's area, an ambient loop's period).

## Premise

`[place]` + `[a repeated verb/ritual]` + `[who or what interrupts it]` + `[payoff]`.

One sentence:

- Archetype (router row):
- Assumption line (scale, loop, systems, cast):

## Camera Side

- Locked angle: azimuth 45, elevation 33, fov 20.5; fillX/fillY 0.84–0.94
  (fit margin only).
- Subject scale: 1.0; 0.70 = 30% smaller linearly, more paper (camera only;
  frame, slab, clip and shadows unchanged):
- Exterior or interior cutaway:
- Street lane (in front +Z / behind -Z; passing vehicle timing):
- Night palette mix (moon/key / practical / pool):
- Render buffer: 1× CSS default; 1.2–1.5× renderScale for a small subject;
  2× only for face close-ups; maxDim / CSS image-rendering:
- Slab size / deck height:
- +Z face / hero face (exterior); for an interior cutaway, camera-side wall
  omitted and street behind at -Z:
- Threshold / entrance (keep 2 m clear):
- Tall landmark (back, offset in screen x; top height):
- Foreground prop (near corner):
- Mid-ground prop (leads the eye):
- What must never be occluded:
- Grey blockout frame (time):

## Cast Sheet

Three to eight rows; the default is four to six including any disruption. Every
row needs an exit (or death) and a signature prop.

| Role | Silhouette feature | Locomotion | Action | Reaction | Exit / death | Signature prop |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Life / Service Sheet

Fill this for a market, hatch, ticket window, bakery, hotel desk or any social
scene. A combat play can delete it.

- Service point (counter / hatch / window):
- Queue slots (positions, spacing, heading):
- Staff positions (cook / cashier / runner):
- Arrival order and serve order:
- Machine slots (washer/dryer/table), cycle end and release beat:
- When the queue is full / empty:
- Late customer or disruption:

| Role | Entry | Slot | Order | Pay | Receive | Exit |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## System Sheet

- Loop length / DT:
- Three or four systems (defence / machine / service station / loop; name,
  origin, output, contact, events):
- Crew / staff (who operates, exit, machine behaviour when gone):
- Three or four visitor / enemy / animal roles:
- One goal or disruption, optional for a life scene (what place does it act on?
  contact point + response):
- Economy / score / progression (optional for a life scene):
- What changes between first and last beat:

### Shot / Event Count

| System | Shots / events | First at | Last at | Proof frame |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Beat Sheet

| Time | Beat | Camera proof |
| --- | --- | --- |
| 0.0 | establish |  |
|  | first system output |  |
|  | first consequence |  |
|  | machine / field / service output |  |
|  | disruption arrives |  |
|  | goal / service contact |  |
|  | finale / residue |  |
|  | relight / recovery |  |
|  | loop seam |  |

A social play may collapse this to five rows: establish, first ritual, disruption,
handoff, residue. A combat play uses all nine.

## Hero Objects

Name every object that gets the Detail Bar. Type is tower / machine / service
station / vehicle / creature / prop / landmark. "Parts" is the visible mesh count target.

| Name | Type | Parts | Construction layers | Story detail | Contact |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

## Contact / Choreography Sheet

Every carry, handoff, load, mount and seat needs a contact timestamp.

| Beat | Hands on | Prop / seat anchor | Start | Contact | Release | Proof |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Ambient Loops

| Loop | Period | Motion | Phase offset | What it touches |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Surface / Motion / FX Audit

- Slab edges finished (right / lower / all visible): heightfield or road
  feathers to slab over:
- Exit rule for every mover: visible until world bounds clear slab + margin:
- Event FX windows (start / rev / launch / hit / landing), source object, tail:
- Idle effects that are deliberately allowed (otherwise "none"):
- Large translucent planes and why each is not a flat halo:
- Whole-object fades: none / exempted with reason:
- `qa/audit.mjs` contract exposed (`slab`, `movers`, `emitters`):
- Edge crop pair, burst frame, burst + 1.5 s, margin scan:

## Detail Budget

| Element | Count | Parts each | Story detail |
| --- | --- | --- | --- |
| Towers / machines / service stations |  | 25–45 |  |
| Vehicles |  | 20–45 |  |
| Species / people |  | 12–20 (hero 40–60) |  |
| Props |  | 8–15 |  |
| Landmark |  | 30–60 |  |
| Deaths / exits |  | 5–8 pieces + residue, or exit-only with no debris |  |
| Ambient loops |  | 2+ |  |
| Triangles / draw calls |  |  |  |

## Palette

- Length (must equal `uPalette[N]` and the JS array):
- Base entries:
- Accent entries:
- Forbidden: pure black, gradients, unlisted colours.

## QA Frames

| Frame | Time | What it proves |
| --- | --- | --- |
| Grey blockout |  | staging before palette |
| Hero |  | staging + palette |
| First system |  | origin / travel / contact |
| Queue approach |  | slots, feet, serve order |
| Carry / load |  | palms on prop, over-rim, release |
| Mount / seat |  | boot, leg clearance, hands on grips |
| Night / glass |  | darks, practical, no tint, no occlusion |
| Quadruped |  | ears, pupils, hocks, tail |
| Exit (social) |  | turn, walk, prop, no debris |
| Machine / field / service |  | area, ramp, output |
| Surface edge |  | no lip, gap or portal; flush at 1:1 |
| Event FX start |  | burst at the source, not idle haze |
| Event FX tail |  | plume gone within the authored tail |
| Mover clear |  | whole bounds outside slab before hide |
| Exit / death |  | species or role grammar |
| Goal contact |  | contact + response |
| Follow-through |  | recoil / release |
| Beam / field off |  | no stale effect |
| Threshold |  | clear pocket |
| Relight / aftermath |  | residue and recovery |
| Standalone |  | `file://`, no errors |

## Risks

- What is most likely to read as a blob at 1:1?
- Which object has the weakest silhouette?
- Which beat has the least visible cause?
- Which FX crosses the slab edge, and does it fade or cut?
- Does any standing gesture overlap a walking root? (queue slide)
- Are the palms on the carried prop at the contact frame?
- Does a boot pass through the bars, seat or body during the mount?
- At night, are there three dark values and a visible practical?
- Does a passing vehicle cover the hero at the contact frame?
