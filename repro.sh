#!/bin/bash
# Reproduces the Turbopack dev-server panic reported in the issue:
#
#   thread 'tokio-rt-worker' panicked at
#   turbopack/crates/turbo-tasks-backend/src/backend/operation/mod.rs:825:5:
#   task TaskId N (task, MustExist): task is missing in memory or persistent storage
#   - a stale reference to an already-collected or never-created task
#
# Setup:  pnpm install
# Run:    bash repro.sh [iterations]      # default 6
#
# Each iteration starts `next dev` on a fresh port, swaps the source tree back and
# forth (equivalent to reverting/reapplying source files with git) while requests are
# served, then stops the server abruptly with SIGKILL and restarts it, so the next
# iteration restores from the persistent Turbopack cache left behind by the crash.
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/apps/web"
ITERS="${1:-6}"
LOGDIR="${LOGDIR:-$ROOT/logs}"
mkdir -p "$LOGDIR"

# Aggressive snapshot/eviction tuning: makes memory eviction + GC run constantly so the
# window is hit within seconds. Large real-world apps hit it without these.
export TURBO_ENGINE_SNAPSHOT_IDLE_TIMEOUT_MILLIS=${TURBO_ENGINE_SNAPSHOT_IDLE_TIMEOUT_MILLIS:-25}
export TURBO_ENGINE_SNAPSHOT_MIN_ACTIVE_TIME_MILLIS=${TURBO_ENGINE_SNAPSHOT_MIN_ACTIVE_TIME_MILLIS:-0}
export TURBO_ENGINE_EVICT_MIN_BYTES=${TURBO_ENGINE_EVICT_MIN_BYTES:-1}

PANIC_RE='panicked|missing in memory or persistent storage'
hit() { curl -s -m 30 -o /dev/null -w "%{http_code}" "http://localhost:$1$2"; }
stop_app() {
  local port="$1" p
  for p in $(pgrep -f "next dev --port $port"); do kill -"${SIG:-9}" "$p" 2>/dev/null; done
  for p in $(pgrep -f "next""-server"); do
    [ "$(readlink /proc/$p/cwd 2>/dev/null)" = "$APP" ] && kill -"${SIG:-9}" "$p" 2>/dev/null
  done
  return 0
}
report() {
  echo "REPRODUCED in iteration $1 -> $2"
  grep -B1 -A3 -E "$PANIC_RE" "$2" | head -20
}

rm -rf "$APP/.next"
node "$ROOT/scripts/apply.js" base >/dev/null
for i in $(seq 1 "$ITERS"); do
  PORT=$((3500 + i))                       # every restart uses a different port
  LOG="$LOGDIR/iter$i-port$PORT.log"
  ( cd "$APP" && exec setsid ./node_modules/.bin/next dev --port "$PORT" > "$LOG" 2>&1 < /dev/null ) &
  code=000
  for t in $(seq 1 120); do code=$(hit "$PORT" /); [ "$code" != "000" ] && break; sleep 0.5; done
  echo "iteration $i (port $PORT): first request -> $code"
  for tree in variant base variant base; do
    node "$ROOT/scripts/apply.js" "$tree" >/dev/null
    echo "  $tree tree: / -> $(hit "$PORT" /)   /r3 -> $(hit "$PORT" /r3)"
    if grep -qE "$PANIC_RE" "$LOG"; then report "$i" "$LOG"; stop_app "$PORT"; exit 1; fi
  done
  for k in 1 2 3 4 5 6 7 8; do curl -s -m 15 -o /dev/null "http://localhost:$PORT/?x=$k" & done
  sleep "0.$((RANDOM % 9))"
  stop_app "$PORT"                          # abrupt stop while requests are in flight
  sleep 1
  if grep -qE "$PANIC_RE" "$LOG"; then report "$i" "$LOG"; exit 1; fi
done
echo "not reproduced in $ITERS iterations"
