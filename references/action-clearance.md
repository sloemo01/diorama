# Occupied space through actions — people, animals and scenery

Applies to authored AND downloaded assets, narrative AND educational, all render presets. An asset looking good alone is not proof it can sit, walk or fit here. Prevent visible intersections through layout/frames/trajectories; don't bolt on a random physics response after the animation has already put two bodies in the same space.

## 1. Reserve space before dressing it

- Buildings/stands: measure complete transformed envelopes, including roof/awning/steps/fences. Reserve independent parcels, door swing, entrances, paths and maintenance access. Use actual doorway/aisle widths versus the travelling body's full width, including carried objects. Don't space houses by origins or visual centres.
- Separate static structure, dynamic actors and authored contact surfaces. For an accessible building, use wall/column/roof/doorway pieces; its enclosing AABB contains legitimate interior space. A whole-building proxy flag is a candidate requiring decomposition, not evidence to delete the building or ban all occupants.
- People/animals: reserve torso/head/limb/tail/wing and carried-prop space for the LARGEST relevant pose, not just a T-pose thumbnail, root point or upright body radius. Test final scale and chosen clips before adopting an imported rig. Reroute or choose a suitable rig/clip if the candidate cannot perform the required action.
- Paths use swept widths and turning/gesture envelopes, not centreline separation. Give queues measured headway and unique standing slots; crossings use deterministic yielding/time reservations. Include fast vehicles, low roofs, railings, benches, doors and departing riders. Prefer fewer well-spaced supporting actors to an overcrowded scene; don't erase the hero action or important detail.

## 2. Seating is a frame/state contract

Each seat has one real local frame plus support height, usable width/depth, backrest plane, footwell, approach/exit path and occupancy interval. A seated actor is not a standing rig translated downward.

Use approach → turn/align → lower pelvis and bend hips/knees → supported sit → stand → exit. Solve pelvis/seat and feet/ground from the ACTUAL rig and surfaces. Check knee/thigh/torso against backrest, armrests, table, rails and neighbouring occupants; sole and pelvis support gaps must also pass the separate contact check. Don't sink feet into the slab to fake a seated silhouette. Occupied-seat reservations prevent two people claiming the same seat. Ride seats and carried objects inherit the moving parent's frame; don't add the same world displacement twice. A seat moving or rotating must carry its rider through the same local-to-world chain.

Allow named intended contact such as pelvis↔seat support, sole↔ground, palm↔carried handle, adjacent anatomical joint or a named structural joint, with explicit phase window and bounded depth. It does NOT exempt the entire person/chair/car, other limbs or other phases. A collision exemption is NOT proof of support: floating above a seat still needs a real face-gap check. Keep any intended combat/contact event similarly scoped.

## 3. Measure actual poses, then choose occupied proxies

Copy `templates/pose-bounds.mjs` and inject the project's THREE:

```js
const posed = createPoseBounds(THREE);
// After the actual scene evaluator/mixer has applied this phase:
const measured = posed.measure(mesh, {includePoints: true});
// Optional {frame: parent} for local measurements; rigid instances need instanceId.
```

This reads active indexed/draw-range vertex positions via `getVertexPosition`, including CPU skin/morph deformation, updates bone/world frames and does not silently discard transparent or hidden physical geometry. It ignores stale geometry.boundingBox/constructor dimensions. Shader/displacement/batched or unsupported instance-morph deformation fails explicitly; supply a justified geometry-aware method, not zero occupied space. Material/group ranges can be over-covered. Pose bounds are conservative envelopes, not occupied-solid intersection tests.

For useful fine checks, assign stable semantic proxy IDs to real body regions: torso, head, upper/lower arms, thighs/shins, paws, muzzle/horns, tail/wing segments, bags/carried items. Boxes represent actual structural pieces, not an enclosing hollow room. Set proxy radii/extents from the final imported geometry/poses and compare against real posed vertices and representative contact crops. Don't fabricate thin proxies to make a failing actor pass. Point/bounds samples alone don't prove arbitrary triangle/solid coverage; retain uncertainty for unsupported coverage. Conservative whole-pose bounds are a safe broad screen but may overflag seated/curved subjects. Refine those candidates rather than reporting them as certified mesh penetration.

## 4. Reuse the small proxy checker

`templates/action-clearance.mjs` provides `createActionClearance(THREE)`:

- `sphere(center,radius)`, `capsule(a,b,radius)`, `obb(center,halfSize,quaternion?)` use WORLD units/axes and full radius/half extents. Fresh shape callbacks follow current bone/parent poses; don't cache a standing capsule forever. Convert nonuniformly scaled imports correctly; arbitrary affine shear is not an OBB rotation.
- `pairCheck(a,b)` returns signed proxy separation/penetration plus method. Capsule distance is segment distance; capsule/box uses analytic outside distance and a deepest-centerline signed bound inside. Box/box SAT gives an axis bound, not exact Euclidean gap or mesh intersection. Use the reported method honestly.
- `auditPose({parts,requiredIds,time,clearance,contacts})` checks registered near pairs using sweep-and-prune expanded bounds. Same-owner parts are NOT globally ignored. `parts` are `{id,owner,getShape(time)}`; contacts name EXACT `{a,b,start,end,maxPenetration,reason}`. Production scene runs must supply `requiredIds` from the independent design inventory, NOT `parts.map(...)`. Exact matching yields `coverageVerified:true`; omission yields false and cannot certify scene completeness. Missing/duplicate IDs, invalid geometry/data and unbounded/missing contact references fail closed. No exclusion by colour, material, actor type or transparency.
- `timesForInterval(start,end,{maxStep,eventTimes})` includes endpoints and exact specified events. `auditMotion({source,times,parts,clearance,contacts})` calls synchronous `source.evaluate(t)` before each pose snapshot; use the REAL production driver and wait for assets to load first. Times must be strictly increasing, unique and cover at least two poses; use `auditPose` for a single still. Capture/freeze/restore the previous user time yourself. Each audit has a fixed independent active inventory and one rule per contact pair. Split runs at authored spawn/exit changes or repeated disjoint contact windows, derive active IDs from the schedule (not `visible`), and check both sides of each boundary. Do not widen a contact window or depth merely to suppress a failure.

```js
const c = createActionClearance(THREE);
const parts = [
  {id:'visitor/forearm', owner:'visitor',
   getShape:()=>c.capsule(elbow.getWorldPosition(new THREE.Vector3()),
                         wrist.getWorldPosition(new THREE.Vector3()), forearmRadius)},
  {id:'kiosk/wall', owner:'kiosk', getShape:()=>c.obb(wallCenter, wallHalfSize, wallRotation)},
];
const times=c.timesForInterval(0,loopDuration,{maxStep:chosenStep,eventTimes:criticalTimes});
const result=c.auditMotion({source:sceneEvaluator,times,parts,
  requiredIds:expectedCollisionIds, // independent DESIGN inventory
  clearance:sceneClearance,contacts:declaredContacts});
if (!result.clear || !result.coverageVerified) reportAndRepair(result.worstCases);
```

This example is only two pieces: the actual registry must cover independently declared required actors/appendages/obstacles and their meaningful nearby pairs. A missing actor never becomes “clear” just because it wasn't registered. Separate active-presence intervals (actual enter/exit/pool state) from material visibility; don't remove a currently occupied body to make a checker pass. Explicit adjacent-joint contact can be valid; arm through torso, tail through fence or knees through a table is not.

## 5. Sample the action, not one attractive frame

Check full cycles plus loop seam, approach/contact/departure, largest reach, extremes, seat entry/exit, crossing times, door swing, carried transfers and spawn/exit transitions. Test planted feet/paws against the moving/uneven support as well as other actors. Include both moving bodies at the SAME evaluation time.

Choose time spacing from the smallest relevant feature/clearance and a defensible bound on relative tip motion (including rotations), not an arbitrary “three frames”. Refine near violations and between samples with large limb/prop displacement; check exact state boundaries on both sides. A sampled pass is **sampled evidence**, never continuous collision freedom. `auditMotion` reports `sampledOnly:true`; it does not estimate missing motion bounds, solve trajectories or guarantee against tunnelling between unsampled times. A uniform frame rate alone is not a continuous proof.

Fix the shared causes: seat/rig scale, joint/pivot, path lane/width, building parcel, root-motion duplication, reservation or action timing. Deterministic retiming/yielding is preferable to frame-by-frame jitter or random nudges. Never hide clipping by fading bodies, disabling depth, shrinking colliders, freezing all motion, deleting obstacles or allowing all same-owner/contact pairs.

## 6. One affected QA pass, not another dashboard

Keep one scene QA runner. Cache immutable static obstacle data; broad-screen neighbours, refine only relevant candidates. Test imported clips before spawning many copies, then verify all instances at their final transforms/scales and schedule offsets. Print a count and the worst few pairs/phase/depth; keep full evidence on disk. A proxy-overlap candidate must be resolved against the intended proxy/actual geometry, not optimized into a smaller unexplained count.

Rerun the SAME predicate after real mutations: move a wrist/tail into a wall, move a seated knee into the backrest, overlap two building footprints, align two actors at a crossing, exceed a named seat-contact tolerance. Each must flag for the right reason; restoring the source relation must pass again. Check side/back/top/contact crops and a short action strip for the worst live interaction. These regressions test the helper and supplied fixtures—not every future actor or a new full amusement park. No educational UI or label system is added by collision QA.
