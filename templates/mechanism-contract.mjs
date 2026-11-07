// Unit-agnostic scalar interface checks; all values must share manifest units.
// Not a geometry engine: actual mesh/proxy and swept-motion QA is still required.
const finite = (x, name) => {
  if (!Number.isFinite(x)) throw new Error(`${name}: finite number required`);
  return x;
};
export function checkInterface({ id, shaftRadius, boreRadius, inwardBevel = 0,
  requiredRadial, laneWidth, memberWidth, axialIntrusion = 0, requiredAxial }) {
  if (!id) throw new Error('interface id required');
  for (const [name, value] of Object.entries({ shaftRadius, boreRadius, inwardBevel,
    requiredRadial, laneWidth, memberWidth, axialIntrusion, requiredAxial })) {
    finite(value, name);
    if (value < 0) throw new Error(`${id}: negative ${name}`);
  }
  const radial = boreRadius - inwardBevel - shaftRadius;
  // Axial is the TOTAL remaining lane gap; specify a doubled requiredAxial
  // if the requirement is a per-side clearance on a centred member.
  const axial = laneWidth - memberWidth - axialIntrusion;
  if (radial < requiredRadial || axial < requiredAxial) {
    throw new Error(`${id}: insufficient interface budget radial=${radial}, axial=${axial}`);
  }
  return { id, radial, axial };
}
export function anchorResidual(a, b) {
  if (a.length !== 3 || b.length !== 3) throw new Error('world anchor triples required');
  return Math.hypot(...a.map((v, i) => finite(v, 'anchor') - finite(b[i], 'anchor')));
}
// Pass world-space directions derived from each part's actual world matrix.
export function checkAxes(a, b, tolerance = 1e-6) {
  const length = v => Math.hypot(...v.map(x => finite(x, 'axis')));
  if (a.length !== 3 || b.length !== 3 || length(a) === 0 || length(b) === 0) throw new Error('nonzero axis triples required');
  finite(tolerance, 'axis tolerance');
  if (tolerance < 0 || tolerance >= 1) throw new Error('axis tolerance out of range');
  const alignment = Math.abs(a.reduce((sum, x, i) => sum + x * b[i], 0) / (length(a) * length(b)));
  if (1 - alignment > tolerance) throw new Error(`mating axes misaligned: ${alignment}`);
  return alignment;
}
// One source of truth for repeated XY mounts, local +Z shaft/bore axes.
// Transform BOTH mating frames by the same authored parent/world transforms.
export function createMountAnchors({ frameId, count, radius, z = 0,
  startAngle = Math.PI / 4, prefix = 'mount' }) {
  if (!frameId || !prefix || !Number.isInteger(count) || count < 1) throw new Error('named frame and positive mount count required');
  finite(radius, 'mount radius'); finite(z, 'mount z'); finite(startAngle, 'start angle');
  if (radius <= 0) throw new Error('positive mount radius required');
  return Object.freeze(Array.from({ length: count }, (_, i) => {
    const angle = startAngle + 2 * Math.PI * i / count;
    return Object.freeze({ id: `${prefix}-${i + 1}`, frameId,
      position: Object.freeze([radius * Math.cos(angle), radius * Math.sin(angle), z]),
      axis: Object.freeze([0, 0, 1]) });
  }));
}
export function assertCoverage({ id, expectedIds, observedIds, expectedSamples, actualSamples }) {
  if (!id || !Array.isArray(expectedIds) || !Array.isArray(observedIds)
    || expectedIds.length === 0 || expectedIds.some(x => typeof x !== 'string' || !x)
    || new Set(expectedIds).size !== expectedIds.length || new Set(observedIds).size !== observedIds.length)
    throw new Error('nonempty unique expected/observed coverage IDs required');
  if (expectedIds.length !== observedIds.length || expectedIds.some(x => !observedIds.includes(x)))
    throw new Error(`${id}: subject coverage mismatch`);
  if (!Number.isInteger(expectedSamples) || expectedSamples < 1
    || !Number.isInteger(actualSamples) || actualSamples !== expectedSamples)
    throw new Error(`${id}: sample coverage mismatch expected=${expectedSamples} actual=${actualSamples}`);
  return { id, subjects: observedIds.length, samples: actualSamples };
}
export function checkRepeatedInterfaces({ id, expectedIds, pairs, positionTolerance = 1e-6, axisTolerance = 1e-6 }) {
  finite(positionTolerance, 'position tolerance');
  if (positionTolerance < 0 || !Array.isArray(pairs)) throw new Error('nonnegative position tolerance and mating pairs required');
  assertCoverage({ id, expectedIds, observedIds: pairs.map(p => p.anchorId), expectedSamples: expectedIds.length, actualSamples: pairs.length });
  let worstResidual = 0;
  for (const p of pairs) {
    const residual = anchorResidual(p.shaft.position, p.bore.position);
    if (residual > positionTolerance) throw new Error(`${p.anchorId}: mating anchor residual ${residual}`);
    checkAxes(p.shaft.axis, p.bore.axis, axisTolerance);
    worstResidual = Math.max(worstResidual, residual);
  }
  return { id, count: pairs.length, worstResidual };
}
// Coordinates increase along the declared shaft axis. Cap outer face must not
// coincide with the shaft end; the shaft must still reach the cap's inner seat.
export function checkEndPlanes({ id, shaftEnd, capInnerFace, capOuterFace, minimumSeparation }) {
  for (const [name, value] of Object.entries({ shaftEnd, capInnerFace, capOuterFace, minimumSeparation })) finite(value, name);
  if (!id || minimumSeparation <= 0 || capOuterFace <= capInnerFace)
    throw new Error('valid end-plane interface and positive separation required');
  const separation = capOuterFace - shaftEnd;
  if (shaftEnd < capInnerFace || separation < minimumSeparation)
    throw new Error(`${id}: unsupported or coplanar cap/shaft end planes`);
  return { id, separation };
}

// Surface IDs, not group/type IDs. Driver phase is in unwrapped manifest units.
// Wraparound contact windows must be split explicitly into [start,end] intervals.
export function checkPair({ a, b, phase, gap, requiredClearance, contacts = [] }) {
  if (!a || !b || a === b) throw new Error('distinct surface IDs required');
  finite(phase, 'phase'); finite(gap, 'signed gap');
  finite(requiredClearance, 'requiredClearance');
  if (requiredClearance < 0) throw new Error('negative clearance');
  for (const c of contacts) {
    if (!c.reason || !c.a || !c.b || c.a === c.b) throw new Error('scoped contact rationale required');
    for (const k of ['from', 'to', 'maxPenetration', 'maxGap']) finite(c[k], k);
    if (c.to < c.from || c.maxPenetration < 0 || c.maxGap < 0) throw new Error('invalid contact window/tolerance');
  }
  const permitted = contacts.filter(c => ((a === c.a && b === c.b) || (a === c.b && b === c.a))
    && phase >= c.from && phase <= c.to);
  if (permitted.length > 1) throw new Error('ambiguous contact policy');
  const c = permitted[0];
  const ok = c ? gap >= -c.maxPenetration && gap <= c.maxGap : gap >= requiredClearance;
  if (!ok) throw new Error(`${a}/${b} phase=${phase} gap=${gap}: ${c ? 'contact tolerance' : 'clearance'} failed`);
  return { a, b, phase, gap, intendedContact: Boolean(c) };
}
