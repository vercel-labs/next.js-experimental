# Stale server-only module after adding a new export (`next dev --turbopack`, Cache Components)

Repro harness for DX Agent feedback #9: "Dev server kept serving a stale server-only module
after a new export was added".

* `next@16.4.0-canary.37`, `next dev --turbopack`
* `cacheComponents: true`, `proxy.ts` present
* `lib/data.ts` is a server-only module (`import 'server-only'`), re-exported through the
  `lib/index.ts` barrel and consumed with a namespace import inside a `'use cache'`
  component (`app/_components/extra.tsx`).

## Run

```bash
npm install
npx next dev --turbopack -p 3200 > dev.log 2>&1 &
node loop.mjs            # 40 iterations; PORT / ITER / GAP env vars
grep -c "is not a function" dev.log
```

Each iteration:

1. appends a brand new export `fN` to the server-only module `lib/data.ts`,
2. starts a request to `/`,
3. ~120 ms later rewrites `app/_components/extra.tsx` to import and call `fN` through the barrel,
4. re-requests `/` after the dust settles and asserts that `FN` is rendered.

## Observed

The dev server renders the **new** component code against the **old** instance of the
server-only module and fails with exactly the reported error (34 of 40 iterations):

```
⨯ Error [TypeError]: {imported module ./lib/index.ts}.f2 is not a function
    at Extra (app/_components/extra.tsx:6:35)
  environmentName: 'Cache'
GET /?t=... 500
```

`f2` exists on disk and `tsc --noEmit` is clean at that point.

The step-4 request always succeeds, i.e. in this harness the stale module clears on the
next request and a dev-server restart is never required. The reporter's "error persisted
across reloads until `next dev` was restarted" part did not reproduce.
