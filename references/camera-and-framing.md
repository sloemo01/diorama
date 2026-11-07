# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Camera And Framing

```js
CAMERA = { fov: 20.5, azimuth: 45°, elevation: 33°, target: (0,-0.15,0),
           fillX: 0.84, fillY: 0.86,
           subjectScale: 1.0 } // 0.70 = 30% smaller, more paper
```

The distance is solved, not typed: build a direction vector from the angles,
project each fit point (slab corners at deck and underside, plus the tallest
building corners) into camera axes, and bisect the distance until every point's
`|x|/(depth*tan*aspect)` and `|y|/(depth*tan)` fit inside `fillX` and
`fillY`. 48 iterations is plenty. `fillX`/`fillY` are the **fit margin**, not the
page-size control; tune them together, because raising one alone crops the other
axis on a portrait phone.

**Subject scale is a second, post-fit move.** Solve the fit first, then pull the
camera back:

```js
const fit = solveDistance(aspect, points);
const scale = CAMERA.subjectScale ?? 1;
const distance = fit / Math.max(0.1, scale);
camera.userData.fitDistance = fit;
camera.userData.subjectScale = scale;
camera.userData.distance = distance;
```

`subjectScale: 0.70` renders the diorama at 70% width/height — 30% smaller
linearly and about 49% less screen area — so the paper margin grows. `1.0` is the
fitted size. Keep the slab, cast, world clip, shadow camera, CSS canvas and
frame at full size; raise the backing buffer only with `renderScale` (next
section), never by scaling geometry. Shrinking the geometry also shrinks contact
shadows and the clip volume; shrinking the frame/canvas changes the 1:1 crop
and does not change the model's scale. **Move the camera.**

A phone is already height-limited, so 0.70 can make the trucks unreadable. Try
0.70, then 0.80–0.90 if needed; the scale is per scene, not a universal 30%.

**Verification.** Log both distances and assert
`actualDistance ≈ fitDistance / subjectScale` within 2%. Also project the slab
and compare its width to the fitted width: the ratio must be the scale, not just
the distance. On Dust Kings at 1.73 aspect: fit 67.93, scale 0.70, actual 97.05;
projected slab width 872 → 611 px (0.70), with slab, clip and shadows unchanged.

`updateCamera(camera, aspect)` on every resize and orientation change, with a
debounced call after `orientationchange`. A canvas measured at under 2 px is a
layout race: return early rather than dividing by zero.

