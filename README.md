# Repro: client style cache `Math.random()` blocks prerender under Cache Components

Next.js 16.4.0, App Router, Turbopack, `cacheComponents: true`.

The root layout renders a **Client Component** style provider that creates a per-render
cache id with `Math.random()` inside `useState` — the exact shape of
`@ant-design/nextjs-registry`'s `AntdRegistry` (`useState(() => createCache())`,
where `@ant-design/cssinjs`'s `createCache()` does `Math.random().toString(12).slice(2)`).

## Run

```bash
npm install
npm run dev   # then open http://localhost:3000
# or
npm run build
```

## Observed (Next.js 16.4.0)

`next dev` terminal + browser console:

```
Error: Route "/": Next.js encountered the unstable value `Math.random()` in a Client Component.

This value would be evaluated during the prerender, instead of recomputed on each visit.

Ways to fix this:
  - [stream] Wrap the Client Component in `<Suspense fallback={...}>`
  - [defer] Move the read into a `useEffect` or event handler

Learn more: https://nextjs.org/docs/messages/blocking-prerender-random-client
    at StyleProvider (app/style-provider.tsx:9:27)
    at RootLayout (app/layout.tsx:7:9)
```

`next build` fails the same way while prerendering (`/_not-found`, `/`).

Neither suggested fix is actionable for a root-layout style registry: the provider must
wrap the whole tree (so `<Suspense>` would suspend the entire app) and the cache object is
needed during SSR (so `useEffect` is too late).
