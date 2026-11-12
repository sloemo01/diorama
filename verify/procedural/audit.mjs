/**
 * Occupied-space audit of generated plans (templates/procedural/clearance.js on the
 * kit's templates/action-clearance.mjs). Prints the worst pairs; exit 1 on any.
 *
 *   node audit.mjs                       # the gate set: seeds 1-3 of every theme + the studio example
 *   node audit.mjs harbour:7 camp:12     # any theme:seed
 *   node audit.mjs my-town.json          # a spec file (seed, theme, lots, events)
 */
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { createActionClearance } from '../../templates/action-clearance.mjs';
import { generate } from '../../templates/procedural/generate.js';
import { THEME_NAMES } from '../../templates/procedural/themes.js';
import { auditPlan } from '../../templates/procedural/clearance.js';

const args = process.argv.slice(2);
const cases = args.length ? args : [...THEME_NAMES.flatMap((t) => [1, 2, 3].map((s) => `${t}:${s}`)), 'example:studio'];
let failed = 0;
for (const cs of cases) {
  const [theme, seed] = cs.split(':');
  const spec = cs.endsWith('.json') ? JSON.parse(readFileSync(cs, 'utf8'))
    : theme === 'example' ? JSON.parse(readFileSync(new URL(`./examples/${seed}.json`, import.meta.url), 'utf8')) : { theme, seed };
  const plan = generate(spec);
  const r = auditPlan(plan, THREE, createActionClearance);
  const worst = new Map();
  for (const s of r.samples) for (const c of s.collisions) {
    const k = [c.a, c.b].sort().join(' x ');
    const d = c.penetration ?? -c.separation;
    if (!worst.has(k) || worst.get(k).d < d) worst.set(k, { d, t: s.time });
  }
  const ok = r.clear && r.coverageVerified;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${cs} samples=${r.samples.length} nearPairs=${r.samples[0]?.testedPairs ?? 0} coverage=${r.coverageVerified} speed=${plan.speed} leftOut=${plan.leftOut.length}`);
  plan.leftOut.forEach((d) => console.log(`       left out: ${d.lot ?? `${d.actor} ${d.verb}${d.target ? ' ' + d.target : ''}`}: ${d.why}`));
  [...worst.entries()].sort((a, b) => b[1].d - a[1].d).slice(0, 5).forEach(([k, v]) => console.log(`       ${k} depth ${v.d.toFixed(3)} m at t=${v.t.toFixed(2)}`));
}
process.exit(failed ? 1 : 0);
