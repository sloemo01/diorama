// Dependency-injected, rigid triangle checks. No collision/triangle-intersection certificate.
export function createInterfaceChecks(THREE) {
  const axes = ['x', 'y', 'z'];
  const fail = message => { throw new Error(`interface-checks: ${message}`); };
  const finite = values => values.every(Number.isFinite);
  const meshOK = mesh => {
    if (!mesh?.isMesh || mesh.isSkinnedMesh || mesh.isInstancedMesh || mesh.isBatchedMesh)
      fail('expected an ordinary rigid Mesh');
    if (mesh.geometry?.morphAttributes && Object.values(mesh.geometry.morphAttributes).some(a => a.length))
      fail('deformed/morph geometry is unsupported');
    if (mesh.material && (Array.isArray(mesh.material) ? mesh.material : [mesh.material])
      .some(m => m.displacementMap || m.isShaderMaterial || m.isRawShaderMaterial || m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile))
      fail('shader/displacement deformation is unsupported');
  };
  function matrix(mesh, frame) {
    mesh.updateWorldMatrix(true, false);
    const m = mesh.matrixWorld.clone();
    if (frame) {
      if (!frame.isObject3D) fail('frame must be an Object3D');
      frame.updateWorldMatrix(true, false);
      if (!finite(frame.matrixWorld.elements) || frame.matrixWorld.determinant() === 0) fail('invalid frame');
      m.premultiply(frame.matrixWorld.clone().invert());
    }
    if (!finite(m.elements) || m.determinant() === 0) fail('invalid mesh transform');
    return m;
  }
  function vertices(mesh, frame) {
    meshOK(mesh);
    const g = mesh.geometry, p = g?.getAttribute?.('position'), index = g?.getIndex?.();
    if (!p || p.itemSize !== 3 || !Number.isInteger(p.count) || !p.count) fail('missing/empty position');
    if (index && (index.itemSize !== 1 || !Number.isInteger(index.count))) fail('malformed index');
    const count = index ? index.count : p.count, range = g.drawRange;
    if (!range || !Number.isInteger(range.start) || range.start < 0 || range.start > count ||
        !(range.count === Infinity || Number.isInteger(range.count) && range.count >= 0)) fail('invalid drawRange');
    const end = Math.min(count, range.start + range.count);
    if (end <= range.start || range.start % 3 || (end - range.start) % 3) fail('empty/malformed triangle range');
    const transform = matrix(mesh, frame), result = [];
    for (let i = range.start; i < end; i++) {
      const j = index ? index.getX(i) : i;
      if (!Number.isInteger(j) || j < 0 || j >= p.count) fail('invalid vertex index');
      const v = new THREE.Vector3().fromBufferAttribute(p, j);
      if (!finite(v.toArray())) fail('nonfinite vertex');
      v.applyMatrix4(transform);
      if (!finite(v.toArray())) fail('nonfinite transformed vertex');
      result.push(v);
    }
    let physical = false;
    for (let i = 0; i < result.length; i += 3) {
      const cross = new THREE.Vector3().subVectors(result[i + 1], result[i])
        .cross(new THREE.Vector3().subVectors(result[i + 2], result[i]));
      if (!finite(cross.toArray())) fail('nonfinite triangle area');
      if (cross.lengthSq() > 0) physical = true;
    }
    if (!physical) fail('no nondegenerate active triangle');
    return result;
  }
  function bounds(mesh, { frame } = {}) {
    return new THREE.Box3().setFromPoints(vertices(mesh, frame));
  }
  // Only undeformed, full BoxGeometry envelopes aligned with the supplied axes.
  function support(mesh, frame) {
    const points = vertices(mesh, frame), b = new THREE.Box3().setFromPoints(points);
    if (mesh.geometry.type !== 'BoxGeometry') fail('seated supports only full axis-aligned BoxGeometry');
    const size = b.getSize(new THREE.Vector3()), eps = 1e-7 * Math.max(1, ...size.toArray());
    if (size.toArray().some(s => s <= eps)) fail('degenerate support');
    if (points.some(p => axes.some(a => Math.min(Math.abs(p[a] - b.min[a]), Math.abs(p[a] - b.max[a])) > eps)))
      fail('support is not axis-aligned');
    const area = Array(6).fill(0);
    for (let i = 0; i < points.length; i += 3) {
      const tri = points.slice(i, i + 3);
      const face = axes.flatMap((a, k) => ['min', 'max'].map((side, s) =>
        tri.every(p => Math.abs(p[a] - b[side][a]) <= eps) ? k * 2 + s : -1)).filter(n => n >= 0);
      const n = new THREE.Vector3().subVectors(tri[1], tri[0]).cross(new THREE.Vector3().subVectors(tri[2], tri[0])).length() / 2;
      if (face.length !== 1 || n <= eps * eps) fail('unsupported support faces');
      area[face[0]] += n;
    }
    if (area.some((n, i) => Math.abs(n - axes.filter((_, k) => k !== Math.floor(i / 2)).reduce((v, a) => v * size[a], 1)) > eps * Math.max(...size.toArray())))
      fail('support must contain its complete box surface');
    return b;
  }
  function seated(upper, lower, { frame, axis = 'y', tolerance = 1e-5, minOverlap = 0 } = {}) {
    if (!axes.includes(axis) || !finite([tolerance, minOverlap]) || tolerance < 0 || minOverlap < 0) fail('invalid seating options');
    const u = support(upper, frame), l = support(lower, frame), gap = u.min[axis] - l.max[axis];
    const overlaps = Object.fromEntries(axes.filter(a => a !== axis).map(a => [a, Math.min(u.max[a], l.max[a]) - Math.max(u.min[a], l.min[a])]));
    return { pass: Math.abs(gap) <= tolerance && Object.values(overlaps).every(v => v > 0 && v >= minOverlap), gap, overlaps, method: 'axis-aligned-box-envelope-mating-faces' };
  }
  function outsideBox(mesh, { frame, box, clearance = 0 } = {}) {
    if (!box?.isBox3 || box.isEmpty() || !finite([...box.min.toArray(), ...box.max.toArray(), clearance]) || clearance < 0) fail('invalid box/clearance');
    const envelope = bounds(mesh, { frame });
    const gaps = Object.fromEntries(axes.map(a => [a, Math.max(box.min[a] - envelope.max[a], envelope.min[a] - box.max[a])]));
    return { status: Object.values(gaps).some(g => g > clearance) ? 'clear' : 'candidate', gaps, envelope, method: 'conservative-aabb-separation' };
  }
  function scopedMeshes({ required, registered } = {}) {
    for (const list of [required, registered]) {
      if (!Array.isArray(list) || !list.length || new Set(list).size !== list.length) fail('scope must be nonempty and unique');
      list.forEach(mesh => vertices(mesh));
    }
    const missing = required.filter(m => !registered.includes(m)), extra = registered.filter(m => !required.includes(m));
    return { pass: !missing.length && !extra.length, missing, extra };
  }
  function worldAnchor({ mesh, local, callback, root } = {}) {
    meshOK(mesh);
    // Run bounds at build validation; this live path only checks geometry presence.
    const position = mesh.geometry?.getAttribute?.('position');
    if (!position || position.itemSize !== 3 || !Number.isInteger(position.count) || position.count < 3) fail('anchor missing geometry');
    if (!root?.isObject3D) fail('anchor root required');
    let node = mesh;
    while (node && node !== root) node = node.parent;
    if (node !== root) fail('anchor detached from root');
    if (local !== undefined && callback !== undefined) fail('choose local or callback');
    const value = callback ? callback(mesh.geometry, mesh) : typeof local === 'function' ? local(mesh.geometry, mesh) : local;
    if (!Array.isArray(value) || value.length !== 3 || !finite(value)) fail('invalid local anchor');
    return new THREE.Vector3(...value).applyMatrix4(matrix(mesh));
  }
  function projectPoints(points, camera, { margin = 0 } = {}) {
    if (!Array.isArray(points) || !points.length || !camera?.isCamera || !Number.isFinite(margin) || margin < 0 || margin >= 1) fail('invalid projection input');
    camera.updateWorldMatrix(true, false);
    for (const m of [camera.matrixWorld, camera.projectionMatrix])
      if (!finite(m.elements) || !Number.isFinite(m.determinant()) || m.determinant() === 0) fail('singular/nonfinite camera');
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    if (!finite([...camera.projectionMatrix.elements, ...camera.matrixWorldInverse.elements])) fail('invalid camera');
    const projected = points.map(p => {
      const xyz = Array.isArray(p) ? p : p?.toArray?.();
      if (!xyz || xyz.length !== 3 || !finite(xyz)) fail('invalid projection point');
      const clip = new THREE.Vector4(...xyz, 1).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      if (!finite(clip.toArray()) || clip.w === 0) fail('invalid clip point');
      const ndc = new THREE.Vector3(clip.x / clip.w, clip.y / clip.w, clip.z / clip.w);
      return { ndc, clipped: clip.w <= 0 || Math.abs(ndc.x) > 1 - margin || Math.abs(ndc.y) > 1 - margin || Math.abs(ndc.z) > 1 };
    });
    return { pass: projected.every(p => !p.clipped), projected };
  }
  return { bounds, seated, outsideBox, scopedMeshes, worldAnchor, projectPoints };
}
