# Repro: Turbopack dev server panics with a stale task reference (Next.js 16.4.0)

Minimal pnpm monorepo (`apps/web` + `packages/ui`, 400 small modules) running
`next dev` with Turbopack's persistent filesystem cache.

```bash
pnpm install
bash repro.sh 6        # stops with "REPRODUCED in iteration N"
```

`apps/web/next.config.js`:

```js
experimental: {
  turbopackFileSystemCacheForDev: true,
  turbopackMemoryEviction: 'full',
  turbopackGc: { minProgressMs: 0, rootTtlMs: 0 },
}
```

`repro.sh` starts `next dev` on a fresh port, swaps the source tree back and forth
while serving requests (equivalent to reverting/reapplying source files with git),
then stops the process abruptly with `SIGKILL` and restarts it on another port so the
new session restores from the persistent cache left behind.

## Observed

Usually within 1-2 iterations the page request returns **500** and the server prints:

```
thread 'tokio-rt-worker' panicked at
turbopack/crates/turbo-tasks-backend/src/backend/operation/mod.rs:825:5:
task TaskId 24435 (invalidate cell dependents, MustExist): task is missing in memory
or persistent storage — a stale reference to an already-collected or never-created task

FATAL: An unexpected Turbopack error occurred. A panic log has been written to
/tmp/next-panic-<hash>.log.
```

Sometimes the preceding error is the related
`read_task_output: task TaskId N no longer exists (it was garbage collected). The
reading task holds a stale reference to it`, and the process aborts with
`turbo-tasks: an internal panic occurred outside the per-task panic boundary`.

## Expected

The dev server rebuilds the affected modules or invalidates the stale cache entries
instead of panicking / serving 500s.

## Notes

- `experimental.turbopackGc` + `turbopackMemoryEviction: 'full'` are required here:
  with the persistent cache alone (GC off) 30+ kill/restart/source-swap iterations did
  not panic.
- The `TURBO_ENGINE_SNAPSHOT_*` / `TURBO_ENGINE_EVICT_MIN_BYTES` values exported by
  `repro.sh` only shrink the window (snapshot + eviction + GC run constantly). With the
  upstream defaults the same script did not panic within 5 iterations on this small app.
- The abrupt `SIGKILL` + restart is not strictly required: swapping the source tree
  inside a single long-running dev session also panicked in one run.
