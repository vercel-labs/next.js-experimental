# Repro: client-rendering bailout outside Suspense names no component

Next.js 16.4.0, Cache Components, production build.

`app/instant-false/random/client.tsx` is a client component that calls
`Math.random()` in the route shell, outside any Suspense boundary.

## Run

```bash
npm install
npm run build            # next build --turbopack
npm run build:debug      # next build --turbopack --debug-prerender
```

## Observed

Both builds fail with:

```
Error occurred prerendering page "/instant-false/random".
Error: The server render could not complete because client rendering was requested outside a Suspense boundary. See this error's cause for additional details.
    at ignore-listed frames {
  [cause]: {
    '$$typeof': Symbol(next.browser-bailout-reason),
    reason: 'Render in Browser'
  }
}
```

No component, hook or file is named, even with `--debug-prerender`
(`serverSourceMaps` enabled). The same output is produced by the webpack build.

For contrast, `use(browser())` from `react-dom` in the same position does
produce a source frame (`at <unknown> (app/.../client.tsx:7:3)` with a code
frame), so only the implicit `Math.random()` bailout is unattributed.
