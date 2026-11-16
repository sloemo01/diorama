#!/usr/bin/env bash
# Publish the playbook to npm.
#   @sloemo/diorama
# Requires an npm token with publish rights; run from the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "${NPM_TOKEN:-}" ]; then
  cfg=$(mktemp)
  printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$cfg"
  chmod 600 "$cfg"
  export npm_config_userconfig="$cfg"
  trap 'rm -f "$cfg"' EXIT
fi

version=$(node -p "require('./package.json').version")
cp package.json package.json.bak
trap 'mv -f package.json.bak package.json; rm -f "${cfg:-/nonexistent}"' EXIT

node -e "
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));
p.name='@sloemo/diorama';p.bin={diorama:'bin.js'};
fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
"
npm publish --access public

echo "published $version as @sloemo/diorama"
