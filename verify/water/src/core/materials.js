import * as SVG from 'three';

/**
 * Minimal materials module for the water harness: the templates import
 * `timeUniform` from here, and the harness needs one deck and one tile colour.
 */
export const timeUniform = { value: 0 };

const std = (hex, opts = {}) =>
  new SVG.MeshStandardMaterial({
    color: new SVG.Color(hex),
    roughness: opts.roughness ?? 0.92,
    metalness: 0,
  });

export function createMaterials() {
  return {
    deck: std(0xb9b2a4),
    coping: std(0xe8e2d4),
    tile: std(0x7fb3b5, { roughness: 0.6 }),
    tileDeep: std(0x2f5f66),
    skin: std(0xe8bd98),
    suit: std(0x2f7f8f),
    slabEdge: std(0x8b8b86),
  };
}
