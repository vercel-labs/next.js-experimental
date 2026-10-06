# Repro: vercel/next.js#99755

False `CLIENT_HOOK_DYNAMIC` / "`usePathname()` outside of `<Suspense>`" errors under Bun.

`usePathname()` **is** inside `<Suspense>` (see `app/layout.tsx`), and the route is correctly
`◐ Partial Prerender`, but Bun still logs the error.

Root cause: Next.js's `filteringUnhandledRejectionHandler`
(`next/dist/server/node-environment-extensions/unhandled-rejection.external.js`) calls
`workUnitAsyncStorage.getStore()` *inside* a `process.on('unhandledRejection')` listener to drop
rejections from deliberately aborted prerenders. Node restores the AsyncLocalStorage context in
that listener; Bun 1.4.2 does not (oven-sh/bun#44650). With no store, the filter passes every
rejection through.

## Setup

```bash
bun install
```

## Reproduce (build)

```bash
bun --bun next build
```

Observed with Bun 1.4.2 / Next.js 16.4.0: exits 0, route table shows
`◐ /hiives/[hiiveSlug]/events/[eventSlug]/book`, but prints
`Error: Route "...": Next.js encountered URL data 'usePathname()' in a Client Component outside of
'<Suspense>'` with `digest: 'CLIENT_HOOK_DYNAMIC'`.

Control — the same build on Node prints zero such errors with an identical route table:

```bash
./node_modules/.bin/next build
```

## Reproduce (dev)

```bash
bun --bun next dev
curl http://localhost:3000/hiives/a/events/b/book
```

The request returns 200, but the server logs `Unhandled Rejection: Error: Route "…"` pointing at
the Suspense-wrapped `RouteAnalyticsReporter`.

## Confirming the root cause

```bash
node als.mjs   # handler store = { type: 'prerender-client' }
bun  als.mjs   # handler store = undefined
```

## Verifying the suggested fix

Applying the issue's suggested patch (returning early when there is no store and
`reason.digest` is `HANGING_PROMISE_REJECTION` or `CLIENT_HOOK_DYNAMIC`) to
`unhandled-rejection.external.js` takes the Bun build from 1 logged error to 0,
with an identical route table.
