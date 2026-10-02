# Repro: `unstable_paramMatching: 'blocking'` still streams a Suspense fallback during client navigation

Next.js `16.4.0-canary.57`, production server, Turbopack, `cacheComponents` + `partialPrefetching`.

`app/blocking/[slug]` declares `unstable_paramMatching = { slug: 'blocking' }` and seeds one
example param. The page reads `params` inside `<Suspense>` and awaits a `'use cache'` function
with a 1.5 s delay. `app/fallback/[slug]` is the identical page with policy `'fallback'` as a control.

## Run

```bash
npm install
npx playwright install chromium
npm run build
npm start                     # production server on :3100

node probe.mjs                # document + prefetch timings (fresh param values)
node nav-test.mjs blocking novel-2   # client navigation, blocking policy
node nav-test.mjs fallback novel-3   # client navigation, fallback policy (control)
```

Each `nav-test.mjs` run must use a param value not used before (`novel-1` … `novel-20`), because
the route cache fills after the first miss.

## Observed on 16.4.0-canary.57

`node probe.mjs`:

```
doc blocking cold      /blocking/doc-x1   status=200 ttfb=1910ms cache=MISS postponed=-
doc blocking repeat    /blocking/doc-x1   status=200 ttfb=33ms   cache=HIT
doc fallback cold      /fallback/doc-x2   status=200 ttfb=64ms   postponed=1
prefetch blocking      /blocking/pf-x1    status=200 ttfb=1660ms cache=MISS
```

`node nav-test.mjs blocking novel-2` → RSC response starts ~160 ms after the click,
`#fallback` becomes visible at 436 ms, `#data` at 1886 ms.
`node nav-test.mjs fallback novel-3` → `#fallback` at 275 ms, `#data` at 1702 ms.

So the document request and the prefetch request honor the blocking policy (they wait ~1.6–1.9 s
for the novel param's prerender), while a client navigation to a novel param value behaves exactly
like the `fallback` policy: the RSC response streams immediately and the user sees the Suspense
fallback flash before the data arrives.
