# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Pitfalls

- **A building's roof is a large visible surface at 33 degrees.** Look down onto
  it and dress it, or keep buildings lower than they are deep.
- **A merge pass eats anything whose visibility is animated.** Batching
  same-material siblings keeps one `visible` flag, so hidden cargo comes back as a
  single invisible mesh that never appears, and the survivor's `getWorldPosition`
  reports local coordinates. Tag runtime-toggled meshes `userData.noMerge = true`.
- **Canvas size is presentation, resolution is the buffer.** Shrinking the display
  keeps the buffer; moving the buffer changes the art. `renderScale` 1.2–1.5×
  on a small subject sharpens it without making it larger; measure fps and inspect
  a 1:1 crop before keeping it.
- **Raising the buffer exposes geometry that hid at the old grid.** Re-run the
  portraits after any resolution change: floating hats, detached stripes and
  oversized noses show up there first.
- **A prop swallows a figure placed inside it.** Sit the figure on the near rim
  with the limbs outside; more detail inside will not read anyway.
- **Lying bodies convert joint Z rotations into vertical lifts.** Flatten
  shoulders to about ±0.15 and keep elbows near zero.
- **A springboard must move and the rider must follow it**: pivot at the root,
  integrate a spring on `rotation.z`, and put the feet on
  `pivotY + h*cos(flex) - arm*sin(flex)`.
- **A standing gesture blended into a walk straightens the legs and slides.**
  Gate `PAY`, `ORDER` and `POINT` on `!state.moving`; a still at one timestamp
  will not catch it, a 0.15 s strip will.
- **A carried prop parented to the root leaves the hands at the first turn.**
  Keep it in world space, solve from the wrists each frame, and log palm-to-prop
  distance.
- **A leg swung with hip X goes through the handlebars.** A side mount needs hip
  Z abduction, knee flex and a small root arc; hip X is for walking and sitting.
- **Shrinking the geometry or the canvas frame to satisfy "smaller"** shrinks
  the world clip, contact shadows and slab, or changes the 1:1 crop. Move the
  camera with `subjectScale` instead; the frame and backing buffer stay fixed.
- **A DOM caption on the white paper** is outside the diorama. Model the sign or
  use the browser title.
- **A hat hovering above the skull** is a brim at 0.225 instead of 0.192.
- **Oversized nose**: 0.044 at this camera is a snout, 0.038 is a nose.
- **Two figures at 0.8 m read as one silhouette.** Judge spacing from numbers.
- **A shared window synchronises a group.** Stagger every actor's window.
- **A door left open beside idle actors reads as stuck in the doorway.**
- **A pose switch is not a transition.** Cutting from a run into a transfer pops
  the whole body: blend out over the last 10 to 15 percent and hold a beat.
- **A cannon with a brass end cap is a baton.** Hollow collars, a recessed dark
  bore, a back disc and a lip ring; the hole must survive the 1:1 crop.
- **Fixed deck props parented to a yaw group sweep with the gun.** A powder keg,
  shot pile, rammer or crew member under the turret turns with every aim. Put
  them on a static wall locker outside the barrel arc, not just on the root at
  deck height; test world positions and bounding-box overlap at both yaw extremes.

