# Repro: `next/dynamic` inside a `'use client'` file + Cache Components (next 16.4.0, Turbopack)

Two distinct behaviors of `dynamic(() => import(...))` used **inside a client component file**,
with `ssr: true`, on a Cache Components app.

## Run

```bash
npm install
npx next build --turbopack
PORT=3101 npx next start      # separate terminal
npx playwright install chromium
node test-hydration.mjs       # BASE=http://localhost:3101
node test-nojs.mjs
```

## Routes

| route | `loading` | note |
|---|---|---|
| `/no-loading` | none | dynamic chunk delayed 4s by Playwright route interception |
| `/with-loading` | `() => null` | same, for comparison |
| `/slow-with-loading` | `() => null` | import takes 300ms → fully static route |
| `/stream-with-loading` | `() => null` | same shell on a PPR/streamed route |

## A. No `loading` ⇒ no Suspense boundary ⇒ whole segment stays dehydrated

`test-hydration.mjs` delays only the lazy chunk (`1z46dcw1pdclq.js`) by 4s and clicks an
**unrelated** client `<Counter/>` in the same segment at t≈1.7s:

```json
{ "route": "no-loading",   "countAfterEarlyClick": "0", "countAfterLateClick": "1" }
{ "route": "with-loading", "countAfterEarlyClick": "1", "countAfterLateClick": "2" }
```

Without `loading` the counter is dead until the dynamic chunk arrives. With `loading` it works
immediately. See also `_optional/` — without `loading`, a dynamic import that takes a macrotask
makes `next build` fail with "encountered uncached or runtime data during prerendering ... at Lazy".

## B. With `loading`, the prerendered HTML is emitted out of place

`/stream-with-loading` response body — in-place the boundary is only a pending marker, and the
component HTML is appended after everything and relocated by `$RC`:

```html
<button id="counter">count: <span id="count">0</span></button>
<!--$?--><template id="B:1"></template><!--/$-->
...
<div hidden id="S:1"><p id="heavy">HEAVY_DYNAMIC_CONTENT_MARKER</p></div>
<script>$RC("B:1","S:1")</script>
```

`/slow-with-loading` (fully static) never emits the content at all: the static HTML keeps
`<!--$?--><template id="B:0">` and `HEAVY_DYNAMIC_CONTENT_MARKER` is absent from the document.

With JavaScript disabled (`test-nojs.mjs`):

```json
[{"route":"no-loading","heavyVisibleNoJS":true},
 {"route":"with-loading","heavyVisibleNoJS":true},
 {"route":"slow-with-loading","heavyVisibleNoJS":false},
 {"route":"stream-with-loading","heavyVisibleNoJS":false}]
```

When the lazy import resolves fast enough to land in the same flush, the HTML *is* inline
(`/with-loading`); the out-of-place/invisible-without-JS outcome depends on the chunk resolving
after the shell flushes.
