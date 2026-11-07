# Pixel Art V2 people: construction and motion

The cast belongs to the same visual language as the ground: small rounded figures, clear gestures, solid colour bands and deliberate silhouettes. This is a style contract, not permission to replace required anatomy with disconnected beads. Apply it to imported rigs or authored geometry according to the selected sourcing mode.

## Code starting point

Copy `templates/pixel-v2-person.js` into the project's scene code for authored cast. It exports `createV2Person(options)` with rounded garment/head/limb geometry, real joint pivots, hand grip and foot frames, a low-level `pose()` evaluator and deterministic idle/reach/walk-preview samples. No external model or branded dependency is required beyond Three.js. This is independently written code, not extracted third-party source.

```js
const actor = createV2Person({ shirt: 0xb14b3c, striped: true, height: 1.8 });
scene.add(actor.root);
actor.sample(sceneTime, { action: 'reach', phase: actionPhase });
// Attach a held prop to actor.grips[0] with its correct grip transform.
// Drive actor.pose(...) from the production foot-lock/contact controller.
```

`walk-preview` demonstrates alternating articulation only: it is NOT a complete foot-locked travelling gait. Production actions still need targets, support/IK, prop ownership and contact tests below. Imported-model modes retain their sourced rig and adapt it to the same style rather than replacing it silently with procedural people. Cast role metadata must be wired to the actual renderer. Numeric bounds and deterministic pose checks do not establish a rendered visual match.

## Silhouette and proportions

- Start with a roughly six-to-seven-head-tall adult silhouette, subtly enlarged head/hands/shoes and comfortably thick limbs. Avoid chibi heads, cube people and hyperreal skin detail unless requested.
- Use a compact tapered shirt torso and pelvis, short neck, rounded skull with a small jaw/front plane, and a distinct hair cap offset toward the back/top. A subtle nose or facing plane should make the gaze readable at the logical render size. Do not add noisy facial pixels that disappear at the hero view.
- Build articulated upper/lower arms and thighs/shins from smoothly tapered rounded segments, with real shoulder/elbow/wrist and hip/knee/ankle frames. Overlap joint volumes enough to avoid gaps during bends, without creating oversized ball joints. Hands are small mitten/palm shapes with a grip direction; shoes have heel, sole and a visible toe pointing along the foot.
- Keep upper arms just outside the torso and legs sufficiently separated for a visible gap at the hero camera. Avoid merging both hands into a single ambiguous pixel clump. Test front, side and back as well as the hero view.
- Coordinate palette by role: one clear garment hue, a contrasting lower garment, skin, hair and shoes. Add a second clothing colour or broad stripe only when it remains several logical pixels wide. Hair, collars, cuffs and hems are geometry/material boundaries, not random surface grain.

## Rendering

Mark the entire character subtree as cast and map that role to the actual shader/mask pipeline. `userData.pixelRole = 'cast'` is metadata only: verify the renderer really reads it. Use clean discrete light bands and object-owned dark silhouettes, without terrain grain or ordered dither on skin/clothing. Preserve warm light and cool shadows without flattening all skin tones to one palette entry. Clothing patterns remain attached to the garment when the person turns or bends; do not use world-height stripes that slide across moving limbs.

The existing `peopleModel.js` and street variant are construction starting points, not automatic V2 certification. Adjust their proportions, detail frequency and material roles to this contract. Do not add a second full-resolution outline pass over the pixel grid.

## Articulated action, not decorative bobbing

Use a deterministic pose evaluator with separate root movement and joint motion. Derive pose from absolute scene time and semantic action state; freezing at a timestamp must reproduce the same body, props and contact shadows. Head/body yaw is computed in the actor parent's local space. Counter-rotate the hips and shoulders slightly rather than swinging the whole rigid figure.

### Walk

Use alternating stance and swing. During stance the planted foot stays fixed to its ground contact while the pelvis moves over it. During swing lift the toe, clear the ground, move forward, then lower heel/sole before transferring weight. Solve knees toward a consistent forward pole; opposing arm swing comes from shoulders with a small elbow bend. Add a modest pelvis rise/fall and torso twist subordinate to the foot contacts. Set cycle rate from distance travelled and stride length, not an unrelated sine wave; stop and settle when travel stops. A contact shadow follows the actual support, not a guessed root offset. Do not quantise body motion merely because plants step at a low frame rate.

### Reach, hold and release

Establish shoulder → elbow → wrist chains with an actual target/contact frame. Rotate pelvis/torso and shift weight before extending the arm. Crouch lowers the pelvis through hip/knee bend; leaning alone must not stretch the leg lengths. A carried object inherits a hand/grip frame exactly once. At a handoff/release, transfer ownership at the event frame with a continuous world transform; never duplicate the held object or teleport it between roots. Return the arm through a short recovery pose.

### Crouch, sit and stand

Move pelvis backward/down while knees and ankles flex and the feet remain supported. A seat action has approach, align, lower, supported hold, rise and departure. Do not lower a standing body through the chair. Respect the shared action-clearance/seat contracts, including moving-seat parentage, support gaps and live posed bounds.

### Strong actions

Throw, strike, pump, dive or lift each needs anticipation → weight shift → action/contact → follow-through → recovery. Use an explicit action phase and targets, not a perpetual generic arm swing. Extend or tuck the body through real joint chains; preserve limb lengths. Tool tips, held handles and impact points must agree at the decisive frame. Face the action, not perpetually the camera.

### Idle and variation

Use small occasional head turns, asymmetric resting arms and gentle supported weight shifts. No continual bouncing in place, treadmill walking, synchronised crowd phase or noisy per-frame randomness. Seed variations in height, clothing, stance and timing, while preserving the common proportions and detail density. Pause/reduced-motion should suppress decorative idle movement without breaking a requested interactive action.

## Acceptance

Capture a native-pixel portrait plus a full action strip at anticipation, mid-action, contact and recovery. Verify cast/scenery dither separation, stripe readability, no joint gaps, correct facing, foot sliding/ground penetration, hand/grip contact, loop seam and deterministic freeze. Use the existing production pose-aware clearance evaluator across the whole action. Include the worst side/back view; a pleasing hero frame alone does not pass. Imported clips require the same fitted contact and silhouette checks. Never claim the people are V2-styled solely because the ground or canvas is pixelated.
