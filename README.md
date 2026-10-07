# Repro: `instant()` cleanup obscures the original timeout after a blocked navigation

Next.js `16.5.0-canary.2` · Turbopack · Cache Components + Partial Prefetching + `@next/playwright`

## Run

```bash
npm install
npx playwright install chromium
npm run build          # next build --turbopack
npm test               # playwright test (starts `next start` itself)
```

## Expected

The test fails with the original navigation/locator timeout that happened inside
`instant()`.

## Actual

```
Test timeout of 20000ms exceeded.

Error: browserContext.cookies: Protocol error (Storage.getCookies):
Failed to find browser context for id 15064315E69BF851F1E4E0E140C0FD3E

  at releaseInstantCookie (node_modules/@next/playwright/dist/index.js:109:47)
  at instant (node_modules/@next/playwright/dist/index.js:78:13)
```

## Why

Under `partialPrefetching`, the `instant()` navigation lock restricts the
navigation to the route shell, so `[data-testid="param-value"]` can never commit
inside the `instant()` scope. The wait runs until the Playwright test timeout.

Playwright then tears down / closes the browser context, but `instant()`'s
`finally` block still runs `step('Release Instant Lock', () => releaseInstantCookie(context))`,
whose first statement is `await context.cookies()`. That call fails against the
already-closed context and its rejection replaces the real timeout error.

`releaseInstantCookie` should be skipped (or its failure swallowed) when the
context is already closed, so the original timeout survives.
