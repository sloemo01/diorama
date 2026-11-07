# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

