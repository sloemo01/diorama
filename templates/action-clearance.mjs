/** World-space motion proxies only: no automatic mesh, skin, material or geometry coverage.
 * Sampled audits are not continuous proofs. Callers must freeze/restore their own scene state.
 * OBB SAT reports an axis bound, NOT exact Euclidean distance or mesh penetration.
 * API: sphere(center,radius), capsule(a,b,radius), obb(center,halfSize,quaternion?).
 * Vectors accept [x,y,z] or THREE.Vector3; quaternion accepts [x,y,z,w] or Quaternion.
 * auditPose({parts:[{id,owner?,getShape(time)}],requiredIds?,time=0,clearance=0,contacts=[]}).
 * requiredIds is an independent expected proxy inventory: nonempty, unique, exact match.
 * Reports coverageVerified:true only with that inventory; omission means unknown coverage,
 * never certification of complete scene/geometry coverage. Motion propagates this flag.
 * owner is metadata only: ALL distinct proxies, including same-owner parts, are checked.
 * Contacts: {a,b,start,end,maxPenetration,reason}; inclusive window, exact proxy ids.
 * pairCheck(a,b) => {separation,penetration,method}; negative means proxy overlap.
 * auditPose => {clear,collisions,methods,sampledOnly:true,testedPairs}.
 * auditMotion({source:{evaluate(t)},times,...pose}) => {clear,samples,worstCases,
 * methods,sampledOnly:true}; requires >=2 strictly increasing finite times and a
 * synchronous evaluator; evaluates exactly those times, leaving final state.
 * Static checks use auditPose; missing/repeated samples are not motion coverage.
 * timesForInterval(start,end,{maxStep,eventTimes=[]}) builds a sorted distinct grid.
 */
export function createActionClearance(THREE) {
  const { Vector3: V, Quaternion: Q } = THREE;
  const finite = (n, label) => { if (!Number.isFinite(n)) throw new TypeError(`${label} must be finite`); return n; };
  const positive = (n, label) => { finite(n, label); if (n <= 0) throw new RangeError(`${label} must be positive`); return n; };
  const vector = (v, label) => {
    const a = Array.isArray(v) ? v : [v?.x, v?.y, v?.z];
    if (a.length !== 3) throw new TypeError(`${label} requires three components`);
    return new V(...a.map(n => finite(n, label)));
  };
  const sphere = (center, radius) => ({ type: 'sphere', center: vector(center, 'center'), radius: positive(radius, 'radius') });
  const capsule = (a, b, radius) => ({ type: 'capsule', a: vector(a, 'a'), b: vector(b, 'b'), radius: positive(radius, 'radius') });
  const obb = (center, halfSize, quaternion = [0, 0, 0, 1]) => {
    const h = vector(halfSize, 'halfSize'); h.toArray().forEach(n => positive(n, 'halfSize'));
    const a = Array.isArray(quaternion) ? quaternion : [quaternion?.x, quaternion?.y, quaternion?.z, quaternion?.w];
    if (a.length !== 4) throw new TypeError('quaternion requires four components');
    a.forEach(n => finite(n, 'quaternion'));
    const scale = Math.max(...a.map(Math.abs));
    if (!scale) throw new RangeError('quaternion must be nonzero');
    const q = new Q(...a.map(n => n / scale)).normalize();
    return { type: 'obb', center: vector(center, 'center'), halfSize: h, quaternion: q };
  };
  const shape = s => {
    if (s?.type === 'sphere') return sphere(s.center, s.radius);
    if (s?.type === 'capsule') return capsule(s.a, s.b, s.radius);
    if (s?.type === 'obb') return obb(s.center, s.halfSize, s.quaternion);
    throw new TypeError('unsupported or missing proxy shape');
  };
  const asCapsule = s => s.type === 'sphere' ? { a: s.center, b: s.center, radius: s.radius } : s;
  const clamp = n => Math.max(0, Math.min(1, n));
  function segmentDistance(a, b) {
    const u = a.b.clone().sub(a.a), v = b.b.clone().sub(b.a), w = a.a.clone().sub(b.a);
    const A = u.dot(u), B = u.dot(v), C = v.dot(v), D = u.dot(w), E = v.dot(w);
    let s = 0, t = 0;
    if (!A && !C) return w.length();
    if (!A) t = clamp(E / C);
    else if (!C) s = clamp(-D / A);
    else {
      const det = A * C - B * B;
      s = det > 0 ? clamp((B * E - C * D) / det) : 0;
      t = (B * s + E) / C;
      if (t < 0) { t = 0; s = clamp(-D / A); }
      else if (t > 1) { t = 1; s = clamp((B - D) / A); }
    }
    return w.addScaledVector(u, s).addScaledVector(v, -t).length();
  }
  // Piecewise quadratic outside distance; inside, minimize the maximum of six
  // affine face SDFs. Their intersections include the deepest centerline point.
  function segmentBox(c, box) {
    const inverse = box.quaternion.clone().invert();
    const a = c.a.clone().sub(box.center).applyQuaternion(inverse).toArray();
    const b = c.b.clone().sub(box.center).applyQuaternion(inverse).toArray();
    const h = box.halfSize.toArray(), d = b.map((n, i) => n - a[i]);
    const faces = h.flatMap((n, i) => [[a[i] - n, d[i]], [-a[i] - n, -d[i]]]);
    const cuts = [0, 1];
    for (const [p, q] of faces) if (q && -p / q > 0 && -p / q < 1) cuts.push(-p / q);
    cuts.sort((x, y) => x - y);
    const candidates = [...cuts];
    for (let i = 0; i < cuts.length - 1; i++) {
      const mid = (cuts[i] + cuts[i + 1]) / 2;
      let A = 0, B = 0;
      for (let k = 0; k < 3; k++) {
        const x = a[k] + d[k] * mid;
        if (Math.abs(x) > h[k]) { const p = a[k] - Math.sign(x) * h[k]; A += d[k] ** 2; B += p * d[k]; }
      }
      if (A) candidates.push(Math.max(cuts[i], Math.min(cuts[i + 1], -B / A)));
    }
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
      const denom = faces[i][1] - faces[j][1];
      if (denom) { const t = (faces[j][0] - faces[i][0]) / denom; if (t >= 0 && t <= 1) candidates.push(t); }
    }
    const sdf = t => {
      const q = a.map((n, i) => Math.abs(n + d[i] * t) - h[i]);
      return Math.hypot(...q.map(n => Math.max(n, 0))) + Math.min(Math.max(...q), 0);
    };
    return Math.min(...candidates.map(sdf)) - c.radius;
  }
  const axes = b => [new V(1, 0, 0), new V(0, 1, 0), new V(0, 0, 1)].map(v => v.applyQuaternion(b.quaternion));
  function boxSAT(a, b) {
    const aa = axes(a), bb = axes(b), delta = b.center.clone().sub(a.center);
    const candidates = [...aa, ...bb, ...aa.flatMap(u => bb.map(v => u.clone().cross(v)))];
    let separation = -Infinity;
    for (const axis of candidates) {
      if (axis.lengthSq() < 1e-24) continue;
      axis.normalize();
      const radius = (box, basis) => basis.reduce((s, v, i) => s + Math.abs(axis.dot(v)) * box.halfSize.getComponent(i), 0);
      separation = Math.max(separation, Math.abs(delta.dot(axis)) - radius(a, aa) - radius(b, bb));
    }
    return separation;
  }
  function pairCheck(first, second) {
    const a = shape(first), b = shape(second);
    let separation, method;
    if (a.type === 'obb' && b.type === 'obb') { separation = boxSAT(a, b); method = 'obb-obb-sat-axis-bound'; }
    else if (a.type === 'obb' || b.type === 'obb') {
      separation = a.type === 'obb' ? segmentBox(asCapsule(b), a) : segmentBox(asCapsule(a), b);
      method = 'capsule-obb-exact-outside-deepest-centerline-sdf-inside';
    } else { separation = segmentDistance(asCapsule(a), asCapsule(b)) - a.radius - b.radius; method = 'capsule-capsule-segment-distance'; }
    finite(separation, 'computed separation');
    return { separation, penetration: Math.max(0, -separation), method };
  }
  function bounds(s, margin) {
    if (s.type !== 'obb') {
      const c = asCapsule(s), r = c.radius + margin;
      return { min: c.a.clone().min(c.b).addScalar(-r), max: c.a.clone().max(c.b).addScalar(r) };
    }
    const e = new V(), basis = axes(s);
    for (let i = 0; i < 3; i++) e.add(basis[i].clone().set(Math.abs(basis[i].x), Math.abs(basis[i].y), Math.abs(basis[i].z)).multiplyScalar(s.halfSize.getComponent(i)));
    e.addScalar(margin);
    return { min: s.center.clone().sub(e), max: s.center.clone().add(e) };
  }
  const id = v => { if (typeof v !== 'string' || !v.trim()) throw new TypeError('proxy id must be nonempty string'); return v; };
  const key = (a, b) => JSON.stringify([a, b].sort());
  function auditPose({ parts, requiredIds, time = 0, clearance = 0, contacts = [] } = {}) {
    finite(time, 'time'); finite(clearance, 'clearance');
    if (clearance < 0 || !Array.isArray(parts) || !parts.length || !Array.isArray(contacts)) throw new TypeError('nonempty parts and nonnegative clearance required');
    const ids = new Set();
    for (const p of parts) {
      id(p?.id); if (ids.has(p.id)) throw new TypeError(`duplicate proxy id ${p.id}`); ids.add(p.id);
      if (typeof p.getShape !== 'function') throw new TypeError('getShape callback required');
    }
    const coverageVerified = requiredIds !== undefined;
    if (coverageVerified) {
      if (!Array.isArray(requiredIds) || !requiredIds.length) throw new TypeError('requiredIds must be a nonempty unique id array');
      const expected = new Set();
      for (const value of requiredIds) { id(value); if (expected.has(value)) throw new TypeError('duplicate required id'); expected.add(value); }
      if (expected.size !== ids.size || [...expected].some(value => !ids.has(value))) throw new TypeError('proxy coverage mismatch: missing or extra ids');
    }
    const evaluated = parts.map(p => {
      const s = shape(p.getShape(time)); return { id: p.id, shape: s, ...bounds(s, clearance / 2) };
    });
    const rules = new Map();
    for (const c of contacts) {
      id(c?.a); id(c?.b);
      if (c.a === c.b || !ids.has(c.a) || !ids.has(c.b)) throw new TypeError('contact references missing or identical proxy ids');
      finite(c.start, 'contact start'); finite(c.end, 'contact end'); finite(c.maxPenetration, 'maxPenetration');
      if (c.end < c.start || c.maxPenetration < 0 || typeof c.reason !== 'string' || !c.reason.trim()) throw new TypeError('invalid bounded contact');
      const k = key(c.a, c.b); if (rules.has(k)) throw new TypeError('duplicate contact pair'); rules.set(k, c);
    }
    evaluated.sort((a, b) => a.min.x - b.min.x || (a.id < b.id ? -1 : 1));
    const collisions = [], methods = new Set(); let active = [], testedPairs = 0;
    for (const b of evaluated) {
      active = active.filter(a => a.max.x >= b.min.x);
      for (const a of active) {
        if (a.max.y < b.min.y || b.max.y < a.min.y || a.max.z < b.min.z || b.max.z < a.min.z) continue;
        const result = pairCheck(a.shape, b.shape); testedPairs++; methods.add(result.method);
        const rule = rules.get(key(a.id, b.id));
        const allowed = rule && time >= rule.start && time <= rule.end && result.penetration <= rule.maxPenetration;
        if (result.separation < clearance && !allowed) collisions.push({ a: [a.id, b.id].sort()[0], b: [a.id, b.id].sort()[1], time, ...result, kind: result.separation < 0 ? 'proxy-overlap' : 'clearance-violation' });
      }
      active.push(b);
    }
    collisions.sort((a, b) => a.a < b.a ? -1 : a.a > b.a ? 1 : a.b < b.b ? -1 : a.b > b.b ? 1 : 0);
    return { clear: !collisions.length, coverageVerified, collisions, methods: [...methods].sort(), sampledOnly: true, testedPairs };
  }
  function timesForInterval(start, end, { maxStep, eventTimes = [] } = {}) {
    finite(start, 'start'); finite(end, 'end'); positive(maxStep, 'maxStep');
    if (end < start || !Array.isArray(eventTimes)) throw new TypeError('invalid interval');
    const n = Math.ceil((end - start) / maxStep);
    if (!Number.isSafeInteger(n) || n > 1e6) throw new RangeError('sample grid too large');
    const times = [start, end];
    for (let i = 1; i < n; i++) times.push(start + (end - start) * (i / n));
    for (const t of eventTimes) { finite(t, 'event time'); if (t < start || t > end) throw new RangeError('event time outside interval'); times.push(t); }
    return [...new Set(times)].sort((a, b) => a - b);
  }
  function auditMotion({ source, times, ...pose } = {}) {
    if (typeof source?.evaluate !== 'function' || !Array.isArray(times) || times.length < 2) throw new TypeError('source.evaluate and at least two sample times required');
    for (let i = 0; i < times.length; i++) {
      finite(times[i], 'sample time');
      if (i && times[i] <= times[i - 1]) throw new RangeError('sample times must be strictly increasing');
    }
    const samples = times.map(time => {
      const result = source.evaluate(time);
      if (result != null && typeof result.then === 'function') throw new TypeError('source.evaluate must be synchronous');
      return { time, ...auditPose({ ...pose, time }) };
    });
    const worst = new Map();
    for (const sample of samples) for (const c of sample.collisions) { const k = key(c.a, c.b); if (!worst.has(k) || c.separation < worst.get(k).separation) worst.set(k, c); }
    return { clear: samples.every(s => s.clear), coverageVerified: samples.every(s => s.coverageVerified), sampledOnly: true, samples, worstCases: [...worst.values()], methods: [...new Set(samples.flatMap(s => s.methods))].sort() };
  }
  return { sphere, capsule, obb, pairCheck, auditPose, timesForInterval, auditMotion };
}
