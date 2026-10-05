# variant-barrel: stale server-only module via barrel re-exports (NOT reproduced)

Next.js 16.4.0-canary.37, Turbopack dev, `cacheComponents: true`, `proxy.ts`, `src/` + barrel files.

Attempted report: "dev server keeps serving a stale server-only module after a new export is added;
page fails with `X is not a function` until `next dev` is restarted".

## Run
    npm install
    ./start.sh              # next dev --turbopack -p 3103
    node loop3.mjs          # 32 edit/request iterations, asserts fresh export output

`loop3.mjs` cycles: add new export to `src/lib/data.ts` (leaf with `import 'server-only'`),
then import/call it from pages via the `@/lib` barrel. Orders covered: leaf-first, page-first,
both-at-once, barrel-last, barrel-first, edit while a request is in flight, rapid-fire writes,
add/remove/re-add, with both `export *` and explicit named re-export barrels.

## Result
60 iterations total (`loop.mjs` 28 + `loop3.mjs` 32): every request returned 200 with the newly
added export's output. Transient `Export newFnN doesn't exist in target module` 500s appear only
when the page is edited before the leaf, and always self-heal within ~1s. No restart was ever needed.
