/**
 * The clearance sweep behind the "N of N plans clear" claim: every theme, seeds 1..N
 * (default 25), plus 60 data specs (2 to 13 lots, 0 to 7 events, repeated actors and
 * targets, residents and visitors), each plan audited with the kit's own
 * action-clearance.mjs.
 *
 *   node sweep.mjs            # 4 themes x seeds 1..25, and the data specs
 *   node sweep.mjs 10         # seeds 1..10, and the data specs
 */
import * as THREE from 'three';
import { generate } from '../../templates/procedural/generate.js';
import { THEME_NAMES } from '../../templates/procedural/themes.js';
import { auditPlan } from '../../templates/procedural/clearance.js';
import { createActionClearance } from '../../templates/action-clearance.mjs';

const N = Number(process.argv[2] ?? 25);
const specs = THEME_NAMES.flatMap((theme) => Array.from({ length: N }, (_, n) => ({ theme, seed: n + 1 })));
const ids = 'abcdefghijklmn'.split('');
const VERBS = ['deliver', 'visit', 'browse'];
for (let i = 0; i < 60; i++) {
  const nl = 2 + (i % 12);
  const lots = ids.slice(0, nl).map((id, n) => ({ id, size: (n * 13 + i * 7) % 90, stock: (n * 5 + i) % 30 }));
  const events = Array.from({ length: i % 8 }, (_, n) => ({ actor: 'p' + (n % 3), home: n % 4 === 3 ? undefined : ids[n % nl], verb: VERBS[(n + i) % 3], target: ids[(n * 3 + 1) % nl] }));
  specs.push({ theme: THEME_NAMES[i % 4], seed: 100 + i, lots, events });
}
let plans = 0, failing = 0, actions = 0, empty = 0;
for (const spec of specs) {
  const { theme, seed } = spec;
  const plan = generate(spec);
  const r = auditPlan(plan, THREE, createActionClearance);
  plans++;
  actions += plan.actors.reduce((n, a) => n + a.actions.length, 0);
  if (!plan.actors.length) empty++;
  if (!r.clear || !r.coverageVerified) {
    failing++;
    const w = r.worstCases.reduce((m, x) => (!m || x.separation < m.separation ? x : m), null);
    console.log(`FAIL ${theme}:${seed}${spec.lots ? ' (data)' : ''}`, w ? `${w.a} x ${w.b} at t=${w.time.toFixed(2)} (${w.separation.toFixed(3)} m)` : 'coverage');
  }
}
console.log(`plans ${plans} (${THEME_NAMES.length * N} seeded, ${specs.length - THEME_NAMES.length * N} data)  failing ${failing}  actions ${actions}  empty casts ${empty}`);
process.exit(failing ? 1 : 0);
