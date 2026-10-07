# Repro: client-rendering bailout outside Suspense names no component

Next.js 16.4.0, Turbopack, production build, `cacheComponents: true`,
`partialPrefetching: true`, `export const instant = false` on every page/layout.

## Run

```bash
npm install
npm run build                 # fails on /a
npm run build:debug-prerender # --debug-prerender: fails on /a and /c, still unnamed
```

## Routes

- `app/a/page.tsx` -> client component calling `useSearchParams()` in the shell, no Suspense -> FAILS
- `app/b/page.tsx` -> client component calling `usePathname()` -> builds fine
- `app/c/page.tsx` -> client component calling `Math.random()` during render -> FAILS

## Observed

```
Error occurred prerendering page "/a". Read more: https://nextjs.org/docs/messages/prerender-error
Error: The server render could not complete because client rendering was requested outside a Suspense boundary. See this error's cause for additional details.
    at ignore-listed frames {
  [cause]: {
    '$$typeof': Symbol(next.browser-bailout-reason),
    reason: 'Render in Browser'
  }
}
```

No component, hook, or file name is reported, and the stack is fully
ignore-listed. `--debug-prerender` (which enables `serverSourceMaps` and
disables minification/early-exit) reports all failing routes but adds no
owner/component information.
