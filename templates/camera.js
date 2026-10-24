import * as THREE from 'three';

/**
 * Locked three-quarter camera. Distance is solved against a set of fit points
 * (slab corners plus the tops of tall props) so the play keeps its white
 * margin at every aspect ratio. Nothing here orbits or drifts.
 */
export const CAMERA = {
  fov: 20.5,
  azimuth: (45.0 * Math.PI) / 180,
  elevation: (33.0 * Math.PI) / 180,
  target: new THREE.Vector3(0, -0.15, 0),
  fillX: 0.84,
  fillY: 0.86,
  // Post-fit camera multiplier. Keep 1.0 for the fitted size; 0.70 makes the
  // diorama 30% smaller linearly and leaves more paper margin. This is a camera
  // move only: slab, world clip, shadows and canvas stay at full scale.
  subjectScale: 1.0,
};

/** Override this list for a different slab / landmark height. */
export const FIT_POINTS = [
  new THREE.Vector3(-10.5, 0.0, -7.0),
  new THREE.Vector3(10.5, 0.0, -7.0),
  new THREE.Vector3(10.5, 0.0, 7.0),
  new THREE.Vector3(-10.5, 0.0, 7.0),
  new THREE.Vector3(-10.5, -0.42, -7.0),
  new THREE.Vector3(10.5, -0.42, -7.0),
  new THREE.Vector3(10.5, -0.42, 7.0),
  new THREE.Vector3(-10.5, -0.42, 7.0),
  new THREE.Vector3(0.0, 3.6, 0.0),
];

export function cameraDirection(out = new THREE.Vector3()) {
  const ce = Math.cos(CAMERA.elevation);
  return out.set(
    ce * Math.cos(CAMERA.azimuth),
    Math.sin(CAMERA.elevation),
    ce * Math.sin(CAMERA.azimuth)
  );
}

function fits(dir, right, up, aspect, distance, points) {
  const tanHalf = Math.tan((CAMERA.fov * Math.PI) / 360);
  const p = new THREE.Vector3();
  for (const fit of points) {
    p.subVectors(fit, CAMERA.target);
    const depth = distance - p.dot(dir);
    if (depth < 0.4) return false;
    const x = p.dot(right) / (depth * tanHalf * aspect);
    const y = p.dot(up) / (depth * tanHalf);
    if (Math.abs(x) > CAMERA.fillX) return false;
    if (Math.abs(y) > CAMERA.fillY) return false;
  }
  return true;
}

export function solveDistance(aspect, points = FIT_POINTS) {
  const a = Math.max(0.3, aspect);
  const dir = cameraDirection();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
  const up = new THREE.Vector3().crossVectors(dir, right).normalize();

  let lo = 5;
  let hi = 300;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) * 0.5;
    if (fits(dir, right, up, a, mid, points)) hi = mid;
    else lo = mid;
  }
  return hi;
}

export function createCamera(aspect = 1.16, points = FIT_POINTS) {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, aspect, 0.5, 400);
  updateCamera(camera, aspect, points);
  return camera;
}

export function updateCamera(camera, aspect, points = FIT_POINTS) {
  const a = Math.max(0.3, aspect);
  const fit = solveDistance(a, points);
  const scale = CAMERA.subjectScale ?? 1;
  const d = fit / Math.max(0.1, scale);
  const dir = cameraDirection();
  camera.position.copy(CAMERA.target).addScaledVector(dir, d);
  camera.lookAt(CAMERA.target);
  camera.aspect = a;
  camera.near = Math.max(0.3, d * 0.01);
  camera.far = d * 4 + 80;
  camera.updateProjectionMatrix();
  camera.userData.fitDistance = fit;
  camera.userData.subjectScale = scale;
  camera.userData.distance = d;
}
