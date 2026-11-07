# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

