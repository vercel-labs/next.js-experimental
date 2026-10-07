# Repro: Bun runtime build reports `useSearchParams()` outside `<Suspense>` when it is inside `<Suspense>`

Next.js 16.4.0 · Turbopack · `cacheComponents: true`

`app/page.js` renders the client component `app/search-params.js` (which calls
`useSearchParams()`) inside `<Suspense fallback={null}>`.

## Run

```bash
npm install

# Clean (expected)
npx next build

# Bug: logs `CLIENT_HOOK_DYNAMIC` / blocking-prerender-client-hook, still exits 0
bun --bun next build

# Also clean: bun CLI with the Node runtime (no --bun)
bun next build
```

## Observed with `bun --bun next build` (Bun 1.4.2)

```
Error: Route "/": Next.js encountered URL data `useSearchParams()` in a Client Component outside of `<Suspense>`.
...
  digest: 'CLIENT_HOOK_DYNAMIC'
✓ Generating static pages using 1 worker (3/3)
Route (app)
┌ ○ /
```

The build succeeds (exit 0), the route is still listed as `○ (Static)`, and the
prerendered `index.html` correctly contains only the shell, so the error log is
spurious and specific to the Bun JS runtime.
