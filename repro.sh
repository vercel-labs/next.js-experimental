#!/usr/bin/env sh
# Reproduces: Turbopack production build fails with an internal error during CSS
# (PostCSS) processing when the loopback interface / local port binding is denied.
# Requires Linux with unrestricted user namespaces (unshare -rn).
set -e
npm install
echo "=== 1. turbopack build, normal environment (expected: PASS) ==="
rm -rf .next; npx next build && echo "RESULT 1: PASS"
echo "=== 2. turbopack build, loopback denied (expected: TurbopackInternalError) ==="
rm -rf .next; unshare -rn npx next build && echo "RESULT 2: PASS" || echo "RESULT 2: FAIL (bug)"
echo "=== 3. webpack build, loopback denied (expected: PASS) ==="
rm -rf .next; unshare -rn npx next build --webpack && echo "RESULT 3: PASS"
