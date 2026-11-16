#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PLAYBOOK = ['SKILL.md', 'references', 'templates', 'verify', 'LICENSE', 'README.md'];

const HELP = `
create-diorama — install the Diorama playbook (three.js dioramas) into a folder.

usage:
  npx create-diorama [dir] [options]

options:
  --dir <path>     where to install (default: ./diorama, or the first argument)
  --force          write over an existing install
  --no-verify      skip verify/ (the worked examples and QA harness)
  --list           print what would be copied, then exit
  -h, --help       this message

The folder is the playbook: SKILL.md is the source of truth, references/ holds the
on-demand topic files, templates/ the copy-in code, verify/ the worked examples.
Nothing is installed globally and nothing runs after the copy.
`.trim();

function fail(msg) {
  console.error(`create-diorama: ${msg}`);
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

function main() {
  const argv = process.argv.slice(2);
  const opts = { target: null, force: false, verify: true, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { console.log(HELP); return; }
    else if (a === '--force') opts.force = true;
    else if (a === '--no-verify') opts.verify = false;
    else if (a === '--list') opts.list = true;
    else if (a === '--dir') { opts.target = argv[++i]; if (!opts.target) fail('--dir needs a path'); }
    else if (a.startsWith('-')) fail(`unknown option ${a} (try --help)`);
    else if (!opts.target) opts.target = a;
    else fail(`unexpected argument ${a}`);
  }

  if (!opts.target) opts.target = 'diorama';

  const root = __dirname;
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
  console.log('');
  console.log('read SKILL.md first — it is the source of truth; references/INDEX.md routes the topics.');
  console.log('templates/ is copy-in code, verify/ is the worked examples and QA harness.');
  console.log(`start here: ${path.join(dest, 'SKILL.md')}`);
}

main();
