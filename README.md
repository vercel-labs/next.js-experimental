# Repro: Turbopack dev — route handler compiled after N pages costs ~16 MB × N

Mirror of https://github.com/danielcizin/next-16-3-route-handler-memory-repro for
https://github.com/vercel/next.js/issues/98707, with `drive2.mjs`: a Linux port of the driver
(reads `/proc/<pid>/statm` instead of `lsof`/`ps`, and prints RSS after **every** route).

```bash
npm install                       # pin the version under test, e.g. npm i next@16.3.4
PAGES=20 HANDLERS=4 node gen.mjs
node drive2.mjs pages-first       # fresh .next, next dev, GET every page, then every handler
node drive2.mjs handlers-first
```

## Measured here (Linux x64, Node 24.20.0, 2 cores, 4 GB RAM)

RSS of the whole `next dev` process tree; per-handler delta after the pages are warm:

| next | PAGES/HANDLERS | order | per-handler delta | final RSS |
|---|---|---|---|---|
| 16.3.4 | 20 / 4 | pages-first | 318, 316, 334 MB | 1888 MB |
| 16.3.4 | 20 / 4 | handlers-first | 22, 22, 23 MB | 968 MB |
| 16.3.4 | 40 / 2 | pages-first | 663 MB | 1809 MB |
| 16.3.0-canary.101 | 20 / 3 | pages-first | 335, 316 MB | 1556 MB |
| 16.3.0-canary.100 | 20 / 3 | pages-first | 8, 7 MB | 893 MB |
| 16.2.6 | 20 / 4 | pages-first | 7, 7, 9 MB | 1236 MB |

~16 MB per already-compiled page per handler; doubling the pages doubles the per-handler cost.
First bad version confirmed: `16.3.0-canary.101`.
