# Turbopack `next build` deadlock: worker graph imports its spawner

`next build` (Turbopack) parks forever at "Creating an optimized production build ..."
with 0% CPU when a Web Worker's module graph imports the module that spawns the worker.

Graph: `app/client.jsx` -> `lib/work.js` -> `lib/spawn.js` -> (new Worker) `lib/worker.js` -> `lib/work.js`

## Run

```bash
npm install
npm run build          # Turbopack: hangs indefinitely, 0% CPU, no error (verified 6+ min)
npm run build:webpack  # webpack: succeeds in ~10s
```

## Verified on Next.js 16.4.0, Node 24.20.0, linux x64

| case | result |
| --- | --- |
| Turbopack, cycle present | hang, 0% CPU, 2/2 clean runs |
| Turbopack, `lib/worker.js` does not import `lib/work.js` | builds OK |
| webpack, cycle present | builds OK |

While hung, process CPU time (`/proc/<pid>/stat` utime+stime) stays frozen and all
`tokio-rt-worker` / V8 threads are sleeping -> turbo-tasks await cycle, not CPU work.
