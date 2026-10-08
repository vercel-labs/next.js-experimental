# Repro: third-party Client Component reading the time fails prerender (Cache Components)

Next.js 16.4.0, Turbopack, `cacheComponents: true`.

`fake-carousel` stands in for a carousel library's React wrapper: it constructs
its engine during render and stamps `Date.now()` on it. It is installed as a real
dependency (tarball), so its frames live in `node_modules`.

## Run

```
npm install
npx next build
```

## Observed

Build fails on `/static` with the unstable-current-time error. The whole stack is
collapsed to `at ignore-listed frames`, so neither the component nor the package is
named; the guidance points to `next dev`. `next build --debug-prerender` does name
`CarouselClient` / `StaticPage`, but still not the offending package frame.

Neither suggested fix applies: `<Suspense>` makes the page partly dynamic (the route
must stay fully static) and `useEffect` is inside library code.
