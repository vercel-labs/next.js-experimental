# Repro: issue #98750 — HTML-limited bots bypass the PPR static shell / cached page

Next.js `16.4.0-canary.32`, `cacheComponents: true`, `next build && next start`.

## Run

```bash
npm install
npm run build
npm start          # port 3100
./check.sh         # in another shell
```

## Observed (see check.sh output)

| Route | Chrome / Googlebot UA | Bingbot / YandexBot / Twitterbot UA |
| --- | --- | --- |
| `/ppr` (PPR shell + dynamic hole) | `x-nextjs-prerender: 1`, `x-nextjs-postponed: 1` (shell served, resumed) | no prerender headers — full dynamic SSR |
| `/static-cached` (`'use cache'`, revalidate 60) | `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=60, stale-while-revalidate=240` | `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, page re-rendered on the server |

Cause: in `packages/next/src/build/templates/app-page-runtime.ts`,
`shouldForceDynamicPPRRender = isRoutePPREnabled && !serveStreamingMetadata`
forces `isSSG = false` for user agents matched by `htmlLimitedBots`, even when the
route is fully prerendered. Googlebot is *not* in `htmlLimitedBots`, so the UA in
the issue's steps does not trigger it.
