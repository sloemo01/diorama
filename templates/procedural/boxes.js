/**
 * Yaw-only oriented boxes ({ center: [x, y, z], half: [hx, hy, hz], q: [0, sy, 0, cy] }),
 * the envelope every placed piece gets (clearance.js pieceBox). Pure; no THREE.
 */

/**
 * Do two piece boxes (yaw-only OBBs from pieceBox) come within `margin` of each
 * other? Separating-axis test on the two yaw frames plus the vertical extent.
 * Used at build time to keep dressing off placed pieces; the audit uses the kit's
 * checker.
 */
export function boxesTouch(a, b, margin = 0) {
  if (a.center[1] + a.half[1] + margin < b.center[1] - b.half[1] || b.center[1] + b.half[1] + margin < a.center[1] - a.half[1]) return false;
  const yaw = (q) => 2 * Math.atan2(q[1], q[3]);
  const axes = [yaw(a.q), yaw(a.q) + Math.PI / 2, yaw(b.q), yaw(b.q) + Math.PI / 2].map((t) => [Math.cos(t), -Math.sin(t)]);
  const extent = (box, ax) => {
    const t = yaw(box.q);
    const ux = [Math.cos(t), -Math.sin(t)], uz = [Math.sin(t), Math.cos(t)];
    return Math.abs(ax[0] * ux[0] + ax[1] * ux[1]) * box.half[0] + Math.abs(ax[0] * uz[0] + ax[1] * uz[1]) * box.half[2];
  };
  const d = [b.center[0] - a.center[0], b.center[2] - a.center[2]];
  return axes.every((ax) => Math.abs(d[0] * ax[0] + d[1] * ax[1]) <= extent(a, ax) + extent(b, ax) + margin);
}
