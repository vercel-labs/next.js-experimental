# Repro: `instant = false` + Cache Components — `redirect()` / `notFound()` answer HTTP 200

Next.js 16.4.0, Turbopack, `next build` + `next start`.

`next.config.js` enables `cacheComponents: true`; every `page`/`layout` exports `instant = false`
(as produced by the `cache-components-instant-false` codemod in the migration guide).

## Run

```bash
npm install
npm run build
npm start          # port 3000
curl -sI localhost:3000/redirect-dynamic   # expected 307, actual 200
curl -sI localhost:3000/items/nope         # expected 404, actual 200
curl -sI localhost:3000/redirect-me        # 307 (fully static page is OK)
```

## Observed on 16.4.0

| route | server call | expected | actual |
| --- | --- | --- | --- |
| `/redirect-dynamic` (awaits `searchParams`) | `redirect('/')` | 307 + `location` | **200**, `<html id="__next_error__">`, redirect happens client-side |
| `/items/nope` (awaits `params`) | `notFound()` | 404 | **200**, 404 UI rendered client-side |
| `/redirect-me` (fully static) | `redirect('/')` | 307 | 307 |

Removing `cacheComponents` + `instant = false` restores 307 / 404 for the same pages.
