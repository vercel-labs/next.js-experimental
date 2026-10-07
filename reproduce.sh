#!/usr/bin/env bash
# Reproduces: installing only `next-bundle-optimizer` leaves its named skill
# handoffs (next-cache-components-optimizer, next-partial-prefetching-optimizer,
# next-dev-loop) uninstalled, with no fallback instructions inside the skill.
set -u
WORK="$(mktemp -d)"
cd "$WORK"
echo '{"name":"skill-handoff-repro","private":true}' > package.json

echo "== step 1: advertised single-skill install =="
npx --yes skills@latest add vercel/next.js --skill next-bundle-optimizer --yes

SKILLS_DIR=".agents/skills"
echo
echo "== installed skills =="
ls -1 "$SKILLS_DIR"

echo
echo "== skill names referenced as handoffs by next-bundle-optimizer =="
REFS=$(grep -rhoE 'next-(cache-components|partial-prefetching)-(optimizer|adoption)|next-dev-loop' \
        "$SKILLS_DIR/next-bundle-optimizer" | sort -u)
echo "$REFS"

echo
echo "== resolution check =="
MISSING=0
for r in $REFS; do
  if [ -d "$SKILLS_DIR/$r" ]; then
    echo "OK      $r installed"
  else
    echo "MISSING $r referenced but not installed"
    MISSING=$((MISSING+1))
  fi
done

echo
echo "== fallback guidance check =="
if grep -rq "skills add" "$SKILLS_DIR/next-bundle-optimizer"; then
  echo "skill contains an install command for its handoffs"
else
  echo "skill contains NO install command / executable fallback for its handoffs"
fi

echo
if [ "$MISSING" -gt 0 ]; then
  echo "RESULT: BUG REPRODUCED - $MISSING named handoff skill(s) unavailable after the advertised install"
  exit 1
fi
echo "RESULT: no missing handoffs"
