# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## The Look Contract

The ten rules below define the **default pixel preset**, not the optional
stroked-toon preset. Approved stroked-toon builds use the explicit overrides
above; the remaining scene/animation requirements still hold.

1. **Resettable hero angle + free orbit.** Start azimuth 45, elevation 33, fov
   20.5, target just under slab centre. User orbit is enabled in EVERY preset.
   No auto-spin or timeline camera drift. Reset to this pose before frozen QA.
2. **Flat cut-out.** A slab with no plinth, no soil sides, background null, page
   white. Everything below the deck plane hides in the overhang at 33 degrees.
3. **Palette snap.** Every pixel resolves to one entry of a fixed palette. No
   gradients survive; banding is the material.
4. **Ink contour.** A luminance-neighbour edge mixes toward warm near-black at
   about 0.62, suppressed on the outer rim so figures are not haloed.
5. **Dither only where tones move.** Ordered Bayer gated by local edge contrast.
   Flat decks stay flat; ramps stipple.
6. **Contact shadows, not just cast shadows.** A soft radial patch under every
   figure and prop is what anchors it to the ground at this scale.
7. **People read at 30 to 45 px.** Faces need eyes, brows, nose, mouth, ears.
   Bodies need joint fillers so a bend never opens a wedge.
8. **Clipped edge.** The slab is a window, not a stage: four world-space clip
   planes sit on its edges and anything driving in or out is cut at the
   boundary. Nothing ever floats on the white page outside the block.
9. **Everything is a pure function of `t`.** No integration that carries state
   between frames, no `Math.random`, no drift across the loop.
10. **Empty paper (narrative profile only; educational dock and universal orbit controls are exceptions).** The white page carries no DOM title, caption, HUD or
   instructions. Put copy on a modelled sign/screen or in the browser title; a
   label floating on the paper breaks the cut-out.

