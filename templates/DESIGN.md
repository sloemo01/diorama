# <TITLE> — design sheet

> Fill this before modelling. Keep it in sync with `README.md` and the code.
> Narrative scenes need scene-first staging, no educational UI by default. Educational scenes need a causal explanation, not cast/ritual quotas.
> Profile, representation, render preset and UI mode are independent; do not turn an amusement park into a lesson dashboard.
> Delete educational-only fields below for narrative builds unless that exact feature was requested.
> Delete rows that do not apply, but replace them with the equivalent
> (a machine's goal, a field's area, an ambient loop's period).

## Profile and hard acceptance

- `sceneProfile`: narrative (default) OR educational; user intent/evidence:
- `uiMode`: none / minimal-controls / requested-inspection / educational; explicit request or profile reason:
- `representationMode`: real-subject / teaching-model / explanatory; explicit/default/clarified/delegated + reason:
- `assetStrategy`: `hybrid` (recommended) / `internet-full` / `authored-only`; explicit answer or delegated choice (unanswered waits):
- Sourcing gate asked AFTER style; exact user answer; commercial-use/modification/scene-embedding notice shown:
- Major-role plan: imported vs authored; internet-full gaps need approval before switching to authored; authored-only skips model acquisition, not subject research:
- Major-role sourcing ledger: role | actual searches | chosen/downloaded source + local file/hash | commercial/modification/scene redistribution evidence | import/style/motion/final-scene inclusion proof | fallback reason:
- Asset sources/licences: commercial + adaptation + scene redistribution rights; credits/change notices, actual hashes, transitive dependencies and offline packaging:
### Occupied space and actions (all profiles)

- Independently required physical proxy IDs; actual posed mesh/rig coverage and unsupported cases:
- Static parcels + doors/awnings/paths; full actor/tail/wing/carry envelopes; clearances in project units:
- Seats: local support/backrest/footwell frames, rig dimensions, approach/sit/stand/exit states and exclusive time reservations:
- Dynamic routes: swept width, queue headway, crossing/yield schedule, moving-parent ownership and no doubled root motion:
- Exact intended contact pairs + phase windows + max depth; separate support-gap checks; nonadjacent self-part coverage:
- Actual evaluator, unique increasing sample times/events, motion-based refinement + loop seam; sampled/continuous limits:
- Same-predicate limb/tail/knee/crossing/building fault and restoration results; worst-contact crops/action strip:

### Educational / explicitly requested inspection fields only

Narrative: omit this entire optional block unless the corresponding feature was explicitly requested; do not invent UI, labels or lessons to fill it. Shared geometry, camera and construction checks still apply.

- Educational: one mechanism causal sequence and short input → change → output explanation:
- Educational UI (only when enabled; explicit UI-free briefs omit): canonical V8 `templates/education-v8.css` + skill DOM contract; ONE reserved 360px right card / bottom dock at <=880px (explicit placement request may override); neutral tokens independent of subject/render preset:
- Manifest artifact: essential part IDs, parent/support/joint, function/connections, mesh mapping, selection anchor, source, tolerance, proof frame:
- Declared omissions/symbolic simplifications (unexplained essential omissions fail):
- Actual drive ratios / phase / units / kinematic equations / contact and clearance invariants:
- Numeric test command, dense samples + boundaries, results and tolerances:
- Frozen repeatability / hero desktop + phone / back + high orbit / motion-strip proof:
- Live local-geometry label anchor → world projection and opaque occlusion checks / nearest visible ray hit / one label at a time:
- Hidden-part picker: stable assembly ID versus mesh-piece ID/mapping, keyboard access to each intended target, useful revealed view or explicit authored cutaway; no see-through click or disabled depth test:
- Selection: selected part soft glow + OTHER parts darken, per-mesh shared/multi-material isolation; restore exact material identities/array slots, visibility and cast/receive shadows, dispose owned clones; MeshBasicMaterial receives no added emissive properties:
- Inspection effect: highlight/dim/ghost settings, declared internal/shell IDs; see skill “Soft glow and holographic inspection — implementation recipe”:
- Hologram feature-edge threshold/scale filters and decal-edge exclusions, live rigid/deformed/instance transform strategy; authored blocker/reveal plan per hidden target, preserved depth/opaque occlusion, picker exclusion and owned resource cleanup:
- Glow/hologram proof: per-part desktop/phone before/selected/restored screenshots with measured contrast and occlusion verdicts (emissive > 0 alone never passes an invisible highlight); shared/multi-material exact restore, moving source agreement, Inside-state preservation and rapid reselection without edge/resource growth:
- Short selection-triggered camera+target focus / fit bounds and panel clearance / previous-view Back + hero Reset:
- Cancel focus tween on user orbit/pointer/keyboard / no clock-driven chase / reduced-motion immediate view:
- Acceptance captures: before, selected, restored; rapid reselection; hidden menu selection at multiple frozen phases; Back/Reset and interruption mid-transition:
- Keyboard focus, dock picker, drag vs click, multitouch cancel, reset proof:
- Profile/preset checks applied or replaced, reason; UNVERIFIED checks cannot pass:
- For educational mode delete inapplicable cast, service, multiple-system and ritual sheets below; do not fabricate roles to fill them.

## Premise

`[place]` + `[a repeated verb/ritual]` + `[who or what interrupts it]` + `[payoff]`.

One sentence:

- Archetype (router row):
- Assumption line (scale, loop, systems, cast):

## Render Preset and Style Confirmation

- Existing repair: original recorded preset/provenance (retain without re-asking), or explicitly requested style change:
- Gate asked at project start, before the first mesh (SKILL.md `Render Preset Gate`)?:
- Preset: `pixel` (Classic; recommended) | `stroked-toon` | `pixel-stroke`:
- User's answer for this build (quote it; never inferred from a reference or from the word "toon"):
- Explicit style in the request / explicit delegated default ("you pick") -> pixel for new commissions; explicit classic -> pixel; unanswered gate waits:
- If explicitly delegated: why pixel was kept; no later switch without a new answer. Record a pending question as pending, not answered:
- Colour family / accent (subject-specific, cream is not mandatory):
- Paper/background / grain; figure frame/title/readout UI only when explicitly requested (not a toon/hybrid default):
- Contour width at desktop and phone / no-outline materials and cavities:
- Camera: mandatory free user orbit + hero reset for EVERY preset, no auto-spin:
- Render path: Classic PixelPost OR native toon OutlineEffect OR low-res hybrid toon OutlineEffect + nearest upscale; never double edges:
- Decision receipt: look · sourcing mode · profile · UI mode; unresolved questions and approved exceptions:
- Shared QA / preset-specific checks / intentionally replaced pixel assertions:
- Hero construction, attachments, functional connections and related prop clusters:

## Educational UI fidelity (educational with UI only; narrative skips)

- Copied canonical CSS; exact neutral token/computed-style measurements and any user-authorized deviations:
- One in-card title, Explore default, About closed, no beige/glass/detached masthead/full-height panel:
- Stage measured separately from card/dock; desktop 1280×800, phone 390×844 and 320×640, 200% zoom proof:
- Style regression command/results; injected beige/title/full-height failures; missing checks UNVERIFIED:
- Keyboard tabs/steps/picker, synchronous freeze/text agreement and selected/restored captures:

## Camera Side

- Pixel reset hero angle: azimuth 45, elevation 33, fov 20.5; fillX/fillY 0.84–0.94
  (fit margin only). Approved toon starting point: azimuth 38, elevation 27.5,
  fov 26; record final fit/angle and mandatory orbit bounds and reset controls:
- Subject scale: 1.0; 0.70 = 30% smaller linearly, more paper (camera only;
  frame, slab, clip and shadows unchanged):
- Closed exterior cold-load/Reset; explicit Inside control and lesson-exit restoration (or commissioned permanent-section exception):
- Complete swept fit bounds / measured canvas-safe rectangle / protrusion test / desktop-phone-200% zoom proof:
- Page, renderer, scene and ground/post white-background consistency / empty-corner pixel proof:
- Exterior or interior cutaway:
- Street lane (in front +Z / behind -Z; passing vehicle timing):
- Night palette mix (moon/key / practical / pool):
- Pixel render buffer: 1× CSS default; 1.2–1.5× renderScale for a small subject;
  2× only for face close-ups; maxDim / CSS image-rendering. Approved toon:
  antialias + native DPR capped at 2, no pixelated CSS; measured fps:
- Slab size / deck height:
- +Z face / hero face (exterior); for an interior cutaway, camera-side wall
  omitted and street behind at -Z:
- Threshold / entrance (keep 2 m clear):
- Tall landmark (back, offset in screen x; top height):
- Foreground prop (near corner):
- Mid-ground prop (leads the eye):
- What must never be occluded:
- Grey blockout frame (time):

## Cast Sheet

Three to eight rows; the default is four to six including any disruption. Every
row needs an exit (or death) and a signature prop.

| Role | Silhouette feature | Locomotion | Action | Reaction | Exit / death | Signature prop |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Life / Service Sheet

Fill this for a market, hatch, ticket window, bakery, hotel desk or any social
scene. A combat play can delete it.

- Service point (counter / hatch / window):
- Queue slots (positions, spacing, heading):
- Staff positions (cook / cashier / runner):
- Arrival order and serve order:
- Machine slots (washer/dryer/table), cycle end and release beat:
- When the queue is full / empty:
- Late customer or disruption:

| Role | Entry | Slot | Order | Pay | Receive | Exit |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## System Sheet

- Loop length / DT:
- Three or four systems (defence / machine / service station / loop; name,
  origin, output, contact, events):
- Crew / staff (who operates, exit, machine behaviour when gone):
- Three or four visitor / enemy / animal roles:
- One goal or disruption, optional for a life scene (what place does it act on?
  contact point + response):
- Economy / score / progression (optional for a life scene):
- What changes between first and last beat:

### Shot / Event Count

| System | Shots / events | First at | Last at | Proof frame |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Beat Sheet

| Time | Beat | Camera proof |
| --- | --- | --- |
| 0.0 | establish |  |
|  | first system output |  |
|  | first consequence |  |
|  | machine / field / service output |  |
|  | disruption arrives |  |
|  | goal / service contact |  |
|  | finale / residue |  |
|  | relight / recovery |  |
|  | loop seam |  |

A social play may collapse this to five rows: establish, first ritual, disruption,
handoff, residue. A combat play uses all nine.

## Hero Objects

Name every object that gets the Detail Bar. Type is tower / machine / service
station / vehicle / creature / prop / landmark. "Parts" is the visible mesh count target.

| Name | Type | Parts | Construction layers | Story detail | Contact |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

## Whole-object completeness matrix (3.17)

Apply the skill's three Whole-object completeness gates to every hero, including
educational scenes. Keep this sheet even when deleting narrative-only sheets.

- Commissioned scope: complete named object (default) / detached mechanism / explicit permanent section; user wording and section boundaries:
- Whole-object front/side/rear references, proportions and explicit assumptions:
- Grey silhouette comparison + uncropped desktop/phone proof paths and reviewed result:
- Exterior/rear/side/high crops, attachment-seat close-ups and Inside/Reset restoration result (or not applicable with reason):

One row per expected assembly, not merely per mesh already built. Cover silhouette,
exterior/rear, attachments and functional internals; cross-reference the existing
component manifest rather than duplicate it. For a strapped quartz wristwatch,
consider case, dial/crystal, crown, caseback, lugs/spring bars, both strap halves,
reference-appropriate buckle/keeper or clasp, and the functional movement. Adapt
to the actual reference; these are not universal fittings or verified watch specs.

| Hero / stable assembly ID | Coverage category | Reference / assumption | Required / simplified / omitted + scope rationale | Live mesh/group mapping | Seat/joint/connection | Proof view/path | Actual check/result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

- Reference-to-inventory review (including assemblies absent from the built scene):
- Required rows reconciled with nonempty live geometry, connection checks and reviewed proof:
- Negative checks: hidden silhouette assembly, missing rear closure/disconnected attachment, removed required mesh, blank proof and unexplained omission; commands and observed failures:
- Explicit user-approved scope changes (an omission note alone cannot waive an essential assembly):
- `qa/report.json` command/results/proof paths; unresolved FAIL / UNVERIFIED items (either blocks completeness pass):
- Evidence limits: visual/presence checks do not certify mechanics; retain the existing clearance/motion gates:

## Contact / Choreography Sheet

Every carry, handoff, load, mount and seat needs a contact timestamp.

| Beat | Hands on | Prop / seat anchor | Start | Contact | Release | Proof |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Ambient Loops

| Loop | Period | Motion | Phase offset | What it touches |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Surface / Motion / FX Audit

- Slab edges finished (right / lower / all visible): heightfield or road
  feathers to slab over:
- Exit rule for every mover: visible until world bounds clear slab + margin:
- Event FX windows (start / rev / launch / hit / landing), source object, tail:
- Idle effects that are deliberately allowed (otherwise "none"):
- Large translucent planes and why each is not a flat halo:
- Whole-object fades: none / exempted with reason:
- `qa/audit.mjs` contract exposed (`slab`, `movers`, `emitters`):
- Edge crop pair, burst frame, burst + 1.5 s, margin scan:

## Detail Budget

| Element | Count | Parts each | Story detail |
| --- | --- | --- | --- |
| Towers / machines / service stations |  | 25–45 |  |
| Vehicles |  | 20–45 |  |
| Species / people |  | 12–20 (hero 40–60) |  |
| Props |  | 8–15 |  |
| Landmark |  | 30–60 |  |
| Deaths / exits |  | 5–8 pieces + residue, or exit-only with no debris |  |
| Ambient loops |  | 2+ |  |
| Triangles / draw calls |  |  |  |

## Palette / Authored Colour Family

Pixel only:
- Length (must equal `uPalette[N]` and the JS array):
- Base entries:
- Accent entries:
- Forbidden: pure black, gradients, unlisted colours.

Approved stroked-toon only (replace the pixel block above):
- Named material colours / local contrast / restrained accent:
- Four shade-ramp bytes / charcoal contour / stroke hierarchy:
- Lighting and background gradients may survive; no final-pixel palette snap:
- No-outline materials: cavities, glass, liquid films, decals, vapour:
- Major/medium/microdetail budget and actual draw-call/fps measurement:

## Animated Effects (arrows, flames, flow)

- Local forward axis and unit test (tip at +Z, base behind, transform dot >.999):
- Placement: genuinely open volume or a real cut window; never depthTest:false:
- Depth test/write kept on for effect materials; outline disabled for small FX:
- Minimum legible scale and exact hide threshold; fade-boundary tested:
- Measured free band per frame (moving crown/valve faces), positive-gap assert:
- No port-centreline spline; effect derived from the live free volume:
- Fit direction-dependent full extent (|dy|*half + flat*head), not the centre:
- Anchors: tail/tip 0.008 under the valve underside, <=92% of the band:
- Authored length = max length, so scale <= 1 and the legibility gate is real:
- One arrow per stroke; never two stacked rows at the same x/z:
- Effect fades with its source (flame kernel); no orphan arrow:
- One declared space for every Y constant (scene root lift subtracted):
- Ignition flash caps: halo opacity <=0.55, halo scale <=0.62, light <=2.2:
- Full tip/tail/width containment across the complete event, sample interval:
- Adjacent-degree delta bound on position and scale (no pop/teleport):
- 15-degree contact sheet per stroke read frame by frame, not four hero stills:
- Flame kernel: anchor, max height/radius, clearance to crown and head:
- One idea per primitive; fan separation >= one head-width if used:
- Phase window per group; mid-stroke counts and zero-leak outside phases:
- Hollow outlet: connected sleeve+lip, centre-ray open / annulus-ray hit:
- Real bore/slot at every crossed fixed wall; crossing-plane swept test:
- Screenshot strip: all strokes from two orbit angles (paths):

## Non-Penetration Gate (all profiles and presets)

- Intended contact/joint pairs, explicitly listed:
- Non-contact pairs and required positive clearances / units:
- Full-cycle sweep sample interval, contact-boundary samples and tolerance:
- Actual complete surface checks (tips, tails, bevels), not centres only:
- REAL bores/slots through every crossed fixed wall/flange; crossing-plane mesh test:
- Piston/rod/base flange, cam/follower, head/plug or subject-equivalent checks:
- Effect free-volume constraints relative to moving solids; depth testing on:
- Before/contact/after proof frames from two orbit angles:
- Exact test command, worst measured clearance and report path:
- Failed or unrun non-penetration check = NOT ACCEPTED:

## QA Frames

| Frame | Time | What it proves |
| --- | --- | --- |
| Grey blockout |  | staging before palette |
| Hero |  | staging + palette |
| First system |  | origin / travel / contact |
| Queue approach |  | slots, feet, serve order |
| Carry / load |  | palms on prop, over-rim, release |
| Mount / seat |  | boot, leg clearance, hands on grips |
| Night / glass |  | darks, practical, no tint, no occlusion |
| Quadruped |  | ears, pupils, hocks, tail |
| Exit (social) |  | turn, walk, prop, no debris |
| Machine / field / service |  | area, ramp, output |
| Surface edge |  | no lip, gap or portal; flush at 1:1 |
| Event FX start |  | burst at the source, not idle haze |
| Event FX tail |  | plume gone within the authored tail |
| Mover clear |  | whole bounds outside slab before hide |
| Exit / death |  | species or role grammar |
| Goal contact |  | contact + response |
| Follow-through |  | recoil / release |
| Beam / field off |  | no stale effect |
| Threshold |  | clear pocket |
| Relight / aftermath |  | residue and recovery |
| Standalone |  | `file://`, no errors |

## Risks

- What is most likely to read as a blob at 1:1?
- Which object has the weakest silhouette?
- Which beat has the least visible cause?
- Which FX crosses the slab edge, and does it fade or cut?
- Does any standing gesture overlap a walking root? (queue slide)
- Are the palms on the carried prop at the contact frame?
- Does a boot pass through the bars, seat or body during the mount?
- At night, are there three dark values and a visible practical?
- Does a passing vehicle cover the hero at the contact frame?


## Mating interfaces, swept coverage and lesson regression (3.14)

Use project units, explicit local frames and stable surface IDs; do not copy engine dimensions into another subject.

| Interface ID | Parts/surfaces | Source-frame IDs / shaft and bore axes / shared repeated-mount anchor IDs (derive all instances; no separately guessed offsets) | Full shaft/bore or slide geometry + tolerances | Inward bevel/fillet allowance | Radial gap / axial lane/end float + cap endplanes/separation to prevent z-fighting | Source / proof |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

| Functional connection | Source port / opening | Destination port / opening | Continuous route and actual bore proof | Support / bearing / bracket / fastener / base load path | Declared simplification |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

| Tested surface pair | Full mesh or conservative proxy / exclusions | Full driver range + spacing + extrema/transitions/refinement | Required clearance / worst gap and phase | Intended contact: exact surfaces, window, tolerance, reason | Method limitation / unresolved interval | Command/result/proof crops |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

- Pair coverage inventory and potential-pair omissions (why safe):
- Nonempty fixture/pair coverage and asserted expected sample counts; actual runtime geometry type (include RoundedBox-labelled geometry reporting Box as a counterexample); injected beam-through-bore, bevel overrun, wrong-axis fillet, lane overflow and non-whitelisted overlap failures:
- Analytic/continuous bounds versus sampled evidence, explicitly distinguished:
- Educational UI only (omit for narrative without this request): neutral sans single dock/right-panel layout, progressive disclosure and phone/zoom containment:

Educational lessons only: omit the following step table for ordinary narrative scenes.

| Causal step | Driver phase/time + units | Actual manifest part ID | Input → change → observable result | Frozen evaluator state/readout agreement | Proof |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

- Keyboard, focus visibility, touch targets, contrast, reduced motion, no focus trap and no canvas event leakage:
- QA manifest: final build hash matched to tested geometry/artifacts, exact commands + exit outcomes, expected/actual sample counts, nonempty fixtures, negative-injection failures and proof paths; only for implemented/requested features: UI desktop/phone + 200% zoom, step/scrub agreement, rapid changes, picker and selection/material results. Always test applicable pause/orbit/reset and scene camera fit:
- Unrun or failing checks (UNVERIFIED/FAIL, never implied pass):
