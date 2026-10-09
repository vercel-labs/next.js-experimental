# Turbopack: shared client modules copied into the global-error chunk (Next.js 16.4.0)

Minimal App Router app:

- `app/layout.tsx` renders `ThemeProvider` + `Nav` (`next/link`) — client components
- `app/global-error.tsx` statically imports the **same** `ThemeProvider` + `Nav`
- `app/page.tsx` uses a `next/dynamic` client component (`components/heavy.tsx`), `app/plain/page.tsx` does not

## Run

```bash
npm install
npm run build      # next build (Turbopack, default in 16)
node analyze-dup.mjs
```

`analyze-dup.mjs` lists every client module whose *definition* is emitted into more
than one `.next/static/chunks/*.js` file, and prints which route HTML loads which chunk.

## Observed on next@16.4.0

```
build-wide duplicated module definitions: 23 (extra raw 31528B, brotli of one copy ~6364B)
  x2 6527B next/dist/client/components/layout-router.js -> 3nrxb6kgqqcte.js, 3tdnv0zwgs5aw.js
  x2 4571B next/dist/client/app-dir/link.js             -> 3nrxb6kgqqcte.js, 3tdnv0zwgs5aw.js
  ... (components/theme.tsx, components/nav.tsx, error-boundary, client-page, ...)
```

`3nrxb…` is the chunk loaded by `/`, `/plain`, `/_not-found`; `3tdnv…` is loaded only by
the prerendered `_global-error.html`.

## Controls run in the same tree

| variant | duplicated module definitions |
| --- | --- |
| `app/page.tsx` **with** `next/dynamic` | 23 (31528 B raw) |
| `app/page.tsx` **without** `next/dynamic` | 23 (31528 B raw), byte-identical chunks |
| custom `app/global-error.tsx` removed | 15 (19713 B raw) |
| `experimental.turbopackChunking.minChunkSize` = 40000 / 30000 / 20000 | duplication persists; chunk hashes change at 30000 |
| shared modules enlarged to ~90 KB source | duplication disappears (single shared chunk) |

So the copying is caused by `global-error` being its own standalone entry whose shared
modules are small; adding/removing the lazy component has **no** effect, and the
duplicate copy is not downloaded on normal routes in this minimal app
(it only ships inside the `_global-error` document's chunk list).
