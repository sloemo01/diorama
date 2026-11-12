/**
 * Named 64-colour palette for procedural dioramas.
 *
 * Same contract as templates/palette.js: exactly 64 sRGB entries, the post
 * shader declares vec3[64], and every part samples one of them by NAME. The
 * generators never write a hex literal; they write a tone name ('roof1',
 * 'grass2'), and the mesher looks it up here. A grep for '#' outside this file
 * is the palette audit.
 *
 * The set is wider than the pool palette because a generator has to cover any
 * theme: grass and earth for villages, water ramps for coasts, snow for winter,
 * and a night ramp so the day-night cycle snaps to deep blues instead of mud.
 */
export const C = {
  // paper
  paper: '#ffffff', paper2: '#f6f2e8', paper3: '#ebe4d4',
  // stone, light to dark
  stone0: '#d9d2c3', stone1: '#c2b9a7', stone2: '#a69d8c', stone3: '#877f71', stone4: '#666058',
  // grass and foliage
  grass0: '#c9d98f', grass1: '#a3c46a', grass2: '#7ea650', grass3: '#5c8a3e', grass4: '#40682f', grass5: '#2b4a24',
  // earth, paths and sand
  earth0: '#e3c89a', earth1: '#c9a774', earth2: '#a5814f', earth3: '#7a5a36',
  // wood
  wood0: '#d2a86e', wood1: '#b0844e', wood2: '#8c6339', wood3: '#664427', wood4: '#45301d',
  // terracotta roofs
  roof0: '#e07a5f', roof1: '#c4523b', roof2: '#8f3426',
  // slate roofs
  slate0: '#7f9aa6', slate1: '#5c7682', slate2: '#3e5560',
  // water, shallow to deep
  water0: '#cdeee9', water1: '#9ddcd5', water2: '#6cc3c0', water3: '#44a3a8', water4: '#2c7f8c', water5: '#1d5d6e',
  // skin
  skin0: '#f4d5b8', skin1: '#dfab82', skin2: '#b97d55', skin3: '#71452e',
  // hair
  hair0: '#2c231e', hair1: '#7a5130', hair2: '#d8b878',
  // cloth and livery accents
  amber: '#eab04a', mustard: '#c98f2a', red: '#cf4a3a', blue: '#4a7fb5', navy: '#2e4d7a', violet: '#7a5ea8',
  teal: '#2f9488', pink: '#e79aa6',
  // metals
  steel0: '#b9c5c9', steel1: '#7f8b90', steel2: '#4a5357',
  // ink and the night ramp
  ink: '#2a2a33', night0: '#1e2440', night1: '#2f3a63', night2: '#4b5a8c',
  // light
  lamp: '#ffe9a8', lampHot: '#ffc857', glow: '#fff6d6',
  // snow
  snow: '#f2f6fa', snowShade: '#cdd8e6',
  // autumn leaves
  leaf0: '#d9822b', leaf1: '#b05a24',
};

export const TONES = Object.keys(C);
export const PALETTE_HEX = Object.values(C);
if (PALETTE_HEX.length !== 64) throw new Error('palette must hold exactly 64 entries, has ' + PALETTE_HEX.length);

export const PALETTE_RGB = PALETTE_HEX.map((hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
});

/** Tone name -> hex. Throws on an unknown name, so a typo fails the build, not the look. */
export function tone(name) {
  const hex = C[name];
  if (!hex) throw new Error('unknown palette tone: ' + name);
  return hex;
}

/** Group (district) tones: roof + flag + cloth, one row per group index. */
export const GROUP_TONES = [
  { roof: 'roof1', flag: 'red', cloth: 'red' },
  { roof: 'slate1', flag: 'blue', cloth: 'blue' },
  { roof: 'wood2', flag: 'amber', cloth: 'mustard' },
  { roof: 'grass4', flag: 'teal', cloth: 'teal' },
  { roof: 'roof0', flag: 'pink', cloth: 'violet' },
  { roof: 'slate2', flag: 'navy', cloth: 'navy' },
];

/**
 * Tone families: ramps of one material, darkest last. A variation may move a
 * tone along its own ramp (a slightly darker roof, a paler wall) or, for cloth,
 * to any other accent, but never into another family: a roof stays a roof.
 */
export const FAMILIES = {
  paper: ['paper', 'paper2', 'paper3'],
  stone: ['stone0', 'stone1', 'stone2', 'stone3', 'stone4'],
  grass: ['grass0', 'grass1', 'grass2', 'grass3', 'grass4', 'grass5'],
  earth: ['earth0', 'earth1', 'earth2', 'earth3'],
  wood: ['wood0', 'wood1', 'wood2', 'wood3', 'wood4'],
  roof: ['roof0', 'roof1', 'roof2'],
  slate: ['slate0', 'slate1', 'slate2'],
  water: ['water0', 'water1', 'water2', 'water3', 'water4', 'water5'],
  cloth: ['amber', 'mustard', 'red', 'blue', 'navy', 'violet', 'teal', 'pink'],
  steel: ['steel0', 'steel1', 'steel2'],
  leaf: ['leaf0', 'leaf1'],
};
const FAMILY_OF = new Map(Object.entries(FAMILIES).flatMap(([f, list]) => list.map((t) => [t, f])));
export const familyOf = (name) => FAMILY_OF.get(name) ?? null;
/** Hex -> tone name, for scenes authored with hex colours from this palette. */
export const TONE_OF_HEX = new Map(Object.entries(C).map(([k, v]) => [v, k]));
