# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Palette And The Post Pass

`templates/post.js` renders the scene to an offscreen target, then a full-screen
shader turns it into pixel art. Order matters; each stage assumes the last.

1. **Coverage gather.** ~12 taps in a small disc read alpha, so the silhouette can
   be softened and stippled without blurring the interior. The target is
   transparent outside the slab.
2. **Composite onto paper.** `mix(vec3(1.0), c, smoothstep(0.26, 0.72, cov))`.
3. **Gamma.** `c = pow(c, 1/2.2)`. The target is linear; skip this and the frame is
   dark and muddy, which reads as a lighting bug.
4. **Grade.** Saturation 1.07 and contrast 1.028 *before* quantising, or the snap
   flattens everything to mid tones.
5. **Ink.** Neighbour luma differences, `edge = max(abs(d))`, brought to display
   scale with `pow(edge, 0.4545)`, then
   `ink = smoothstep(0.13,0.34,edge) * smoothstep(0.20,0.55,cov) * (1 - smoothstep(0.86,0.985,cov))`
   mixed 0.62 toward `vec3(0.085,0.082,0.076)`.
6. **Dither, gated.** `d = bayer8(gl_FragCoord.xy) - 0.5`,
   `gate = smoothstep(0.004,0.055,edge)`,
   `c += (d*(0.0012 + 0.019*gate) + sparkle*0.0012) * uDither`. Keep `uDither` as a
   uniform: it is the fastest way to prove whether a speckle is the dither.
7. **Palette snap.** Nearest entry with channel weighting `(1.0, 1.12, 0.93)` so
   greens do not beat skin. Keep the runner-up and break near-ties toward the
   lighter entry, or a surface halfway between two entries flips entry per pixel
   on the dither noise and stipples a whole pavement.
8. **Rim dither.** Where coverage is 0.78 to 0.995, threshold against Bayer so the
   cut-out edge is stippled, not anti-aliased.

The palette length is a shader constant: `uniform vec3 uPalette[N]` in the
fragment source and the JS array must be the same length. A mismatch loses the
last colours or reads out of bounds, and the symptom is a colour that "does not
exist in the palette" appearing on screen.

### Tuning Table

| Symptom | Cause | Fix |
| --- | --- | --- |
| Water looks like TV static | dither ungated | add the edge gate |
| Frame dark and muddy | missing gamma | `pow(c, 1/2.2)` before grade |
| Everything mid-grey | no grade before snap | saturate 1.07, contrast 1.028 |
| Scribble outlines | ink threshold too low | 0.13 / 0.34 |
| Missing outline on figures | rim suppression too wide | narrow to 0.86 / 0.985 |
| White speckle on flat deck | material grain aliasing | cut grain, not resolution |
| Bands with hard edges | palette hole | add 4 to 6 intermediate entries |
| Speckle only where a tone sits between entries | palette tie | break near-ties toward lighter |
| Speckle at zero dither | sub-pixel geometry | widen detail to ~1.5 px or delete it |
| Beam goes flat or vanishes on paper | additive white over white | saturated palette core + dark halo; fade before the edge |
| Glow disappears after the snap | sub-pixel or pure-white FX | widen to 2 px+, use a palette entry, add a contour |
| Beam ends in a hard vertical cut | world clip plane on a read-through FX | taper intensity to zero before the slab edge |
| Flame reads as a grey smudge | normal-alpha smoke over a bright source | lighten/remove smoke in the flame corridor, draw flame last |

Isolate noise in this order and stop at the first that removes it: dither
uniform to 0 → widen or delete sub-pixel geometry → disable `shadowMap`. Judge on
a 1:1 crop; a downscaled preview softens all three into "texture".

### Resolution

Default: `setSize` renders one target pixel per CSS pixel, capped by `maxDim`
(1600), and CSS `image-rendering: pixelated` handles the upscale. The chunky
look comes from the palette snap and the ink, not from a low buffer.

When the diorama is deliberately small on the page (`subjectScale` under ~0.8),
raise the buffer **a little** instead of enlarging the subject:
`new PixelPost(renderer, 2000, 1.25)` renders 1.25 target pixels per CSS pixel;
at a 1312 × 760 CSS canvas that is a 1640 × 950 buffer, CSS still 1312 × 760.
The post pass quantises at the finer grid and the browser downsamples; the page
size, camera solve, slab and clip do not move. 1.2–1.5× is the useful range; 2×
on a full arena is usually a frame-rate tax, not more art. Log `post.size` and
`canvas.getBoundingClientRect()` and check a 1:1 crop for shimmer.

For faces and close-up contact beats, use `renderScale: 2` and
`image-rendering: auto` (not pixelated), with `maxDim` high enough (2400) to
avoid the cap. The post pass still quantises at 2×; the CSS downscale is a clean
box filter, not a change to the art. Keep the CSS size as the layout size so the
camera solve and the 1:1 QA crops stay comparable. Re-run the portraits after
any resolution change: raising the buffer exposes hats, stripes and noses that
hid at the old grid.

