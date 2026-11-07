import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEducationalAsset as gate } from '../templates/educational-asset-gate.mjs';

function fixture(spdx = 'CC0-1.0') {
  const official = spdx === 'CC0-1.0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/4.0/';
  return {
    sourceURL: 'https://example.org/asset', downloadURL: 'http://example.org/model.glb',
    title: 'Recorded model', creator: 'Model creator', retrievedAt: '2026-10-31',
    license: { spdx, url: official, evidenceURL: 'https://example.org/license-evidence', reviewed: true, costUSD: 0, commercial: true, modify: true, redistribute: true, embed: true, restrictions: [] },
    attribution: { text: 'Recorded model — Model creator — CC BY 4.0', licenseURL: official, changes: [], retainedNotices: true },
    files: [{ name: 'model.glb', sha256: 'a'.repeat(64), licenseReviewed: true }], dependencies: [],
    accuracy: { referenceURL: 'https://example.org/reference', identityMatches: true, dimensionsChecked: true, unitsAndScaleChecked: true, criticalGeometryChecked: true },
    structure: { partsMapped: true, pivotsValidated: true, interfacesValidated: true },
    import: { tested: true, finiteGeometry: true, complete: true, styleMatched: true },
    role: 'teaching', distribution: { dependenciesEmbedded: true },
  };
}

for (const spdx of ['CC0-1.0', 'CC-BY-4.0']) test(`${spdx} positive recorded evidence`, () => {
  assert.deepEqual(gate(fixture(spdx)), { status: 'accepted', rightsAllowed: true, ready: true, reasons: [] });
});

const cases = [
  ['license official mismatch', r => r.license.url = 'https://example.org/license', 'needs-review'],
  ['attribution official mismatch', r => r.attribution.licenseURL += '?fake=true', 'needs-review'],
  ['NC incompatible with policy', r => r.license.spdx = 'CC-BY-NC-4.0', 'rejected'],
  ['ND incompatible with modification', r => r.license.spdx = 'CC-BY-ND-4.0', 'rejected'],
  ['SA manual review not inherently illegal', r => r.license.spdx = 'CC-BY-SA-4.0', 'needs-review'],
  ['unknown license', r => r.license.spdx = 'unknown', 'needs-review'],
  ['arbitrary custom approval string', r => r.license.spdx = 'custom-approved-commercial', 'needs-review'],
  ['free only label', r => r.license = { spdx: 'free' }, 'needs-review'],
  ['editorial restriction', r => r.license.spdx = 'Editorial-only', 'rejected'],
  ['unknown cost', r => delete r.license.costUSD, 'needs-review'],
  ['string zero not evidence', r => r.license.costUSD = '0', 'needs-review'],
  ['paid asset', r => r.license.costUSD = 1, 'rejected'],
  ['commercial false', r => r.license.commercial = false, 'rejected'],
  ['modify false', r => r.license.modify = false, 'rejected'],
  ['redistribute false', r => r.license.redistribute = false, 'rejected'],
  ['offline embed false', r => r.license.embed = false, 'rejected'],
  ['truthy reviewed not true', r => r.license.reviewed = 'true', 'needs-review'],
  ['unreviewed evidence', r => r.license.reviewed = false, 'rejected'],
  ['additional restrictive terms', r => r.license.restrictions = ['No commercial use'], 'rejected'],
  ['omitted restrictions', r => delete r.license.restrictions, 'needs-review'],
  ['missing attribution credit', r => r.attribution.text = ' ', 'needs-review'],
  ['changes undeclared', r => delete r.attribution.changes, 'needs-review'],
  ['invalid change element', r => r.attribution.changes = [false], 'needs-review'],
  ['notices lost', r => r.attribution.retainedNotices = false, 'rejected'],
  ['missing source', r => delete r.sourceURL, 'needs-review'],
  ['credentialed remote download', r => r.downloadURL = 'https://user:pass@example.org/model', 'needs-review'],
  ['credentialed source', r => r.sourceURL = 'http://user@example.org/', 'needs-review'],
  ['non HTTP URL', r => r.downloadURL = 'file:///tmp/model.glb', 'needs-review'],
  ['blank title', r => r.title = '', 'needs-review'],
  ['invalid calendar date', r => r.retrievedAt = '2026-02-30', 'needs-review'],
  ['missing hash', r => delete r.files[0].sha256, 'needs-review'],
  ['invalid hash character', r => r.files[0].sha256 = 'z'.repeat(64), 'needs-review'],
  ['partial second file review', r => r.files.push({ name: 'texture.png', sha256: 'b'.repeat(64), licenseReviewed: false }), 'rejected'],
  ['empty file inventory', r => r.files = [], 'needs-review'],
  ['missing dependency declaration', r => delete r.dependencies, 'needs-review'],
  ['external dependencies offline', r => r.distribution.dependenciesEmbedded = false, 'rejected'],
  ['transitive licensing failure', r => { const dep = fixture(); dep.license.modify = false; const middle = fixture(); middle.dependencies = [dep]; r.dependencies = [middle]; }, 'rejected'],
];
for (const [name, mutate, expected] of cases) test(name, () => {
  const record = fixture('CC-BY-4.0'); mutate(record);
  const result = gate(record);
  assert.equal(result.status, expected);
  assert.equal(result.rightsAllowed, false);
  assert.ok(result.reasons.length);
  assert.ok(result.reasons.every(reason => reason.code && reason.path && reason.message));
});

test('flattened scan retains rights but is not teaching ready', () => {
  const r = fixture(); r.structure = { partsMapped: false, pivotsValidated: false, interfacesValidated: false };
  const result = gate(r);
  assert.equal(result.rightsAllowed, true); assert.equal(result.ready, false); assert.equal(result.status, 'needs-review');
});
test('missing introspection cannot establish teaching structure', () => {
  const r = fixture(); delete r.structure;
  assert.equal(gate(r).rightsAllowed, true); assert.equal(gate(r).ready, false);
});
for (const role of ['exterior', 'context']) test(`${role} does not inherit mechanics`, () => {
  const r = fixture(); r.role = role; delete r.structure; delete r.accuracy.criticalGeometryChecked;
  assert.equal(gate(r).status, 'accepted');
  r.accuracy.dimensionsChecked = false;
  assert.equal(gate(r).ready, false);
});
for (const key of ['tested', 'finiteGeometry', 'complete', 'styleMatched']) test(`import ${key} required`, () => {
  const r = fixture(); r.import[key] = false;
  assert.equal(gate(r).status, 'needs-review'); assert.equal(gate(r).rightsAllowed, true);
});
test('online result does not imply offline license pass', () => {
  const r = fixture(); r.license.embed = false; r.distribution.dependenciesEmbedded = false;
  assert.equal(gate(r, { delivery: 'online' }).status, 'accepted');
  assert.equal(gate(r).status, 'rejected');
});
test('CC0 permits empty credit text and explicit no modifications', () => {
  const r = fixture(); r.attribution.text = ''; assert.equal(gate(r).status, 'accepted');
});
test('valid dependency records accepted without teaching readiness', () => {
  const r = fixture(); const dep = fixture('CC-BY-4.0'); delete dep.accuracy; delete dep.structure; delete dep.import; delete dep.role;
  r.dependencies = [dep]; assert.equal(gate(r).status, 'accepted');
});
test('cycles hold rather than recurse forever', () => {
  const r = fixture(); r.dependencies = [r]; assert.equal(gate(r).status, 'needs-review');
});
test('invalid delivery cannot silently approve', () => assert.equal(gate(fixture(), { delivery: 'remote' }).status, 'needs-review'));
test('invalid role cannot silently approve', () => { const r = fixture(); r.role = 'anything'; assert.equal(gate(r).status, 'needs-review'); });
test('malformed root fails closed', () => { for (const r of [null, undefined, [], 'free']) assert.equal(gate(r).rightsAllowed, false); });
for (const field of ['files', 'dependencies']) test(`sparse ${field} cannot hide omissions`, () => {
  const r = fixture(); r[field] = new Array(1); assert.equal(gate(r).rightsAllowed, false);
});
test('sparse changes cannot hide undeclared modifications', () => {
  const r = fixture(); r.attribution.changes = new Array(1); assert.equal(gate(r).rightsAllowed, false);
});
test('pure evaluation does not mutate evidence', () => {
  const r = fixture(); const before = structuredClone(r); gate(r); assert.deepEqual(r, before);
});
