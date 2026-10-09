# Repro: `useRouter()` crashes in Storybook's App Router mock on Next.js 16.4.0

In 16.4.0 `useRouter()` reads `layout?.parentRenderTree.data.bfcacheId`
(`next/dist/client/components/navigation.js`). The optional chain stops at `layout`,
so any `LayoutRouterContext` value without `parentRenderTree` throws.
`@storybook/nextjs-vite`'s app-directory router mock provides
`{ childNodes, tree, parentTree, parentCacheNode, url, loading }` — no `parentRenderTree`.

## Run

```bash
npm install
npm test
```

## Result

- next@16.4.0 → `TypeError: Cannot read properties of undefined (reading 'data')`
  thrown from `useRouter` (first hit inside Next's own `RedirectBoundary`, which the
  Storybook routing decorator renders).
- next@16.3.0 → passes.

The test renders a trivial story via portable stories, which runs the framework's
`appDirectory` router-mock decorator exactly as Storybook does.
`sb-image-context-stub.js` only stands in for the `sb-original/image-context` alias
that the Storybook builder normally injects; it is unrelated to the crash.
