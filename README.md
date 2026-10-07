# Repro: vercel/next.js#99830

Strict route matching drops `(settings)/settings/page.tsx` because a sibling
route group `(dashboard)` has `@modal/[...catchAll]`.

```
npm install
npx next dev         # visit /settings -> 404 + "do not match any complete route"
npx next build --webpack   # fails with UnmatchedAppPagesError
npx next build && npx next start   # (turbopack) /settings renders fine
```

Fixture copied from https://github.com/adamtowerz/next.js/tree/repro/route-group-unmatched-pages
(test/e2e/app-dir/parallel-routes-catchall-sibling-group).
