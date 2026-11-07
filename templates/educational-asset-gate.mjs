/**
 * Recorded-evidence policy gate only: no network, legal, scientific, copyright,
 * trademark, privacy, publicity or other third-party-rights verification.
 * Schema (all fields required unless noted):
 * {sourceURL,downloadURL,title,creator,retrievedAt:'YYYY-MM-DD',
 *  license:{spdx,url,evidenceURL,reviewed:true,costUSD:0,commercial:true,
 *    modify:true,redistribute:true,embed:true,restrictions:[]},
 *  attribution:{text,licenseURL,changes:[string],retainedNotices:true},
 *  files:[{name,sha256:64hex,licenseReviewed:true}],
 *  dependencies:[], // recursive records with the same rights fields; no role/readiness needed
 *  accuracy:{referenceURL,identityMatches:true,dimensionsChecked:true,
 *    unitsAndScaleChecked:true,criticalGeometryChecked:true},
 *  structure:{partsMapped:true,pivotsValidated:true,interfacesValidated:true},
 *  import:{tested:true,finiteGeometry:true,complete:true,styleMatched:true},
 *  role:'teaching'|'exterior'|'context',
 *  distribution:{dependenciesEmbedded:boolean}}
 * dependencies lists ALL transitive assets (nested records allowed); files lists
 * ALL delivered files. Completeness itself is recorded, not independently proved.
 * CC0 attribution.text may be empty; CC-BY text must be nonblank. changes:[] is
 * an explicit declaration of no modifications. Exact canonical license URLs only.
 * Exterior/context require identity, dimensions, units/scale and import checks,
 * not internal mechanics. Teaching additionally requires critical geometry and
 * every structure check. Online does not establish offline readiness.
 * Result: {status,rightsAllowed,ready,reasons:[{code,path,message}]}.
 * Missing/invalid evidence and non-allowlisted licenses hold for review; explicit
 * policy conflicts reject. Readiness failures hold without revoking rightsAllowed.
 */
const OFFICIAL = Object.freeze({
  'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
});
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const url = value => {
  if (!text(value) || value !== value.trim()) return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && !!parsed.hostname &&
      !parsed.username && !parsed.password;
  } catch { return false; }
};
const date = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export function evaluateEducationalAsset(record, { delivery = 'offline' } = {}) {
  const reasons = [];
  let rightsAllowed = true;
  let ready = true;
  let rejected = false;
  const issue = (code, path, message, { rights = true, reject = false } = {}) => {
    reasons.push({ code, path, message });
    if (rights) rightsAllowed = false;
    else ready = false;
    rejected ||= reject;
  };
  const requiredURL = (value, path, rights = true) => {
    if (!url(value)) issue('invalid-url', path, 'Require an HTTP(S) URL without credentials.', { rights });
  };
  const flag = (value, path, rights = true) => {
    if (value !== true) issue(value === false ? 'failed-check' : 'missing-check', path,
      'Recorded evidence must be exactly true.', { rights, reject: rights && value === false });
  };
  if (!['offline', 'online'].includes(delivery)) {
    issue('invalid-delivery', 'delivery', 'Choose offline or online.');
  }
  const active = new Set();
  function rights(asset, path) {
    if (!object(asset)) { issue('invalid-record', path, 'Require an asset record.'); return; }
    if (active.has(asset)) { issue('dependency-cycle', path, 'Dependency evidence must be acyclic.'); return; }
    active.add(asset);
    for (const key of ['sourceURL', 'downloadURL']) requiredURL(asset[key], `${path}.${key}`);
    for (const key of ['title', 'creator']) {
      if (!text(asset[key])) issue('missing-metadata', `${path}.${key}`, 'Require nonblank metadata.');
    }
    if (!date(asset.retrievedAt)) issue('invalid-date', `${path}.retrievedAt`, 'Require a real YYYY-MM-DD date.');
    const license = object(asset.license) ? asset.license : {};
    const canonical = Object.hasOwn(OFFICIAL, license.spdx) ? OFFICIAL[license.spdx] : undefined;
    if (!canonical) {
      const prohibited = typeof license.spdx === 'string' &&
        (/(?:^|-)NC(?:-|$)|(?:^|-)ND(?:-|$)/i.test(license.spdx) || /editorial/i.test(license.spdx));
      issue('license-not-allowlisted', `${path}.license.spdx`,
        'Only CC0-1.0 and CC-BY-4.0 auto-pass; SA and custom/unknown licenses require manual review, not a claim of illegality.',
        { reject: prohibited });
    }
    requiredURL(license.url, `${path}.license.url`);
    requiredURL(license.evidenceURL, `${path}.license.evidenceURL`);
    if (canonical && license.url !== canonical) issue('official-license-mismatch', `${path}.license.url`, 'Require the exact official canonical URL.');
    flag(license.reviewed, `${path}.license.reviewed`);
    if (license.costUSD !== 0) issue('nonzero-or-unknown-cost', `${path}.license.costUSD`, 'Require a recorded numeric zero cost.',
      { reject: typeof license.costUSD === 'number' && Number.isFinite(license.costUSD) && license.costUSD > 0 });
    for (const key of ['commercial', 'modify', 'redistribute']) flag(license[key], `${path}.license.${key}`);
    if (delivery === 'offline') flag(license.embed, `${path}.license.embed`);
    else if (typeof license.embed !== 'boolean') issue('missing-check', `${path}.license.embed`, 'Record embedding permission explicitly.');
    if (!Array.isArray(license.restrictions) || license.restrictions.length) issue('additional-terms', `${path}.license.restrictions`, 'Require an explicitly empty restrictions array.', { reject: Array.isArray(license.restrictions) && license.restrictions.length > 0 });
    const attribution = object(asset.attribution) ? asset.attribution : {};
    if (typeof attribution.text !== 'string' || (license.spdx === 'CC-BY-4.0' && !text(attribution.text))) issue('missing-attribution', `${path}.attribution.text`, 'CC-BY requires nonblank credit; CC0 still records a text field.');
    requiredURL(attribution.licenseURL, `${path}.attribution.licenseURL`);
    if (canonical && attribution.licenseURL !== canonical) issue('attribution-license-mismatch', `${path}.attribution.licenseURL`, 'Require the exact official canonical URL.');
    if (!Array.isArray(attribution.changes) || !Array.from(attribution.changes).every(text)) issue('missing-changes', `${path}.attribution.changes`, 'Declare changes as nonblank strings, or [] for none.');
    flag(attribution.retainedNotices, `${path}.attribution.retainedNotices`);
    if (!Array.isArray(asset.files) || !asset.files.length) issue('missing-files', `${path}.files`, 'List every delivered file.');
    else Array.from(asset.files).forEach((file, i) => {
      const base = `${path}.files[${i}]`;
      if (!object(file)) { issue('invalid-file', base, 'Require a file record.'); return; }
      if (!text(file.name)) issue('missing-file-name', `${base}.name`, 'Require a file name.');
      if (typeof file.sha256 !== 'string' || !/^[a-fA-F0-9]{64}$/.test(file.sha256)) issue('invalid-sha256', `${base}.sha256`, 'Require exactly 64 hexadecimal characters.');
      flag(file.licenseReviewed, `${base}.licenseReviewed`);
    });
    if (!Array.isArray(asset.dependencies)) issue('missing-dependencies', `${path}.dependencies`, 'Declare all dependencies, or [] for none.');
    else Array.from(asset.dependencies).forEach((dependency, i) => rights(dependency, `${path}.dependencies[${i}]`));
    const embedded = asset.distribution?.dependenciesEmbedded;
    if (delivery === 'offline') flag(embedded, `${path}.distribution.dependenciesEmbedded`);
    else if (typeof embedded !== 'boolean') issue('missing-check', `${path}.distribution.dependenciesEmbedded`, 'Record dependency embedding explicitly.');
    active.delete(asset);
  }
  rights(record, 'record');
  if (object(record)) {
    if (!['teaching', 'exterior', 'context'].includes(record.role)) issue('invalid-role', 'record.role', 'Choose teaching, exterior or context.', { rights: false });
    requiredURL(record.accuracy?.referenceURL, 'record.accuracy.referenceURL', false);
    for (const key of ['identityMatches', 'dimensionsChecked', 'unitsAndScaleChecked']) flag(record.accuracy?.[key], `record.accuracy.${key}`, false);
    if (record.role === 'teaching') {
      flag(record.accuracy?.criticalGeometryChecked, 'record.accuracy.criticalGeometryChecked', false);
      for (const key of ['partsMapped', 'pivotsValidated', 'interfacesValidated']) flag(record.structure?.[key], `record.structure.${key}`, false);
    }
    for (const key of ['tested', 'finiteGeometry', 'complete', 'styleMatched']) flag(record.import?.[key], `record.import.${key}`, false);
  } else ready = false;
  return { status: rejected ? 'rejected' : rightsAllowed && ready ? 'accepted' : 'needs-review', rightsAllowed, ready, reasons };
}
