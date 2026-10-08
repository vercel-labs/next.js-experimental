# Repro: `notFound()` returns an empty `__next_error__` shell instead of server-rendering the not-found UI

Next.js **16.4.0**, Turbopack, `cacheComponents: true`.

## Run

```bash
npm install
npm run build
npm start
curl -i http://localhost:3000/site-b     # in generateStaticParams, data missing
curl -i http://localhost:3000/site-c     # not in generateStaticParams
```

## Expected

404 status plus server-rendered `app/[root]/not-found.js` inside `app/[root]/layout.js`.

## Actual

404 + `noindex`, but the document is:

```html
<!DOCTYPE html><html id="__next_error__"><head>...</head><body><script ...>...</script></body></html>
```

The root layout and the not-found UI exist **only** in the inlined RSC payload (`self.__next_f.push`) and
are painted only after client JS hydrates. With JS disabled the page is blank.

Playwright, `/site-b`:

```
js=false status=404 bodyText=""
js=true  status=404 bodyText="ROOT LAYOUT HEADER\nCUSTOM NOT FOUND UI"
```

## Scope observed

Same empty shell with `next dev`, with `cacheComponents` removed, with a conventional
`app/layout.js` + `app/not-found.js` + `app/[slug]/page.js` tree, and on Next.js 15.5.9.
So it is not specific to Cache Components — it is how `notFound()` is prerendered.
