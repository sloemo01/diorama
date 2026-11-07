# Small interface checks — apply at the risky joint

Copy `templates/interface-checks.js`, inject the scene's existing THREE, and reuse these predicates in the same QA runner. They do not build a global physics/collision system. Geometry bounds use active transformed triangles; hidden and transparent physical meshes stay included. Unsupported deformation/empty data fail rather than disappearing from coverage.

## Model the working region before the support

For a fixture, gate, machine, drawer or character/vehicle transfer, reserve a local volume for the payload/tool/travel. Put supports below/around that volume; a shortened support must still join real load-bearing geometry. A continuous carrier plate can support the fixture while a short spider connects that plate to a hub; a long arm through the pocket is not extra useful detail.

Derive the stack once: bearing face → collar bottom/top → hub → carrier bottom/top → fixture seat. Mounting bolts attach to real surfaces and clear walls and payload; labels do not hang into neighbouring moving geometry. Generate all instances from the same frame table, then run the same predicates on EVERY instance.

## API and limits

```js
const q = createInterfaceChecks(THREE);
// Both are complete axis-aligned boxes in the supplied local frame.
const contact = q.seated(plate, support, {
  frame: assembly, tolerance: 1e-4, minOverlap: .1,
});
const clearance = q.outsideBox(arm, {
  frame: assembly, box: workingPocket, clearance: .1,
});
const scope = q.scopedMeshes({required: specifiedMembers, registered: selectable.meshes});
const anchor = q.worldAnchor({mesh, root: physicalRoot,
  local: geometry => { geometry.computeBoundingBox();
    const b = geometry.boundingBox;
    return [(b.min.x+b.max.x)/2, b.max.y, (b.min.z+b.max.z)/2]; }});
const fit = q.projectPoints(actualWorldPoints, camera, {margin: .08});
```

- `bounds(mesh,{frame})`: actual active geometry envelope in world or named local axes. Ignores rendering visibility, not physical membership.
- `seated`: validates complete axis-aligned box surfaces, then signed face gap and positive transverse overlap. Curved/bevelled/annular/partial surfaces need the appropriate real-face predicate; a bounding-box face is NOT their seating surface. Explicitly reject unsupported cases instead of relaxing this helper until they pass.
- `outsideBox`: conservative AABB separation. `clear` proves separation from this declared box at this pose; `candidate` does NOT prove penetration. Use real geometry/proxy checks for close candidates and full moving-path samples where applicable.
- `scopedMeshes`: exact nonempty membership against an independently specified mesh list, including glazed parts; don't create both lists from the same filtered survivors. It doesn't prove shader appearance or exact material restoration—exercise the existing inspection controller and reviewed pixels too.
- `worldAnchor`: derives a fresh point from the live mesh/local frame; callback can recompute geometry-dependent anchors. Rejects detached sources. Validate geometry once during build/QA; this is not an occlusion, screen-label or displayed-text test.
- `projectPoints`: reports full projected point coverage and clipping; it doesn't prove another solid isn't occluding them. Retain the selected/restored screenshot check.

All example values are illustrative model units, not universal tolerances. For an annular carrier, a short-spoke outer-radius bound strictly inside the nearest fixture radius can prove their separation only when the actual geometry lies in the measured radial bands. Use transformed geometry, not an assumed radius or outer-minus-outer clearance.

## A few real regressions, not more ceremony

Pass baseline → lift a real mounting plate → SAME seating predicate fails → restore → pass. Extend/move the real support into the working pocket → SAME clearance predicate flags a candidate → use the relevant narrow check → restore. Omit the actual glazed member from selection → SAME scope predicate fails. Translate/rotate parent and revise source geometry → live anchor follows; remove it from root → reject. Move camera too close → SAME projection predicate fails; use the solved fitter → pass.

Evidence: the 1 November carousel repair shortened eight spokes from the bottle-pocket region to the inner carrier lip, seated the rotating stack on its actual bearing and moved bolt heads/labels clear of occupied regions. The focused project runner passed 44 bounded checks and two real mutations, with reviewed empty-pocket/top/low captures. That repaired assembly is evidence for these patterns—not proof that the whole machine, gear design or a future model is mechanically certified. No required per-mesh screenshot collection or extra all-pairs audit is added.
