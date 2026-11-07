# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

## Skill Maintenance

After a scene repair, keep its observed failures and tests in the PROJECT's DESIGN/QA notes. Do not mutate the installed skill as part of an ordinary scene commission. Promote a reusable rule only during an explicit skill-maintenance request, with filesystem approval where required. Preserve the compact core; put subject-specific evidence here or in the relevant reference, never append another universal checklist.

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

