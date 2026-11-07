# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

