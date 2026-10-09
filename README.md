# Production checklist (16.4 docs) vs. actual 16.4 behavior

Minimal Next.js 16.4.0 app with Cache Components + Partial Prefetching, built with Turbopack
(default), used to check the claims in the docs guide
"How to optimize your Next.js application for production" (docs version 16.4.0,
https://nextjs.org/docs/app/guides/production-checklist).

## Run

```
npm install
npx next build          # observe Partial Prerender output
ANALYZE=true npx next build   # observe bundle-analyzer no-op warning
npx next start
curl -H 'Cookie: theme=dark' http://localhost:3000
```

## Docs claim 1 — "Request-time APIs ... will opt the entire route into Dynamic Rendering"

`app/page.js` uses `cookies()` inside `<Suspense>` plus a `'use cache'` function.
`next build` reports:

```
Route (app)      Revalidate  Expire
┌ ◐ /                   15m      1y
└ ○ /_not-found

◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

The route is partially prerendered, not fully dynamic. The guide never mentions
`cacheComponents` / `use cache`, and its "Good to know" note still calls Partial Prerendering
experimental and links the Next.js 14 blog post.

## Docs claim 2 — bundle analysis via `@next/bundle-analyzer`

`ANALYZE=true next build` with the default (Turbopack) bundler prints:

```
The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated.
Consider trying the new Turbopack analyzer via `next analyze`.
```

No `.next/analyze` output is produced. The guide links only
`/docs/app/guides/package-bundling#nextbundle-analyzer-for-webpack` and does not mention
`next analyze` (which exists in 16.4: "Analyze production bundle output with an interactive
web ui ... Only compatible with Turbopack.").
