import * as THREE from 'three';
import { POOL } from '../config.js';

/**
 * Surface wake: a soft foam streak trailing each swimmer plus pooled ripple
 * rings. Unlit and additive so it stays bright after the palette pass.
 */
function makeWakeTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 128);

  const head = ctx.createRadialGradient(214, 64, 3, 214, 64, 48);
  head.addColorStop(0, 'rgba(244, 253, 249, 0.9)');
  head.addColorStop(0.55, 'rgba(232, 250, 244, 0.35)');
  head.addColorStop(1, 'rgba(232, 250, 244, 0)');
  ctx.fillStyle = head;
  ctx.fillRect(150, 8, 106, 112);

  for (const sign of [-1, 1]) {
    const g = ctx.createLinearGradient(222, 64, 6, 64 + sign * 40);
    g.addColorStop(0, 'rgba(238, 252, 247, 0.5)');
    g.addColorStop(0.6, 'rgba(238, 252, 247, 0.16)');
    g.addColorStop(1, 'rgba(238, 252, 247, 0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(214, 64);
    ctx.quadraticCurveTo(120, 64 + sign * 22, 6, 64 + sign * 42);
    ctx.stroke();
  }

  for (let i = 0; i < 26; i++) {
    const x = 40 + Math.random() * 190;
    const y = 64 + (Math.random() - 0.5) * 70;
    const r = 1 + Math.random() * 3;
    ctx.fillStyle = `rgba(245, 253, 250, ${0.12 + Math.random() * 0.28})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWake(count = 2) {
  const group = new THREE.Group();
  const tex = makeWakeTexture();

  const trails = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const geo = new THREE.PlaneGeometry(2.5, 1.25);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = POOL.waterY + 0.008;
    mesh.renderOrder = 7;
    mesh.visible = false;
    group.add(mesh);
    trails.push({ mesh, mat, phase: i * 1.7 });
  }

  const rings = [];
  const ringGeo = new THREE.RingGeometry(0.3, 0.36, 26);
  ringGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < 12; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xe9f9f3,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.position.y = POOL.waterY + 0.0105;
    mesh.renderOrder = 8;
    mesh.visible = false;
    group.add(mesh);
    rings.push({ mesh, mat, age: 0, live: false });
  }
  let ringCursor = 0;
  let spawnClock = 0;

  /**
   * entries: [{ x, z, yaw, active }] — body centre, heading, on/off.
   */
  function update(dt, t, entries) {
    spawnClock += dt;
    const spawn = spawnClock > 0.42;
    if (spawn) spawnClock = 0;

    entries.forEach((e, i) => {
      const trail = trails[i];
      if (!trail) return;
      trail.mesh.visible = !!e.active;
      if (!e.active) return;
      const hx = Math.cos(e.yaw);
      const hz = -Math.sin(e.yaw);
      trail.mesh.position.set(e.x - hx * 0.95, POOL.waterY + 0.008, e.z - hz * 0.95);
      trail.mesh.rotation.y = e.yaw;
      const pulse = 0.30 + Math.sin(t * 3.1 + trail.phase) * 0.05;
      trail.mat.opacity = pulse;
      trail.mesh.scale.set(1 + Math.sin(t * 2.2 + trail.phase) * 0.05, 1, 1);

      if (spawn) {
        const ring = rings[ringCursor % rings.length];
        ringCursor++;
        ring.age = 0;
        ring.live = true;
        ring.mesh.visible = true;
        ring.mesh.position.set(e.x - hx * 1.1, POOL.waterY + 0.0105, e.z - hz * 1.1);
        ring.mesh.scale.setScalar(0.35);
        ring.mat.opacity = 0.45;
      }
    });

    for (const r of rings) {
      if (!r.live) continue;
      r.age += dt;
      const k = r.age / 1.5;
      if (k >= 1) {
        r.live = false;
        r.mesh.visible = false;
        continue;
      }
      r.mesh.scale.setScalar(0.3 + k * 1.15);
      r.mat.opacity = 0.38 * (1 - k) * (1 - k);
    }
  }

  /**
   * Drop every trail and ring. Call this before re-simulating the effects from
   * zero, which is how a frozen frame (?t=) stays identical to the played one:
   * these effects integrate dt, so a jump in the clock is not a jump in state.
   */
  function reset() {
    ringCursor = 0;
    spawnClock = 0;
    for (const t of trails) {
      t.mesh.visible = false;
      t.mat.opacity = 0;
    }
    for (const r of rings) {
      r.age = 0;
      r.live = false;
      r.mesh.visible = false;
      r.mat.opacity = 0;
    }
  }

  return { group, update, reset };
}
