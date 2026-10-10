# Duplicate `next/link` prefetch payload reproduction

Next.js 16.4.0 production/Turbopack reproduction with an ISR dynamic route (`generateStaticParams() => []`, `revalidate = 60`). The home page has an explicit `prefetch={true}` Link as the trigger and `prefetch={false}` as the control.

```sh
npm install
npx playwright install chromium
npm run build
npm start
# in another shell:
npm run observe
```

The observer prints each `/items/*` request's prefetch headers, response size, and SHA-256. The issue reproduces when `/items/trigger` gets route-tree and segment prefetches with identical hashes/full-payload markers; `/items/control` should have no prefetch request.
