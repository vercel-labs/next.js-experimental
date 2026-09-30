#!/usr/bin/env bash
# Reproduces: metadata files validated as route handlers during dev type generation
set -u
npm install
# Start dev server so Next.js generates .next/dev/types/validator.ts
npx next dev -p 3111 > dev.log 2>&1 &
DEV_PID=$!
sleep 25
curl -s -o /dev/null http://localhost:3111/
sleep 5
kill $DEV_PID 2>/dev/null
echo "--- generated validator (metadata entries) ---"
grep -n "Validate\|RouteHandlerConfig<" .next/dev/types/validator.ts
echo "--- tsc ---"
npx tsc --noEmit
