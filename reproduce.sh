#!/usr/bin/env bash
set -euo pipefail

snapshot_css() {
  local output="$1"
  find .next/static -type f -name '*.css' -print0 | sort -z | xargs -0 cat > "$output"
}

cat > app/globals.css <<'CSS'
@import "tailwindcss";

.initial-rule {
  color: rgb(1, 2, 3);
}
CSS
cat > app/page.js <<'JS'
export default function Page() {
  return <main className="initial-rule">initial</main>;
}
JS
rm -rf .next

echo '=== Build 1: initial files ==='
npm run build
snapshot_css /tmp/build-1.css

cat >> app/globals.css <<'CSS'

.first-appended-rule {
  background-color: rgb(11, 12, 13);
}
CSS
cat > app/page.js <<'JS'
export default function Page() {
  return <main className="initial-rule first-appended-rule">first edit</main>;
}
JS

echo '=== Build 2: first edit, cache retained ==='
npm run build
snapshot_css /tmp/build-2.css

cat >> app/globals.css <<'CSS'

.second-appended-rule {
  border-color: rgb(21, 22, 23);
}
CSS
cat > app/page.js <<'JS'
export default function Page() {
  return <main className="initial-rule first-appended-rule second-appended-rule">second edit</main>;
}
JS

echo '=== Build 3: second edit, cache retained ==='
npm run build
snapshot_css /tmp/build-3.css

printf '\n=== Emitted selector matrix ===\n'
for build in 1 2 3; do
  printf 'build %s: first=%s second=%s\n' \
    "$build" \
    "$(grep -q '\.first-appended-rule' "/tmp/build-$build.css" && echo present || echo MISSING)" \
    "$(grep -q '\.second-appended-rule' "/tmp/build-$build.css" && echo present || echo MISSING)"
done

if ! grep -q '\.first-appended-rule' /tmp/build-2.css && \
   grep -q '\.first-appended-rule' /tmp/build-3.css && \
   ! grep -q '\.second-appended-rule' /tmp/build-3.css; then
  echo 'REPRODUCED: emitted CSS is one edit behind while page source is current.'
  exit 0
fi

echo 'NOT REPRODUCED: expected one-edit-behind selector pattern was absent.'
exit 1
