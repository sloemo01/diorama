import * as THREE from 'three';

/**
 * Copy-in motion-graphics primitives for educational / mechanical scenes.
 *
 * Failure modes this file exists to prevent (see SKILL.md v3.12.0):
 *  - a cone built with swapped radii, so every arrow flows backwards
 *  - arrows drawn along the centreline of an opaque pipe, then "fixed" with
 *    depthTest:false (x-ray)
 *  - effects that fade to a two-pixel speck instead of disappearing
 *  - sizing against a cached deck height instead of the moving free volume
 *  - a spline through a cutaway that spears the valve disc; derive the arrow
 *    from the live free band (crown to valve underside) instead
 *  - clamping only the arrow centre, so the head pierces the crown/valve
 *  - authored lengths shorter than the desired length (scale > 1), which
 *    defeats the legibility gate
 *
 * SPACE: every Y passed here must be in the same space as the constants used
 * for the crown/valve/ceiling. If the effect group is parented to a lifted
 * scene root, either subtract that lift or author the constants locally.
 *
 * CONVENTION: an arrow points along local +Z. The cone tip is a single point at
 * +Z, the wide base sits behind it, and the tail is at -Z. `setArrowTransform`
 * maps +Z onto the requested flow tangent.
 */

export function makeFlowArrow({
  length = 0.4,
  shaftRadius = 0.023,
  headRadius = 0.079,
  headRatio = 0.34,
  material,
} = {}) {
  if (!material) throw new Error('makeFlowArrow: material is required');
  if (material.transparent || material.depthTest === false) {
    throw new Error('makeFlowArrow: effects must be opaque and depth-tested');
  }
  const group = new THREE.Group();
  const headLen = length * headRatio;
  const shaftLen = length - headLen;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLen, 12), material);
  // radiusTop is the +Y end; after rotation.x = +90deg, +Y becomes +Z.
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0, headRadius, headLen, 18), material);
  shaft.rotation.x = Math.PI / 2;
  head.rotation.x = Math.PI / 2;
  shaft.position.z = -length * 0.5 + shaftLen * 0.5;
  head.position.z = length * 0.5 - headLen * 0.5;
  shaft.castShadow = head.castShadow = false;
  shaft.receiveShadow = head.receiveShadow = false;
  group.add(shaft, head);
  group.userData = {
    length,
    shaftRadius,
    headRadius,
    tipLocal: new THREE.Vector3(0, 0, length * 0.5),
    tailLocal: new THREE.Vector3(0, 0, -length * 0.5),
    shaft,
    head,
  };
  return group;
}

export function setArrowTransform(group, point, tangent, scale = 1) {
  group.position.copy(point);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.clone().normalize());
  group.scale.setScalar(scale);
}

/**
 * Fit the COMPLETE arrow (tip, tail, head width) into a vertical band and the
 * bore radius. Returns false and hides the arrow when it cannot be legible,
 * instead of leaving a spec. `minScale` should be ~0.32 for a chamber-sized
 * arrow read at a normal orbit distance; 0.22 is only for very large arrows.
 */
export function placeArrowInBand(arrow, point, direction, desiredScale, floor, roof, {
  minScale = 0.22,
  boreRadius = 0.40,
} = {}) {
  const dir = direction.clone().normalize();
  const half = (arrow.userData.length ?? 0.4) * 0.5;
  const head = arrow.userData.headRadius ?? 0.079;
  const extentY = half * Math.abs(dir.y) + head * Math.sqrt(Math.max(0, 1 - dir.y * dir.y));
  const horizontal = half * Math.hypot(dir.x, dir.z) + head;
  const radial = Math.hypot(point.x, point.z);
  const band = roof - floor;
  const scale = Math.min(
    desiredScale,
    band / (2 * Math.max(extentY, 0.001)),
    (boreRadius - radial) / Math.max(horizontal, 0.001),
  );
  if (!Number.isFinite(scale) || scale < minScale) {
    arrow.visible = false;
    return false;
  }
  arrow.visible = true;
  point.y = THREE.MathUtils.clamp(point.y, floor + extentY * scale, roof - extentY * scale);
  setArrowTransform(arrow, point, dir, scale);
  return true;
}

/** Minimum legible scale check shared by build-time and QA code. */
export function isLegibleArrow(arrow, minScale = 0.32) {
  return arrow.visible && arrow.scale.z >= minScale;
}
