# Turbopack lazy dynamic imports: dev server logs "conflicting effects for the same key"

Reproduces on **Next.js 16.4.0**, `next dev` (Turbopack), with
`experimental.turbopackLazyDynamicImports` enabled (the default for the
"client lazy dynamic compilation" setup).

## Shape

* `/a` lazily loads a markdown panel (`react-markdown` + `react-syntax-highlighter`)
  that itself contains a **nested** `import('mermaid')`, plus a sibling
  `next/dynamic` diagram component that imports `mermaid` statically.
* `/b` lazily loads the same diagram and syntax-highlighting components from a
  different entrypoint, so the lazily compiled chunks are shared between routes.

## Run

```bash
npm install
npx playwright install chromium
rm -rf .next
npm run dev > dev.log 2>&1 &   # clean Turbopack cache
npm run repro                  # drives /a -> /b -> /a in Chromium
grep -n "conflicting effects" dev.log
```

## Observed on Next.js 16.4.0

Every time a deferred UI is opened, the dev server logs:

```
 GET /a 200 in 361ms
[Server HMR] Update failed, re-evaluating modules: [Error: conflicting effects for the same key (key length: 126 bytes)] {
  code: 'GenericFailure'
}
```

The server HMR update is discarded and all server modules are re-evaluated.

## Control

Set both `turbopackLazyDynamicImports` and `turbopackLazyDynamicImportsSSR` to
`false` in `next.config.mjs` and run the same flow: the dev server log stays
clean. The error is independent of `cacheComponents` (it reproduces with and
without it).
