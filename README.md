# Repro: App Router layout CSS has no `<link rel="preload" as="style">` in document head (vercel/next.js#98756)

Minimal App Router app with a single global stylesheet imported in `app/layout.js`.

## Run

```bash
npm install
npm run build
npm start          # next start -p 3000
curl -s http://localhost:3000/ | grep -o '<link[^>]*>'
```

Or non-interactively: `npm install && npm run verify`

## Observed (next@16.4.0-canary.32, production `next start`)

```
<link rel="stylesheet" href="/_next/static/chunks/<hash>.css" data-precedence="next"/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/<hash>.js"/>
```

The layout stylesheet appears only as `rel="stylesheet"`. There is no
`<link rel="preload" as="style">` hint for it. Script preloads are emitted.
Same output with the webpack builder (`next build --webpack`).
