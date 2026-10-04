# Dev SSR `RangeError: Maximum call stack size exceeded` in module evaluation -> whole page becomes a 500

Next.js `16.4.0-canary.55`, `cacheComponents: true`, App Router, dev mode.

## Run

```bash
npm install
npm run dev          # Turbopack (default)
# in another shell, request the route as a document:
curl -i http://localhost:3000/
```

`npm run dev` first runs `scripts/generate-chain.mjs`, which creates
`lib/chain/mod0.js -> ... -> mod1999.js` (a deep tree of shared App Router modules,
standing in for a large app). `app/page.js` imports `lib/chain/mod0`.

## Observed (dev, Turbopack)

* Server log: `⨯ RangeError: Maximum call stack size exceeded` with frames
  `at module evaluation (lib/chain/mod866.js:1:1)` repeated for the chain, logged
  repeatedly for a single request.
* The document responds **HTTP 500** rendered by the Pages-Router error shell
  (`__NEXT_DATA__`, `/_next/static/chunks/pages__app_*`), so the App Router root layout
  is gone: `<script id="head-probe">` from `app/layout.js` is absent from the HTML and
  from the DOM, `document.title` is empty and `document.body` renders nothing.
* In the browser the client re-throws `Uncaught RangeError: Maximum call stack size exceeded`.
* `npm run dev:webpack` fails the same way (also 500 + `RangeError`), so it is not
  Turbopack-specific.
* With `CHAIN_DEPTH=1400` the same page renders 200 with the leaf output, so this is a
  depth threshold, not a cycle.
* Secondary: repeat requests after the first failure take minutes, and the server then logs
  `⨯ TypeError: frame.join is not a function` while formatting the overflow stack.

## Expected

Module evaluation should not overflow the stack, or the failure should be isolated and name
the import chain instead of replacing the whole App Router page shell with a 500 document.
