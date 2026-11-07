# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Optional Pixel + Stroke Hybrid

`pixel-stroke` is a third style, not the pixel default, and it is selected through the single `Render Preset Gate` question — never inferred, never switched to later without a new answer. Record the answer and do not offer it again during the build. Rotation is mandatory regardless of the answer.

Copy `templates/pixel-stroke.js` plus `templates/stroked-toon.js`. Create WebGLRenderer with antialias false, alpha true. Use `createPixelStroke(renderer, {width:320,height:200})`, its `toon`/`flat` material factories and `render(scene,camera)`. Resize the low-resolution target explicitly with `look.setSize(bufferW,bufferH)` while sizing the renderer to the display aspect; keep target aspect aligned to viewport/camera. Toon lighting/materials plus selective geometry OutlineEffect render into that target, then ONE nearest-neighbour fullscreen upscale. Do not run PixelPost, Sobel ink, a second outline pass or CSS blur over it. Native-resolution DOM UI is outside the target and must remain crisp.

OutlineEffect thickness is a projected effect parameter, NOT a CSS-pixel width. Rasterisation happens at the low-resolution target: a one-target-pixel contour becomes approximately `displayWidth / targetWidth` CSS pixels after upscale (analogous vertically). A thinner subpixel outline can disappear or flicker; measure target and screen crops at desktop/phone, adjust target resolution and selective material stroke together. Disable outlines for inward cavity surfaces, liquids, films, transparent glass, vapour and contact patches; do not double edges. For native toon, measure the native-DPR render instead. Free orbit, construction, manifest and QA requirements are unchanged.

