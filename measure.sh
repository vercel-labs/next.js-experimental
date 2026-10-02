#!/bin/bash
# $1 label, $2 clean?
set -u
cd "$(dirname "$0")"
LOG=./build-$1.log
[ "${2:-}" = clean ] && rm -rf .next
sync; echo 0 > /sys/fs/cgroup/memory.peak 2>/dev/null
BASE=$(cat /sys/fs/cgroup/memory.current)
START=$(date +%s)
npx next build > "$LOG" 2>&1 &
BPID=$!
PEAK=0
while kill -0 $BPID 2>/dev/null; do
  C=$(cat /sys/fs/cgroup/memory.current)
  [ "$C" -gt "$PEAK" ] && PEAK=$C
  sleep 0.3
done
wait $BPID; STATUS=$?
END=$(date +%s)
CACHE=$(du -sm .next/cache/turbopack 2>/dev/null | cut -f1)
COMPILED=$(grep -o 'Compiled successfully in [0-9.]*m\?s' "$LOG" | head -1)
WRITE=$(grep -o 'Finished writing to filesystem cache in [0-9.]*[a-z]*' "$LOG" | head -1)
echo "$1: exit=$STATUS wall=$((END-START))s cgroup_peak=$(awk "BEGIN{printf \"%.2f\", $PEAK/1073741824}")GiB (base $(awk "BEGIN{printf \"%.2f\", $BASE/1073741824}")) cache=${CACHE:-0}MB | $COMPILED | $WRITE"
