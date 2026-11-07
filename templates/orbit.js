// All presets: deterministic hero pose + user orbit; never auto-spin.
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createDioramaOrbit(camera, canvas, {
  target, minDistance = 1, maxDistance = 100,
  minPolarAngle = 0.08, maxPolarAngle = Math.PI - 0.08,
  clickSlop = 5, onSelect = () => {}, onChange = () => {},
} = {}) {
  const controls = new OrbitControls(camera, canvas);
  if (target) controls.target.copy(target);
  controls.enablePan = false;
  controls.autoRotate = false;
  // No damping tail: a drag must not move the camera after QA resets it.
  controls.enableDamping = false;
  Object.assign(controls, { minDistance, maxDistance, minPolarAngle, maxPolarAngle });
  controls.update();
  const heroPosition = camera.position.clone(), heroTarget = controls.target.clone();
  const heroZoom = camera.zoom;
  const pointers = new Map();
  let gesture = false;
  function down(e) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: false });
    if (pointers.size > 1) { gesture = true; for (const p of pointers.values()) p.moved = true; }
  }
  function move(e) {
    const p = pointers.get(e.pointerId);
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > clickSlop) p.moved = true;
  }
  function up(e) {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > clickSlop) p.moved = true;
    if (p && !p.moved && !gesture && (e.button === 0 || e.pointerType === 'touch')) onSelect(e);
    if (!pointers.size) gesture = false;
  }
  function cancel(e) { pointers.delete(e.pointerId); if (!pointers.size) gesture = false; }
  function reset() {
    pointers.clear(); gesture = false;
    camera.position.copy(heroPosition); camera.zoom = heroZoom;
    controls.target.copy(heroTarget); camera.updateProjectionMatrix(); controls.update();
    onChange();
  }
  function key(e) {
    if (e.target !== canvas) return;
    if (e.key.toLowerCase() === 'r') { e.preventDefault(); reset(); return; }
    const delta = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] }[e.key];
    if (!delta) return;
    e.preventDefault();
    const offset = camera.position.clone().sub(controls.target);
    const r = offset.length(), theta = Math.atan2(offset.x, offset.z) + delta[0];
    const phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, Math.acos(offset.y / r) + delta[1]));
    offset.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta));
    camera.position.copy(controls.target).add(offset); controls.update(); onChange();
  }
  const oldTabIndex = canvas.getAttribute('tabindex');
  if (oldTabIndex === null) canvas.tabIndex = 0;
  const listeners = [['pointerdown', down], ['pointermove', move], ['pointerup', up], ['pointercancel', cancel], ['keydown', key]];
  // Capture movement before OrbitControls or app bubbling handlers consume it.
  for (const [name, fn] of listeners) canvas.addEventListener(name, fn, true);
  controls.addEventListener('change', onChange);
  return { controls, reset, heroPosition, heroTarget,
    dispose() {
      for (const [name, fn] of listeners) canvas.removeEventListener(name, fn, true);
      controls.removeEventListener('change', onChange); controls.dispose(); pointers.clear();
      if (oldTabIndex === null) canvas.removeAttribute('tabindex');
    },
  };
}
