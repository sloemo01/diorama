# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## The Detail Bar

A blockout with a camera is not a diorama. The difference between a demo and a
diorama is **three passes**, and every hero object has to survive all three.

1. **Silhouette.** At 1:1 the object is recognisable from its outline in about
   0.2 seconds, before colour or detail.
2. **Construction.** The silhouette is explained by visible assemblies: posts,
   rails, bands, plates, wheels, hinges, ropes, fasteners. A single primitive is
   a placeholder, not a prop.
3. **Story.** One detail tells you who used it and what happened: a chipped edge,
   a trophy skull, a repair strap, a spare bolt, a rag, a tally mark, a spent
   shell. If the detail could be removed without changing the read, it is
   greeble, not story.

### Whole-object completeness gates (3.17)

Apply these three gates to every hero object in every profile and render preset,
including educational cutaways. They extend the existing Detail Bar and component
manifest; they do not add cast, story-prop or mesh-count quotas to educational scenes.
Evidence is the user's report of a quartz watch missing its straps and back; no
independent inspection or root-cause diagnosis of that model is claimed here.

1. **Approve the whole-object silhouette, not only the teaching core.** Before
   detail, record whether the commissioned subject is a complete object, a detached
   mechanism or an explicit permanent section; default to the complete named object.
   Reference the entire object and its proportions, not just its most interesting
   subsystem. A complete wristwatch needs its case and both strap/bracelet sides,
   not merely a dial or quartz movement. Simplify small surface detail before
   deleting identity-defining masses. **Evidence:** the reported watch lacked
   straps despite its watch subject. **Test:** compare grey whole-object front,
   side and rear views against recorded references, then review desktop/phone
   delivery frames with the entire silhouette uncropped. Temporarily hide an
   essential silhouette assembly (for the watch, either strap side); the review
   must reject it. A close crop of the core cannot pass this gate.

2. **Construct exterior, rear and attachment chains as real assemblies.** An
   educational explanation of internals does not waive the casing, rear closure,
   mounting or wearable attachments. Inventory every orbit-exposed side and trace
   attachments into their seats/joints. For a strapped watch this includes caseback,
   lugs/spring-bar connections, both strap halves and the reference-appropriate
   buckle/keeper or clasp; do not impose those exact fittings on a different design.
   Keep required construction in the model when an explicit Inside mode reveals
   internals; a label, dark disc or transparency is not a replacement for absent
   geometry. Honour a commissioned permanent section and document its boundaries.
   **Evidence:** the same report named the missing back as well as straps.
   **Test:** review opaque front/rear/side/high orbit crops and attachment-seat
   close-ups; inspect mesh/group mappings and actual contact/clearance at joints.
   Exercise cold load → Inside on/off (if present) → Reset to check restoration.
   Hide the rear closure or disconnect an attachment in a test copy; the matching
   presence/connection check and visual review must reject it. Existing motion and
   non-penetration tests still apply; presence alone does not prove sound mechanics.

3. **Close an explicit completeness matrix before claiming completion.** Fill
   the matching DESIGN sheet before modelling and reconcile it against the built
   scene before delivery. Give each expected silhouette, exterior/rear, attachment
   and functional/internal assembly a stable ID, reference or stated assumption,
   required/simplified/omitted status with scope rationale, mesh/group mapping,
   connection and proof view plus actual test result. An omission note alone cannot
   waive an essential part of the commissioned whole object; build it or obtain an
   explicit scope change. **Evidence:** the reported missing straps/back show why
   subsystem detail cannot stand in for whole-object coverage. **Test:** reconcile
   every expected row with nonempty live geometry and reviewed proof; check that
   the inventory itself covers the whole reference, not just existing meshes.
   Deliberately remove a required row's mesh, leave its proof blank, and add an
   unexplained omission in test copies; each must fail the audit. Store commands,
   results and proof paths in `qa/report.json`. Missing evidence is UNVERIFIED,
   a missing required assembly is FAIL, and either blocks a completeness pass.
   This matrix makes omissions reviewable; it is not automatic certification or
   a guarantee that future agents will comply.

The numbers below are **reference density** from The Hollow Toll, a 21 x 14 m
slab with four towers, two gate guns, five species, 42 units, one boss, 527
events and 183 shots. Treat them as a calibration target, not a cap.

| Element | Minimum visible assemblies | Hero target | Required story detail |
| --- | --- | --- | --- |
| Tower | 6 | 25 to 45 parts | crew, ammo, livery, wear |
| Creature | 8 | 12 to 20 parts; boss 40 to 60 | gear, scar, trophy |
| Prop | 5 | 8 to 15 parts | contents, tool, repair, rag |
| Landmark | 8 | 30 to 60 parts | one unmistakable silhouette |
| Death | 3 stages | 5 to 8 pieces + stain + soul | species-specific debris |
| Environment | 3 scale cues, 3 story props | 2 ambient loops | a before/after trace |

In a social diorama, read the Death row as **Exit**: a role-specific departure
(turn, walk out, shutter down) with the prop and no debris. The five layers are
unchanged; the residue is the changed place, not a stain.

**An object can hold two roles.** A lighthouse that is also a beam tower gets
the landmark budget for its structure **plus** the machine's moving parts; list
both rows in the design sheet. A boss weapon is a separate group: budget 8 to 12
parts for the weapon on top of the body, and say so, or the body will be blamed
for a thin haft.

**Primitive discipline.** No naked box, sphere or cylinder at hero scale. A box
gets a chamfer, a frame, plank divisions or a band. A sphere becomes a skull,
bale, sack or head with a snout, ties or a neck. A cylinder gets a foot, cap,
taper or iron rings. If a shape is still a primitive after the detail pass, it
will read as a rock, a blob or a placeholder at 30 to 45 px.

**Two to four palette entries per object, plus one accent.** More entries
turns into noise after the palette snap; fewer turns into a silhouette cut-out.
Use value contrast for construction and hue for story.

**Detail lives on every orbit-exposed surface.** All presets need coherent backs,
construction, attachments and cavities; a fixed hero shot is not permission to
omit parts. Hidden internals may be simplified only if outside the mechanism manifest. Do not add detail
under about 1.5 screen pixels at the delivery view: it aliases into speckle, not craft.

**Every prop must touch the ground.** Feet, wheels or a structural base must physically meet their declared support surface.
A contact shadow or stain is visual context, never a substitute for contact. A prop hovering by two centimetres is the single most common "it looks
cheap" report. Check the shadow and the lowest vertex, not the group origin.

**Every landmark must be the only one of its silhouette.** Two skull trees, two
red tents or two identical towers read as duplication, not composition. Move,
scale or redesign the second one. Check overlap by projecting both bounding
boxes to screen: if they merge into one blob, one is invisible detail.

**Clear thresholds.** For a street-scale narrative, reserve reference-scaled approach space (about 2 m in the calibration scene) in front of a gate,
portal, spawn mouth or door. No crates, barrels, boulders, bones, vines or
rising smoke in that pocket. A grey billboard above an arch reads as a rock
flying out of the entrance even when it is transparent.

