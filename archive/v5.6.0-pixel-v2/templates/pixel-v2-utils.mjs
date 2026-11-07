// Independent numerical helpers for Pixel Art V2; not a complete renderer.
export function pixelLayout(width, height, dpr = 1, logicalWidth = 360, logicalHeight = 280) {
  if (![width, height, dpr, logicalWidth, logicalHeight].every(v => Number.isFinite(v) && v > 0)) {
    throw new RangeError('Pixel layout dimensions must be finite and positive');
  }
  const physicalWidth = Math.max(1, Math.floor(width * dpr));
  const physicalHeight = Math.max(1, Math.floor(height * dpr));
  const shrink = Math.min(1, physicalWidth / logicalWidth, physicalHeight / logicalHeight);
  const bufferWidth = Math.max(1, Math.floor(logicalWidth * shrink));
  const bufferHeight = Math.max(1, Math.floor(logicalHeight * shrink));
  const scale = Math.max(1, Math.floor(Math.min(physicalWidth / bufferWidth, physicalHeight / bufferHeight)));
  return { bufferWidth, bufferHeight, deviceScale: scale,
    cssWidth: bufferWidth * scale / dpr, cssHeight: bufferHeight * scale / dpr };
}

// Recursive ordered threshold construction: a stable four-by-four logical grid.
export function orderedThreshold(x, y) {
  const cell = (a, b) => ((a ^ b) * 2 + b);
  const ix = Math.floor(x) & 3, iy = Math.floor(y) & 3;
  return (4 * cell(ix & 1, iy & 1) + cell(ix >> 1, iy >> 1) + 0.5) / 16;
}

export function shadeBand(light, x, y, role = 'scenery', levels = 5, strength = 0.45) {
  if (!Number.isInteger(levels) || levels < 2) throw new RangeError('At least two shade bands required');
  const value = Math.min(1, Math.max(0, light)) * (levels - 1);
  const texture = role === 'cast' ? 0 : (orderedThreshold(x, y) - 0.5) * strength;
  return Math.min(levels - 1, Math.max(0, Math.floor(value + 0.5 + texture)));
}
