# Repro: `next build` logs `cookies()` HANGING_PROMISE_REJECTION for dynamic route handlers

Next.js 16.4.0, Turbopack, `cacheComponents: true`.

## Run

```bash
npm install
npm run build
```

## Expected

Build finishes without prerender rejection errors for request-time `cookies()`
in a dynamic route handler.

## Actual

During "Generating static pages", the build prints:

```
[getSession] failed to read cookies Error: During prerendering, `cookies()` rejects when the prerender is complete. ...
  This occurred at route "/api/user".
  { route: '/api/user', expression: '`cookies()`', digest: 'HANGING_PROMISE_REJECTION' }
```

The build still exits 0 and lists `/api/user` as `ƒ (Dynamic)`.

Notes:
- The rejection is only observable because the helper wraps `cookies()` in
  `try/catch` (a very common "optional session" pattern). Without the
  `try/catch` the same abort is swallowed by Next.js.
- Moving the same helper into `after()` turns the identical
  `HANGING_PROMISE_REJECTION` into a hard build failure
  (`Export encountered an error on /api/<route>/route, exiting the build.`).
