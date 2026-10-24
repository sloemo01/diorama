import assert from 'node:assert';
import { transfer, standSpot, toWorld, SEAT_ROOT_Y } from './src/scene/transfer.js';
import { SEATED, STAND } from './src/scene/poses.js';

// A car parked square, left flank toward the camera.
const car = { x: -3.0, z: 2.55, yaw: Math.PI / 2 };
const side = -1;
const seatZ = 0.3;
const seat = { x: side * 0.4, z: seatZ, y: SEAT_ROOT_Y };
const seatWorld = toWorld(car, seat.x, seat.z);
seatWorld.y = seat.y;
const stand = standSpot(car, side, seatZ);
const face = Math.atan2(seatWorld.x - stand.x, seatWorld.z - stand.z);

/**
 * A transfer must be continuous: consecutive samples move by centimetres, never
 * by a body length. A pop here is what the user calls "not human" and no still
 * frame shows it.
 */
function sweep(inward) {
  const DUR = 1.15;
  let prev = null;
  let maxStep = 0;
  let minY = 1e9;
  let maxY = -1e9;
  for (let t = 0; t <= DUR + 1e-6; t += 1 / 60) {
    const r = transfer(t, 0, DUR, car, side, seat, stand, face, inward);
    minY = Math.min(minY, r.pos.y);
    maxY = Math.max(maxY, r.pos.y);
    if (prev) maxStep = Math.max(maxStep, prev.distanceTo(r.pos));
    prev = r.pos.clone();
  }
  return { maxStep, minY, maxY };
}

for (const inward of [false, true]) {
  const { maxStep, minY, maxY } = sweep(inward);
  console.log(
    `${inward ? 'entry' : 'exit '} max step ${(maxStep * 100).toFixed(1)} cm/frame ` +
      `y ${minY.toFixed(2)}..${maxY.toFixed(2)}`
  );
  assert(maxStep < 0.12, `${inward ? 'entry' : 'exit'} pops: ${maxStep.toFixed(3)} m in one frame`);
  assert(maxY < 0.6, 'the root climbed above the seat by more than a step');
}

// Ends where it says it ends.
const exitEnd = transfer(1.15, 0, 1.15, car, side, seat, stand, face, false);
assert(exitEnd.pos.distanceTo(stand) < 0.02, 'exit did not finish on the stand spot');
const entryEnd = transfer(1.15, 0, 1.15, car, side, seat, stand, face, true);
assert(entryEnd.pos.distanceTo(seatWorld) < 0.02, 'entry did not finish on the seat');

// The entry faces the car at the door, and the exit faces the pavement.
const entryMid = transfer(0.3, 0, 1.15, car, side, seat, stand, face, true);
const toCar = Math.atan2(seatWorld.x - entryMid.pos.x, seatWorld.z - entryMid.pos.z);
let dy = Math.abs(((entryMid.yaw - toCar + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
assert(dy < 0.35, `entry is ${(dy * 57.3).toFixed(0)} deg off facing the car`);

console.log('transfer: continuous, lands on the seat, faces the car on the way in');
