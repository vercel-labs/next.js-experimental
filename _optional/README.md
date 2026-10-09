# Optional variant: slow dynamic import WITHOUT `loading`

Copy `shell-slow-no-loading.js` into `components/` and create
`app/slow-no-loading/page.js` importing it, then run `next build --turbopack`.

Observed on next@16.4.0 with `cacheComponents: true`: the build FAILS with

    Error: Route "/slow-no-loading": Next.js encountered uncached or runtime data during prerendering.
    ...
        at Lazy (<anonymous>)
        at LoadableComponent (<anonymous>)

i.e. without `loading`, `next/dynamic` has no Suspense boundary of its own and
the lazy import suspends the parent/route boundary.
