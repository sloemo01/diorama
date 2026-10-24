import * as THREE from 'three';
import { POOL } from '../config.js';

/**
 * Chunky pixel-friendly splash: a burst of white droplets, a foam disc and
 * three expanding rings on the water surface. Everything is unlit so it stays
 * bright after the palette snap.
 */
export function createSplash() {
  const group = new THREE.Group();
  const dropMat = new THREE.MeshBasicMaterial({ color: 0xf2fbf7 });
  const foamMat = () =>
    new THREE.MeshBasicMaterial({
      color: 0xdff6ee,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

  const drops = [];
  for (let i = 0; i < 64; i++) {
    const r = 0.024 + (i % 7) * 0.007;
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), dropMat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    drops.push({
      mesh,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      live: false,
      spin: new THREE.Vector3(),
    });
  }

  const rings = [];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.RingGeometry(0.30, 0.375, 30);
    geo.rotateX(-Math.PI / 2);
    const mat = foamMat();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = POOL.waterY + 0.008 + i * 0.0015;
    mesh.visible = false;
    mesh.renderOrder = 8;
    group.add(mesh);
    rings.push({ mesh, mat, age: 0, delay: i * 0.14, live: false });
  }

  const foamGeo = new THREE.CircleGeometry(0.62, 24);
  foamGeo.rotateX(-Math.PI / 2);
  const foam = new THREE.Mesh(foamGeo, foamMat());
  foam.position.y = POOL.waterY + 0.012;
  foam.renderOrder = 9;
  foam.visible = false;
  group.add(foam);

  let foamAge = 0;
  let foamLive = false;

  /**
   * Deterministic stand-in for Math.random. The whole play is a function of t,
   * so a burst must look identical every time it fires, and identical again when
   * the QA harness re-simulates the effects from zero to freeze a frame.
   */
  let seed = 1;
  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function trigger(x, z, power = 1, burstSeed = 1) {
    seed = burstSeed * 7919 || 1;
    drops.forEach((d, i) => {
      const a = rnd() * Math.PI * 2;
      const chunky = i % 5 === 0;
      const speed = (chunky ? 0.3 : 0.55 + rnd() * 1.65) * power;
      const up = (chunky ? 1.0 + rnd() * 0.7 : 1.7 + rnd() * 2.1) * power;
      d.pos.set(x + (rnd() - 0.5) * 0.22, POOL.waterY + 0.04, z + (rnd() - 0.5) * 0.22);
      d.vel.set(Math.cos(a) * speed, up, Math.sin(a) * speed);
      d.spin.set(rnd() * 6, rnd() * 6, rnd() * 6);
      d.live = true;
      d.mesh.visible = true;
      d.mesh.position.copy(d.pos);
    });
    for (const r of rings) {
      r.age = 0;
      r.live = true;
      r.mesh.visible = true;
      r.mesh.scale.setScalar(0.22);
      r.mat.opacity = 0.0;
    }
    foamAge = 0;
    foamLive = true;
    foam.visible = true;
    foam.position.set(x, POOL.waterY + 0.012, z);
    foam.scale.setScalar(0.35);
    foam.material.opacity = 0.40;
  }

  function update(dt) {
    for (const d of drops) {
      if (!d.live) continue;
      d.vel.y -= 9.6 * dt;
      d.pos.addScaledVector(d.vel, dt);
      d.mesh.position.copy(d.pos);
      d.mesh.rotation.x += d.spin.x * dt;
      d.mesh.rotation.y += d.spin.y * dt;
      if (d.pos.y < POOL.waterY - 0.02) {
        d.live = false;
        d.mesh.visible = false;
      }
    }

    for (const r of rings) {
      if (!r.live) continue;
      r.age += dt;
      const a = r.age - r.delay;
      if (a < 0) continue;
      const k = a / 1.5;
      if (k >= 1) {
        r.live = false;
        r.mesh.visible = false;
        continue;
      }
      r.mesh.scale.setScalar(0.3 + k * 3.4);
      r.mat.opacity = 0.75 * (1 - k) * (1 - k);
    }

    if (foamLive) {
      foamAge += dt;
      const k = foamAge / 0.9;
      if (k >= 1) {
        foamLive = false;
        foam.visible = false;
      } else {
        foam.scale.setScalar(0.35 + k * 1.3);
        foam.material.opacity = 0.40 * (1 - k) * (1 - k);
      }
    }
  }

  /** See wake.js reset(): effects that integrate dt must start clean on a jump. */
  function reset() {
    for (const d of drops) {
      d.live = false;
      d.mesh.visible = false;
    }
    for (const r of rings) {
      r.live = false;
      r.mesh.visible = false;
      r.mat.opacity = 0;
    }
    foamLive = false;
    foam.visible = false;
  }

  return { group, trigger, update, reset };
}
