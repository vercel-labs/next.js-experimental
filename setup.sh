#!/usr/bin/env bash
# Full reproduction: run from this directory on a clean checkout (no .next present).
set -x
rm -rf .next node_modules package-lock.json

# 1. old canary with unstable-prefixed cache stage APIs
npm pkg set dependencies.next=16.4.0-canary.20
sed -i "s/^  navigation,$/  unstable_navigation as navigation,/; s/^  prefetch,$/  unstable_prefetch as prefetch,/" app/page.tsx
npm install
npx next build            # writes legacy .next/types/cache-life.d.ts

# 2. upgrade + stabilized imports
npm pkg set dependencies.next=16.4.0
sed -i "s/^  unstable_navigation as navigation,$/  navigation,/; s/^  unstable_prefetch as prefetch,$/  prefetch,/" app/page.tsx
npm install

# 3. dev + typecheck -> TS2305 (BUG)
npx next dev --turbopack -p 3123 > dev.log 2>&1 &
DEV=$!
sleep 25; curl -s -o /dev/null http://localhost:3123/; sleep 5
npx tsc --noEmit; echo "tsc after dev exit=$?"   # expect 1 with TS2305 x2
kill $DEV

# 4. production build regenerates declarations -> clean
npx next build
npx tsc --noEmit; echo "tsc after build exit=$?" # expect 0
