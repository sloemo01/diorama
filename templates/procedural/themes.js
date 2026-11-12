/**
 * Themes: the only place a procedural diorama is told what KIND of place it is.
 *
 * A theme is data, not code. It picks the water body, how hilly the slab is,
 * which building styles and scatter props are allowed and how often, which
 * landmark stands on the square, the ground and road tones, and what weather
 * the seed may roll. Add a theme by adding an entry; every generator reads only
 * these fields.
 */
export const THEMES = {
  village: {
    label: 'Village',
    slab: { hx: 12, hz: 8 },
    water: 'river',
    levels: 3,
    rise: 0.55,
    ground: ['grass1', 'grass2'],
    groundSide: 'earth2',
    road: 'earth0',
    roadEdge: 'earth1',
    plazaTone: 'stone0',
    landmark: 'windmill',
    styles: { cottage: 5, barn: 2, shed: 2, tower: 1 },
    landmarkStyle: 'barn',
    scatter: { tree: 0.5, pine: 0.15, bush: 0.25, rock: 0.08, flowers: 0.3, reed: 0.25, fence: 0.12 },
    density: 0.085,
    lots: [7, 10],
    visitors: [2, 3],
    weather: { clear: 4, rain: 2, petals: 1, leaves: 2 },
    hats: ['straw', 'cap', 'none', 'kerchief'],
    boats: 0,
  },
  harbour: {
    label: 'Harbour',
    slab: { hx: 12, hz: 8 },
    water: 'coast',
    levels: 3,
    rise: 0.65,
    ground: ['grass1', 'grass2'],
    groundSide: 'stone3',
    road: 'stone0',
    roadEdge: 'stone2',
    plazaTone: 'stone1',
    landmark: 'lighthouse',
    styles: { cottage: 3, boathouse: 3, warehouse: 2, shop: 2 },
    landmarkStyle: 'warehouse',
    scatter: { rock: 0.3, bush: 0.2, tree: 0.15, barrels: 0.25, nets: 0.15, reed: 0.05 },
    density: 0.06,
    lots: [7, 10],
    visitors: [2, 4],
    weather: { clear: 4, rain: 3 },
    hats: ['souwester', 'beanie', 'cap', 'none'],
    boats: 3,
  },
  market: {
    label: 'Market square',
    slab: { hx: 11, hz: 8 },
    water: 'pond',
    levels: 2,
    rise: 0.35,
    ground: ['grass2', 'grass1'],
    groundSide: 'stone3',
    road: 'stone1',
    roadEdge: 'stone2',
    plazaTone: 'stone0',
    landmark: 'fountain',
    styles: { stall: 5, shop: 3, cottage: 1, tower: 1 },
    landmarkStyle: 'shop',
    scatter: { tree: 0.35, bush: 0.25, flowers: 0.35, barrels: 0.2, rock: 0.05, reed: 0.2 },
    density: 0.07,
    lots: [8, 11],
    visitors: [3, 4],
    weather: { clear: 4, petals: 3, rain: 1 },
    hats: ['none', 'kerchief', 'cap', 'straw'],
    boats: 0,
  },
  camp: {
    label: 'Forest camp',
    slab: { hx: 11, hz: 8 },
    water: 'lake',
    levels: 3,
    rise: 0.6,
    ground: ['grass3', 'grass2'],
    groundSide: 'earth3',
    road: 'earth1',
    roadEdge: 'earth2',
    plazaTone: 'earth0',
    landmark: 'campfire',
    styles: { tent: 5, cabin: 3, shed: 1 },
    landmarkStyle: 'cabin',
    scatter: { pine: 0.6, tree: 0.15, rock: 0.2, bush: 0.2, logs: 0.15, reed: 0.25 },
    density: 0.11,
    lots: [6, 9],
    visitors: [1, 2],
    weather: { clear: 3, snow: 3, fireflies: 2 },
    hats: ['beanie', 'hood', 'none', 'cap'],
    boats: 1,
  },
};

export const THEME_NAMES = Object.keys(THEMES);

/** Size tiers: footprint in grid cells (local width x depth), building style budget. */
export const TIERS = [
  { w: 3, d: 3, storeys: [1, 1] },
  { w: 4, d: 4, storeys: [1, 2] },
  { w: 5, d: 4, storeys: [1, 2] },
  { w: 6, d: 5, storeys: [2, 3] },
];

/** Styles that keep their own footprint whatever the tier (a tent is a tent). */
export const STYLE_TIER_CAP = { stall: 1, tent: 1, shed: 1 };
