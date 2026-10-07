#!/usr/bin/env bash
# Repro: with Turbopack persistent caching enabled, a `next build` that runs out
# of disk space while writing/compacting the cache prints an unactionable
# "Shutting down failed: Failed to compact database" line (no disk-space cause)
# and still reports a successful build (exit code 0). It recurs on every build.
#
# Requires Linux with unprivileged user namespaces: a small tmpfs mounted at
# .next/cache simulates a nearly-full disk without touching the real one.
set -u
cd "$(dirname "$0")"

CACHE_FS_SIZE=${CACHE_FS_SIZE:-48M}
LEAVE_FREE_KB=${LEAVE_FREE_KB:-512}

build() { # $1 = label, $2 = marker value
  cat > app/page.tsx <<PAGE
export const marker = $2

export default function Page() {
  return <h1>turbopack persistent cache repro {marker}</h1>
}
PAGE
  echo "=== $1 ==="
  npx next build
  echo "--> exit code: $?"
}

if [ "${INSIDE_NS:-}" != "1" ]; then
  [ -d node_modules ] || npm install
  rm -rf .next
  mkdir -p .next/cache
  exec unshare -Urm --propagation private env INSIDE_NS=1 bash "$0"
fi

mount -t tmpfs -o size="$CACHE_FS_SIZE" tmpfs .next/cache

build "build 1: cold cache, free space available" 1
df -h .next/cache | tail -1

echo "=== filling the cache filesystem, leaving ${LEAVE_FREE_KB}K free ==="
while [ "$(df --output=avail -k .next/cache | tail -1)" -gt "$LEAVE_FREE_KB" ]; do
  fallocate -l 256K ".next/cache/ballast.$RANDOM$RANDOM" 2>/dev/null || break
done
df -h .next/cache | tail -1

build "build 2: warm cache, cache filesystem out of space" 2
build "build 3: same conditions, warning recurs" 3
