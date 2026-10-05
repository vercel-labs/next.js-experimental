#!/usr/bin/env bash
# Correct in-place-deploy repro: each server runs in its own process group and is
# fully torn down (port verified free) before the next step.
set -uo pipefail
PORT=${PORT:-3999}
SERVER_DIR=../server
LOGDIR=${LOGDIR:-/tmp/logs}
mkdir -p "$LOGDIR"

wait_port_free() {
  for _ in $(seq 1 100); do
    curl -s -o /dev/null "http://localhost:$PORT/" || return 0
    sleep 0.2
  done
  echo "  !! port $PORT still in use"; return 1
}

deploy() {
  npm run build >/dev/null 2>&1 || { echo "build failed"; exit 1; }
  mkdir -p "$SERVER_DIR"
  cp package.json next.config.ts "$SERVER_DIR"/
  [ -e "$SERVER_DIR/node_modules" ] || ln -s "$PWD/node_modules" "$SERVER_DIR/node_modules"
  # a deploy tool uploads changed build files and deletes removed ones, but never
  # touches runtime-written files such as .next/server/route-cache
  rsync -a --delete --exclude=/cache --exclude=/server/route-cache .next/ "$SERVER_DIR/.next/"
}

check() {
  local label=$1
  wait_port_free || exit 1
  setsid bash -c "cd '$SERVER_DIR' && exec npx next start -p $PORT" > "$LOGDIR/next-start-$label.log" 2>&1 &
  local pid=$!
  local pgid; pgid=$(ps -o pgid= -p $pid | tr -d ' ')
  for _ in $(seq 1 100); do curl -sf "http://localhost:$PORT/" >/dev/null && break; sleep 0.2; done
  local html; html=$(curl -s "http://localhost:$PORT/")
  echo "  served:  $(grep -o 'Build v[0-9]' <<<"$html" | head -1)"
  local missing=0
  for chunk in $(grep -oE '/_next/static/[A-Za-z0-9_/.~-]+\.(js|css)' <<<"$html" | sort -u); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$chunk")" = 200 ] || { missing=$((missing+1)); echo "    404: $chunk"; }
  done
  echo "  chunks referenced by the HTML that return 404: $missing"
  kill -9 -"$pgid" 2>/dev/null
  wait $pid 2>/dev/null
  wait_port_free || exit 1
}

rm -rf "$SERVER_DIR" .next
sed -i 's/v2/v1/g' app/page.tsx app/Counter.tsx
echo "next: $(node -e "console.log(require('next/package.json').version)")"
echo "Deploy build v1"; deploy; check v1
echo "  route-cache files on server after v1: $(find "$SERVER_DIR/.next/server/route-cache" -type f 2>/dev/null | wc -l)"
sed -i 's/v1/v2/g' app/page.tsx app/Counter.tsx
echo "Deploy build v2"; deploy; check v2
echo "  on disk: $(grep -o 'Build v[0-9]' "$SERVER_DIR/.next/server/app/index.html" | head -1) (.next/server/app/index.html)"
sed -i 's/v2/v1/g' app/page.tsx app/Counter.tsx
