# Repro: `next-bundle-optimizer` named skill handoffs are unavailable after a single-skill install

Next.js 16.4.0 skills (`skills/` in vercel/next.js).

## Run

```bash
bash reproduce.sh
```

Requires network access to npm/GitHub. No Next.js app build is needed.

## Expected

Either the handoff skills are installed with `next-bundle-optimizer`, or the skill
provides an install command / executable fallback for them.

## Actual

`npx skills add vercel/next.js --skill next-bundle-optimizer` installs exactly one
directory, `.agents/skills/next-bundle-optimizer`. Its `SKILL.md` hands off to
`next-cache-components-optimizer` (static App Shell), `next-partial-prefetching-optimizer`
(navigation prefetch) and `next-dev-loop` (runtime verification). None of the three are
installed, and the skill files contain no `skills add` command or other fallback, so the
script exits 1 with `3 named handoff skill(s) unavailable`.
