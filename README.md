# Prerender sync I/O diagnostic hides the source of an unstable `new Date()` read

Next.js `16.5.0-canary.3`, `next build --turbopack`, Cache Components enabled.

The application code never calls `new Date()`. A third-party dependency
(`packages/fake-db`, installed through `node_modules`) reads the current time
inside its own promise callback while serving an uncached database query from a
Server Component (`app/products/page.tsx`).

## Run

```bash
pnpm install
pnpm build            # add --debug-prerender for the second variant below
```

## Observed

```
Error: Route "/products": Next.js encountered the unstable value `new Date()` while prerendering.
...
    at ignore-listed frames
```

With `--debug-prerender` the only frame is `at Products (<anonymous>)` — still
no file, line, or mention of the dependency that read the clock.

## Expected

The diagnostic should point at the first actionable frame: the dependency
(`fake-db`) or the application call site (`app/products/data.ts`) that triggered
the current-time read.

## Note

If the dependency reads the clock synchronously in the same call stack
(`return [{ fetchedAt: new Date().toISOString() }]` without a `.then`), the
diagnostic does attribute it to `app/products/data.ts:5` correctly. The frames
are lost only when the read happens in a dependency-owned promise callback.
