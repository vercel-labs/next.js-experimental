# Repro: explicit `runtime` route segment config conflicts with `cacheComponents` (Next.js 16.4.0)

## Run

```bash
npm install
npm run build
```

## Expected

Build succeeds, or the error explains a supported way to declare the Node.js runtime.

## Actual

```
Error: Turbopack build failed with 1 error:
./app/api/hello/route.ts:1:14
Error: Route segment config "runtime" is not compatible with `nextConfig.cacheComponents`. Please remove it.
> 1 | export const runtime = 'nodejs'
```

Removing `export const runtime = 'nodejs'` from `app/api/hello/route.ts` makes the build succeed.
Same error occurs with `next build --webpack`.
