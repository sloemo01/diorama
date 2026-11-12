/**
 * Variation: seeded, bounded edits to a hand-made diorama.
 *
 * A normal diorama is authored: someone placed the bakery, the well and the
 * trees on purpose. Variation keeps that composition and lets a seed nudge what
 * the author marked as free to change: a tree turns and swaps species, a crate
 * stack shifts a hand's width, a roof moves one step along its tone ramp, an
 * optional flower box comes or goes. No model, no prompt, no LLM: one seed in,
 * one variant out, the same variant every time, and seed `null` (or strength 0)
 * is the original, exactly.
 *
 *   import { vary, makeVariable } from './procedural/vary.js';
 *
 *   tree.userData.vary   = vary.tree;           // presets below, or your own rule
 *   bakery.userData.vary = { tint: 1 };         // colour only: it stays where it is
 *   const v = makeVariable(sceneRoot);          // capture the original once
 *   v.apply({ seed: 42, strength: 0.8 });       // a variant
 *   v.apply({ seed: null });                    // the original again
 *
 * Pure of THREE: it only moves, scales, hides and recolours objects you hand it.
 * `partsGroup` in mesher.js builds variable pieces from grammar parts.
 *
 * A rule (all optional, all bounds, scaled by strength):
 *   move   metres an object may slide in x/z         turn   radians of yaw
 *   scale  fraction of size (0.15 = +/- 15%)          tint   steps along its tone ramp, or 'any'
 *   keep   probability an optional detail stays       pick   children are alternatives: show one
 *   lock   never vary (also for its descendants)
 *
 * The big picture is protected three ways: untagged objects never change; every
 * change is bounded by its rule; and `keepOut` zones (doors, paths, thresholds)
 * push a moved object back toward where the author put it.
 *
 * Variations always start from the captured original: applying seed 7 then seed
 * 8 gives the same picture as applying seed 8 alone. Nothing accumulates.
 */
import { rng as makeRng, clamp } from './rng.js';
import { C, FAMILIES, familyOf, TONE_OF_HEX } from './palette.js';

export const KINDS = ['place', 'shape', 'colour', 'detail'];

/** Ready-made rules for the usual suspects. */
export const vary = {
  tree: { move: 0.35, turn: Math.PI, scale: 0.18, tint: 1, pick: true },
  bush: { move: 0.25, turn: Math.PI, scale: 0.2, tint: 1 },
  flowers: { move: 0.2, turn: Math.PI, tint: 'any', keep: 0.6 },
  rock: { move: 0.2, turn: Math.PI, scale: 0.25, tint: 1 },
  crate: { move: 0.12, turn: 0.45, keep: 0.75, tint: 1 },
  barrel: { move: 0.12, turn: Math.PI, keep: 0.75 },
  building: { tint: 1 },
  awning: { tint: 'any' },
  figure: { move: 0.15, turn: 0.8 },
  detail: { keep: 0.55 },
  locked: { lock: true },
};

/* ---- the pure part: what a rule does for a seed --------------------------------------------- */

/** Move a tone along its family ramp by up to `steps`, or anywhere in it for 'any'. */
export function shiftTone(name, r, steps, strength = 1) {
  const fam = familyOf(name);
  if (!fam || !steps || !r.chance(clamp(strength, 0, 1) * 0.85)) return name;
  const list = FAMILIES[fam];
  if (steps === 'any') return r.pick(list);
  const i = list.indexOf(name);
  const d = r.int(-steps, steps);
  return list[clamp(i + d, 0, list.length - 1)];
}

/**
 * The variation of one object as plain numbers. Pure: same (rule, seed, id) in,
 * same result out. `alternatives` is the number of children when rule.pick is set.
 */
export function variationFor(rule, seed, id, opts = {}) {
  const s = clamp(opts.strength ?? 1, 0, 1);
  const kinds = new Set(opts.kinds ?? KINDS);
  const out = { dx: 0, dz: 0, dyaw: 0, scale: 1, pick: 0, keep: true, tintSeed: null };
  if (seed === null || seed === undefined || s === 0 || rule.lock) return out;
  const r = makeRng(seed, 'vary:' + id);
  // Draw every number whatever the toggles, so switching one kind off never changes another.
  const a = r.float(0, Math.PI * 2), rad = Math.sqrt(r.next());
  const turn = r.float(-1, 1), sc = r.float(-1, 1), keepRoll = r.next(), pickRoll = r.next();
  const tint = r.next();
  if (kinds.has('place')) {
    const m = (rule.move ?? 0) * s * rad;
    out.dx = Math.cos(a) * m;
    out.dz = Math.sin(a) * m;
    out.dyaw = (rule.turn ?? 0) * s * turn;
    out.scale = 1 + (rule.scale ?? 0) * s * sc;
  }
  if (kinds.has('detail') && rule.keep !== undefined) out.keep = keepRoll < 1 - (1 - rule.keep) * s;
  if (kinds.has('shape') && rule.pick && opts.alternatives > 1 && pickRoll < 0.35 + 0.65 * s) {
    out.pick = Math.floor(pickRoll * 7919) % opts.alternatives;
  }
  if (kinds.has('colour') && rule.tint) out.tintSeed = `${seed}:${id}:${Math.floor(tint * 1e9)}`;
  return out;
}

/** Recolour a part list (grammar output) the way a tint rule would. */
export function tintParts(list, tintSeed, steps, strength = 1) {
  if (!tintSeed) return list;
  const r = makeRng(tintSeed, 'tint');
  const map = new Map();
  return list.map((p) => {
    if (!map.has(p.c)) map.set(p.c, shiftTone(p.c, r, steps, strength));
    return { ...p, c: map.get(p.c) };
  });
}

/* ---- the THREE part ------------------------------------------------------------------------- */

const toneOf = (color) => TONE_OF_HEX.get('#' + color.getHexString());

function idOf(obj, root) {
  if (obj.userData.varyId) return obj.userData.varyId;
  const path = [];
  for (let o = obj; o && o !== root; o = o.parent) path.push(o.name || String(o.parent ? o.parent.children.indexOf(o) : 0));
  return path.reverse().join('/');
}

/**
 * Capture the original of every tagged object under `root` and return a handle.
 * Tag with `obj.userData.vary = rule`, or pass `rules` as { name: rule }.
 */
export function makeVariable(root, opts = {}) {
  const rules = opts.rules ?? {};
  const tagged = [];
  root.traverse((o) => {
    const rule = o.userData.vary ?? rules[o.name];
    if (!rule) return;
    for (let p = o.parent; p; p = p.parent) if ((p.userData.vary ?? rules[p.name])?.lock) return;
    const meshes = [];
    // A locked descendant keeps its colours too: its subtree is not collected for tinting.
    const collect = (m) => {
      if (m !== o && (m.userData.vary ?? rules[m.name])?.lock) return;
      if (m.isMesh && m.material && !Array.isArray(m.material) && m.material.color) meshes.push({ mesh: m, material: m.material });
      m.children.forEach(collect);
    };
    collect(o);
    tagged.push({
      obj: o, rule, id: idOf(o, root),
      base: { pos: o.position.clone(), yaw: o.rotation.y, scale: o.scale.clone(), visible: o.visible, childVisible: o.children.map((c) => c.visible) },
      meshes,
    });
  });
  const tinted = new Map(); // base material uuid + tone -> material

  function tintedMaterial(base, toneName) {
    const key = base.uuid + '|' + toneName;
    if (!tinted.has(key)) {
      const m = base.clone();
      m.color.set(C[toneName]);
      tinted.set(key, m);
    }
    return tinted.get(key);
  }

  function reset() {
    for (const t of tagged) {
      const { obj, base } = t;
      obj.position.copy(base.pos);
      obj.rotation.y = base.yaw;
      obj.scale.copy(base.scale);
      obj.visible = base.visible;
      obj.children.forEach((c, i) => { if (i < base.childVisible.length) c.visible = base.childVisible[i]; });
      t.meshes.forEach(({ mesh, material }) => { mesh.material = material; });
    }
  }

  /**
   * apply({ seed, strength = 1, kinds = KINDS, keepOut = [{x, z, r}], groundAt })
   * Returns a report: one row per changed object, and the largest slide in metres.
   */
  function apply(o = {}) {
    reset();
    const report = { changed: [], maxMove: 0 };
    if (o.seed === null || o.seed === undefined) return report;
    const keepOut = o.keepOut ?? [];
    for (const t of tagged) {
      const { obj, rule, base } = t;
      const v = variationFor(rule, o.seed, t.id, { strength: o.strength, kinds: o.kinds, alternatives: rule.pick ? obj.children.length : 0 });
      // Slide, then pull back toward the original until clear of every keep-out zone.
      let dx = v.dx, dz = v.dz;
      for (let k = 0; k < 6; k++) {
        const x = base.pos.x + dx, z = base.pos.z + dz;
        if (!keepOut.some((zn) => Math.hypot(x - zn.x, z - zn.z) < zn.r)) break;
        dx *= 0.5; dz *= 0.5;
        if (k === 5) { dx = 0; dz = 0; }
      }
      obj.position.x = base.pos.x + dx;
      obj.position.z = base.pos.z + dz;
      if (o.groundAt && (dx || dz)) obj.position.y = o.groundAt(obj.position.x, obj.position.z) + (base.pos.y - o.groundAt(base.pos.x, base.pos.z));
      obj.rotation.y = base.yaw + v.dyaw;
      obj.scale.copy(base.scale).multiplyScalar(v.scale);
      if (!v.keep) obj.visible = false;
      if (rule.pick && obj.children.length > 1) obj.children.forEach((c, i) => { c.visible = i === v.pick; });
      let tints = 0;
      if (v.tintSeed) {
        const r = makeRng(v.tintSeed, 'tint');
        const map = new Map();
        for (const m of t.meshes) {
          const name = toneOf(m.material.color);
          if (!name) continue;
          if (!map.has(name)) map.set(name, shiftTone(name, r, rule.tint, o.strength ?? 1));
          const next = map.get(name);
          if (next !== name) { m.mesh.material = tintedMaterial(m.material, next); tints++; }
        }
      }
      const moved = Math.hypot(dx, dz);
      report.maxMove = Math.max(report.maxMove, moved);
      if (moved > 1e-4 || Math.abs(v.dyaw) > 1e-4 || v.scale !== 1 || !v.keep || v.pick || tints) {
        report.changed.push({ id: t.id, moved: +moved.toFixed(3), turned: +v.dyaw.toFixed(3), scale: +v.scale.toFixed(3), hidden: !v.keep, pick: v.pick, tints });
      }
    }
    return report;
  }

  function dispose() {
    reset();
    tinted.forEach((m) => m.dispose());
    tinted.clear();
  }

  return { apply, reset, dispose, tagged: tagged.map((t) => ({ id: t.id, rule: t.rule })) };
}
