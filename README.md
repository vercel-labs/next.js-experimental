# `@next/next/no-img-element` fires inside `opengraph-image` (metadata route)

Next.js 16.4.0 / eslint-config-next 16.4.0.

`@next/eslint-plugin-next`'s `no-img-element` rule exempts metadata image routes, but the
exemption is computed from a *string* path relative to the ESLint `cwd`:

```js
const relativePath = context.filename.replace(path.sep, '/').replace(context.cwd, '').replace(/^\//, '')
const isAppDir = /^(src\/)?app\//.test(relativePath)
if (isAppDir && /\/opengraph-image|twitter-image|icon\.\w+$/.test(relativePath)) return
```

So the exemption only applies when the app directory is `app/` or `src/app/` directly
under the ESLint cwd. Any app that is not at the lint root (monorepo / `apps/web`,
or simply running `eslint` from the repository root) still gets the warning,
even though `ImageResponse` requires a plain `<img>`.

## Reproduce

```bash
npm install
npm run lint          # ❌ warns on apps/web/app/opengraph-image.tsx
npm run lint:from-app # ✅ no warning (same file, cwd = apps/web)
```
