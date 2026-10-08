# `next dev` exits with code 0 and no error message

Minimal reproduction for: the dev server process silently disappears, exiting
with code **0** and printing **no error**, while the app is being used.

## Run

```bash
npm install
npm run repro
```

## What happens

`next dev` forks a child process (`next-server`) that runs the actual dev
server. When that child is terminated by a **signal** (OS memory-pressure /
OOM killer sends `SIGKILL` with no output; on macOS this is jetsam), the parent's
`child.on('exit', (code, signal) => { ... if (signal) { ... return } ... })`
handler in `next/dist/cli/next-dev.js` returns early.

Nothing is logged, no non-zero exit code is propagated: the parent simply runs
out of work and Node exits the event loop with status **0**.

From a user's point of view `next dev` "exits with code 0 and no error message
a few minutes after start" — exactly the reported symptom, and there is no
diagnostic output pointing at the real cause (the child being killed).

## Expected

`next dev` should report that the dev server child was terminated
(signal name) and exit with a non-zero status (e.g. `128 + signal`).

## Observed (Next.js 16.4.0-canary.56, Turbopack, App Router)

```
▲ Next.js 16.4.0-canary.56 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 312ms

[repro] 'next dev' parent exit code: 0
```
