# Repro: metadata files validated as route handlers during type generation

Next.js `16.4.0-canary.52`.

`app/opengraph-image.tsx` exports the documented metadata config (`alt`, `size`,
`contentType`) plus a default image function. The dev-server type generator adds
it to `appRouteHandlers`, so `.next/dev/types/validator.ts` asserts the module
against `RouteHandlerConfig` (which only allows `GET`/`POST`/... exports).

## Run

```bash
./repro.sh
```

## Actual

```
.next/dev/types/validator.ts(63,31): error TS2559: Type 'typeof import(".../app/opengraph-image")'
  has no properties in common with type 'RouteHandlerConfig<"/opengraph-image">'.
```

Generated block:

```ts
// Validate ../../../app/opengraph-image.tsx
{
  type __IsExpected<Specific extends RouteHandlerConfig<"/opengraph-image">> = Specific
  const handler = {} as typeof import("../../../app/opengraph-image.js")
  type __Check = __IsExpected<typeof handler>
}
```

## Expected

Metadata file conventions (`opengraph-image`, `twitter-image`, `icon`, ...) should be
excluded from `RouteHandlerConfig` validation.

## Notes

* `next typegen` and a clean `next build` emit `.next/types/validator.ts` **without**
  the metadata entry and pass. Only the dev server's `.next/dev/types/validator.ts`
  contains it.
* Because `tsconfig.json` includes `.next/dev/types/**/*.ts`, a subsequent
  `next build` (or editor/`tsc`) in the same workspace also fails.
* `generateValidatorFile` in `next/dist/server/lib/router-utils/typegen.js` filters
  metadata routes only for `AppPageConfig`, not for `RouteHandlerConfig`.
