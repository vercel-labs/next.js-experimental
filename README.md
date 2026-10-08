# Repro: dev SSR `RangeError: Maximum call stack size exceeded` in module evaluation

Next.js `16.4.0-canary.55`, App Router, `cacheComponents: true`, dev server.

`scripts/generate.mjs` creates a deep chain of 2000 `'use client'` modules
(`mod0 -> mod1 -> ... -> mod1999`); `app/page.js` imports the head of the chain.

## Run

```bash
npm install
npm run dev          # runs the generator, then `next dev --turbopack`
curl -i http://localhost:3000/
```

## Observed

- Server log: `⨯ RangeError: Maximum call stack size exceeded` with a stack of
  `at module evaluation (generated/client/modNNN.js:2:1)` frames (overflow hit around mod726).
- The document responds `500` with the `<html id="__next_error__">` error shell; the
  root layout's `<head>` script appears only inside the serialized flight payload,
  not as a parsed tag.
- Also reproduces with `next dev --webpack`, so it is not Turbopack specific.
