# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Field Notes: Two-Creature Combat

From a Pikachu vs Charizard battle diorama built against Sword/Shield and anime
footage. The rig, the effects and the send-out all broke in the same three ways,
and the fixes generalise to any fight between two rigged actors.

### Aiming is a local-space problem

Both rigs look down their own `+Z`, and both sit under a stage root that is
rotated (here 90°). Reading a world-space bearing to the opponent and writing it
to a local `rotation.y` aims the two *past* each other, toward the lens. Compute
the yaw inside the stage's own frame:

```js
const camLocal = cameraDirection.clone().applyAxisAngle(UP, -STAGE_ROT);
const aimYaw = (a, b, cheat) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  return Math.atan2(dx, dz) + camLocal.x * cheat;   // local, not world
};
```

Then prove it numerically, every half second, through the whole loop: forward
vector versus vector-to-opponent should sit at 0.97+, and it may only dip during
a deliberate spin. Eyeballing this at 300 px hides a 20° miss.

### Effects belong in bone space, not world space

Flames leaving a mouth must be anchored to the head joint, or they slide off the
jaw whenever the head turns. Convert the parent's forward and up into the target
bone's local space once at build time and keep the emitted point there:

```js
const localFwd = bone.worldToLocal(pivotPoint.clone().add(forward)).normalize();
```

Same idea for the aim of a projectile: take the muzzle from the bone matrix, not
from a hardcoded offset.

### Flat effects need an upright basis

`quaternion.setFromUnitVectors(+Z, viewDir)` picks an arbitrary roll, which is
why a kanji-shaped blast can arrive upside down or rotated 40°. Build the basis
from the lens explicitly:

```js
const right = new THREE.Vector3().crossVectors(worldUp, viewDir).normalize();
const up = new THREE.Vector3().crossVectors(viewDir, right).normalize();
mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, viewDir));
```

### Explosion vocabulary

A hit burst is a hot core with ten short sparks radiating out of it, plus a ring
on the ground. That is the whole recipe; it reads at any size.

- No cone petals, no triangle fans, no straight bars, no scaffolding around the
  blast. Every one of those reads as geometry, not energy.
- Layered silhouettes beat layered spheres: a body colour, a hot mid, a core,
  each scaled *individually* (`m.scale.set(k,1,1)` per layer) — sharing one
  geometry between layers makes the layers invisible.
- A continuous stream is **one** mesh with overlapping segments. Separate quads
  with per-segment jitter make a ladder with seams.
- Nested cones hide their own core: nudge the inner layers toward the lens and
  lift them so the hot tip clears the outer silhouette.

### Pin the effect to where the hit landed

An eruption anchored to `actor.position` every frame crawls across the slab while
the actor slides out of it, which is exactly the "something feels off, it moves a
bit" report. Latch the anchor once, at the moment of impact, and animate from
that fixed point. Same for the projectile's target: aim at the latched point, not
at the live chest position.

### Send-out and recall are different verbs

- Send-out: the trainer throws. The ball leaves the hand on an arc, spins, lands
  on the mark, the lid opens with a white burst — flash, smoke puff, sparks, a
  ground ring — and the creature springs out *at full size*, covered by the flash.
  The ball then snaps shut and returns to the trainer's hand.
- Do **not** replace that with a slow orb the creature materialises inside; that
  is the legendary-encounter variant, and it reads as a bubble.
- The red beam belongs to a recall or a knockout, never a send-out. If the ball
  glows red before release, it reads as a second, wrong beam — keep the release
  white.
- If the trainer holds a second ball while the thrown one is in the air, hide the
  held prop for the duration or the throw doubles.

`templates/creature.js` ships these five as runnable functions: `aimYaw`,
`headAnchor`, `uprightQuat`, `makeHurtModel`, `sendOut`.

### Hit reactions scale with the attack

One hit model, four severities: a light flinch (0.9 s, a tip back), a knocked-back
stagger (1.7 s, air time), a spin-out (1.3 s), and a full collapse (3.5 s, falls,
lies down, gets up). Rotate about the axis of the blow (`[dz, 0, -dx]`), pivot at
mid-body so the actor rocks rather than hinging at the feet, and add a small
vertical arc so the feet leave the ground.

