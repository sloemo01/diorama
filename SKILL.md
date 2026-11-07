---
name: diorama
description: "Full long-form guide for detailed rotatable Three.js dioramas. Narrative scenes are scene-first with no educational UI unless requested. Classic pixel, stroked-toon and pixel+stroke are rendering choices, not educational modes. Explanatory commissions use the separate educational contract. Includes composition, cast, animation, craft, sourcing and construction."
version: 5.7.0
author: Nehal Kanak (sloemo)
license: MIT
platforms: [linux, macos, windows]
---

# Diorama

## Current intake contract (5.7.0 — authoritative)

For a new commission, ask **look first, model sourcing second**, using the two gates below. These gates override older three-preset lists, automatic internet-first instructions and one-prompt assumptions elsewhere in this long guide and its references. Do not ask setup questions when merely editing the skill. Explicit answers in the brief skip the corresponding question; existing-project repairs retain recorded choices. An unanswered question is pending, not consent. Rendering and sourcing are independent of narrative/educational purpose.

Three looks are available: `pixel` (Classic Pixel Art; recommended), `stroked-toon`, `pixel-stroke`. Generic “pixel art”, “classic”, “old pixel style” and explicit delegation (“you choose”) resolve to `pixel`. All looks preserve free orbit. An unanswered style gate waits.

Three sourcing modes are available: `internet-full`, `hybrid` (recommended), `authored-only`. Generic “use internet models” resolves to `hybrid` unless the user requests downloaded models throughout. Older `internet-first` records map to `hybrid` on repairs. Sourcing requirements below apply only to modes that acquire external assets; authored-only skips model acquisition, not subject research, quality or geometry/contact checks.

## Profile boundary and retained additions (5.0 — read first)

This is the **restored full-length guide**, not the compact 4.x replacement. Keep its detailed composition, subject recipes, scene furniture, cast, animation, service/queue, vehicle, effects, framing and craft guidance. The following profile/sourcing updates override older wording only where explicitly stated.

### Scene purpose is independent of rendering

**Default `sceneProfile: narrative`.** A place, landscape, amusement park, town, fantasy scene or interactive scene is not an educational mechanism. Pixel, stroked-toon and pixel+stroke choose the renderer, NOT the profile. Asset choice, a working ride or click interactions do not make a scene educational. Choose `educational` when the user asks to explain/teach how something works, its anatomy or causal sequence. If intent is genuinely mixed, ask once; otherwise infer and record it without another forced setup question.

**Narrative has no educational UI by default.** Do not import or instantiate `education-v8.css`, `education-dock.mjs`, an Explore/How it works panel, lesson steps, part picker, explanatory dashboard, floating callout labels or scattered teaching text for an ordinary diorama. This exclusion applies in ALL three render presets. Leave the scene/page visually clean. Free orbit and discreet functional pause/reset/accessibility controls remain permitted; diegetic park signs and shop names are scene geometry, not a teaching overlay. Optional title/readout furniture mentioned later is opt-in, not a toon/hybrid default. No debug panel in delivery.

**Educational only:** canonical V8 right card/mobile dock, causal lessons, part inspection and connected explanatory callouts apply to explanatory commissions, not to all scenes. Explicit UI-free requests still override the panel default: explanation can be delivered through the requested scene behavior and accompanying prose. Narrative scenes with explicitly requested ride/part inspection get the requested scoped interaction, not an automatic lesson dashboard. Explicit requested informational labels are allowed, but do not add unrelated teaching surfaces. Record `uiMode: none | minimal-controls | requested-inspection | educational` and why; never satisfy a UI test by adding unwanted UI.

Regression examples: “amusement park in pixel + stroked toon” → narrative + pixel-stroke + no education UI. “Interactive amusement park” → narrative; interaction alone adds no lessons. “Explain a roller coaster's operation” → educational, chosen style independently. “Amusement park with inspectable rides” → narrative + requested inspection only. A scene with no educational intent must not fail QA for lacking V8, lessons, labels or a card column.

### Default occupied-space pass: actions, seating and scenery

Prevent intersections before adding detail or spawning copies, for people, animals, imported rigs, buildings, props and rides in BOTH profiles/all presets. Use `references/action-clearance.md`, `templates/action-clearance.mjs` and `templates/pose-bounds.mjs` with the actual production evaluator; this adds no educational UI.

1. **Reserve full space, not origins:** building/awning/door parcels, open access paths, actor swept widths and reach, tails/wings/horns, carried items and neighbouring actors. Reuse fitted rigs/clips from internet assets, but reject an asset/clip that cannot fit the required seat/action without distortion. Split accessible structures into actual wall/door/roof pieces; an enclosing hollow-building AABB is only a broad-phase candidate, not solid occupancy. Use deterministic lanes, queue slots, crossing priorities and seat reservations, not random nudges after overlap.
2. **Solve real contact/action frames:** approach → align → bend/lower → supported sit → stand/exit; pelvis, knees, feet and hands follow real seat/ground/handle frames. Don't sit by dropping a standing model through the chair. Ride occupants inherit the seat's moving frame once. Permit only exact named intended body↔support/joint contacts, with action window and bounded depth; never exempt an entire actor, chair, species or same-owner subtree. Check support gaps separately—an allowed collision contact does not prove the person isn't floating.
3. **Check the live pose across the whole action:** refresh skeleton/morph vertices and world frames, then use measured conservative body-region capsules/boxes plus structural pieces. Bind-pose bounds/root-point distances miss moving limbs; undersized colliders and omitted tails/carry props are failures. Broad-screen nearby pairs; refine loose bounds instead of deleting objects to lower candidate counts. Production audits supply independently specified `requiredIds`; missing actors/proxies or unverified coverage cannot pass. Test nonadjacent self-parts too, while explicitly declaring valid anatomical/structural joints. Proxy overlap is not automatically actual mesh penetration.
4. **Test critical times and fixes:** sample full cycles, loop seam, approach/contact/departure, largest reach, sitting/standing, crossings and door swing. Include exact events and refine using relative tip motion/clearance, not only endpoints or an attractive frame. `sampledOnly:true` is bounded sampled evidence, not continuous collision freedom. Move a real wrist/tail/knee into an obstacle, overlap building parcels and synchronize a crossing; the SAME production predicate must flag the fault and pass after repair. Review worst-contact side/back/top crops plus an action strip. Never hide bodies, shrink proxies, fade through walls or freeze the requested action to claim a pass. One source-driven QA runner, cached static obstacles, nearby-pair broad phase and worst-few reporting keep this practical.

### Default asset workflow: search, acquire and USE fitting models

Ask the Model Sourcing Gate after the look is resolved, for BOTH profiles. Follow the recorded `internet-full`, `hybrid` or `authored-only` choice; do not silently impose internet-first. In the first two modes, reuse valid local assets but still search for missing major roles. The acquisition requirements in this section apply to those two modes; authored-only intentionally builds geometry and does not need a failed model search to justify it.

**A search is not the deliverable.** Before detailed hand-modelling, find candidates for the hero and major supporting roles, review the actual per-asset terms and appearance, download the chosen permitted model/dependencies, inspect an actual import, and USE it in the scene when it fits. A fitting, licensed asset must not be ignored in favour of primitive-only reconstruction merely because hand-building is familiar. Nor does importing one token tree satisfy sourcing a park's otherwise hand-built rides/buildings/cast. Record decisions for the main roles in the existing SOURCES/CREDITS/design ledger.

**Fit means diorama-quality, not merely downloadable:** correct subject/representation and silhouette, coherent kit/palette/proportions, adequate construction detail, usable parts/rig/clips for the requested motion or inspection, viable triangle/draw-call/texture budget, and compatibility with the chosen pixel/toon/hybrid rendering. Judge the real model from more than a thumbnail. Normalize scale/axes/origin, adapt colours/materials without losing important markings, preserve rigs/part identity, fit to the scene and review a rendered close-up. A realistic/PBR asset is not automatically disallowed if it can be adapted well; an unrelated low-poly substitute is not automatically suitable. Follow the original long-form craft, composition and motion standards after importing.

**Rights remain mandatory:** prefer FREE assets whose explicit terms permit commercial use, modifications and redistribution/embedding in the delivered scene. Read original asset/license evidence; retain credits/license/change notices where required. NC, ND, editorial, personal/educational-only and missing rights do not pass. Custom/ShareAlike/other terms require compatibility review, not a fake CC0 label. No purchases, subscriptions or paid downloads without explicit user approval. Check separately licensed dependencies. Commercial permission is not scientific accuracy or trademark/other-rights clearance.

**Source order:** use the user's Polyfork-first sweep for narrative kits/props, then the relevant original-author/model-library sources in this guide; if Polyfork misses, continue to appropriate alternatives rather than declare that the internet has none. Educational subjects use their bounded exact-subject search and extra accuracy/structure gate. Reuse a compatible kit for coherence. Do not crawl every provider indiscriminately or repeatedly search the same noun. Actual search/download/import evidence stays on disk; never fabricate searches, licenses or successful loads.

**Hand-model only the justified gap:** necessary missing/custom geometry, unsuitable candidates after source/fit checks, or interfaces/animation adaptations not supplied by an imported model. Selection or movement alone is NOT a reason to reject an asset: use real part/pivot wrappers where feasible. Retain an all-authored approach when the user explicitly asks for it. If browsing/downloads are unavailable, disclose the limitation and fallback; never say the search found nothing when it never ran. A quality mismatch, unclear license or lack of useful motion is a documented reason to reject, not a reason to force a bad download.

**Proof before completion:** for each major role record search/source, chosen asset or rejection/fallback reason, license evidence, actual downloaded file/path/hash and import/style/motion result. A compliant matching candidate found → acquired and used; no suitable candidate → honest specific fallback. Verify the chosen asset actually exists in the final scene, not just in assets/. Offline/standalone delivery packages every permitted dependency and is tested without network; a warm cache or CDN loader is not self-contained. Sourcing adds NO education panels, callouts or other UI to narrative scenes.

### Preserve the approved 4.x additions without shortening this guide

- **Representation:** actual subject by default, not a classroom surrogate. Follow `references/representation.md`: Earth means a planet, not a globe on a stand. Ask real subject / physical teaching model / explanatory abstraction / you choose only if materially ambiguous; preserve explicit choices. Keep representation, render preset, purpose, scene/object context and Inside independent. Natural subjects do not acquire invented platforms, frames or machinery merely because this guide contains mechanical examples.
- **Narrative sourcing:** preserve the user's Polyfork-first catalogue sweep, kits/matching, source decisions and scale/palette integration in `references/external-models.md`. This extends the older model-library section; do not fall back to primitive-only scenery without checking suitable assets.
- **Educational sourcing:** the named teaching object/parts may be verified external geometry. Use the bounded candidate search and accuracy/import wrapper in `references/educational-models.md`, not a narrative full-catalogue crawl. Add authored semantic IDs, interfaces, pivots and explanation where needed.
- **Rights:** all downloaded assets must permit commercial use, modification and redistribution in the delivered scene. Free download is not permission. Use `templates/educational-asset-gate.mjs` with reviewed evidence/credits and actual file hashes; CC0/CC-BY can pass, unknown/custom terms require review, NC/ND/editorial/incompatible terms do not pass. Verify dependencies and offline bundling; a remote CDN load is not an offline standalone artifact. This rights gate overrides older library summaries, including casually accepted restrictive licenses.
- **Construction:** retain `templates/construction-kit.js` and `templates/interface-checks.js`; reserve working pockets, derive contact stacks from shared datums, check actual geometry and repeats. Keep the original detailed construction/selection chapters. Material/selection/annotation checks apply only to implemented/requested features; no forced annotation system to satisfy QA. AABB overlap is a candidate, not certified penetration. Use scoped real mutations, not bespoke injected-object detectors. Available helpers are supplemental, not proof of a whole scene.
- **Maintenance:** do not mutate the installed skill after each scene automatically. An explicit maintenance request and filesystem approval are required. Preserve original/current backups. Historical changelogs document prior versions; they do not override this release.

A diorama is a tiny staged scene with a resettable three-quarter hero camera and
free user orbit. The default pixel preset uses a white cut-out, palette-snapped
pixel grid and ink contour; the other presets follow their own presentation
contracts. Narrative scenes retain the slab and toy-scale animated cast;
educational scenes use the exception below.

Classic Pixel Art is the recommended new-project look. **Stroked toon / illustrated miniature**
(`stroked-toon`) and the **pixel + stroke hybrid** (`pixel-stroke`) are optional
rendering presets for any subject, not a coffee-machine genre. **Ask which of the
three to build in at the start of every project** — see `Render Preset Gate` —
because the look changes presentation only, never the subject, story, research
requirements, choreography or construction standard, and nobody should have it
chosen silently on their behalf.

**Profile precedence (read first):** For an educational explanation, read
`Educational Mechanism Profile` before the narrative defaults. One mechanism and
one causal sequence replace ALL mandatory cast/ritual/multiple-system/story-prop
quotas throughout this guide. Clean off-white and the single V8 right card/mobile dock replace empty
paper or decorative figure UI (explicit placement requests remain supported). Construction and mechanical correctness are never
waived. For EVERY preset, free user orbit is mandatory; fixed/hero views below
refer to deterministic QA/reset poses, not a locked interaction camera.

**This file restores the full guide.** The supplemental references named in the 5.0 additions carry later approved sourcing/representation rules; copy-in modules and the detailed design sheet remain in `templates/`.

**Execution index — do not read every genre recipe first.** Resolve the preset
and profile, then use the fast-path table. Read `Research Before You Model` and
`The Detail Bar` (including whole-object completeness) for every build. Narrative
builds additionally use `One Prompt, One Build`, `The Animation Bar` and their
chosen rendering recipe; educational builds go directly to the canonical UI/
inspection and construction contracts. `The Look Contract` is pixel-only.

| Before advancing | One source of truth / required evidence |
| --- | --- |
| First mesh | Filled `templates/DESIGN.md`: complete object, essential parts, source provenance and shared mating frames |
| Repeated assembly | `Construction regression gates`: every instance, actual axes/bores and end-plane separation; not one good sample |
| Requested selection | `Canonical educational UI and inspection contract`: reuse selection behavior only as requested; no narrative education card/lessons/labels. Verify visible emphasis, keyboard equivalent and exact restoration |
| Claimed pass | `Verification`: nonempty actual geometry, expected counts, negative injections and fresh build hash tied to the report |

This table indexes existing acceptance rules; detailed tests live only in the
sections named here. Read other subject recipes only when the build uses them.

## Render Preset Gate (ask once, every project)

Before the first mesh or presentation work, ask using the structured-choice tool when available. Keep labels and one-sentence consequences visible:

> **Which look should I build this in?**
>
> 1. **Classic Pixel Art (Recommended)** — The original finer palette-snapped miniature look with ink contours and ordered dither.
> 2. **Stroked Toon / Illustrated Miniature** — Smooth bevelled parts, stepped shading and fine charcoal outlines.
> 3. **Pixel + Stroke** — Toon shading and outlines on a low-resolution pixel grid.

Map answers respectively to `pixel`, `stroked-toon`, `pixel-stroke`. Generic “pixel art”, explicit classic and explicit delegation select `pixel`; silence waits. A reference image alone does not settle a materially ambiguous request. Do not repeat the question per material or repair. Record the answer verbatim in DESIGN, including the preset ID and renderer implementation. Every preset supports free orbit and deterministic hero reset; no second orbit question. After the look answer, ask the sourcing question next unless already answered. While either is pending, inspect local files and research the subject, but do not start detailed geometry, model downloads or a presentation implementation that commits the unanswered choice.

## Model Sourcing Gate (ask next, once per project)

> **How should I create the models?**
>
> 1. **Hybrid — source + custom-build (Recommended)** — Search for commercially usable models, download and use the ones that fit, then model missing or scene-specific pieces myself.
> 2. **Internet models throughout** — Search for and use commercially usable downloaded models for all major roles; focus my work on assembly, styling, rigging and animation.
> 3. **Fully agent-modeled** — Build all scene geometry myself for a unified custom look, without downloading third-party models.

This is a separate question after style, not a hidden assumption or a confused “pixel hybrid” choice. Use stable question ID `asset-strategy`, single-select, and map answers to `hybrid`, `internet-full`, `authored-only`. Record exact user wording. Explicit delegation selects hybrid; silence waits. Explicit requests for original/procedural geometry answer authored-only; an offline deliverable alone does NOT mean authored-only (permitted assets can be packaged locally).

- **Hybrid:** actually search for every missing major role and use fitting licensed candidates; fill documented gaps with authored geometry. A token imported prop does not satisfy sourcing the hero/cast/buildings. Do not search and then hand-build suitable assets out of habit.
- **Internet models throughout:** source the hero and all major supporting roles. Scale/material changes, pivots, adapters, collision proxies and simple joining/support geometry are allowed; quietly hand-building a missing hero is not. If no fitting licensed major asset exists, report the specific gap and offer a subject substitute or permission to switch that role to hybrid. Do not guarantee a full matching library before searching, and do not force an unsuitable model just to fill a quota.
- **Fully agent-modeled:** author all visible model geometry, including hero and supporting roles. Subject/photo/motion references and coding/rendering libraries remain allowed; this choice does not mean “no internet research”. Do not download model packs, use an imported model as a hidden starting point, or downgrade the detail/animation/contact bar. User-provided models require an explicit exception if this mode is selected.
- **Commercially usable, not merely commercially available:** in BOTH internet modes verify the actual per-asset license permits commercial use, modification and redistribution/embedding in the delivered scene. Prefer free CC0/compatible CC-BY; preserve required credits, modifications and license notices, check dependencies and package offline. Unknown rights, NC, ND, editorial/personal-only and incompatible licenses fail. Availability for sale is not a rights check. No purchases or subscriptions without separate explicit approval. Explain this briefly with the question; do not overwhelm it with legal boilerplate.
- **Honest exceptions:** unavailable search/download access is not “nothing suitable found”. Disclose the limitation and ask before changing a selected sourcing mode. New choices do not waive subject accuracy or mandatory verification and add no educational UI.

**Pre-build decision receipt:** after both answers, state one short line such as “Classic Pixel Art · hybrid sourcing · narrative · minimal controls”, then record the choices in DESIGN. Before delivery reconcile each major role against its chosen source mode and record native render dimensions, scaling and style crops. Missing answers, unsupported render-preset claims or unapproved sourcing switches cannot pass QA.

### Fast path by scene

| If the commission is... | Read next, in this order |
| --- | --- |
| explicit explanation / guided how-it-works (not a machine or cutaway view alone) | Educational Mechanism Profile → Universal Inspection Controls → chosen render preset → Machine Grammar → Verification (profile-aware) |
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

## When to Use

- Educational "how does this work?" mechanisms, cutaways and step-through
  causal explanations; use the Educational Mechanism Profile, not cast quotas.
- "Make a small diorama / miniature scene / pixel scene of X"
- A clip or still shows a flat cut-out scene with chunky pixels and little
  people, and the ask is to match that look
- An existing 3D scene needs the pixel-art presentation (palette, dither, ink,
  reset hero angle plus orbit) rather than a smooth render
- The figures need believable motion: walking, climbing into a car, sitting,
  swimming, diving, and it has to survive close inspection
- The ask is for a *staged diorama*, not a model: several systems, a cast, a goal or boss,
  and a loop that can be frozen at any second
- The user gives only one line ("a bakery at closing", "a lighthouse under
  siege"); this skill is designed to turn that into a complete commission
  without an interview

Don't use for photoreal scenes or full-resolution photographic product renders.
Every scene MUST support free user orbit by default, including pixel, stroked-toon and pixel-stroke. No separate orbit consent exists. Keep a deterministic hero angle for QA/reset, never auto-spin.

## Research Before You Model

Four lookups come before the first mesh: the subject by frames, the asset
libraries, the motion itself, and the capture loop. Skipping them is how a build
ends up with a plausible silhouette that matches nothing and animation that reads
as generic. Budget for them, they are usually faster than the modelling they save.

| Question the research answers | Where it lands |
| --- | --- |
| what does it look like, exactly | `refs/<subject>/*.png` contact sheets |
| what does it do, in what order, how fast | `refs/SOURCES.md` + the beat table |
| does a rig or clip already exist | `CREDITS.md` + `assets/` |
| is it actually right on screen | `qa/` captures, compared to the sheets |

### 1. The subject, by frames

Find the real thing moving, not stills. For games, anime, sport or machinery the
footage *is* the specification: it settles what the shape is, where the motion
starts, how long each stage lasts and what colour it is at each step.

```bash
yt-dlp --flat-playlist --print "%(id)s | %(title)s | %(duration)s" "ytsearch6:<subject> animation"
yt-dlp --extractor-args "youtube:player_client=ios,android" -f 18 -o "refs/clip.%(ext)s" <id>
ffmpeg -i refs/clip.mp4 -vf "fps=8,scale=300:-1,tile=6x4" refs/sheet-%02d.png
```

Read the contact sheets with vision, then write the grammar down in words before
touching geometry: *ball leaves the hand on an arc, opens with a white burst, the
creature springs out at full size, the ball snaps shut and returns*. A paragraph
like that is the acceptance test for the effect you are about to build.

Rules that come out of doing this repeatedly:

- Prefer **game footage** over fan animation for game subjects; the game is the
  canonical grammar, and fan cuts are already an interpretation.
- Prefer **one clean clip sampled densely** over ten clips sampled sparsely.
  Twelve frames a second on a 4 second send-out shows the whole sequence.
- Keep the sheets in `refs/<subject>/` next to the build so the next person can
  see what you were matching, and so QA has an image to compare against.

### 2. Model sourcing: check the libraries before you build

Internet-first sourcing applies to ALL major scene roles, not only creatures. Acquire and use fitting commercially licensed models by default; hand-build only a documented gap or explicit original-geometry request. Hand-building a creature from primitives is the *last* option, not the first. A
rigged download with real deformation and usable clips beats four hundred lines
of spheres the moment the camera comes within a metre. Search first, and keep a
record of what you searched.

**The ladder. Every hero asset walks down it in order.**

1. **Already on disk.** The user's folder often ships a `tools/`, `assets/` or
   `model/` directory with GLBs in it. List it before anything else.
2. **A CC0 pack covers it.** Import it. No attribution, no negotiation.
3. **A CC-BY model covers it** and the page can carry a credit line. Import it,
   credit it, done.
4. **Nothing fits the silhouette** and the shape has to be exact. Hand-build it
   against the reference frames, and say in the log that you searched.
5. **Never:** ripped game assets, Models Resource / Spriters Resource downloads
   used as geometry, "editorial use only", NC, ND, or anything with no stated
   licence. Those are hard stops; ask the user instead of guessing.

**Creatures, characters and rigs**

| Source | Licence | What is actually there | How to search |
| --- | --- | --- | --- |
| [Quaternius](https://quaternius.com) | CC0 | hundreds of low-poly creatures, characters, nature, buildings; the Universal Animation Library is 120+ clips | browse `quaternius.com/packs`, grab the pack GLB |
| [KayKit / Kay Lousberg](https://kaylousberg.itch.io) | CC0 | adventurers, skeletons, dungeon and RPG packs, rigged and animated | itch page, per-pack zip |
| [Poly Pizza](https://poly.pizza) | CC0 or CC-BY | 10,000+ low-poly props, creatures, vehicles; GLB/OBJ, no login | search by noun, read the badge on each card |
| [Kenney](https://kenney.nl/assets) | CC0 | kits for props, vehicles, characters, UI, audio | category browse |
| [Sketchfab](https://sketchfab.com/3d-models) | per model | the long tail: specific machines, animals, buildings | filter **Downloadable** + **CC0**/**CC-BY** before looking at anything |
| [Smithsonian 3D](https://3d.si.edu) | CC0 | scanned real objects, fossils, artefacts, vehicles | search, check the licence note under the download |
| [NASA 3D Resources](https://nasa3d.arc.nasa.gov) | public domain | spacecraft, rovers, terrain, helmets | browse by category |
| [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) | per model, mostly CC-BY 4.0 | canonical rigged test models (CesiumMan, Fox, BrainStem) | read `LICENSES/` before use |
| [Objaverse](https://objaverse.allenai.org) | mixed, per object | 800k research objects, good for odd props | verify the per-object licence, most are not clean |
| [Meshy](https://meshy.ai), [Tripo](https://www.tripo3d.ai), user-supplied | user owns the output | anything the pack libraries do not have, generated from the reference | export GLB, keep the prompt in `CREDITS.md` |

**Animation clips** (motion is usually harder to hand-key than shape is to model)

| Source | Licence | Notes |
| --- | --- | --- |
| Quaternius Universal Animation Library | CC0 | 120+ humanoid clips, retargetable, best first stop |
| [Mixamo](https://www.mixamo.com) | free with an Adobe account | thousands of humanoid clips + characters; check current Adobe terms, retarget in Blender or three.js |
| [Rokoko Motion Library](https://rokoko.com/products/motion-library) | 150 free clips, paid beyond | mocap quality, good for weight and follow-through |
| CMU Graphics Lab Motion Capture | free for research and commercial use with credit | raw BVH, huge, needs cleanup |
| Sketchfab animated models | per model | often ships with an idle/walk/attack set |
| [Godot4 Open Animation Libraries](https://github.com/catprisbrey/Godot4-OpenAnimationLibraries) | CC0 | Mixamo clips rebaked as Godot `.bin`/GLB banks, already retargeted; `jwelchgames/Godot4-MixamoLibraries` is the other mirror |

**Props, environments, textures, light**

| Source | Licence | Notes |
| --- | --- | --- |
| [Poly Haven](https://polyhaven.com) | CC0 | HDRIs, textures, models; the HDRI set is the fastest way to fix flat lighting |
| [ambientCG](https://ambientcg.com) | CC0 | tiling PBR materials, HDRIs, some models |
| [OpenGameArt](https://opengameart.org) | mixed | filter to CC0 / CC-BY; 3D section is thin but has good odd props |
| [madjin/awesome-cc0](https://github.com/madjin/awesome-cc0) | index | a maintained list of CC0 sources when the usual four fail |

**Searching them without a browser.** Three of the libraries have open APIs, so a
build can check them in a single command and read the licence back:

```bash
# Sketchfab: downloadable + CC0 only, name and page printed for each hit
curl -s "https://api.sketchfab.com/v3/search?type=models&downloadable=true&license=cc0&q=dragon&count=24" \
  | python3 -c "import json,sys;[print(r['name'],'|','https://sketchfab.com/models/'+r['uid']) for r in json.load(sys.stdin)['results']]"

# Poly Haven: models, HDRIs, textures (filter by category)
curl -s "https://api.polyhaven.com/assets?t=models"
curl -s "https://api.polyhaven.com/assets?t=hdris&c=studio"

# ambientCG: materials and HDRIs by keyword
curl -s "https://ambientcg.com/api/v2/full_json?type=Material&limit=20&q=concrete" \
  | python3 -c "import json,sys;print([a['assetId'] for a in json.load(sys.stdin)['foundAssets']])"
```

Poly Pizza, Quaternius, KayKit and Kenney are browsed by search on their own
pages; query them with the noun plus the style (`low poly dragon`, `kaykit
skeleton`), not with a sentence.

**Reference only, never geometry:** The Spriters Resource, The Models Resource,
sakugabooru, game rip archives, Pinterest. Use them to learn the shape and the
timing, then build or buy the actual asset.

### 3. Animation research: how the thing moves

Shape is half the job; the other half is the motion, and it is researched the same
way. Search the *verb*, not the noun.

```bash
# the motion itself, canonical first
web_search: "<subject> <move> animation"      # a game doing it
web_search: "<subject> <move> slow motion"    # real footage, for weight
web_search: "<subject> sprite sheet"          # frame-by-frame timing
yt-dlp "ytsearch6:<subject> <move> animation"
ffmpeg -i clip.mp4 -vf "fps=12,scale=320:-1,tile=6x4" refs/move-%02d.png
```

Read the sheet, then **count frames and convert**: `seconds = frames / fps`, and
scale to the loop length you are building. That is how a 0.42 s anticipation and a
0.18 s contact become the beat table instead of a guess.

Write four lines per action before animating it:

```
wind-up   0.00 -> 0.42   weight back, head down, tail still
contact   0.42 -> 0.55   fastest frames, one pose held for two frames
follow    0.55 -> 0.90   overshoot, then settle
recover   0.90 -> 1.30   back to idle
```

Every attack in the beat sheet needs all four. Missing anticipation is why an
effect reads as "it just happens", and missing follow-through is why it reads as
"it snaps back".

For rigs, cross-check the reference against a real clip: if the library has a
punch, a swipe or a jump that is close, retarget it and offset the acting, rather
than keying a pose from scratch.

### 4. The research log

Every build writes `refs/SOURCES.md`. It is the proof the searches happened and
the reason the next person does not repeat them.

```md
| Question | Searched | Found | Decision |
| --- | --- | --- | --- |
| what does the send-out look like | yt: "sword shield send out slow motion" | RoUJ_TWvB3g, orb + white burst | matched, timings below |
| hero creature rig | poly.pizza "dragon", quaternius characters | nothing matching the silhouette | hand-built from refs/sendout |
| hit reaction weight | yt: "pokemon take damage animation" | 0.9 s flinch, 1.7 s stagger | HURTS table |
```

A build with no `SOURCES.md` has not finished its research step, even if the
scene looks right.

### 5. Prove it with shots

Every beat gets frozen, captured and compared against the reference sheet before
the next beat is built. The contact sheet of those captures is the review
artifact, not a paragraph describing them.

- Freeze the loop at the beats the reference showed: `?t=<second>` in the page,
  `freeze(t)` through the debug hook, screenshot the frame element.
- Put the captures in a grid next to the reference frames and read them with
  vision. Anything that needs a caption to explain is not finished.
- Keep numerical checks alongside the pictures: facing dot products, NaN scans
  over every geometry, console errors, effect bounding boxes. They catch the
  failures the eye forgives at 300 px.

## One Prompt, One Build

When the user gives a subject in one line, treat it as a **commission**, not a
questionnaire. Make the creative decisions, state them in one short assumption
line, and build the whole diorama. Do not stop at a plan, a blockout or a design
sheet and wait for approval.

The only reasons to ask are credentials, a destructive action, a path that
would overwrite the user's work, **or the `Render Preset Gate`**. That gate is a
deliberate exception to autonomous assumptions: one question, once per project,
before the first mesh. Everything else is a default.

### Step 0, before the assumption line

Ask the `Render Preset Gate` question first, then run the three lookups in
`Research Before You Model`:

1. Step the real subject into frames and write down its motion grammar.
2. Walk the sourcing ladder for every hero asset (disk, CC0, CC-BY, hand-build),
   with a `CREDITS.md` line per import and the search in `refs/SOURCES.md`.
3. Stand up the capture loop (`qa/shoot.mjs`, a frozen `?t=` frame, a contact
   sheet) so every beat can be reviewed as a picture.

For an invented subject, spend the same time on reference density instead: find
three images that agree on what the place looks like, list the props they share,
and build those before any invented detail.

### The default commission

Use these unless the prompt explicitly says otherwise:

| Knob | Default |
| --- | --- |
| Slab | 21 x 14 x 0.42 m; 16 x 12 for one room, 24 x 16 for a street, port or launch pad |
| Loop | 46 s at 40 Hz; one readable cycle plus a quiet seam |
| Palette | 64 entries |
| Systems | 4 defences/machines/service stations/attractions; 3 is acceptable, 6 is the ceiling |
| Cast | 4 to 6 roles total, including one disruption; 2 ambient loops |
| Props / landmarks | 2 hero props, 1 landmark, 3 to 6 supporting props |
| Hero detail | every hero object meets the Detail Bar |
| Animation | every hero actor has all five layers |
| Output | `index.html`, `<slug>.html`, `README.md`, `DESIGN.md`, `src/`, `dist/` |
| Path | `<cwd>/<slug>/` unless the user named a folder |
| Minimum viable | 3 systems, 3 roles + 1 disruption, 1 hero prop + 1 landmark, 30 s loop; still passes the bars |

State the assumption in one line before coding:

> Assumption: market archetype, 46 s loop, 4 service systems, 6 roles plus a
> late customer, 21 x 14 slab, 64 colours. Say if you want a different scale or
> genre.

That line is the contract. State it, then continue in the same turn; do not wait
for approval. It gives the user a chance to redirect after seeing the assumption,
without blocking the build.

### Long builds and context

A scene like this runs for hours of agent time and thousands of messages: render
loops, one screenshot per beat, one probe per bug. The session will need to
compress its context, more than once, and compaction is lossy. Build so that a
compact does not cost you the work:

- **State lives in files, not in the chat.** `DESIGN.md`, `refs/SOURCES.md`,
  `CREDITS.md`, `qa/report.json` and the beat table in `stage.js` must carry every
  decision. If a fact only exists in a message, it is already gone.
- **Write the rule down when you learn it.** A fix found at 3 a.m. is worthless if
  it only exists in the transcript; put it in the skill or a comment next to the
  code, with the reason.
- **Name the shots.** `qa/frames/<entity>/sheet.png` and `shots/t-12.40.png` are
  stable handles a post-compact agent can re-read without rerunning anything.
- **Re-derive, do not remember.** After a compact, re-run `frames.mjs` and
  `shoot.mjs` rather than trusting your summary of what the last frame looked
  like: the numbers are cheap, and a confident memory of an old build is the
  most expensive thing in the session.
- **Keep one open task list** in the repo (a `TODO.md` or an issue) so the thread
  that survives compaction is the plan, not the chat.

### Reading the prompt

| Prompt shape | What to do |
| --- | --- |
| one noun ("a bakery") | pick the closest router row; invent the verb, disruption and goal |
| one sentence ("a lighthouse under siege") | take its nouns and verbs literally; fill the missing cast/systems from the router |
| a reference image | match its composition, camera side and palette first; keep this skill's detail/animation bars |
| "like X but Y" | reuse X's structure, replace the subject and the detail anchors; do not copy X's nouns |
| "make it detailed" | use the full Detail Bar and five animation layers; do not add more systems |
| "keep it simple" | cut systems and cast, not detail per hero; two rich objects beat six blockouts |

A prompt that names only a place is still a commission. Decide what the place
does, who arrives, and what goes wrong. State the assumption and build.

### The scene router

Pick the closest row. Do not invent a new genre from scratch unless none fit.

| If the prompt is... | Systems (3–5) | Cast | Goal / disruption | Detail anchor |
| --- | --- | --- | --- | --- |
| defence, siege, castle, base, zombies | 4 towers + gate guns | defenders, 4 species, boss | boss reaches the gate | gatehouse |
| heist, bank, museum, casino | drill, lasers, cameras, getaway | 3 crew, guards, manager | vault opens / escape | vault door |
| market, kitchen, bakery, cafe, food truck, night market | stalls, ovens, prep, pass, dispatch | vendors, cooks, cashier, courier, customers, inspector | closing time / service rush / last bag | counter, hatch or oven |
| laundromat, workshop, gym, repair shop, arcade | washers, dryers, benches, tools, machine slots, ticket rail | folder, attendant, customer, courier, cat | last load / closing / power cut | machine bank or workbench |
| launch, factory, port, mine | gantry, press, crane, conveyor | crew, inspector, cargo | launch / ship / lift | gantry |
| aquarium, pool, harbour, reef | filters, pumps, slides, lights | fish, swimmers, diver, lifeguard | feeding / party / storm | reef or tank |
| station, airport, bus, hotel | signal, platform, desk, luggage | commuters, guard, porter | last departure | clock |
| festival, temple, carnival, funeral | stage, rides, altar, procession | performers, crowd, official | climax / storm | big top or altar |
| farm, garden, safari, nature | irrigation, harvester, weather vane | animals, farmer, crows | harvest / storm | barn |
| home, shop, library, workshop | rooms, counter, shelves, tools | family, clerk, customer, pet | opening / closing | window |
| arena, battle, mech, gladiator | traps, weapons, doors, lifts | fighters, champion, beast | champion enters | gate |

If none fit, use the universal shape: **place + repeated ritual + interruption
+ consequence**. Give it 3 to 5 systems, 4 roles and one goal. A quiet subject
still needs a verb: a library needs a closing, a bakery needs a service, a
lighthouse needs a sweep that fails.

### If the router misses

Do not freeze. Answer four questions about the noun:

1. **What does this place produce or repeat?** Bread, light, trains, fish, money,
   quiet, laundry, coffees.
2. **Who operates it?** Baker, keeper, guard, diver, clerk, mechanic.
3. **What interrupts the output?** A critic, a storm, a thief, a shutdown, a
   delivery, a leak, a closing-time crowd.
4. **What is the visible consequence?** Burnt batch, dark lens, missed train,
   flooded tank, empty till, closed sign.

Those four answers give you the system, cast, goal and residue. Then use the
five beats: **normal output → first interruption → escalation → goal contact →
residue and seam**. No combat required. A deadline, an inspection, a storm or a
closing bell is a valid boss.

Worked one-prompt example:

> "a tiny bakery at closing time"

- Archetype: market/kitchen. Slab 16 x 12. Loop 42 s.
- Systems: oven, proofing rack, counter, till. Cast: baker, apprentice, last
  customer, food inspector (the disruption).
- Goal: the inspector reaches the counter before the last loaf is sold.
- Beats: 0 s oven glow and bread out; 8 s first customer; 16 s inspector at the
  door; 26 s last loaf contested; 34 s sign turns, flour settles, cat sleeps.
- Detail anchors: oven door (hinges, soot, peel), bread rack (trays, crumbs,
  cloth), counter (ledger, bell, worn edge), inspector's clipboard.
- No towers: use machine grammar for the oven and till; field audit for the
  oven's heat; death/exit for the inspector's departure.

### The autonomous pass

1. **Interpret.** Pick the archetype; write the assumption line; fill
   `DESIGN.md` yourself. Do not ask the user to fill it.
2. **Blockout.** Grey slab, camera, five beats at 1:1. No palette, no post, no
   materials. If the beats do not read, restage before adding detail.
3. **Presentation.** Palette, light, post, ink, dither, camera solve.
4. **Set and props.** Landmark, two hero props, supporting dressing. Clear the
   2 m threshold. No duplicate silhouettes.
5. **Cast and detail.** Rig the cast; apply the Detail Bar to every hero object.
   Cut a role before cutting detail per role.
6. **Animation and systems.** Five layers per hero; tower acquire/fire/impact/
   recovery; field ramp/area/affect/decay; machine input/motion/output/residue.
7. **Effects and residue.** Contact shadows, species deaths, dropped gear,
   stains, ambient loops, loop seam.
8. **QA and package.** Detail/animation audit, numbers, 1:1 crops, standalone
   `file://`, README and `DESIGN.md` agreeing.

If time is tight, **cut the number of systems or actors, never the detail per
hero or the animation layers**. Two detailed towers with five layers beat six
blockout towers with one fire animation.

### Efficiency rules

- **One project, one build loop.** Scaffold once, then build, shoot and fix in
  place. Do not rewrite the entry file for a detail that lives in a prop module.
- **Build for orbit inspection.** Prioritise the hero view, but construct every exposed back, support, cavity and joint coherently.
- **Cut systems before detail.** A tight build with two rich towers and five
  animation layers reads better than six thin towers with one recoil.
- **Use the templates.** Camera, post, palette, lighting, the cast rig and the
  detail helpers are already solved; do not re-derive them from prose.
- **Shoot known timestamps.** Freeze at the five beat times and the five QA
  frames; do not scrub for a good frame.
- **Package last, once.** Build the standalone only after the QA frames pass;
  rebuilding it after every tweak wastes the pass.

### One-prompt acceptance

Do not report "done" until all of these are true:

- `DESIGN.md` exists and matches the build.
- Five beats have timestamps and proof frames.
- Every system has events; every actor has a death, exit or residue.
- Each hero has three detail passes and at least one story detail.
- Each hero actor has idle, locomotion, action, reaction and death/exit.
- Every carry, handoff, load and mount has a contact timestamp and a nine-frame
  strip; palms are on the prop and boots are on the vehicle.
- A queue serves after arrival, never before; no standing gesture is blended
  into a walking root.
- No generic sphere burst, floating prop, clipped landmark or beam on a target
  that has already expired.
- No fixed deck prop, ammo store, tool or crew member moves with a turret,
  flywheel or machine pivot.
- Standalone opens over `file://` with zero console errors.
- The final message gives the path, loop length, system/shot counts and the QA
  frames, not a request for feedback.

## Starting A New Diorama

When the subject is new, the first deliverable is a design sheet, not a scene.
With a one-line prompt, fill it from the defaults in `One Prompt, One Build` and
do not ask the user to complete it.

1. Copy `templates/DESIGN.md` into the project as `DESIGN.md`.
2. Write the premise as a verb, not a noun. Name the place, the repeated action,
   who interrupts it, and the payoff.
3. Fill the cast and system sheets. If a role has no action, cut it. If a system
   has no visible consequence, cut it.
4. Pick five beats and five QA timestamps. A beat without a timestamp is not
   staged.
5. Block out in grey at the reset hero camera and shoot the five beats at 1:1.
   This is a staging check, not a production pass: no palette, no post, no
   materials. Redesign staging before committing to it.
6. Once the blockout reads, run the production pipeline below. Palette is the
   first production pass; the grey blockout does not count as one. Detail
   multiplies a readable blockout; it cannot rescue an unreadable one.

The rest of this file is the recipe for each pass.

## Educational Mechanism Profile (first-class exception)

**UI and inspection authority:** `Canonical educational UI and inspection contract`
below owns placement, controls, lessons, selection, focus and restoration. Follow
it rather than inferring defaults from older screenshots. The render preset gate
and free orbit apply unchanged.

Choose `sceneProfile: educational` for explicit explanations, guided technical cutaways and how-it-works teaching requests—not a machine subject, rotation or a cutaway view alone. This profile takes precedence over ALL narrative quotas below: no mandatory cast, disruption, ritual, landmark, three systems, ambient loops, five actor layers or decorative story props. One accurately constructed mechanism and one clear causal sequence is sufficient. Do not invent a crowd or combat to satisfy the router. Research and construction accuracy remain mandatory; simple UI never means missing mechanical parts.

- **UI, selection and lessons:** when enabled/requested, use the canonical contract below; explicit UI-free briefs omit panels/lesson controls. No second toolbar, competing material cache or explanatory clock.
- **Component manifest is a hard delivery artifact:** record each essential part's ID, assembly/parent, function, supporting joint/bearing/fastener, input/output connection, motion law, units, source and tolerance, mesh/group mapping, selectable anchor and proof frame. Include otherwise obscured shafts, cams, rods, links, valve gear, ports, supports and housings when functionally relevant. Explicitly state omissions and symbolic simplifications before acceptance; never substitute a label for missing construction.
- **Mechanics are coupled, not independently looped:** derive all driven transforms from a shared phase/driver. Write and test actual ratios, directions, phase offsets, link lengths, kinematic equations, contact/clearance and event timing. For an engine, for example, verify crank:cam 2:1 over a 720° four-stroke cycle, connecting-rod length and piston stroke, valve lift/seat contact and opening order; do not copy these ratios into unrelated mechanisms. Check contacts across motion, not only at the hero frame.
- **Nothing passes through another solid:** this is a hard acceptance rule for EVERY profile and preset, including educational scenes. Test non-contact pairs over the complete motion range and at contact transitions, not just one still. Declare intended joints/contact surfaces and numeric tolerances; all other swept bodies must keep positive clearance. Include complete geometry (tips, tails, bevels, fasteners and attachment arms), not only centres/anchors. In an engine, test actual piston-crown/valve-head/spark-plug bounds and actual cam/follower surfaces at dense phase samples. Do not move independent parts with unrelated sine waves, hide a collision with a cutaway, turn off depth testing, or use transparency/labels to pretend it is fixed. First solve the constraint or alter the geometry. Every shaft, piston, rod or sliding member that crosses a fixed wall/flange needs a REAL bored hole, slot or cutaway opening with measured swept clearance; a solid shelf with a dark circle painted on it is a failure. Test the moving body against the actual structural mesh at the crossing plane, including the lowest/full-travel pose. Ignition flames, gas arrows and pressure indicators must also stay in the moving free volume: their full tips/tails/width must not cross the piston, liner, valves or plug. Keep depth testing on; an explicit x-ray teaching mode must be separately selected and clearly identified, never the default. Capture before/contact/after frames from at least two useful orbit angles. A failed or unrun penetration check blocks acceptance.
- **Hard acceptance, not promises about agents:** reject delivery until the manifest has no unexplained missing essentials; numeric invariant tests pass at boundaries and dense cycle samples; repeated `freeze(t)` yields identical state; desktop/phone hero frames and front/back/high orbit crops are reviewed; a motion strip proves causal order, contact and no interpenetration; controls, pointer-drag vs click, keyboard selection/focus and reset are tested. Store actual commands/results and tolerances in `qa/report.json`. An unrun check is UNVERIFIED, never a pass. These gates make omissions detectable; no skill can guarantee every future agent complies.
- **Profile-aware QA:** retain finite geometry, console, deterministic time, contact and motion checks for every preset. Pixel uses palette/dither checks; toon uses native contour/material checks; hybrid checks low-res target + nearest upscale + only one outline pipeline. Educational off-white (and the canonical single UI surface only when enabled) replace white-empty-paper/cast/ritual quotas explicitly; do not silence unrelated failures. Fixed-camera assertions apply only after `orbit.reset()`, never during user inspection.

## Canonical educational UI and inspection contract

This is the single authority for educational UI, selection and lesson behavior. **EDUCATIONAL / EXPLICITLY REQUESTED FEATURES ONLY: ordinary narrative scenes skip this chapter and its UI tests. Requested narrative inspection may reuse only its selection behavior; do not add the card, lessons or teaching labels.**
The exact V8 tokens/hierarchy below remain the 3.16 visual contract.

**Use code, not an interpretation of “shadcn-style”.** For new educational scenes WITH the educational UI enabled (not an explicit UI-free brief), copy `templates/education-v8.css` and build the DOM hierarchy below. UI-free educational scenes skip this chapter's DOM and UI tests; narrative scenes do not inherit it.
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

### Selection, focus and lesson adapter

Raycast actual visible geometry: nearest eligible hit wins, respecting nearer
opaque occluders. Map the hit mesh to both its assembly ID and its actual piece
ID; assembly selection and clicked-mesh selection are distinct scopes. The
single labelled keyboard piece picker must expose the same pieces/actions,
including hidden pieces; never silently broaden a click to an entire assembly.
Show one short explanation in the card. An optional single label uses a live
geometry-local anchor and hides behind camera, offscreen or when occluded.

A deliberate canvas/picker Inspect selection may make one short useful camera
AND OrbitControls-target transition to live selected bounds. Avoid end-on shafts
and blocking housings; use an authored reveal/cutaway for hidden pieces and
report remaining occlusion honestly. Save the prior view for Back; Reset restores
the hero. User orbit/pointer/keyboard navigation cancels the tween immediately.
Reduced motion uses an immediate useful view. Never auto-spin, chase moving parts
or restart focus per frame. Lesson step selection instead pauses and synchronously
freezes the real evaluator, highlights its part and updates phase/text/readout
without moving the camera; only an explicit Inspect action focuses. Scrubbing
updates the lesson from evaluated state, not an independent clock. Announce
intentional changes politely, not each frame.

Use semantic buttons/select/range, visible focus and non-colour part-name cues;
canvas arrows orbit and R resets. Tabs implement roving focus and keyboard
navigation; no focus trap. Drag/multitouch is orbit, not click (use the movement
threshold/cancel handling in `templates/orbit.js`); UI gestures never bubble into
the stage. Paused and reduced-motion modes retain inspection.

### Soft glow and holographic inspection — implementation recipe

This is an **inspection overlay**, not a new render preset, bloom pass or a way to hide modelling errors. Use the same mechanism for a selected gear, valve, pump impeller, drawer slide or anatomical structure. The V8 selection implementation is the calibration evidence: restrained warm material lift, dimmed context, transparent outer castings and selective gold feature edges. Do not interpret “glow” as a white emissive blob.

**1. Preserve and derive, never mutate the shared originals.** Build a registry once from the actual selectable meshes, BEFORE adding overlays. Store each exact original material reference, including arrays of material slots; a mesh's slot array itself must also be restored by identity. Derive cached variants from each source UUID plus mode. Clone `userData` and `outlineParameters` before changing outline alpha, since nested objects may otherwise be shared. Keep toon ramps, texture maps, roughness and existing supported preset properties. Restore the originals before applying each new selection/X-ray state, not by attempting to reverse colour arithmetic.

Use `templates/inspection.js` rather than duplicating a second material controller.
Its API is `createInspection(THREE, {parts, contextMeshes, resolveVisibility,
onChange, style})`, with `select({partId, mesh})`, `clear()`, `refresh()`,
`dispose()` and `piecePickerEntries(partId, {visibleOnly:false})` (includes hidden
pieces for keyboard inspection). Validate actual mesh membership before selection.
The helper supports rigid meshes only; reject skinned/instanced/morph assumptions.
`resolveVisibility` returns named `hiddenPartIds`/`hiddenMeshes` plus `description`
for an authored cover removal. Hiding requires `shell:true`, or an explicit
`inspectionOccluder:true` part plus an active selection and nonempty cutaway
description; that latter exception may remove an upper gear/bridge to expose a
lower part, never hide construction failures. Optional `ghostPartIds`/`ghostMeshes`
are accepted only for `shell:true`. Selected assemblies/pieces remain visible;
context meshes (floor/stand/UI) cannot hide, ghost or dim.
Unknown parts, duplicate ownership, empty geometry and unsupported material or
deformation paths fail explicitly. Never request a whole-mechanism ghost. The host owns
camera focus, picking and V8 DOM; the helper owns emphasis/restoration, not UI or
mechanical certification. Cached variants derive per original material and mode; never
from the currently displayed variant. Lift colour gently; write emissive values
only where the original material supports them. Dim context as opaque solids.
Only the explicit housing reveal below may change transparency/depth-write.

**2. Reveal only manifest-authorized occluders; ghosting is shell-only. Never defeat depth on the selected part.** Declare `internalPartIds` and `occludingShellIds` per subject in the component manifest. For an internal selection, remove authored covers or optionally ghost only declared outer housings that obscure it; keep the selected part solid, retain non-selected internals as dim solids, and leave floor/stand/UI alone. A global Inside toggle applies that same named reveal plan without dimming all internals. A selected housing stays highlighted rather than ghosting itself. Unlisted opaque solids must still occlude correctly: `renderOrder` does not override the depth buffer. For an internal blocker, author an explained selection-only `inspectionOccluder:true` removal plan; the independent Inside toggle still affects shells only. Hidden siblings need a piece-level plan and cannot remove the selected scope. Do not set `depthTest=false`, use additive whole-body overlays, or fade all solids to pretend a mechanism is correctly constructed. Picker rays ignore generated edges and ghost-shell hits, but respect remaining opaque foreground objects; click and picker share the same selection action.

**3. Make the hologram from feature edges, attached to the live part.** Do not use `wireframe:true`: that exposes triangle diagonals. Use `EdgesGeometry(source.geometry, 32)` and a restrained `LineBasicMaterial` (`color:0xffc35c`, `opacity:0.5`, `transparent:true`, `depthTest:true`, `depthWrite:false`, `toneMapped:false`). Normal blending, no bloom. Exclude slivers, ring grooves, gaskets and tiny bolts when edges become noise; the V8 thresholds were minimum dimension 0.018 units and, for cast housings, volume 0.006 units³. Those are **model-scale-dependent starting values**, not universal dimensions. Use one physical edge overlay on the selected component only, not a second full-scene OutlineEffect/Sobel pipeline. Its surface outline may need suppression to avoid doubled contours. WebGL line width is generally one device pixel: do not promise a controllable CSS-pixel width through `linewidth`.

Attach each owned edge overlay as an identity-transform child of its live source
mesh; mark it as an inspection overlay and exclude it from raycasting. On change,
remove and dispose owned overlays, never source geometry or shared maps.

This child pattern follows moving rigid geometry without copying a stale pose. If an overlay must be a sibling/world-space object, synchronise its transform from the source every evaluation; copying position/quaternion once is insufficient when the source mesh moves. `EdgesGeometry` does **not** automatically follow vertex deformation or per-instance transforms: skinned/morphed/instanced subjects need a deformation-aware shader/overlay or a clearly declared unsupported path. Never claim those supported because a rigid V8 example works. Do not dispose the source geometry, shared source maps, shared toon ramps or original materials; dispose only owned variants/edge geometries and owned overlay materials. Keep overlay generation bounded to selection changes, never create/dispose hundreds of edge objects every frame.

**State and restoration contract.** One selection controller owns this effect. Resolve in order: restore exact originals → remove previous edges → compute selected/internal/Inside state → ghost selected occluding housings → highlight selected meshes → dim remaining mechanism meshes → attach selected edges. Re-apply from originals when Inside changes. Leaving How it works restores its earlier Inside state and removes its tutorial tint; clearing selection retains an independently enabled Inside toggle. Picker, canvas, keyboard and lesson adapters must not compete by writing materials from separate uncoordinated caches. Clear/reset/teardown restores material references, opacity/depth/blending/outline state, selection/readout and authored camera state; only teardown disposes long-lived caches. Respect reduced motion; avoid automatic pulsing, scanlines or flashing. Keep the part name and keyboard focus as non-colour cues.

**Historical evidence (not project dependencies):** `quartz-watch/shots/highlights/dialPost1.png`,
`quartz-watch/shots/highlights/dialPost2.png`, `quartz-watch/shots/highlights/dialPost3.png`,
`quartz-watch/shots/highlights/dialPost4.png`, `quartz-watch/shots/highlights/individual-piece.png`,
`quartz-watch/shots/highlights/rotor.png`, `quartz-watch/shots/highlights/reduction.png`,
`quartz-watch/qa/highlights-report.json` and `quartz-watch/qa/construction-report.json`.
These record this repair, not files future users must have. Twenty-six assembly
glow states had numerical tests/captures; only a subset received visual review.
Do not present that as universal contrast certification.

**Evidence and test — selection contract (3.18).** Quartz-watch selection was
almost invisible, posts were end-on/occluded, and adding emitter properties to
MeshBasicMaterial caused a `shader.value` error. Use `templates/inspection.js`,
with `templates/qa/inspection.test.mjs` and
`templates/qa/inspection-browser.mjs`; use the API above. Assert assembly versus actual clicked-piece identity,
keyboard equivalence, nearest opaque occlusion, and obvious visible glow with
retained shape/colour (never a white blob) in desktop/phone crops. Test shared
and array materials, Basic/toon, two frozen phases, moving/orbiting, rapid changes,
Inside/clear/Back/Reset/lesson exit, interrupted focus and reduced motion. Restore
exact original material AND slot-array identities, shadow flags and `visible`
state, plus original material properties; test source immutability and owned-only
disposal with stable overlay/material counts. Basic materials must never gain
`emissive` or `emissiveIntensity`, even temporarily; feature-test capability before
writing, and assert absent properties remain absent. Verify shader compilation
and no console errors in the fresh browser build. Scalar/material tests alone do
not establish visible contrast, depth correctness or useful focus.

## Repair acceptance: enclosure, fit and reference UI (3.15)

Use this short checklist for existing educational scenes before re-reading narrative
recipes. Evidence: the LEAP-1B repair was requested because its permanent section
exposed the core, its fit cropped the model, its beige background and crowded panel
did not match the requested V8 reference. These checks supplement mechanical QA;
passing enclosure rays or a screenshot does not certify a complete mechanism.

1. **Closed first, explicit Inside.** Unless a permanent section is commissioned,
   cold load and hero Reset show the complete opaque housing, no tutorial tint,
   Inside off. Build the missing casing as real connected wall geometry while
   preserving inlet/outlet openings; a toggle cannot repair absent geometry.
   Inside is a named semantic button in the single surface. Internal picker or
   lesson selection may explicitly activate it, but must update its pressed state;
   leaving the lesson restores the preceding Inside state. Clearing selection
   preserves an independently enabled Inside state. **Test:** load → Inside on/off
   → internal selection → clear → lesson exit → Reset; check visible ancestors,
   nearest opaque ray hits, exact material restoration and open-mouth rays.
2. **Fit the assembly in the space actually available.** Measure canvas layout
   after the dock/panel; use actual complete assembly bounds including covers,
   supports and swept extrema, not a default slab. Fit the safe rectangle with
   padding; if UI overlays the canvas, solve its offset as well as distance.
   With direction target→camera, depth is `distance - along`, so each fit bound
   contributes `abs(transverse)/tanHalf + along` (not minus along). Do not clamp
   distance below the solved fit or distort portrait aspect. Re-measure on layout,
   disclosure, resize/orientation and zoom changes without hijacking user orbit.
   **Test:** project covered/exposed swept bounds at desktop, tablet, 390×844,
   320×640 and 200% zoom, with lesson/disclosure open; front/back/high captures;
   fail an injected protrusion and verify near-plane/focus fits separately.
3. **UI repair:** compare the supplied reference before changing placement;
   apply `Canonical educational UI and inspection contract`, including rendered
   background, accessible lesson state and desktop/phone/200% zoom gates. Do not
   copy the reference subject or introduce a second surface.

## Construction regression gates

These construction rules apply across subjects and all render presets; they supplement, not replace, the style gate and profile-aware verification above. They make known failures testable, not impossible.

1. **Specify the mating interface before decorating the part.** Extend the component manifest with units, parent-local frame, shaft/bore/slide axes, shared joint/port anchor IDs, mating surfaces, nominal dimensions and radial/axial tolerances. Derive both mating meshes and their motion from those anchors, not repeated guessed offsets. A bearing eye needs a real through-bore; its beam, cap, bolt and bevel must stop outside that bore. Budget bevel/fillet intrusion in the actual construction method (inward bevels reduce usable bore), axial lane widths, spacers, end float and end stops. Check coaxial alignment and anchor residual after parent transforms. Model the load path through real bearings, brackets, fasteners and a base; route each functional port through an actual connected opening to its destination, not a hose ending inside a solid. Document symbolic/omitted internals. **Evidence:** V8 running-gear repair found a centred rod beam cutting its crankpin despite an annular eye, bank stagger applied to only one mating member, and fillets facing the wrong local axis. **Test:** local-axis/anchor tests, measured bore plus bevel allowance and axial stack tests, section crops from two orbit directions, and traced port/support connections. Record geometry revision and proof frames in the manifest. Copy `templates/mechanism-contract.mjs` and fill the interface and connection sheets in `templates/DESIGN.md`; the helper validates scalar budgets, not arbitrary mesh bores or load strength.

2. **Audit the complete swept assembly, with narrowly scoped intended contact.** Derive every driven pose from one driver and test the actual transformed meshes or documented conservative collision proxies, including beams, caps, fasteners, webs, fillets and supports. Broad-phase boxes alone neither detect holes correctly nor prove clearance. Enumerate potentially interacting pairs and coverage; whitelist only a named pair of mating surfaces with phase window, normal-gap/penetration tolerance and rationale (bearing/journal, meshing teeth, valve/seat), never an entire assembly or all pairs of a part type. All other pairs need the declared positive clearance. Check full travel, extrema, cycle seam, contact transitions and close-approach intervals with refinement; include ports/FX containment. Report method, sample spacing, tolerance, worst phase/pair, exclusions and unresolved regions. Dense sampled vertex/triangle tests are bounded evidence, not continuous exact collision proof: use analytic bounds or conservative continuous checks where available, otherwise retain that limitation explicitly and block unsupported clearance claims. **Evidence:** the V8 12/12 invariant report omitted rod/crank interference; the later rod probe added bore triangle samples, axial lanes, journal vertices, anchor residual and fillet axes. **Test:** intentionally inject a beam-through-bore, wrong-axis fillet, too-wide lane, out-of-window contact and a non-whitelisted overlap; each must fail. Run full-cycle probes plus before/contact/after crops from two angles. `templates/qa/mechanism-contract.test.mjs` tests budget/contact-policy failure detection only; per-scene geometry/sweep checks remain mandatory and UNVERIFIED until run.

3. **Repeated interfaces share anchors and axes (3.18 evidence + test).**
   Generate ALL repeated mating members from one anchor/axis table, not just the
   first working example. Quartz-watch pads at radius 12.6 missed posts at 13;
   rotating a native CylinderGeometry about Y did not redirect its native Y axis.
   The seconds shaft opposed its hand and the model lacked a physical 60:1 stage.
   Coplanar shaft-cap fans z-fought. Use transformed local axes (quaternion maps
   native Y to the declared axis), common anchors, real through-bores and a single
   end surface or measured axial separation; never hide coplanar caps with depth
   overrides. Derive ratio/direction from the actual connected transmission, not
   only a display hand formula. **Test:** with `templates/mechanism-contract.mjs`
   shared anchors/checkRepeatedInterfaces/checkEndPlanes, enumerate every pad,
   post, bore, cap and shaft; assert count, transformed axis/anchor residual,
   radial/axial clearance and physical ratio/direction across the full cycle.
   The repaired watch measured zero residual at all four pad anchors and 0.08
   board-bore radial clearance; those are historical measurements, not defaults.
   Inject one displaced repeat, wrong native axis, sealed bore, reversed shaft,
   missing reduction and coplanar cap; each relevant check must fail. Review
   section/end-on and oblique crops; scalars cannot prove real mesh openings.
   Evidence: the historical construction report and highlight shots above.

Lesson/UI behavior and its tests are defined once in `Canonical educational UI
and inspection contract`. `templates/education-dock.mjs` remains a dependency-free
state helper with `templates/qa/education-dock.test.mjs`; its older CSS is not the
V8 visual authority.

## Universal Inspection Controls

Copy `templates/orbit.js` for EVERY scene and preset. Create it after camera fit with the fitted target; keep animation evaluation independent of camera interaction. Render on control change even when paused. Expose `orbit.reset()` and have the QA freeze wrapper reset it before capture (`freeze(t)` evaluates time synchronously). User pause/freeze UI need not reset their chosen inspection angle. Fit zoom/polar limits to real subject bounds without preventing back/high inspection. No auto-rotation, no camera motion driven by the animation clock. Keep reset + a brief drag/keyboard hint accessible; educational controls and selection follow `Canonical educational UI and inspection contract`.

## Optional Pixel + Stroke Hybrid

`pixel-stroke` is a third style, not the pixel default, and it is selected through the single `Render Preset Gate` question — never inferred, never switched to later without a new answer. Record the answer and do not offer it again during the build. Rotation is mandatory regardless of the answer.

Copy `templates/pixel-stroke.js` plus `templates/stroked-toon.js`. Create WebGLRenderer with antialias false, alpha true. Use `createPixelStroke(renderer, {width:320,height:200})`, its `toon`/`flat` material factories and `render(scene,camera)`. Resize the low-resolution target explicitly with `look.setSize(bufferW,bufferH)` while sizing the renderer to the display aspect; keep target aspect aligned to viewport/camera. Toon lighting/materials plus selective geometry OutlineEffect render into that target, then ONE nearest-neighbour fullscreen upscale. Do not run PixelPost, Sobel ink, a second outline pass or CSS blur over it. Native-resolution DOM UI is outside the target and must remain crisp.

OutlineEffect thickness is a projected effect parameter, NOT a CSS-pixel width. Rasterisation happens at the low-resolution target: a one-target-pixel contour becomes approximately `displayWidth / targetWidth` CSS pixels after upscale (analogous vertically). A thinner subpixel outline can disappear or flicker; measure target and screen crops at desktop/phone, adjust target resolution and selective material stroke together. Disable outlines for inward cavity surfaces, liquids, films, transparent glass, vapour and contact patches; do not double edges. For native toon, measure the native-DPR render instead. Free orbit, construction, manifest and QA requirements are unchanged.

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
  Keep explicitly requested UI outside the subject, subtle, readable and keyboard-accessible. Narrative builds have no title/readout/card/teaching overlays by default; only discreet necessary controls. A title, hint or live state is opt-in figure furniture, not a requirement of toon rendering and not an excuse to import educational or Anatomy CSS.

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

| Pass | Any-scene requirement | Translate to the subject |
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

## The Look Contract

The ten rules below define the **default pixel preset**, not the optional
stroked-toon preset. Approved stroked-toon builds use the explicit overrides
above; the remaining scene/animation requirements still hold.

1. **Resettable hero angle + free orbit.** Start azimuth 45, elevation 33, fov
   20.5, target just under slab centre. User orbit is enabled in EVERY preset.
   No auto-spin or timeline camera drift. Reset to this pose before frozen QA.
2. **Flat cut-out.** A slab with no plinth, no soil sides, background null, page
   white. Everything below the deck plane hides in the overhang at 33 degrees.
3. **Palette snap.** Every pixel resolves to one entry of a fixed palette. No
   gradients survive; banding is the material.
4. **Ink contour.** A luminance-neighbour edge mixes toward warm near-black at
   about 0.62, suppressed on the outer rim so figures are not haloed.
5. **Dither only where tones move.** Ordered Bayer gated by local edge contrast.
   Flat decks stay flat; ramps stipple.
6. **Contact shadows, not just cast shadows.** A soft radial patch under every
   figure and prop is what anchors it to the ground at this scale.
7. **People read at 30 to 45 px.** Faces need eyes, brows, nose, mouth, ears.
   Bodies need joint fillers so a bend never opens a wedge.
8. **Clipped edge.** The slab is a window, not a stage: four world-space clip
   planes sit on its edges and anything driving in or out is cut at the
   boundary. Nothing ever floats on the white page outside the block.
9. **Everything is a pure function of `t`.** No integration that carries state
   between frames, no `Math.random`, no drift across the loop.
10. **Empty paper (narrative profile only; educational dock and universal orbit controls are exceptions).** The white page carries no DOM title, caption, HUD or
   instructions. Put copy on a modelled sign/screen or in the browser title; a
   label floating on the paper breaks the cut-out.

## The Detail Bar

A blockout with a camera is not a diorama. The difference between a demo and a
diorama is **three passes**, and every hero object has to survive all three.

1. **Silhouette.** At 1:1 the object is recognisable from its outline in about
   0.2 seconds, before colour or detail.
2. **Construction.** The silhouette is explained by visible assemblies: posts,
   rails, bands, plates, wheels, hinges, ropes, fasteners. A single primitive is
   a placeholder, not a prop.
3. **Story.** One detail tells you who used it and what happened: a chipped edge,
   a trophy skull, a repair strap, a spare bolt, a rag, a tally mark, a spent
   shell. If the detail could be removed without changing the read, it is
   greeble, not story.

### Whole-object completeness gates (3.17)

Apply these three gates to every hero object in every profile and render preset,
including educational cutaways. They extend the existing Detail Bar and component
manifest; they do not add cast, story-prop or mesh-count quotas to educational scenes.
Evidence is the user's report of a quartz watch missing its straps and back; no
independent inspection or root-cause diagnosis of that model is claimed here.

1. **Approve the whole-object silhouette, not only the teaching core.** Before
   detail, record whether the commissioned subject is a complete object, a detached
   mechanism or an explicit permanent section; default to the complete named object.
   Reference the entire object and its proportions, not just its most interesting
   subsystem. A complete wristwatch needs its case and both strap/bracelet sides,
   not merely a dial or quartz movement. Simplify small surface detail before
   deleting identity-defining masses. **Evidence:** the reported watch lacked
   straps despite its watch subject. **Test:** compare grey whole-object front,
   side and rear views against recorded references, then review desktop/phone
   delivery frames with the entire silhouette uncropped. Temporarily hide an
   essential silhouette assembly (for the watch, either strap side); the review
   must reject it. A close crop of the core cannot pass this gate.

2. **Construct exterior, rear and attachment chains as real assemblies.** An
   educational explanation of internals does not waive the casing, rear closure,
   mounting or wearable attachments. Inventory every orbit-exposed side and trace
   attachments into their seats/joints. For a strapped watch this includes caseback,
   lugs/spring-bar connections, both strap halves and the reference-appropriate
   buckle/keeper or clasp; do not impose those exact fittings on a different design.
   Keep required construction in the model when an explicit Inside mode reveals
   internals; a label, dark disc or transparency is not a replacement for absent
   geometry. Honour a commissioned permanent section and document its boundaries.
   **Evidence:** the same report named the missing back as well as straps.
   **Test:** review opaque front/rear/side/high orbit crops and attachment-seat
   close-ups; inspect mesh/group mappings and actual contact/clearance at joints.
   Exercise cold load → Inside on/off (if present) → Reset to check restoration.
   Hide the rear closure or disconnect an attachment in a test copy; the matching
   presence/connection check and visual review must reject it. Existing motion and
   non-penetration tests still apply; presence alone does not prove sound mechanics.

3. **Close an explicit completeness matrix before claiming completion.** Fill
   the matching DESIGN sheet before modelling and reconcile it against the built
   scene before delivery. Give each expected silhouette, exterior/rear, attachment
   and functional/internal assembly a stable ID, reference or stated assumption,
   required/simplified/omitted status with scope rationale, mesh/group mapping,
   connection and proof view plus actual test result. An omission note alone cannot
   waive an essential part of the commissioned whole object; build it or obtain an
   explicit scope change. **Evidence:** the reported missing straps/back show why
   subsystem detail cannot stand in for whole-object coverage. **Test:** reconcile
   every expected row with nonempty live geometry and reviewed proof; check that
   the inventory itself covers the whole reference, not just existing meshes.
   Deliberately remove a required row's mesh, leave its proof blank, and add an
   unexplained omission in test copies; each must fail the audit. Store commands,
   results and proof paths in `qa/report.json`. Missing evidence is UNVERIFIED,
   a missing required assembly is FAIL, and either blocks a completeness pass.
   This matrix makes omissions reviewable; it is not automatic certification or
   a guarantee that future agents will comply.

The numbers below are **reference density** from The Hollow Toll, a 21 x 14 m
slab with four towers, two gate guns, five species, 42 units, one boss, 527
events and 183 shots. Treat them as a calibration target, not a cap.

| Element | Minimum visible assemblies | Hero target | Required story detail |
| --- | --- | --- | --- |
| Tower | 6 | 25 to 45 parts | crew, ammo, livery, wear |
| Creature | 8 | 12 to 20 parts; boss 40 to 60 | gear, scar, trophy |
| Prop | 5 | 8 to 15 parts | contents, tool, repair, rag |
| Landmark | 8 | 30 to 60 parts | one unmistakable silhouette |
| Death | 3 stages | 5 to 8 pieces + stain + soul | species-specific debris |
| Environment | 3 scale cues, 3 story props | 2 ambient loops | a before/after trace |

In a social diorama, read the Death row as **Exit**: a role-specific departure
(turn, walk out, shutter down) with the prop and no debris. The five layers are
unchanged; the residue is the changed place, not a stain.

**An object can hold two roles.** A lighthouse that is also a beam tower gets
the landmark budget for its structure **plus** the machine's moving parts; list
both rows in the design sheet. A boss weapon is a separate group: budget 8 to 12
parts for the weapon on top of the body, and say so, or the body will be blamed
for a thin haft.

**Primitive discipline.** No naked box, sphere or cylinder at hero scale. A box
gets a chamfer, a frame, plank divisions or a band. A sphere becomes a skull,
bale, sack or head with a snout, ties or a neck. A cylinder gets a foot, cap,
taper or iron rings. If a shape is still a primitive after the detail pass, it
will read as a rock, a blob or a placeholder at 30 to 45 px.

**Two to four palette entries per object, plus one accent.** More entries
turns into noise after the palette snap; fewer turns into a silhouette cut-out.
Use value contrast for construction and hue for story.

**Detail lives on every orbit-exposed surface.** All presets need coherent backs,
construction, attachments and cavities; a fixed hero shot is not permission to
omit parts. Hidden internals may be simplified only if outside the mechanism manifest. Do not add detail
under about 1.5 screen pixels at the delivery view: it aliases into speckle, not craft.

**Every prop must touch the ground.** Feet, wheels, a base, a contact shadow, a
stain. A prop hovering by two centimetres is the single most common "it looks
cheap" report. Check the shadow and the lowest vertex, not the group origin.

**Every landmark must be the only one of its silhouette.** Two skull trees, two
red tents or two identical towers read as duplication, not composition. Move,
scale or redesign the second one. Check overlap by projecting both bounding
boxes to screen: if they merge into one blob, one is invisible detail.

**Clear thresholds.** Keep at least 2 m of empty ground in front of a gate,
portal, spawn mouth or door. No crates, barrels, boulders, bones, vines or
rising smoke in that pocket. A grey billboard above an arch reads as a rock
flying out of the entrance even when it is transparent.

## The Animation Bar

An actor is animated when it has all five of these, not just a walk cycle:

1. **Idle / ambient.** Breathing, sway, scan, flame, flag, wing settle. Two
   loops minimum in the environment.
2. **Locomotion.** Distance-driven walk, run, hop, flap or slither, with feet
   planted and joints filled.
3. **Action.** A readable wind-up, contact and recovery: fire, swing, slam,
   dive, throw, open, build.
4. **Reaction.** A directional flinch, hit flash, knockback, stagger or squash
   that recovers to the same pose.
5. **Exit / consequence.** In a combat diorama, a body-specific collapse plus
   debris, dropped gear, a ground stain and a brief residue — never a generic
   sphere burst. In a social diorama, the equivalent is a role-specific exit:
   turn, walk out with the bag, close the shutter, or sit back down. The scene
   must show that the actor changed the place.

Background actors need 1, 2 and 5. Hero actors need all five. A tower is an
actor too: idle hum, aim, fire, recoil, reload. A service actor's action is
order/pay/receive, its reaction is a look-up or step-back, and its exit is the
walk-out with the prop. A prop with a moving part (door, flag, wheel, pulley,
cauldron) needs its own loop.

**Motion is data.** Author beats as absolute times or travel distances, then
read them at `t`. Do not hide a state machine inside render-frame conditionals;
it will pop on a seek, drift on a loop, and be impossible to screenshot.

**Nothing at hero scale is static.** A tower that spawns a projectile from its
centre without recoil, a boss that stands at a door without touching it, a
creature that slides without a step: all read as unfinished, even with good
geometry.

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

## Pipeline

Each step ends in something you can look at. Settle the render preset through the
`Render Preset Gate` before step 1 — one question at project start, not a mid-build
decision. In a confirmed `stroked-toon` or `pixel-stroke` build, steps 1–4 use the
authored colour family, fitted long-lens camera, toon lighting and
`templates/stroked-toon.js` recipe instead of pixel snap/dither/Sobel post. Steps
5–10 still apply; use preset-aware QA.

1. **Palette first.** The palette array in `palette.js` plus a named `C` map.
   Every material samples a palette hex, nothing else. Done when a grep for
   colour literals in `materials.js` finds only palette names.
2. **Frame the slab.** Camera constants from `templates/camera.js`, slab sized so
   its projected diamond leaves a margin. Done when a grey slab shot has roughly
   25 to 40 percent white around it at `subjectScale: 1.0`; for a smaller subject,
   apply `subjectScale` after the fit and expect more paper, not a smaller set.
3. **Light it.** Sun plus low hemisphere for daylight; the **Night, Practicals
   And Headlights** rig for a night scene. Tighten the shadow camera to the slab
   and call `updateProjectionMatrix()` after changing the frustum. Done when every
   figure has a readable contact shadow (crisp by day, a soft pool by night).
4. **Post pass.** `templates/post.js`: gamma, grade, ink, gated dither, palette
   snap, rim dither. Done when a 1:1 crop shows square pixels and a dark contour,
   and flat pavement shows no speckle.
5. **Props.** Start with flat-colour boxes and lathes, coarse detail and no
   textures hiding weak geometry. This is the initial silhouette pass, not the
   finished detail target. Done when the 1:1 crop reads the object without colour;
   step 7 adds construction and story. Approved toon may then add restrained
   decals or grain as described in its recipe.
6. **Cast.** `templates/peopleModel.js` (base) or `templates/peopleModel-street.js`
   (clothed) rig, one entry per figure with a base pose. Done when isolated portraits show no gaps, no floating parts, knees
   bending the right way.
7. **Detail pass.** Apply the Detail Bar to every hero object: construction
   layers, attachment, story detail, contact shadow. Done when the object meets
   its row's minimum (5 prop, 6 tower, 8 creature, 8 landmark), has one
   asymmetry and one story detail. "Three assemblies" is a blockout; it is not
   a pass. Do not animate a placeholder.
8. **Animation and systems.** Locomotion, idle, tower/machine actions, reactions,
   exits/deaths, goal contact, crowd variation. Done when each hero actor has all five
   animation layers and each tower has acquire/fire/impact/recovery.
9. **Effects.** Contact shadows, smoke, splash, spill light, debris. Done when the
   effect is visible but never the subject.
10. **QA.** Detail and animation audit, `qa/audit.mjs` for seams/glows/fades,
    camera/render scale, exits and emitters, desktop/iPad/phone, `file://` standalone,
    zero page errors, motion and camera proven from numbers and strips. See
    Verification.

## New Subject Intake

A new subject is not a new pile of props. Before modelling, fill this sheet.
Copy `templates/DESIGN.md` into the project and keep it in sync with the code.

```
PREMISE
  [place] + [a repeated verb/ritual] + [who or what interrupts it] + [payoff].
  One sentence. If it has no verb, it is a shelf model, not a diorama.

CAMERA SIDE
  Which face is +Z? Where is the threshold, the hero tower, the foreground prop?
  Which silhouette must never be occluded from this angle?

CAST SHEET
  role | silhouette feature | locomotion | action | reaction | exit/death | signature
  ...

SYSTEM SHEET
  loop length | three or four systems | crew | three or four visitor roles |
  goal/disruption (optional) | economy/score (optional) | what changes

BEAT SHEET (absolute seconds)
  0.0  establish / portal / doors
  ...  first signal, first system output, first consequence
  ...  disruption reaches the goal (or the last customer arrives)
  ...  contact / handoff / finale, residue, loop seam

DETAIL BUDGET
  systems n x parts | vehicles n | creatures/people n | props n | landmark n |
  exits/deaths n | ambient loops n | triangle / draw-call ceiling
```

Rules that keep a new subject from becoming a blockout:

- **Invent the conflict.** If the user says "a diorama of a lighthouse", decide
  what the lighthouse does, who arrives, what goes wrong, and what the keeper
  does about it. A subject plus a verb is a diorama.
- **Give every machine an operator.** If a tower, loom or pump needs a crew,
  model the crew and decide what happens when they die: the machine slows, stops,
  or runs unmanned with a visible consequence. A gun that fires itself while its
  crew lies dead is a ghost. If the machine is autonomous, say so in the sheet.
- **Choose five signature moments before modelling.** Establish, first system
  output, first consequence, goal/handoff contact, final residue. A social diorama
  may use establish, ritual, disruption, handoff, residue. Every object earns its
  place by serving one of those five.
- **Stage for the hero camera.** Put the threshold and the hero action on the
  +Z face; put tall landmarks at the back but offset in screen x so they do not
  stack. Put one foreground prop at the near corner for depth and one mid-ground
  prop to lead the eye.
- **Blockout in grey first.** Boxes, cylinders and the camera, no palette, no
  post. Shoot 1:1. If the five moments do not read in grey, detail will not save
  them. Redesign the staging, not the textures.
- **Name every hero object.** `totem`, `hayCart`, `gatehouse`, `troll`, not
  `prop12`. Unnamed objects become clutter because nobody owns their silhouette.
- **One boss goal, one tower verb.** The boss must visibly act on a place
  (door, bridge, pump, nest); the tower must visibly act on a target (pierce,
  blast, freeze, chain). Repeat the verbs with variation, not new nouns.
- **Write the QA timestamps now.** Pick the five frames you will inspect before
  you build them. If you cannot name a timestamp for a beat, it is not staged.

### Reference Density

The Hollow Toll shipped at this density. Use it to calibrate a new subject; a
smaller subject should have fewer objects at the same detail per object, not
fewer details per object.

| Measure | Value |
| --- | --- |
| Slab | 21 x 14 x 0.42 m, 64-colour palette |
| Towers | 4 + 2 gate cannons |
| Species | 5 (goblin, orc, slime + split, bat/imp, troll) |
| Units | 42, one boss |
| Combat events | 527 |
| Tower shots | 183 |
| Scene meshes | ~3,100 |
| Triangles | ~164,000 |
| Scene draw calls | ~1,700 at 1440 x 900 |
| Textures | 5 |
| Loop / sim | 46.0 s at 40 Hz pre-sim |
| Standalone | ~783 kB with three.js inlined |

A 12 x 9 m scene with two towers and three species should land around
1,000 to 1,600 meshes and 60 to 100k triangles. Raw count is not the goal;
the detail per hero object and the number of readable beats are.

### Worked Example: The Hollow Toll

This is the reference build the numbers above come from. Read it as a calibration
of **what "finished" looks like**, not as a scene to copy.

- **Set.** A 21 x 14 m slab, purple portal at the back-left, winding road, goblin
  camp, moat and drawbridge, gatehouse at the near-right. Four towers and two
  gate swivels; keep gate faces +Z.
- **Cast.** 14 goblins, 4 orcs, 7 slimes plus 10 split slimelets, 6 imps and one
  Toll-Troll: 42 units, 5 death grammars, one boss goal.
- **System.** 46 s loop at 40 Hz, 527 events, 183 shots. Ballista single target,
  bombard splash, frost lance channel, tesla chain, gate swivels on the last
  stretch. The troll reaches the gate at 38.6 s and hits it eight times.
- **Detail.** The gatehouse has a plinth, two towers, crenellations, a gate arch,
  door leaves with cracks, two swivel cannons, banners and torches. The skull
  warning tree has a trunk, fork, trophy board, horned skull, rope collar, bone
  chimes, rags, tally marks and roots. The hay cart has a bed, slats, two spoked
  wheels with iron tyres, corner straps, three tied bales, loose straw, a
  pitchfork, a sack, a rag and two shafts.
- **Animation.** The frost spire pulses, flares at the crystal, holds a scrolling
  band lance, ramps heat, and shuts off on the target's death. The troll stops
  outside the threshold, turns three-quarter, swings an iron-banded maul, and
  drives the door flash, shake and cracks from the same gate-hit timestamp.
  Every species has its own collapse and debris.

Fixes that became rules in this file:

| Report | Root cause | Rule |
| --- | --- | --- |
| "rocks flying out of the entrance" | camp smoke billboards above the portal | clear the threshold of smoke, props and fireflies |
| troll inside the gatehouse | stop at `length - 1.05`, body through wall | stop at body depth + weapon reach; keep the door visible |
| club looked like a rock | end-on pose, haft hidden, no bands | yaw 0.35 rad, build haft + bands + studs, sync contact |
| beam had a black segment | black backing plate in the additive beam texture | clear the canvas; transparent gaps, never black |
| deaths were spheres/rocks | generic burst | species collapse + debris + dropped gear + residue |
| skull tree looked like a monster | a second totem overlapped the tree | one landmark per silhouette; mount the skull on a board |
| cart looked like a blob | pale spheres in an open box | five-part prop: bed, slats, wheels, load, tools, story |
| standalone broke over `file://` | `String.replace` expanded `$&` in the bundle | function replacer; test the standalone |

A new subject should copy the **density and audit discipline**, not these nouns.
A lighthouse, market or launch pad needs the same number of readable systems,
the same five animation layers and the same proof frames.

### Worked Example: Night Market

The social-scene calibration: no combat, no boss, no deaths. A food truck, a
queue, a courier, one scooter and a cat. It proves the same discipline applies to
a life scene.

- **Set.** 21 x 14 x 0.42 slab; truck at (0.15, -3.35) with the hatch facing +Z;
  counter at z 1.10; parked scooter at (5.55, -0.72) facing +Z; bench, rail,
  lamps, bins, service block behind. Camera azimuth 45, elevation 33, fov 20.5,
  fill 0.93.
- **Cast.** Cook, cashier, customers A/B/C, courier, late customer D, cat. The cat
  is an actor with its own idle, walk, sit and tail loop, not set dressing.
- **Systems.** Grill flare, order rail, bag pass, scooter dispatch. Four readable
  systems, no towers.
- **Loop.** 46 s at 40 Hz. Queue forms 0–16 s; four paper bags + one insulated
  bag; courier loads 21.2–22.5, mounts 22.7–23.5, departs 23.5–27.3; D arrives
  26.0–33.4, last bag 34.0, exits 34.8; quiet seam 40–46.
- **Scale.** The user asked for 30% smaller. The fix was `subjectScale: 0.70`
  after the fit (`distance = fit / 0.70`), not scaling the slab, cast or canvas;
  geometry scaling breaks the world clip and shadow maps, and shrinking the
  canvas breaks the 1:1 crops. Backing buffer 2x CSS for the faces, CSS
  downscale.
- **Proof.** Nine 1280x800 frames plus two close strips: courier mount, D walk.
  The strip camera was a fixed side view, not the hero camera.

Fixes that became rules in this file:

| Report | Root cause | Rule |
| --- | --- | --- |
| "the building bottom/right is cut" | slab edge/backdrop closed too tight | close side walls and undersides; camera fit includes the slab corners |
| "bike lights look unnatural" | large additive disc | emissive lens + small halo; cone only at night |
| "doesn't put the box on the bike" | prop teleported from hands to crate | carry in world space from wrists; lower over the rim; release with a beat |
| "doesn't sit on the bike naturally" | car seat/root constants reused | measure scooter seat; board for the left boot; abduction swing; bars to hands |
| "the human/cat doesn't look human" | sphere head, cap at theta 1.85 | skull+jaw head, hair cap 1.22, ears/brow/lids, tapered limbs |
| "carry the bags more human-like" | prop at root, hands nearby | two-hand hold at the prop's top, object origin at its bottom |
| "no text outside the diorama" | DOM overlay on the paper | empty-paper rule; copy on modelled signs only |
| "30% smaller" | scaling the scene | move the camera; keep world clipping and shadow scale |
| "leg swings over the handlebar" | hip X flexion for a side mount | abduct with hip Z; knee tucked; root arc 0.1–0.2 m |
| "single human slides near the shop" | standing gesture blended during walk | gate gestures on `!state.moving`; serve after arrival |

A new subject should copy the **timing discipline and contact logs**, not the
food truck. A pool, a station or a bakery needs the same queue/service,
carry/load and close-up proof.

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

## Scene Furniture

- **Slab** 21 x 14 x 0.42 with the street on the camera side (+Z) and the
  building block at the back (-Z) for an exterior. For an interior cutaway, see
  **Cutaways And Glass** before placing the street. Deck at y 0 is the street;
  the pavement is a raised 0.16 slab with a kerb face.
- **Pavement joints** 2.6 m apart, 0.085 m wide. Anything thinner rasterises to
  dots that read as noise. `groundY(x,z)` returns street, pavement or step height
  so every track and shadow samples the same function.
- **Buildings** are boxes with a parapet, a sign band, recessed windows and a
  door pivot. At 33 degrees you look down onto roofs: a 4.6 m wall in front of a
  5.2 m deep building hides none of its roof, so model the parapet, plant,
  skylight or stair head, or keep it lower than it is tall.
- **Doors** are pivots at the jamb with the leaf extending into the opening.
  Recess them 0.15 so the opening shows a shadow gap, and light the interior so
  an open door reads as a room, not a hole.
- **Contact shadows** are one unlit radial-gradient plane per figure, opacity
  0.55 to 0.95, scaled to the footprint, 0.018 above the ground it belongs to.

### Night, Practicals And Headlights

Night is a new light ratio and a new palette, not the day rig dimmed. The sun
table is a daylight default; a 2am scene needs its own numbers and its own test.

| Key | Night default | Why |
| --- | --- | --- |
| moon / key | `0x93a7c4` at 0.45 to 0.65 | cool, low, soft shadows |
| hemisphere | sky `0x1b2740`, ground `0x090b12`, 0.16 | blue ambient, never black |
| fill | `0x6d7f9e` at 0.10 to 0.16 | keeps the shadow side readable |
| practical | `0xffb066` at 1.0 to 1.4 | warm bulb/lamp, 2700 K |
| pool | unlit radial plane, opacity 0.28 to 0.45 | light on the ground, cheap |
| headlight | `0xfff0c8`, lens + cone + floor ellipse | source, throw and landing |

- **A practical is an object, not a glow.** Bulb sphere, shade/guard, bracket,
  emissive lens, small halo, and a pool on the surface below. A floating halo with
  no fixture reads as a firefly.
- **Use one real point light at the hero practical**, not one per bulb. The rest
  are emissive + pool decals. Ten point lights flatten the darks and cost more
  than they return.
- **Keep three dark values.** Deep shadow, mid shadow and lit edge must be
  different palette entries; if the night is one black silhouette, lift the
  hemisphere or add a cool rim. `0x000000` is forbidden, as in daylight.
- **Headlights are a moving pool, not a global spotlight.** Two lenses, two
  tapered cones, one elongated floor ellipse that travels with the vehicle.
  Do not let the cone light the whole facade: it will read as dawn.
- **Windows are dark glass with a warm interior.** A blue-grey pane, two
  reflection streaks, and a visible warm room behind it. A fully transparent
  plane tints the whole interior and kills the cutaway.
- **Grade for night after the snap:** lift black to about `0x0b1020`, keep warm
  highlights from clipping. Test a 1:1 crop: three dark values, a visible source,
  a readable pool, no white blob.

A night scene passes when the unlit areas still have shape and the light sources
are in the frame. "It is dark" is not a pass.

### Cutaways And Glass

The +Z street convention is for an **exterior**. If the hero action is inside a
shop and the street is between the camera and the hero, the bus/traffic will
occlude the beat. Choose one:

- **Exterior scene:** street on +Z, facade behind it, action on the pavement.
- **Interior cutaway:** omit the camera-side wall entirely (or keep a 0.25 m
  header and sill), put the street **behind** the room at -Z behind glazing, and
  keep the camera-side floor open. The room is the stage; the street is the
  cyclorama.
- **Foreground traffic:** allowed only if it crosses before or after the hero's
  contact beat; check the occlusion frame, not just the still.

For glazing, build the frame, mullions, sill and a few reflection streaks. Do not
lay one transparent plane across the opening: it tints the interior, hides the
practical lights and turns the cutaway into a fish tank. If the bus must read
through the glass, give it lit windows and a dark body against the warm interior;
do not brighten the whole room to compensate.

## Detail Recipes

Detail is a hierarchy, not a texture. Build in this order and stop adding when
the silhouette is explained.

### The Five-Part Prop

Every readable prop answers five questions with geometry:

1. **What touches the ground?** Feet, skids, wheels, a stone base, roots. Add a
   contact shadow at 0.018 above the deck.
2. **What holds it up?** Posts, frame, legs, axle, brace. This is the
   construction layer and it must be visible from the camera.
3. **What is its working surface?** Planks, slats, a lid, a blade, a trough, a
   table. Divide it into pieces; a single slab reads as a box.
4. **What attaches the parts?** Rope, iron straps, nails, hinges, lashings,
   rivets. Two or three are enough; a row of identical studs is noise.
5. **What is the story?** Contents, a tool, a repair, a trophy, a rag, wear on
   the edge that is used. One or two, placed where the camera sees them.

A hay cart from the reference build: bed, six side slats, two spoked wheels with
iron tyres, four corner straps, three tied bales, loose straw, pitchfork, sack,
red rag, two draft shafts. That is ten assemblies for a prop the user sees for
two seconds. A crate with a pale sphere inside is none of them.

### Tower Anatomy

A defence tower is a small building, a machine and a crew in one silhouette.

| Layer | What it adds | Failure if missing |
| --- | --- | --- |
| 1 foundation | plinth, steps, rubble, contact | tower floats or looks pasted on |
| 2 shaft | taper, buttresses, bands, ladder | reads as a cylinder |
| 3 platform | deck, rail, hatch, brackets | machine has nowhere to stand |
| 4 machine | weapon, pivot, rail, recoil travel | attack has no origin |
| 5 crew | gunner, cranks, spotter, ammo | tower feels automated/empty |
| 6 livery | banner, number, pennant, paint | tower has no owner |
| 7 wear | scorch, chips, rope, spent cases | tower looks unplaced |

The animation pivot belongs to layer 4. The muzzle or launch point belongs to
the weapon, never the tower centre. Recoil travel is 0.1 to 0.25 m for a ballista
or cannon, 0.02 to 0.06 for a beam crystal. A tower with no recoil, no crew and
no ammo is a monument.

**A hollow object must show its opening.** A cannon with a solid brass cap is a
baton, not a gun; the same failure turns a pipe into a rod, a chimney into a
post, a lamp into a mushroom and a tunnel into a painted arch. Build the opening
as geometry, not a dark decal:

- replace the end cap with one or two **open-ended collars** (no front face);
- add a recessed **dark bore tube**, open at the mouth, with its inner wall
  visible (`DoubleSide` on a cloned material, never on the shared palette
  material);
- close the back with a **dark disc** so the barrel interior is not see-through;
- add an **iron inner lip ring** and a **brass outer lip ring** so the edge
  catches the light at 1:1;
- put the muzzle/effect origin at the lip, not inside the bore.

At 1:1 the opening needs a dark centre at least 5 to 6 px across and a lit lip.
If the centre is brass, the hole failed.

**A rotating assembly owns only its moving parts.** The yaw/turret group may
contain the carriage, barrel, recoil slide and muzzle. Fixed stores — powder
keg, shot pile, rammer, tools, ready rack, crew — belong to a static group on the
tower root, never the yaw group. If they are children of the yaw group they sweep
around the tower when it tracks a target, which reads as the whole gun deck
rotating.

Do not simply reparent the props at deck height: the barrel and carriage sweep
through that volume at some yaw. Put them outside both the yaw sweep and the
barrel's vertical arc. If the deck has no clear sector, bolt a ready locker to
the outer wall below the deck: shelf, two iron brackets, powder chest with corner
straps, shot tray, and a rammer hung on two hooks. It reads as part of the tower
and never collides.

Test two ways at minimum and maximum yaw: each fixed child's world position
delta must be 0, and each fixed mesh's world bounding box must not intersect any
mesh under the yaw group. Both checks pass, or the station is still in the arc.

Worked example, Bombard Bastion: 17 fixed parts — shelf, two iron brackets,
powder chest, lid, two corner straps, rope handle, shot tray, tray lip, three
iron shot, rammer shaft, iron cap and two wall hooks. It sits at y 1.1 to 1.6 on
the outer shaft, below the deck and outside the barrel arc. At both yaw extremes
all 17 world positions are identical and the station has zero bounding-box hits
against the yaw group.

### Creature Anatomy

A creature needs a silhouette feature before it needs a face.

1. **Core mass.** One dominant volume: hunched torso, round slime, long bat.
2. **Silhouette feature.** Horns, ears, hump, wings, tail, crest, antlers. This
   is what the user recognises at 30 px.
3. **Face.** Two eyes, brow, jaw or beak. Eye sockets must be dark and set in,
   not painted on the surface.
4. **Limbs.** Joint groups with fillers; hands and feet larger than anatomy
   suggests, or they disappear at this scale.
5. **Gear.** One weapon, one strap, one trophy. Not a full armour set.
6. **Colour break.** One hue for skin, one for cloth, one metal accent.
7. **Asymmetry.** A chipped horn, a single pauldron, a dragging club. Perfect
   symmetry reads as a toy soldier.

The boss gets 40 to 60 parts and one signature weapon. Build the weapon as a
separate group with a haft, head, bands, studs or spikes, and a hand attachment.
A stone head with no haft reads as a rock floating at the door.

### Small Quadrupeds (Cats, Dogs)

A cat is not a small human on all fours. Build a horizontal spine and four
contact legs; the silhouette is the back line, ears and tail.

- **Body:** chest sphere r 0.085 at y 0.24, belly capsule 0.24 long, hip sphere
  r 0.080. Shoulder height 0.26, nose-to-tail base 0.46. A cat at human scale is
  about 0.25 m at the shoulder; measure, do not scale a person by 0.2.
- **Head:** skull r 0.075, muzzle 0.045 forward, jaw, nose, two triangular ears
  (cones or three-vertex prisms) at the top corners. Eyes face forward with a
  dark socket and a vertical pupil; at 30 px the ears and pupils carry the read.
- **Legs:** four chains (upper 0.10, lower 0.11, paw 0.05). Front legs are
  straighter; rear legs have a hock that bends backward. Paws land flat, toes
  forward. Do not use the human knee sign for a hock.
- **Tail:** four to six segments with a slow S-curve, root at the sacrum. It
  counter-sways against the walk and curls when sitting; a rigid stick tail is
  the fastest way to lose the animal.
- **Walk:** lateral-sequence four-beat, phase offsets roughly LF 0, RH 0.25,
  RF 0.5, LH 0.75. The spine dips and rises twice per cycle; the head stays
  level. Drive phase from distance travelled, like the bipeds.
- **Sit:** haunches down, rear hocks folded, front legs straight, chest up, tail
  curled around the paws. A sitting cat is a triangle, not a crouched person.
- **Jump:** crouch (hips down, spine compressed), extend (all four legs push),
  airborne (legs tucked, tail up), land (front paws first, then rear). Two
  seconds of anticipation and recovery, not a linear hop.
- **Fur:** one base colour, a lighter chest/muzzle, darker ears/tail tip and two
  or three stripe bands. Do not model individual hairs; the palette snap eats
  them. Contact shadow is one stretched ellipse under the body, not four paw
  blobs.

Shoot the cat at 1:1 in profile, three-quarter and sitting. If it reads as a
rabbit, the ears are too long; if it reads as a dog, the muzzle is too broad and
the back line too straight. No gear, no trophy, no human jacket.

### Environment Anatomy

- **Three scale cues.** One small (grass, bones, cobbles), one human (cart,
  barrel, spear), one tall (tower, tree, gate). Without all three the slab has
  no scale.
- **Three story props.** A camp, a repair, a warning, a toll, a shrine. Place
  them off the main path but inside the camera cone.
- **Two ambient loops.** Fire, flag, smoke, fireflies, grass, water, hanging
  bones. Phase them differently; synchronized loops read as a screensaver.
- **A path with a memory.** Ruts, footprints, dropped goods, a worn threshold.
  A clean path is a diagram.
- **A boundary treatment.** Trees, rocks, posts or a wall that explains why the
  slab ends. Do not let props clutter the threshold.

### Detail Audit At 1:1

Before the animation pass, inspect each hero object at 1:1 and answer:

- Can I name its three construction layers without guessing?
- Does it cast a contact shadow and touch the ground?
- Is there one asymmetry or story detail I can point to?
- Does it overlap another object of the same silhouette?
- Is any detail under 1.5 px, and therefore speckle?
- Does every hollow object — cannon, pipe, chimney, lamp, tunnel — show a real
  opening, or does it end in a cap?
- Does it read in grey, without colour?

If any answer is no, fix the object before animating it. Animation multiplies
detail; it does not create it.

## The Cast

A 1.69 m figure built from primitives, with an anatomical group per joint so
limbs overlap when they bend. Faces +Z.

| Constant | Value | Notes |
| --- | --- | --- |
| hipY | 0.86 | pelvis group height above the root |
| hipX | 0.10 | half stance width |
| thigh | 0.42 | hip to knee |
| shin | 0.40 | knee to ankle |
| shoulderY | 0.415 | above the pelvis |
| shoulderX | 0.182 | half shoulder width |
| upperArm | 0.30 | shoulder to elbow |
| foreArm | 0.27 | elbow to wrist |
| headY | 0.584 | neck to head group |

The base swimwear rig uses two spheres (cranium 0.115, jaw 0.089) plus a nose
box. For a clothed cast, replace that with the skull/jaw/cheek head below. Torso
and pelvis are lathes (0.135→0.198 and 0.105→0.180), flattened 0.72 in Z so the
body is an oval, not a tube.

Construction rules:

1. Build joint groups at the pivot, hang geometry **down (-Y)** from them, so a
   rotation is an anatomical rotation.
2. Every joint gets a sphere filler just inside the limb radius. Without it a 90
   degree bend shows a wedge-shaped hole.
3. Limbs are capsules; torso and pelvis are lathes for a tapered silhouette.
4. Clothing is layered over the body as its own lathe slightly larger than the
   pelvis or torso, plus a band cylinder at the waist or chest.
5. Never parent a part to a group that has not been created yet in the function
   body: straps added before the torso exists throw on load.

Pose API: `setPose(person, pose)`, `easePose(p, pose, 1-exp(-22*dt))`,
`blendPose(a, b)` (component-wise add). Angles are `[x,y,z]` radians per joint:
`torso, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R`,
optional `pelvis`.

**Sign conventions, get these right once:**

- Facing +Z. Positive hip X swings the thigh **backward**; negative forward.
- Positive knee X bends the heel **backward**. Negative hyperextends and reads as
  a broken leg. This single sign error is the most common "the walk is broken".
- Positive shoulder X swings the arm backward, negative forward.
- Negative elbow X folds the forearm toward the face.
- Positive shoulder Z abducts an arm away from the body; mirror the sign.

Detail that pays, in order: the skull/jaw head in **Clothed Cast** (hair cap
theta 1.22, eyes at ±0.037, 0.110, 0.101); cap as a crown cylinder, band and
brim; brow and lid creases; a narrow nose bridge; a three-layer mouth; ears as
flattened spheres; hands as a palm plus a finger block and thumb; feet with a toe
box. Fingers, nostrils and micro-seams do not survive 30 px.

Balaclava: one sphere shell over cranium and jaw (r 0.134, scale 1.0/1.10/0.99)
plus a neck gaiter cylinder running into the collar. A cover cut at the equator
leaves a band of skin under the hem that reads as a bare head, and eye openings
tucked under the shell disappear: put pale lids a few millimetres proud of it. A
darker skin material is `skin.clone()` with `color.multiplyScalar(0.86)`.

### Clothed Cast: Heads, Layers, Hands

The skeleton is shared; the person is made by the head, the garment silhouette
and the hand contact. For a clothed cast, start from
`templates/peopleModel-street.js`; `templates/peopleModel.js` remains the
swimwear/aquatic variant.

**Head.** A skull plus a jaw, not two stacked balls.

- Cranium: sphere r 0.100 at y 0.118, scale [0.98, 1.16, 0.98]. Jaw: r 0.079
  at y 0.054, scale [0.78, 0.80, 0.86]; chin r 0.029 at y 0.029, z 0.079.
- Ears: flattened spheres at x ±0.098, y 0.101, with a darker inner bowl. They
  are what makes the head read in profile.
- Eyes: a shade socket, a dark iris r 0.0145 scaled flat, a pale catchlight.
  Brow above, lid crease below, cheek plane under that. At 30 px the socket and
  brow carry the expression; the iris just anchors the look.
- Nose: a narrow bridge box plus a tip sphere, 0.022 wide. A single box reads as
  a beak from three-quarter.
- Mouth: upper lip in shade, dark seam, lower lip in skin. Three thin layers at
  most; a wide box reads as a letterbox.
- Hair: a sphere cap with `thetaLength` 1.22, positioned at y 0.132 and stopping
  at the hairline. A 1.85 cap swallows the forehead and reads as a helmet. Add a
  back mass, sideburns, and for a bun a high sphere at y 0.204. Under a hat show
  a nape tuft; under a full helmet show none.
- Hats are their own silhouette: beanie (dome + rolled torus + pom), cap (crown
  + brim + band), bandana (cap + knot + tail), helmet (shell + visor + chin
  strap + reflective bands). Never draw hair through a helmet or a cap.

**Clothing is geometry, not paint.**

- Base body: torso lathe 0.135→0.198, pelvis lathe 0.105→0.180, flattened 0.72
  in Z.
- Garment: a second lathe 4 to 12% larger (`topK` 1.0 tee, 1.05 jacket, 1.12
  puffer), plus a hem/waistband cylinder. The garment must have a thickness step
  at the cuff, collar and hem or it reads as body paint.
- Sleeves: short sleeve ends above the elbow with a cuff ring; long sleeve is a
  second lathe down the forearm with a ribbed cuff. Do not texture a bare arm and
  call it a sleeve.
- Trousers: tapered lathes over thigh and shin with a cuff at the ankle and a
  break over the shoe. Loose trousers get a wider profile and a deeper cuff, not
  a scaled leg.
- Outerwear: jacket shell + zip/lapel/hem; puffer gets 3 horizontal quilt bands;
  hoodie gets a kangaroo pocket and drawstrings; apron is a front panel with a
  bib, waist ties and a towel, never a full cylinder around the body.
- Backpack sits behind the torso with two shoulder straps that cross the front;
  a bag floating at the spine reads as a growth.
- High-vis, reflective bands and lanyards are thin boxes proud of the cloth,
  following the body curve at 2 to 4 mm.

**Hands are the contact proof.** Palm box 0.070 x 0.078 x 0.054, a finger block
with two grooves and a thumb capsule. A glove is the same geometry in glove
material, with a cuff. When a hand holds something, the palm and finger block
must touch it; a wrist near a handle is not a hold.

If the head or the clothing is wrong, fix it before the walk. A good gait cannot
rescue a sphere head or a painted jacket.

## Animation

Every motion is a pure function of `t` or of a distance along a track.

```js
const swing = Math.sin(phase), cs = Math.cos(phase);
const kneeL = 0.05 + 0.46*Math.max(0,-cs) + 0.22*Math.max(0, swing);
const kneeR = 0.05 + 0.46*Math.max(0, cs) + 0.22*Math.max(0,-swing);
pose = {
  torso: [lean, swing*0.05, 0],
  shoulderL: [-swing*arm, 0, -0.09], shoulderR: [swing*arm, 0, 0.09],
  elbowL: [-0.16 - Math.max(0, swing)*0.28, 0, 0],
  elbowR: [-0.16 - Math.max(0,-swing)*0.28, 0, 0],
  hipL: [swing*amp, 0, 0.03], hipR: [-swing*amp, 0, -0.03],
  kneeL: [kneeL,0,0], kneeR: [kneeR,0,0],
  ankleL: [-kneeL*0.32,0,0], ankleR: [-kneeR*0.32,0,0],
};
```

- Hips above ±0.35 read as a march; 0.30 to 0.34 is a walk, 0.5+ is a run with
  lean 0.26 and elbows near -0.75.
- Match travel to stride or feet skate: `footTravel = 2*legLength*sin(amp)`,
  `speed = footTravel * phaseRate / PI`. A 0.86 leg at 0.34 rad and 5.2 rad/s is
  about 0.9 m/s. Drive `phase` from distance travelled, not from time, and the
  walk always matches the path.
- A track is a Catmull-Rom sampled to an arc-length table with `groundY` heights
  smoothed by three 1-2-1 passes, so steps read as ramps. `at(d)` returns
  position and heading.
- Sit: hip X around -1.35 to -1.50, knee +0.5 to +1.3 so the shin drops
  vertically, torso back 0.05 to 0.1. Seat height is a measured constant.
- Climb: hands start above the head, opposite hand and foot move together, hips
  stay close to the ladder (0.12 to 0.2 m) and swing 0.06 to 0.10. Rung spacing
  0.30 m, climb 1.0 to 1.2 m/s, phase driven by height, not time. Feet land on
  rungs, not between them; the shadow belongs on the ladder/deck, not the slab.
- One-shot actions (jump, dive, kick) are phase tables with eased poses, never a
  blend between two loops. Hoist shared easing factors above the branch: a
  `const` declared in one branch and read in another throws every frame and
  freezes the figure. Pose targets are full poses, not deltas.
- Airborne arcs are solved backwards from the impact: for a fixed flight `T`,
  `vy = (landY - launchY + 4.9*T*T)/T`. A guessed `vy` either lands late or
  stops in mid-air.
- The rig root is at the feet, so a rigid-body spin sweeps the model around its
  toes: rotate about a pivot `C` with `p' = p + C - R*C`, C about 0.55 up.

### Carrying, Loading And Mounting

These are the beats closest to the camera and the ones users report first. A
prop that teleports, a hand that misses it, or a leg that swings through the
handlebars destroys the whole miniature.

**Carry.** Keep the prop in world space and solve its transform from the hands
every frame; do not parent a big prop to a wrist group (it inherits the wrist
roll and swims).

```js
const hl = new THREE.Vector3(), hr = new THREE.Vector3();
J.wristL.getWorldPosition(hl); J.wristR.getWorldPosition(hr);
const mid = hl.clone().add(hr).multiplyScalar(0.5);
bag.position.set(mid.x, Math.min(hl.y, hr.y) - 0.42, mid.z);
```

- Build the prop with its origin at the **bottom centre**. Then a hold offset is
  a single subtraction, and the same object seats on the ground/crate floor
  without a second pivot.
- Two hands for anything heavier than a paper bag. The palms must be within
  0.08 m of the prop surface at every sampled frame; log the wrist positions and
  the prop bounds.
- Match the carry pose to the weight: heavy box at the belly, shoulders -1.2 to
  -1.4, elbows -1.2 to -1.4, torso lean 0.2; a light bag hangs from one wrist
  with the elbow nearly straight.
- Reduce arm swing while carrying; the legs do the walking. A full arm swing
  with a box in the hands reads as a puppet.
- **Handoff:** at contact, set the prop to the receiver's hold for one frame, then
  blend ownership over 0.2 to 0.3 s. A hard parent switch pops even when the
  world positions match.

**Loading into a crate or hatch.**

1. Lift the prop above the rim in front of the chest, with both hands on it.
2. Tuck the prop's x/z over the opening while the hands stay on it.
3. Lower it until its base reaches the floor; keep the hands on it for a beat.
4. Release, step back, and only then close the lid, clip the bungee or turn away.

Never translate the prop from hands to slot in one frame, and never let it
descend outside the crate wall. A bungee or lid that intersects the prop on the
way in must animate open and closed; hiding it for the whole beat reads as a
missing part.

**Mounting a scooter, bike or horse.**

Author the mount in the vehicle's local frame, from a measured seat/board, not
by eye.

- Place the left boot on an outboard running board or peg. If the vehicle has
  none, add one; standing on the body or the seat reads as a doll being posed.
- Swing the right leg **out to the side** with hip Z abduction (about +0.9 to
  +1.25 rad), knee flexed 1.2 to 1.4. Hip X flexion swings the leg forward,
  through the handlebars; that is the common error.
- Raise the root in a small arc (0.10 to 0.20 m) so the boot clears the saddle,
  then drop onto the seat. Do not hop a body-height above it.
- Seat root = the pelvis mesh's contact point, not the rig origin. Sit with the
  pelvis on the cushion, both boots on the boards, knees 0.9 to 1.1 rad, toes
  forward; hands reach the grips with soft elbows. Move the bars to the hands
  before hyperextending the arms.
- A rider pose is not the standing pose rotated: torso upright 0.15 to 0.25,
  hips flexed -0.9 to -1.1, hips abducted ±0.25 to ±0.35, knees 1.0 to 1.1,
  ankles near -0.05.
- Keep the vehicle and rider on the same mover after departure, with the rider
  root attached to the seat anchor; a bob applied to one and not the other
  separates them.

**Proof.** A nine-frame side strip at 0.15 to 0.25 s spacing: approach, lift,
over-rim, lower, release, step, leg-swing, seat contact, ride. Shoot it at 1:1
and log wrists, ankles, prop base and seat. A still cannot prove a mount.

## System And Combat Animation

The character section above covers body mechanics. This section covers the
systems that carry a diorama: towers, projectiles, reactions, deaths,
bosses, crowds and secondary motion. Every one is a pure function of `t`, driven
by a pre-simulated event list.

### The Five Layers In Code

| Layer | Driver | Typical period | Use |
| --- | --- | --- | --- |
| ambient | `sin(t*f + phase)` | 1.5 to 5 s | breath, flame, flag, scan |
| locomotion | distance along a path | stride length | walk, fly, hop, slither |
| action | absolute event time | 0.3 to 1.2 s | fire, swing, slam, dive |
| reaction | event time + direction | 0.15 to 0.5 s | flinch, flash, knockback |
| death | absolute death time | 0.6 to 1.4 s | collapse, debris, residue |

If an action and a reaction share a clock, derive both from the **same event
timestamp**. Two independent cycles will drift apart even if they match on the
frame you happened to inspect.

### Deterministic Timeline

```js
const DT = 1 / 40;
const LOOP = 46.0;

const pulse = (t, t0, tau) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));
const win = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
const spring = (t, t0, freq = 9, damp = 6) => {
  const a = t - t0;
  return a < 0 ? 0 : Math.exp(-damp * a) * Math.cos(freq * a);
};
```

Run the battle at `DT` from 0 to `LOOP` once at load. Store:

```js
events.push({ t, kind: 'shot', tower, target, from, to, flight, damage });
events.push({ t, kind: 'impact', x, y, z, species, dir });
events.push({ t, kind: 'death', id, type, x, y, z, t });
events.push({ t, kind: 'gate', x, y, z, hit: n });
```

The render loop reads the events whose time has passed. It never re-simulates
and never carries state between frames. `?t=12.4` freezes the whole system,
including effects, so every QA shot is reproducible.

### Tower Attack Grammar

A tower attack needs five visible stages. Cut one and the tower reads as a
spawner, not a weapon.

| Stage | What the player sees | Time |
| --- | --- | --- |
| acquire | head/turret turns; crew leans; crystal brightens | 0.15 to 0.4 s |
| wind-up | rail pulls back, arm cocks, coil charges, barrel vents | 0.1 to 0.35 s |
| release | muzzle flash, string snap, beam origin flare, arc jump | 1 to 2 frames |
| travel | bolt, ball, beam, chain, projectile with trail | 0.05 to 0.6 s |
| impact | flash on target, dust/goo/ice/feathers, ring | 0.1 to 0.25 s |
| recovery | recoil returns, crew resets, smoke clears | 0.2 to 0.5 s |

Tower archetypes:

- **Ballista / arrow.** Slow traverse, rail recoil 0.15 m, string snap, bolt
  with a short trail, thunk and a small dust puff. Reload is a winch crank.
- **Cannon / bombard.** Breech recoil 0.2 m, muzzle flash and a smoke ring,
  arcing iron ball, impact dust and a ground ring. Never rock debris.
- **Beam / lance.** Crystal pulses, origin flare, a sustained channel with a
  scrolling texture, a target flash, a heat ramp. The beam dies on the frame its
  target dies and respects line of sight. Never a static white cylinder.
- **Tesla / chain.** Coil hum, charge glow, a jagged arc that hops to two or
  three targets, capacitor fade. The arc must visibly leave the coil.
- **Support / aura.** A ground ring with a clear radius, a pulse that travels
  outward, a colour shift on affected units, and a caster animation that shows
  the source. No invisible buff. Audit it as a field, not a shot: origin, area,
  ramp, affected-target change, decay.
- **Rotating emitter / lighthouse.** A continuous sweep is not a turret. Keep the
  base sweep `theta(t)`, add a short dwell window when a target crosses the
  beam, and ease in/out of the dwell so the housing never snaps. Fire inside the
  dwell; return to the sweep with the same phase it would have had. If the beam
  can point into the goal pocket, mask that sector physically (back-screen,
  shroud) rather than breaking line of sight with a special case.

If the tower has a crew, the crew reacts: brace, pull, cover ears, crank. A
crew that stands in the same pose through a cannon shot is a mannequin.

### Machine Grammar (non-combat)

A loom, press, crane, oven, pump or lighthouse lens is not a tower, but it needs
the same causality. Replace "attack" with **work**:

| Stage | What the player sees | Time |
| --- | --- | --- |
| engage | clutch drops, belt tightens, valve opens, lamp housing turns | 0.15 to 0.4 s |
| work | beam sweep, flywheel spin, ram stroke, dough stretch, water flow | 0.3 to 3 s |
| output | light pool, pressed sheet, lifted crate, baked loaf, water rise | 0.1 to 0.5 s |
| settle | flywheel coasts, valve closes, belt slackens, lamp returns | 0.2 to 1 s |

Audit: **input** (what feeds it), **motion** (what turns/strokes), **output**
(what changes in the world), **residue** (waste, heat, crumbs, steam). A machine
with a beautiful motion and no output is a kinetic sculpture; give it a product
and show the product.

### Goal Response Vocabulary

A boss or disaster must act on a **goal**, not just a door. Pick the response
from the goal's material:

| Goal | Contact response | Failure |
| --- | --- | --- |
| door / gate | flash, shake, crack, dust from the lintel | leaf hangs, ward closes |
| valve / pipe | spray, gauge drop, pipe shudder, hiss | pressure falls, lamp starves |
| rope / bridge | slack, sag, strands snap, deck drops | span falls, route closes |
| wall / dam | chip, crack, water seep, block falls | breach, flood |
| tree / mast | bark split, creak, tilt, leaves fall | trunk breaks, canopy drops |

Put the contact point on the **silhouette edge** of the goal, not buried in its
body, and keep it clear of the boss's shoulder/weapon. If the goal is tall, put
the contact at chest height and turn the boss 0.3 to 0.4 rad so the weapon shaft
crosses the frame. The response and the contact must share the same timestamp.

### Projectile Grammar

1. Spawn at the **muzzle, rail tip, hand or crystal**, not the tower centre.
2. Give it a fixed flight time or a solved arc; do not integrate physics in the
   render loop.
3. Add one trail or one tumble. A bare sphere is a debug object.
4. On impact, switch to a **species-specific** effect: dust and ring for iron,
   splinters for wood, goo for slime, feathers for flyers, ice shards for frost.
5. Remove it on the impact frame. No projectile survives its target.

A projectile that is visible after the target is dead is a bug, not a flourish.

### Creature Animation Grammar

| Archetype | Locomotion | Action | Reaction | Death |
| --- | --- | --- | --- | --- |
| small scrapper | scamper, 2-beat | quick stab | flinch + skid | cloth, knife, stain |
| brute | heavy walk, shoulder roll | overhead cleaver | stagger, shoulder dip | iron plates, sword, dust |
| slime | squash-hop | lunge | wobble, split | goo splat, two lets |
| flyer | flap, bank, hover | dive | spiral, feather burst | feathers, spiral fall |
| boss | weight shift, slow stride | telegraph + slam | recoil, knee dip | collapse, gear, weapon, soul |

Every creature gets a **hit flash** on the body material for 0.08 to 0.12 s and
a **directional flinch** opposite the impact. Do not reset the whole pose on a
hit; blend a flinch over the current pose and recover.

Death is a sequence, not a switch:

1. **Impact frame:** freeze or compress the body, flash, drop the weapon.
2. **Collapse:** 0.25 to 0.5 s; knees buckle, torso folds, flyer spirals.
3. **Species debris:** 5 to 8 pieces of cloth, iron, goo, feathers, bone.
4. **Residue:** a stain, scorch, splat or dropped gear that stays for 1 to 3 s.
5. **Soul:** a brief additive flicker or wisp, 0.2 to 0.4 s, then gone.

A death that is a sphere burst, a grey puff or a rock shower fails the bar even
if the particle count is high.

### Boss Choreography

A boss exists to **act on a place**, not to have more hit points.

- Stop it outside the threshold by **body depth + weapon reach**. At the gate,
  that was 2.0 m short of the path end, which left the troll on the drawbridge
  with the door visible behind the club.
- Turn it **three-quarter to the goal** (about 0.35 rad off the door axis) so
  the weapon shaft reads across the frame instead of end-on. An end-on club
  head is a grey rock at the door.
- Build the weapon as a separate group: haft, head, two iron bands, six studs,
  six spikes, and a visible hand attachment. A stone head with no haft is a
  floating rock.
- **Telegraph** 0.4 to 0.7 s, contact 0.1 s, recovery 0.3 to 0.5 s. The contact
  pose is driven by the same gate-hit pulse as the door flash and crack.
- Put the door response on the same timestamp: flash, shake, crack, dust. If
  the club hits at 41.075, the door cracks at 41.075, not 41.2.
- Lose the tower's line of sight to the gate pocket while the boss is there.
  A beam arriving at the same pixels as the club steals the beat.
- Prove it with two shots: contact frame and contact +0.2 s. The first shows
  contact and flash; the second shows recoil. If the club is hidden at contact
  and only appears on recoil, the pose is late.

### Crowd Variation

- Phase offset per actor: `phase = hash(i) * TAU`, never one global `sin(t)`.
- Vary speed by 4 to 8 percent, scale by 2 to 4 percent, and idle by phase.
- Stagger spawns and attack windows by at least 0.15 s. A shared window makes a
  group move like a chorus line.
- Give each actor a lane or offset on the path; two actors at the same waypoint
  stack into one silhouette.
- At a shared door or gate, one actor reaches the threshold; the rest hold back
  at `0.9 + i * 0.8` along their own path.

### Secondary Motion

Flags, banners, cloth, chains, hanging bones, smoke and fire are the cheapest
way to make a static scene feel alive. Rules:

- Drive with `sin(t * f + phase)` and a phase offset per object.
- Add a lag of 0.1 to 0.2 s behind the parent motion; cloth that moves exactly
  with the body looks rigid.
- Keep amplitude small: 0.03 to 0.12 rad for cloth, 0.02 to 0.06 for chains.
- Cap the count. Six flags at different phases read as wind; twenty read as
  noise.
- Never let a secondary object enter the threshold pocket or cover a face.

### Animation QA

For every hero actor, capture:

- a **6-frame strip** of locomotion at 0.1 s spacing;
- the **action contact frame** and contact +0.2 s;
- the **death** at impact, mid-collapse and residue;
- the **boss contact** at the door plus recoil;
- the **beam** at full channel and the frame after the target dies;
- a **pivot parentage strip**: freeze at minimum and maximum yaw and log the world
  positions of every fixed deck prop. They must not move; only the turret and its
  carriage should. Also check world bounding-box overlap between the fixed
  station and every mesh under the yaw group: zero hits.

The strip passes when feet plant, knees bend backward, no joint opens a wedge,
no part floats, and the silhouette changes between frames. A still cannot prove
an animation; a strip can.

## Service And Queue

A market, hatch, ticket window or bakery is a **queue machine**: people arrive,
advance one slot, order, pay, receive and leave. Build the queue before the
props; it is the scene's clock.

**Slots.** Lay four to six positions along the counter, 0.65 to 0.80 m apart,
perpendicular to the hatch. Everyone in the queue shares one lane and one
heading; a diagonal queue reads as a crowd, not a line.

```js
const SLOTS = [q0, q1, q2, q3]; // q0 is at the hatch, q3 is the tail
const toSlot = (p, slot) => ({ x: slot.x, z: slot.z });
```

- A customer's mover is a sequence of `seg(t0, t1, track)` legs: **enter →
  tail → advance one slot per serve → counter → exit**. Keep each leg on its own
  track; re-pathing every serve makes feet slide.
- Advance the whole queue on the serve timestamp, with a 0.06 to 0.12 s stagger
  by slot. The person at the hatch does not advance; they receive and turn away.
- When a customer leaves, the next walks **into** the vacated slot; do not teleport
  the queue forward while the camera is on it.

**Customer state machine.**

| State | Visible action | Gate |
| --- | --- | --- |
| arrive | walk with distance-driven gait | until slot reached |
| order | point at menu/board, head turns | only when speed = 0 |
| pay | hand to counter / phone | after order, only when still |
| wait | idle, weight shift, phone | until bag lands |
| receive | both hands or one hand out | at bag contact |
| exit | turn, walk out, carry bag | after receive + 0.3 s |

**The gate is the whole fix.** Never blend a standing gesture (`PAY`,
`POINT_MENU`, `RECEIVE`) into a walking pose. If the gesture has straight legs
and the walk has bent knees, the mix straightens the legs while the root keeps
translating: the figure glides. Compute `state.moving` from the mover and write:

```js
if (state.moving) pose = walkPose(phase, { amp, arm, carry });
else if (t < orderEnd) pose = mixPose(idle, POINT_MENU, bell(t, order));
else pose = idlePose(t, phase);
```

- Serve **after** the counter arrival, by at least 0.25 s. A bag that lands before
  the customer reaches the hatch is the second-most-reported queue bug.
- One action at a time: order, then pay, then receive. Overlapping windows make
  the arms fight.
- A late customer may arrive after the queue empties, but only once; reusing the
  same slot for a second invisible customer reads as a spawn.

**Machine slots.** A laundromat, workshop or gym uses the same clock with
machines in the slots: washer drum → dryer drum → fold table. Advance the batch
on the **end-of-cycle** timestamp, not on a fixed beat, and land the next action
0.25 s after the lid/door closes. A drum that starts tumbling before the door
shuts is the machine version of serving before arrival.

**Staff side.** The cook works the grill; the cashier takes payment and hands the
bag across the hatch. Their gestures are independent loops, but the bag's release
comes from the cashier's hand position, not a fixed world point. Keep a stack of
paper bags at the hatch and decrement it per serve; the last bag is the goal
object.

**Proof.** Freeze the approach every 0.25 s for two strides and log root speed,
`moving`, hip/shoulder angles and slot. The strip passes when the feet alternate,
the root advances smoothly, no standing gesture appears while `moving` is true,
and the serve timestamp is after the arrival timestamp.

## Vehicles

A vehicle is the prop the user inspects the moment a door opens, so build it to
be opened. Model facing +Z.

| Part | Size and place | Note |
| --- | --- | --- |
| floor pan | 1.62 x 0.10 x 4.02 at y 0.35 | dark; its top is the cabin floor |
| rockers | 0.12 x 0.16 x 3.92 at x ±0.87 | stay with the body |
| front fender | 0.10 x 0.56 x 1.05 at z 1.62 | body side ahead of the front door |
| rear quarter | 0.10 x 0.56 x 0.72 at z -1.84 | body side behind the rear door |
| belt moulding | 0.10 x 0.08, one per fixed panel | never one rail across the apertures |
| bulkheads | 1.84 x 0.56 x 0.16 at z ±2.12 | close the tub |
| roof | 1.48 x 0.08 x 1.94 at y 1.44 | drip rails at x ±0.76 |
| pillars | A raked -0.64, B upright, C raked +0.60, 0.075 thick | |
| windscreen | 1.44 x 0.62 x 0.05, rotation.x -0.64 | glass between the A pillars |
| side glass | none | windows down: open holes between the pillars |

Cabin: dash 1.46 x 0.15 x 0.30 at y 1.00 z 0.80; wheel torus r 0.125 at
(-0.40, 1.10, 0.68) rotated -0.42; front cushions 0.46 x 0.10 x 0.50 at y 0.57
**z 0.30** with backs at z 0.04; rear bench 1.20 wide at z -0.50 with its back at
z -0.74.

The windscreen is not a plane at the front of the cabin: rotated -0.64 it sweeps
back to about z 0.59 at its base. A front seat at z 0.72 therefore sits **inside
the glass volume**, and every occupant's head prints on the windscreen from every
angle. Keep the cushion's front edge at least 0.25 behind the glass base and move
the dash, wheel and column back with it.

**Doors.** Hinge at the shut line, leaf extends backward in -Z: front 1.15 to
-0.15, rear -0.15 to -1.45, leaf 1.30 long and 0.55 high. Pivot at
`(side*0.86, 0.62, hingeZ)`, children are outer skin, inner card, sill strip,
handle, and any livery; `rotation.y = -side * open` swings it out. Swing 1.28 rad
for a saloon, up to 1.52 for a cruiser. Split every full-length body moulding at
the shut lines: a moulding left on the shell reads as the top of the door left
behind when it opens.

**Boot.** Pivot at (0, 0.90, -1.46), lid extends -Z, `rotation.x = +0.95` lifts
the rear edge. Well floor y 0.44 against a lid underside at 0.89, so cargo must
fit 0.45: bags r 0.165 at y 0.63 (tops 0.80) clear it. Close the boot off from
the cabin with a parcel shelf (1.74 x 0.05 x 0.66 at y 0.86, z -1.10) and a
bulkhead behind the rear seat back (1.74 x 0.46 x 0.06 at y 0.63, z -0.82);
without them the boot is open to the cabin through the rear windows and the load
reads as sitting on the closed lid.

Cargo carries `visible = false` until it lands and `userData.noMerge = true`.
A throw needs an object that travels: keep one world-space bag per thrower and arc
it hand → slot with `p.y += sin(f*PI)*0.6`, switching the slot's bag on when the
flight lands, not at release.

### Scooters, Cargo Bikes And Mounts

A scooter is not a car with two wheels. Build it around the contact points: two
tyres on the ground, a floor pan for the boots, a seat the pelvis can sit on, bars
the hands can reach, and a cargo crate whose opening is visible from the camera.

Reference local frame, facing +Z, for a delivery scooter at 1.0 scale:

| Part | Place | Note |
| --- | --- | --- |
| wheels | r 0.26 at z ±0.62 | tyre + hub + fender; both touch y 0 |
| floor pan | 0.60 x 0.04 x 0.30 at y 0.30 | top is the boot surface |
| running boards | 0.12 wide at x ±0.235 | outboard, full length; the left boot lands here |
| body / shield | 0.46 wide, up to y 0.72 | front leg shield, not a box |
| seat | top 0.83 at z -0.18 | measure the cushion top, not the body |
| bars | y 1.06, grips x ±0.33, z 0.52 | raise bars to the rider's hands |
| cargo crate | 0.52 x 0.44 x 0.46, base y 0.86, z -0.56 | open top, interior floor ~0.91 |
| bungees | two cords across the opening | clip open during loading |

- **Seat anchor.** `seat = local(0, 0.83, -0.18)`; set the root so the **pelvis
  mesh** contacts the cushion, then prove it in a seated portrait. On the Night
  Market scooter that is root y 0.09 against a 0.83 seat; do not copy a
  `seatY - hipY` formula from a chair, because the pelvis mesh hangs below the
  hip joint. A copied root puts the rider on the front edge or floating.
- **Boots.** Add outboard running boards at y 0.30 if the floor pan is narrower
  than the rider's stance. Ankles at 0.30, knees 1.0 to 1.1, toes forward; both
  soles flat. Perching one boot on the body is the "doll on a toy" read.
- **Hands.** Grips at the wrist height; a rider with hands 0.15 m above the bars
  is not holding them. Move the bar/riser up or soften the elbow; do not
  hyperextend the shoulder.
- **Cargo.** A crate with an open top needs an interior floor and side walls;
  a bag lowered to `baseY + 0.01` sits inside. Keep bungees as a separate group so
  they can unclip during loading and close over the lid afterwards.
- **Lights.** One emissive lens plus a small halo sprite; a headlight cone only
  at night. A large additive disc reads as a floating balloon; a brake light is a
  second, smaller lens, not a copy of the headlight.
- **Clipping.** The whole vehicle + rider + cargo move as one mover after
  departure; clip the group at the slab edge, and hide rider shadow at the same
  time the vehicle shadow takes over.

Mounting is authored with the sequence in **Carrying, Loading And Mounting**:
left boot on the board, right leg abducted over the saddle, small root arc,
pelvis on the seat, hands to the grips. Prove it with the nine-frame side strip.

### Buses, Vans And Long Vehicles

A bus is a moving room. Its job is a window band, a door, a route sign and a
headlight sweep; the chassis is the least visible part.

| Part | Size / place | Note |
| --- | --- | --- |
| body | 9 to 12 m long, 2.5 wide, 3.0 high | one box with a chamfered roof |
| window band | y 1.35 to 2.45, full length | dark glass + warm interior, not a transparent plane |
| door | 1.1 wide, front or centre | step well, grab rail, lit interior |
| wheels | r 0.50, wheelbase 5.5 | two axles; arches cut into the skirt |
| route sign | front above the windscreen | emissive text/colour blocks, readable at 1:1 |
| livery | one band + one number | never a full advertising wrap at this scale |
| headlights | two lenses at y 0.65 | plus cones and a floor ellipse |
| interior | 4 to 6 lit windows + driver silhouette | a dark box with one warm strip reads as a bus |

- **Speed and weight.** 5 to 8 m/s, no bounce; one brake dip at the stop. A bus
  that bobs like a car reads as a toy. The body leans 0.01 to 0.02 rad on the
  brake, no more.
- **Headlight sweep.** Two cones and one long floor pool travel with the bus.
  Do not light the facade with the cone; a 12 m vehicle with a global spotlight
  turns night into noon.
- **Occlusion.** A bus between the camera and an interior hero covers the beat.
  Put its lane behind glazing at -Z, or time it before/after the contact. Check
  the occlusion frame at the hero timestamp.
- **Doors.** If the door opens, model the step well, a grab rail and an interior
  light; a black rectangle reads as a hole. For a passing bus, keep the door shut.
- **Clip.** The whole bus, lights, interior and driver move as one group; hide
  its contact shadow at the slab edge, same frame as the vehicle.

A bus that reads as a white box with black windows is not finished: the window
band, route sign, wheel arches and one warm interior strip are the minimum.

### Seats, Exits And Transfers

Seat root = cushion top minus hipY, which is **-0.38** in car space on this rig:
the hips settle into the cushion and a masked head clears the roof with 6 to 8 cm.
At -0.18 a hooded head lands about a centimetre under the roof panel and any bob
prints a dark pixel on the white roof. Measure against the head mesh, not the head
joint, and lower the seat rather than raising the roof, which is pinned to the
pillars.

The stand spot is 2.00 m out from the car's centreline and 0.30 behind the hinge
for a front seat, 0.55 for a rear:

```js
const exit = toWorld(car, side * 2.00, seatZ - 0.30);
```

An open leaf hangs in the plane of its hinge, so an exit level with the seat puts
shoulders and head through the door skin. 0.30 still sits inside the aperture and
leaves room for a torso plus a swinging arm. 2.00 out is about 1.07 of daylight
from the flank, and that is not padding: at 45/33 a figure 0.7 off the flank sits
wholly inside the car's silhouette with his feet on the rocker line and reads as
welded to the body.

The climb is authored in the **car's own frame**, so it works at any parking
angle. It ships: `templates/transfer.js` is the whole move (`transfer`,
`climbAt`, `CLIMB`, `stepPose`, `standSpot`), and `templates/poses.js` carries
the four climb poses plus the walk and run cycles it blends between. Copy them,
do not retype them. `k` runs 0 at the open door to 1 at the seat, `dy` is the root height
above the seated root, and the pose is a real sequence: stand, reach, crouch in,
sit on the edge, swing the legs in, settle.

```js
const CLIMB = [
  { u: 0.00, k: 0.00, dy: 0.380, pose: STAND },
  { u: 0.16, k: 0.03, dy: 0.330, pose: REACH },      // hand to the roof edge
  { u: 0.36, k: 0.16, dy: 0.120, pose: CROUCH_IN },  // knees deep, hips dropping
  { u: 0.56, k: 0.38, dy: 0.010, pose: SIT_EDGE },   // perched, feet still down
  { u: 0.76, k: 0.66, dy: 0.000, pose: LEGS_IN },    // knees up, feet over the sill
  { u: 0.90, k: 0.88, dy: 0.000, pose: mix(LEGS_IN, SEATED, 0.55) },
  { u: 1.00, k: 1.00, dy: 0.000, pose: SEATED },
];
```

The transfer wraps that climb: the first `STEP_SHARE` (0.26) of the window is one
stride from the stand spot to the door, the rest is the climb, and on the way out
the stride away comes last. The body only reaches cushion height once the hips are
over the sill, so nobody sinks, floats or slides through the bodywork. `DOOR_STAND_X`
1.34, `DOOR_STAND_DZ` -0.06, durations 1.05 to 1.20 s each way. Never derive the
duration from the next beat's start: under about 0.9 s the whole move reads as a
slide or a blur. Move the following beat later instead.

Facing is the trap. The outward yaw points away from the car, so a figure entering
with it climbs in backwards: body into the seat, face to the street. On the way in
every key before the seated ones faces the car, including the standing key that
gets forgotten. Resolve it from geometry, never from the approach path's tangent:
a path's opening segment runs along the street, so `path.at(0).yaw + PI` points
down the kerb and lands the figure a right angle off whichever way he arrived.

```js
const faceYaw = car.yaw - side * (PI / 2);       // square to the open door
const face = Math.atan2(seat.x - stand.x, seat.z - stand.z);   // stand -> seat
// turn to the windscreen only once the hips are on the cushion
const turn = smooth(clamp((v - 0.62) / 0.30, 0, 1));
yaw = lerpAngle(faceYaw, car.yaw, turn);
```

Staging rules that came out of real reports:

- **One window per actor, staggered 0.2 s or more.** A shared window climbs two
  men into a seat on the same frame, which reads as choreography, and at 0.1 s
  they climb through each other.
- **Separate a pair in screen space, not in world space.** At the reset hero 45/33
  view, moving a figure further out along the camera axis barely changes where it
  lands on screen: it stays stacked over the car's flank and still reads as one
  blob, which is why pushing the stand spot from 1.6 m to 2.0 m did not cure a
  "stuck" report. What separates them is offset along the car's axis, because that
  is screen x: rear occupant 0.72 behind his hinge against 0.30 for the front
  leaves 1.2 m of screen distance instead of 0.8, where two figures merge into one
  silhouette. Project both actors with `v.project(camera)` and compare pixels
  before concluding they are spaced.
- **Doors are a timeline, not a state.** Open the leaf 0.15 s before a transfer,
  shut it 0.5 s after the last man is clear, reopen just before the entry. A car
  left open for the eight seconds its crew is away reads as the crew stuck in the
  doorway, however clean the walk is.
- **A run that ends at the car must not hand straight into the transfer.** End it
  0.4 to 0.6 s early, blend out to STAND over the last 12 percent, hold a beat at
  the door, then climb.
- **Seated figures stay visible.** Hiding them when the entry ends sends an empty
  car down the street, which the user reads as a bug, not a cutaway.

### Clear Spots, Shut Doors

- **A shared doorway needs one lane per actor plus a hold-back on the approach.**
  Actors on the same waypoints put the second in the first's back and stack at the
  threshold. Offset the approach per actor, stop each one short of the door by
  `0.9 + i*0.8` along his own path, stagger the walk-in windows by 0.25 s, and let
  the lead actor alone reach the threshold: the kick, the first step through. Four
  men then read as a queue filing in rather than a scrum.
- **Diagnose "stuck" with numbers, not frames.** Freeze in 0.3 s steps across the
  beat and print every actor's x/z with the pairs closer than 0.6 m. A pair that
  holds that close for more than one sample is jammed; a single sample is two men
  passing. At 12 px a figure a screenshot cannot tell those apart, and nudging
  spacing by eye fixes the wrong thing: the real cause is usually a route that
  ends where another actor already stands.
- **Give every actor a route out of every beat.** Two officers left in a cover
  crouch at the kerb while everyone else moves is a direction bug, and the report
  is always "they are stuck" however correctly the two are separated.

### Clipping At The Diorama Edge

Vehicles enter and leave the block, and the slab is a window. Four world-space
planes on the renderer for the scene pass, cleared before the post quad:

```js
const CLIP = [
  new THREE.Plane(new THREE.Vector3( 1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), hx + 0.05),
  new THREE.Plane(new THREE.Vector3( 0, 0, 1), hz + 0.05),
  new THREE.Plane(new THREE.Vector3( 0, 0,-1), hz + 0.05),
];
r.clippingPlanes = clipPlanes; r.setRenderTarget(rt); r.render(scene, camera);
r.clippingPlanes = [];         // before the full-screen quad
```

A car entering nose-first shows its own front surfaces at the cut, so the cut
reads clean; one leaving tail-first exposes the cut face, so keep the interior
modelled and it reads as a cutaway. Route every vehicle one way, in at one end of
the street and out at the other, no reversing and no angled parking: an angled
park reads as a collision, and backing in reads as a bug. Two vehicles sharing a
lane need a departure gap (`pLeaveGap` ~1.15 s) or the far one drives through the
near one.

## Effects

- **Water**: `MeshPhysicalMaterial` with vertex colours, not a custom shader, so
  it receives shadows. Ramp shallow to deep teal, never to navy: a near-black end
  quantises into a hard band the user reads as a hole.
- **Wake**: unlit additive foam streak plus 8 to 12 expanding ripple rings spawned
  behind a moving body every 0.4 s, fading as `(1-k)^2`.
- **Splash**: 60ish unlit additive droplets with gravity plus four rings and a
  foam disc; normal-blended white over teal reads as a grey blob. Seed the burst
  (`trigger(x, z, power, burstSeed)`), never `Math.random`: a frozen frame must
  reproduce the same burst, and the same frame must reproduce it again after the
  clock jumps.
- **Effects that integrate dt need a `reset()`.** Wake and splash advance by
  `dt`, so jumping the clock to freeze a frame does not jump their state, and the
  frozen splash shows whatever the last played frame left behind. Both templates
  expose `reset()`; the harness calls it and re-simulates in fixed steps from
  zero, which took a two-frame diff from 334 differing pixels to 18.
- **Smoke**: camera-derived billboards. The camera can orbit, so update from its current
  quaternion once and every puff is a plane facing the lens.
- **Debris with history**: loose notes or paper use a solved arc, a drag term, a
  spin about a random-but-deterministic axis, then slerp to flat and lie there for
  the rest of the loop. Deterministic hashing (`sin(n*127.1)*43758.5` fractional)
  keeps every replay identical.

### FX And The Edge

The slab is a window, but not every effect is a solid. Split them:

- **Cut FX** — debris, props, vehicles, bodies. Let the world clip plane cut
  them; model the interior so the cut reads as a cutaway, and route them so they
  enter and leave rather than parking across the edge.
- **Read-through FX** — light beams, glow, wake, spray, horizon haze. Do **not**
  let a hard clip plane slice them. End the effect at its target, fade intensity
  to zero before the slab boundary, or mask it with a soft edge. A lighthouse
  beam that stops in a straight vertical cut reads as a broken cone.
- **Additive over white.** Additive white on a white page is invisible. Give a
  beam a saturated core from the palette plus a darker under-edge or halo, and
  test it at 1:1 against the page, not against a dark viewport. If the beam must
  cross the whole frame, let it dim toward the edge; a bright hard-ended beam is
  worse than a soft falloff.
- **Clipped water.** A hull cut at the slab edge needs its interior and a foam
  plane at the cut, or it reads as a hollow shell. A moored boat should sit fully
  inside the frame for the beat where it unloads.

### FX Under The Snap

Every scene effect goes through the palette snap. That is the look, but it
punishes sub-pixel tricks:

- Author FX at **2 px or wider** at the target buffer. A 1 px additive wisp
  disappears or becomes a single palette dot; enlarge it or delete it.
- Use a **palette-legal saturated colour** and a dark contour, not pure white.
  White clips to the page and the snap has nothing to quantise.
- Do not rely on a smooth gradient to carry an effect. Build it from 2 to 4
  palette steps, a scrolling band, or a shape with a hard edge.
- Test with `?dither=0` and at 1:1. If the effect only reads in a downscaled
  preview, it is not in the render.

### Contact Contexts

"Touching the ground" is not one rule:

- **Ground prop:** contact shadow plane 0.018 above the slab; lowest vertex on
  the deck, not floating.
- **Deck / gallery / table:** the shadow belongs on that surface at its Y, not on
  the slab below. Parent the figure and shadow to the deck, or project onto the
  deck plane; a gallery figure with a slab shadow reads as a ghost.
- **Water:** the hull sits below the waterline; use a foam ring at the waterline
  and a wake, not a contact shadow. A floating boat with a hard shadow on the
  water reads as a toy on a table.
- **Vertical / wall:** a ladder, hook or rope needs a contact mark at the rung,
  grille or rail it bites, plus a small recoil; a hook in mid-air is a prop.

## Combat Readability (towers, bosses, deaths)

A diorama is judged on whether the **cause and the consequence are both
visible at the reset hero camera**. Geometry that is correct in world space can
still read as a bug on screen. Run these gates before calling a combat beat
finished.

- **Clear the threshold.** Keep at least 2 m of empty ground in front of a
  portal mouth, gate, or spawn arch. No crates, barrels, boulders, bones, or
  hanging vines in that pocket. Remove fireflies over the mouth, and never put
  rising smoke there: a grey billboard above an arch reads as a rock flying out
  of the entrance, even when it is soft and transparent.
- **Give every tower a legible grammar.** Origin flare, a readable travel or
  channel, and an impact that lands on the target. A beam needs contrast against
  both the tower body and the page (there is no sky), plus motion along its
  length; a plain white
  cylinder over a white tower reads as a waterfall or a static icicle. Use a
  scrolling band texture, a darker halo, and a target flash. If the line of
  sight is blocked by the keep, a foreground tower, or a ruin, pick another
  target instead of drawing through the wall.
- **A beam that fires at a dead target is a bug.** Store the target id on every
  beam event and hide the beam on the frame its target dies.
- **A boss with a goal must act on the goal.** Stop it outside the threshold by
  at least its body depth plus weapon reach, face the door, and make the weapon
  visibly contact the door. Position alone is not enough: sync the contact pose
  to the door-hit timestamp (a decaying pulse from the simulation), so the
  club/ram/fist is low on the same frame the door flashes, shakes, and cracks.
  If the weapon is off-screen, through the wall, or on the ground at the hit
  frame, the beat is not finished.
- **Do not let an attack hide the story.** A boss at the gate and a tower beam
  arriving at the same spot fight for the same pixels. Let the tower lose line
  of sight to the gate pocket, or dim/shorten the beam there; the door beat
  wins. The player can see the beam elsewhere in the loop.
- **Deaths need a species, not an explosion.** No generic sphere, boulder, or
  rock burst on death. Use a body-specific collapse plus two or three
  type-coloured shards or cloth/armour/goo/feather pieces, a dropped weapon
  where the species carries one, a ground stain or splat, and a brief soul
  flicker. Cannon and mortar impacts land in dust and smoke with a ring, never
  in stone chunks. If a death reads as "grey puff", it is not done.
- **A stone weapon is not a floating rock.** A club, maul, or ram needs a
  visible haft connecting it to the hand, iron bands, studs, or spikes, and a
  colour that separates it from the wall it hits. Check the impact crop: if the
  head looks detached, add the haft/band contrast, not more debris.
- **Prove the beat with time, not a still.** Shoot the impact frame and the
  frame 0.2 s later. The first must show contact and the flash; the second must
  show recoil or follow-through. If the club is hidden at impact and only
  appears on the recoil, the pose is late.
- **Sync effects by timestamp.** Gate hits, door cracks, beam impacts, and
  death pulses must derive from the same simulated event time. Two independent
  cycles will drift apart on a long loop even if they match on the frame you
  happened to inspect.

### Attack Audit

Run one row per tower, at the timestamp it fires. A tower that never fires in
the loop is scenery, not a defence.

| Check | Pass condition |
| --- | --- |
| origin | muzzle, rail, crystal or hand is visible and offset from the body |
| wind-up | at least 0.1 s of visible anticipation |
| travel | projectile or beam is traceable across at least 4 frames |
| impact | lands on the target with a species-specific effect |
| recovery | weapon returns; crew resets; no snap to rest |
| count | `shots > 0` in the sim stats for this tower |
| no stale | no projectile or beam outlives its target |

If a tower fails "origin", move the spawn point; adding more impact particles
will not fix it. If it fails "travel", slow the projectile or widen the trail;
a 1-frame hit is a hitscan, which is fine only for a beam.

### Field Audit

A **support, aura or ground field** has no projectile and must not be failed for
that. Audit it on five field stages instead:

| Check | Pass condition |
| --- | --- |
| source | emitter, valve, horn mouth or caster hand is visible |
| area | radius/cone is readable on the deck; no floating ring |
| ramp | effect grows over at least 0.15 s; not an instant decal |
| affect | affected units visibly change (speed, colour, stagger, burn) |
| decay | effect fades/expires on the loop, leaving residue |
| count | `events > 0` for this field in the sim stats |

A field that never expires is a lighting change, not an attack.

### Death Grammar

| Species | Body collapse | Debris | Dropped | Residue |
| --- | --- | --- | --- | --- |
| goblin | fold forward, knees first | cloth scraps, 2 bone chips | knife or spear | dark stain |
| orc | drop to one knee, then side | 3 iron plates, 2 tusk chips | cleaver or sword | dust + blood |
| slime | flatten, then pop | 6 goo blobs, 1 core | none | glossy splat |
| flyer | spiral, wings fold | 5 feathers, 1 bone | none | feather on ground |
| human / crew | knees, then hat/coat fold | 3 cloth scraps, 1 tool | hat, keys or hook | oil or blood stain |
| boss | knee dip, torso fall, weapon drop | 6 armour plates, 2 horns | club | scorch + rubble |

Every death also gets a 0.2 to 0.4 s additive soul flicker. It is the punctuation
that says "this was a creature", not "this was a particle system".

### Beam And Impact Artifacts

- **A black band along a beam is a texture backing, not a shadow.** A canvas
  filled with black and then painted with white stripes still carries black RGB
  with alpha 1; under a render target it can survive as a dark segment. Clear the
  canvas and paint pale stripes with transparent gaps. Never use a black
  background for an additive beam texture.
- **A beam that looks like a waterfall** is a white cylinder against a white
  tower. Add a darker halo, a scrolling band texture, an origin flare and a
  target flash. The eye needs motion along the length and contrast at both ends.
- **A beam through a wall** is a line-of-sight bug. Sample the keep/foreground
  silhouette and drop the target if the segment crosses it; do not shorten the
  beam after it has already drawn through the wall.
- **A beam on a corpse** is a stale target. Store `targetId` on the beam event
  and hide the beam on the frame that id dies.
- **Dark smoke over a bright beam** reads as a black bite. Smoke is normal-alpha
  grey; if it crosses a beam, lighten it, move it out of the beam corridor, or
  draw the beam after the smoke. Do not assume additive blending saves it.
- **A projectile that looks like a floating rock** has no trail and no muzzle.
  Spawn it at the weapon, add a tumble or trail, and remove it on impact.
- **A muzzle flash with no recoil** reads as a sticker. Move the weapon back
  0.1 to 0.25 m and return it over 0.2 to 0.5 s.

### Prop And Landmark Failures

- **Two landmarks with one silhouette.** A skull tree behind a skull totem
  becomes one antlered monster; a cart beside a crate becomes a pile. Remove or
  move one. Project both to screen and check the union.
- **A trophy that floats.** Mount it on a board, plaque or branch with a visible
  rope, strap or nails. A skull in mid-air is a rock with eye sockets.
- **Loose skulls at the base read as white pebbles.** At diorama scale, a 0.1 m
  sphere with two dots is not a skull. Remove it or make it a clear bone pile
  with a jaw and horns.
- **A cart load made of pale spheres reads as a blob.** Use tied rectangular
  bales, straw tufts, a pitchfork and a sack. The load must have a construction
  logic, not just a colour.
- **Rising smoke over a threshold reads as rocks flying out.** Remove it from
  the pocket. Fire can glow without a smoke column.
- **A prop at the slab edge with its wheel or shaft over the void** breaks the
  cut-out. Move it in until the lowest contact and the full silhouette are on
  the deck.

## Build And Ship

`templates/build.mjs` bundles `src/main.js` to `dist/app.js` with esbuild (IIFE),
writes `index.html` and a standalone HTML with the bundle inlined, escapes
`</script` in the payload, and passes the replacement as a **function**, not a
string. `String.replace` expands `$&`, `$'`, `` $` `` and `$1` inside a string
replacement; a minified bundle routinely contains those sequences, which
silently injects the `<script src=...>` tag into the middle of the app and
breaks the standalone file. Always test the standalone over `file://`, not just
the served page. `--minify` for shipping; expect roughly 780 kB with
three.js inside.

Freeze and seek come free if everything is a function of `t`:

```js
const params = new URLSearchParams(location.search);
const frozen = params.has('t') ? parseFloat(params.get('t')) : null;
const startAt = params.has('from') ? parseFloat(params.get('from')) : 0;
window.__diorama = { THREE, scene, camera, renderer, post, director, cast,
  robbers, cops, mats, TL, CLIP, freeze(t){ frozen = t; draw(t); }, play(){}, view(){} };
```

`?t=12.4` is the whole QA surface: every screenshot and every diagnosis is a
frozen frame, so a screenshot never depends on timing luck.

### The research gate, at ship time

A build is not finished until these exist. Check them before the summary:

- [ ] `refs/<subject>/` has at least one contact sheet stepped from real footage.
- [ ] `refs/SOURCES.md` answers the four questions (shape, motion, asset, proof)
      with the queries actually run. "Nothing found" is a valid answer only with
      the query written down next to it.
- [ ] `CREDITS.md` has a row per imported asset, and every licence is CC0, CC-BY,
      public domain, or owned by the user.
- [ ] Every hero asset walked the ladder: disk, CC0, CC-BY, then hand-built. If it
      was hand-built, the row says so.
- [ ] The captures for each beat exist, and each one was compared against the
      reference frame for that beat.

A missing `SOURCES.md` means the research step was skipped, and the scene is
probably wearing the generic version of its genre.

## Surface, Motion And Event FX

These are the failures that survive a good first render: a finished-looking set
with one raw seam, a clean loop with a vehicle that teleports out, or an effect
that is technically present but reads as a grey rectangle. Audit them as a
system, on every subject.

- **Finish the edge, not just the field.** A heightfield, bank, road, water or
  terrain piece that meets the slab must feather to the slab height over the last
  0.5–1.0 m. Never end a terrain in a lip, a vertical wall or a portal-shaped
  hole. Prove it with a 1:1 crop of each visible slab edge at two nearby times,
  not a wide shot where the seam is 2 px.
- **A mover has not exited until its bounds clear the slab.** Keep the whole
  group — body, lights, shadow, cargo — visible through the complete run-out.
  Hide only after the world-space box is wholly outside the slab plus a 0.2–0.5 m
  margin. No early `visible = false`, no parking at the gate, no portal. If the
  scene uses a clip plane, the mover may be cut by it, but the cut body must
  continue moving out; a cut that freezes is the same bug.
- **Never fade a solid hero with material opacity.** Per-material opacity on a
  multi-mesh vehicle or figure produces ghosting and sort artefacts: some parts
  turn transparent before others, and the result is a see-through prop, not a
  fade. Cut, clip, or hide only when the bounds have cleared. Transparent glass
  and FX are exempt; whole-object fades are not.
- **Effects are events, not weather.** Exhaust, steam, dust bursts and impact
  puffs belong to explicit windows: start, rev, launch, hit, landing, open. If
  the brief does not ask for idle smoke, do not emit while the source is parked.
  A continuous plume erases the timing of the event it was meant to sell.
  One-shot exhaust is roughly **0.7–1.2 s**, with a short fade tail under 1 s.
  Check the event frame and event + 1.5 s: present then absent.
- **Anchor an emitter at the physical nozzle.** For a vehicle, the source is the
  exhaust-tip object (`(±0.66, 3.74, -0.74) * scale` on the truck recipe), not
  the engine centre, cab roof or a point chosen by eye. Put the tip
  in `userData` during construction and use that same object for the smoke. A
  plume that starts above or behind the stack reads as a floating cloud. If a
  canopy hides the tip, offset the birth point downstream in the open direction,
  not the source anchor; the audit's `maxOffset` allows that.
- **A halo is a sprite, not a quad.** A flat, untextured, low-opacity additive
  `PlaneGeometry` is a light-grey rectangle at the palette snap, especially over
  a dark board or wall. Use `haloPlane`/`softDiscTexture` from `detail.js`, a real
  emissive lens, or no halo. This is the single most common "what is that
  rectangle?" report.
- **Event FX must not cover the thing you are pointing at.** A smoke cloud that
  grows over a sign, jumbotron, face or gate has become the subject. Cap size,
  cap life, and move the source to the open side of the prop; verify at the
  event frame, not only at 60% of the burst.
- **Every correction gets a regression check.** For these failures the checks
  are: edge crop pair, mover bounds log, whole-group fade scan, emitter
  active/quiet windows, source-to-puff distance, flat-glow scan, and margin
  scan. `templates/qa/audit.mjs` runs the mechanical ones; the 1:1 crops remain
  human evidence.

## Motion Graphics Primitives (arrows, flames, flow)

Animated arrows and flames are how a mechanism explains cause. They fail
silently: the build passes, one still looks plausible, and the graphic points
backwards or sits inside a solid. Treat every primitive as a tiny part with its
own convention test, in every preset.

- **Declare and test the local forward axis.** A cone built with
  `CylinderGeometry(radiusTop, radiusBottom, ...)` points along the *top* end.
  Swapping those two numbers makes every arrow flow backwards while still
  looking like an arrow. Build the tip at local `+Z`, store `tipLocal` and
  `tailLocal` in `userData`, and assert: cone base wide and behind, tip a point
  ahead, and the placement transform maps `+Z` onto the requested tangent.
- **Never place an arrow on the centreline of an opaque body.** An arrow inside
  a cast runner is invisible with honest depth testing; the usual "fix" is
  `depthTest:false`, which turns the scene into x-ray. Two honest options only:
  cut a real window/section that exposes the gas volume, or place arrows solely
  in the genuinely open region (port mouth, chamber, outlet). Keep depth test and
  depth write on; assert `depthTest === true` for effect materials.
- **A spline through an open cutaway is not a flow route.** An intake path that
  looked correct in the port still speared the valve disc, because the gas turns
  around the open valve, not through it. Derive each effect from the *current
  free volume* (crown to the live valve underside) instead of a fixed centreline,
  and use one bold arrow per stroke rather than a stream spawned along a curve.
- **Fit the whole cone, not its centre.** The vertical extent of a
  cylinder-capped cone depends on its direction: `|dy|·half + flat·head`. For a
  vertical arrow that is its half length, so clamping only the centre lets the
  head pierce the crown or the valve. Compute the extent, reduce the scale until
  the band and the bore both fit, then clamp the centre. Judge "bold" by rendered
  length (`length × scale`), not by the scale ratio: a long authored arrow in a
  short band is legitimately scaled down and still reads.
- **Anchor to a real surface, and normalize the authored length.** Put the intake
  tail and the exhaust tip `0.008` under the valve head underside
  (`seat − 0.061 − lift`), span at most `92%` of the band, give a compression
  chevron its tail on the rising crown (`crown + 0.02`) so it touches the charge
  it describes, and start a force arrow `0.015` *inside* the flame tip. Author the arrow at its maximum length so `scale ≤ 1`; otherwise a
  non-normalized `1.14` arrow makes the minimum-scale gate and every sizing test
  meaningless.
- **Never stack two rows of the same arrow.** Two overlapping compression rows
  read as double-headed spikes. Two side-by-side chevrons, or one arrow, not two
  rows at the same x/z.
- **Couple the effect to its source.** A pressure arrow that outlives the flame
  becomes an orphan arrow pointing at nothing. Fade the arrow with the flame
  kernel and hide both on the same frame.
- **Every Y constant shares one space.** A group lifted off the plate (here
  `+0.024`) silently shifts every "absolute" ceiling. Measure the *scene* in the
  same local space the constants were written in; mixing world and local turned a
  correct flame into a phantom 24 mm head violation.
- **A flash must not saturate the frame.** Halo opacity `0.40`, halo scale `0.42`
  and point-light intensity `2.2` are already generous at diorama scale; the
  earlier `0.95 / 1.14 / 9.0` blew the whole head to white, and `0.55 / 0.62`
  still washed the crown orange for two frames. Judge the ignition frame itself,
  not the frame after it.
- **A flame may not die as a bead.** The kernel must span the fixed clearance
  recess at TDC (`0.125` here) and be hidden below `0.12` height. A flame that
  fades to a two-pixel dot on the valve seat is the flame equivalent of an arrow
  speck, and a mid-stroke still will not show it.
- **Audit every 15°, not four hero stills.** Render the full 720° at a tight
  chamber camera, build one contact sheet per stroke, and read every cell. The
  spear-through-valve, the double-headed chevrons and the ignition white-out were
  all invisible in the four "representative" screenshots.
- **Bound the change between adjacent degrees.** A per-degree delta test on
  position and scale catches pops that a mid-stroke still hides. Scale a fade so
  it cannot drop by more than about `0.06` per degree, and hide only when the
  final scaled size is below the legible threshold.
- **No effect speck.** A primitive that fades by scale must become invisible
  before it becomes a 2 px nub. Drive `visible` from the *final scaled size*, not
  from the envelope alone, and hide below a legible threshold (about 0.3 of the
  authored arrow length at a normal educational-camera distance; 0.22 is only for
  very large arrows). Test the fade boundary as well as mid-stroke; a nub reads
  as a rendering bug.
- **Size against the real free volume, and check the sign.** Measure the moving
  ceiling (valve faces, piston crown, lid) each frame, not the closed deck or a
  cached constant. An inverted subtraction (`floor - tip` instead of
  `tip - floor`) silently hides every arrow while all numbers stay finite. Assert
  the available band is positive wherever a primitive is visible, and fit the
  full tip/tail/width inside it.
- **A flame is a kernel, not a balloon.** Anchor it at the igniter/plug and let it
  grow only into the volume the mover releases, except that the kernel always
  spans the fixed clearance recess at TDC where the released gap is almost zero.
  A chamber-sized flame hides the pressure graphic, touches the piston and reads
  as a balloon. Keep it compact, put the force arrow in the free band *below* the
  flame, and prove the flame bounds against the crown and the head across the
  whole event.
- **One idea per primitive.** Three short arrows sharing an origin merge into an
  unreadable trident; one bold arrow reads instantly. If a fan is genuinely
  needed, separate tails and heads by at least one head-width and verify it in a
  1:1 crop.
- **No ink outline on tiny FX.** An outline sized for castings swallows a thin
  shaft and turns coloured arrows into black sticks. Effect materials stay flat
  and un-outlined; check `outlineParameters.visible === false` and the rendered
  colour in a crop.
- **Lifetime is phase-bound and deterministic.** Each group has an explicit
  window and no history dependence: visible mid-stroke, zero in every other
  stroke, identical for the same phase in any order. Test mid-stroke counts and
  a sweep of outside phases.
- **A hollow outlet is one connected solid.** No floating torus as a rim and no
  flat cap closing the bore. Lathe one continuous sleeve + rolled lip, overlap
  the pipe, and prove with a centre-ray (passes through the opening) and an
  annulus-ray (hits material).
- **Every crossed fixed wall needs a real opening.** A piston, rod or shaft that
  passes a flange needs a bored hole/slot with measured swept clearance, not a
  shelf with a dark circle painted on it. Test the actual structural mesh against
  every moving surface vertex at the crossing plane, at the lowest/full-travel
  pose.
- **Selection:** follow `Canonical educational UI and inspection contract`;
  an explicit Inspect focus is distinct from a camera-stationary lesson step.
- **Use the copy-in helper, not a fresh guess:** `templates/flow-primitives.js`
  carries the +Z convention, the band fitter and the legibility gate.
- **Regression checks for this section:** forward-axis unit test, tangent
  alignment, per-stroke visible counts plus zero leakage, minimum legible scale,
  a 720° vertex sweep against crown/bore/head/valve-disc/stem/plug with the live
  lift, an adjacent-degree no-teleport bound, flame-kernel and crown bounds,
  open-outlet and flange rays, a 48-frame contact sheet per stroke, and a
  screenshot strip of all four strokes from two orbit angles. A missing check is
  not a pass.

### Recorded failure modes (four-stroke engine, v3.12.0)

These were all present in one finished-looking scene; check for each by name:

1. Reversed cone (`radiusTop`/`radiusBottom`) — arrows flowed backwards.
2. Arrows on the centreline of solid intake/exhaust runners — invisible, then
   faked with `depthTest:false`.
3. Fade boundary left coloured specks (scale 0.016) visible.
4. Arrow ceiling taken from the deck instead of the valve faces, and inverted
   downward-room sign — pressure arrows vanished entirely.
5. Chamber-sized ignition flame hid the pressure arrows and touched the crown.
6. Three short pressure arrows merged into one trident.
7. Ink outlines turned small flow arrows into black sticks.
8. Detached torus "rim" floating off the exhaust pipe; solid cap in the bore.
9. Solid cylinder-base flange slicing the piston and rod at the bottom of the
   stroke — the exact "it passes through" report.
10. Part selection changed colour but did not dim the rest or move the camera.
11. Intake/exhaust arrows followed a spline through the valve disc — a visible
    spear through the head. Fix: free-volume arrows, never a port centreline.
12. Only the arrow *centre* was clamped, so heads poked through the crown and the
    valve underside. Fix: fit the direction-dependent full extent.
13. Two stacked compression rows overlapped into double-headed spikes. Fix: one
    chevron per side.
14. Arrow scales ran past `1.14` because the authored length was shorter than
    the desired length, defeating the legibility gate. Fix: normalize length.
15. The pressure arrow outlived the flame and pointed at nothing. Fix: shared
    fade with the flame kernel.
16. World-space tests applied to engine-local constants reported a phantom
    flame-above-head violation (`+0.024` root lift). Fix: one declared space.
17. Ignition flash at `opacity 0.95`, `scale 1.14`, `intensity 9.0` blew the
    whole head to white for the ignition frame. Fix: capped flash.
18. The flame faded to a two-pixel bead on the valve seat for 20° of crank
    rotation. Fix: span the clearance recess and hide below a legible height.
19. Four hero stills missed all of the above; the 15°-step contact sheet and a
    6°-step video found them. Fix: the frame-by-frame audit is the acceptance
    gate.

## Verification

- **Build first, then shoot, then prove the edit landed.** A failed bundle leaves
  the previous `dist/` in place, and a refused or blocked edit leaves the source
  untouched, so in both cases every screenshot shows the old app and the fix
  looks like it did not land. Read the build's own output line, grep for a
  sentinel string from the change, and only then judge the frame.
- **Non-vacuous, fresh proof (3.18 evidence + test).** Quartz-watch's rounded
  box reported runtime `type: BoxGeometry`; a type-name filter produced zero
  magnet samples and `magnetRadius: 0`, falsely passing clearance. Assert expected
  object counts, nonempty finite sample sets, positive applicable radii and actual
  geometry attributes/topology before measuring; never trust a constructor label
  as shape proof. `templates/mechanism-contract.mjs` assertCoverage and
  `templates/qa/mechanism-contract.test.mjs` cover helper failure detection;
  scene probes must additionally inject an empty/type-mismatched sample set,
  zero radius and a known actual-geometry overlap and reject each. Record fresh
  source/build hash, successful build command, loaded artifact identity, probe
  method, counts, tolerances, worst pair/phase and evidence paths in the report.
  Failures or missing browser/visual/sweep coverage remain FAIL/UNVERIFIED.
  Never infer full mechanical certification from scalar budgets, 26 numerical
  highlight states, screenshots alone or a stale successful report. Evidence:
  historical `quartz-watch/qa/construction-report.json`; no workspace dependency.
- **Judge orientation from the transform, not the pixels.** At diorama scale a
  back and a front read the same: a 4x-downscaled strip once made a
  correctly-facing figure look like he was climbing in backwards, and the
  "spin" it appeared to do was an artefact of re-reading the crop. Print
  `group.rotation.y` and compare it with `atan2(dx, dz)` of the expected facing
  vector before re-shooting a facing fix.
- Screenshot 1280x800, 1388x950 (iPad landscape) and 390x844 (phone). Zero page
  errors in all three, and the framing holds at each aspect.
- Two shots 1.5 s apart differ (the loop is alive) and the camera position is
  identical after resetting the hero pose.
- A 1:1 crop shows square pixels, a dark contour, no speckle on flat deck.
- **Pairwise distance sweep** across every multi-actor beat: freeze in 0.3 s
  steps, log x/z and the pairs under 0.6 m. Held for two samples means jammed.
- **Position logs across every one-shot boundary**: consecutive samples differ by
  centimetres, never by a body length.
- Isolated portraits per figure: no gaps, knees bend backward, nothing floats.
- **Queue gate strip.** Sample a walking customer every 0.15 s across two
  strides; log root speed, `state.moving`, hip/shoulder angles and slot. No
  standing gesture may be non-zero while speed is non-zero; the leg angles must
  alternate; serve must be at least 0.25 s after arrival.
- **Carry contact log.** During every carry beat, print both wrist positions,
  the prop's world bounds and the distance from each palm to the prop. The palms
  stay within 0.08 m until release; the prop does not move more than 0.05 m in one
  frame except during the authored handoff blend.
- **Mount strip.** Nine side frames from load to seat; log wrists, ankles, prop
  base and seat. No boot passes through the bars/seat/body, both soles reach the
  boards, and the rider root follows the seat after departure.
- **Scale check.** The 30%-smaller request is a camera move; assert
  `actualDistance / fitDistance ≈ 1 / subjectScale`, the projected slab width fell
  by the same factor, `post.size ≈ CSS size × renderScale` (capped), the
  slab/world clip/shadow camera and CSS frame are unchanged, and the standalone
  still frames on the page.
- **Night 1:1.** Three distinct dark values, a visible practical with a pool, no
  clipped white, no pure black. For an interior, the glass must not tint the
  room; for a passing bus, the occlusion frame at the hero timestamp must still
  show the hero.
- **Quadruped strip.** Profile, three-quarter, sit and jump. Ears read as ears,
  pupils are vertical, rear hocks bend backward, the tail curves; a rabbit or a
  dog silhouette fails.
- **Exit strip.** For a social actor: contact, turn, walk out, prop in hand. No
  debris or stain unless the scene is a death; the residue is the changed place.
- When a prop never appears, print its world position rather than trusting
  `visible`. `getWorldPosition` on a merge-eaten object returns local coordinates
  because the original was unparented; that is the signature of the merge pass.

### Per-entity frame recording

A still cannot prove a jump. A six-frame strip cannot prove that the third
character in the scene is animating, because the other two are moving in the
same picture. `qa/frames.mjs` records **one dense series per entity**, and prints
a verdict for each, so a dead actor cannot hide behind a live neighbour.

```bash
BASE_URL=http://127.0.0.1:4180/index.html \
ENTITIES='({ hero: d.cast[0].model, guard: d.cast[1].model })' \
FROM=4 TO=9 FPS=12 OUT=qa/frames STATIC=guard \
  node templates/qa/frames.mjs
```

What it does per entity:

- **Isolates it.** `ISOLATE=scene` (default) hides every mesh not on that
  entity's branch, so the signature is really about this actor; `siblings` hides
  the other registry entries only. Restored afterwards.
- **Fits one camera to the swept bounds** and keeps it for the whole window, so
  travel stays visible. A camera that follows the actor hides exactly the drift
  you are looking for.
- **Samples at `FPS`** (12 by default) across `FROM..TO`, and for each frame logs
  the world bounds centre in NDC, plus a 32x32 luminance signature.
- **Scores four ways.** `empty` counts frames where the entity is not on screen,
  `energy` is the largest mean luminance delta between consecutive on-screen
  frames (a flat line means the actor is not animating), `step` is the largest
  NDC jump (a teleport), and `OFFSCREEN` counts frames outside the frustum.
- **Writes a contact sheet** per entity, `qa/frames/<name>/sheet.png`, and the
  numbers to `report.json`. Exit code 1 when anything is flagged, so CI can gate.

Reading it:

| Verdict | Means | What to do |
| --- | --- | --- |
| `ok` | moved, stayed inside, no jump | still read the sheet for pose quality |
| `FROZEN` | energy under `MIN_ENERGY` | the pose blend is not reaching this actor |
| `TELEPORT` | an NDC jump over `MAX_STEP` | a state boundary is snapping, not blending |
| `EMPTY n/N` | not rendered for over half the window | wrong window, or it spawns later than you think |
| `NOT-IN-WINDOW` | never rendered in the window | the entity name is wrong, or it is invisible |
| `OFFSCREEN` | left the frustum | staging, camera fit, or a run that goes too far |

Two rules for the numbers. A blank frame beside a full one must never be allowed
to supply the energy for a window, so only consecutive on-screen pairs are
compared. And an entity that is meant to hold still (a seated figure, a guard at
a post) goes in `STATIC=`, or you will get a `FROZEN` that means nothing.

Run it for every hero actor, and for each scripted beat that involves them:
send-out, attack, hit, death, exit. The sheet is the evidence; the verdict only
tells you which sheet to open first.

### Detail And Animation Audit

Run this after the build and before shipping. It is deliberately visual; a
number cannot prove that a club is touching a door.

1. **Grey silhouette.** Hide the palette/post (or desaturate) and shoot the hero
   frame at 1:1. Every tower, creature, landmark and prop must be nameable from
   its outline. If two objects merge, restage.
2. **Hero crops.** One 1:1 crop per tower, one per species, one per landmark, one
   per large prop. Look for: floating parts, untextured primitives, duplicate
   silhouettes, sub-pixel speckle, missing contact shadows.
3. **Threshold crop.** The gate/portal/spawn mouth is empty for 2 m. No smoke,
   crates, rocks, bones or vines. The boss's weapon is visible against the door.
4. **Attack strip.** For each weapon tower: acquire, release, travel, impact,
   recovery. The muzzle/rail/crystal must be visible at release. For a support,
   aura or field: source, area, ramp, affected-target change, decay. A defence
   with zero events is a bug in the sim or the data, not "atmosphere".
5. **Death strip.** For each species: impact, mid-collapse, residue. Debris must
   be species-specific. A grey puff, sphere burst or rock shower fails.
6. **Boss contact.** Contact frame plus 0.2 s later. Contact must show the weapon
   on the goal, the goal's response (flash/crack, spray/gauge drop, sag/snap) and
   the first consequence; +0.2 s must show recoil or follow-through. The haft
   and bands must be visible at contact.
7. **Beam/field on/off.** Full channel, then the frame after the target dies or
   the field expires. No black band, no beam through the keep, no beam on the
   corpse, no field left glowing after its timer.
8. **Crowd strip.** 6 frames at 0.1 s across a group. Actors must not share a
   phase, stack at one waypoint, or walk through each other.
9. **Numbers.** Print `events`, `shots` per tower, `deaths` per species, `maxD`
   per species, loop length and console errors. A species with zero deaths did
   not finish its route; a tower with zero shots never joined the fight.
10. **Rectangle and seam test.** Look at every large translucent plane and every
    slab edge in a 1:1 crop. A hard-edged grey rectangle near a sign is a flat
    quad halo; a step/lip/black slot at the surface is an unfinished edge. Fix
    both before the standalone pass.
11. **Standalone.** Open the built HTML over `file://` once. `ready: true`, no
    console errors, and a frame that matches the served page.

Keep the proof pack: `shots/hero.png`, `shots/tower-*.png`, `shots/death-*.png`,
`shots/boss-contact.png`, `shots/boss-recoil.png`, `shots/beam-off.png`. A future
chat can compare its own pack to these crops.

### New-Chat Handoff

When a different diorama is requested in a fresh chat, the skill should produce
the same level without re-deriving it:

1. Read this file and `templates/DESIGN.md`.
2. Fill the design sheet before coding: premise, camera side, cast, systems,
   five beats, detail budget.
3. Block out in grey and shoot the five beats at 1:1.
4. Build the pipeline in the order in this file: palette, camera, light, post,
   props, cast, detail pass, animation/systems, effects, QA.
5. Apply the detail bar per hero object and the animation bar per actor.
6. Run the detail and animation audit plus `qa/audit.mjs`, not just "does it
   load".
7. Ship the standalone and leave `DESIGN.md`, `README.md` and the code agreeing.

If the new subject has no combat, replace tower grammar with **Machine Grammar**
(loom, press, crane, oven, pump) and creature grammar with **character grammar**
(customer, worker, animal, vehicle). Audit outputs as fields when there is no
projectile. The five layers and the audit still apply: idle, locomotion, action,
reaction, residue.

### Comment Triage

When the user marks a region, project the object instead of guessing pixels:
`obj.getWorldPosition(v); v.project(camera); px = (v.x*0.5+0.5)*w`.
If it is not obvious, raycast that pixel and read the first few hits' materials and
heights: the first hit is the surface they see, the second is what is under it.
Then fix the marked region and nothing else, and prove it with a zoomed crop at the
same timestamp.

## Pitfalls

- **A building's roof is a large visible surface at 33 degrees.** Look down onto
  it and dress it, or keep buildings lower than they are deep.
- **A merge pass eats anything whose visibility is animated.** Batching
  same-material siblings keeps one `visible` flag, so hidden cargo comes back as a
  single invisible mesh that never appears, and the survivor's `getWorldPosition`
  reports local coordinates. Tag runtime-toggled meshes `userData.noMerge = true`.
- **Canvas size is presentation, resolution is the buffer.** Shrinking the display
  keeps the buffer; moving the buffer changes the art. `renderScale` 1.2–1.5×
  on a small subject sharpens it without making it larger; measure fps and inspect
  a 1:1 crop before keeping it.
- **Raising the buffer exposes geometry that hid at the old grid.** Re-run the
  portraits after any resolution change: floating hats, detached stripes and
  oversized noses show up there first.
- **A prop swallows a figure placed inside it.** Sit the figure on the near rim
  with the limbs outside; more detail inside will not read anyway.
- **Lying bodies convert joint Z rotations into vertical lifts.** Flatten
  shoulders to about ±0.15 and keep elbows near zero.
- **A springboard must move and the rider must follow it**: pivot at the root,
  integrate a spring on `rotation.z`, and put the feet on
  `pivotY + h*cos(flex) - arm*sin(flex)`.
- **A standing gesture blended into a walk straightens the legs and slides.**
  Gate `PAY`, `ORDER` and `POINT` on `!state.moving`; a still at one timestamp
  will not catch it, a 0.15 s strip will.
- **A carried prop parented to the root leaves the hands at the first turn.**
  Keep it in world space, solve from the wrists each frame, and log palm-to-prop
  distance.
- **A leg swung with hip X goes through the handlebars.** A side mount needs hip
  Z abduction, knee flex and a small root arc; hip X is for walking and sitting.
- **Shrinking the geometry or the canvas frame to satisfy "smaller"** shrinks
  the world clip, contact shadows and slab, or changes the 1:1 crop. Move the
  camera with `subjectScale` instead; the frame and backing buffer stay fixed.
- **A DOM caption on the white paper** is outside the diorama. Model the sign or
  use the browser title.
- **A hat hovering above the skull** is a brim at 0.225 instead of 0.192.
- **Oversized nose**: 0.044 at this camera is a snout, 0.038 is a nose.
- **Two figures at 0.8 m read as one silhouette.** Judge spacing from numbers.
- **A shared window synchronises a group.** Stagger every actor's window.
- **A door left open beside idle actors reads as stuck in the doorway.**
- **A pose switch is not a transition.** Cutting from a run into a transfer pops
  the whole body: blend out over the last 10 to 15 percent and hold a beat.
- **A cannon with a brass end cap is a baton.** Hollow collars, a recessed dark
  bore, a back disc and a lip ring; the hole must survive the 1:1 crop.
- **Fixed deck props parented to a yaw group sweep with the gun.** A powder keg,
  shot pile, rammer or crew member under the turret turns with every aim. Put
  them on a static wall locker outside the barrel arc, not just on the root at
  deck height; test world positions and bounding-box overlap at both yaw extremes.

## Project Layout

```
DESIGN.md              filled design sheet: premise, cast, systems, beats, budget
CREDITS.md             every imported model: URL, author, licence (CC0/CC-BY/owned)
refs/                  reference frames: contact sheets stepped from the source clip
refs/SOURCES.md        research log: query -> found -> decision, per question
src/
  config.js            scene constants + clamp/lerp/smooth/pulse/hash
  main.js              renderer, scene, clip planes, resize, rAF, ?t= freeze
  core/
    palette.js         N entries + named C map
    post.js            PixelPost: gamma, grade, ink, dither, snap, rim (pixel only)
    stroked-toon.js    optional approved OutlineEffect + four-step toon materials
    materials.js       every material, palette-validated
    geometry.js        roundedBox, addBox, lathe helpers
    mechanism-contract.mjs  shared anchors, coverage/end-plane budgets + scoped contact policy
    inspection.js      rigid assembly/piece emphasis, reveal authorization, exact restoration
  ui/
    education-dock.mjs education-dock.css  dependency-free single lesson surface
    merge.js           mergeSiblingMeshes: one draw per material per group
  scene/
    camera.js  lighting.js  street.js  bank.js  props.js
    car.js             shell, doors, boot, seats, cargo
    peopleModel.js     base rig (swimwear/aquatic)
    peopleModel-street.js  clothed rig: heads, layers, hats, hands
    people.js          the cast: poses, walk/run, tracks, buildCast
    stage.js           the beat sheet + every actor as a function of t
    effects.js         contact shadows, smoke, spill, siren
build.mjs              esbuild bundle, index.html, standalone HTML
qa/
  shoot.mjs            viewports + console errors + named timestamps
  inspection.test.mjs  helper state/identity/ownership and injected failure regressions
  inspection-browser.mjs  synthetic contrast/depth/restoration fixture, three presets
  probe-*.mjs          one-off numeric probes (facing, anchors, NaN, spawn pose)
  audit.mjs            scene lint: halos, fades, camera/render scale, exits, FX
  portrait.mjs         isolated figure/framing shots through a debug camera
  strip.mjs            N-frame motion strips (fails on a frozen loop)
  probe.py             colour runs across an edge
  sweep.mjs            pairwise distances + jam/teleport verdict
  tile.py              tile a motion strip
  README.md            audit contract, commands, failure table
```

Wire order in `main.js`: renderer → scene → camera → post → clip planes → lights →
materials → street/bank/props → cars → cast → effects → merge → stage. Merge once,
before the stage is created, so the timeline binds to the surviving meshes.

A defence or arena subject replaces `street/bank/car` with `path/towers/keep`:

```
src/scene/
  path.js          route samples, arc length, at(d), ground height
  towers.js        foundations, machines, crew, recoil pivots
  monsters.js      rig, poses, walk/fly/hop, boss club
  keep.js          gate, walls, door leaves, cracks, goal response
  roster.js        species stats and wave table
  battle.js        deterministic 40 Hz sim, shots, impacts, deaths, gate hits
  props.js         camp, skull tree, cart, torches, trees, portal dressing
  effects.js       beams, projectiles, dust, smoke, shards, rings, souls
```

The same wire order applies: build the set, then the cast, then effects, then
merge once before the battle timeline reads the survivors.

When the beat sheet moves into its own module, delete the superseded director and
update the README's beat table in the same pass. An unreferenced six-hundred-line
timeline and a table that disagrees with the code are exactly what the next reader
trusts.

`templates/` carries runnable copies, not excerpts. Foundations: `post.js`,
`palette.js`, `camera.js`, `lighting.js`, `geometry.js`, `build.mjs`. Cast and
motion: `peopleModel.js`, `peopleModel-street.js`, `poses.js` (the pose library,
including the four climb poses and the walk/run cycles), `transfer.js` (seating,
the climb, stand spots, facing), `track.js` (arc-length paths with lane offsets
and smoothed ground height), `stage.js` (beat table, `keysAt`, `place`, the
actor loop, a car state machine). Props and systems: `detail.js` for prop
assemblies (including `haloPlane`/`softDiscTexture` for soft light cards),
`combat.js` for deterministic timing and death grammar, `creature.js` for a
fight between two rigged actors (stage-local `aimYaw`, bone-space `headAnchor`,
`uprightQuat`, the `makeHurtModel` severity table and `sendOut` throw-and-return
geometry). Effects: `water.js`, `wake.js`, `splash.js`. Sheets: `DESIGN.md`,
`CREDITS.md`, `SOURCES.md` (the research log, filled before the first mesh).

`stage.js` ships as a **skeleton with one worked actor chain**: a figure leaves a
car, walks a route, comes back and climbs in. It is deliberately not a story. The
structure it does ship is the part that is tedious and easy to get wrong: beats
ordered monotonically in `t`, one branch per actor per frame, the contact shadow
following `place()`, and the door as a timeline rather than a state. Replace the
cast, the routes and the beat table; keep the skeleton.

`car.js` is still not in the kit. A vehicle is the most subject-specific prop in
the scene, and the recipe (dimensions, door pivots, windscreen versus seat, boot
well, livery split) is written above at the length it needs. Everything else you
need is a file.

`qa/` is the harness: `shoot.mjs` (viewports, named timestamps, console errors,
the buffer/camera/draw-call line), `audit.mjs` (flat-glow, whole-object fade,
camera/render-scale, early-hide, teleport, idle/orphan emitter and margin checks
against the optional scene contract), `portrait.mjs` (isolated figures through the debug
camera), `strip.mjs` plus `tile.py` (motion strips, which fail on a frozen
loop), `probe.py` (colour runs across an edge, the tool for "why is there a band
here"), and `sweep.mjs` (pairwise distances across a beat, with a two-sample jam
verdict and a teleport limit). They need `playwright-core` and a page that
exposes `window.__diorama` with `freeze(t)`; `verify/water/` is a worked example
that exercises the three water modules and shows what the acceptance output
looks like.

## Skill Maintenance

Keep a project-local postmortem of what the user actually reported, not what you intended. Installed-skill changes require an explicit maintenance request and filesystem approval; the following rules apply only during authorized maintenance.

1. **Add at most three rules per routine project.** A skill that grows by fifty
   small rules becomes unreadable and the next reader skips it; a deliberate
   major overhaul is a versioned release, not a stealth append.
2. **Every rule needs evidence and a test.** "Clear the threshold" came from a
   screenshot of smoke above a portal; the test is a 1:1 crop of the pocket.
   "The club must touch the door" came from a still at 41.075; the test is the
   contact frame plus 0.2 s.
3. **Promote repeated fixes.** If the same bug appears twice, it is a missing
   rule, not a one-off.
4. **Retire stale rules.** If a template or pipeline change makes a rule
   obsolete, remove it in the same edit.
5. **Bump the version.** Patch for wording, minor for a new rule/section, major
   for a new contract or a reorganisation. Keep `SKILL.md.bak-v<old>` beside it.
6. **Update the templates and the project layout in the same pass.** A rule that
   points at a file that does not exist is worse than no rule.
7. **Test the skill on a new subject.** After a major edit, give a fresh model
   only this file and ask it to fill `DESIGN.md` for a different diorama. Fix
   every contradiction it finds; that is cheaper than discovering them after a
   build.

A useful postmortem entry has this shape:

```
BUG:    the club read as a rock at the gate
CAUSE:  end-on pose; haft hidden; no bands
RULE:   turn the boss 0.35 rad to the goal; build haft + bands + studs
TEST:   contact crop at the gate-hit timestamp; haft visible, head on door
```

Two entries from the truck-diorama correction pass:

```
BUG:    a light-grey rectangle floated beside the jumbotron
CAUSE:  a flat, untextured, additive PlaneGeometry used as a glow
RULE:   halos need a radial-alpha map, an emissive lens, or deletion
TEST:   qa/audit.mjs FLAT_GLOW plus a 1:1 crop of the board at the hero time
```

```
BUG:    both trucks vanished at the gate before the run-out finished
CAUSE:  visible=false keyed to a beat, not to world bounds clearing the slab
RULE:   hide only after the box is outside slab + 0.2–0.5 m; never fade solids
TEST:   qa/audit.mjs EARLY_HIDE over the full loop; exit strip at 0.2 s spacing
```

```
BUG:    the yellow truck smoked while parked, from a cloud above the cab
CAUSE:  continuous idle haze plus a guessed emitter point inside the body
RULE:   one start/rev event window, puffs born at the real stack tip; offset the
        birth point downstream if a canopy hides it, never the source anchor
TEST:   qa/audit.mjs IDLE_EMITTER / ORPHAN_EMITTER; event frame present,
        event + 1.5 s absent
```

## Field Notes: Two-Creature Combat

From a Pikachu vs Charizard battle diorama built against Sword/Shield and anime
footage. The rig, the effects and the send-out all broke in the same three ways,
and the fixes generalise to any fight between two rigged actors.

### Aiming is a local-space problem

Both rigs look down their own `+Z`, and both sit under a stage root that is
rotated (here 90°). Reading a world-space bearing to the opponent and writing it
to a local `rotation.y` aims the two *past* each other, toward the lens. Compute
the yaw inside the stage's own frame:

```js
const camLocal = cameraDirection.clone().applyAxisAngle(UP, -STAGE_ROT);
const aimYaw = (a, b, cheat) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  return Math.atan2(dx, dz) + camLocal.x * cheat;   // local, not world
};
```

Then prove it numerically, every half second, through the whole loop: forward
vector versus vector-to-opponent should sit at 0.97+, and it may only dip during
a deliberate spin. Eyeballing this at 300 px hides a 20° miss.

### Effects belong in bone space, not world space

Flames leaving a mouth must be anchored to the head joint, or they slide off the
jaw whenever the head turns. Convert the parent's forward and up into the target
bone's local space once at build time and keep the emitted point there:

```js
const localFwd = bone.worldToLocal(pivotPoint.clone().add(forward)).normalize();
```

Same idea for the aim of a projectile: take the muzzle from the bone matrix, not
from a hardcoded offset.

### Flat effects need an upright basis

`quaternion.setFromUnitVectors(+Z, viewDir)` picks an arbitrary roll, which is
why a kanji-shaped blast can arrive upside down or rotated 40°. Build the basis
from the lens explicitly:

```js
const right = new THREE.Vector3().crossVectors(worldUp, viewDir).normalize();
const up = new THREE.Vector3().crossVectors(viewDir, right).normalize();
mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, viewDir));
```

### Explosion vocabulary

A hit burst is a hot core with ten short sparks radiating out of it, plus a ring
on the ground. That is the whole recipe; it reads at any size.

- No cone petals, no triangle fans, no straight bars, no scaffolding around the
  blast. Every one of those reads as geometry, not energy.
- Layered silhouettes beat layered spheres: a body colour, a hot mid, a core,
  each scaled *individually* (`m.scale.set(k,1,1)` per layer) — sharing one
  geometry between layers makes the layers invisible.
- A continuous stream is **one** mesh with overlapping segments. Separate quads
  with per-segment jitter make a ladder with seams.
- Nested cones hide their own core: nudge the inner layers toward the lens and
  lift them so the hot tip clears the outer silhouette.

### Pin the effect to where the hit landed

An eruption anchored to `actor.position` every frame crawls across the slab while
the actor slides out of it, which is exactly the "something feels off, it moves a
bit" report. Latch the anchor once, at the moment of impact, and animate from
that fixed point. Same for the projectile's target: aim at the latched point, not
at the live chest position.

### Send-out and recall are different verbs

- Send-out: the trainer throws. The ball leaves the hand on an arc, spins, lands
  on the mark, the lid opens with a white burst — flash, smoke puff, sparks, a
  ground ring — and the creature springs out *at full size*, covered by the flash.
  The ball then snaps shut and returns to the trainer's hand.
- Do **not** replace that with a slow orb the creature materialises inside; that
  is the legendary-encounter variant, and it reads as a bubble.
- The red beam belongs to a recall or a knockout, never a send-out. If the ball
  glows red before release, it reads as a second, wrong beam — keep the release
  white.
- If the trainer holds a second ball while the thrown one is in the air, hide the
  held prop for the duration or the throw doubles.

`templates/creature.js` ships these five as runnable functions: `aimYaw`,
`headAnchor`, `uprightQuat`, `makeHurtModel`, `sendOut`.

### Hit reactions scale with the attack

One hit model, four severities: a light flinch (0.9 s, a tip back), a knocked-back
stagger (1.7 s, air time), a spin-out (1.3 s), and a full collapse (3.5 s, falls,
lies down, gets up). Rotate about the axis of the blow (`[dz, 0, -dx]`), pivot at
mid-body so the actor rocks rather than hinging at the feet, and add a small
vertical arc so the feet leave the ground.

## Changelog

- **5.7.0 — Remove Pixel Art V2.** Removes the V2 rendering contract and intake/design options at the user’s request. Classic Pixel Art is the recommended and explicitly delegated default; stroked-toon and pixel+stroke remain. V2 resources are archived, not active instructions. Regression: active intake/design expose exactly three presets, with no V2 dependency. Earlier changelog entries are historical only.

- **5.6.0 — V2 cast and action language.** Adds dedicated rounded-character construction, cast-specific shading and articulated action guidance. Requires garment-attached patterns, actual foot/grip contacts and deterministic action-strip checks for imported or authored cast; existing rigs are starting points, not automatic style passes.

- **5.5.0 — Terrain edge, not just ink.** Makes the irregular scattered-to-white ground perimeter a required V2 feature. Adds an independently authored terrain-only material coverage helper with shadow hooks, integration and edge-crop acceptance notes. Existing projects are not automatically modified; renderer verification remains per build.

- **5.4.2 — Standalone Pixel Art V2.** Removes external reference materials and adapted styles. Retains an independently specified edged/dithered rendering option and the two-step look/sourcing intake. No external implementation is bundled.


- **5.4.0 — Two-step commission intake.** Adds selectable Pixel Art V2 versus Classic Pixel, then separate hybrid / internet-throughout / fully agent-modeled sourcing choices. Explicit precedence replaces old automatic internet-first and three-option prompts. V2 requires its own renderer and rendered checks; the classic post template is not falsely advertised as V2. Updates design receipt and sourcing evidence. v5.3.0 preserved.


- **5.2.0 — Pose-aware clearance.** Adds actor/animal/building space reservation, seat frames/occupancy and action-path checks to both profiles. Ships sphere/capsule/OBB nearby-pair sampled audits with exact time-window contact rules and independent proxy inventory, plus live CPU skin/morph pose bounds. Regressions cover limbs/tails, seats/backrests, buildings, temporal crossings and missing/invalid coverage. Proxy/sample limits remain explicit; full guide, model-first sourcing and narrative no-education-UI preserved.

- **5.1.0 — Model-first by default.** Requires finding, acquiring and using fitting commercially modifiable/redistributable internet assets for major roles, not merely logging a search. Retains Polyfork-first narrative sourcing and educational accuracy gates; verifies actual import/style/motion and final-scene inclusion. Free-first; paid assets require approval. Hand-building is a justified gap/fallback, not the default. Preserves the full long guide and narrative no-education-UI boundary.

- **5.0.0 — Long-form restoration.** Restores the complete 3.18 guide and detailed design sheet after compact-profile educational UI leaked into ordinary scenes. Narrative by default; no educational card/dock/lessons/callouts without explicit explanatory intent. Keeps Polyfork sourcing, commercial/adaptation/redistribution checks, actual-subject representation and tested construction helpers. Profile-consumer tests are bounded evidence, not a rendered amusement-park benchmark.

- **3.18.0** — Consolidates educational UI/selection/lesson rules into one V8-exact
  authority with crossrefs; resolves placement, focus, preset-intro, ghost-shell
  and reciprocal scale contradictions. Three quartz-watch evidence/test contracts:
  all repeated mating interfaces from shared anchors/axes with real holes and
  noncoplanar ends; assembly/piece inspection with class-safe reversible state;
  non-vacuous actual-geometry QA and fresh build identity. Ships rigid inspection
  and shared-interface helpers with class/ownership/empty-fixture failures and a
  three-preset rendered contrast/depth/restoration regression; preserves context
  and authorizes internal occluder removal explicitly. These tests are bounded
  helper evidence, not full mechanism/UI certification.
  Missing straps/back remain the existing 3.17 completeness gates, not new rules.
  Full 3.17.0 preserved as `SKILL.md.bak-v3.17.0`.

- **3.17.0** — Three whole-object completeness gates prompted by the user-reported quartz watch missing straps and back: whole silhouette/scope, exterior/rear attachment construction, and a reconciled completeness matrix with proof and negative checks. Extends the Detail Bar and design template across profiles/presets; preserves prior UI, mechanics and style contracts. Per-scene checks remain required; no model certification is claimed.

- **3.16.0** — Code-defined V8 educational UI contract and copy-in `education-v8.css`: exact neutral tokens, reserved 360px right column/mobile dock, DOM/control hierarchy and measured regression gates. Records grandfather-clock beige/glass/detached-title drift; supersedes ambiguous default-placement wording without changing render presets or mechanics.

- **3.15.0** — LEAP-1B repair checklist: retained preset provenance, closed exterior/explicit Inside/reset lifecycle, UI-safe complete-assembly fit with correct camera-axis sign, and reference-first white compact educational UI. Adds design fields and scoped white-stage CSS. Tests remain per-scene; geometry sampling does not imply full collision certification. v3.14.1 preserved as backup.

- **3.14.1** — Documents the calibrated V8 soft-glow/holographic inspection implementation: isolated material variants, ghost-shell depth policy, selective live-transform feature edges, multi-material restoration, ownership/disposal, and rigid-versus-deformed limitations. Adds matching design/QA acceptance fields; no renderer preset or scene behaviour changed. v3.14.0 preserved as `SKILL.md.bak-v3.14.0`.

- **3.14.0** — Three evidence-backed regression rules: mating interfaces/local axes/shared anchors with bore/bevel/axial budgets and connected ports/supports; full-assembly swept-clearance coverage with surface-scoped intended-contact policy and explicit sampled-proof limits; compact neutral sans educational UI with progressive causal steps bound to frozen scene state. Adds dependency-free mechanism-contract and education-dock templates, scalar/contact-policy and browser helper regressions, design/QA sheets. V8 rod repair and the incomplete earlier 12/12 report are the evidence, not a guarantee of future bug-free construction. v3.13.0 preserved as `SKILL.md.bak-v3.13.0`.

- **3.13.0** — Mandatory `Render Preset Gate`: the agent asks once, at project
  start, which of the three looks to build in (pixel default, stroked-toon,
  pixel + stroke hybrid), instead of asking only once it had already decided to
  try the optional look. An explicit style in the request counts as the answer;
  naming a look in a reference, or the word "toon" on its own, does not; silence
  resolves to pixel and is recorded as a delegated default. The grey blockout and
  the research lookups continue while the answer is pending and only the
  presentation pass waits. Updates the frontmatter description, the intro,
  `One Prompt, One Build`, `Step 0`, both preset sections, the pipeline and
  `templates/DESIGN.md`. v3.12.0 preserved as `SKILL.md.bak-v3.12.0`.

- **3.12.0** — Motion graphics hardened by a full-cycle, frame-by-frame audit of
  the four-stroke engine: effects are derived from the moving free volume instead
  of a spline that pierced the valve; the direction-dependent cone extent is
  fitted rather than only the centre; anchors, length normalization, single-row
  chevrons and flame-coupled fade are specified; ignition flash is capped; and
  every Y constant is declared in one local space. Adds the 720° vertex
  containment sweep, the adjacent-degree no-teleport bound and the 15°-step
  contact-sheet gate, plus nine new recorded failure modes. v3.11.0 preserved as
  backup.

- **3.11.0** — Motion-graphics primitives recorded as first-class geometry:
  forward-axis/tip convention tests, no arrows inside opaque bodies and no
  depth-test x-ray, minimum legible effect scale, free-volume sizing with a
  sign check, compact ignition kernels, one-idea arrows, un-outlined FX,
  phase-bound deterministic lifetimes, connected hollow outlets, real bores
  through crossed flanges, and reversible selection glow/dim/focus. Adds the
  ten recorded failure modes from the four-stroke engine. v3.10.0 preserved as
  backup.

- **3.10.0** — Mandatory user orbit for every preset with deterministic hero reset, no auto-spin; first-class educational mechanism profile, single accessible dock and one live part explanation; component manifest and ratio/kinematic/contact acceptance; optional confirmed low-resolution pixel+stroke helper with one selective outline pipeline. v3.9.0 preserved exclusively as backup.

- **3.9.0** — Optional subject-independent `stroked-toon` illustrated-miniature
  preset, calibrated from the coffee-rig repairs: explicit ask-and-wait gate,
  native antialiasing, four-step toon ramp, selective warm ink outlines, bevelled
  assemblies, sound cavity/contact construction and related prop clusters.
  Pixel remains the default. Documents overrides to conflicting pixel-only
  camera/post/empty-paper rules, adds `templates/stroked-toon.js` and design-sheet
  consent/preset fields. Checks: material/ramp tests, module bundle, unrelated-
  subject spec review; renderer appearance still needs per-project visual QA.
- **3.8.0** — `qa/frames.mjs`: a per-entity frame recorder. Samples one dense
  series per entity across a window, isolates it (branch, siblings or full
  scene), fits one camera to its swept bounds so travel stays visible, and scores
  every entity: `energy` (flat means frozen), `step` (NDC jump means teleport),
  `empty` frames, `OFFSCREEN`, with `STATIC=` for actors meant to hold still. Each
  entity gets a contact sheet plus a row in `report.json`, and the script exits
  non-zero on any flag. New `Per-entity frame recording` section in Verification.
  New `Long builds and context` section: compaction is lossy, so state lives in
  `DESIGN.md`, `SOURCES.md`, `CREDITS.md`, `report.json` and the beat table, and a
  post-compact agent re-runs the harness instead of trusting its summary.
- **3.7.0** — Research-first release, from the Pikachu vs Charizard battle
  diorama. New `Research Before You Model` section: step the source footage into
  contact sheets and write the motion grammar down before modelling, prefer
  game footage over fan cuts, and check free commercial-use libraries (Poly
  Pizza, Sketchfab CC0/CC-BY, Quaternius, Kenney, user-supplied AI meshes) before
  hand-modelling a creature; `CREDITS.md` + licence gate + `fitModel` pipeline +
  forward-axis probing; shots-as-acceptance-test. New `Field Notes: Two-Creature
  Combat` section: stage-local aiming with a numeric facing sweep, bone-space
  effect anchors, upright billboard basis, explosion vocabulary (no cones/bars/
  scaffolding, per-layer scaling, one continuous stream), latching effect anchors
  to the impact point, send-out vs recall grammar (throw → arc → open → burst →
  full-size exit → ball returns; red beam only on recall), and severity-scaled
  hit reactions about the blow axis. Project layout gains `refs/` and
  `CREDITS.md`.
- **3.6.0** — Renamed to Diorama throughout: the playbook, templates and QA docs
  now call the artifact a diorama. No code behaviour changed.
- **3.5.1** — Camera-scale rule made explicit: `subjectScale` is a post-fit
  multiplier (`0.70` = 30% smaller linearly), while `fillX`/`fillY` stay a fit
  margin. The camera template now exposes `fitDistance` and `subjectScale`;
  `qa/audit.mjs` now proves `distance ≈ fitDistance / subjectScale` when those
  two fields are exposed, and `post.size ≈ CSS × renderScale` when the post
  exposes it. Added the
  Dust Kings calibration (fit 67.93 → actual 97.05, projected slab 872 → 611 px)
  and a rule against shrinking the geometry or canvas frame to create margin.
  `PixelPost` gains a `renderScale` argument; Dust Kings renders at 1.25× (buffer
  1640 × 950 on a 1312 × 760 CSS canvas) so the smaller diorama keeps its edge
  detail without changing page size. The resolution section now separates buffer
  from layout and warns about the frame-rate cost.
- **3.5.0** — Surface/Motion/Event-FX correction release from a truck-diorama
  postmortem: finish heightfield/slab edges flush (no lip or portal), keep every
  exiting mover visible until its world bounds clear the slab, never fade a solid
  hero with material opacity, gate exhaust/steam/dust by authored event windows
  with the emitter at the physical nozzle, and replace flat untextured halo
  quads with radial-alpha sprites. New `qa/audit.mjs` checks flat glows,
  whole-group fades, early hides, teleports, idle/orphan emitters and paper-margin
  leaks; `shoot`, `portrait`, `sweep` and `strip` now fail with a nonzero exit
  code; QA README documents the optional audit contract. New DESIGN audit sheet;
  `detail.js` gains `haloPlane`/`softDiscTexture` so a soft light card is the
  default.
- **3.4.0** — The fragile code is now shipped, not described: `poses.js`,
  `transfer.js` (climb, stand spots, facing), `track.js` and a `stage.js`
  skeleton with a worked actor chain; `qa/` as runnable scripts (shoot, portrait,
  strip, probe, sweep) instead of a checklist; Numbers split into invariants and
  calibrated values. Water, wake and splash re-verified in `verify/water/`, which
  found two real defects: the splash used `Math.random` (now seeded) and neither
  effect could be frozen (both now expose `reset()`; the harness re-simulates from
  zero and a two-frame diff fell from 334 to 18 pixels). `build.mjs` writes a
  favicon stub so the 404 stops polluting the console gate.
- **3.3.0** — Social/life-scene release from the Night Market build: clothed-cast
  craft (skull/jaw head, hairline, layered garments, hands), carry/handoff and
  crate-loading rules, scooter/cargo-bike anatomy, two-wheeler mount with hip-Z
  abduction, service/queue state machine with `moving` gates, Night Market worked
  example and fix table, 2x backing/scale-by-camera guidance, empty-paper rule,
  social verification logs, night/practical/headlight guidance, cutaway and
  glazing rules, bus/van anatomy, cat/dog quadruped rig and gait, generalised
  `DESIGN.md` with Life/Service and Contact/Choreography sheets, new
  `peopleModel-street.js` template, scene fast path, and a laundromat/workshop
  router row.
- **3.2.3** — Hollow-object rule: cannon bores, pipe mouths, chimney flues, lamp
  chimneys and tunnels need open collars, a recessed dark bore, a back disc and
  a lip ring. Added 1:1 bore audit and the brass-end-cap pitfall; the Bombard
  cannon now has an open muzzle instead of a cap.
- **3.2.2** — Fixed cannon ammo station rebuilt as a wall-mounted locker below
  the deck: shelf, brackets, powder chest, shot tray and hung rammer, outside
  both yaw sweep and barrel arc. Added bounding-box overlap check to the pivot
  audit and recorded the wall-locker pattern.
- **3.2.1** — Rotating-assembly parentage rule: only the gun may live under yaw;
  fixed deck stores go on a static group. Added pivot-parentage strip and
  acceptance check; cannon keg, shot and rammer moved off the yaw group.
- **3.2.0** — One-prompt commission mode: default commission table, assumption
  line, ten-scene router, universal four-question generator, bakery worked
  example, autonomous eight-pass build, cut-count-not-detail rule and
  one-prompt acceptance; reading order trimmed to the sections needed.
- **3.1.0** — Canonical numbers/camera/light/post/palette contract; field and
  machine grammar; goal-response vocabulary; FX edge, snap and contact-context
  rules; crew/defender rule; human death grammar; climb and rotating-emitter
  rules; expanded `DESIGN.md`; new `detail.js` rope, trophy-board and
  contact-shadow helpers.
- **3.0.0** — Detail Bar, Animation Bar, new-subject intake, reference density,
  detail recipes, system/combat animation, attack/death audits, beam/artifact
  triage, detail-and-animation QA, `templates/DESIGN.md`, `templates/detail.js`,
  `templates/combat.js`.
- **2.1.0** — Combat Readability section; threshold clearing, tower grammar,
  boss goal contact, death species, standalone `String.replace` guard.
- **2.0.0** — Palette/post contract, camera solve, cast rig, vehicle/seat
  transfers, clipping, verification.
