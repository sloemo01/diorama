# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Render Preset Gate (ask once, every project)

Before the first mesh — and before any palette, material, lighting or post work — ask
which look the build should use. Ask once per project, not per material, per repair
or per scene profile. This applies to every profile, including `educational`.
An existing-project repair retains its recorded preset; read its design/code first,
record that provenance and do not re-ask unless a new look is requested.

> **Which look should I build this in?**
>
> 1. **Pixel art** (default) — palette-snapped pixels, ordered dither, ink contour,
>    flat cut-out on white paper.
> 2. **Stroked toon / illustrated miniature** — smooth bevelled parts, four-step
>    shading, fine charcoal outlines, clean paper backdrop.
> 3. **Pixel + stroke hybrid** — the same toon shading and outlines rendered into a
>    low-resolution target and nearest-neighbour upscaled once.

Use the harness's structured-choice surface when there is one, with pixel listed
first, marked as the recommendation and carrying one sentence of consequence per
option. Otherwise ask in plain prose, in the user's language, in one short message.

- **An explicit style in the request is already an answer.** "Make it pixel art",
  "in the stroked-toon look" — record it and skip the question. Do not re-ask.
- **Naming a look elsewhere is not an answer.** The word "toon", "cartoon",
  "illustrated", a reference image, a previous project's style, or this skill's own
  examples do not confirm this build's preset. Ask anyway.
- **No answer means pixel.** Silence, "you pick", or "whatever looks best" resolves
  to `pixel` and is recorded as a delegated default. Do not switch later without a
  new answer, and do not re-offer the alternative at every step.
- **Waiting does not idle the build.** The grey blockout, the research lookups, asset
  sourcing and the five-beat staging check are identical in all three presets. Ask
  first, then start those while the answer is pending; hold the presentation pass —
  palette for `pixel`, authored colour family and toon lighting for the other two —
  until it lands.
- **Record it** in `DESIGN.md` under `Render Preset and Style Confirmation`: preset
  id, the user's words, and which pixel-only rules the choice replaces.
  `renderPreset` is per project, never a global preference.
- **Orbit is not part of this question.** All three presets orbit freely with a
  deterministic hero pose for QA/reset. Never ask a second style question, and never
  trade orbit for a look.
- **Editing this skill is not a project.** Do not ask the preset question to
  change these files; ask only when a diorama is actually being commissioned.

Once answered, the matching preset section below is authoritative for camera,
lighting, materials, post and QA. Construction, contact, clipping, animation layers,
the detail bar and deterministic time are shared by all three.

### Fast path by scene

| If the commission is... | Read next, in this order |
| --- | --- |
| educational, mechanism, how-it-works, technical cutaway | Educational Mechanism Profile → Universal Inspection Controls → chosen render preset → Machine Grammar → Verification (profile-aware) |
| market, food truck, bakery, cafe, shop, laundromat | Cast → Clothed Cast: Heads, Layers, Hands → Service And Queue → Machine Grammar → Carrying, Loading And Mounting → Verification |
| heist, defence, combat | Detail Bar → Tool/Tower recipes → System And Combat Animation → Combat Readability → Verification |
| creature battle, game scene, anime/movie fight | Research Before You Model → Field Notes: Two-Creature Combat → Creature Anatomy → System And Combat Animation → Combat Readability → Verification |
| aquarium, pool, harbour | Cast → base rig → Water templates → Vehicles (boat) → Effects → Verification |
| station, airport, hotel, transit | Service And Queue → Vehicles → Crowd Variation → Verification |
| stage, festival, parade | Cast → Secondary Motion → Crowd Variation → System Grammar → Verification |
| farm, garden, nature | Creature Anatomy → Ambient Loops → Effects → Verification |

The narrative shape is place + repeated ritual + interruption + consequence.
Educational scenes instead use mechanism + causal sequence + observable result;
do not add a fictional interruption or cast. The fast path selects the relevant
reference notes, not extra narrative requirements.

