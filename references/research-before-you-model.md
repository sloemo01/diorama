# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

Hand-building a creature from primitives is the *last* option, not the first. A
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

