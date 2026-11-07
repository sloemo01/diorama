// Dependency injection keeps this module independent of a particular Three.js install.
export function createConstructionKit(THREE) {
  const finite = (n, label) => { if (!Number.isFinite(n)) throw new TypeError(`${label} must be finite`); return n; };
  const positive = (n, label) => { finite(n, label); if (n <= 0) throw new RangeError(`${label} must be positive`); return n; };
  function vector(value, label) {
    const a = value?.isVector3 ? [value.x, value.y, value.z] : value;
    if (!Array.isArray(a) || a.length !== 3) throw new TypeError(`${label} must have three coordinates`);
    return new THREE.Vector3(...a.map(n => finite(n, label)));
  }
  function mesh(parent, material, geometry, name) {
    if (!parent?.isObject3D || !material?.isMaterial) throw new TypeError('Object3D parent and Material required');
    const result = new THREE.Mesh(geometry, material);
    if (name !== undefined) { if (typeof name !== 'string') throw new TypeError('name must be a string'); result.name = name; }
    parent.add(result);
    return result;
  }
  function boxAtBase(parent, mat, { size, base, name }) {
    const dimensions = vector(size, 'size');
    [dimensions.x, dimensions.y, dimensions.z].forEach(n => positive(n, 'size'));
    const position = vector(base, 'base');
    position.y += dimensions.y / 2;
    const result = mesh(parent, mat, new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z), name);
    result.position.copy(position);
    return result;
  }
  function between(parent, mat, { a, b, radius, radialSegments = 24, name }) {
    const start = vector(a, 'a'), end = vector(b, 'b');
    const axis = end.clone().sub(start), length = positive(axis.length(), 'endpoint separation');
    positive(radius, 'radius');
    if (!Number.isInteger(radialSegments) || radialSegments < 3) throw new RangeError('radialSegments must be an integer >= 3');
    const result = mesh(parent, mat, new THREE.CylinderGeometry(radius, radius, length, radialSegments), name);
    result.position.copy(start).add(end).multiplyScalar(0.5);
    result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
    return result;
  }
  function gridFrames({ columns, rows, spacing, center }) {
    if (![columns, rows].every(n => Number.isSafeInteger(n) && n > 0)) throw new RangeError('positive integer grid counts required');
    if (!Array.isArray(spacing) || spacing.length !== 2) throw new TypeError('spacing is [x,z]');
    spacing.forEach(n => positive(n, 'spacing'));
    const origin = vector(center, 'grid center'), frames = [];
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) frames.push({
      row, column, position: origin.clone().add(new THREE.Vector3((column - (columns - 1) / 2) * spacing[0], 0, (row - (rows - 1) / 2) * spacing[1])),
      quaternion: new THREE.Quaternion(),
    });
    return frames;
  }
  function radialFrames({ count, radius, center, phase = 0 }) {
    if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('positive integer radial count required');
    positive(radius, 'radius'); finite(phase, 'phase'); const origin = vector(center, 'radial center');
    return Array.from({ length: count }, (_, index) => {
      const angle = phase + index * Math.PI * 2 / count;
      return { index, angle, position: origin.clone().add(new THREE.Vector3(radius * Math.cos(angle), 0, -radius * Math.sin(angle))),
        quaternion: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle) };
    });
  }
  function plateWithHoles(parent, mat, { width, depth, thickness, holes = [], base, name }) {
    [width, depth, thickness].forEach(n => positive(n, 'plate dimension'));
    const position = vector(base, 'base');
    if (!Array.isArray(holes)) throw new TypeError('holes must be an array');
    holes.forEach(({ x, z, radius }, i) => {
      finite(x, 'hole x'); finite(z, 'hole z'); positive(radius, 'hole radius');
      if (Math.abs(x) + radius >= width / 2 || Math.abs(z) + radius >= depth / 2) throw new RangeError('hole must be strictly inside plate');
      holes.slice(0, i).forEach(h => { if (Math.hypot(x - h.x, z - h.z) <= radius + h.radius) throw new RangeError('holes must not touch or overlap'); });
    });
    // Shape XY -> world XZ: local Y becomes -Z and extrusion +Z becomes +Y.
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -depth / 2); shape.lineTo(width / 2, -depth / 2);
    shape.lineTo(width / 2, depth / 2); shape.lineTo(-width / 2, depth / 2); shape.closePath();
    holes.forEach(({ x, z, radius }) => {
      const hole = new THREE.Path(); hole.absarc(x, -z, radius, 0, Math.PI * 2, true); shape.holes.push(hole);
    });
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 32, steps: 1 });
    geometry.rotateX(-Math.PI / 2);
    const result = mesh(parent, mat, geometry, name); result.position.copy(position); return result;
  }
  function collectWorldPoints(root) {
    if (!root?.isObject3D) throw new TypeError('root must be Object3D');
    root.updateWorldMatrix(true, true);
    const points = [];
    function visit(object, visible) {
      visible = visible && object.visible;
      if (!visible) return;
      if (object.isSkinnedMesh || object.isInstancedMesh || Object.values(object.geometry?.morphAttributes || {}).some(a => a.length)) throw new Error('deformed or instanced geometry is unsupported');
      const geometry = object.geometry;
      if (geometry) {
        const position = geometry.getAttribute('position');
        if (!position || position.itemSize !== 3) throw new Error('geometry needs three-component positions');
        const index = geometry.index, count = index ? index.count : position.count;
        const start = geometry.drawRange.start, end = Math.min(count, start + geometry.drawRange.count);
        for (let i = start; i < end; i++) {
          const groups = geometry.groups;
          const material = Array.isArray(object.material)
            ? groups.filter(g => i >= g.start && i < g.start + g.count).map(g => object.material[g.materialIndex])
            : [object.material];
          if (!material.some(m => m && m.visible !== false)) continue;
          const point = new THREE.Vector3().fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(object.matrixWorld);
          vector(point, 'world vertex'); points.push(point);
        }
      }
      object.children.forEach(child => visit(child, visible));
    }
    let ancestorsVisible = true;
    for (let p = root.parent; p; p = p.parent) ancestorsVisible &&= p.visible;
    visit(root, ancestorsVisible);
    return points;
  }
  function fitPerspective(camera, { points, direction, target, aspect = camera.aspect, margin = 0.08 }) {
    if (!camera?.isPerspectiveCamera || camera.parent) throw new TypeError('unparented PerspectiveCamera required');
    if (!Array.isArray(points) || !points.length) throw new TypeError('nonempty points required');
    const vertices = points.map(p => vector(p, 'point'));
    const outward = vector(direction, 'direction'); positive(outward.length(), 'direction length'); outward.normalize();
    positive(aspect, 'aspect'); finite(margin, 'margin');
    if (margin < 0 || margin > 0.4) throw new RangeError('margin must be in [0, 0.4]');
    positive(camera.near, 'near'); positive(camera.zoom, 'zoom');
    if (!(camera.fov > 0 && camera.fov < 180) || !Number.isFinite(camera.fov)) throw new RangeError('invalid fov');
    if (camera.view?.enabled || camera.filmOffset !== 0) throw new Error('asymmetric frustum unsupported');
    const center = target === undefined ? new THREE.Box3().setFromPoints(vertices).getCenter(new THREE.Vector3()) : vector(target, 'target');
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(outward.dot(up)) > 0.999) up.set(0, 0, 1);
    const right = up.clone().cross(outward).normalize(), vertical = outward.clone().cross(right).normalize();
    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.zoom;
    const safe = 1 - margin, tanX = tanY * aspect;
    let distance = camera.near * 1.1;
    vertices.forEach(p => {
      const relative = p.clone().sub(center), along = relative.dot(outward);
      distance = Math.max(distance, along + Math.abs(relative.dot(right)) / (tanX * safe), along + Math.abs(relative.dot(vertical)) / (tanY * safe), along + camera.near * 1.1);
    });
    distance *= 1 + 1e-10;
    finite(distance, 'fit distance');
    camera.aspect = aspect; camera.up.copy(up); camera.position.copy(center).addScaledVector(outward, distance);
    const maxDepth = vertices.reduce((depth, p) => Math.max(depth, distance - p.clone().sub(center).dot(outward)), 0);
    camera.far = Math.max(positive(camera.far, 'far'), maxDepth * 1.1, camera.near * 2);
    camera.lookAt(center); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    return { target: center, distance, position: camera.position.clone(), quaternion: camera.quaternion.clone() };
  }
  return { boxAtBase, between, gridFrames, radialFrames, plateWithHoles, collectWorldPoints, fitPerspective };
}
