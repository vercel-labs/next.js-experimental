# Turbopack persistent cache: unactionable shutdown/compaction warning under disk pressure

Next.js 16.4.0, `next build` with Turbopack persistent caching
(`experimental.turbopackFileSystemCacheForBuild: true`).

## Run

```bash
npm install
bash repro.sh
```

Linux only: the script uses an unprivileged user namespace to mount a small
tmpfs at `.next/cache`, which simulates a nearly-full disk for the cache
without touching the real filesystem.

## Observed

Build 1 (cold cache, space available) succeeds. Builds 2 and 3, with the cache
filesystem full, still compile and emit all routes and **exit with code 0**,
while printing in the middle of the build output:

```
✓ Compiled successfully in 160ms
  Running TypeScript ...
Shutting down failed: Failed to compact database
...
Route (app)
┌ ○ /
└ ○ /_not-found
--> exit code: 0
```

The message does not mention disk space, is not formatted as a Next.js
warning, and recurs on every subsequent build. Only when the snapshot write
(not the compaction) fails does the real cause get printed:

```
Persisting failed during shutdown: Unable to write SST file 00000025.sst

Caused by:
    0: Failed to write value block
    1: Failed to write block data
    2: failed to write to file `.../.next/cache/turbopack/v16.4.0-.../00000025.sst`: No space left on device (os error 28)
```

## Expected

A cache-maintenance failure should be clearly distinguished from a build-output
failure and should surface the actionable cause (ENOSPC / free disk space),
e.g. as a `⚠ Turbopack cache could not be compacted: No space left on device`
warning.

## Note

`Shutting down failed: {err}` is printed with `Display`, so the anyhow cause
chain containing `No space left on device` is dropped
(`turbopack/crates/turbo-tasks-backend/src/backend/mod.rs`, `stop()`), unlike
the neighbouring `Persisting failed during shutdown: {err:?}`.
