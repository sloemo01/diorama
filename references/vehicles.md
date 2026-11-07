# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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
- **Separate a pair in screen space, not in world space.** At the reset hero 45/33
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

