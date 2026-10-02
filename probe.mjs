const base = process.env.BASE || 'http://localhost:3100'
async function timed(label, url, headers = {}) {
  const t0 = Date.now()
  const res = await fetch(base + url, { headers })
  const ttfb = Date.now() - t0
  const text = await res.text()
  console.log(`${label.padEnd(22)} ${url.padEnd(26)} status=${res.status} ttfb=${ttfb}ms total=${Date.now()-t0}ms cache=${res.headers.get('x-nextjs-cache')||'-'} postponed=${res.headers.get('x-nextjs-postponed')||'-'} bodyHasFallback=${text.includes('waiting for params')} bodyHasData=${/id="data"/.test(text)}`)
}
await timed('doc blocking cold', '/blocking/doc-x1')
await timed('doc blocking repeat', '/blocking/doc-x1')
await timed('doc fallback cold', '/fallback/doc-x2')
await timed('prefetch blocking', '/blocking/pf-x1', { RSC: '1', 'Next-Router-Prefetch': '1' })
await timed('prefetch fallback', '/fallback/pf-x2', { RSC: '1', 'Next-Router-Prefetch': '1' })
