#!/bin/bash
set -u
cd "$(dirname "$0")"
LOGDIR=${LOGDIR:-"$PWD/logs"}; mkdir -p "$LOGDIR"
log="$LOGDIR/concurrent-dev.log"
setsid node node_modules/next/dist/bin/next dev --turbopack >"$log" 2>&1 & P=$!
for _ in $(seq 1 60); do curl -sf -o /dev/null localhost:3000/ && break; sleep 1; done
for i in 1 2 3; do
  echo "--- round $i: build --turbopack while dev is running"
  sed -i "s/v[0-9]*-/v$i-/" lib/helper.ts
  node node_modules/next/dist/bin/next build --turbopack >"$LOGDIR/concurrent-build-$i.log" 2>&1 &
  B=$!
  for p in "" p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p11 p12 about; do
    printf "%s " "$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 localhost:3000/$p)"
  done; echo
  wait $B; echo "  build exit=$?"
  kill -0 $P 2>/dev/null || { echo "DEV EXITED during round $i"; break; }
done
sleep 5
if kill -0 $P 2>/dev/null; then echo "RESULT: dev still alive"; kill -INT -$P; else echo "RESULT: dev EXITED"; fi
sleep 2
grep -n -m5 "panicked\|missing in memory\|FATAL" "$log" || echo "no panic in dev log"
