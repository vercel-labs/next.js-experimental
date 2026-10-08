#!/bin/bash
# Stress (variant, see README): many short dev sessions against the same persistent cache, each
# killed hard at a random moment while compiling / persisting, interleaved with
# production builds. Looking for the turbo-tasks "task is missing in memory or
# persistent storage" panic.
set -u
cd "$(dirname "$0")"
LOGDIR=${LOGDIR:-"$PWD/logs"}
N=${N:-10}
mkdir -p "$LOGDIR"
wait_up() { for _ in $(seq 1 60); do curl -sf -o /dev/null localhost:3000/ && return 0; sleep 1; done; return 1; }
hit() { for p in "" p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p11 p12; do curl -s -o /dev/null localhost:3000/$p; done; }

for i in $(seq 1 "$N"); do
  log="$LOGDIR/stress-dev-$i.log"
  setsid node node_modules/next/dist/bin/next dev --turbopack >"$log" 2>&1 & P=$!
  if wait_up; then
    hit
    sed -i "s/v[0-9]*-/v$i-/" lib/helper.ts
    hit &
    sleep $(( (RANDOM % 4) + 1 ))
    hit
  else
    echo "session $i: never ready"
  fi
  if ! kill -0 $P 2>/dev/null; then echo "session $i: DEV EXITED ON ITS OWN"; fi
  if [ $((i % 2)) -eq 0 ]; then kill -KILL -$P 2>/dev/null; else kill -INT -$P 2>/dev/null; fi
  wait $P 2>/dev/null
  for _ in $(seq 1 20); do curl -sf -o /dev/null --max-time 1 localhost:3000/ || break; sleep 1; done
  sleep 2
  if grep -q "panicked\|missing in memory" "$log"; then
    echo "PANIC in session $i"; grep -n -A5 "panicked" "$log" | head -30; exit 1
  fi
  if [ $((i % 3)) -eq 0 ]; then
    node node_modules/next/dist/bin/next build --turbopack >"$LOGDIR/stress-build-$i.log" 2>&1
    echo "session $i: build exit=$?"
  fi
  echo "session $i ok (cache $(du -sh .next/dev/cache/turbopack 2>/dev/null|cut -f1))"
done
echo "RESULT: no panic in $N stress sessions"
