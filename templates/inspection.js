// Copy-in rigid-mesh inspection. Dependency injection avoids a second THREE copy.
// Host owns raycasting, useful camera focus, V8 DOM, time, and authored cutaways.
// No bloom, depth override, whole-mechanism transparency, or geometry certification.
export function createInspection(THREE, {
  parts, contextMeshes = [], resolveVisibility = () => ({}), onChange = () => {},
  style = {},
} = {}) {
  const config = { selectedColor: 0x80dbff, selectedMix: 0.32,
    emissive: 0x169bdf, emissiveIntensity: 0.65, dimFactor: 0.32,
    edgeColor: 0x62d5ff, edgeOpacity: 0.85, edgeAngle: 38, ghostOpacity: 0.105,
    edgeEligible: () => true, ...style };
  for (const key of ['selectedMix', 'dimFactor', 'edgeOpacity', 'ghostOpacity'])
    if (!Number.isFinite(config[key]) || config[key] < 0 || config[key] > 1) throw new Error(`invalid inspection style: ${key}`);
  if (!Number.isFinite(config.emissiveIntensity) || config.emissiveIntensity < 0
    || !Number.isFinite(config.edgeAngle) || config.edgeAngle < 0 || config.edgeAngle > 180)
    throw new Error('invalid inspection emission/edge angle');
  if (!(parts instanceof Map) && (!parts || typeof parts !== 'object')) throw new Error('parts Map/object required');
  const registry = parts instanceof Map ? parts : new Map(Object.entries(parts));
  if (!registry.size) throw new Error('nonempty inspection parts required');
  const saved = new Map(), owners = new Map(), variants = new Map();
  const overlays = [];
  let selection = null, disposed = false, visibility = {};
  const slots = material => Array.isArray(material) ? material : [material];
  const alive = () => { if (disposed) throw new Error('inspection controller disposed'); };
  function register(mesh, owner) {
    if (!mesh?.isMesh || !mesh.geometry || !mesh.material || !mesh.geometry.attributes?.position?.count)
      throw new Error('actual nonempty mesh/material required');
    if (mesh.isSkinnedMesh || mesh.isInstancedMesh || Object.keys(mesh.geometry.morphAttributes || {}).length)
      throw new Error('inspection helper supports rigid meshes only; author a deformation-aware path');
    if (saved.has(mesh)) throw new Error('mesh registered twice or owned by multiple parts');
    if (!slots(mesh.material).length || slots(mesh.material).some(m => !m?.isMaterial || typeof m.clone !== 'function' || !m.color?.lerp))
      throw new Error('colour-bearing material slots required; custom shaders need an authored adapter');
    owners.set(mesh, owner);
    saved.set(mesh, { material: mesh.material, visible: mesh.visible,
      castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow });
  }
  for (const [id, rec] of registry) {
    if (!id || !rec || !Array.isArray(rec.meshes) || !rec.meshes.length) throw new Error(`nonempty mesh list required: ${id}`);
    for (const mesh of rec.meshes) register(mesh, id);
  }
  for (const mesh of contextMeshes) register(mesh, null);
  function restore() {
    for (const [mesh, original] of saved) {
      mesh.material = original.material; mesh.visible = original.visible;
      mesh.castShadow = original.castShadow; mesh.receiveShadow = original.receiveShadow;
    }
  }
  function removeEdges() {
    for (const edge of overlays) { edge.removeFromParent(); edge.geometry.dispose(); }
    overlays.length = 0;
  }
  function variant(source, mode) {
    let modes = variants.get(source);
    if (!modes) variants.set(source, modes = new Map());
    if (modes.has(mode)) return modes.get(mode);
    const material = source.clone();
    material.userData = { ...source.userData };
    if (source.userData?.outlineParameters)
      material.userData.outlineParameters = { ...source.userData.outlineParameters };
    if (mode.startsWith('selected')) {
      material.color?.lerp(new THREE.Color(config.selectedColor), config.selectedMix);
      // Adding emissive to MeshBasicMaterial breaks Three's uniform refresh.
      if (material.emissive?.set) {
        material.emissive.set(config.emissive);
        material.emissiveIntensity = config.emissiveIntensity;
      }
    } else if (mode === 'ghost') {
      material.transparent = true; material.opacity = config.ghostOpacity;
      material.depthWrite = false; material.depthTest = true;
      material.side = THREE.FrontSide; material.blending = THREE.NormalBlending;
      if (material.emissive?.set) material.emissiveIntensity = 0;
      if (material.userData.outlineParameters) material.userData.outlineParameters.visible = false;
    } else {
      material.color?.multiplyScalar(config.dimFactor);
      if (material.emissive?.set) material.emissiveIntensity = 0;
    }
    // Preserve maps, ramps, opacity, side, depth, blending and original contours.
    // Feature edges below replace selected contours on eligible rigid meshes.
    if (mode === 'selected-edge' && material.userData.outlineParameters)
      material.userData.outlineParameters.visible = false;
    material.needsUpdate = true;
    modes.set(mode, material);
    return material;
  }
  const edgeMaterial = new THREE.LineBasicMaterial({ color: config.edgeColor,
    transparent: true, opacity: config.edgeOpacity, depthTest: true,
    depthWrite: false, toneMapped: false });
  function eligible(mesh) {
    const materials = slots(saved.get(mesh).material);
    return materials.every(m => !m.transparent && !m.map)
      && mesh.userData.inspectionEdge !== false
      && !mesh.userData.symbolicSignal && config.edgeEligible(mesh);
  }
  function apply() {
    alive();
    try {
    removeEdges(); restore();
    visibility = resolveVisibility(selection ? { ...selection } : null) || {};
    const hidden = new Set(visibility.hiddenMeshes || []);
    for (const id of visibility.hiddenPartIds || []) {
      if (!registry.has(id)) throw new Error(`unknown authored cutaway part: ${id}`);
      if (id === selection?.partId) throw new Error('cutaway cannot hide the selected assembly');
      for (const mesh of registry.get(id).meshes) hidden.add(mesh);
    }
    for (const mesh of hidden) {
      const part = registry.get(owners.get(mesh));
      if (!saved.has(mesh) || !part) throw new Error('context/unregistered meshes cannot be hidden');
      const internalCutaway = part.inspectionOccluder === true && selection
        && typeof visibility.description === 'string' && visibility.description.trim();
      if (part.shell !== true && !internalCutaway)
        throw new Error('hiding requires a manifest shell or explained inspectionOccluder selection plan');
      if (owners.get(mesh) === selection?.partId && (!selection.mesh || mesh === selection.mesh))
        throw new Error('cutaway cannot hide the selected assembly or piece');
    }
    const ghost = new Set(visibility.ghostMeshes || []);
    for (const id of visibility.ghostPartIds || []) {
      if (registry.get(id)?.shell !== true) throw new Error(`only manifest shell parts may ghost: ${id}`);
      for (const mesh of registry.get(id).meshes) ghost.add(mesh);
    }
    for (const mesh of ghost) {
      if (!saved.has(mesh) || registry.get(owners.get(mesh))?.shell !== true)
        throw new Error('ghost mesh must belong to a manifest shell part');
      if (hidden.has(mesh)) throw new Error('cutaway cannot both hide and ghost a mesh');
      if (owners.get(mesh) === selection?.partId) throw new Error('selected shell must remain solid');
    }
    for (const [mesh, original] of saved) {
      if (owners.get(mesh) === null) continue; // floor/stand/UI context never dims or reveals
      const chosen = selection && owners.get(mesh) === selection.partId
        && (!selection.mesh || selection.mesh === mesh);
      if (hidden.has(mesh)) { mesh.visible = false; mesh.castShadow = false; continue; }
      if (!selection && !ghost.has(mesh)) continue;
      const mode = ghost.has(mesh) ? 'ghost' : chosen ? (eligible(mesh) ? 'selected-edge' : 'selected') : 'dim';
      const materials = slots(original.material).map(m => variant(m, mode));
      // Each mesh gets its own array, exact source array identity restores on clear.
      mesh.material = Array.isArray(original.material) ? materials : materials[0];
      if (ghost.has(mesh)) mesh.castShadow = false;
      if (chosen && original.visible && eligible(mesh)) {
        // Cached variants can be shared; do not mutate their outline parameters
        // per mesh. Use one eligible-selected variant branch for contour suppression.
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, config.edgeAngle), edgeMaterial);
        edge.userData.inspectionOverlay = true; edge.raycast = () => {};
        mesh.add(edge); overlays.push(edge);
      }
    }
    onChange({ selection: selection ? { ...selection } : null,
      visibility: { ...visibility }, overlays: overlays.length });
    } catch (error) {
      removeEdges(); restore(); selection = null; visibility = {};
      throw error;
    }
  }
  function select({ partId, mesh = null } = {}) {
    alive();
    if (!registry.has(partId)) throw new Error(`unknown inspection part: ${partId}`);
    if (mesh && owners.get(mesh) !== partId) throw new Error('selected mesh is not a member of that part');
    selection = { partId, mesh }; apply();
  }
  function clear() { alive(); selection = null; apply(); }
  function piecePickerEntries(partId, { visibleOnly = false } = {}) {
    alive(); if (!registry.has(partId)) throw new Error(`unknown inspection part: ${partId}`);
    return registry.get(partId).meshes.filter(mesh => {
      if (mesh.userData.symbolicSignal) return false;
      if (!visibleOnly) return true;
      for (let p = mesh; p; p = p.parent) if (!p.visible) return false;
      return true;
    }).map((mesh, i) => ({ value: mesh.uuid, mesh,
      label: mesh.userData.inspectionLabel || mesh.name || `${partId} piece ${i + 1}` }));
  }
  function dispose() {
    if (disposed) return;
    removeEdges(); restore();
    for (const modes of variants.values()) for (const material of modes.values()) material.dispose();
    variants.clear(); edgeMaterial.dispose(); selection = null; disposed = true;
  }
  return { select, clear, refresh: apply, dispose, piecePickerEntries,
    get selection() { return selection ? { ...selection } : null; },
    get stats() { return { meshes: saved.size, overlays: overlays.length,
      variants: [...variants.values()].reduce((n, modes) => n + modes.size, 0), disposed }; } };
}
