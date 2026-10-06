#!/usr/bin/env bash
# Builds, starts, restarts `next start` and prints what each request returns.
#   ./repro.sh            # case A (restart) + case B
#   PROBE_MEM=40000 ./repro.sh evict   # case A via in-memory LRU eviction instead of a restart
set -euo pipefail
PORT=${PORT:-3123}
U=http://localhost:$PORT
start() { npx next start -p "$PORT" >server.log 2>&1 & PID=$!; until curl -s -o /dev/null "$U/en"; do sleep 0.3; done; }
stop() { kill "$PID"; wait "$PID" 2>/dev/null || true; }
show() { # label, path, [extra curl args]
  local out hdr; hdr=$(mktemp)
  out=$(curl -s -D "$hdr" "${@:3}" "$U$2" | grep -o 'at=[0-9]*' | head -1 || true)
  printf '%-44s %-14s %s\n' "$1" "${out:-<no data>}" "$(grep -iE '^(x-nextjs-cache|x-nextjs-postponed):' "$hdr" | tr -d '\r' | tr '\n' ' ')"
  rm -f "$hdr"
}
rm -rf .next && npx next build >build.log 2>&1

if [ "${1:-}" = evict ]; then
  echo "== Case A via eviction (cacheMaxMemorySize=$PROBE_MEM)"; start
  for id in m1 m2 m3; do show "/en/p/$id (1st: shell)" /en/p/$id; sleep 2; show "/en/p/$id (2nd: upgraded)" /en/p/$id; done
  show "/en/p/m1 after m2,m3 were cached" /en/p/m1
  stop; exit 0
fi

start
echo "== Case A: page outside generateStaticParams"
show "/en/p/a (1st request: fallback shell)" /en/p/a; sleep 2
show "/en/p/a (2nd request: upgraded)" /en/p/a
echo "   files on disk: $(ls .next/server/route-cache/APP_PAGE/*/\$/en/p/ 2>/dev/null | grep '^a\.' | tr '\n' ' ')"
echo "== Case B: prerendered page regenerated at runtime"
show "/en (build-time data)" /en; sleep 11
show "/en (stale, triggers regeneration)" /en; sleep 2
show "/en HTML (regenerated)" /en
show "/en RSC (regenerated)" /en -L -H 'RSC: 1'
stop; echo "== restart next start"; start
show "/en/p/a  expected: HIT from disk" /en/p/a
show "/en HTML" /en
show "/en RSC  expected: same at= as HTML" /en -L -H 'RSC: 1'
stop
