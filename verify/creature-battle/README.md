# Creature battle harness

A finished scene that exercises `templates/creature.js` end to end: two rigged
creatures, a trainer throwing a ball, four attacks, a knockout and a recall. The
source lives in the project it was commissioned for (`Desktop/pokemon`); this
note records what the build proved, so the next battle commission starts from
these numbers instead of rediscovering them.

## What the verification found

- **Aiming.** Forward-vs-opponent dot sat at 0.99 for the whole loop once the yaw
  was computed in stage-local space. The earlier world-bearing version read 0.6
  to 0.8 and looked like both creatures were facing the lens. It only drops to
  0.87 during the deliberate Iron Tail spin. Sweep it every half second; a 20°
  miss is invisible at 300 px.
- **Effect anchors.** Flames and bolts left the mouth correctly only after the
  anchor was baked into head-bone space. A world-space muzzle slides off the jaw
  as soon as the head turns, and a `+0.6 forward` guess is wrong for both rigs.
- **Flat effects.** The kanji-shaped blast rendered upside down until the basis
  came from `worldUp × viewDir`. `setFromUnitVectors` was the whole bug.
- **Explosion vocabulary.** Cone petals, triangle fans and straight bars all read
  as geometry. A hot core plus ten short sparks plus a ground ring reads as an
  impact at any size. Layered silhouettes need per-mesh scale: sharing one
  geometry between layers makes the layers invisible.
- **Effect anchoring over time.** An eruption pinned to the actor's live position
  crawls across the slab while he is knocked out of it. Latch the anchor at the
  impact frame. That drift was reported as "it moves a bit, something feels off".
- **Send-out.** Thrown ball, arc, landing, opening burst, full-size exit, ball
  returns to the hand: all seven beats need their own time, and the held ball has
  to be hidden while the thrown one is in the air or the throw reads as two balls.
  A slow orb the creature materialises inside is the legendary-encounter variant
  and reads as a bubble.
- **Hits.** Four ad-hoc hit blocks were replaced by one severity table; the pose
  weight and air arc scale with the blow, so a flamethrower staggers and a Fire
  Blast folds the target in half. Rotate about the blow axis, pivot at mid-body.

## Numbers that carried over

| Quantity | Value |
| --- | --- |
| Loop | 46 s, 40 Hz |
| Facing dot | 0.97+ except during a scripted spin |
| Hit durations | 0.95 / 1.75 / 1.30 / 3.55 s |
| Send-out | release 6.18, land 7.28, open 7.48, exit +0.34, return by 8.44 |
| Internal render scale | 0.75 of CSS, buffer ceiling 2400 px |
| Camera | `subjectScale 0.70` (30% smaller than the fitted slab) |
