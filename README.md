# Repro: `polyfill-module` is bundled regardless of `browserslist` (vercel/next.js#98755)

Minimal App Router app on `next@16.4.0-canary.32` with modern-only browser targets:

```json
"browserslist": ["chrome >= 100", "safari >= 15", "firefox >= 100", "edge >= 100"]
```

## Run

```bash
npm install
npm run build            # Turbopack
npx next build --webpack # webpack
grep -rl trimLeft .next/static/chunks   # polyfill-module code is present
```

## Observed

* `next/dist/client/app-globals.js` unconditionally `require`s `../build/polyfills/polyfill-module`,
  so the polyfill code (`String.prototype.trimStart/trimEnd`, `Symbol.prototype.description`,
  `Array.prototype.flat/flatMap`, `Object.fromEntries`, `String.prototype.matchAll`, ...) lands in a
  chunk that modern browsers load and execute.
  * webpack: `static/chunks/794-*.js` and `static/chunks/main-*.js`
  * Turbopack: `static/chunks/3k_*.js`
* Identical output with `["chrome >= 130","safari >= 18","firefox >= 130","edge >= 130"]`, i.e.
  `browserslist` has no effect on this inclusion.
* Note on size: the legacy `polyfills-*.js` chunk (112 KB) is emitted with `noModule`, so modern
  browsers skip it. The actually-shipped `polyfill-module.js` is only 1380 bytes (596 B gzip),
  not the ~25 KB stated in the issue.
