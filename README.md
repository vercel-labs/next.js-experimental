# Turbopack production build fails while binding an internal worker port

Next.js **16.4.0**, `next build --turbopack` (Turbopack is the default bundler in 16.x).

Turbopack's node-worker pool (`turbopack-node`) spawns its JS worker processes and talks to
them over a **TCP socket on `127.0.0.1:0`**. In an execution environment where the process may
not open a local listening port (restricted agent sandbox, hardened CI, seccomp/netns policy),
the pool cannot start and the whole production build aborts with a Turbopack panic:

```
Failed to write app endpoint /page
Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- binding to a port
- Address already in use (os error 98)
...
- Execution of PostCssTransformedAsset::process failed
- Execution of evaluate_webpack_loader failed
FATAL: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-*.log
```

There is no fallback (unix socket / stdio IPC) and no actionable error message, so escalating
permissions inside the same sandbox does not help.

## Minimal trigger

A plain app-router page alone does not hit the pool. Anything routed through the node worker
pool does — here a `postcss.config.js` plus one imported CSS file.

## Reproduce

Linux, `unshare` (util-linux) + `python3`, no root required:

```bash
npm install
npm run repro
```

`scripts/run-restricted-build.sh` creates a throwaway network namespace, pins the ephemeral
port range to a single port and occupies it, so any `bind(127.0.0.1:0)` fails. Then it runs
the same build twice:

| bundler | result |
| --- | --- |
| `next build --turbopack` | exit 1, Turbopack FATAL `binding to a port` |
| `next build --webpack` | exit 0, build succeeds |

Outside the restricted namespace (`npm run build`) the Turbopack build also succeeds, so the
only difference is the ability to bind an ephemeral loopback port.
