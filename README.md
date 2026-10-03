# Repro: `next dev` exits with code 0 and no message when its server child dies from a signal

Next.js `16.4.0-canary.55`.

`next dev` forks the real dev server (`next/dist/server/lib/start-server`) as a child process.
In `packages/next/src/cli/next-dev.ts` the `child.on('exit', (code, signal) => ...)` handler
bails out early when `signal` is set (unless an upgrade prompt is in progress):

```js
if (signal) {
  if (upgradeInProgress) { ... }
  return   // <- nothing logged, no exit code propagated
}
```

So when the child is killed by SIGSEGV (native crash), the parent simply loses its IPC
channel, the event loop drains, and `next dev` exits **0** with no output. Supervisors
(`npm run dev`, Docker, CI, process managers) see a clean success.

## Run

```bash
npm install
npm run repro
```

The harness starts `next dev`, waits for the server to be ready, requests `/`,
then sends `SIGSEGV` to the forked dev-server child and prints how `next dev` terminated.

## Actual

```
[repro] `next dev` exit code : 0
[repro] `next dev` exit signal: null
[repro] mentioned the crash in output: false
```

## Expected

Non-zero exit code (conventionally `128 + signal`, i.e. `139` for SIGSEGV) and a message
stating the dev server process was killed by SIGSEGV.
