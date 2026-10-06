# Next.js dev indicator portal intercepts Playwright clicks at a mobile viewport

Reproduction for: "Next.js development indicator portal intercepts mobile Playwright clicks"
(Next.js `16.5.0-canary.0`, `next dev --turbopack`, Playwright `Pixel 5` device, 393x727).

## Run

```bash
npm install
npx playwright install chromium
npm test        # Playwright starts `next dev --turbopack` on :3000 itself
```

All 4 tests pass: they *assert* the broken behavior plus the control cases.

## What happens

The dev overlay renders `<nextjs-portal>` into `document.body`. Its indicator is
`position: fixed` at the bottom-left corner with `z-index: 2147483647`, so it owns the
hit target of that area of the viewport. On a phone-sized viewport that corner is prime
application UI (FABs, bottom tab bars).

1. `tests/dev-indicator.spec.js` → `/`: a 48x48 round menu button at `left:16; bottom:16`
   (rect `[16,663,48,48]`) is visible, enabled and stable, but `locator.click()` retries
   for the whole timeout with:

   ```
   <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script>
   subtree intercepts pointer events
   ```

   `document.elementFromPoint()` at the button center returns `nextjs-portal`.

2. `el.click()` (DOM) on the same button navigates to `/menu` immediately — the element is
   genuinely interactive, only real pointer input is blocked.

3. Control: `nextjs-portal { display: none }` → the identical `locator.click()` passes.

4. `/issue`: as soon as the app logs an error, the indicator expands to a `119px` wide pill
   while only the 32px Next.js logo looks like "the dev indicator". A bottom tab button at
   `[80,680,92,39]`, visually clear of the logo, is then also intercepted by `nextjs-portal`.

## Expected

An application control that is not under the visible dev indicator should receive pointer
input in development; ideally the dev overlay should not consume hit testing for areas
beyond its visible chrome, and the blocked corner should be escapable for e2e tests.
