/**
 * 64-colour sRGB palette. The scene is quantised to these values after an
 * 8x8 ordered dither, which is what gives the miniature its printed, pixel-art
 * finish. Keep the length at exactly 64: the shader declares vec3[64].
 */
export const PALETTE_HEX = [
  // paper, plaster, limestone, deck stone
  '#ffffff', '#faf7ef', '#f3eddf', '#eae2d3', '#e1d7c5',
  '#d6cbb8', '#c9bda9', '#baae9a', '#a89c88', '#908574',
  // concrete, shadow, steel darks
  '#8b9195', '#7b8287', '#6c7378', '#5e656a', '#51575c',
  '#444a4f', '#383e43', '#2c3237',
  // water and glazed tile ramps
  '#d8f2ef', '#bce9e4', '#9ddddb', '#80cecf', '#67bfc4',
  '#54aeb6', '#429da7', '#338b98', '#287888', '#206577',
  '#1a5366', '#164456', '#9d988c', '#1f5f6f', '#2d7f8c',
  '#4a9aa5',
  // skin
  '#f4d5b8', '#eac09d', '#dfab82', '#d0966b', '#b97d55',
  '#9c6440', '#71452e',
  // hair
  '#2c231e', '#463128', '#62452f', '#a87b4a', '#d8b878',
  // swimwear, inflatables, drink, accents
  '#ef6a52', '#d9503c', '#918c80', '#857f74', '#3aa39a',
  '#267e78', '#6d685f', '#6fa0c9', '#efe7d6', '#79746a',
  '#615d55', '#c7d3d8',
  // metals
  '#b9c5c9', '#9ba7ab', '#7f8b90', '#606b70', '#3b4449',
  '#20282c',
];

export const PALETTE_RGB = PALETTE_HEX.map((hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
});
