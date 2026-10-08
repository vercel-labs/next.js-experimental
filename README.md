# Repro harness: "dev server kept serving a stale server-only module after a new export was added"

Tracks DX Agent feedback #73 (Next.js `16.4.0-canary.37`, `next dev --turbopack`, `cacheComponents: true`, `proxy.ts`).

Reported behavior: after adding a new export to a `server-only` module imported by a Server Component page
and calling it from that page, the page keeps failing at render with `TypeError: <newExport> is not a function`
until the dev server is restarted.

## Run

```bash
npm install
npx playwright install chromium
npm run dev            # terminal 1, keep it alive (long-lived session)
npm run sweep          # terminal 2, drives edits + browser reloads
```

`scripts/sweep.mjs` keeps a single long-lived `next dev --turbopack` session and one browser tab with an active
HMR connection, then performs 24 add-an-export edit cycles, varying:

- edit order: `lib`-first / `page`-first / both files written in the same tick
- new export appended after vs. prepended before the existing export (export-order shift)
- plain functions vs. `'use cache'` functions (Cache Components)
- a racing reload fired ~150ms into the recompile vs. reloading only after it settles

Each cycle fails the run if the reloaded page does not contain the new export's output, or if
`is not a function` shows up in the HTML or as a page error. Failures dump a screenshot + body text
into `artifacts/`.

## Result on 16.4.0-canary.37

All 24 cycles passed (`SWEEPDONE failures=0`); every edit was picked up on the next request, so the reported
staleness did not reproduce with these edit patterns. Additional manual variants that also did not reproduce:
namespace imports (`import * as data`), dynamic `await import()`, barrel re-export (`export *`), a module shared
between `proxy.ts` and the page, editing during an 8s in-flight render, and 25 rapid rename-style (atomic) saves.

One adjacent observation: while a *genuine* compile error existed in one route, every other route (including a
newly created one) also returned that same 500 build error until the broken import was fixed.
