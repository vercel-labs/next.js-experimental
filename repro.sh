#!/usr/bin/env bash
# Reproduction for https://github.com/vercel/next.js/issues/99766
# create-next-app omits the "Inside that directory..." next-steps block
# when scaffolding from a built-in template (no --example).
set -u

WORK="$(mktemp -d)"
cd "$WORK"
echo "workdir: $WORK"

echo
echo "=== CASE 1: built-in template (BUG: no next-steps block) ==="
npx --yes create-next-app@canary test-app \
  --ts --app --skip-install --disable-git \
  --no-eslint --no-tailwind --no-src-dir --import-alias "@/*" --yes \
  2>&1 | tee template.log

echo
echo "=== CASE 2: --example (control: next-steps block printed) ==="
npx --yes create-next-app@canary example-app \
  --example hello-world --skip-install --disable-git \
  2>&1 | tee example.log

echo
echo "=== ASSERTIONS ==="
test -f test-app/package.json \
  && echo "OK: template app DOES contain package.json"

if grep -q "Inside that directory" example.log; then
  echo "OK: --example run printed next-steps block"
else
  echo "UNEXPECTED: --example run did not print next-steps block"
fi

if grep -q "Inside that directory" template.log; then
  echo "NOT REPRODUCED: template run printed next-steps block"
  exit 1
else
  echo "REPRODUCED: template run omitted the next-steps block"
  exit 0
fi
