# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Effects

- **Water**: `MeshPhysicalMaterial` with vertex colours, not a custom shader, so
  it receives shadows. Ramp shallow to deep teal, never to navy: a near-black end
  quantises into a hard band the user reads as a hole.
- **Wake**: unlit additive foam streak plus 8 to 12 expanding ripple rings spawned
  behind a moving body every 0.4 s, fading as `(1-k)^2`.
- **Splash**: 60ish unlit additive droplets with gravity plus four rings and a
  foam disc; normal-blended white over teal reads as a grey blob. Seed the burst
  (`trigger(x, z, power, burstSeed)`), never `Math.random`: a frozen frame must
  reproduce the same burst, and the same frame must reproduce it again after the
  clock jumps.
- **Effects that integrate dt need a `reset()`.** Wake and splash advance by
  `dt`, so jumping the clock to freeze a frame does not jump their state, and the
  frozen splash shows whatever the last played frame left behind. Both templates
  expose `reset()`; the harness calls it and re-simulates in fixed steps from
  zero, which took a two-frame diff from 334 differing pixels to 18.
- **Smoke**: camera-derived billboards. The camera can orbit, so update from its current
  quaternion once and every puff is a plane facing the lens.
- **Debris with history**: loose notes or paper use a solved arc, a drag term, a
  spin about a random-but-deterministic axis, then slerp to flat and lie there for
  the rest of the loop. Deterministic hashing (`sin(n*127.1)*43758.5` fractional)
  keeps every replay identical.

### FX And The Edge

The slab is a window, but not every effect is a solid. Split them:

- **Cut FX** — debris, props, vehicles, bodies. Let the world clip plane cut
  them; model the interior so the cut reads as a cutaway, and route them so they
  enter and leave rather than parking across the edge.
- **Read-through FX** — light beams, glow, wake, spray, horizon haze. Do **not**
  let a hard clip plane slice them. End the effect at its target, fade intensity
  to zero before the slab boundary, or mask it with a soft edge. A lighthouse
  beam that stops in a straight vertical cut reads as a broken cone.
- **Additive over white.** Additive white on a white page is invisible. Give a
  beam a saturated core from the palette plus a darker under-edge or halo, and
  test it at 1:1 against the page, not against a dark viewport. If the beam must
  cross the whole frame, let it dim toward the edge; a bright hard-ended beam is
  worse than a soft falloff.
- **Clipped water.** A hull cut at the slab edge needs its interior and a foam
  plane at the cut, or it reads as a hollow shell. A moored boat should sit fully
  inside the frame for the beat where it unloads.

### FX Under The Snap

Every scene effect goes through the palette snap. That is the look, but it
punishes sub-pixel tricks:

- Author FX at **2 px or wider** at the target buffer. A 1 px additive wisp
  disappears or becomes a single palette dot; enlarge it or delete it.
- Use a **palette-legal saturated colour** and a dark contour, not pure white.
  White clips to the page and the snap has nothing to quantise.
- Do not rely on a smooth gradient to carry an effect. Build it from 2 to 4
  palette steps, a scrolling band, or a shape with a hard edge.
- Test with `?dither=0` and at 1:1. If the effect only reads in a downscaled
  preview, it is not in the render.

### Contact Contexts

"Touching the ground" is not one rule:

- **Ground prop:** contact shadow plane 0.018 above the slab; lowest vertex on
  the deck, not floating.
- **Deck / gallery / table:** the shadow belongs on that surface at its Y, not on
  the slab below. Parent the figure and shadow to the deck, or project onto the
  deck plane; a gallery figure with a slab shadow reads as a ghost.
- **Water:** the hull sits below the waterline; use a foam ring at the waterline
  and a wake, not a contact shadow. A floating boat with a hard shadow on the
  water reads as a toy on a table.
- **Vertical / wall:** a ladder, hook or rope needs a contact mark at the rung,
  grille or rail it bites, plus a small recoil; a hook in mid-air is a prop.

