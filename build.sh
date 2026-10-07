#!/bin/bash
# Builds the same app directory twice: once with next@16.3.8 (the "old deployment"
# whose JS the browser keeps running) and once with next@16.4.0 (the "new deployment").
# Building in the same path keeps the Server Action IDs and build ID identical,
# which is what happens on a real redeploy of the same project.
set -e
cd "$(dirname "$0")/app"
export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=cGFkZGluZ3BhZGRpbmdwYWRkaW5ncGFkZGluZzEyMzQ1Ng==
STASH="$(cd .. && pwd)/stash"
for v in 16.3.8 16.4.0; do
  rm -rf node_modules .next
  npm i "next@$v" --silent --no-audit --no-fund
  npx next build --turbopack
  rm -rf "$STASH/$v"; mkdir -p "$STASH/$v"
  mv .next "$STASH/$v/.next"
  mv node_modules "$STASH/$v/node_modules"
done
echo ALLDONE
