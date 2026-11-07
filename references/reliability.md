# Construction and repair adapter

The core is normative. This adapter turns the electricity-campus failure pattern into reusable checks for buildings, machines, characters, furniture and moving assemblies. It does not claim arbitrary mesh collision or load-bearing physics certification.

## Small implementation contract

1. **Assemble from a placement table.** Keep unit, datum, parent-local position/axis, footprint, required members and interface IDs together. Build a cylinder/pipe from its two mating endpoints using native +Y → direction quaternion; use centre coordinates for a rotated cylinder. A base-Y helper offsets before rotation and therefore does not describe the final underside. Keep real ports/holes and actual support members in the same assembly definition.
2. **Separate physical ownership, selection scope and appearance.** Return `{group, pieces, interfaces, anchors}` from each builder. An exclusive physical leaf registry owns each independently placed/working assembly for pair coverage. A separate selectable scope can union several leaves (e.g. City load contains three buildings); selecting that scope must not remove building/building checks. Inspection's single controller still requires disjoint ownership among its active top-level scopes; a clicked piece refines a scope. Register all façades/fittings/bases/descendants by semantic role, not material/type/coordinate filters. Floor/roads are context. Reject duplicates, unknown IDs and empty expected members; never put the entire scene in one physical assembly to evade checks.
3. **Store anchors locally.** Derive `anchor.local` from a real mesh face/vertex/port once, transform from the live source every evaluation. If using geometry bounds, recompute after a geometry revision. Both ends of a cable and the insulator it meets share that interface record. Callout, emitter, pick target and focus cannot maintain separate guessed world-coordinate lists. A screen label then projects world → NDC → actual canvas client rectangle and is clamped/occlusion-tested; this helper supplies world points, not screen/UI behavior.
4. **Use actual geometry.** After parents update, transform position attributes into world coordinates and validate finite values/counts. Don't choose fixtures by geometry constructor/type/parameters: RoundedBoxGeometry can inherit unit-box metadata. Test physically relevant extremes, not object origins. AABB broad phase is conservative: holes, concave saddles, thin angled struts and unions containing empty gaps need authored narrower proxies or analytic/mesh checks before a clearance claim. Never suppress a flagged assembly just because it looks okay.
5. **Trace supports.** Each supported member has a declared surface/joint and local contact patch. For a simple axis-aligned base, measure bottom minus pad-top plus positive overlap on both transverse axes. For curved, angled or moving contacts use actual transformed mating surfaces/analytic residuals, not an assembly's global min/max. Check a connected support graph from required members to named roots; its edges require measured geometry, not ID strings alone. A passing graph is not structural-strength proof.

## Copy-in coarse audit

Copy `templates/scene-contract.js`; inject the scene's existing THREE instance. Use a **dedicated physical audit root** before adding selection overlays/particles. Every mesh under that root must be registered and owned exactly once; expected counts come from the independent inventory. Do not omit inconvenient geometry. For imported skinned/morphed/instanced meshes use a compatible evaluated-geometry/proxy adapter and retain explicit coverage; the rigid helper rejects unsupported classes.

```js
const audit = createSceneContract(THREE, {
  root: physicalRoot, expectedAssemblies: 2, expectedMeshes: 2,
  tolerance: 1e-5, // choose against scene units, not this example
});
audit.mesh('pad.solid', pad).mesh('unit.body', body)
  .assembly('pad', {meshes: ['pad.solid']})
  .assembly('unit', {meshes: ['unit.body'], anchors: {
    label: {mesh: 'unit.body', local: [0, bodyHeight / 2, 0]},
  }})
  .contact({id: 'unit-on-pad', upper: 'unit', lower: 'pad',
    axis: 'y', tolerance: contactTolerance, minOverlap: requiredPatch});
const report = audit.evaluate(state);
// Full-assembly world envelopes + exact registered member bounds are in report.
const sweep = audit.sample(phases, phase => evaluateScene(phase));
```

`mesh`, `assembly` and `contact` declarations are sealed on first evaluation. All live physical-root meshes remain covered. Contact is only an axis-aligned envelope face/overlap test. Envelopes are keep-outs; union-gap overlaps also flag conservatively. A flagged pair needs geometry correction or a documented narrow-phase method. Intended overlap is not permission for an unrestricted exemption: an exact mesh-pair exclusion must have an explicit penetration budget, rationale and active state/phase condition if moving; it cannot exempt another member or certify a real surface. See the helper's API and tests before using `exclude`. If the selected method cannot validate an opening or interlocking part, report UNVERIFIED and add a subject-specific check; do not game the helper by grouping colliders together.

**Adjudicate, don't silence:** retain the raw conservative report. A scene-level coverage ledger may resolve a candidate only with `{pair, memberSurfaces, phases, method, tolerance, worstResidual, sourceHash, testCommand, negativeFixture, proofPath, result}` from an executed analytic/mesh test. A union-gap candidate with all member pairs proven clear can be resolved there; the helper's raw `ok:false` remains recorded, not rewritten. Final physical acceptance requires every relevant candidate and internal pair covered and no FAIL/UNVERIFIED—not raw helper `ok` alone. An arbitrary callback, prettier screenshot or unbounded exclusion is not adjudication.

**Internal interfaces:** the top-level helper tests different physical leaves, not pairs within one leaf. Keep selection semantics unchanged; build a dedicated per-interface sub-audit fixture using clones with their actual world transforms, registered as `housing`/`shaft`/`support` audit participants, or run the subject's analytic/triangle test directly. Never reparent the live scene or omit caps/bevels. For a bored plate: use actual bore axis/end-plane residuals and radial clearance including bevel intrusion, plus actual beam/flange solid tests; the outer housing AABB necessarily contains the shaft and cannot prove a bore. Record these internal pairs separately in the same ledger. `mechanism-contract.mjs` validates scalar/interface budgets; its passing result still needs actual opening geometry evidence.

The helper has no renderer, material selection, UI, source hashing, exact holes, rotational sweep or continuous collision solver. Run its regression fixture with `node verify/scene-contract.mjs` in the installed skill, setting `THREE_MODULE` to the project's installed Three module when needed. The host still owns detailed per-scene coverage and a built-artifact browser run.

## Bounded failure injections

Make these test-copy mutations and require the matching check to fail; restore before final build:

| Mutation | Detect with |
| --- | --- |
| Remove required member / select fixture matches zero objects | Explicit expected ID/count and finite nonempty geometry |
| Lift or bury foundation; move a support off the pad | Signed contact gap + transverse contact patch + support graph |
| Make a canopy/roof cross the neighbouring lot | Complete assembly envelope, then actual close-pair method |
| Shift one repeated bearing or use wrong cylinder axis | All-instance shared-frame residual + transformed axes/end planes |
| Fill a bore / add a beam through it | Actual bore section/triangle or analytic solid check, not scalar radius alone |
| Move/rotate an assembly after callout registration | Anchor follows live transform; endpoints/focus/pick ownership follow too |
| Exclude one mating pair then collide a different pair | Exact-pair policy and penetration/window budgets |
| Switch a glass façade to wrong material controller | Map/class preservation, shader compile, selected pixels + exact restoration |
| Run stale bundle/report | Loaded artifact identity equals successful fresh build hash |

## Repair dependency closure

Never finish a relocation by changing just `position`:

- **Position/scale/geometry:** recompute lots, base heights, supports, approaches, swept bounds and fit; update geometry-derived anchor frames, ports, cables, emitters, useful focus, picker ownership and annotation occlusion. Retest neighbouring lots, not only the moved object.
- **Hierarchy/merge:** rebind semantic ownership, pieces, anchors, animation handles and support graph to surviving meshes; verify no old unparented object is used as world position.
- **Material/selection:** retest every owned member including Basic/maps/arrays; excluded neighbours; preserved original materials; clear/Reset/Inside; overlay lifetime/counts; browser shader errors.
- **Copy/metric:** check selected card AND shortened callout AND source/units; component-specific explanation must match visible geometry and live state. A cooling tower metric is not coal-plant efficiency.
- **Any shipped source change:** successful rebuild, fresh hash and affected probes/screenshots on the output. Never reuse stale passing evidence. Expand tests when the repair reveals a missing invariant, rather than adding another guessed offset.

## Evidence provenance

Electricity-campus repair, 31 October 2026: city towers and battery bodies intersected; rotated/base-height conventions caused unsupported details; relocating a cooling tower left the callout at old world coordinates; colour/coordinate filtering omitted glazing and a tower from City load emphasis. The repair measured complete city envelopes and supports, tested 48 owned tower meshes/12 glazing planes with exact restoration, derived the cooling anchor from the moved assembly and captured both reverse and selected views. These are local failure examples, not a benchmark that guarantees unrelated future scenes.
