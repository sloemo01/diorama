# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

