# Turbopack: build over a persistent cache from a different compile pipeline (issue #99579)

Scaled-down, Docker-free adaptation of https://github.com/kristoferma/turbopack-stale-cache-repro
so it fits a 2-core / 4 GiB Linux container. `measure.sh` samples the cgroup's
`memory.current` while `next build` runs and prints wall time, peak, Turbopack cache size
and the reported "Compiled successfully in".

## Run

```bash
ROUTES=40 COMPONENTS=10 node generate.mjs   # 400 components, all importing `fake-macro`
npm install --no-audit --no-fund
export REACT_COMPILER=1
LOADER=off ./measure.sh off-cold clean   # cold, no loader rule
LOADER=on  ./measure.sh on-stale         # loader rule added, reuses .next/cache from above
LOADER=on  ./measure.sh on-cold   clean  # same pipeline as on-stale, empty cache
LOADER=on  ./measure.sh on-warm          # control: warm over a SAME-pipeline cache
```

## Observed (next 16.4.0-canary.57, 400 components, 2 cores, 4 GiB)

| build | Compiled | peak | turbopack cache |
|---|---|---|---|
| off-cold | 16.9 / 17.2 s | 1.75 / 1.78 GiB | 31 MB |
| **on-stale** (cache from other pipeline) | **45 / 40 s** | 2.13 GiB | 40 MB |
| on-cold (same pipeline, no cache) | 27.0 / 25.0 s | 2.27 / 2.23 GiB | 36 MB |
| on-warm (same pipeline, warm cache) | **0.755 s** | 1.32 GiB | 36 MB |

Building over a cache produced by a different pipeline takes ~1.7x longer than building
with no cache at all, while a same-pipeline warm build of the identical output takes <1 s.

On next 16.3.6 the same matrix still yields a (small) win for the stale cache
(on-stale 21.5 s vs on-cold 26.2 s) but the cache grows 41 MB -> 55 MB,
i.e. the invalidated entries are retained.
