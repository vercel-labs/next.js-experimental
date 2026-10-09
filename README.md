# Turbopack: build fails on `new Worker(new URL(variable, import.meta.url))` in a dependency

Next.js 16.4.0. `packages/fake-worker-lib` mimics a popular ESM package that
creates a worker from a caller-supplied URL option in a conditional branch,
with a static-path fallback. The app dynamically imports it from a client
component and never passes `workerUrl`.

## Run

```bash
npm install
npx next build          # ✗ fails (Turbopack)
npx next build --webpack # ✓ succeeds
```

## Actual (Turbopack)

```
./packages/fake-worker-lib/index.js:6:23
Error: Module not found: Can't resolve (<dynamic> | 'undefined')
> 6 |     return new Worker(new URL(options.workerUrl, import.meta.url), {
```

## Expected

A non-static `new URL()` argument should be deferred to runtime (a warning at
most, as webpack does) instead of failing the production build.
