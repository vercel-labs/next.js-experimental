# Server Action version skew: next@16.3.8 client + next@16.4.0 server

A long-lived browser session that still runs the **next@16.3.8** client calls a Server
Action after the same origin has been redeployed with **next@16.4.0**. The POST returns
`HTTP 200`, but the action promise rejects with:

```
TypeError: Cannot read properties of undefined (reading 'map')
```

## Why

Action flight payload emitted by the server (same app, same build id, same action id):

| server | action response |
| --- | --- |
| 16.3.8 | `{"a":"$@1","f":"","q":"","i":false,"b":"fixed-build-id"}` |
| 16.4.0 | `{"a":"$@1","q":"","i":false,"b":"fixed-build-id"}` |

16.4.0 replaced the `f` (flight data) field with `t` / `n`
(`server/app-render/app-render.js`), while the 16.3.8 client still does
`normalizeFlightData(response.f)` in
`client/components/router-reducer/reducers/server-action-reducer.js`, and
`normalizeFlightData` calls `flightData.map(...)` on the missing value.

Note `next.config.js` pins `generateBuildId`, so the client-side build-id guard in the
16.3.8 reducer does not discard the payload — which is exactly the case for a redeploy of
the same project (deployment skew) rather than a cross-zone redirect.

## Run

```bash
npm install
npm run all     # builds app/ twice (16.3.8, then 16.4.0) and runs the skew scenario
```

`build.sh` builds the *same* directory with both Next.js versions so the Server Action ID
and build ID are identical, then stashes each `.next` + `node_modules` under `stash/`.
`skew-test.mjs` starts the 16.3.8 server on port 3000, opens the page in Chromium, runs
the action (resolves), kills the server, starts the 16.4.0 server on the same port with
the browser session untouched, and runs the action again (rejects).

Expected output of the second step:

```
[2] origin redeployed with next@16.4.0; browser still runs the 16.3.8 client
    action result: rejected: TypeError: Cannot read properties of undefined (reading 'map')
    raw 16.4.0 action response:
    200 text/x-component
    0:{"a":"$@1","q":"","i":false,"b":"fixed-build-id"}

REPRODUCED: the action promise rejected
```

Requires Chromium for Playwright (`npx playwright install chromium-headless-shell`).
