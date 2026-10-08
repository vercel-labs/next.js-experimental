# Repro: build route table marks fully static generated paths as Partial Prerender (◐)

Next.js 16.4.0, Turbopack production build, Cache Components + Partial Prefetching,
`ensureStatic = 'navigation'` on the root layout, one catch-all route whose paths are
all prerendered from `'use cache'` data only.

## Run

```bash
npm install
npm run build
node inspect-manifest.mjs
```

## Observed

Build route table:

```
└   /blog/[...slug]
  ├ ◐ /blog/[...slug]
  ├ ○ /blog/post-1
  ├ ○ /blog/post-2
  └ ◐ [+10 more paths]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

`inspect-manifest.mjs` shows every one of the 12 generated paths in
`.next/prerender-manifest.json` as `response: "complete"`, `compute: "static"`
(i.e. nothing postponed), and the `/blog/[...slug]` entry as
`response: "empty"`, `compute: "blocking"` (a blocking fallback, not a partial prerender).

The truncated `[+N more paths]` row and the route-pattern row both fall back to the
parent route's `pageInfo` (`hasPostponed: isRoutePPREnabled`) in
`packages/next/src/build/index.ts`, so they print ◐ regardless of the actual per-path
render result.
