# Repro: current-time prerender error does not identify the source call

Next.js `16.4.0-canary.62`, Turbopack, Cache Components, dynamic route.

A user component (`components/clock.tsx`) renders a third-party component
(`time-lib`, installed into `node_modules`) that calls `Date.now()`.

## Run

```
npm install
npm run build
```

## Observed

```
Error: Route "/blog/[slug]": Next.js encountered the unstable value `Date.now()` while prerendering.
...
    at ignore-listed frames
```

The default production build output does not name any user component.

`npm run build:debug` (`next build --turbopack --debug-prerender`) does surface it:

```
    at Clock (components/clock.tsx:6:10)
```

## Expected

The default build output should point at the user component / source frame that
leads to the current-time call, as `--debug-prerender` already does.
