# Repro: route announcer crashes with `removeChild` after browser translation

Issue: https://github.com/vercel/next.js/issues/99353
Upstream repro by @sapandiwakar: https://github.com/sapandiwakar/next-route-announcer-translate
(this copy adds an automated headless harness)

`AppRouterAnnouncer` portals a **bare text node** into its shadow-root div
(`packages/next/src/client/components/app-router-announcer.tsx`:
`createPortal(routeAnnouncement, portalNode)`). Chrome's built-in page
translation replaces that text node with a `<font>`-wrapped translated node.
When the next route has no `document.title` and no `<h1>`, the announcement
becomes `''` and React calls `removeChild` on the text node it no longer owns:

```
Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

## Manual steps (real Chrome)

```sh
npm install && npm run build && npm start
```

1. Open http://localhost:3000 in Chrome with a non-German UI language.
2. Translate the page from German (three-dot menu next to the address bar).
3. Click `Seite mit Titel` / `Page with title`.
4. Click `Startseite` / `Homepage` -> client crashes.

## Automated steps (headless, no real translate needed)

`translate-repro.mjs` emulates exactly what Chrome Translate does to the DOM:
it replaces text nodes (including inside the `next-route-announcer` shadow root)
with `<font>`-wrapped translated text nodes, after hydration.

```sh
npm install && npx playwright install chromium
npm run build && npm start &
npm run repro   # exits 1 and logs the NotFoundError
```

Observed with next@16.4.0-canary.37 / react 19.3.0:

```
2. announcer on /titled: <div aria-live="assertive" id="__next-route-announcer__" role="alert"><font _msttexthash="1">[EN] Seite mit Titel</font></div>
PAGEERROR: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
3. announcer on /   : null
4. visible body text: [EN] This page couldn't load | [EN] Reload to try again, or go back.
```

The whole app is replaced by the global error UI.

Patching `next/dist/client/components/app-router-announcer.js` to render
`<span key={routeAnnouncement}>{routeAnnouncement}</span>` (as in PR #98314)
makes the same harness pass with zero page errors:

```
3. announcer on /   : <div aria-live="assertive" id="__next-route-announcer__" role="alert"><span></span></div>
RESULT: no removeChild crash
```
