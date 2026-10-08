# Repro: `next dev` panics with "task is missing in memory or persistent storage" when `experimental.turbopackGc` is on

Reported behavior (DX feedback #52): with `experimental.turbopackGc`, the Turbopack
persistent dev cache and Cache Components enabled, `next dev` panics after a
filesystem-cache compaction with a missing-task error — a stale reference to an
already-collected task. Routes then hang on compiling or return 500 until the dev
cache directory is deleted.

* Next.js: **16.4.0** (pinned exactly)
* Mode: development, bundler: Turbopack
* Config: `cacheComponents: true`, `experimental.turbopackGc`, `turbopackFileSystemCacheForDev`,
  `turbopackFileSystemCacheForBuild`, `turbopackMemoryEviction: 'full'`

## Run

```bash
npm install
./run.sh
```

Exits non-zero and prints `==== FINDINGS ====` as soon as a panic, a `missing in
memory or persistent storage` error, an HTTP 5xx, or a hung request is observed.
Server output per cycle is written to `LOGDIR` (default
`/workspace/.next-maintainer/reproduction-artifacts/next-server`).

## What the harness does

`scripts/stress.mjs` loops the reported sequence; each cycle reuses the persistent
cache written by the previous cycle:

1. `next build` (production build in between dev sessions, writes the build FS cache)
2. `next dev` — request `/`, `/about`, `/api/ping`
3. idle so a GC pass and a turbo-persistence compaction run
4. edit a module under `gen/` (invalidate, make tasks collectible), request again
5. bump `CONFIG_REV` in `next.config.ts` → dev server restarts → request routes again
6. idle again, then kill the dev server

`run.sh` sets `TURBO_ENGINE_SNAPSHOT_IDLE_TIMEOUT_MILLIS=200` and
`TURBO_ENGINE_SNAPSHOT_MIN_ACTIVE_TIME_MILLIS=200` so snapshots (and therefore GC
passes and compactions) happen every few seconds instead of every few minutes, and
`next.config.ts` sets `turbopackGc: { minProgressMs: 1, rootTtlMs: 1 }` so GC roots
age out within one session instead of three days. These only compress the reporter's
"several sessions over days" timeline; nothing else is simulated.

## Observed

Reproduced on cycle 2 of 12 (`.next/cache/turbopack/*/LOG` shows 3 completed
compactions at that point):

```
thread 'tokio-rt-worker' (4626) panicked at turbopack/crates/turbo-tasks-backend/src/backend/operation/mod.rs:825:5:
task TaskId 90624 (invalidate cell dependents, MustExist): task is missing in memory or persistent storage — a stale reference to an already-collected or never-created task

⨯ ./node_modules/next/dist/esm/server/stream-utils/node-web-streams-helper.js:8:1
Error: Module not found: Can't resolve '../../client/components/app-router-headers'
read_task_cell: task TaskId 91358 no longer exists (it was garbage collected). The reading task holds a stale reference to it and is expected to be dropped by its parent.

 GET /api/ping 500 in 1380ms
```

A second run with `TURBO_ENGINE_SKIP_INVALIDATE_ON_PANIC=1` (keeps the poisoned DB
instead of auto-invalidating it) showed the identical panic for the **same**
`TaskId 102390` both before and after the `next.config.ts` restart, i.e. the stale
reference is persisted in the cache and survives a restart — matching the report
that only deleting the dev cache directory recovers.

With default snapshot timings the same harness completed all 10 cycles cleanly,
so the race needs a high snapshot/GC/compaction rate (or, in real usage, many long
sessions) to surface.
