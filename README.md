# Repro: `next/image` `priority` does not set `fetchPriority="high"` (vercel/next.js#98754)

```bash
npm install
npm run build
npm start   # http://localhost:3000
curl -s localhost:3000/ | grep -oE '<link rel="preload" as="image"[^>]*>|<img[^>]*>'
```

- `/` renders `<Image src="/hero.jpg" priority width={1200} height={600} />` (and a second one with explicit `fetchPriority="high"`).
- `/manual` renders only the explicit `fetchPriority="high"` variant.

Observed on next@16.4.0-canary.33: the `priority`-only image emits
`<img ...>` and `<link rel="preload" as="image" ...>` with **no** `fetchPriority`,
while the explicit variant emits `fetchPriority="high"` on both.
