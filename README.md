# Turbopack dev + persistent cache after a production build (Next.js 16.4.0)

Minimal harness for the report *"Turbopack dev server panics on a stale task after a
production build in the same app"* (`next@16.4.0`, development, Turbopack, persistent
cache enabled).

Reported panic:

```
task <id> (<reason>, MustExist): task is missing in memory or persistent storage —
a stale reference to an already-collected or never-created task
```

(The string exists in `@next/swc` 16.4.0 and comes from
`turbopack/crates/turbo-tasks-backend/src/backend/operation/mod.rs` `panic_missing_task`.)

## Run

```bash
npm install
bash run-repro.sh        # logs in ./logs
```

`run-repro.sh` performs the reported sequence:

1. `next dev --turbopack`, request all routes, 2 HMR edits, idle 15s, SIGINT
   (dev persistent cache grows to ~146 MB)
2. `next build --turbopack`
3. `next start`, request all routes, SIGINT
4. `next dev --turbopack` again, **without clearing any cache**

## Result on next@16.4.0 (Linux x64, Node 24)

Step 4 starts normally and serves every route with `200`; the process stays alive. No
panic in any log.

```
  dev #1 stopped; dev cache: 146M
  build exit=0
  build cache: 21M
  dev cache after build: 146M
RESULT: dev #2 is still running -- NOT reproduced
```

Key observation: in 16.4.0 the two Turbopack persistent caches are **separate
directories** — dev uses `.next/dev/cache/turbopack/<version>` and
`next build --turbopack` uses `.next/cache/turbopack/<version>`. A byte-for-byte
`ls` diff of the dev cache directory taken before and after `next build --turbopack`
is identical, so a production build does not mutate the dev cache that the next
`next dev` restores.

## Additional variants that also did not panic

* `stress.sh` – 12 short dev sessions against the same cache, alternating SIGINT and
  SIGKILL mid-compile, with a `next build --turbopack` every third session.
* `concurrent.sh` – `next build --turbopack` run three times *while* the dev server is
  running and serving requests.
* Both were also run with `experimental.turbopackMemoryEviction: 'full'` and
  `experimental.turbopackGc: { minProgressMs: 0, rootTtlMs: 1000 }` (uncomment in
  `next.config.js`) so tasks are evicted from memory after every snapshot and only
  live in the persistent cache.
