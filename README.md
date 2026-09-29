# Repro: metadata files validated as route handlers during type generation

Next.js `16.4.0-canary.52`.

## Steps

```bash
npm install
npx next dev            # let it boot (~15s), then stop it -> writes .next/dev/types/validator.ts
npx tsc --noEmit        # or: npx next build
```

## Observed

`.next/dev/types/validator.ts` validates App Router metadata files (`opengraph-image.tsx`,
`sitemap.ts`, `robots.ts`) against `RouteHandlerConfig`, so TypeScript fails:

```
.next/dev/types/validator.ts(63,31): error TS2559: Type 'typeof import(".../app/opengraph-image")' has no properties in common with type 'RouteHandlerConfig<"/opengraph-image">'.
.next/dev/types/validator.ts(72,31): error TS2559: Type 'typeof import(".../app/robots")' has no properties in common with type 'RouteHandlerConfig<"/robots.txt">'.
.next/dev/types/validator.ts(81,31): error TS2559: Type 'typeof import(".../app/sitemap")' has no properties in common with type 'RouteHandlerConfig<"/sitemap.xml">'.
```

The metadata files only export documented conventions (`default`, `alt`, `size`, `contentType`),
none of which are HTTP method exports, so the intersection with `RouteHandlerConfig` is empty.

## Expected

Metadata file conventions should be excluded from route-handler validation.

## Notes

- Standalone `npx next typegen` and a clean `next build` (`.next/types/validator.ts`) do **not**
  include metadata files, only the dev-server typegen output (`.next/dev/types/validator.ts`) does.
- Once `.next/dev/types` exists, `next build` also fails, because `tsconfig.json` includes
  `.next/dev/types/**/*.ts`.
- In `next/dist/server/lib/router-utils/typegen.js`, `generateValidatorFile` only filters metadata
  paths for `type !== 'AppPageConfig'`; the `RouteHandlerConfig` list is not filtered.
