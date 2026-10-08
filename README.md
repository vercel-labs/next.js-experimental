# Root metadata (`icon` file conventions) duplicated in `<head>` after `router.refresh()`

Next.js 16.4.0, `next dev --turbopack`, Cache Components + Partial Prefetching.

## Run

```bash
npm install
npx playwright install chromium
npm run dev           # terminal 1
npm run check         # terminal 2 (Playwright, counts head tags)
```

## What happens

`app/page.tsx` is dynamic. The client component `app/auto-refresh.tsx` calls
`router.refresh()` once right after hydration, while the streamed root metadata
is still pending.

Initial server HTML contains one set of metadata tags
(`<link rel="icon" href="/favicon.ico...">`, `<link rel="icon" href="/icon.svg...">`,
`<title>`, `<meta name="description">`).

After the refresh RSC response, `document.head` contains **two** copies of the
`icon` file-convention links (4 `link[rel=icon]` instead of 2). The count stays
at two copies across further refreshes, it does not keep growing.

Expected: the re-rendered metadata replaces/dedupes the existing head tags.
