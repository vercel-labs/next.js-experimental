import { chromium } from 'playwright'
const BASE = 'http://localhost:3101'
const OUT = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ javaScriptEnabled: false })
const out = []
for (const r of ['no-loading', 'with-loading', 'slow-with-loading', 'stream-with-loading']) {
  const p = await ctx.newPage()
  await p.goto(`${BASE}/${r}`)
  out.push({ route: r, heavyVisibleNoJS: await p.locator('#heavy').isVisible().catch(() => false) })
  await p.screenshot({ path: `${OUT}/nojs-${r}.png`, fullPage: true })
  await p.close()
}
await b.close()
console.log(JSON.stringify(out, null, 2))
