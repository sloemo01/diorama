/**
 * Scene constants. Every template that draws water or walks a track reads these.
 * Values are metres.
 */
export const POOL = {
  waterY: 0.06,
  hx: 6.5,
  hz: 3.5,
  bottomY: -1.4,
};

export const SCENE = {
  slab: { hx: 7.4, hz: 4.4, thick: 0.42 },
};

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
};

/** Deck height at a point. Flat here; a play with steps overrides it. */
export function groundY() {
  return 0;
}
