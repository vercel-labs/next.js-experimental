# Recoverable SSR errors trigger costly component stack generation (Next.js 16.4.0-canary.61)

App Router + Cache Components + Turbopack, `next start` (production server).

`/`   - 6 Suspense boundaries whose client components throw during SSR (recoverable errors -> client render fallback).
`/ok` - identical tree, no errors (control).

## Run

```bash
npm install
npx next build --turbopack
./bench.sh /ok 3131 control
./bench.sh /   3132 throwing
node cmp.js profiles/control.cpuprofile profiles/throwing.cpuprofile
```

## Observed (Node 24, 101 requests each)

```
control  busy/req  8.8ms   componentFrame/req  0.0ms
throwing busy/req 45.3ms   componentFrame/req 26.5ms
```

`DetermineComponentFrameRoot` (React's component frame detection) is reached through the lazy
`errorInfo.componentStack` getter, read by the app-render SSR error handler when it computes the
error digest:

`next/dist/server/app-render/create-error-handler.js:166`

```js
err.digest = stringHash(err.message + (errorInfo?.componentStack || err.stack || '')).toString()
```

Inspect `profiles/*.cpuprofile` in Chrome DevTools, or:
`node analyze.js profiles/throwing.cpuprofile componentStack`
