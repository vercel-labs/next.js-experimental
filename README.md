# Repro: client `useEffect` + `new Date()` with `cacheComponents` (Next.js 16.4.0, Turbopack)

Investigation of the report "Client useEffect new Date() blocks prerender with cacheComponents".

## Run

```bash
npm install
npm run build          # next build --turbopack
```

## Result on next@16.4.0 (Turbopack, cacheComponents: true)

| Route | Pattern | `next build` |
| --- | --- | --- |
| `/effect-only` | `new Date()` only inside `useEffect(() => {...}, [])` | **passes**, prerendered as static |
| `/effect-deps` | `new Date()` in the `useEffect` *dependency array* | **fails** with `blocking-prerender-current-time-client` |

So the reported case (Date read only after mount) does **not** block the
prerender. The failing shapes are all render-time evaluations, even when they
visually sit inside the `useEffect(...)` call:

```
Error: Route "/effect-deps": Next.js encountered the unstable value `new Date()` in a Client Component.
...
    at <unknown> (app/effect-deps/clock.js:12:7)
> 12 |   }, [new Date().getDate()])
     |       ^
```

Other variants checked on 16.4.0, all of which build successfully:

- `new Date()` inside `useEffect`
- `new Date()` inside a `setInterval` started in `useEffect`
- `new Date()` in a helper function only called from `useEffect`
- `new Date()` inside `useLayoutEffect`
- `new Date()` inside `useEffect` of a custom hook

Variants that do fail (render-time reads):

- `new Date()` directly in the client component's returned JSX
- `useState(() => new Date())` initializer
- `new Date()` in the `useEffect` dependency array

To see only the passing case, delete `app/effect-deps` and rebuild.
