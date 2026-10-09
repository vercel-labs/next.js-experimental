# Repro: Build summary Revalidate/Expire columns vs prerender-manifest (feedback #106)

Scenario from the report: Cache Components + Turbopack + Partial Prefetching, root layout calls a
`"use cache"` function whose only lifetime is an inline `cacheLife({ revalidate: 3 * 60 * 60 })`;
pages read other data without `"use cache"`.

Run:

    npm install
    npx next build
    node check.mjs

Result on next@16.4.0 (also 16.3.0 and 16.5.0-canary.5): the route table DOES print the
`Revalidate` / `Expire` columns (`3h` / `1y`) and they agree with
`.next/prerender-manifest.json` (`initialRevalidateSeconds: 10800`, `initialExpireSeconds: 31536000`).

Variants additionally tried without reproducing the reported omission:
dynamic page data via `connection()` inside `<Suspense>`, uncached `fetch`, `export const instant = false`,
dynamic routes with and without `generateStaticParams`, root-param style `[lang]` segments,
route groups + parallel route slot, `partialPrefetching` on/off.

Note (code reading, not reproduced): `printTreeView` in `packages/next/src/build/utils.ts` decides
column visibility only from `pageInfos.get(page).initialCacheControl` of top-level entries, so a
dynamic page whose own `initialCacheControl` is falsy while only its generated child paths carry a
revalidate would hide the columns even though the manifest records them.
