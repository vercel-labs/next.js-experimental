# Repro: with `cacheComponents` + `instant = false`, `redirect()` and `notFound()` answer 200

Next.js 16.4.0, Turbopack, production server (`next build` + `next start`).

## Run

```bash
npm install
npm run build
npm start   # port 3000
curl -sI localhost:3000/r/abc           # expected 307, actual 200
curl -sI localhost:3000/redirect-cookie # expected 307, actual 200
curl -sI localhost:3000/item/unknown    # expected 404, actual 200
curl -sI localhost:3000/redirect-me     # 307 (static page, correct)
```

## Result (observed)

| route | config | expected | actual (cacheComponents + instant=false) |
|---|---|---|---|
| `/redirect-me` (static `redirect()`) | instant=false | 307 | 307 |
| `/r/[id]` (`redirect()` after `await params`) | instant=false | 307 | **200**, HTML contains `NEXT_REDIRECT;replace;/target?from=abc;307` |
| `/redirect-cookie` (`redirect()` after `cookies()`) | instant=false | 307 | **200** |
| `/item/[id]` (`notFound()` for unknown param) | instant=false | 404 | **200**, 404 UI streamed client-side (`NEXT_HTTP_ERROR_FALLBACK;404`) |

With `cacheComponents` removed (and `instant` exports removed), the same app returns 307/307/307/404.
