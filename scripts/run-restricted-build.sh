#!/bin/bash
# Linux only. Needs unshare (util-linux) + python3, no root required.
set -u
cd "$(dirname "$0")/.."
rm -rf .next
echo "=== 1/2 Turbopack build in a sandbox that cannot bind a local port ==="
unshare -rn bash scripts/starve-ports.sh npx next build --turbopack
echo "turbopack exit=$?"
rm -rf .next
echo "=== 2/2 Same sandbox, webpack bundler (control) ==="
unshare -rn bash scripts/starve-ports.sh npx next build --webpack
echo "webpack exit=$?"
