# Repro: vercel/next.js#99656 — mobile hamburger menu stays open and overlaps the Search modal

Live-site (nextjs.org/docs) UI bug, reproduced with Playwright on iPhone 13 and iPad Mini viewports.

```bash
npm install
npx playwright install chromium
node repro.mjs
```

Steps performed: load `https://nextjs.org/docs` → click hamburger (`[class*=menuButton]`) → click
Search (`button[aria-label="Search documentation"]`).

Observed: the mobile menu (`[class*=mobileMenu]`, 390x664 at y=76 on iPhone 13) stays mounted and
visible, the menu button keeps `aria-label="close menu"`, and the search dialog (`[role=dialog]`,
390x531 at y=133) overlaps it. `document.elementFromPoint` in the middle of the search modal returns
a mobile-menu link (e.g. `<a href="/blog">Blog</a>`), so menu links paint above and swallow taps
intended for the search UI.

Expected: opening search should close the mobile menu.
