# Educational UI

## Canonical educational UI and inspection contract

This is the single authority for educational UI, selection and lesson behavior.
The exact V8 tokens/hierarchy below remain the 3.16 visual contract.

**Use code, not an interpretation of “shadcn-style”.** For every new educational
scene, copy `templates/education-v8.css` and build the DOM hierarchy below.
This is the canonical visual contract extracted from the V8 explorer, independent
of the chosen 3D render preset. Default to its ONE right card / mobile bottom dock;
do not substitute the older bottom/center examples as new-build defaults.
An explicitly requested bottom/center dock may change placement only, retaining
these tokens, controls and hierarchy. Existing repairs preserve requested placement.
The older `education-dock.css` is a minimal helper, NOT the V8 visual reference;
do not use it as the visual starting point for new educational builds.

Evidence: the grandfather-clock drift used beige/brass UI, a separate top-left
title, translucent blurred panel and fixed top-to-bottom height. None follows
from a clock subject. Brass belongs on the clock, not on its application chrome.

### Exact visual values (copy the CSS; do not restyle per subject)

- Page `#f7f7f5`, opaque card `#fff`, ink `#18181b`, muted `#71717a`,
  border `#e4e4e7`, secondary `#f4f4f5`, focus/accent `#2563eb`.
- System sans, base 14px/1.5. Desktop heading 21px/1.35, weight 650,
  letter spacing -0.6px; mobile 19px. Supporting copy and buttons 12px.
- Desktop `.viewer`: grid `minmax(0,1fr) 360px`, right padding 24px,
  height 100dvh, vertically centered card. Stage is the first grid cell, NOT
  a fullscreen canvas underneath an overlay. Card is content-height, max
  `calc(100dvh - 48px)`, 22px padding, 18px gap, 14px radius, 1px border,
  shadow `0 1px 3px #18181b08, 0 8px 32px #18181b03`.
- Below/equal 880px: one column, rows `minmax(0,1fr) auto`; dock max-height
  48dvh, full width, top corners 14px, padding 16px 18px plus safe-area bottom.
  Measure the actual remaining stage for camera fit and renderer sizing.
- Two segmented tabs: secondary background, 4px inset, 9px outer radius;
  selected tab white with subtle shadow. Primary playback is dark ink/white,
  not subject-coloured. Controls 36px desktop / 40px mobile; maintain adequate
  touch targets (44px hit regions where needed without crowding the row).
- No beige/brown UI substitutions, serif/display fonts, uppercase eyebrow,
  translucent glass, backdrop blur, heavy shadow, detached title, always-open
  technical sections, extra dashboards or full-height panel. Do not grow a short
  card to fill its max-height. Subject geometry/materials remain subject-specific.

### DOM skeleton and state adapter

```html
<main class="viewer">
  <div class="stage-wrap">
    <canvas id="stage" tabindex="0" aria-label="Interactive mechanism; drag to orbit"></canvas>
    <p class="gesture">Drag to orbit · scroll to zoom · click a part</p>
  </div>
  <aside class="panel" aria-label="Mechanism controls and explanation">
    <div class="panel-top">
      <header class="panel-head">
        <div class="title-row"><h1>Subject name</h1><span class="badge">Interactive</span></div>
        <p class="lede">Short input → change → output summary.</p>
      </header>
      <div class="tabs" role="tablist" aria-label="Mode">
        <button id="tab-explore" role="tab" aria-selected="true" aria-controls="explore-panel">Explore</button>
        <button id="tab-learn" role="tab" aria-selected="false" aria-controls="learn-panel" tabindex="-1">How it works</button>
      </div>
      <div class="controls" role="group" aria-label="Playback">
        <button class="btn primary" id="play">Pause</button>
        <button class="btn icon" id="prev" aria-label="Previous step">‹</button>
        <button class="btn icon" id="next" aria-label="Next step">›</button>
        <button class="btn icon" id="home" aria-label="Reset view">↺</button>
        <button class="btn toggle" id="xray" aria-pressed="false">Inside</button>
      </div>
    </div>
    <section id="learn-panel" role="tabpanel" aria-labelledby="tab-learn" hidden>
      <p class="section-note">One short instruction.</p>
      <div class="lesson-steps" role="group" aria-label="Causal steps"><!-- subject steps --></div>
    </section>
    <div class="readout">
      <p class="phase-title" id="phaseTitle"></p>
      <p class="phase-meta" id="phaseMeta"></p>
      <p class="explain" id="explainText"></p>
    </div>
    <button class="link" id="clearPart" hidden>← Back to cycle</button>
    <section id="explore-panel" role="tabpanel" aria-labelledby="tab-explore">
      <label class="label" for="parts">Inspect a part</label>
      <select id="parts"><option value="">Choose a part…</option></select>
    </section>
    <details class="disclosure help"><summary>About this model</summary>
      <p class="section-note">Simplifications and keyboard help.</p>
    </details>
    <p class="sr-only" role="status" aria-live="polite" id="announcer"></p>
  </aside>
</main>
```

Adapt subject names, number of lesson steps, part IDs, explanatory text and
physical units only. Omit Inside for a mechanism with no enclosing shell; never
add a fake x-ray toggle. Optional scrubber/Back lives in this same surface, not a
second toolbar. Use line SVG icons matching the supplied CSS in production.
Implement tab click plus ArrowLeft/Right/Home/End roving tabindex, hidden panel
state, and semantic buttons/select/range. Bind controls to the actual evaluator:
`play/pause`, `freeze(step.phase)`, `orbit.reset`, reversible `inside`,
`selectPart(id)` and `clearSelection`. A lesson change freezes synchronously and
updates explanation from that state; it must not trigger automatic camera motion.
The skeleton/CSS is not a functioning controller; do not ship inert controls.

### Three regression gates

1. **Computed-style/structure:** at 1280×800 assert one card, one h1 INSIDE it,
   360px card column, opaque white card, exact neutral tokens, no backdrop filter,
   content-height card, closed About and Explore selected initially. At 390×844
   and 320×640 assert one bottom dock, no horizontal overflow and an uncovered
   nonzero stage. Inject beige tokens, detached title and full-height panel; each
   must fail the check. Record measured values, not just “V8-like”.
2. **Rendered evidence:** review desktop, phone and 200% zoom screenshots plus
   selected/restored states. Check actual background pixels against the authored
   paper (not merely body CSS), tiny-part readability, stage/card separation and
   front/back/high camera fits. For V8 matching use `#f7f7f5` consistently in CSS,
   renderer clear/scene and ground composition; user-requested white overrides all
   those together. A screenshot is not mechanical clearance proof.
3. **Interaction:** keyboard-only tabs/steps/picker/reset, paused orbit, drag vs
   selection, Inside lifecycle and shared-material restoration must pass existing
   per-scene gates. Store commands, values and proof paths in `qa/report.json`;
   missing browser/computed-style/visual checks remain UNVERIFIED.

