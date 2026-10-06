#!/usr/bin/env bash
# Case B: a build-time prerendered page regenerated at runtime serves the regenerated
# HTML after a restart, but the RSC payload (client navigation) falls back to the
# build-time data, still labelled x-nextjs-cache: HIT.
set -uo pipefail
cd "$(dirname "$0")"
L=./logs; mkdir -p "$L"
P=${PORT:-3123}; U=http://localhost:$P
stopall(){ pgrep -f 'next-ser[v]er' > /tmp/pids; xargs -r kill < /tmp/pids; sleep 1.5; }
start(){ nohup npx next start -p $P > "$L/$1" 2>&1 & for i in $(seq 1 60); do curl -sf -o /dev/null $U/en && break; sleep 0.3; done; }
req(){ local lbl=$1; shift; curl -s -L -D /tmp/h "$@" -o /tmp/body; printf '%-40s %-16s %s\n' "$lbl" "$(grep -ao 'at=[0-9]*' /tmp/body | head -1)" "$(grep -iE '^(x-nextjs-cache|x-nextjs-postponed)' /tmp/h | tr -d '\r' | tr '\n' ' ')"; }
stopall; rm -rf .next
npx next build > "$L/build.log" 2>&1 || { echo BUILD FAILED; exit 1; }
start server-B1.log
req "/en HTML build-time" $U/en
req "/en RSC  build-time" -H 'RSC: 1' $U/en
sleep 11
req "/en HTML (stale, regenerating)" $U/en
sleep 3
req "/en HTML regenerated" $U/en
req "/en RSC  regenerated" -H 'RSC: 1' $U/en
echo "== restart next start"
stopall; start server-B2.log
req "/en HTML after restart" $U/en
req "/en RSC  after restart" -H 'RSC: 1' $U/en
stopall
echo "FAIL if the two lines above show different at= values (RSC = build-time data)."
