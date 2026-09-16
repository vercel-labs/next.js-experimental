# next.js#98604 verification harness — `allowedDevOrigins` "hydration mismatch"

App code is the reporter's `create-next-app` scaffold (Next 16.3.5, React 19.2.8) with
`allowedDevOrigins: ["127.0.0.1"]` in `next.config.ts`.

## Run

```bash
npm install
npm i -D playwright@1.61.0 && npx playwright install chromium
npm run dev            # http://127.0.0.1:3000

# 10 plain loads of the reporter's exact setup -> 0/10 hydration errors
node verify.js http://127.0.0.1:3000/ 10 baseline

# same setup, but a fake "browser extension" inserts a
# <div style="display:contents"> as the first child of <body> while the page
# is loading -> reproduces the reported diff on every load
node verify.js http://127.0.0.1:3000/ 4 injected inject
```

## Results observed (Linux, Chromium 149, Next 16.3.5)

| config | origin | fake extension | hydration error |
| --- | --- | --- | --- |
| `allowedDevOrigins: ["127.0.0.1"]` | `127.0.0.1:3000` | no | 0/10 |
| `allowedDevOrigins: ["127.0.0.1"]` | `127.0.0.1:3000` | yes | 4/4 (exact reported diff) |
| no `allowedDevOrigins` | `localhost:3001` | yes | 4/4 (exact reported diff) |
| no `allowedDevOrigins` | `127.0.0.1:3001` | yes | 0/3 — HMR websocket is blocked (`⚠ Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1"`) so the dev client never reports it |

The SSR HTML is byte-identical with and without `allowedDevOrigins` (only the
per-request `__next_r` id differs), so the option cannot change what is hydrated.
It only stops Next from blocking `/_next/*` + HMR for the `127.0.0.1` origin, which
is what makes the (extension-induced) mismatch visible again.
