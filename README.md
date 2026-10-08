# Repro: `turbopackLazyDynamicImports` emits different chunk-list content to the same output path (dev)

Next.js `16.4.0`, `next dev --turbopack`, `experimental.turbopackLazyDynamicImports: true`.

## Run

```bash
npm install
rm -rf .next
npm run dev
# open http://localhost:3000 in a browser (the lazy dynamic import must actually be activated)
```

`GET /` returns **500** and the browser shows a full-page Build Error:

```
Two or more assets with different content were emitted to the same output path
file content differs, written to:
  [output]/.next/dev/b0cedfef26fb8772.js
  [output]/.next/dev/019086124b66ee8a.js
```

Several of these are reported; all of them are *dynamic* chunk lists
(`source: "dynamic"`) for the `React.lazy` targets inside `streamdown`
(`highlighted-body-*.js` for code highlighting and `mermaid-*.js` for diagrams).
The two colliding files list different chunk arrays, e.g. one lists a single
chunk and the other lists ~20.

## Shape

* `app/layout.jsx` (server) renders `components/Parent1.jsx` (client), which
  `next/dynamic`-imports `components/MdView.jsx` -> `streamdown`.
* `app/page.jsx` (server) renders `components/StaticMd.jsx` (client), which
  imports `streamdown` **statically**.

The two client-reference segments give the `streamdown` `React.lazy()` call
sites two different availability infos, so two `ManifestAsyncModule`s are
created for the same inner module. Their manifest chunks get distinct file
names (the availability hash is part of `content_ident`), but
`EcmascriptDevChunkList::path()` is derived from `ManifestAsyncModule::ident()`,
which carries no availability modifier -> both chunk lists are emitted to the
same output path with different contents.

Setting `experimental.turbopackLazyDynamicImports: false` makes the error go away.
