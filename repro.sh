#!/usr/bin/env bash
# Reproduces: App Router metadata files are validated as route handlers by dev typegen
set -u
PORT=${PORT:-3000}
rm -rf .next tsconfig.tsbuildinfo

# 1. Dev typegen writes .next/dev/types/validator.ts
npx next dev -p "$PORT" > dev.log 2>&1 &
DEV_PID=$!
sleep 20
curl -s -o /dev/null "http://localhost:$PORT/"
curl -s -o /dev/null "http://localhost:$PORT/opengraph-image"
curl -s -o /dev/null "http://localhost:$PORT/icon"
curl -s -o /dev/null "http://localhost:$PORT/sitemap.xml"
sleep 4
kill "$DEV_PID" 2>/dev/null
wait "$DEV_PID" 2>/dev/null

echo "=== generated validations in .next/dev/types/validator.ts ==="
grep -n "^// Validate" .next/dev/types/validator.ts
grep -n "RouteHandlerConfig<" .next/dev/types/validator.ts

echo "=== tsc --noEmit ==="
npx tsc --noEmit
echo "tsc exit: $?"
