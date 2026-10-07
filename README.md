# `inert` hydration mismatch in a streamed client subtree — minimal reproduction

Setup: Next.js `16.5.0-canary.2`, dev mode, Turbopack, `cacheComponents: true`,
`partialPrefetching: true`, `<Suspense>` around an async server component that
renders a client component, plus `<Activity mode="hidden">` inside that client
component. React 19.2.

## Run

```bash
npm install
npx playwright install chromium
npm run dev            # terminal 1 (next dev --turbopack)
node repro.mjs                 # control  -> exits 0, no hydration message
node repro.mjs third-party     # mutation -> exits 1, hydration diff shows `- inert=""`
```

## Result

* **Control (framework only):** navigating `/` -> `/other` with Cache Components,
  Partial Prefetching, Suspense streaming and hidden Activity produces **no**
  hydration message and **no** `inert` attribute anywhere in the DOM.
* **`third-party` variant:** an inline script (simulating a focus-trap/`markOthers`
  style a11y library or a browser extension) sets `inert` on nodes as they are
  inserted, before React hydrates them. React then reports:

  ```
  A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
  ...
    <ClientBox label="home">
      <div id="box-home" className="box"
  -     inert=""
      >
  ```

  i.e. the diff attributes `inert` to the *server* markup even though no component
  ever passes an `inert` prop. It happens both for the shell-rendered client
  component (`#box-shell`) and for the late-streamed one inside `<Suspense>`
  (`#box-home`), so streaming/Activity is not required.

## Notes

`inert` is never emitted by Next.js: grepping `packages/next/src` (and the bundled
`react-dom` server builds) in 16.5.0-canary.2 finds only comments and the generic
attribute tables. React's SSR does not render hidden `<Activity>` content at all
(`REACT_ACTIVITY_TYPE` with `mode="hidden"` is skipped in `react-dom-server`), so it
cannot emit `inert` either.
