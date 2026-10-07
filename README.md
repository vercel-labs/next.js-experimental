# Repro: spurious `useSearchParams()` outside `<Suspense>` error on `next build` (exit 0)

Next.js 16.4.0, Turbopack, Cache Components.

`app/page.tsx` renders a Client Component that calls `useSearchParams()` inside an explicit
`<Suspense fallback={...}>` boundary.

## Steps

```bash
npm install

# control: Node build is clean
npx next build            # exit 0, no error logged

# reproduction: Bun build (bun 1.4.2)
bun --bun node_modules/next/dist/bin/next build
```

## Observed with `bun --bun next build`

The build logs, while the route still prerenders successfully and the process exits 0:

```
Error: Route "/": Next.js encountered URL data `useSearchParams()` in a Client Component outside of `<Suspense>`.
...
{ digest: 'CLIENT_HOOK_DYNAMIC' }
✓ Generating static pages using 1 worker (3/3)
Route (app)
┌ ○ /
└ ○ /_not-found
```

`.next/server/app/index.html` contains the Suspense fallback (`loading search params…`),
i.e. the boundary did work and the diagnostic is a false positive.

## Expected

No error for a correctly wrapped `useSearchParams()` read — or, if the error is real, a
non-zero exit status.
