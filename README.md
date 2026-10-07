# Repro: dev (Turbopack + cacheComponents) leaves Suspense fallback visible, completed HTML stuck in `<div hidden id="S:0">`

next 16.4.0, react 19.2, `cacheComponents: true`, `partialPrefetching: true`.

## Run
```
npm install
npm run dev     # next dev --turbopack -p 3102
# open http://localhost:3102/a
```

## Observed (with the CSP in next.config.mjs)
`document.readyState === "complete"`, `[data-testid=fallback]` is 1280x720 visible,
`[data-testid=route-content]` exists but its ancestor `div#S:0` has `hidden` / `display:none`.
`document.body.innerText === "Loading…"`. All `_next/static/chunks/*.js` requests fail with
`net::ERR_BLOCKED_BY_CSP` and every inline React script (including `$RC("B:0","S:0")`) is blocked,
because a CSP delivered from `next.config.mjs` `headers()` is never seen by the renderer, so Next
emits no `nonce` on its script tags, and `'strict-dynamic'` disables the `'self'` allowlist.

`middleware.ts.off` contains the documented middleware nonce pattern; renaming it to
`middleware.ts` (and removing `headers()` from next.config.mjs) makes the page render correctly.

## Probe
`node probe.mjs <label> [abortchunk]` prints the JSON state report and writes a screenshot.
