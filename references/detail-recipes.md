# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Detail Recipes

Detail is a hierarchy, not a texture. Build in this order and stop adding when
the silhouette is explained.

### The Five-Part Prop

Every readable prop answers five questions with geometry:

1. **What touches the ground?** Feet, skids, wheels, a stone base, roots. Add a
   contact shadow at 0.018 above the deck.
2. **What holds it up?** Posts, frame, legs, axle, brace. This is the
   construction layer and it must be visible from the camera.
3. **What is its working surface?** Planks, slats, a lid, a blade, a trough, a
   table. Divide it into pieces; a single slab reads as a box.
4. **What attaches the parts?** Rope, iron straps, nails, hinges, lashings,
   rivets. Two or three are enough; a row of identical studs is noise.
5. **What is the story?** Contents, a tool, a repair, a trophy, a rag, wear on
   the edge that is used. One or two, placed where the camera sees them.

A hay cart from the reference build: bed, six side slats, two spoked wheels with
iron tyres, four corner straps, three tied bales, loose straw, pitchfork, sack,
red rag, two draft shafts. That is ten assemblies for a prop the user sees for
two seconds. A crate with a pale sphere inside is none of them.

### Tower Anatomy

A defence tower is a small building, a machine and a crew in one silhouette.

| Layer | What it adds | Failure if missing |
| --- | --- | --- |
| 1 foundation | plinth, steps, rubble, contact | tower floats or looks pasted on |
| 2 shaft | taper, buttresses, bands, ladder | reads as a cylinder |
| 3 platform | deck, rail, hatch, brackets | machine has nowhere to stand |
| 4 machine | weapon, pivot, rail, recoil travel | attack has no origin |
| 5 crew | gunner, cranks, spotter, ammo | tower feels automated/empty |
| 6 livery | banner, number, pennant, paint | tower has no owner |
| 7 wear | scorch, chips, rope, spent cases | tower looks unplaced |

The animation pivot belongs to layer 4. The muzzle or launch point belongs to
the weapon, never the tower centre. Recoil travel is 0.1 to 0.25 m for a ballista
or cannon, 0.02 to 0.06 for a beam crystal. A tower with no recoil, no crew and
no ammo is a monument.

**A hollow object must show its opening.** A cannon with a solid brass cap is a
baton, not a gun; the same failure turns a pipe into a rod, a chimney into a
post, a lamp into a mushroom and a tunnel into a painted arch. Build the opening
as geometry, not a dark decal:

- replace the end cap with one or two **open-ended collars** (no front face);
- add a recessed **dark bore tube**, open at the mouth, with its inner wall
  visible (`DoubleSide` on a cloned material, never on the shared palette
  material);
- close the back with a **dark disc** so the barrel interior is not see-through;
- add an **iron inner lip ring** and a **brass outer lip ring** so the edge
  catches the light at 1:1;
- put the muzzle/effect origin at the lip, not inside the bore.

At 1:1 the opening needs a dark centre at least 5 to 6 px across and a lit lip.
If the centre is brass, the hole failed.

**A rotating assembly owns only its moving parts.** The yaw/turret group may
contain the carriage, barrel, recoil slide and muzzle. Fixed stores — powder
keg, shot pile, rammer, tools, ready rack, crew — belong to a static group on the
tower root, never the yaw group. If they are children of the yaw group they sweep
around the tower when it tracks a target, which reads as the whole gun deck
rotating.

Do not simply reparent the props at deck height: the barrel and carriage sweep
through that volume at some yaw. Put them outside both the yaw sweep and the
barrel's vertical arc. If the deck has no clear sector, bolt a ready locker to
the outer wall below the deck: shelf, two iron brackets, powder chest with corner
straps, shot tray, and a rammer hung on two hooks. It reads as part of the tower
and never collides.

Test two ways at minimum and maximum yaw: each fixed child's world position
delta must be 0, and each fixed mesh's world bounding box must not intersect any
mesh under the yaw group. Both checks pass, or the station is still in the arc.

Worked example, Bombard Bastion: 17 fixed parts — shelf, two iron brackets,
powder chest, lid, two corner straps, rope handle, shot tray, tray lip, three
iron shot, rammer shaft, iron cap and two wall hooks. It sits at y 1.1 to 1.6 on
the outer shaft, below the deck and outside the barrel arc. At both yaw extremes
all 17 world positions are identical and the station has zero bounding-box hits
against the yaw group.

### Creature Anatomy

A creature needs a silhouette feature before it needs a face.

1. **Core mass.** One dominant volume: hunched torso, round slime, long bat.
2. **Silhouette feature.** Horns, ears, hump, wings, tail, crest, antlers. This
   is what the user recognises at 30 px.
3. **Face.** Two eyes, brow, jaw or beak. Eye sockets must be dark and set in,
   not painted on the surface.
4. **Limbs.** Joint groups with fillers; hands and feet larger than anatomy
   suggests, or they disappear at this scale.
5. **Gear.** One weapon, one strap, one trophy. Not a full armour set.
6. **Colour break.** One hue for skin, one for cloth, one metal accent.
7. **Asymmetry.** A chipped horn, a single pauldron, a dragging club. Perfect
   symmetry reads as a toy soldier.

The boss gets 40 to 60 parts and one signature weapon. Build the weapon as a
separate group with a haft, head, bands, studs or spikes, and a hand attachment.
A stone head with no haft reads as a rock floating at the door.

### Small Quadrupeds (Cats, Dogs)

A cat is not a small human on all fours. Build a horizontal spine and four
contact legs; the silhouette is the back line, ears and tail.

- **Body:** chest sphere r 0.085 at y 0.24, belly capsule 0.24 long, hip sphere
  r 0.080. Shoulder height 0.26, nose-to-tail base 0.46. A cat at human scale is
  about 0.25 m at the shoulder; measure, do not scale a person by 0.2.
- **Head:** skull r 0.075, muzzle 0.045 forward, jaw, nose, two triangular ears
  (cones or three-vertex prisms) at the top corners. Eyes face forward with a
  dark socket and a vertical pupil; at 30 px the ears and pupils carry the read.
- **Legs:** four chains (upper 0.10, lower 0.11, paw 0.05). Front legs are
  straighter; rear legs have a hock that bends backward. Paws land flat, toes
  forward. Do not use the human knee sign for a hock.
- **Tail:** four to six segments with a slow S-curve, root at the sacrum. It
  counter-sways against the walk and curls when sitting; a rigid stick tail is
  the fastest way to lose the animal.
- **Walk:** lateral-sequence four-beat, phase offsets roughly LF 0, RH 0.25,
  RF 0.5, LH 0.75. The spine dips and rises twice per cycle; the head stays
  level. Drive phase from distance travelled, like the bipeds.
- **Sit:** haunches down, rear hocks folded, front legs straight, chest up, tail
  curled around the paws. A sitting cat is a triangle, not a crouched person.
- **Jump:** crouch (hips down, spine compressed), extend (all four legs push),
  airborne (legs tucked, tail up), land (front paws first, then rear). Two
  seconds of anticipation and recovery, not a linear hop.
- **Fur:** one base colour, a lighter chest/muzzle, darker ears/tail tip and two
  or three stripe bands. Do not model individual hairs; the palette snap eats
  them. Contact shadow is one stretched ellipse under the body, not four paw
  blobs.

Shoot the cat at 1:1 in profile, three-quarter and sitting. If it reads as a
rabbit, the ears are too long; if it reads as a dog, the muzzle is too broad and
the back line too straight. No gear, no trophy, no human jacket.

### Environment Anatomy

- **Three scale cues.** One small (grass, bones, cobbles), one human (cart,
  barrel, spear), one tall (tower, tree, gate). Without all three the slab has
  no scale.
- **Three story props.** A camp, a repair, a warning, a toll, a shrine. Place
  them off the main path but inside the camera cone.
- **Two ambient loops.** Fire, flag, smoke, fireflies, grass, water, hanging
  bones. Phase them differently; synchronized loops read as a screensaver.
- **A path with a memory.** Ruts, footprints, dropped goods, a worn threshold.
  A clean path is a diagram.
- **A boundary treatment.** Trees, rocks, posts or a wall that explains why the
  slab ends. Do not let props clutter the threshold.

### Detail Audit At 1:1

Before the animation pass, inspect each hero object at 1:1 and answer:

- Can I name its three construction layers without guessing?
- Does it cast a contact shadow and touch the ground?
- Is there one asymmetry or story detail I can point to?
- Does it overlap another object of the same silhouette?
- Is any detail under 1.5 px, and therefore speckle?
- Does every hollow object — cannon, pipe, chimney, lamp, tunnel — show a real
  opening, or does it end in a cap?
- Does it read in grey, without colour?

If any answer is no, fix the object before animating it. Animation multiplies
detail; it does not create it.

