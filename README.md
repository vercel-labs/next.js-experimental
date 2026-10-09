# Repro: `URL data outside of Suspense` insight on a fully-prerendered `ensureStatic = "navigation"` catch-all

Next.js 16.4.0 · `next dev --turbopack` · Cache Components + Partial Prefetching.

## Run

```bash
npm install
npm run dev
# open http://localhost:3000/en  (and /en/about, /en/docs, /en/pricing)
```

## Expected
The route is declared `ensureStatic = 'navigation'` on the locale layout and
`generateStaticParams` enumerates every URL, so `next build` prerenders all of
them. The Instant insight should not fire (or should explain the trade-offs of
its fixes).

## Actual
On every page the dev overlay shows `Insights 1/1`:

> Next.js encountered URL data outside of Suspense.
> Ways to fix this: [stream] Wrap in / move into Suspense · [block] `export const instant = false`

Neither fix card mentions that moving the `params` read (and the `notFound()`
that depends on it) behind `<Suspense>` changes the HTTP status for unknown
nodes from 404 to 200.

Verified in this repro:
- as committed: `curl -o /dev/null -w '%{http_code}' localhost:3000/en/unknown` → `404`
- with the suggested `<Suspense>` fix → `200` (shell is flushed first)
- `export const dynamicParams = false` (the natural way to declare the param
  set closed) is rejected: *Route segment config "dynamicParams" is not
  compatible with `nextConfig.cacheComponents`.*
