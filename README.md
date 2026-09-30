# Repro attempt for vercel/next.js#99454 — "Turbopack dev server causes first navigation to delay/fail until page reload"

The linked reporter repo (chirag-soni23/next-turbopack-reproduction @ be134ef) is an untouched
`create-next-app` template: it has no `/about`, no `/contact` and no `<Link>`s, so the described
steps cannot be run there. This is a complete app-router repro with nav links.

## Run

```bash
npm install
npx playwright install chromium
npm run gen                 # make /about and /contact expensive to compile
npm run dev                 # Turbopack, :3001
npm run dev:webpack         # webpack,   :3002   (second terminal)
BASE=http://localhost:3001 LABEL=turbopack npm run measure   # cold first navigation
BASE=http://localhost:3002 LABEL=webpack   npm run measure
# repeat both with a fresh browser context to get the warm numbers
npm run build && npm start && BASE=http://localhost:3000 LABEL=prod npm run measure
```

`measure.mjs` opens a fresh (private-window equivalent) Chromium context, loads `/`, clicks
the `/about` link and reports how long the URL takes to change and the destination to render,
plus any WebSocket/HMR console messages.

## Result on next@16.4.0-canary.53 (Node 24)

| mode | first nav after fresh load | nav after route already compiled |
| --- | --- | --- |
| `next dev` (Turbopack, :3001) | urlChange 1134 ms / render 1143 ms | 181 ms |
| `next dev --webpack` (:3002)  | urlChange 1497 ms / render 1503 ms | 226 ms |
| `next build && next start`    | 54 ms | 54 ms |

Both dev bundlers block the first client-side navigation until the destination route is
compiled on demand; Turbopack was consistently *faster* than webpack. No
`WebSocket is closed before the connection is established` error appeared in any run —
only `WS open ws://localhost:PORT/_next/hmr?...` + `[HMR] connected`.

Conclusion: the delay is dev-only on-demand compilation, not a Turbopack-specific defect.
