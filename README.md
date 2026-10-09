# Turbopack internal panic when the CSS (PostCSS) worker cannot bind a local port

Next.js 16.4.0 — `next build` (Turbopack, default bundler).

Turbopack evaluates PostCSS for CSS files in a spawned Node.js process and talks
to it over a TCP socket on `127.0.0.1:0`. In a sandbox that forbids binding local
ports (agent sandboxes, macOS seatbelt, hardened CI), the build dies with a FATAL
internal Turbopack error + panic log instead of an actionable permission error.

`deny-bind.py` emulates such a sandbox on Linux/x86_64 using a seccomp-bpf filter
that makes every `bind(2)` return `EPERM`.

## Steps

```bash
npm install

# 1. baseline: succeeds
npx next build

# 2. build with local port binding denied -> FATAL internal Turbopack error
rm -rf .next && python3 deny-bind.py npx next build

# 3. retry WITH permissions but WITHOUT clearing the cache -> same panic persists
npx next build

# 4. clear the persistent cache -> build succeeds again
rm -rf .next && npx next build

# 5. webpack build under the same restriction -> succeeds
rm -rf .next && python3 deny-bind.py npx next build --webpack
```

## Actual (step 2)

```
FATAL: An unexpected Turbopack error occurred. A panic log has been written to /tmp/next-panic-*.log.
Error [TurbopackInternalError]: Failed to write app endpoint /page
Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- binding to a port
- Operation not permitted (os error 1)
...
- Execution of <PostCssTransformedAsset as Asset>::content failed
- Execution of evaluate_webpack_loader failed
```

## Expected

An actionable error ("Turbopack could not bind a local port required to run
PostCSS; ..."), not an internal compiler panic — and the failure must not be
cached in `.next` so a retry with permissions works.

Note: removing `postcss.config.js` makes the Turbopack build pass even under the
restriction, because no Node.js loader process (and therefore no port) is needed.
