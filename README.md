# Turbopack build fails during CSS/PostCSS processing when local port binding is denied

Next.js `16.4.0` (Turbopack `e273d5b2`), Linux, Node 24.20.0.

Turbopack runs PostCSS (`PostCSSTransformedAsset` -> `evaluate_webpack_loader`) in a Node.js
side process that talks to the Rust process over a **loopback TCP socket**. In an execution
environment where that local socket cannot be used (restricted sandbox, denied port binding,
network namespace with `lo` down), the production build aborts with an internal Turbopack
error and a "report this error" link instead of an actionable diagnostic.

## Run

```sh
./repro.sh
```

`unshare -rn` is used to simulate the restricted environment: it creates a user + network
namespace whose loopback interface is down, so `connect(127.0.0.1)` fails with `ENETUNREACH`
while everything else (fs, cpu, node) works normally.

## Observed

| # | command | environment | result |
|---|---------|-------------|--------|
| 1 | `next build` (turbopack) | normal | pass |
| 2 | `next build` (turbopack) | loopback denied | **TurbopackInternalError** |
| 3 | `next build --webpack`   | loopback denied | pass |

Case 2:

```
Error [TurbopackInternalError]: Failed to write app endpoint /page

Caused by:
- [project]/app/globals.css [app-client] (css)
- creating new process
- node process exited before we could connect to it with exit status: 0

Debug info:
...
- Execution of parse_css failed
- Execution of <PostCssTransformedAsset as Asset>::content failed
- Execution of PostCssTransformedAsset::process failed
- Execution of evaluate_webpack_loader failed
- creating new process
- node process exited before we could connect to it with exit status: 0
  Process output:

  Process error output:
```

The child process' stdout/stderr are empty and its exit status is reported as `0`, so the
message contains no hint that loopback networking is the cause.

## Scope

* Removing `postcss.config.js` makes case 2 pass — only the Node-backed CSS transform path is affected.
* Bringing `lo` up inside the same namespace makes case 2 pass, confirming loopback is the trigger.
