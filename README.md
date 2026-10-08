# Repro: no-JS server action postback loops forever when the action is bound inside a client component render

Next.js **16.4.0**, `next dev --turbopack`, React 19.2.0.

## Run

```bash
npm install
npm run dev            # terminal 1 (keep the log visible)
node repro.mjs         # terminal 2
```

## Routes

| route     | action passed to `useActionState`                       | result |
| --------- | ------------------------------------------------------- | ------ |
| `/stable` | `greetBound` — stable module-level reference (control)   | `POST /stable 200 in 64ms`, state rendered |
| `/`       | `greet.bind(null, 'bound-arg')` — bound during render    | request never responds; dev server re-renders in a loop and dies with `FATAL ERROR: ... JavaScript heap out of memory` |

Only the no-JS / progressive-enhancement postback (plain `multipart/form-data`
POST carrying the hidden `$ACTION_REF_1`, `$ACTION_1:0`, `$ACTION_1:1`,
`$ACTION_KEY` fields plus an `Origin` header) triggers it; the same form works
when JS is enabled.

`app/form.js`:

```js
const [state, formAction] = useActionState(greet.bind(null, 'bound-arg'), null, permalink)
```

Because `.bind()` runs on every render, a new bound-args promise is created on
every render of the postback, so the render never settles.

## Observed (Next.js 16.4.0, dev + turbopack)

```
POST /stable (no-JS postback) ... HTTP 200 in 74ms, state={"boundArg":"bound-arg","name":"world","at":...}
POST /      (no-JS postback) ... NO RESPONSE after 111810ms

# dev server log
 POST /stable 200 in 64ms (next.js: 1.1ms, application-code: 63ms)
 GET / 200 in 70ms
 <--- Last few GCs --->
 FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

`POST /` is never logged as completed and the dev server process dies.
