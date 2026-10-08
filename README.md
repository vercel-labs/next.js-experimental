# Turbopack dev: global stylesheet edit lost when it races the initial page load

Next.js 16.4.0, App Router, `next dev --turbopack`.

## What happens

If `app/globals.css` is edited while the browser is still performing the initial
load of the route (roughly within the first ~500 ms of navigation, before the
Turbopack HMR subscription has established its baseline), that edit is **never
delivered to the page**. The page keeps the pre-edit stylesheet indefinitely even
though `[HMR] connected` is logged and the dev server already serves the updated
CSS chunk. Only a manual reload (or a dev-server restart) shows the new rules.

Edits made later, while the page is idle, are applied normally — so only the
raced edit is silently dropped.

Running the same script with `--webpack` applies the raced edit, so this is
Turbopack-specific.

## Run

```bash
npm install
npx playwright install chromium
node repro.mjs                 # turbopack
BUNDLER=webpack node repro.mjs # control
```

## Observed output (next@16.4.0)

```
bundler=--turbopack
edit 1 (raced with initial load) -> browser color: rgb(1, 2, 3) (expected rgb(9, 9, 9))
dev server css chunk contains ".after-edit": true
edit 2 (idle) -> browser color: rgb(20, 20, 20) (expected rgb(20, 20, 20))
after manual reload -> browser color: rgb(20, 20, 20)
browser console: ... | [HMR] connected | [Fast Refresh] rebuilding | [Fast Refresh] done in 3ms
```

```
bundler=--webpack
edit 1 (raced with initial load) -> browser color: rgb(9, 9, 9) (expected rgb(9, 9, 9))
```

`OFFSET` controls how long after navigation starts the edit happens. Offsets of
0/50/100/200/400 ms reproduce; 800/1500 ms do not.
