#!/usr/bin/env bash
# Case A: a page outside generateStaticParams, upgraded at runtime from the fallback
# shell to a complete static entry, is lost on `next start` restart because
# FileSystemCache.set() never writes the `.rsc` sidecar for PPR routes while get()
# requires it when meta.postponed == null.
set -uo pipefail
cd "$(dirname "$0")"
L=./logs; mkdir -p "$L"
P=${PORT:-3123}; U=http://localhost:$P
stopall(){ pgrep -f 'next-ser[v]er' > /tmp/pids; xargs -r kill < /tmp/pids; sleep 1.5; }
start(){ nohup npx next start -p $P > "$L/$1" 2>&1 & for i in $(seq 1 60); do curl -sf -o /dev/null $U/en && break; sleep 0.3; done; }
req(){ local lbl=$1; shift; curl -s -L -D /tmp/h "$@" -o /tmp/body; printf '%-40s %-16s %s\n' "$lbl" "$(grep -ao 'at=[0-9]*' /tmp/body | head -1)" "$(grep -iE '^(x-nextjs-cache|x-nextjs-postponed)' /tmp/h | tr -d '\r' | tr '\n' ' ')"; }
stopall; rm -rf .next
npx next build > "$L/build.log" 2>&1 || { echo BUILD FAILED; exit 1; }
start server-A1.log
echo "== warm /en/p/a (not in generateStaticParams)"
req "/en/p/a #1 (fallback shell)" $U/en/p/a
sleep 2
req "/en/p/a #2 (upgraded, HIT)" $U/en/p/a
echo "-- disk files written for /en/p/a (no a.rsc):"
find .next/server/route-cache -name 'a.*' -printf '  %f\n' | sort
echo "-- a.meta (no \"postponed\" => complete entry):"; echo -n '  '; cat .next/server/route-cache/APP_PAGE/*/'$'/en/p/a.meta; echo
echo "== restart next start immediately (entry is fresh, expect HIT from disk)"
stopall; start server-A2.log
req "/en/p/a after restart" $U/en/p/a
stopall
echo "FAIL if the line above shows x-nextjs-postponed: 1 and a new at= value."
