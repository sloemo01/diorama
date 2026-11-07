# Optional stroked-toon verification

This directory tests the optional renderer helper, not scene content or approval
in a live conversation. Read the confirmation gate in SKILL.md before applying
this look. Never change an existing project just to run these tests.

## Automated checks

With `three` r170 resolvable from this checkout:

```sh
node --test verify/stroked-toon/check.mjs verify/stroked-toon/inspection.mjs
```

If the kit itself has no node_modules, bundle check.mjs with a build project's
esbuild and set esbuild's `nodePaths` to that project's node_modules. Run the
resulting ESM bundle using `node --test`. Do not silently install packages or
rewrite an unrelated scene's materials to make verification work.

The four tests check:

1. Four-byte RedFormat ramp, nearest sampling, invalid input rejection.
2. Per-material contour opt-out and thickness.
3. sRGB / NoToneMapping / PCFSoft settings, DPR cap, material cleanup.
4. Separate contour pass, skipped cavity outlines, restored material/scene state.

`inspection.mjs` adds two tests: explicit hybrid target size + nearest filtering,
exactly two scene passes (solid + outline) followed by one upscale, render-target
restoration even on failure; and orbit click/drag/multitouch/cancel discrimination,
keyboard movement, no auto-spin and deterministic hero reset.

3.12.0 validation: all SIX tests still pass by bundling both files using the existing
four-stroke-engine project's Three.js/esbuild node_modules via esbuild `nodePaths`.
No engine project files were changed. Browser/GPU and per-scene visual QA remain
UNVERIFIED by this CPU-only suite. Motion-graphics primitives are covered
separately by the engine project's `qa/flow-arrows.test.mjs` (eight tests: forward
axis, depth/outline honesty, per-stroke visibility and zero leakage, a 720-degree
vertex containment sweep against crown/bore/head/valve discs/stems/plug, an
adjacent-degree no-teleport bound, flame kernel and crown bounds, the
hide-instead-of-shrink rule, and the full-extent band fitter).

Validated against the coffee-rig project's Three.js r170 / esbuild dependencies.
These CPU-only tests use a fake renderer: they DO NOT establish actual WebGL
shader compilation, performance, line appearance or visual quality. Every scene
still needs actual browser screenshots and motion checks.

## Cross-subject dry-run

Use a subject unrelated to machinery, such as a forest river rescue:

- Pending style answer: ask the documented question; do not apply toon yet.
  No answer or decline means preserve current/pixel presentation.
- Approved: authored forest greens, blue-green water and a small rescue accent;
  fine contours on bank/roots/boat/people, no outline on water films or spray;
  meaningful roots, tied rope, seated oarlocks and cargo, not coffee accessories.
- Enable free user orbit by default with deterministic reset, never auto-spin. Require the
  existing action/contact/consequence bar; the style does not replace the story.
- Proof: desktop/phone frame, rope/hand/boat contact crop, riverbank hollow crop
  if present, action strip. Pixel/dither assertions are explicitly replaced,
  unrelated scene failures remain failures.

## Visual reference

The included coffee-rig captures calibrate contour hierarchy, bevels and detail,
not mandatory setting, hue or scene mechanics:

- ../../media/stroked-toon-reference.jpg
- ../../media/stroked-toon-service-reference.jpg

The agent must review new subject renders rather than claiming the existing
coffee-rig captures prove the helper renders every possible scene correctly.
