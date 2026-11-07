# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Surface, Motion And Event FX

These are the failures that survive a good first render: a finished-looking set
with one raw seam, a clean loop with a vehicle that teleports out, or an effect
that is technically present but reads as a grey rectangle. Audit them as a
system, on every subject.

- **Finish the edge, not just the field.** A heightfield, bank, road, water or
  terrain piece that meets the slab must feather to the slab height over the last
  0.5–1.0 m. Never end a terrain in a lip, a vertical wall or a portal-shaped
  hole. Prove it with a 1:1 crop of each visible slab edge at two nearby times,
  not a wide shot where the seam is 2 px.
- **A mover has not exited until its bounds clear the slab.** Keep the whole
  group — body, lights, shadow, cargo — visible through the complete run-out.
  Hide only after the world-space box is wholly outside the slab plus a 0.2–0.5 m
  margin. No early `visible = false`, no parking at the gate, no portal. If the
  scene uses a clip plane, the mover may be cut by it, but the cut body must
  continue moving out; a cut that freezes is the same bug.
- **Never fade a solid hero with material opacity.** Per-material opacity on a
  multi-mesh vehicle or figure produces ghosting and sort artefacts: some parts
  turn transparent before others, and the result is a see-through prop, not a
  fade. Cut, clip, or hide only when the bounds have cleared. Transparent glass
  and FX are exempt; whole-object fades are not.
- **Effects are events, not weather.** Exhaust, steam, dust bursts and impact
  puffs belong to explicit windows: start, rev, launch, hit, landing, open. If
  the brief does not ask for idle smoke, do not emit while the source is parked.
  A continuous plume erases the timing of the event it was meant to sell.
  One-shot exhaust is roughly **0.7–1.2 s**, with a short fade tail under 1 s.
  Check the event frame and event + 1.5 s: present then absent.
- **Anchor an emitter at the physical nozzle.** For a vehicle, the source is the
  exhaust-tip object (`(±0.66, 3.74, -0.74) * scale` on the truck recipe), not
  the engine centre, cab roof or a point chosen by eye. Put the tip
  in `userData` during construction and use that same object for the smoke. A
  plume that starts above or behind the stack reads as a floating cloud. If a
  canopy hides the tip, offset the birth point downstream in the open direction,
  not the source anchor; the audit's `maxOffset` allows that.
- **A halo is a sprite, not a quad.** A flat, untextured, low-opacity additive
  `PlaneGeometry` is a light-grey rectangle at the palette snap, especially over
  a dark board or wall. Use `haloPlane`/`softDiscTexture` from `detail.js`, a real
  emissive lens, or no halo. This is the single most common "what is that
  rectangle?" report.
- **Event FX must not cover the thing you are pointing at.** A smoke cloud that
  grows over a sign, jumbotron, face or gate has become the subject. Cap size,
  cap life, and move the source to the open side of the prop; verify at the
  event frame, not only at 60% of the burst.
- **Every correction gets a regression check.** For these failures the checks
  are: edge crop pair, mover bounds log, whole-group fade scan, emitter
  active/quiet windows, source-to-puff distance, flat-glow scan, and margin
  scan. `templates/qa/audit.mjs` runs the mechanical ones; the 1:1 crops remain
  human evidence.

