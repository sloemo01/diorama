import * as THREE from 'three';
import { clamp, lerp, groundY } from '../config.js';

/**
 * Arc-length path through waypoints, sampled to a lookup table.
 *
 * Each waypoint is [x, z, weight]. `weight` scales the lane offset so a crowd
 * can walk the same route but queue up in the street and pass a doorway one at a
 * time, which is the difference between "four people filing in" and a scrum.
 *
 * Ground height comes from the scene's own `groundY(x, z)` and is then smoothed,
 * so steps read as a ramp instead of a teleport.
 */
export class Track {
  constructor(points, lane = 0) {
    const ctrl = points.map(([x, z, w = 1], i) => {
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      let dx = next[0] - prev[0];
      let dz = next[1] - prev[1];
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      return new THREE.Vector3(x + dz * lane * w, 0, z - dx * lane * w);
    });

    const curve = new THREE.CatmullRomCurve3(ctrl, false, 'catmullrom', 0.28);
    const N = 320;
    this.pts = [];
    let total = 0;
    for (let i = 0; i <= N; i++) {
      const p = curve.getPoint(i / N);
      if (i > 0) total += Math.hypot(p.x - this.pts[i - 1].x, p.z - this.pts[i - 1].z);
      this.pts.push(new THREE.Vector3(p.x, groundY(p.x, p.z), p.z));
      this.pts[i].dist = total;
    }
    // Three 1-2-1 passes: steps become a ramp.
    for (let pass = 0; pass < 3; pass++) {
      const ys = this.pts.map((p) => p.y);
      for (let i = 1; i < this.pts.length - 1; i++) {
        this.pts[i].y = (ys[i - 1] + ys[i] * 2 + ys[i + 1]) / 4;
      }
    }
    this.length = total;
  }

  /** Position and heading at arc length `d`. */
  at(d) {
    const dd = clamp(d, 0, this.length);
    let i = 1;
    while (i < this.pts.length - 1 && this.pts[i].dist < dd) i++;
    const a = this.pts[i - 1];
    const b = this.pts[i];
    const span = b.dist - a.dist || 1;
    const u = clamp((dd - a.dist) / span, 0, 1);
    const pos = new THREE.Vector3(lerp(a.x, b.x, u), lerp(a.y, b.y, u), lerp(a.z, b.z, u));
    const yaw = Math.atan2(b.x - a.x, b.z - a.z);
    return { pos, yaw };
  }
}
