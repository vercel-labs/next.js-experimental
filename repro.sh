#!/usr/bin/env bash
# Repro: generated route types keep importing a deleted route-group layout,
# so `tsc --noEmit` fails until route types are regenerated.
set -u
cd "$(dirname "$0")"

PORT=3123
GROUP_LAYOUT="app/(group)/layout.tsx"

start_dev() {
  setsid npx next dev --turbopack -p "$PORT" > "$1" 2>&1 &
  DEV_PGID=$!
  for _ in $(seq 1 60); do
    curl -sf -o /dev/null "http://localhost:$PORT/" && return 0
    sleep 1
  done
  echo "dev server did not start; see $1" >&2
  exit 1
}

stop_dev() {
  kill -TERM -"$DEV_PGID" 2>/dev/null
  for _ in $(seq 1 30); do
    curl -sf -o /dev/null "http://localhost:$PORT/" || break
    sleep 1
  done
  sleep 2
}

write_group_layout() {
  mkdir -p "app/(group)"
  cat > "$GROUP_LAYOUT" <<'LAYOUT'
export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}
LAYOUT
}

echo "== 1. install (next 16.4.0) =="
npm install --silent

echo "== 2. clean state: no route group, start dev (turbopack, typedRoutes) =="
rm -rf .next "app/(group)" *.tsbuildinfo
start_dev dev.log

echo "== 3. add a route-group layout (no page in the group) and let types regenerate =="
write_group_layout
for _ in $(seq 1 30); do
  curl -sf -o /dev/null "http://localhost:$PORT/"
  grep -q "(group)/layout" .next/dev/types/validator.ts && break
  sleep 1
done
grep -n "(group)/layout" .next/dev/types/validator.ts || {
  echo "route types never picked up the group layout; see dev.log" >&2; stop_dev; exit 1; }

echo "== 4. typecheck with the layout present (expected: pass) =="
npx tsc --noEmit; echo "exit=$?"

echo "== 5. stop dev server, then delete the route-group layout =="
stop_dev
rm -rf "app/(group)"

echo "-- generated validator.ts still references the deleted layout:"
grep -n "(group)/layout" .next/dev/types/validator.ts

echo "== 6. typecheck WITHOUT regenerating route types (BUG: fails with TS2307) =="
npx tsc --noEmit; echo "exit=$?"

echo "== 7. regenerate route types (start dev again), typecheck again (passes) =="
start_dev dev2.log
npx tsc --noEmit; echo "exit=$?"
stop_dev
