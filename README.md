# next-cache-miss-fallback-shell-repro

With `cacheComponents: true` and a custom `cacheHandler` that does not contain the build output (e.g. a Redis/LRU cache that starts empty or has evicted the entry), a **client-side navigation** to a path prerendered via `generateStaticParams` crashes with `Minified React error #412` ("Connection closed"). On the cache miss, Next serves the route's fallback shell (`x-nextjs-postponed: 1`, `%%drp:…%%` placeholders) as the static RSC response and never resumes it. A hard load of the same URL works, and so does the default file-system cache.

## Steps

```sh
pnpm install
pnpm exec playwright install chromium
./repro.sh            # builds + starts `next start` in both modes, runs check.mjs
```

- control: `CUSTOM_CACHE` unset → default cache
- custom: `CUSTOM_CACHE=1` → `cache-handler.mjs` (in-memory Map, starts empty) with `cacheMaxMemorySize: 0`

`check.mjs` opens `/`, clicks `<Link href="/items/a">`, waits 3s, and reports whether `#title` is visible, whether React #412 was logged, and the headers/body of the navigation RSC response (`rsc: 1`, no `next-router-prefetch`). It also hard-loads `/items/a`.

## Observed output (next 16.4.0, react 19.3.0)

```
================ control ================
  ├ ◐ /items/[slug]
  ├ ○ /items/a
  └ ○ /items/b
--- client navigation / -> /items/a ---
url after nav      : http://localhost:4311/items/a
#title visible     : true
React #412 logged  : false
--- hard load /items/a ---
#title visible     : true
exit code: 0
================ custom ================
  ├ ◐ /items/[slug]
  ├ ○ /items/a
  └ ○ /items/b
--- client navigation / -> /items/a ---
url after nav      : http://localhost:4311/items/a
#title visible     : false
React #412 logged  : true
RSC nav response   : 200 http://localhost:4311/items/a?_rsc=8FcA6QcS-3Co6Cxz
x-nextjs-postponed : 1
x-nextjs-cache     : (absent)
--- RSC body (excerpt) ---
9:[["children",{"s":"__PAGE__",...,"d":{"r":["$","$1","c",{"children":[["$","$a",null,{"fallback":["$","p",null,{"children":"loading…"}],"children":"$Lb"}], ...
8:[["children",{"s":{"n":"slug","t":"d","k":"%%drp:slug:f93124cb57d9f%%","s":[]}, ...
--- console errors ---
Error: Minified React error #412; visit https://react.dev/errors/412 ...
--- hard load /items/a ---
#title visible     : true
--- server log (custom handler) ---
[cache-handler] get MISS /route-cache/APP_PAGE/51f3…/$/items/a
[cache-handler] get HIT  /route-cache/APP_PAGE/51f3…/$/items/[slug]
exit code: 1
================ summary ================
control (default cache): PASS
custom  (cacheHandler) : FAIL
```

## Why

In `node_modules/next/dist/build/templates/app-page-runtime.js` (next 16.4.0):

- **L317–330**: `isDynamicRSCRequest = isRoutePPREnabled && isRSCRequest && !isPrefetchRSCRequest && !staticPrefetchDataRoute` (L317 reads `prerenderedRoute.prefetchDataRoute`). Because `/items/a` is in the prerender manifest with a `prefetchDataRoute`, a non-prefetch navigation RSC request is treated as *static* ("serve the prebuilt .rsc").
- **L754**: on a cache miss, `if (isRoutePPREnabled && (nextConfig.cacheComponents ? !isDynamicRSCRequest : !isRSCRequest))` serves the route's **fallback shell** (`/items/[slug]`), with `x-nextjs-postponed: 1` and the `%%drp:slug:…%%` param placeholder in the payload. For document requests the shell is then resumed, but the static RSC response is never resumed, so the Suspense child row (`$Lb` above) is never sent and React throws #412 ("Connection closed").

Same code in 16.3.8 (L323 / L726) and 16.5.0-canary.3 (L319 / L754).

Next's default file-system cache never misses here because it reads the build output; any custom `cacheHandler` that starts empty (Redis/LRU) or has evicted/expired the entry hits this path.

## Expected

A cache miss for a non-prefetch RSC navigation should render the page (or resume the shell, or fall back to a document navigation). It should never send an unresumable fallback shell.

---

## Maintainer mirror notes (issue #99861)

Verified on Linux, Node 24, next 16.4.0, pnpm 12 (`pnpm-workspace.yaml` sets
`minimumReleaseAge: 0` so the pinned playwright 1.64.0 installs).

Two fixes vs. the original repro:
* `repro.sh` did not wait for `next start` to release the port between the two
  modes, so the `custom` run hit `EADDRINUSE`, silently re-tested the `control`
  server and printed a false `PASS`. It now waits and aborts on EADDRINUSE.

Observed with `CUSTOM_CACHE=1`:
```
#title visible     : false
React #412 logged  : true
RSC nav response   : 200 /items/a?_rsc=...
x-nextjs-postponed : 1
body has drp marker : true   (%%drp:slug:...%%)
```
control run passes; a hard load of `/items/a` also works.
