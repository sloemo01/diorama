# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Construction regression gates

These construction rules apply across subjects and all render presets; they supplement, not replace, the style gate and profile-aware verification above. They make known failures testable, not impossible.

1. **Specify the mating interface before decorating the part.** Extend the component manifest with units, parent-local frame, shaft/bore/slide axes, shared joint/port anchor IDs, mating surfaces, nominal dimensions and radial/axial tolerances. Derive both mating meshes and their motion from those anchors, not repeated guessed offsets. A bearing eye needs a real through-bore; its beam, cap, bolt and bevel must stop outside that bore. Budget bevel/fillet intrusion in the actual construction method (inward bevels reduce usable bore), axial lane widths, spacers, end float and end stops. Check coaxial alignment and anchor residual after parent transforms. Model the load path through real bearings, brackets, fasteners and a base; route each functional port through an actual connected opening to its destination, not a hose ending inside a solid. Document symbolic/omitted internals. **Evidence:** V8 running-gear repair found a centred rod beam cutting its crankpin despite an annular eye, bank stagger applied to only one mating member, and fillets facing the wrong local axis. **Test:** local-axis/anchor tests, measured bore plus bevel allowance and axial stack tests, section crops from two orbit directions, and traced port/support connections. Record geometry revision and proof frames in the manifest. Copy `templates/mechanism-contract.mjs` and fill the interface and connection sheets in `templates/DESIGN.md`; the helper validates scalar budgets, not arbitrary mesh bores or load strength.

2. **Audit the complete swept assembly, with narrowly scoped intended contact.** Derive every driven pose from one driver and test the actual transformed meshes or documented conservative collision proxies, including beams, caps, fasteners, webs, fillets and supports. Broad-phase boxes alone neither detect holes correctly nor prove clearance. Enumerate potentially interacting pairs and coverage; whitelist only a named pair of mating surfaces with phase window, normal-gap/penetration tolerance and rationale (bearing/journal, meshing teeth, valve/seat), never an entire assembly or all pairs of a part type. All other pairs need the declared positive clearance. Check full travel, extrema, cycle seam, contact transitions and close-approach intervals with refinement; include ports/FX containment. Report method, sample spacing, tolerance, worst phase/pair, exclusions and unresolved regions. Dense sampled vertex/triangle tests are bounded evidence, not continuous exact collision proof: use analytic bounds or conservative continuous checks where available, otherwise retain that limitation explicitly and block unsupported clearance claims. **Evidence:** the V8 12/12 invariant report omitted rod/crank interference; the later rod probe added bore triangle samples, axial lanes, journal vertices, anchor residual and fillet axes. **Test:** intentionally inject a beam-through-bore, wrong-axis fillet, too-wide lane, out-of-window contact and a non-whitelisted overlap; each must fail. Run full-cycle probes plus before/contact/after crops from two angles. `templates/qa/mechanism-contract.test.mjs` tests budget/contact-policy failure detection only; per-scene geometry/sweep checks remain mandatory and UNVERIFIED until run.

3. **Repeated interfaces share anchors and axes (3.18 evidence + test).**
   Generate ALL repeated mating members from one anchor/axis table, not just the
   first working example. Quartz-watch pads at radius 12.6 missed posts at 13;
   rotating a native CylinderGeometry about Y did not redirect its native Y axis.
   The seconds shaft opposed its hand and the model lacked a physical 60:1 stage.
   Coplanar shaft-cap fans z-fought. Use transformed local axes (quaternion maps
   native Y to the declared axis), common anchors, real through-bores and a single
   end surface or measured axial separation; never hide coplanar caps with depth
   overrides. Derive ratio/direction from the actual connected transmission, not
   only a display hand formula. **Test:** with `templates/mechanism-contract.mjs`
   shared anchors/checkRepeatedInterfaces/checkEndPlanes, enumerate every pad,
   post, bore, cap and shaft; assert count, transformed axis/anchor residual,
   radial/axial clearance and physical ratio/direction across the full cycle.
   The repaired watch measured zero residual at all four pad anchors and 0.08
   board-bore radial clearance; those are historical measurements, not defaults.
   Inject one displaced repeat, wrong native axis, sealed bore, reversed shaft,
   missing reduction and coplanar cap; each relevant check must fail. Review
   section/end-on and oblique crops; scalars cannot prove real mesh openings.
   Evidence: the historical construction report and highlight shots above.

Lesson/UI behavior and its tests are defined once in `Canonical educational UI
and inspection contract`. `templates/education-dock.mjs` remains a dependency-free
state helper with `templates/qa/education-dock.test.mjs`; its older CSS is not the
V8 visual authority.

