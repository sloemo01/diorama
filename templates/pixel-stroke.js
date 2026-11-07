// Optional pixel+stroke hybrid. Project style confirmation required.
// Render toon + selective geometry outlines ONCE into a low-res target,
// then nearest upscale. Never stack PixelPost/Sobel/another edge pipeline.
import * as THREE from 'three';
import { createStrokedToon } from './stroked-toon.js';

export function createPixelStroke(renderer, { width = 320, height = 200, ...options } = {}) {
  const look = createStrokedToon(renderer, { ...options, dpr: 1, maxDpr: 1 });
  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    depthBuffer: true, stencilBuffer: false,
  });
  target.texture.generateMipmaps = false;
  // Linear target; final fullscreen material performs output colour conversion.
  const material = new THREE.MeshBasicMaterial({ map: target.texture, depthTest: false, depthWrite: false, transparent: true });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const screen = new THREE.Scene(); screen.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  function setSize(w, h) {
    if (![w, h].every(n => Number.isInteger(n) && n > 0)) throw new Error('pixel-stroke size must be positive integers');
    target.setSize(w, h);
  }
  setSize(width, height);
  return { ...look, preset: 'pixel-stroke', target, setSize,
    render(scene, viewCamera) {
      const previous = renderer.getRenderTarget();
      try {
        renderer.setRenderTarget(target); renderer.clear(); look.render(scene, viewCamera);
        renderer.setRenderTarget(previous); renderer.clear(); renderer.render(screen, camera);
      } finally { renderer.setRenderTarget(previous); }
    },
    dispose() { target.dispose(); material.dispose(); geometry.dispose(); look.dispose(); },
  };
}
