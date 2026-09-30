# Repro: metadata files validated as route handlers during type generation

next@16.4.0-canary.52

## Run

```bash
npm install
npx next dev            # let it compile "/" once, then stop it
npx tsc --noEmit
```

or `./repro.sh`

## Expected

Metadata file conventions (`opengraph-image.tsx`, `icon.tsx`, `sitemap.ts`, `robots.ts`)
are excluded from ordinary route-handler validation.

## Actual

`.next/dev/types/validator.ts` (written by the dev bundler) validates every metadata
file against `RouteHandlerConfig`, so `tsc` fails:

```
.next/dev/types/validator.ts(72,31): error TS2559: Type 'typeof import(".../app/blog/[slug]/opengraph-image")' has no properties in common with type 'RouteHandlerConfig<"/blog/[slug]/opengraph-image">'.
.next/dev/types/validator.ts(81,31): error TS2559: ... app/icon ... RouteHandlerConfig<"/icon">
.next/dev/types/validator.ts(90,31): error TS2559: ... app/opengraph-image ... RouteHandlerConfig<"/opengraph-image">
.next/dev/types/validator.ts(99,31): error TS2559: ... app/robots ... RouteHandlerConfig<"/robots.txt">
.next/dev/types/validator.ts(108,31): error TS2559: ... app/sitemap ... RouteHandlerConfig<"/sitemap.xml">
```

The metadata modules only export the documented `default` / `alt` / `size` /
`contentType`, which share no properties with the `GET?/POST?/...` handler shape.

## Notes

- `next typegen` and `next build` write `.next/types/validator.ts` and correctly omit
  metadata files. Only the dev-bundler path (`.next/dev/types/validator.ts`) is affected.
- In `packages/next/src/server/lib/router-utils/typegen.ts`, `generateValidations()`
  only filters metadata files for `AppPageConfig`, not for `RouteHandlerConfig`.
- In `setup-dev-bundler.ts` metadata pages are normalized to `<route>/route`, so
  `isAppRouteRoute(appPath)` is true and they are pushed into `appRouteHandlers`.
