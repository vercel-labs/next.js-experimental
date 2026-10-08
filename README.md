# Repro: `@next/playwright` `instant()` lock release in WebKit (feedback #96)

Claim under test: `releaseInstantCookie()` in `@next/playwright` releases the
navigation lock with a protocol-level cookie expiry
(`context.addCookies([{ ..., expires: 1 }])`), and WebKit removes that cookie
*without* emitting a `CookieStore` `change` event — so
`navigation-testing-lock.ts`'s `event.deleted` handler never runs and the
in-page navigation lock never releases.

## Setup

Next.js 16.4.0, `@next/playwright` 16.4.0, Turbopack dev, `cacheComponents` +
`partialPrefetching` enabled (the Instant Navigation Testing API is only wired
into the browser bundle when Cache Components is on, see
`create-compiler-aliases.ts`). Playwright 1.64.0 (WebKit 27.2, Chromium 156).

## Run

```bash
npm install
npx playwright install webkit chromium
npx playwright test            # webkit + chromium projects
node probe-cookiestore.mjs    # browser-level CookieStore probe, no Next.js
```

`playwright.config.ts` starts `next dev --turbopack` on port 3000 itself.

## What the tests observe

* `tests/instant-lock-release.spec.ts` — SPA navigation inside `instant()`.
* `tests/instant-lock-release-mpa.spec.ts` — full page load inside `instant()`.

Both record every `CookieStore` `change` event the page sees, then assert
that after `instant()` returns:

1. the lock cookie is gone from the Playwright cookie jar,
2. the page observed a `deleted` event for `next-instant-navigation-testing`,
3. a page-side `fetch('/api/ping')` settles — while the lock is held,
   `navigation-testing-lock.ts` swaps `window.fetch` for an override that
   defers user fetches until release, so a hanging fetch means the lock is
   still held.

`probe-cookiestore.mjs` isolates the browser behavior: it serves a plain HTML
page, sets the cookie over CDP/WebKit protocol, then expires it exactly like
`releaseInstantCookie()` does, and prints the events the page received.

## Result

Not reproduced on WebKit 27.2. The protocol-level expiry *does* emit a
`CookieStore` `change` event with the cookie in `event.deleted` (within a few
ms), the lock releases, and the deferred fetch resolves — identical to
Chromium.
