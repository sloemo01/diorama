# Reference scope

Load only when routed by SKILL.md. The core profile, scale, construction-first and evidence rules take precedence over legacy calibration counts, numerical examples or workflow order here. Subject-specific examples are recipes, not universal requirements. Paths beginning `templates/`, `verify/` or `media/` are relative to the skill root.

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

