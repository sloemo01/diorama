# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

