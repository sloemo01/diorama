# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Motion Graphics Primitives (arrows, flames, flow)

Animated arrows and flames are how a mechanism explains cause. They fail
silently: the build passes, one still looks plausible, and the graphic points
backwards or sits inside a solid. Treat every primitive as a tiny part with its
own convention test, in every preset.

- **Declare and test the local forward axis.** A cone built with
  `CylinderGeometry(radiusTop, radiusBottom, ...)` points along the *top* end.
  Swapping those two numbers makes every arrow flow backwards while still
  looking like an arrow. Build the tip at local `+Z`, store `tipLocal` and
  `tailLocal` in `userData`, and assert: cone base wide and behind, tip a point
  ahead, and the placement transform maps `+Z` onto the requested tangent.
- **Never place an arrow on the centreline of an opaque body.** An arrow inside
  a cast runner is invisible with honest depth testing; the usual "fix" is
  `depthTest:false`, which turns the scene into x-ray. Two honest options only:
  cut a real window/section that exposes the gas volume, or place arrows solely
  in the genuinely open region (port mouth, chamber, outlet). Keep depth test and
  depth write on; assert `depthTest === true` for effect materials.
- **A spline through an open cutaway is not a flow route.** An intake path that
  looked correct in the port still speared the valve disc, because the gas turns
  around the open valve, not through it. Derive each effect from the *current
  free volume* (crown to the live valve underside) instead of a fixed centreline,
  and use one bold arrow per stroke rather than a stream spawned along a curve.
- **Fit the whole cone, not its centre.** The vertical extent of a
  cylinder-capped cone depends on its direction: `|dy|·half + flat·head`. For a
  vertical arrow that is its half length, so clamping only the centre lets the
  head pierce the crown or the valve. Compute the extent, reduce the scale until
  the band and the bore both fit, then clamp the centre. Judge "bold" by rendered
  length (`length × scale`), not by the scale ratio: a long authored arrow in a
  short band is legitimately scaled down and still reads.
- **Anchor to a real surface, and normalize the authored length.** Put the intake
  tail and the exhaust tip `0.008` under the valve head underside
  (`seat − 0.061 − lift`), span at most `92%` of the band, give a compression
  chevron its tail on the rising crown (`crown + 0.02`) so it touches the charge
  it describes, and start a force arrow `0.015` *inside* the flame tip. Author the arrow at its maximum length so `scale ≤ 1`; otherwise a
  non-normalized `1.14` arrow makes the minimum-scale gate and every sizing test
  meaningless.
- **Never stack two rows of the same arrow.** Two overlapping compression rows
  read as double-headed spikes. Two side-by-side chevrons, or one arrow, not two
  rows at the same x/z.
- **Couple the effect to its source.** A pressure arrow that outlives the flame
  becomes an orphan arrow pointing at nothing. Fade the arrow with the flame
  kernel and hide both on the same frame.
- **Every Y constant shares one space.** A group lifted off the plate (here
  `+0.024`) silently shifts every "absolute" ceiling. Measure the *scene* in the
  same local space the constants were written in; mixing world and local turned a
  correct flame into a phantom 24 mm head violation.
- **A flash must not saturate the frame.** Halo opacity `0.40`, halo scale `0.42`
  and point-light intensity `2.2` are already generous at diorama scale; the
  earlier `0.95 / 1.14 / 9.0` blew the whole head to white, and `0.55 / 0.62`
  still washed the crown orange for two frames. Judge the ignition frame itself,
  not the frame after it.
- **A flame may not die as a bead.** The kernel must span the fixed clearance
  recess at TDC (`0.125` here) and be hidden below `0.12` height. A flame that
  fades to a two-pixel dot on the valve seat is the flame equivalent of an arrow
  speck, and a mid-stroke still will not show it.
- **Audit every 15°, not four hero stills.** Render the full 720° at a tight
  chamber camera, build one contact sheet per stroke, and read every cell. The
  spear-through-valve, the double-headed chevrons and the ignition white-out were
  all invisible in the four "representative" screenshots.
- **Bound the change between adjacent degrees.** A per-degree delta test on
  position and scale catches pops that a mid-stroke still hides. Scale a fade so
  it cannot drop by more than about `0.06` per degree, and hide only when the
  final scaled size is below the legible threshold.
- **No effect speck.** A primitive that fades by scale must become invisible
  before it becomes a 2 px nub. Drive `visible` from the *final scaled size*, not
  from the envelope alone, and hide below a legible threshold (about 0.3 of the
  authored arrow length at a normal educational-camera distance; 0.22 is only for
  very large arrows). Test the fade boundary as well as mid-stroke; a nub reads
  as a rendering bug.
- **Size against the real free volume, and check the sign.** Measure the moving
  ceiling (valve faces, piston crown, lid) each frame, not the closed deck or a
  cached constant. An inverted subtraction (`floor - tip` instead of
  `tip - floor`) silently hides every arrow while all numbers stay finite. Assert
  the available band is positive wherever a primitive is visible, and fit the
  full tip/tail/width inside it.
- **A flame is a kernel, not a balloon.** Anchor it at the igniter/plug and let it
  grow only into the volume the mover releases, except that the kernel always
  spans the fixed clearance recess at TDC where the released gap is almost zero.
  A chamber-sized flame hides the pressure graphic, touches the piston and reads
  as a balloon. Keep it compact, put the force arrow in the free band *below* the
  flame, and prove the flame bounds against the crown and the head across the
  whole event.
- **One idea per primitive.** Three short arrows sharing an origin merge into an
  unreadable trident; one bold arrow reads instantly. If a fan is genuinely
  needed, separate tails and heads by at least one head-width and verify it in a
  1:1 crop.
- **No ink outline on tiny FX.** An outline sized for castings swallows a thin
  shaft and turns coloured arrows into black sticks. Effect materials stay flat
  and un-outlined; check `outlineParameters.visible === false` and the rendered
  colour in a crop.
- **Lifetime is phase-bound and deterministic.** Each group has an explicit
  window and no history dependence: visible mid-stroke, zero in every other
  stroke, identical for the same phase in any order. Test mid-stroke counts and
  a sweep of outside phases.
- **A hollow outlet is one connected solid.** No floating torus as a rim and no
  flat cap closing the bore. Lathe one continuous sleeve + rolled lip, overlap
  the pipe, and prove with a centre-ray (passes through the opening) and an
  annulus-ray (hits material).
- **Every crossed fixed wall needs a real opening.** A piston, rod or shaft that
  passes a flange needs a bored hole/slot with measured swept clearance, not a
  shelf with a dark circle painted on it. Test the actual structural mesh against
  every moving surface vertex at the crossing plane, at the lowest/full-travel
  pose.
- **Selection:** follow `Canonical educational UI and inspection contract`;
  an explicit Inspect focus is distinct from a camera-stationary lesson step.
- **Use the copy-in helper, not a fresh guess:** `templates/flow-primitives.js`
  carries the +Z convention, the band fitter and the legibility gate.
- **Regression checks for this section:** forward-axis unit test, tangent
  alignment, per-stroke visible counts plus zero leakage, minimum legible scale,
  a 720° vertex sweep against crown/bore/head/valve-disc/stem/plug with the live
  lift, an adjacent-degree no-teleport bound, flame-kernel and crown bounds,
  open-outlet and flange rays, a 48-frame contact sheet per stroke, and a
  screenshot strip of all four strokes from two orbit angles. A missing check is
  not a pass.

### Recorded failure modes (four-stroke engine, v3.12.0)

These were all present in one finished-looking scene; check for each by name:

1. Reversed cone (`radiusTop`/`radiusBottom`) — arrows flowed backwards.
2. Arrows on the centreline of solid intake/exhaust runners — invisible, then
   faked with `depthTest:false`.
3. Fade boundary left coloured specks (scale 0.016) visible.
4. Arrow ceiling taken from the deck instead of the valve faces, and inverted
   downward-room sign — pressure arrows vanished entirely.
5. Chamber-sized ignition flame hid the pressure arrows and touched the crown.
6. Three short pressure arrows merged into one trident.
7. Ink outlines turned small flow arrows into black sticks.
8. Detached torus "rim" floating off the exhaust pipe; solid cap in the bore.
9. Solid cylinder-base flange slicing the piston and rod at the bottom of the
   stroke — the exact "it passes through" report.
10. Part selection changed colour but did not dim the rest or move the camera.
11. Intake/exhaust arrows followed a spline through the valve disc — a visible
    spear through the head. Fix: free-volume arrows, never a port centreline.
12. Only the arrow *centre* was clamped, so heads poked through the crown and the
    valve underside. Fix: fit the direction-dependent full extent.
13. Two stacked compression rows overlapped into double-headed spikes. Fix: one
    chevron per side.
14. Arrow scales ran past `1.14` because the authored length was shorter than
    the desired length, defeating the legibility gate. Fix: normalize length.
15. The pressure arrow outlived the flame and pointed at nothing. Fix: shared
    fade with the flame kernel.
16. World-space tests applied to engine-local constants reported a phantom
    flame-above-head violation (`+0.024` root lift). Fix: one declared space.
17. Ignition flash at `opacity 0.95`, `scale 1.14`, `intensity 9.0` blew the
    whole head to white for the ignition frame. Fix: capped flash.
18. The flame faded to a two-pixel bead on the valve seat for 20° of crank
    rotation. Fix: span the clearance recess and hide below a legible height.
19. Four hero stills missed all of the above; the 15°-step contact sheet and a
    6°-step video found them. Fix: the frame-by-frame audit is the acceptance
    gate.

