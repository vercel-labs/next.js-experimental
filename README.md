# Repro: third-party Client Component reading the time fails prerender under Cache Components

Next.js 16.4.0 (Turbopack), `cacheComponents: true`, `partialPrefetching: true`.

`packages/fake-carousel` stands in for a popular carousel library's React wrapper:
it constructs its engine **during render** and stamps it with `Date.now()` /
`new Date()`. `scripts/postinstall.js` copies it into `node_modules/` as real
files (npm would otherwise symlink a `file:` dep, and symlinked sources are not
ignore-listed), so its frames are ignore-listed exactly like a published package.

## Run

```bash
npm install
npm run build                      # fails: "at ignore-listed frames", no component or package named
npx next build --debug-prerender   # names CarouselClient / <Carousel>, still never names the package
npm run dev                        # then open /carousel: same error in log + overlay
```

## Observed with `npm run build`

```
Error: Route "/carousel": Next.js encountered the unstable value `Date.now()` in a Client Component.

This value would be evaluated during the prerender, instead of recomputed on each visit.

Ways to fix this:
  - [stream] Wrap the Client Component in `<Suspense fallback={...}>`
  - [defer] Move the read into a `useEffect` or event handler
  - [measure] If the value is for telemetry, use a timing API such as `performance.now()`

Learn more: https://nextjs.org/docs/messages/blocking-prerender-current-time-client
    at ignore-listed frames
```

Neither offered fix is applicable: the read lives inside library render code
(cannot be moved into `useEffect`), and `<Suspense>` makes the route partly
dynamic when it is required to stay fully static. The message never names the
offending component or package in the default build.
