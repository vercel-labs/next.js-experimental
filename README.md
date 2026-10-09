# Repro: `experimental.turbopackLazyDynamicImports` emits conflicting Turbopack assets in dev

Next.js `16.4.0-canary.48`, `next dev` (Turbopack), `experimental.turbopackLazyDynamicImports: true`.

## Setup

```bash
npm install
npx playwright install chromium   # only needed for the scripted run
npm run dev                       # terminal 1
```

## Steps (manual)

1. Open http://localhost:3000/a and click **load** (page `/a` statically imports `app/shared.js`
   and lazily `import('../heavy')`).
2. Open http://localhost:3000/b and click **load** (page `/b` lazily imports the same
   `app/heavy.js`, but does **not** statically import `app/shared.js`).

## Steps (scripted)

```bash
npm run repro   # drives both pages with Playwright
```

## Observed

The dev server repeatedly logs, for every subsequent update:

```
[Server HMR] Update failed, re-evaluating modules: [Error: conflicting effects for the same key (key length: 104 bytes)] {
  code: 'GenericFailure'
}
```

i.e. two different Turbopack assets are written to the same output path. The two lazy
dynamic-import manifest chunks for `app/heavy.js` get the same output file name
(`ManifestAsyncModule::ident()` is renamed to `*.lazy-compilation-<key>.js`, where the key only
hashes the proxy ident of the target module), yet their content differs because the two importing
entrypoints have different `availability_info` (`/a` already has `app/shared.js` available, `/b`
does not). Fast Refresh for the affected modules stops working.

## Expected

The dynamically imported module compiles and renders without conflicting emitted assets.

## Control

`LAZY=0 npm run dev` (experiment off) with the same steps produces no such error.
