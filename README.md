# Repro: streaming metadata is not blocked for AI crawlers, and never blocked in Edge SSR

vercel/next.js#98748 — next `16.4.0-canary.32`

## Run

```bash
npm install
npm run build
npm start          # next start (production)
node probe.mjs     # in another shell
```

`/node` and `/edge` are identical dynamic App Router pages with an async
`generateMetadata()` that awaits 500ms. `/edge` sets `export const runtime = 'edge'`.
`probe.mjs` requests each page with a set of bot user agents and reports whether
`<title>` arrives in the first HTML chunk / before `</head>`.

## Observed (next start, 16.4.0-canary.32)

| UA | /node | /edge |
| --- | --- | --- |
| Twitterbot, facebookexternalhit, Slackbot | blocking `<head>` (title before `</head>`) | streamed after `</head>` |
| GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, TelegramBot | streamed after `</head>` | streamed after `</head>` |

Two distinct problems:

1. `HTML_LIMITED_BOT_UA_RE` (`packages/next/src/shared/lib/router/utils/html-bots.ts`)
   has no AI crawler / Telegram entries, so those UAs get streamed metadata.
   Setting `htmlLimitedBots` in `next.config.js` fixes this for `/node` only.
2. Edge SSR ignores bot detection completely: `serveStreamingMetadata: true` is
   hardcoded in `packages/next/src/build/templates/edge-ssr-app.ts`, so even
   `Twitterbot`/`facebookexternalhit` get streamed metadata on `/edge`.
