# Repro: `notFound()` called inside a Client Component (Cache Components)

Next.js 16.4.0, App Router, `cacheComponents: true`, Turbopack.

`app/item/[id]/page.tsx` is a `'use client'` page that reads the dynamic segment with
`useParams()` and calls `notFound()` during render when the id is invalid. It is wrapped
in a `<Suspense>` boundary in `app/item/[id]/layout.tsx`, with
`app/item/[id]/not-found.tsx` as the nearest boundary.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

- Click "invalid item" on `/` (client navigation) -> nearest not-found UI renders.
- Open `/item/nope` directly (full page load) -> HTTP **200**, HTML contains only the
  Suspense fallback; the not-found UI appears after hydration.

Production (`npm run build && npm start`) behaves the same: HTTP 200 and no not-found
markup/`<meta name="robots" content="noindex">` in the streamed HTML.

Docs (`docs/01-app/03-api-reference/04-functions/not-found.mdx`) state `notFound()` can be
invoked in Server Components, Server Functions, and Route Handlers — Client Components are
not mentioned, nor is the page-load vs client-navigation difference or the 200 status.
