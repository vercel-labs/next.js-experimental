import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:3100'
const OUT = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const DELAY = 4000

const results = []
const browser = await chromium.launch()

for (const route of ['no-loading', 'with-loading']) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  // Delay only the lazy chunk that contains the dynamic() component
  await page.route('**/_next/static/chunks/1z46dcw1pdclq.js', async (r) => {
    await new Promise((res) => setTimeout(res, DELAY))
    await r.continue()
  })
  const t0 = Date.now()
  await page.goto(`${BASE}/${route}`, { waitUntil: 'commit' })
  await page.waitForSelector('#counter')
  await page.waitForTimeout(1500) // main bundle hydration window, dynamic chunk still pending
  await page.click('#counter', { force: true })
  await page.waitForTimeout(200)
  const earlyCount = await page.textContent('#count')
  const earlyHeavy = await page.locator('#heavy').count()
  await page.screenshot({ path: `${OUT}/${route}-at-1.7s.png` })
  // wait for dynamic chunk to arrive
  await page.waitForTimeout(DELAY)
  await page.click('#counter')
  await page.waitForTimeout(200)
  const lateCount = await page.textContent('#count')
  await page.screenshot({ path: `${OUT}/${route}-after-chunk.png` })
  results.push({ route, elapsedMs: Date.now() - t0, countAfterEarlyClick: earlyCount, heavyInDomEarly: earlyHeavy, countAfterLateClick: lateCount })
  await ctx.close()
}

// JS-disabled check of prerendered HTML
const ctx = await browser.newContext({ javaScriptEnabled: false })
for (const route of ['no-loading', 'with-loading', 'slow-with-loading']) {
  const page = await ctx.newPage()
  await page.goto(`${BASE}/${route}`)
  const visible = await page.locator('#heavy').isVisible().catch(() => false)
  await page.screenshot({ path: `${OUT}/nojs-${route}.png`, fullPage: true })
  results.push({ route: `nojs:${route}`, heavyVisibleWithoutJS: visible })
  await page.close()
}
await browser.close()
console.log(JSON.stringify(results, null, 2))
