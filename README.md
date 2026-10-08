# next/image LCP warning fires on an image that already has `loading="eager"`

Next.js 16.4.0, `next dev --turbopack`, App Router.

`app/page.js` renders the same static image twice at the same width:
an eager copy above the fold (the real LCP element) and a default-lazy copy
far below the fold. Both produce the identical optimized `src`.

In dev the console logs:

```
Image with src "/_next/static/media/hero.<hash>.png" was detected as the
Largest Contentful Paint (LCP). Please add the `loading="eager"` property
if this image is above the fold.
```

even though the painted LCP element already has `loading="eager"`.

Cause: the dev-only bookkeeping in `packages/next/src/shared/lib/get-img-props.ts`
keeps `allImgs` as a `Map` keyed by the resolved image URL, so the later
lazy `<Image>` overwrites the eager entry. The `largest-contentful-paint`
PerformanceObserver then looks up by `entry.element.src` and reads the lazy
record instead of inspecting the element that was actually painted.

`/fixed` is the control page where both copies are eager; no warning is logged.

## Run

```bash
npm install
npx playwright install chromium
npm run dev            # next dev --turbopack on :3000
node check-lcp-warning.mjs
```

Expected output:

```
/ -> LCP element: {"loading":"eager","alt":"hero eager"}
/ -> LCP warnings: [ 'Image with src ... Please add the `loading="eager"` property ...' ]
/fixed -> LCP element: {"loading":"eager","alt":"hero eager"}
/fixed -> LCP warnings: none
```

The warning is timing-sensitive: it only appears when the LCP entry is
delivered after both images have registered, which the script guarantees by
delaying `/_next/image` responses by 1.5s.
