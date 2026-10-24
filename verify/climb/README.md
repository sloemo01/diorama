# Climb harness

A unit test for `transfer.js`, the one piece of the kit that is tedious to get
right and easy to break: no browser, no render, just the maths.

```bash
npm i three        # transfer.js imports THREE for Vector3
npm test
```

Checks, in order: the move is continuous (no frame jumps a body length, which is
what reads as "not human"), the root never climbs above a step, the exit finishes
on the stand spot and the entry on the seat, and the entry faces the car at the
door rather than the street. Current result: 5.8 cm per frame at 60 fps both ways,
root -0.38 to 0.00, all landing assertions inside 2 mm.

If you retune `CLIMB` or `STEP_SHARE`, re-run this before looking at a single
screenshot: a pop of 15 cm per frame is invisible in a still and obvious in
motion.
