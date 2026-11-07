# Selection and inspection

### Selection, focus and lesson adapter

Raycast actual visible geometry: nearest eligible hit wins, respecting nearer
opaque occluders. Map the hit mesh to both its assembly ID and its actual piece
ID; assembly selection and clicked-mesh selection are distinct scopes. The
single labelled keyboard piece picker must expose the same pieces/actions,
including hidden pieces; never silently broaden a click to an entire assembly.
Show one short explanation in the card. An optional single label uses a live
geometry-local anchor and hides behind camera, offscreen or when occluded.

A deliberate canvas/picker Inspect selection may make one short useful camera
AND OrbitControls-target transition to live selected bounds. Avoid end-on shafts
and blocking housings; use an authored reveal/cutaway for hidden pieces and
report remaining occlusion honestly. Save the prior view for Back; Reset restores
the hero. User orbit/pointer/keyboard navigation cancels the tween immediately.
Reduced motion uses an immediate useful view. Never auto-spin, chase moving parts
or restart focus per frame. Lesson step selection instead pauses and synchronously
freezes the real evaluator, highlights its part and updates phase/text/readout
without moving the camera; only an explicit Inspect action focuses. Scrubbing
updates the lesson from evaluated state, not an independent clock. Announce
intentional changes politely, not each frame.

Use semantic buttons/select/range, visible focus and non-colour part-name cues;
canvas arrows orbit and R resets. Tabs implement roving focus and keyboard
navigation; no focus trap. Drag/multitouch is orbit, not click (use the movement
threshold/cancel handling in `templates/orbit.js`); UI gestures never bubble into
the stage. Paused and reduced-motion modes retain inspection.

### Soft glow and holographic inspection — implementation recipe

This is an **inspection overlay**, not a new render preset, bloom pass or a way to hide modelling errors. Use the same mechanism for a selected gear, valve, pump impeller, drawer slide or anatomical structure. The V8 selection implementation is the calibration evidence: restrained warm material lift, dimmed context, transparent outer castings and selective gold feature edges. Do not interpret “glow” as a white emissive blob.

**1. Preserve and derive, never mutate the shared originals.** Build a registry once from the actual selectable meshes, BEFORE adding overlays. Store each exact original material reference, including arrays of material slots; a mesh's slot array itself must also be restored by identity. Derive cached variants from each source UUID plus mode. Clone `userData` and `outlineParameters` before changing outline alpha, since nested objects may otherwise be shared. Keep toon ramps, texture maps, roughness and existing supported preset properties. Restore the originals before applying each new selection/X-ray state, not by attempting to reverse colour arithmetic.

Use `templates/inspection.js` rather than duplicating a second material controller.
Its API is `createInspection(THREE, {parts, contextMeshes, resolveVisibility,
onChange, style})`, with `select({partId, mesh})`, `clear()`, `refresh()`,
`dispose()` and `piecePickerEntries(partId, {visibleOnly:false})` (includes hidden
pieces for keyboard inspection). Validate actual mesh membership before selection.
The helper supports rigid meshes only; reject skinned/instanced/morph assumptions.
`resolveVisibility` returns named `hiddenPartIds`/`hiddenMeshes` plus `description`
for an authored cover removal. Hiding requires `shell:true`, or an explicit
`inspectionOccluder:true` part plus an active selection and nonempty cutaway
description; that latter exception may remove an upper gear/bridge to expose a
lower part, never hide construction failures. Optional `ghostPartIds`/`ghostMeshes`
are accepted only for `shell:true`. Selected assemblies/pieces remain visible;
context meshes (floor/stand/UI) cannot hide, ghost or dim.
Unknown parts, duplicate ownership, empty geometry and unsupported material or
deformation paths fail explicitly. Never request a whole-mechanism ghost. The host owns
camera focus, picking and V8 DOM; the helper owns emphasis/restoration, not UI or
mechanical certification. Cached variants derive per original material and mode; never
from the currently displayed variant. Lift colour gently; write emissive values
only where the original material supports them. Dim context as opaque solids.
Only the explicit housing reveal below may change transparency/depth-write.

**2. Reveal only manifest-authorized occluders; ghosting is shell-only. Never defeat depth on the selected part.** Declare `internalPartIds` and `occludingShellIds` per subject in the component manifest. For an internal selection, remove authored covers or optionally ghost only declared outer housings that obscure it; keep the selected part solid, retain non-selected internals as dim solids, and leave floor/stand/UI alone. A global Inside toggle applies that same named reveal plan without dimming all internals. A selected housing stays highlighted rather than ghosting itself. Unlisted opaque solids must still occlude correctly: `renderOrder` does not override the depth buffer. For an internal blocker, author an explained selection-only `inspectionOccluder:true` removal plan; the independent Inside toggle still affects shells only. Hidden siblings need a piece-level plan and cannot remove the selected scope. Do not set `depthTest=false`, use additive whole-body overlays, or fade all solids to pretend a mechanism is correctly constructed. Picker rays ignore generated edges and ghost-shell hits, but respect remaining opaque foreground objects; click and picker share the same selection action.

**3. Make the hologram from feature edges, attached to the live part.** Do not use `wireframe:true`: that exposes triangle diagonals. Use `EdgesGeometry(source.geometry, 32)` and a restrained `LineBasicMaterial` (`color:0xffc35c`, `opacity:0.5`, `transparent:true`, `depthTest:true`, `depthWrite:false`, `toneMapped:false`). Normal blending, no bloom. Exclude slivers, ring grooves, gaskets and tiny bolts when edges become noise; the V8 thresholds were minimum dimension 0.018 units and, for cast housings, volume 0.006 units³. Those are **model-scale-dependent starting values**, not universal dimensions. Use one physical edge overlay on the selected component only, not a second full-scene OutlineEffect/Sobel pipeline. Its surface outline may need suppression to avoid doubled contours. WebGL line width is generally one device pixel: do not promise a controllable CSS-pixel width through `linewidth`.

Attach each owned edge overlay as an identity-transform child of its live source
mesh; mark it as an inspection overlay and exclude it from raycasting. On change,
remove and dispose owned overlays, never source geometry or shared maps.

This child pattern follows moving rigid geometry without copying a stale pose. If an overlay must be a sibling/world-space object, synchronise its transform from the source every evaluation; copying position/quaternion once is insufficient when the source mesh moves. `EdgesGeometry` does **not** automatically follow vertex deformation or per-instance transforms: skinned/morphed/instanced subjects need a deformation-aware shader/overlay or a clearly declared unsupported path. Never claim those supported because a rigid V8 example works. Do not dispose the source geometry, shared source maps, shared toon ramps or original materials; dispose only owned variants/edge geometries and owned overlay materials. Keep overlay generation bounded to selection changes, never create/dispose hundreds of edge objects every frame.

**State and restoration contract.** One selection controller owns this effect. Resolve in order: restore exact originals → remove previous edges → compute selected/internal/Inside state → ghost selected occluding housings → highlight selected meshes → dim remaining mechanism meshes → attach selected edges. Re-apply from originals when Inside changes. Leaving How it works restores its earlier Inside state and removes its tutorial tint; clearing selection retains an independently enabled Inside toggle. Picker, canvas, keyboard and lesson adapters must not compete by writing materials from separate uncoordinated caches. Clear/reset/teardown restores material references, opacity/depth/blending/outline state, selection/readout and authored camera state; only teardown disposes long-lived caches. Respect reduced motion; avoid automatic pulsing, scanlines or flashing. Keep the part name and keyboard focus as non-colour cues.

**Historical evidence (not project dependencies):** `quartz-watch/shots/highlights/dialPost1.png`,
`quartz-watch/shots/highlights/dialPost2.png`, `quartz-watch/shots/highlights/dialPost3.png`,
`quartz-watch/shots/highlights/dialPost4.png`, `quartz-watch/shots/highlights/individual-piece.png`,
`quartz-watch/shots/highlights/rotor.png`, `quartz-watch/shots/highlights/reduction.png`,
`quartz-watch/qa/highlights-report.json` and `quartz-watch/qa/construction-report.json`.
These record this repair, not files future users must have. Twenty-six assembly
glow states had numerical tests/captures; only a subset received visual review.
Do not present that as universal contrast certification.

**Evidence and test — selection contract (3.18).** Quartz-watch selection was
almost invisible, posts were end-on/occluded, and adding emitter properties to
MeshBasicMaterial caused a `shader.value` error. Use `templates/inspection.js`,
with `templates/qa/inspection.test.mjs` and
`templates/qa/inspection-browser.mjs`; use the API above. Assert assembly versus actual clicked-piece identity,
keyboard equivalence, nearest opaque occlusion, and obvious visible glow with
retained shape/colour (never a white blob) in desktop/phone crops. Test shared
and array materials, Basic/toon, two frozen phases, moving/orbiting, rapid changes,
Inside/clear/Back/Reset/lesson exit, interrupted focus and reduced motion. Restore
exact original material AND slot-array identities, shadow flags and `visible`
state, plus original material properties; test source immutability and owned-only
disposal with stable overlay/material counts. Basic materials must never gain
`emissive` or `emissiveIntensity`, even temporarily; feature-test capability before
writing, and assert absent properties remain absent. Verify shader compilation
and no console errors in the fresh browser build. Scalar/material tests alone do
not establish visible contrast, depth correctness or useful focus.

