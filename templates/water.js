import * as THREE from 'three';
import { POOL } from '../config.js';
import { timeUniform } from '../core/materials.js';

/**
 * Flat, glassy water. A standard physical material keeps shadows, environment
 * reflection and tone mapping consistent with the rest of the diorama, which a
 * hand-written shader would otherwise have to reimplement per light.
 */
export function createWater() {
  const geo = new THREE.PlaneGeometry(12.94, 6.94, 10, 6);
  geo.rotateX(-Math.PI / 2);

  // Shallow end reads pale teal, the deep end nearly navy. Interpolated in
  // vertex colours so the surface itself carries the pool's depth.
  const pos = geo.attributes.position;
  const shallow = new THREE.Color(0x3f9397);
  const deep = new THREE.Color(0x2a707a);
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.getX(i) + 6.3) / 11.6));
    c.copy(shallow).lerp(deep, t * t * 0.85);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.16,
    metalness: 0.0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.4,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = POOL.waterY;
  mesh.renderOrder = 5;
  mesh.receiveShadow = true;
  mesh.userData.uniforms = { uTime: timeUniform };
  return mesh;
}
