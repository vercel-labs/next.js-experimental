# Repro: `next build` logs `cookies()` HANGING_PROMISE_REJECTION for dynamic API routes

Next.js 16.4.0, Turbopack (default), Cache Components enabled.

## Run

```
npm install
npm run build
```

## Expected

The build finishes without prerender rejection errors for a request-time `cookies()` read
in a dynamic route handler.

## Actual

During `Generating static pages`, the build logs (twice) an error with
`digest: 'HANGING_PROMISE_REJECTION'`:

> During prerendering, `cookies()` rejects when the prerender is complete. ... This occurred at route "/api/profile".

The error is delivered into the route handler's own `try/catch` (so it reaches app-level
error reporting), the build still exits 0 and `/api/profile` is correctly listed as `ƒ (Dynamic)`.
