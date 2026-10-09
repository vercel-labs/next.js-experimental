# Repro: no-JS server action postback loops forever when the action is bound inside a client component render

Next.js 16.4.0, React 19.2.0, App Router, `next dev --turbopack`.

`app/form.tsx` calls `useActionState(submit.bind(null, arg), null, '/permalink')` — the bound
action is created during render, so its bound-args promise is a new reference on every render.

## Run

```bash
npm install
npm run dev                            # next dev --turbopack -p 3000
curl http://localhost:3000/permalink   # renders the form with the $ACTION_* hidden fields
bash post.sh                                 # no-JS (progressive enhancement) multipart POST of that form
```

### Observed
`bash post.sh` never receives a response. The dev server pins a CPU core and its heap grows without
bound until it dies: `FATAL ERROR: Ineffective mark-compacts near heap limit - JavaScript heap out
of memory` (the reporter saw `RangeError: Map maximum size exceeded` in `isSignatureEqual`).
No `POST /permalink` line is ever logged.

### Control (works)
`app/stable/` is identical except the action is bound once at module scope:

```bash
bash post-stable.sh   # HTTP/1.1 200 OK, payload contains {"boundArg":"bound-value","name":"world"}
```

### Expected
The postback renders the page with the returned action state, or fails with a clear error that the
bound action must be stable across renders.
