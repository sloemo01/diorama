import * as THREE from 'three';

// Pixel Art V2 terrain perimeter. Independently authored.
// Apply ONLY to a horizontal terrain mesh whose local coordinates are X/Z.
// Render at logical pixel resolution; enlargement happens after this discard.
// Use a terrain apron instead of an exposed rectangular slab for the V2 base.
export function applyGroundEdge(mesh, {
  halfSize = [12, 8], band = 0.16, irregularity = 0.055, seed = 3,
} = {}) {
  if (!mesh?.isMesh || mesh.isSkinnedMesh || mesh.isInstancedMesh || Array.isArray(mesh.material)) {
    throw new TypeError('Ground edge needs a non-instanced terrain mesh with one material');
  }
  if (!(halfSize.length === 2 && halfSize.every(v => Number.isFinite(v) && v > 0)) ||
      !Number.isFinite(band) || band <= 0 || band >= 0.5 ||
      !Number.isFinite(irregularity) || irregularity < 0 || irregularity >= band || !Number.isFinite(seed)) {
    throw new RangeError('Invalid terrain halfSize, edge band, irregularity or seed');
  }
  if (mesh.customDepthMaterial || mesh.customDistanceMaterial) {
    throw new Error('Merge existing custom shadow materials explicitly before applying ground edge');
  }
  const original = mesh.material;
  const uniforms = {
    v2GroundHalf: { value: new THREE.Vector2(...halfSize) },
    v2GroundBand: { value: band },
    v2GroundRough: { value: irregularity },
    v2GroundSeed: { value: seed },
  };
  const declarations = `
    varying vec2 v2GroundXZ;
    uniform vec2 v2GroundHalf;
    uniform float v2GroundBand, v2GroundRough, v2GroundSeed;
    float v2Hash(vec2 p) { return fract(sin(dot(p,vec2(91.73,237.19))) * 15731.743); }
    float v2Noise(vec2 p) {
      vec2 q=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(v2Hash(q),v2Hash(q+vec2(1,0)),f.x),
                 mix(v2Hash(q+vec2(0,1)),v2Hash(q+vec2(1,1)),f.x),f.y);
    }
    float v2GroundCoverage() {
      vec2 n=abs(v2GroundXZ/v2GroundHalf);
      // Rounded rectangular footprint. Low-frequency noise changes its contour,
      // while coverage is a binary per-pixel test rather than transparency.
      float radius=pow(pow(n.x,6.0)+pow(n.y,6.0),1.0/6.0);
      float wobble=(v2Noise(v2GroundXZ*.83+v2GroundSeed)-.5)*2.0*v2GroundRough;
      return 1.0-smoothstep(1.0-v2GroundBand,1.0,radius+wobble);
    }
  `;
  function patch(material, shadow) {
    const previous = material.onBeforeCompile;
    const key = material.customProgramCacheKey();
    material.onBeforeCompile = function(shader, renderer) {
      previous.call(this, shader, renderer);
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = 'varying vec2 v2GroundXZ;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nv2GroundXZ = position.xz;');
      shader.fragmentShader = declarations + shader.fragmentShader;
      // Shadow coverage uses terrain coordinates, never light-map pixel coordinates.
      // Thus the outline is coherent from every camera and shadow viewpoint.
      const threshold = shadow
        ? 'v2Hash(floor(v2GroundXZ*38.0)+v2GroundSeed)'
        : 'v2Hash(floor(gl_FragCoord.xy)+v2GroundSeed)';
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>\nif (v2GroundCoverage() <= ${threshold}) discard;`);
    };
    material.customProgramCacheKey = () => key + ':v2-terrain-perimeter:' + shadow;
    material.needsUpdate = true;
    return material;
  }
  const owned = patch(original.clone(), false);
  const depth = patch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), true);
  const distance = patch(new THREE.MeshDistanceMaterial(), true);
  mesh.material = owned;
  mesh.customDepthMaterial = depth;
  mesh.customDistanceMaterial = distance;
  return {
    uniforms,
    dispose() {
      if (mesh.material === owned) mesh.material = original;
      if (mesh.customDepthMaterial === depth) mesh.customDepthMaterial = undefined;
      if (mesh.customDistanceMaterial === distance) mesh.customDistanceMaterial = undefined;
      owned.dispose(); depth.dispose(); distance.dispose();
    },
  };
}
