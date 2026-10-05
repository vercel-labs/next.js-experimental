# Stale `.next/server/route-cache` entries survive an in-place deploy (Next >= 16.3.8)

Repro for https://github.com/vercel/next.js/issues/99680.

Since 16.3.8 (#99482), `next start` writes prerendered responses to
`.next/server/route-cache/<KIND>/<sha256(sourceRoute)>/$/<pathname>.{html,rsc,meta,...}`.
The key depends only on route kind, source route and pathname — not on the build
ID — and the directory is created at runtime, so it is not part of the build
output. A deploy that patches `.next` in place (rsync / DeployHQ non-atomic,
uploading changed files and deleting removed ones) leaves the previous build's
entries behind, and they win over the new `.next/server/app/index.html`.
The server then returns the old HTML, which references chunks that no longer exist.

## Run

```bash
npm install
./repro.sh           # test 16.3.8 (default)
npm install next@16.3.7 && ./repro.sh   # control: passes
npm install next@16.4.0-canary.60 && ./repro.sh   # also fails
```

`repro.sh` builds v1, rsyncs `.next/` into `../server/.next/` with
`--delete --exclude=/cache --exclude=/server/route-cache` (the runtime-written
cache is not touched by the deploy), runs `next start` there and requests `/`.
It then changes the page to v2, builds, syncs and restarts, and requests `/` again.
Every server runs in its own process group and is torn down with the port
verified free before the next step (the original script leaked the `next-server`
grandchild, so the second request could hit the first server and produce the same
symptom on every version).

## Observed

| next              | served after deploying v2 | referenced chunks returning 404 |
| ----------------- | ------------------------- | ------------------------------- |
| 16.3.7            | Build v2                  | 0                               |
| 16.3.8            | **Build v1**              | 1                               |
| 16.4.0-canary.60  | **Build v1**              | 1                               |

On the failing versions `../server/.next/server/app/index.html` contains
"Build v2" while `../server/.next/server/route-cache/APP_PAGE/<hash>/$/index.html`
still contains "Build v1". Deleting `.next/server/route-cache` before starting
makes the server serve v2 with all chunks 200.
