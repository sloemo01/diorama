// CPU posed bounds for QA. Caller evaluates its real driver/mixer first.
// Includes hidden/transparent physical meshes. Bounds are conservative, not mesh collision.
export function createPoseBounds(THREE) {
  const fail = message => { throw new Error(`pose-bounds: ${message}`); };
  const finite = a => a.every(Number.isFinite);
  function measure(mesh, { instanceId, frame, includePoints = false } = {}) {
    if (!mesh?.isMesh || mesh.isBatchedMesh) fail('ordinary, skinned or explicit rigid instance Mesh required');
    const geometry = mesh.geometry, position = geometry?.getAttribute?.('position');
    if (!position || position.itemSize !== 3 || !Number.isInteger(position.count) || position.count < 3) fail('nonempty geometry required');
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!m?.isMaterial || m.isShaderMaterial || m.isRawShaderMaterial || m.displacementMap ||
          m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) fail('unmeasured shader/displacement geometry');
    }
    mesh.updateWorldMatrix(true, false);
    if (mesh.isSkinnedMesh) {
      mesh.updateMatrixWorld(true); // also refresh attached bindMatrixInverse
      if (!mesh.skeleton?.bones?.length) fail('missing skeleton');
      for (const bone of mesh.skeleton.bones) bone.updateWorldMatrix(true, false);
      mesh.skeleton.update();
    }
    const matrix = mesh.matrixWorld.clone();
    if (mesh.isInstancedMesh) {
      if (!Number.isInteger(instanceId) || instanceId < 0 || instanceId >= mesh.count || mesh.morphTexture) fail('explicit rigid instance id required; instance morph unsupported');
      const instance = new THREE.Matrix4(); mesh.getMatrixAt(instanceId, instance); matrix.multiply(instance);
    } else if (instanceId !== undefined) fail('instanceId on non-instanced mesh');
    if (frame) {
      if (!frame.isObject3D) fail('Object3D frame required');
      frame.updateWorldMatrix(true, false);
      if (!finite(frame.matrixWorld.elements) || frame.matrixWorld.determinant() === 0) fail('invalid frame');
      matrix.premultiply(frame.matrixWorld.clone().invert());
    }
    if (!finite(matrix.elements) || matrix.determinant() === 0) fail('invalid world transform');
    const index = geometry.getIndex();
    if (index && (index.itemSize !== 1 || !Number.isInteger(index.count))) fail('malformed index');
    const count = index ? index.count : position.count, range = geometry.drawRange;
    if (!range || !Number.isInteger(range.start) || range.start < 0 || range.start > count ||
        !(range.count === Infinity || Number.isInteger(range.count) && range.count >= 0)) fail('invalid drawRange');
    const end = Math.min(count, range.start + range.count);
    if (end <= range.start || range.start % 3 || (end - range.start) % 3) fail('empty/malformed triangle range');
    if (typeof mesh.getVertexPosition !== 'function') fail('Three.js getVertexPosition support required');
    const bounds = new THREE.Box3(), points = includePoints ? [] : undefined;
    let nondegenerate = false; const triangle = [];
    for (let i = range.start; i < end; i++) {
      const vertex = index ? index.getX(i) : i;
      if (!Number.isInteger(vertex) || vertex < 0 || vertex >= position.count) fail('invalid index');
      const point = mesh.getVertexPosition(vertex, new THREE.Vector3());
      if (!finite(point.toArray())) fail('nonfinite posed vertex');
      point.applyMatrix4(matrix);
      if (!finite(point.toArray())) fail('nonfinite transformed vertex');
      bounds.expandByPoint(point); if (points) points.push(point.clone());
      triangle.push(point);
      if (triangle.length === 3) {
        const cross = new THREE.Vector3().subVectors(triangle[1],triangle[0]).cross(new THREE.Vector3().subVectors(triangle[2],triangle[0]));
        if (!Number.isFinite(cross.lengthSq())) fail('invalid triangle');
        nondegenerate ||= cross.lengthSq() > 0; triangle.length = 0;
      }
    }
    if (bounds.isEmpty() || !nondegenerate) fail('empty/collapsed posed geometry');
    return { bounds, points, vertexCount: end-range.start,
      method: mesh.isSkinnedMesh ? 'cpu-skinned-active-vertices' : mesh.morphTargetInfluences?.length ? 'cpu-morphed-active-vertices' : 'rigid-active-vertices',
      limitation: 'At this pose only; group/material ranges may be over-covered. No GPU deformation or continuous/mesh-intersection proof.' };
  }
  return { measure };
}
