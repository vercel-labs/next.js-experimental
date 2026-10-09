# Repro: current-time prerender error does not identify the source call

Next.js `16.4.0-canary.62`, Turbopack, Cache Components, dynamic route.

A downstream component in a third-party package (`ui-lib`, physically installed under
`node_modules`, so its frames are ignore-listed) reads `Date.now()` while the dynamic
route `/blog/[slug]` is prerendered during `next build`.

## Run

```sh
npm install
npm run build
```

## Observed

The build fails and attributes the error to the route only:

```
Error: Route "/blog/[slug]": Next.js encountered the unstable value `Date.now()` while prerendering.
...
    at ignore-listed frames
```

No user component is named. `npm run build:debug` (`next build --debug-prerender`)
does identify the owner:

```
    at CurrentTime (components/CurrentTime.tsx:5:10)
```

## Expected

The default build output should point at the user component / source frame that
leads to the current-time call.
