# Repro: stale `.next/types/cache-life.d.ts` hides stabilized `next/cache` exports (TS2305)

Feedback #69 — upgraded app reports missing `prefetch` / `navigation` exports from `next/cache`
until the production declarations are regenerated.

## Why it happens

Before `16.4.0-canary.~40`, `writeCacheLifeTypes` emitted a **script-level** `declare module 'next/cache'`
block that *shadows* the package's own types and has to redeclare every export; it listed
`unstable_navigation` / `unstable_prefetch` (see `stale-prod-cache-life.d.ts`).
Newer versions emit `export {}` first, so the block is a module *augmentation* and merges.

`next dev` writes to `.next/dev/types/`, `next build` writes to `.next/types/`, and the Next-generated
tsconfig includes **both** globs (`next/dist/lib/typescript/type-paths.js`). So an old production
`.next/types/cache-life.d.ts` left over from a pre-upgrade build keeps shadowing `next/cache`
even after `next dev` regenerates the dev types.

## Reproduce

```bash
npm i next@16.4.0-canary.20 react@19.2.0 react-dom@19.2.0
# use the unstable_ aliases in app/page.tsx, then:
npx next build                      # writes the old-format .next/types/cache-life.d.ts
npm i next@16.4.0                   # upgrade; imports become { prefetch, navigation }
npx next dev --turbopack -p 3123    # regenerates only .next/dev/types
npx tsc --noEmit                    # => TS2305 for 'prefetch' and 'navigation'
npx next build                      # regenerates .next/types with `export {}`
npx tsc --noEmit                    # => clean
```

`setup.sh` performs all of the above.
