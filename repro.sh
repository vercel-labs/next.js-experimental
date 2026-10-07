#!/usr/bin/env bash
# Reproduces: `next upgrade --agent` fails to load next.config.ts with a relative import
# when invoked from outside the app directory, while `next build` of the same app succeeds.
set -u
cd "$(dirname "$0")"
npm install --no-audit --no-fund

echo "=== next build (cwd = apps/web) ==="
npm run build --workspace apps/web
echo "build exit=$?"

echo "=== next upgrade --agent (cwd = repo root, app dir as argument) ==="
NEXT_TELEMETRY_DISABLED=1 npx --yes next@canary upgrade apps/web --agent=latest
echo "upgrade exit=$?"
