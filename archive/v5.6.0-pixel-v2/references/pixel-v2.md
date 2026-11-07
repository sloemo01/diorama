# Pixel Art V2 implementation checklist

This is an independent visual specification, not an adapter for an external engine or repository. Implement it in the project with the chosen rendering stack.

## Presentation

- Small, readable miniature on white with an orthographic three-quarter hero view.
- Free orbit, deterministic reset and enough margin for cast shadows and action extremes.
- A low-resolution logical render target enlarged once with nearest-neighbour filtering; avoid fractional device-pixel blocks where possible.
- Choose logical dimensions based on essential detail and viewport, not supersampling. Document actual native and displayed dimensions.

## Required ground-perimeter breakup

Use `templates/pixel-v2-ground-edge.js` for a terrain-only, binary pixel coverage fade. It is not object ink outlining. Place a thin ground apron beyond the occupied area; its outer boundary becomes irregular and sparse before reaching white. A rectangular substrate visible underneath will defeat the effect, so do not leave a big straight slab under the apron. Retain requested structural platforms as separate objects.

```js
import { applyGroundEdge } from './core/pixel-v2-ground-edge.js';
// ground uses local X/Z coordinates; halfSize matches its actual geometry.
const edge = applyGroundEdge(ground, {
  halfSize: [12, 8], band: 0.16, irregularity: 0.055, seed: 3,
});
// Keep all contact/support paths inside the fully covered region.
// edge.dispose() restores the material and releases owned resources.
```

Copy the helper into the project and apply it to the actual production ground mesh, not a hidden demo. It clones the visible material and supplies matching coverage hooks for directional/spot and point shadow materials. It supports a plain, non-instanced mesh with one built-in Three.js material and standard shader chunks; custom shader/deformation/multiple-material paths need explicit adaptation. Visual and shadow pixel patterns use different coordinates; the coarse footprint is shared, but exact shadow-pixel parity is not claimed. Transparent receivers or separate ground-ID/depth passes must use the same coverage function. Do not run this after compositing the whole scene: that would erase actors and walls near the screen perimeter.

Acceptance: native-resolution edge crop plus hero/side/back images, visible irregular scatter on every unoccluded boundary, solid interior, no underlying hard rectangle, no support loss, stable deterministic noise, no missing custom-depth coverage. Code/template tests alone are not a rendered style pass.

## Shading

- Compact discrete tone bands, warm light, cooler violet shadows.
- Clear object-owned ink edges from depth/geometry discontinuities. Avoid paper halos and false contours on continuous slopes.
- Subtle ordered dither on scenery and broad surfaces, with close tone spacing; no noisy global filter.
- Clean undithered characters and action-critical objects. Use semantic material/object roles or an equivalent reliable separation.
- Grounded hard directional shadows; retain depth correctness under orbit.

## Implementation kit

Use `templates/pixel-v2.css` for the optional narrative shell and `templates/pixel-v2-utils.mjs` for logical-buffer sizing, ordered thresholds and role-aware shade-band selection. These are independently written helpers, not a complete renderer. Start around 360×280 logical pixels for a small scene and tune against the required detail. Use compact five-band warm/cool ramps; a four-by-four ordered threshold is a good starting point. Keep character patterns several logical pixels wide. Optional plant motion can step around eight times a second while camera and physical motion remain continuous.

Example page structure (wire buttons to the actual scene clock/camera):

```html
<body class="pixel-v2">
  <main class="v2-stage">
    <canvas tabindex="0" aria-label="Diorama. Drag to orbit."></canvas>
  </main>
  <nav class="v2-controls" aria-label="Scene controls">
    <button type="button" id="pause" aria-pressed="false">pause</button>
    <button type="button" id="reset">reset view</button>
  </nav>
</body>
```

For Three.js, keep the scene/depth render target at logical dimensions. Do not let `setPixelRatio` silently enlarge it. Enlarge the completed image once, using the layout helper's CSS dimensions. Mark cast and ground roles explicitly for the renderer's material/mask path. Reconstruct view depth consistently with the actual camera; compare depth discontinuities with surface slope so a continuous ramp does not become an ink line. Never colour neighbouring white background pixels to simulate a silhouette. Ground shadows on real receiving geometry and reproject them under orbit. Keep these renderer responsibilities separate from page CSS.

## Scene shell and verification

Author the page independently. Narrative scenes use clean white space and discreet functional controls; educational scenes keep their separate UI contract. No branded theme, source-derived stylesheet, reference game UI or external engine is needed.

Test native/enlarged crops of characters, terrain and object edges; desktop/mobile scaling; hero/side/back views; keyboard orbit, pause/reset and reduced-motion. Record failures honestly. The classic post.js template is not an implementation of this preset. A CSS pixelation declaration alone is insufficient.
