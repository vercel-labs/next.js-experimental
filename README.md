# Repro: App Router metadata files are validated as route handlers during type generation

Next.js `16.4.0-canary.52`.

## Run

```bash
npm install
./repro.sh
# or manually:
#   npx next dev   (hit /, /opengraph-image, /icon, /sitemap.xml, then stop it)
#   npx tsc --noEmit
```

## Expected

Metadata file conventions (`opengraph-image`, `icon`, `sitemap`, ...) are excluded from
ordinary route-handler validation; real route handlers (`app/api/hello/route.ts`) keep
being validated.

## Actual

`.next/dev/types/validator.ts` emits `RouteHandlerConfig<...>` validations for the
metadata files, so documented metadata exports (`alt`, `size`, `contentType`, default
export) fail type checking:

```
.next/dev/types/validator.ts(72,31): error TS2559: Type 'typeof import(".../app/icon")' has no properties in common with type 'RouteHandlerConfig<"/icon">'.
.next/dev/types/validator.ts(81,31): error TS2559: Type 'typeof import(".../app/opengraph-image")' has no properties in common with type 'RouteHandlerConfig<"/opengraph-image">'.
.next/dev/types/validator.ts(90,31): error TS2559: Type 'typeof import(".../app/sitemap")' has no properties in common with type 'RouteHandlerConfig<"/sitemap.xml">'.
```

`next build` also fails (`Failed to type check.`) once `.next/dev/types` exists, because
`tsconfig.json` includes `.next/dev/types/**/*.ts`.

## Notes

- A clean `next build` / `next typegen` (which writes `.next/types/validator.ts`) does
  **not** include the metadata files — only the dev-mode manifest does.
- In `packages/next/src/server/lib/router-utils/typegen.ts`, the
  "Don't include metadata routes or pages" filter is gated on
  `type !== 'AppPageConfig'`, so it never applies to `RouteHandlerConfig`.
