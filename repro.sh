#!/usr/bin/env bash
# Reproduces: `next dev` exits with code 0 and prints no error when its forked
# dev-server child is terminated by a signal (e.g. the OS memory-pressure /
# OOM killer, which sends SIGKILL silently on macOS and Linux).
set -u
PORT="${PORT:-3000}"
LOG="${LOG:-$(pwd)/next-dev.log}"
rm -f "$LOG"

./node_modules/.bin/next dev --port "$PORT" > "$LOG" 2>&1 &
PARENT=$!
echo "[repro] next dev parent pid: $PARENT"

for i in $(seq 1 60); do
  grep -q "Ready in" "$LOG" && break
  sleep 1
done
curl -s -o /dev/null -w "[repro] GET / -> %{http_code}\n" "http://localhost:$PORT/"

CHILD=$(pgrep -P "$PARENT" | head -1)
echo "[repro] forked dev-server child pid: $CHILD"
echo "[repro] sending SIGKILL to the child (simulates an OS OOM/jetsam kill)"
kill -9 "$CHILD"

wait "$PARENT"
CODE=$?
echo "---------------- next dev output ----------------"
cat "$LOG"
echo "-------------------------------------------------"
echo "[repro] 'next dev' parent exit code: $CODE"
if [ "$CODE" -eq 0 ] && ! grep -qi "error\|crash\|exited" "$LOG"; then
  echo "[repro] REPRODUCED: next dev exited 0 with no error message after the child died."
else
  echo "[repro] NOT reproduced (exit code $CODE)."
fi
