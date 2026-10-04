# Repro: production build retries deterministic prerender errors N times per route

Next.js `16.4.0-canary.59`, Turbopack production build, Cache Components + Partial Prefetching.

A client component calls `useSearchParams()` outside `<Suspense>` inside a dynamic route group,
so prerendering fails with the deterministic `CLIENT_HOOK_DYNAMIC`
(`blocking-prerender-client-hook`) error.

`next build` retries each failing path `experimental.staticGenerationRetryCount` times
(5 here) even though the error can never succeed on retry, printing the same stack
5x per route and adding exponential backoff delays (500ms -> 2s per attempt) to build time.

## Run

```bash
npm install
npm run build
```

Observed: `Failed to build /blog/[slug]/page: /blog/a (attempt 1 of 5)` ... `after 5 attempts.`
for all 3 paths, i.e. 15 identical prerender errors.

Expected: a deterministic prerender validation error fails the route once, without retries.
