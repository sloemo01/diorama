import assert from 'node:assert/strict';
import { checkInterface, anchorResidual, checkAxes, checkPair, createMountAnchors,
  checkRepeatedInterfaces, assertCoverage, checkEndPlanes } from '../mechanism-contract.mjs';
const fit = { id: 'bearing', shaftRadius: 1, boreRadius: 1.08, inwardBevel: .02,
  requiredRadial: .04, laneWidth: .5, memberWidth: .3, axialIntrusion: .02, requiredAxial: .1 };
assert(checkInterface(fit).radial > .04);
assert.throws(() => checkInterface({ ...fit, inwardBevel: .1 }));
assert.throws(() => checkInterface({ ...fit, memberWidth: .45 }));
assert.throws(() => checkInterface({ ...fit, shaftRadius: NaN }));
assert.equal(anchorResidual([0, 1, 2], [0, 1, 2]), 0);
assert(anchorResidual([0, 1, 2], [0, 1, 2.1]) > .09);
assert.equal(checkAxes([0, 0, 1], [0, 0, -2]), 1);
assert.throws(() => checkAxes([0, 0, 1], [0, 1, 0]), /misaligned/);
assert.throws(() => checkAxes([0, 0, 0], [0, 0, 1]));
const pair = { a: 'eye.inner', b: 'journal.outer', phase: 1, gap: 0,
  requiredClearance: .01, contacts: [{ a: 'eye.inner', b: 'journal.outer', from: 0, to: 2,
    maxPenetration: .001, maxGap: .003, reason: 'sliding bearing interface' }] };
assert.equal(checkPair(pair).intendedContact, true);
assert.throws(() => checkPair({ ...pair, phase: 3 }));
assert.throws(() => checkPair({ ...pair, a: 'beam.face', gap: -.1 }));
assert.throws(() => checkPair({ ...pair, gap: -.002 }));
assert.throws(() => checkPair({ ...pair, contacts: [pair.contacts[0], pair.contacts[0]] }));
assert.throws(() => checkPair({ ...pair, contacts: [{ ...pair.contacts[0], reason: '' }] }));
assert.equal(checkPair({ ...pair, phase: 3, gap: .02 }).intendedContact, false);
const anchors = createMountAnchors({ frameId: 'board-local', count: 4, radius: 13 });
assert.equal(anchors.length, 4); assert(Object.isFrozen(anchors[0].position));
const pairs = anchors.map(a => ({ anchorId: a.id,
  shaft: { position: [...a.position], axis: [...a.axis] },
  bore: { position: [...a.position], axis: [...a.axis] } }));
const repeated = { id: 'four-mounts', expectedIds: anchors.map(a => a.id), pairs };
assert.equal(checkRepeatedInterfaces(repeated).worstResidual, 0);
const offset = structuredClone(pairs); offset[2].bore.position[0] += .4;
assert.throws(() => checkRepeatedInterfaces({ ...repeated, pairs: offset }), /residual/);
const wrongAxis = structuredClone(pairs); wrongAxis[1].shaft.axis = [1, 0, 0];
assert.throws(() => checkRepeatedInterfaces({ ...repeated, pairs: wrongAxis }), /misaligned/);
assert.throws(() => checkRepeatedInterfaces({ ...repeated, pairs: pairs.slice(0, 3) }), /coverage/);
assert.throws(() => checkRepeatedInterfaces({ ...repeated, pairs: [pairs[0], pairs[0], pairs[2], pairs[3]] }), /coverage/);
const coverage = { id: 'magnet-sweep', expectedIds: ['north', 'south'], observedIds: ['south', 'north'], expectedSamples: 144, actualSamples: 144 };
assert.equal(assertCoverage(coverage).samples, 144);
assert.throws(() => assertCoverage({ ...coverage, observedIds: [] }), /coverage/);
assert.throws(() => assertCoverage({ ...coverage, actualSamples: 0 }), /coverage/);
assert.throws(() => assertCoverage({ ...coverage, expectedIds: [], observedIds: [], actualSamples: 0 }), /coverage/);
const ends = { id: 'support-cap', shaftEnd: 11.2, capInnerFace: 11.14, capOuterFace: 11.44, minimumSeparation: .1 };
assert(checkEndPlanes(ends).separation > .2);
assert.throws(() => checkEndPlanes({ ...ends, shaftEnd: 11.44 }), /coplanar/);
assert.throws(() => checkEndPlanes({ ...ends, shaftEnd: 11 }), /unsupported/);
assert.throws(() => createMountAnchors({ frameId: 'local', count: 0, radius: 13 }));
console.log('PASS: original budgets/contact policy plus shared four-mount anchors, wrong-axis/offset/missing-mount injections, nonempty sample coverage and cap end-plane failures');
console.log('LIMIT: scalar/frame coverage checks are not mesh bore, rendering or continuous collision certification.');
