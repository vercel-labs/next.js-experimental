# Repro harness: Cache Components Suspense fallback stays visible while streamed content remains hidden

Issue under test (DX Agent feedback #23, Next.js 16.4.0, dev + Turbopack, cacheComponents + PPR + `next/dynamic` `ssr: false`):
the Suspense fallback is reported to stay the only visible content while the completed route HTML sits in a `display:none`
stream slot and `document.readyState === 'complete'`.

## Run

```bash
npm install
npm run dev            # next dev --turbopack, cacheComponents + partialPrefetching enabled
node check.mjs http://localhost:3000/hello
```

`check.mjs` loads a route with Playwright, waits 5s after `load`, and reports whether the fallback is still mounted,
whether `#route-content` is inside a `[hidden]` React stream slot, and the visible body text.

## Route variants (all `Suspense` with a full-page fallback + a `next/dynamic` `ssr:false` WebGL canvas)

| Route | Shape |
| --- | --- |
| `/hello` (`app/[slug]`) | async page awaits `params`, canvas inside the boundary |
| `/loadingvar/hello` | same but fallback supplied by `loading.tsx` |
| `/gsp/hello` | `generateStaticParams` + awaited `searchParams` |
| `/cache/hello` | `'use cache'` data inside the boundary |
| `/shell/hello` | canvas lives in the layout (static shell), boundary in page |
| `/ssrfalse` vs `/plain` | static route with/without the `ssr:false` import |
| `/csp/hello` | same as `/hello` behind a nonce-based CSP (middleware.ts) |

## Result on 16.4.0

Every variant reveals correctly in dev and in `next build && next start`: fallback unmounted, `#route-content` visible,
no `[hidden]` slots left, no console errors. `/ssrfalse` still builds as `○ (Static)`, i.e. the `ssr:false` import does not
demote the route.

The only observed way to land in the reported state is when the inline React completion script never runs:
`node nojs.mjs` (Playwright with `javaScriptEnabled: false`) leaves `#full-page-fallback` visible with the finished markup
parked in `<div hidden id="S:0">`.
