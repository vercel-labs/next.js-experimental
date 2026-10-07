# `useRouter().prefetch()` + Partial Prefetching: which navigation stage does it request?

Repro for DX feedback: the `useRouter` and `prefetch()` API references never say which
navigation stage a manual `router.prefetch(href)` call requests under Partial Prefetching.

Measured behavior on `next@16.5.0-canary.0` (`cacheComponents: true`, `partialPrefetching: true`,
Turbopack, `next build` + `next start`):

| trigger | requests observed | content below `await prefetch()` rendered on the server? |
| --- | --- | --- |
| `router.prefetch('/target-a')` (as documented) | `next-router-prefetch: 1` static shell/tree only | **no** |
| `router.prefetch('/target-b', { kind: 'full' })` | extra `next-router-prefetch: 2` runtime request | yes |
| `<Link prefetch={true} href="/target-c">` | extra `next-router-prefetch: 2` runtime request | yes |
| `<Link href="/target-d">` (default) | static shell/tree only | no |

So the default `router.prefetch()` stops at the App Shell stage; only the undocumented
`{ kind: 'full' }` option escalates to the per-link runtime prefetch stage that renders
content below `await prefetch()`. The 16.4 release post states the opposite
("deferred until an explicit prefetch with `<Link prefetch>` or `useRouter().prefetch()`").

Source behind it: `needsSpeculativePrefetch()` in
`packages/next/src/client/components/segment-cache/scheduler.ts` returns `true` on a
Partial Prefetching route only when `task.fetchStrategy === FetchStrategy.Full`, and
`prefetchRoute()` in `packages/next/src/client/components/prefetch.ts` maps the default
`PrefetchKind.AUTO` to `FetchStrategy.PPR`.

## Run

```bash
npm install
npm run build
npm start                       # terminal 1, watch for DEFERRED_RENDERED lines
npm install playwright && npx playwright install chromium
node scripts-check-prefetch.mjs # terminal 2, prints prefetch request headers per trigger
```

Expected output of the driver (abridged):

```
=== hover #manual-default (router.prefetch(href))
{"url":"/target-a?_rsc=...","prefetch":"1","seg":"/_tree"}
{"url":"/target-a?_rsc=...","prefetch":"1","seg":"/target-a/__PAGE__"}
=== hover #manual-full (router.prefetch(href,{kind:"full"}))
{"url":"/target-b?_rsc=...","prefetch":"1","seg":"/_tree"}
{"url":"/target-b?_rsc=...","prefetch":"1","seg":"/target-b/__PAGE__"}
{"url":"/target-b?_rsc=...","prefetch":"2","seg":null}
```

and the server log only ever logs `DEFERRED_RENDERED target=b` / `target=c`, never `target=a`.
