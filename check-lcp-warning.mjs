// Usage: node check-lcp-warning.mjs   (with `next dev --turbopack` running on :3000)
// Requires: npx playwright install chromium
import { chromium } from 'playwright'

const browser = await chromium.launch()
for (const path of ['/', '/fixed']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const warnings = []
  page.on('console', (m) => {
    if (m.text().includes('Largest Contentful Paint')) warnings.push(m.text())
  })
  // Delay image responses so the LCP entry is reported after both <Image>s have
  // registered themselves (the normal case on a real network).
  await page.route('**/_next/image**', async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })
  await page.goto('http://localhost:3000' + path, { waitUntil: 'load' })
  await page.waitForTimeout(8000)
  const lcp = await page.evaluate(
    () =>
      new Promise((res) => {
        new PerformanceObserver((l) => {
          const e = l.getEntries().at(-1)
          res({ loading: e?.element?.getAttribute('loading'), alt: e?.element?.getAttribute('alt') })
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        setTimeout(() => res(null), 3000)
      })
  )
  console.log(path, '-> LCP element:', JSON.stringify(lcp))
  console.log(path, '-> LCP warnings:', warnings.length ? warnings : 'none')
  await page.close()
}
await browser.close()
