# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Numbers That Make It Read

| Knob | Value | Why |
| --- | --- | --- |
| Camera | fov 20.5, az 45, elev 33 | long lens, near-ortho miniature |
| Framing | `fillX 0.84–0.94`, `fillY 0.86–0.94` | fit margin only: slab plus landmark tops |
| Subject scale | `1.0`, or `0.70` for 30% smaller | post-fit camera multiplier; never geometry |
| Camera distance | solved, 5 to 300 | bisection; actual distance = fit / subjectScale |
| Post buffer | 1× CSS; 1.2–1.5× for a small subject; 2× faces | extra detail without resizing the diorama |
| Palette | 64 entries (any N, but the shader array and loop must match) | skin, stone, asphalt, glass, livery, props |
| Dither | `d*(0.0012 + 0.019*gate) + sparkle*0.0012` | stipple in ramps only; gate = edge |
| Ink | `smoothstep(0.13,0.34,edge)`, mix 0.62 | outline without scribble |
| Palette tie-break | `secondD-bestD < 0.0005` → lighter | flat surfaces come out flat |
| Sun | `0xfff8ee` at 3.3, hemi 0.24, fill 0.46, env 0.18 | hard shadows, cool fill |
| Shadow cam | ±13, near 4, far 70, 2048 map, bias -0.00022 | tight around the whole slab, no acne |
| Figure | 1.69 m, hip 0.86, head 0.584 | toy proportions that read |
| Car | L 4.4, W 1.86, belt 0.90, roof 1.44 | door 1.30, leaf sits between 0.34 and 0.90 |
| Scooter | wheel r 0.26, board 0.30, seat 0.83, bars 1.06 | boots and hands land on built surfaces |
| Loop | 41 to 47 s | one robbery beat plus police, and a quiet seam |

The table mixes two different kinds of number, and treating them alike is how a
new subject comes out wrong.

**Pixel-preset invariants.** The camera/palette/post values here belong to the
pixel look, not approved stroked-toon builds. They hold on every pixel subject: azimuth 45,
elevation 33, fov 20.5; one deterministic reset hero pose for QA plus user orbit; palette discipline
(every material samples a palette entry, the shader array length equals the
palette length); gated dither, ink at 0.13/0.34 mixed 0.62, the palette tie-break;
the rig's proportions and joint signs; 2048 shadow map with a frustum tight to
the slab; everything a pure function of `t`.

**Calibrated.** Measured against one subject and only evidence for it: palette
count (64 for the bank job, 66 here), buffer size and renderScale (1×/1.25×/2×),
`fillX`/`fillY`, `subjectScale` and the camera `size` divisor, slab dimensions
and deck height,
loop length, sun and hemisphere intensities, and every prop dimension in the
vehicle and scooter rows. Re-derive these per build: start from the value, then
look at a screenshot and change it.

A scene may change any calibrated number if the subject needs it; change the
template and `DESIGN.md` in the same edit and record the reason. A template that
silently uses a 2x different sun is worse than no template, because the next
reader trusts it.

