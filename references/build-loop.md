# Small build loop for weak 3D agents

## Default working set

Core + DESIGN + chosen render recipe first. At each milestone read only the required API/subsection. Reuse the renderer, orbit, selection and educational UI; don't ask a weak model to invent all those while designing complicated geometry. `construction-kit.js` supplies explicit placement, actual holes and solved perspective fit; it is not a physics/collision solver. Keep subject-specific construction simple and reference-grounded.

The scene spec drives completeness. Numerical counts refer to functional repeats or required anatomy—not incidental mesh totals. Expected counts are independently declared. Physical leaves and selection scopes are separate even if both use stable semantic IDs.

## Working structure

- `config`: primary dimensions, local frames, required roles, repeated-instance data, three causal states. Derive all dependent dimensions from these values.
- `build`: parametric assemblies, each returning group, real local ports/support faces, occupied proxies, motion handles and semantic members.
- `evaluate`: one pure state/phase evaluator using those handles/frames. No independent lesson clock, no global bottle positions that ignore moving parents.
- `main/ui`: supplied presentation/orbit/inspection adapters and live geometry-derived annotations.
- `qa/check.mjs`: parameterized checks/captures in one runner; report linked to loaded artifact, baseline checkpoint written once using exclusive creation. More files only for a genuinely separate reusable test, not each camera experiment.

Do not enforce these literal filenames on an existing sound project. Keep responsibilities separate, not a new framework.

For a pocket, joint or moving interface, use `interfaces.md` and the bounded `interface-checks.js` API instead of writing a new validator from scratch. Reserve its local working space first; keep the support load path below/around it. Check siblings inside one assembly as well as separate neighbours.

## Six checks worth doing first

1. **Supports:** actual top/bottom mating-face gap and contact footprint; test one lifted support with the same predicate. Do not change a named bearing datum in one source but leave its collar at an old height.
2. **Repeats:** all station/bolt/rod frame residuals and expected count. Independent X/Z grid indices; rod collars use the same local rod frame as their bushings.
3. **Mechanical interfaces:** real bore surface vs shaft/cap envelope and travel, gear shared module/tooth-pitch/ratio, useful actuator range. A valid equation between copied config fields does not prove geometry.
4. **Transfer/flow:** full bottle/nozzle/path envelope through the actual opening; support across a transfer; real pipe endpoints; test extrema/approach/contact/departure. Transparent products and guards are still physical.
5. **Presentation/selection:** project full geometry after fitting, inside the actual stage-safe NDC rectangle; assert selected scope is visible, not merely that material pointers changed. Preserve material/map/ramp contents and identities, and evaluator-owned visibility. Test Clear and Reset. No fixed camera-distance exception over a solved fit.
6. **Callout/state:** displayed text, units and pointer/label rectangle at a relocated/rotated part and two frozen states. Coordinates returning to baseline is only part of this test.

These aren't six new audit frameworks. They are small predicates against a shared model, run early and again only after relevant changes.

## Where to use broad phase

Separate building lots and resting props: full-envelope separation is useful. Nested machines: start with explicit risky pairs and proper analytic occupied shapes. An annular bearing's outer AABB contains its shaft; minimizing its overlap count destroys the mechanism. Do not target a lower number of AABB candidates. Missing member, empty sample or unresolved pair is UNKNOWN, never CLEAR. Candidate identity includes both physical owners and member IDs; don't collapse absent-mesh rows to an empty deduplication key.

Optional `scene-contract.js` can check simple separated rigid fixtures and their axis-aligned support contacts. It does not cover within-one-assembly members, arbitrary bores/gear engagement or continuous motion. Read its own limits if using it; never demand it become a generic mechanism certificate. If an analytic proxy cannot represent an interface, use a known construction/mesh method for that interface, not a blanket assembly/material exemption.

## Short iteration contract

- At the first runnable layout, save three small views (hero/reverse/phone) and the cheap geometry result. If proportions/visibility/ground are wrong, fix primary layout now.
- Develop the highest-risk interface before repetition/detail. Once it passes, generate all repeats from its frame table and recheck them numerically.
- After at most two unsuccessful local fixes of the same defect, replace its dimensions/assembly construction from the shared frame. Repeating offsets, deleting supports and widening tolerances are not progress.
- Reuse one browser/page; parameterize view/time/selection. Don't create `diag-camera2`, `diag-camera3`, `diag-camera4` files or repeatedly launch the whole suite to change one pose.
- Show only worst five failures in tool output and a short repair note. Full results remain on disk. No long speculative narration between calls.
- A missing skill API should be fixed once in the reusable kit during maintenance; don't create per-scene shadow versions of the same helper.
- Final captures: hero, reverse, phone, one critical interface, selected/restored and a short motion strip if moving. Add a view only if it answers a specific unresolved question. A report is evidence storage, not the deliverable's main attraction.

## Real mutation coverage

Use the production check as-is. Baseline → change geometry/state → rerun same check → expected failure → restore → same check passes. Reject a wrong relation, not the presence/name of a test injection. Examples: lift a support and check actual gap; shift one repeated joint and check all residuals; change camera fit and check projected bounds; mutate a shared map and check borrowed source contents. A bespoke `injectedObject.parent === null` detector is not the missing-member validator.

Save the original failure with its artifact hash. Don't overwrite the first evidence or convert empty/missing adjudication into zero hits. Report scoped correctness without demanding structural stress/life/safety calculations the user did not request.

## Rotary trial evidence and what changed

Observed source failures included duplicated foot-bolt positions, an actual bearing/collar height gap, misplaced rod collars, incompatible gear pitch versus driven tooth ratio and guessed selected-camera targets. The first QA suite removed transparent geometry/products from coverage, compared outer radii/centres as if they were occupied-solid clearances, and used bespoke negative detectors. Many diagnostics and eight broad-phase count iterations did not fix the visible selected view. The revised core replaces those incentives with shared frames, first-interface proof, solved fit and a much smaller real-risk loop. A later scoped mount repair did fix the pictured arm-through-pocket: short inner spokes now carry the annular table, fixture plates/bolt heads meet shared seat datums, and the rotating stack meets its bearing face. Its 44 checks and two production-predicate mutations certify only that bounded repair; they do not repair/certify the rest of the machine or prove an unrun exact-model benchmark.
