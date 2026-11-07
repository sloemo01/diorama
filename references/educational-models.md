# Educational assets: commercial, modifiable, lesson-accurate

Verified external geometry may be the named teaching object, a subsystem or context. Authorship is required for missing explanation/identities/interfaces, not necessarily every vertex. A detailed exterior, CAD badge or institutional source does not establish correct internals or operating motion.

## Small search, not another catalogue crawl

1. Read the whole-object brief and identify exact subject/variant/part number, needed internal parts, motion and available reference dimensions.
2. Search official/institutional or original-author sources first. Inspect up to **three promising candidates**, one targeted refinement if necessary, then decide. Do not enumerate an entire repository for an educational build. Keep licensing evidence and short metadata on disk, not huge pages/model blobs in context.
3. Prefer an appropriately licensed, documented model over guessed hand geometry. If none passes, author only the missing/suitable representation from trusted references. Never substitute an unrelated “close-looking” object or invent hidden construction without marking it reconstructed.

### Discovery sources (not blanket approval)

- [Smithsonian 3D](https://3d.si.edu/): object scans and documented artefacts; verify the actual model bears **CC0**. Exterior scans are not internal assembly diagrams. Its [Open Access FAQ](https://www.si.edu/openaccess/faq) lists GLB/glTF/OBJ and distinguishes restricted items.
- [NASA 3D Resources](https://science.nasa.gov/3d-resources/): free mission assets; inspect each asset's provenance, credits, scale and [media usage rules](https://www.nasa.gov/nasa-brand-center/images-and-media/). Free access is not an automatic license for every third-party element; NASA/public-domain/custom terms require explicit review, not relabelling as CC0.
- Original manufacturer/university/open-hardware CAD and drawings: useful for exact dimensions and separable assemblies. Free CAD download alone does NOT permit commercial adaptation or redistribution. No acceptable explicit rights means reference-only or reject as a scene asset.
- Clearly licensed original-author repositories/marketplaces: inspect the original landing page and the actual model/texture licenses. A search engine, preview, “royalty-free” label or third-party mirror is not a rights grant. Polyfork may provide context or actual matching parts if the same rights/readiness conditions are met; decorative low-poly assets do not prove mechanical accuracy.

## Non-negotiable rights gate

Require zero acquisition cost AND documented permission for **commercial use, modification/adaptation, and redistribution as part of the delivered scene**. Offline delivery also requires local bundling/embedding and included dependencies. Do not silently settle for personal/educational-only, editorial, NC, ND, evaluation-only or unknown terms. No login/paywall/terms bypass and no inferred permissions from a provider's reputation.

Default automatic policy acceptance:
- **CC0-1.0**: copy/modify/distribute commercially; retain provenance even when attribution is optional. [Official deed](https://creativecommons.org/publicdomain/zero/1.0/).
- **CC-BY-4.0**: commercial adaptation/redistribution with appropriate credit, license link, retained notices and change indication; do not impose extra restrictions on the licensed asset. Keep its license separate from your code license. [Official deed](https://creativecommons.org/licenses/by/4.0/).

Other licenses (including CC-BY-SA, MIT/Apache CAD, custom manufacturer or public-domain declarations) need a documented manual compatibility review before use; they are not automatically prohibited or falsely renamed CC0. ShareAlike may allow commercial derivatives but introduces obligations, so do not silently accept it for a proprietary deliverable. Prefer another CC0/CC-BY candidate if review would expand the task. Unknown rights are not permission. Check textures, clips, fonts, decals, embedded scans and other separately licensed works too. Patent/trademark/privacy/publicity issues are not cleared by a copyright label; don't imply endorsement.

## Accuracy and functional acceptance — separate from rights

Assign one role to each accepted candidate:
- **Teaching**: exact identity/variant, documented dimensions/scale and critical geometry match the lesson. Map actual parts to semantic IDs, validate required pivots/travel/ports/openings and real interfaces. For static subjects, explicitly record which motion/interface checks are inapplicable and why. A flattened mesh can serve only if the lesson genuinely needs no separable internals; don't invent a fake part map.
- **Exterior**: documented identity/proportions suitable for exterior explanation/reference, without internal/mechanical claims.
- **Context**: appropriate scenery with verified scale/import, not evidence for how the teaching object works.
- **Rejected / needs review**: wrong variant, missing rights, missing critical components or untested import. A legitimate license can pass while teaching readiness remains false.

Compare against an independent drawing, source description or reliable measurements. Measure imported geometry, not just metadata. Check units, up/front axes, origin, bounding dimensions, finite/nonempty geometry, actual holes and fit. Validate motion with the existing driver/interface tests. Preserve needed clearances/part boundaries during decimation and palette conversion; no default material replacement that erases labels or important colour coding.

## Import wrapper and delivery

Prefer GLB/glTF for the web; convert CAD/OBJ offline only when the tools and rights permit it. Download only the chosen assets and their required dependencies. Store source bytes/hash and a permitted working conversion separately. Remote modules are executable third-party code: prefer inspected data assets/local vetted conversion, not blind execution of arbitrary source.

Return a wrapper with `{group, physicalLeaves, selectableScopes, localAnchors, ports, motionHandles}`. The wrapper supplies explicit ownership, shared interfaces and evaluator adapters. Do not merge selectable/moving parts or replace real model pivots with guessed world coordinates. Validate the imported object using the same construction, coverage, highlight/restoration, live callout and camera-fit checks as authored geometry.

Default delivery remains genuinely self-contained/offline. Embed/local-package ALL dependencies when permitted; no hidden CDN texture, remote module or lazy model fetch. Test with network disabled, not just a warm cache. If an asset permits only online use/hotlinking, reject it for this delivery; an online-dependent variant needs explicit user agreement and truthful labelling. Do not call an externally fetched model “inlined” because the loader code is inlined.

## Recorded evidence + executable gate

Start from `templates/educational-asset-record.json` (blank fields deliberately fail). Save one compact `assets/manifest.json` record per copyright work (group same-license model/buffer/texture files under one work; separate differently licensed works in `dependencies`). Use `templates/educational-asset-gate.mjs`:

```js
import { evaluateEducationalAsset } from './educational-asset-gate.mjs';
const result = evaluateEducationalAsset(record, {delivery: 'offline'});
if (result.status !== 'accepted') throw new Error(JSON.stringify(result.reasons));
```

The helper header specifies the record fields: source/download URLs, creator/date, canonical license and asset-page evidence, explicitly reviewed rights/zero cost, credit/license/change notices, delivered file hashes, dependency rights, accuracy/structure/import results and role. `restrictions: []` means no additional incompatible terms beyond the standard license—not that CC-BY has no conditions. Never set a checkbox merely to make this pass. Attach actual proof links/measurement notes in the manifest or DESIGN.

`rightsAllowed` and `ready` are separate. Only recorded CC0/CC-BY evidence auto-passes; missing/custom/SA holds, explicit incompatible rights reject. Offline recursively checks bundling/dependencies. This is a **policy/completeness validator of supplied records**, not a crawler, license authenticator, file-hash recomputation tool, legal opinion or scientific-accuracy detector. The agent must read real terms, hash actual downloaded bytes and run actual import/geometry tests. Its synthetic regressions do not certify a real downloaded asset.

No new full-scene audit bureaucracy: reuse the existing single QA runner and credit file. Search once, keep the chosen record, and rerun import/readiness only when that asset or its use changes.
