# Repro: vercel/next.js#99674 — MapLibre worker fails to load with Turbopack

Mirror of https://github.com/a-waider/turbopack-bug-report (package-lock.json removed: it
pointed at a private registry and blocked `npm install`). next pinned to 16.4.0-canary.60.

## Run

```bash
npm install
npm run dev            # Turbopack (default in Next 16)
# open http://localhost:3000
```

## Observed (Turbopack dev)

`new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)` emits
`/_next/static/media/maplibre-gl-worker.<hash>.mjs` (200 OK), but the emitted asset still
contains the *unhashed* relative import `from "./maplibre-gl-shared.mjs"`, which 404s:

```
[response 200] /_next/static/media/maplibre-gl-worker.28o139oay2s87.mjs
[response 404] /_next/static/media/maplibre-gl-shared.mjs
[console.error] Error: Worker failed to load. Check that the worker URL is correct.
```

Turbopack does emit the hashed sibling (`maplibre-gl-shared.15t8rcx3psmo2.mjs`) but does not
rewrite the import specifier inside the emitted worker module.

## Observed (`next dev --webpack`)

Build error instead:
`Module not found: ESM packages (maplibre-gl/dist/maplibre-gl-worker.mjs) need to be imported.`
