#!/bin/bash
# Usage: ./bench.sh <path> <port> <tag>   e.g. ./bench.sh / 3132 throwing
set -e
mkdir -p profiles
NODE_OPTIONS="--require $PWD/profiler.js" npx next start -p "$2" > "$3.log" 2>&1 &
sleep 5
PID=$(pgrep -f "next-server" | tail -1)
curl -s -o /dev/null "http://localhost:$2$1"
kill -SIGUSR1 "$PID"; sleep 1
for i in $(seq 1 100); do curl -s -o /dev/null "http://localhost:$2$1"; done
kill -SIGUSR2 "$PID"; sleep 2
mv "profiles/prof-$PID.cpuprofile" "profiles/$3.cpuprofile"
kill -9 "$PID"
