# Repro: unlisted invalid dynamic param returns 200 on first request, 404 afterwards

Next.js 16.4.0, production server, Turbopack, `cacheComponents` + `partialPrefetching`.

`app/item/[slug]/page.tsx` lists `alpha`/`beta` via `generateStaticParams` and calls
`notFound()` in `generateMetadata` and inside a Suspense boundary for unknown params.

## Run

```bash
npm install
npx next build --turbopack
npx next start -p 3000

# first request for a never-requested invalid param
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/item/nope   # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/item/nope   # 404
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/item/nope   # 404
```

Both a browser UA and `Googlebot` UA behave identically. The 200 response body is the
404 page with `<meta name="robots" content="noindex"/>`.

## Variants observed

- no flags: 404 on every request (correct)
- `cacheComponents` only: 200 on every request
- `cacheComponents` + `partialPrefetching`: 200 on first request, 404 on all later ones
