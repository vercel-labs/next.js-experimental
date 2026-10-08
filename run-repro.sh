#!/bin/bash
# Exact sequence from the report:
#   1. next dev --turbopack until the dev persistent cache is populated, stop it
#   2. next build --turbopack, then next start, then stop the server
#   3. next dev --turbopack again WITHOUT clearing any cache
#
# Expected (per the report): step 3 aborts with a turbo-tasks panic
#   "task <id> (<reason>, MustExist): task is missing in memory or persistent storage"
# Observed here on next@16.4.0: step 3 starts and serves requests normally.
#
# Usage: npm install && bash run-repro.sh    (logs land in ./logs)
set -u
cd "$(dirname "$0")"
LOGDIR=${LOGDIR:-"$PWD/logs"}
mkdir -p "$LOGDIR"
NEXT="node node_modules/next/dist/bin/next"
PAGES=("" about p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p11 p12)

wait_up() { for _ in $(seq 1 90); do curl -sf -o /dev/null localhost:3000/ && return 0; sleep 1; done; return 1; }
hit() { for p in "${PAGES[@]}"; do printf "/%s:%s " "$p" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 60 "localhost:3000/$p")"; done; echo; }
panics() { grep -n "panicked\|missing in memory or persistent storage" "$1" | head -5; }

echo "### 1. next dev --turbopack (populate the dev persistent cache)"
setsid $NEXT dev --turbopack >"$LOGDIR/dev-1.log" 2>&1 & P=$!
wait_up || echo "  dev #1 never became ready"
hit
# a couple of HMR invalidations, then idle so snapshot/GC/compaction run
for v in 2 3; do sed -i "s/v[0-9]*-/v$v-/" lib/helper.ts; sleep 3; hit; done
sleep 15
hit
kill -INT -$P 2>/dev/null; wait $P 2>/dev/null; sleep 3
echo "  dev #1 stopped; dev cache: $(du -sh .next/dev/cache/turbopack 2>/dev/null | cut -f1)"
panics "$LOGDIR/dev-1.log"

echo "### 2. next build --turbopack"
$NEXT build --turbopack >"$LOGDIR/build.log" 2>&1; echo "  build exit=$?"
echo "  build cache: $(du -sh .next/cache/turbopack 2>/dev/null | cut -f1)"
echo "  dev cache after build: $(du -sh .next/dev/cache/turbopack 2>/dev/null | cut -f1)"

echo "### 3. next start, then stop it"
setsid $NEXT start >"$LOGDIR/start.log" 2>&1 & P=$!
wait_up && hit
kill -INT -$P 2>/dev/null; wait $P 2>/dev/null; sleep 2

echo "### 4. next dev --turbopack again (no cache clearing)"
setsid $NEXT dev --turbopack >"$LOGDIR/dev-2.log" 2>&1 & P=$!
wait_up || echo "  dev #2 never served a request"
hit
sleep 10
hit
if kill -0 $P 2>/dev/null; then
  echo "RESULT: dev #2 is still running -- NOT reproduced"
  kill -INT -$P 2>/dev/null; wait $P 2>/dev/null
else
  echo "RESULT: dev #2 EXITED -- check $LOGDIR/dev-2.log"
fi
panics "$LOGDIR/dev-2.log" || echo "  no panic in dev #2 log"
