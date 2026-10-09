# Repro: Vercel Node launcher crashes with `Cannot find module './.next/server/pages/_next/image.js'`

Upstream issue: https://github.com/vercel/next.js/issues/99911
Mirrors https://github.com/arjenblokzijl/next-image-launcher-repro and adds a
local harness that reproduces the launcher crash without a deployment.

The app is one route handler (`app/api/image/route.ts`) returning `500`.

## Run

```bash
./repro.sh
```

(`npm install` + `next build` + generate the real `@vercel/next` Node launcher +
invoke it twice)

Observed output:

```
== source route /api/image -> 500

Failed to handle /_next/image?url=%2Fapi%2Fimage&w=64&q=75 Error: Cannot find module './.next/server/pages/_next/image.js'
Require stack:
- ___next_launcher.cjs
  code: 'MODULE_NOT_FOUND',

== image optimizer fallback invocation -> 500
launcher crashed: MODULE_NOT_FOUND
```

## Why

`@vercel/next@22.0.0` `dist/adapter/node-handler.js` derives the page module
path from `x-matched-path` (or the request pathname). When the image optimizer's
local source answers 5xx, the function is invoked for the outer
`/_next/image?...` URL. `matchUrlToPage('/_next/image')` matches no route and
falls through to `matchedPathname: '/_next/image'`; `isAppDir` is false, so the
launcher does

```js
require('./' + path.posix.join(relativeDistDir, 'server', 'pages', '/_next/image' + '.js'))
```

which never exists in an App Router build (`.next/server/pages` only holds
`404.html` / `500.html`).

## Deployed behavior (reporter's live deployment)

```
$ curl -i 'https://next-image-launcher-repro.vercel.app/_next/image?url=%2Fapi%2Fimage&w=64&q=75'
HTTP/2 400
x-vercel-error: INVALID_IMAGE_OPTIMIZE_REQUEST
x-matched-path: /500
```

Runtime logs then show the crash above.

## Local `next start` (no crash, for contrast)

`next start` answers the same request with `500` and logs
`⨯ internal image response failed for /api/image 500`.
