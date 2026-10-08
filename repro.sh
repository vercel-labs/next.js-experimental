#!/usr/bin/env bash
# Reproduces: metadata files validated as route handlers during dev type generation.
set -u
npm install
# Dev-server typegen is what emits the faulty validation into .next/dev/types/validator.ts
npx next dev -p 3123 > dev.log 2>&1 &
DEV_PID=$!
for i in $(seq 1 60); do
  curl -sf -o /dev/null "http://localhost:3123/" && break
  sleep 1
done
curl -sf -o /dev/null "http://localhost:3123/opengraph-image"
kill $DEV_PID 2>/dev/null

echo "--- generated validation for the metadata file ---"
grep -A6 "opengraph-image" .next/dev/types/validator.ts

echo "--- tsc --noEmit ---"
npx tsc --noEmit
echo "tsc exit: $?  (expected 0, actual 2 with TS2559)"
