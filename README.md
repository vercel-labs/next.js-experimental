# Activity + useLayoutEffect cleanup runs again on reveal in `next dev`

Next.js 16.4.0, `cacheComponents: true`, Turbopack dev.

The ["Preserving UI state" guide](https://nextjs.org/docs/app/guides/preserving-ui-state)
recommends resetting transient state in a `useLayoutEffect` cleanup, described as running
"when Activity hides this component". In development the cleanup also runs again when the
kept page is revealed (React's dev-only effect double-invoke for Activity), so any state set
while the page was hidden is wiped as it is shown. Production does not do this.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
# or: npm run build && npm start
```

1. Visit `/kept` (client page with `message` state reset in a `useLayoutEffect` cleanup).
2. Navigate to `/other` — `/kept` is kept mounted/hidden by `<Activity>`; cleanup runs (expected).
3. Click "set message on hidden /kept page" — sets state on the hidden page.
4. Navigate back to `/kept`.

## Result

dev: `SETUP, CLEANUP, SETUP` on reveal → message is `(no message)`
prod: `SETUP` only on reveal → message is `message set while hidden`
