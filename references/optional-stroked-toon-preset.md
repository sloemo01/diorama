# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Optional Stroked-Toon Preset

### 1. Chosen through the gate; preserve the default

Use **stroked toon / illustrated miniature** (`stroked-toon`) only as resolved by
`Render Preset Gate`; retain its recorded answer during repairs. The gate owns
consent/default/recording rules—do not ask a second style question here. This
preset changes presentation, not the subject or choreography; never import
coffee props or workshop colours into an unrelated scene. Record paper/frame
and camera choices alongside the preset in `DESIGN.md`.

**Precedence when approved:** the recipe below replaces the pixel-only camera,
white/no-plinth, palette-snap, edge-shader, Bayer, empty-paper and buffer rules
where they conflict. Do not combine both post pipelines by default. A thin
bevelled slab edge and a restrained optional figure frame/title/hint/readout are
allowed. Locked animation framing, deterministic time, clipping/containment,
contacts, silhouette readability, detail and animation QA still apply. Orbit is mandatory for all presets; it needs no separate approval. Character
proportions remain subject-appropriate; don't force toy people into every scene.

### 2. Render solid illustrated parts, not a pixel filter

Copy `templates/stroked-toon.js` into the project. It exports an opt-in Three.js
helper; it has no dependency on Anatomy CSS, SVG, fonts or the coffee rig.

- **Native crisp rendering:** antialias on; device pixel ratio capped at 2;
  sRGB output, `NoToneMapping`. Disable PixelPost, palette quantisation, dither,
  Sobel ink and CSS `image-rendering: pixelated`. Keep a small authored colour
  family, not a requirement that every final shaded pixel equal a palette entry.
- **Four-step surface shading:** `MeshToonMaterial` with a 4×1 RedFormat ramp,
  bytes `[68, 122, 184, 246]`, nearest filters, no mipmaps. These are starting
  values, not physical light calibration. Give materials distinct local colours:
  warm/cool off-white, desaturated object hues, dark structure, metal or timber,
  one restrained accent. Adapt to the setting; warm cream is optional.
- **Selective fine contours:** Three.js `OutlineEffect`, warm charcoal rather
  than pure black. Start thickness 0.0024–0.0038 (effect units, not world units
  or pixels). At the final viewport, aim for a roughly 1–2 CSS-pixel hero contour
  with finer subordinate edges; tune by screenshots at desktop and phone sizes.
  Broad silhouettes can be heavier, tiny fasteners lighter. Do not add wireframe
  or stroke every triangulation. Flat decals, liquid films, transparent glass,
  steam, contact patches and inward cavity surfaces normally have no outline.
- **Light for volume:** one warm upper-side key with shadows, a broad hemisphere
  and weaker cool fill. The helper starts key 2.55, hemi 1.55, fill 0.72; measure
  and tune for the scene, especially night/water. Tight shadow bounds, 2048 map,
  PCFSoft shadows, low bias, no acne. Combine cast shadows with small radial-alpha
  contact patches only where needed; no overlapping dark discs or false rings.
- **Model the edge:** modest bevels on casing, slab, rails and props; profile
  lathes for vessels; cylinders with enough segments to read round. Avoid a
  melted soft-plastic scene or polygonal mugs. Separate outer silhouette from
  cavity shading: real wall thickness and a bottom, one-sided inward surface,
  no expanded backface stroke through the interior. Glass must reveal contents;
  liquid stays inside the wall through the whole fill range. Paper/grain and
  lighting gradients are allowed; they must not obscure part boundaries.
- **Compose and inspect:** a long-lens three-quarter view (start fov 26,
  azimuth 38°, elevation 27.5°), fit to full animated bounds, room for the tallest
  object and controls. These are a starting point, not a mandatory angle for all
  subjects. Free user orbit is mandatory in every preset: use OrbitControls,
  bounded zoom/polar angles, reset view and no pan; detail all exposed sides. No auto-spin.
  Keep UI outside the subject, subtle, readable and keyboard-accessible. A title,
  hint and actual live state are optional figure furniture, not part of the 3D
  material system and not an excuse to import unrelated Anatomy CSS.

Minimal integration after user confirmation:

```js
import * as THREE from 'three';
import { createStrokedToon } from './core/stroked-toon.js';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const look = createStrokedToon(renderer);
renderer.setSize(width, height, false);
const shell = look.toon(0xc4cbb4);
const inner = look.toon(0xb8bfaa, { outline: false });
// Add subject-specific lighting and objects; do not also call PixelPost.render.
look.render(scene, camera);
// On resize: renderer.setSize(width, height, false); update camera projection.
```

### 3. Match the craft and detail, not just the shader

Use the Detail Bar's silhouette → construction → story passes, plus this close-up
acceptance bar. Detail is structural, not a quota of randomly scattered meshes.
Visual calibration references are `media/stroked-toon-reference.jpg` (overall
framing/material hierarchy) and `media/stroked-toon-service-reference.jpg`
(assembly detail). Read them when reproducing this look, but translate their
craft to the requested subject rather than copying their props or palette.
The coffee-rig repair is the evidence: a floating lever needed a pedestal;
interior parts needed supports and connected runs; a ring under the scale read
as a detached base; outlined cavities and oversized liquid surfaces looked broken.

| Pass | Requirement (life/story rows are narrative-only) | Translate to the subject |
| --- | --- | --- |
| Structure | Primary mass, supporting assembly, secondary panels/members | trunk/roots/branches; hull/ribs/deck; torso/joints/gear; wall/roof/trim |
| Attachments | Every small part has a visible or explainable seat, joint or support | leaf stem, rope knot, hinge pin, bracket, cuff, axle, strap, fastener |
| Functional detail | Inputs, outputs and working parts connect; contents fit containers | rooted irrigation, connected hoses, docked lines, harness to buckle, wheels to hubs |
| Surface hierarchy | Large readable forms, medium assemblies, sparse microdetails | seams, fittings, latches, bark scars, stitches, labels, scales; not uniform noise |
| Nearby life | 3–6 supporting props in purposeful clusters when space/brief permits | campsite kit; cargo/lifebuoys; books/blanket; tools/materials; tracks/nests |
| Story | At least one specific used/changed detail per hero | wear at contact, repair, folded cloth, spilled contents, missing tile, footprint |

Start with 8–15 meaningful pieces for a small supporting prop and 30–60 for a
hero; a complex cutaway may need 100–250+ small pieces across its subsystems.
These are planning ranges, not mesh-count acceptance tests. Reuse geometry and
materials, merge static siblings only after visibility/animation ownership is
settled, measure draw calls/fps and reduce invisible detail before construction.
Preserve clear working paths and negative space. "Feels empty" calls for a few
related clusters at varied heights, not filling every inch of deck.

**Proof before delivery:** one whole-scene desktop and phone frame; a 1:1 hero
crop; a cavity/contact crop if relevant; an action strip at known times. Always inspect front, service/back and high angles. Check outline
width and tiny-part legibility; no floating supports, disconnected endpoints,
false residue hoops, filled-in hollows, liquid clipping, or outlines on vapour.
Scan finite vertices, contacts/clearances and moving bounds; check the actual
readout against the frozen time. Keep `freeze(t)` and reduced-motion support.
Do not call a symbolic cutaway a verified engineering design. Use the existing
QA harness for shared checks, but disable or replace its pixel-palette/dither,
empty-white-paper and fixed-angle assertions for this preset explicitly; do not
silence unrelated failures. Record the preset and which checks apply.

