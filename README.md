# Repro: navigation does not scroll to top when page content suspends without a fallback

vercel/next.js#99843

## Run

```bash
npm install
npx playwright install chromium
npm run dev            # or: npm run build && npm start -- -p 3000
npm test               # BASE_URL=http://localhost:3000
```

## What happens

`/suspense-without-fallback` has a 10000px tall sidebar whose `<Link>` sits at the bottom.
The target page wraps its dynamic content in `<Suspense fallback={null}>`.

After scrolling to y=5000 and clicking the link, the new page renders but `window.scrollY`
stays at ~9296. The control route `/with-fallback`, identical except for a fallback that
renders a DOM node, scrolls to 0.
