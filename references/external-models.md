# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Borrowed models: the Polyfork CDN

A free catalogue of ~2,800 low-poly models, every one hotlinkable with no account, commercial use, no attribution. It is worth knowing for one reason: the models are metres, Y up, origin on the ground, front facing +Z, flat-shaded vertex colours on a single material. No textures to relight, no import pipeline, no scale guessing.

### Default sourcing compliance

Search AND use suitable licensed assets by default, for major roles rather than a token background prop. The 5.1 internet-first rule in SKILL.md governs: Polyfork is first for narrative kits, not the only source; a miss continues to relevant model libraries. A licensed candidate must also pass actual import, palette/scale/detail, performance and requested motion/selection checks. Do not reject a useful model merely because it needs a pivot/identity wrapper. Prefer free commercially adaptable, scene-redistributable assets; paid downloads need approval. Record real downloaded files/hashes, license evidence and final-scene use, or the specific reason no fitting model could be used. Never force an unsuitable model to meet an asset quota.

### When it earns a place

**Narrative scenes: the catalogue is the primary source.** Ground, buildings, vehicles, vegetation, furniture, signage, animals, cast, clutter — sweep it before modelling, and hand-model only what the sweep proves absent or what the scene must select, move or explain. A street assembled from eight hand-rolled primitives when a matching kit shipped 60 coherent parts is a failed scene, not a disciplined one.

**Educational scenes: verified teaching geometry is allowed.** Follow `educational-models.md`: shortlist at most three relevant assets; require documented free commercial use, modification and scene redistribution, then check identity, dimensions, critical geometry and usable components. Import the named object/parts when they pass; author semantic identities, interfaces, missing internals and evaluator behavior. A pretty exterior alone cannot establish working mechanics. This bounded educational search does not require the narrative full-catalogue sweep below.

In a narrative scene a borrowed asset may carry the hero prop if the sweep found the actual object and it survives palette/scale checks. Selection is not a reason to reject imported geometry: attach explicit ownership and local anchors. Explaining a mechanism additionally requires the educational accuracy/structure gate; author any missing teaching interfaces instead of claiming unverified internals are accurate.

### Sweep the catalogue before you model

One pass, every noun, recorded. Run it after the DESIGN sheet and before the layout milestone. It is cheaper than modelling, and it is the difference between a scene standing in a real world and one assembled from guesses.

1. **List the nouns.** Ground/terrain, each building type, vehicles, vegetation, furniture, signs, tools, animals, people, and the clutter that sells scale. One row per noun in `sweep.md`.
2. **Enumerate the catalogue once.** `GET /api/assets?per_page=100&page=N&fields=compact` until `total` is consumed — 28 pages for the current 2,766 rows. Write `id`, `class`, `triangles`, `kit` to `sweep.csv` with a local script: a page is ~42 KB of JSON and the full set is ~1.1 MB, so it is never pasted into context. No detail calls yet.
3. **Query each noun four ways:** the word, a synonym or US/UK variant, an era or material qualifier, and by class (`class=prop|building|vehicle|character|animal|attachment|terrain|ultra|hand`). Read `coverage` on every answer and `unmatched_terms` after a miss.
4. **Sweep kits for places.** `GET /api/kits`, then `/api/kits/{id}`. Adopting a kit beats assembling singles that then need a coherence pass: one palette, one scale, one grid, and a `layout` of real placements you can rebuild exactly.
5. **Fan out from the best hit.** `/api/assets/{id}/matching` walks same kit → shared palette → compatible scale. One call turns a prop into a coherent group.
6. **Decide per noun, then stop.** `sweep.md` rows: noun | queries | candidates seen | chosen id and why | rejected. "Absent" is a legitimate recorded answer that sends you back to hand-modelling, or changes the scene. A second pass only when a hit's kit suggests a better family — never the same query again at a later milestone.

The coverage words mean different things and the wrong reading produces a worse scene. `none`/`poor`: the catalogue does not have it — say so, model it, or `POST /api/demand`. `filtered_out`: it exists and your filters removed it (`matches_before_filters` says how many) — relax a filter, never report a gap.

Metadata sweeping is free and unrestricted; what is rationed is remix *baking* (~40/hour anonymous). Download nothing in bulk — hotlink `/cdn/` at runtime.

### Find one asset

1. `GET https://polyfork.dev/api/assets?q=<plain+words>&per_page=24&fields=compact` — rows already carry `size_m`, `origin_y`, `triangles`, `has_rig`, `has_ik`, `has_skeleton`, `kit`.
2. `GET /api/assets/{id}` — detail: palette, clips, license, exact download URLs, `physics`, decals.
3. `GET /api/assets/{id}/matching` — same kit, then shared palette, then compatible scale.
4. `GET /api/kits/{id}` — a kit is a *place*: shared palette, shared scale, shared grid module.

Agent docs: [`/llms.txt`](https://polyfork.dev/llms.txt) is the reference, [`/prompt.txt`](https://polyfork.dev/prompt.txt) is the same catalogue written as working instructions. MCP endpoint `https://polyfork.dev/mcp` exposes `search_assets`, `get_asset`, `find_matching`, `get_kit`. Browsing needs no key.

Enumerating metadata is browsing. Bulk-downloading or mirroring the GLBs is redistribution and breaks their terms; one model loaded from the CDN per placement is not.

### Load it

- **ES module (preferred inside a scene module).** The page's import map needs *both* entries — the modules import bare `three` and `three/addons/`:

  ```html
  <script type="importmap">
  { "imports": {
      "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/" } }
  </script>
  ```

  ```js
  import createAsset from 'https://polyfork.dev/cdn/barrel-aadc94.mjs';
  scene.add(createAsset());
  ```

  Import the **default**, never a named export. An export the module does not have is a link-time `SyntaxError` and nothing draws (about one module in nine omits `params`, `presets`, `rig`, `detach` or `night`).

- **GLB.** `https://polyfork.dev/cdn/{id}.glb` through `GLTFLoader`, or any glTF pipeline. Use this when you need the file rather than the factory.
- `/cdn/` is the anonymous path; `/dl/{id}.mjs` and zips want an account, and `-hd` editions want Pro. Never build an `-hd` URL you have not been given.
- Bundlers (Vite, Next) do not resolve remote `https://` imports: download the `.mjs` and import it as a local file.
- Serve over `http://`. Browsers refuse ES modules over `file://`.
- Screenshot or canvas readback: construct the renderer with `preserveDrawingBuffer: true`, or the readback is one flat colour while the page looks fine.

### Make it obey the look contract

Their colour is `COLOR_0` vertex colour on one material. Decide *before* placing, because the palette snap will flatten whatever arrives:

- **Accept** — only if the model's palette already sits in the diorama family. Check the hero frame, not the swatch list.
- **Retint** — map their vertex colours to your palette entries and write them back, keeping one material. Where the module exports `params`/`presets`, prefer `createAsset({ colorway: '…' })` and let the model do it.
- **Recut** — reassign per colour zone when one zone must read differently (a hull dark, a deck light).

Then per preset:

- **Pixel:** `flatShading: true`, no maps, no environment map. The post pass owns banding and ink contour; a texture or a PBR material fights both and reads as a photo glued into a drawing.
- **Toon:** swap the borrowed material for the shared stroked-toon material and carry the vertex colours as the multiply, or replace per zone. Keep the outline width matching the hand-built cast or it reads as a different scale.
- **Scale:** their metres are real and one figure is 1.69 m. This skill's cast reads at 30–45 px. If the diorama is not 1:1, apply **one** uniform factor recorded in the DESIGN sheet — never a per-model fudge factor.
- **Origin:** place at the ground point with `y = 0`. No bounding-box maths. Two flagged exceptions: wall/ceiling fixtures are built at installed height, ground tiles and terrain hang below their own top surface. `origin_y` on the row tells you which you have.
- **Merging:** `mergeAssets` from `/cdn/merge.mjs` collapses static dressing to one draw call. Merge only background that never gets selected, moved or evaluated — merging destroys per-part identity and picking.

Motion, only if you need it: `rig` gives named pivots (a door, a boom), `clips` lists clips inside the GLB (animals carry Idle/Walk/Run), characters carry a skeleton and no clip and play free Mixamo clips via `/cdn/clips.mjs`. `night` maps colour zones to what lights up after dark, for windows and lamps. All three are cheaper than animating a borrowed prop by hand.

### Honesty

Commercial use and modification must be permitted by the actual asset terms, not inferred from “free” or this guide. A runtime CDN scene is online-dependent, not offline/standalone. Before local bundling, conversion or embedding, verify redistribution/embedding rights for every asset and dependency. If terms allow only hosting/hotlinking or prohibit redistribution, use another asset for offline delivery; do not bypass restrictions by converting it. The educational default acceptance gate is documented in `educational-models.md`.

- Record in `sources/`: asset id, URL, "Polyfork free tier — commercial use, no attribution required".
- Anonymous remix baking is rationed per IP (about 40/hour). Bake nothing you can do at runtime with knobs.
- If the catalogue has nothing that answers, say so and model it. `POST /api/demand {"need": "…"}` records the gap. Substituting an unrelated asset because it was close is worse than an honest no — their own rule, and the right call visually.
