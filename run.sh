#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
rm -rf .git
git init -q .
git add -A
git -c user.email=a@b -c user.name=r commit -qm init
npx --yes @next/codemod@16.4.0 cache-components-instant-false ./app
echo "--- files modified ---"
git --no-pager diff --stat
