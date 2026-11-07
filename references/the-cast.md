# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

