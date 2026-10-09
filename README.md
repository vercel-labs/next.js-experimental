# Repro: `instant()` limits `router.push` navigations to the App Shell even after a `prefetch={true}` Link prefetch

Next.js **16.4.0**, Turbopack, `cacheComponents` + `partialPrefetching` +
`experimental.exposeTestingApiInProductionBuild`.

## Run

```bash
npm install
npx playwright install chromium
npm run build
npm test
```

(`playwright.config.ts` starts `next start` automatically.)

## Setup

- `app/post/[id]/page.tsx` is prerendered via `generateStaticParams` for `1` and `2`.
- `app/page.tsx` renders `<Link prefetch={true}>` to both.
- `app/page-transition.tsx` is a "page transition" wrapper that intercepts the
  link click (`preventDefault`) and, after a frame of "animation", navigates with
  `router.push(href)`.

## Tests

1. `plain Link click is instant` — plain `<Link>` click inside `instant()` → **passes**.
2. `router.push to the same prefetched href inside instant()` → **fails**: the URL
   never changes while the instant lock is held; the router issues dynamic
   `GET /post/1?_rsc=...` requests instead of committing the prefetched segments.
   The URL only commits to `/post/1` after `instant()` releases the lock.
3. `control: same router.push WITHOUT instant()` → **passes** with **zero**
   network requests, proving the prefetched page was fully usable.
