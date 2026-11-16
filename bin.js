#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PLAYBOOK = [
  'SKILL.md',
  'references',
  'templates',
  'verify',
  'LICENSE',
  'README.md',
  // the two spec screenshots travel with the playbook; the showcase clips stay out
  'media/education-ui-right.png',
  'media/education-ui-desktop.png',
];

const HELP = `
diorama — install the Diorama playbook (three.js dioramas) into a folder.

usage:
  npx @sloemo/diorama [dir] [options]

options:
  --dir <path>     where to install (default: ./diorama, or the first argument)
  --force          write over an existing install
  --no-verify      skip verify/ (the worked examples and QA harness)
  --media          also fetch the showcase clips (20 MB, @sloemo/diorama-media)
  --list           print what would be copied, then exit
  -v, --version    package and playbook version
  -h, --help       this message

The folder is the playbook: SKILL.md is the source of truth, references/ holds the
on-demand topic files, templates/ the copy-in code, verify/ the worked examples.
Nothing is installed globally and nothing runs after the copy.
`.trim();

function fail(msg) {
  console.error(`diorama: ${msg}`);
  process.exit(1);
}

function skillVersion(root) {
  try {
    const head = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8').slice(0, 800);
    const m = head.match(/^version:\s*(\S+)/m);
    return m ? m[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

function walk(entry, base, out) {
  const abs = path.join(base, entry);
  const st = fs.statSync(abs);
  if (st.isDirectory()) {
    for (const child of fs.readdirSync(abs)) walk(path.join(entry, child), base, out);
  } else {
    out.push(entry);
  }
  return out;
}

async function fetchMedia(dest, specs) {
  const spec = `${specs.mediaPackage}@${specs.mediaVersion}`;
  const metaUrl = `https://registry.npmjs.org/${encodeURIComponent(specs.mediaPackage)}`;
  let meta;
  try {
    meta = await fetch(metaUrl).then((r) => r.json());
  } catch {
    fail(`could not reach the registry for ${specs.mediaPackage}. Retry, or skip --media.`);
  }
  const entry = meta.versions && meta.versions[specs.mediaVersion];
  if (!entry) fail(`${spec} is not on the registry. Skip --media, or bump mediaVersion.`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'diorama-media-'));
  const tgz = path.join(tmp, 'media.tgz');
  try {
    const res = await fetch(entry.dist.tarball);
    if (!res.ok) fail(`${spec}: registry returned ${res.status}. Retry, or skip --media.`);
    fs.writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
    try {
      execFileSync('tar', ['xzf', tgz, '-C', tmp], { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {
      fail('could not extract the media tarball (is `tar` on PATH?). Skip --media.');
    }
    const src = path.join(tmp, 'package', 'media');
    if (!fs.existsSync(src)) fail(`${spec} has no media/ folder`);
    fs.cpSync(src, path.join(dest, 'media'), { recursive: true });
    return fs.readdirSync(path.join(dest, 'media')).length;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const opts = { target: null, force: false, verify: true, list: false, version: false, media: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { console.log(HELP); return; }
    else if (a === '-v' || a === '--version') opts.version = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--no-verify') opts.verify = false;
    else if (a === '--media') opts.media = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--dir') { opts.target = argv[++i]; if (!opts.target) fail('--dir needs a path'); }
    else if (a.startsWith('-')) fail(`unknown option ${a} (try --help)`);
    else if (!opts.target) opts.target = a;
    else fail(`unexpected argument ${a}`);
  }

  const root = __dirname;
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  if (opts.version) {
    console.log(`${pkg.version} (playbook ${skillVersion(root)})`);
    return;
  }

  if (!opts.target) opts.target = 'diorama';
  const items = PLAYBOOK.filter((p) => opts.verify || p !== 'verify');
  for (const item of items) if (!fs.existsSync(path.join(root, item))) fail(`package is missing ${item}`);

  const files = items.flatMap((p) => walk(p, root, []));
  const version = skillVersion(root);

  if (opts.list) {
    console.log(`diorama playbook v${version} — ${files.length} files`);
    for (const f of files) console.log(`  ${f}`);
    return;
  }

  const dest = path.resolve(opts.target);
  if (fs.existsSync(dest)) {
    const existing = fs.readdirSync(dest).filter((n) => n !== '.DS_Store');
    if (existing.length && !opts.force) {
      fail(`${dest} is not empty. Pass --force to write over it, or pick another dir.`);
    }
  }

  fs.mkdirSync(dest, { recursive: true });
  for (const item of items) {
    fs.cpSync(path.join(root, item), path.join(dest, item), { recursive: true });
  }

  const mb = (files.reduce((n, f) => n + fs.statSync(path.join(root, f)).size, 0) / 1048576).toFixed(1);
  console.log(`diorama playbook v${version} -> ${dest}  (${files.length} files, ${mb} MB)`);

  if (opts.media) {
    const specs = pkg.diorama || {};
    if (!specs.mediaPackage) fail('this build has no media package configured');
    const n = await fetchMedia(dest, specs);
    console.log(`media: ${n} files from ${specs.mediaPackage}@${specs.mediaVersion}`);
  }

  console.log('');
  console.log('read SKILL.md first — it is the source of truth; references/INDEX.md routes the topics.');
  console.log('templates/ is copy-in code, verify/ is the worked examples and QA harness.');
  console.log(`start here: ${path.join(dest, 'SKILL.md')}`);
}

main().catch((err) => {
  console.error(`diorama: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
