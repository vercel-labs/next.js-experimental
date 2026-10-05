# SSR `RangeError: Maximum call stack size exceeded` logged with `at ignore-listed frames`

Reproduces https://next-maintainer-agent.vercel.tools/api/integrations/dx-agent/feedback/8
on `next@16.4.0-canary.38` (App Router, `next dev`, Turbopack).

## Run

```bash
npm install
npm run dev
# contrast case: overflow thrown by application code (stack is useful)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/overflow
# bug case: overflow thrown inside React internals (no usable stack)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/overflow-react
```

## Observed dev server output

`/overflow` (app-code recursion) prints app frames and a code frame:

```
⨯ RangeError: Maximum call stack size exceeded
    at recurse (app/overflow/lib.ts:3:3)
    ... collapsed 48 duplicate lines matching above 1 lines 48 times...
```

`/overflow-react` (deeply nested element tree, overflow raised inside the React
Flight runtime) prints no frame at all:

```
⨯ RangeError: Maximum call stack size exceeded
    at ignore-listed frames {
  digest: '4272681846'
}
 GET /overflow-react 500 in 13.3s
```

Running the same request with `__NEXT_SHOW_IGNORE_LISTED=true` shows that every
captured frame lives in ignore-listed Next.js-bundled React code, which is why
`patch-error-inspect.ts` collapses the whole stack to `at ignore-listed frames`:

```
⨯ RangeError: Maximum call stack size exceeded
    at initializeModelChunk (webpack://next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.node.development.js:2087:14)
    at getOutlinedModel (.../react-server-dom-turbopack-client.node.development.js:2664:11)
    at reviveModel (.../react-server-dom-turbopack-client.node.development.js:3083:5)
    ... collapsed 42 duplicate lines matching above 7 lines 6 times...
```

## Expected

The log should retain at least one frame (or the raw stack) identifying where
the overflow originated, instead of an empty `at ignore-listed frames` stack.
