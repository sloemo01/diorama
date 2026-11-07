/* Dependency-injected scene checks; no imports, clocks, rendering, or geometry metadata.
 * Rigid triangle meshes only; bounds use indexed/nonindexed active drawRange vertices.
 * Each mesh needs a noncollapsed transform and a nondegenerate world triangle.
 * Bounds/contact are coarse AABB evidence, NOT surface/solid collision certification.
 * API: mesh(id, object), assembly(id, {meshes:[ids], anchors:{name:{mesh,local}}}),
 * contact({id,upper,lower,axis:'y',tolerance,minOverlap}),
 * exclude({meshes:[id,id],reason,maxDepth:[x,y,z],active?}), evaluate(state), sample(states, apply).
 * Every root mesh must be registered and owned exactly once. Exemptions remove
 * only one exact cross-assembly mesh pair, never an assembly or wildcard.
 */
export function createSceneContract(THREE, options = {}) {
  const fail = message => { throw new Error(`Scene contract: ${message}`); };
  const finite = (n, label) => {
    if (typeof n !== 'number' || !Number.isFinite(n)) fail(`${label} must be finite`);
    return n;
  };
  const nonnegative = (n, label) => {
    if (finite(n, label) < 0) fail(`${label} must be nonnegative`);
    return n;
  };
  const count = (n, label) => {
    if (!Number.isSafeInteger(n) || n < 1) fail(`${label} must be a positive integer`);
    return n;
  };
  const name = (s, label) => {
    if (typeof s !== 'string' || !s.trim() || s.includes('*')) fail(`invalid ${label}`);
    return s;
  };
  const keys = (object, allowed, label) => {
    if (!object || typeof object !== 'object' || Array.isArray(object)) fail(`invalid ${label}`);
    for (const key of Object.keys(object)) if (!allowed.includes(key)) fail(`unknown ${label} field ${key}`);
  };
  keys(options, ['root', 'expectedAssemblies', 'expectedMeshes', 'tolerance'], 'options');
  if (!THREE?.Vector3 || !THREE?.Box3) fail('inject THREE with Vector3 and Box3');
  const { root } = options;
  if (!root?.isObject3D) fail('root must be an Object3D');
  const expectedAssemblies = count(options.expectedAssemblies, 'expectedAssemblies');
  const expectedMeshes = count(options.expectedMeshes, 'expectedMeshes');
  const tolerance = nonnegative(options.tolerance ?? 1e-6, 'tolerance');
  const meshes = new Map(), assemblies = new Map(), contacts = new Map();
  const exemptions = new Map();
  const pairKey = (a, b) => JSON.stringify([a, b].sort());
  const ref = (map, id, label) => {
    if (!map.has(id)) fail(`missing ${label} ${String(id)}`);
    return map.get(id);
  };
  const vector = (value, label) => {
    if (!Array.isArray(value) || value.length !== 3) fail(`${label} must be [x,y,z]`);
    value.forEach(n => finite(n, label));
    return new THREE.Vector3(...value);
  };
  const checkedBox = (box, label) => {
    for (const axis of ['x', 'y', 'z']) {
      finite(box.min[axis], `${label}.min.${axis}`);
      finite(box.max[axis], `${label}.max.${axis}`);
      if (box.min[axis] > box.max[axis]) fail(`reversed bounds for ${label}`);
    }
    return box;
  };
  const boxData = box => ({ min: box.min.toArray(), max: box.max.toArray() });
  let sealed = false;
  const editable = () => { if (sealed) fail('registry is sealed after evaluation'); };
  const api = {
    mesh(id, object) {
      editable(); name(id, 'mesh id');
      if (meshes.has(id)) fail(`duplicate mesh ${id}`);
      if (!object?.isMesh) fail(`mesh ${id} must be a Mesh`);
      if ([...meshes.values()].includes(object)) fail('mesh object registered twice');
      meshes.set(id, object);
      return api;
    },
    assembly(id, declaration) {
      editable(); name(id, 'assembly id');
      if (assemblies.has(id)) fail(`duplicate assembly ${id}`);
      keys(declaration, ['meshes', 'anchors'], 'assembly');
      const ids = declaration.meshes;
      if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length)
        fail(`assembly ${id} needs nonempty unique mesh ids`);
      ids.forEach(mesh => ref(meshes, mesh, 'mesh'));
      const anchors = declaration.anchors ?? {};
      if (!anchors || typeof anchors !== 'object' || Array.isArray(anchors)) fail('invalid anchors');
      const copied = {};
      for (const [anchor, spec] of Object.entries(anchors)) {
        name(anchor, 'anchor name'); keys(spec, ['mesh', 'local'], 'anchor');
        if (!ids.includes(spec.mesh)) fail(`anchor ${anchor} must use an owned mesh`);
        if (typeof spec.local !== 'function') vector(spec.local, `anchor ${anchor}`);
        copied[anchor] = { mesh: spec.mesh, local: typeof spec.local === 'function' ? spec.local : [...spec.local] };
      }
      assemblies.set(id, { meshes: [...ids], anchors: copied });
      return api;
    },
    contact(spec) {
      editable(); keys(spec, ['id', 'upper', 'lower', 'axis', 'tolerance', 'minOverlap'], 'contact');
      name(spec.id, 'contact id');
      if (contacts.has(spec.id)) fail(`duplicate contact ${spec.id}`);
      ref(assemblies, spec.upper, 'assembly'); ref(assemblies, spec.lower, 'assembly');
      if (spec.upper === spec.lower) fail('contact requires distinct assemblies');
      const axis = spec.axis ?? 'y';
      if (!['x', 'y', 'z'].includes(axis)) fail('contact axis must be x, y, or z');
      contacts.set(spec.id, {
        ...spec, axis, tolerance: nonnegative(spec.tolerance ?? tolerance, 'contact tolerance'),
        minOverlap: nonnegative(spec.minOverlap ?? tolerance, 'minOverlap'),
      });
      return api;
    },
    exclude(spec) {
      editable(); keys(spec, ['meshes', 'reason', 'maxDepth', 'active'], 'exclusion');
      if (!Array.isArray(spec.meshes) || spec.meshes.length !== 2 || spec.meshes[0] === spec.meshes[1])
        fail('exclusion needs exactly two distinct mesh ids');
      spec.meshes.forEach(id => ref(meshes, id, 'mesh'));
      name(spec.reason, 'exclusion reason');
      const key = pairKey(...spec.meshes);
      if (exemptions.has(key)) fail('duplicate exclusion');
      vector(spec.maxDepth, 'exclusion maxDepth');
      spec.maxDepth.forEach(n => nonnegative(n, 'exclusion maxDepth'));
      if (spec.active !== undefined && typeof spec.active !== 'function') fail('active must be a function');
      exemptions.set(key, {
        meshes: [...spec.meshes], reason: spec.reason, maxDepth: [...spec.maxDepth], active: spec.active,
      });
      return api;
    },
    evaluate(state) {
      if (assemblies.size !== expectedAssemblies) fail(`expected ${expectedAssemblies} assemblies, got ${assemblies.size}`);
      if (meshes.size !== expectedMeshes) fail(`expected ${expectedMeshes} meshes, got ${meshes.size}`);
      const owners = new Map();
      for (const [id, assembly] of assemblies) for (const mesh of assembly.meshes) {
        if (owners.has(mesh)) fail(`mesh ${mesh} has multiple owners`);
        owners.set(mesh, id);
      }
      for (const id of meshes.keys()) if (!owners.has(id)) fail(`mesh ${id} has no assembly`);
      const rootMeshes = new Set();
      root.traverse(object => { if (object.isMesh) rootMeshes.add(object); });
      for (const [id, mesh] of meshes) if (!rootMeshes.delete(mesh)) fail(`mesh ${id} is outside root`);
      if (rootMeshes.size) fail('root contains unregistered meshes');
      for (const exclusion of exemptions.values()) {
        if (owners.get(exclusion.meshes[0]) === owners.get(exclusion.meshes[1]))
          fail('exclusion must target different assemblies');
      }
      sealed = true;
      root.updateWorldMatrix(true, true);
      const meshBounds = new Map(), assemblyBounds = new Map(), anchors = {};
      for (const [id, mesh] of meshes) {
        if (mesh.isInstancedMesh || mesh.isSkinnedMesh || Object.keys(mesh.geometry?.morphAttributes ?? {}).length)
          fail(`unsupported deformed mesh ${id}`);
        mesh.matrixWorld.elements.forEach(n => finite(n, `matrix ${id}`));
        const positions = mesh.geometry?.getAttribute('position');
        if (!positions || positions.itemSize < 3 || !Number.isSafeInteger(positions.count) || positions.count < 1)
          fail(`mesh ${id} needs nonempty position vertices`);
        if (mesh.drawMode !== undefined && mesh.drawMode !== (THREE.TrianglesDrawMode ?? 0))
          fail(`unsupported triangle draw mode ${id}`);
        const determinant = finite(mesh.matrixWorld.determinant(), `transform determinant ${id}`);
        if (determinant === 0) fail(`collapsed transform ${id}`);
        const index = mesh.geometry.getIndex();
        if (index && (index.itemSize !== 1 || !Number.isSafeInteger(index.count))) fail(`invalid index ${id}`);
        const total = index ? index.count : positions.count;
        const { start, count: requested } = mesh.geometry.drawRange;
        if (!Number.isSafeInteger(start) || start < 0 || start > total) fail(`invalid drawRange start ${id}`);
        const length = requested === Infinity ? total - start : requested;
        if (!Number.isSafeInteger(length) || length < 3 || length % 3 || start + length > total)
          fail(`invalid triangle drawRange count ${id}`);
        const box = new THREE.Box3(), triangle = [];
        let nondegenerate = false;
        for (let cursor = start; cursor < start + length; cursor++) {
          const i = index ? index.getX(cursor) : cursor;
          if (!Number.isSafeInteger(i) || i < 0 || i >= positions.count) fail(`invalid vertex index ${id}`);
          const point = new THREE.Vector3().fromBufferAttribute(positions, i);
          point.toArray().forEach(n => finite(n, `vertex ${id}[${i}]`));
          point.applyMatrix4(mesh.matrixWorld);
          point.toArray().forEach(n => finite(n, `world vertex ${id}[${i}]`));
          box.expandByPoint(point); triangle.push(point);
          if (triangle.length === 3) {
            const ab = triangle[1].clone().sub(triangle[0]);
            const ac = triangle[2].clone().sub(triangle[0]);
            const magnitude = Math.max(...ab.toArray().map(Math.abs), ...ac.toArray().map(Math.abs));
            finite(magnitude, `triangle edges ${id}`);
            if (magnitude > 0) {
              const area = ab.divideScalar(magnitude).cross(ac.divideScalar(magnitude)).lengthSq();
              if (finite(area, `triangle area ${id}`) > 0) nondegenerate = true;
            }
            triangle.length = 0;
          }
        }
        if (!nondegenerate) fail(`no nondegenerate world triangle ${id}`);
        meshBounds.set(id, checkedBox(box, id));
      }
      for (const [id, assembly] of assemblies) {
        const box = new THREE.Box3();
        assembly.meshes.forEach(mesh => box.union(meshBounds.get(mesh)));
        assemblyBounds.set(id, checkedBox(box, id));
        anchors[id] = {};
        for (const [anchor, spec] of Object.entries(assembly.anchors)) {
          const local = typeof spec.local === 'function' ? spec.local(state) : spec.local;
          const point = vector(local, `anchor ${id}.${anchor}`)
            .applyMatrix4(meshes.get(spec.mesh).matrixWorld);
          point.toArray().forEach(n => finite(n, `world anchor ${id}.${anchor}`));
          anchors[id][anchor] = point.toArray();
        }
      }
      const errors = [], excluded = [], axes = ['x', 'y', 'z'];
      const penetration = (a, b) => axes.map(axis =>
        Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]));
      const entries = [...assemblies.entries()];
      for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
        const [a, aa] = entries[i], [b, bb] = entries[j];
        if (!penetration(assemblyBounds.get(a), assemblyBounds.get(b)).every(n => n > tolerance)) continue;
        // Full assembly bounds are conservative: even empty-space union overlaps
        // fail. Exact exemptions require actual intersecting owned mesh pairs.
        let intersectingPairs = 0;
        for (const ma of aa.meshes) for (const mb of bb.meshes) {
          const depths = penetration(meshBounds.get(ma), meshBounds.get(mb));
          if (!depths.every(n => n > tolerance)) continue;
          intersectingPairs++;
          const exemption = exemptions.get(pairKey(ma, mb));
          const active = exemption?.active ? exemption.active(state) : true;
          if (typeof active !== 'boolean') fail('exclusion active must return a synchronous boolean');
          if (exemption && active && depths.every((depth, axis) => depth <= exemption.maxDepth[axis]))
            excluded.push({ assemblies: [a, b], meshes: exemption.meshes, reason: exemption.reason,
              maxDepth: exemption.maxDepth, depths, evidence: 'bounded AABB exemption only; not surface evidence' });
          else errors.push({ type: 'keep-out', assemblies: [a, b], meshes: [ma, mb], depths });
        }
        if (!intersectingPairs) errors.push({
          type: 'keep-out', assemblies: [a, b], meshes: [],
          depths: penetration(assemblyBounds.get(a), assemblyBounds.get(b)),
          evidence: 'assembly union bounds overlap; no mesh-pair exclusion applies',
        });
      }
      const contactResults = [];
      for (const spec of contacts.values()) {
        const upper = assemblyBounds.get(spec.upper), lower = assemblyBounds.get(spec.lower);
        const gap = upper.min[spec.axis] - lower.max[spec.axis];
        const overlaps = axes.filter(axis => axis !== spec.axis).map(axis =>
          Math.min(upper.max[axis], lower.max[axis]) - Math.max(upper.min[axis], lower.min[axis]));
        const ok = Math.abs(gap) <= spec.tolerance && overlaps.every(n => n > spec.minOverlap);
        const result = { id: spec.id, type: 'contact', ok, gap, overlaps };
        contactResults.push(result);
        if (!ok) errors.push(result);
      }
      return {
        ok: errors.length === 0, errors, contacts: contactResults, excluded, anchors,
        assemblyBounds: Object.fromEntries([...assemblyBounds].map(([id, box]) => [id, boxData(box)])),
        meshBounds: Object.fromEntries([...meshBounds].map(([id, box]) => [id, boxData(box)])),
        evidence: 'coarse world-vertex AABBs; not surface contact or solid collision certification',
      };
    },
    sample(states, apply) {
      if (!Array.isArray(states) || !states.length) fail('sample needs nonempty explicit states');
      if (typeof apply !== 'function') fail('sample needs an apply(state, index) function');
      const samples = states.map((state, index) => {
        const applied = apply(state, index);
        if (applied && typeof applied.then === 'function') fail('sample apply must be synchronous');
        return { index, state, ...api.evaluate(state) };
      });
      return { ok: samples.every(sample => sample.ok), samples };
    },
  };
  return api;
}
