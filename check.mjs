// Usage: node check.mjs http://localhost:4311
// Opens "/", clicks the Link to /items/a (client navigation), reports the result.
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4311'
const browser = await chromium.launch()
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

let nav = null
page.on('response', async (res) => {
  const h = res.request().headers()
  if (h['rsc'] === '1' && !h['next-router-prefetch'] && res.url().includes('/items/a')) {
    const body = await res.text().catch(() => '')
    nav = {
      url: res.url(),
      status: res.status(),
      postponed: res.headers()['x-nextjs-postponed'] ?? '(absent)',
      cache: res.headers()['x-nextjs-cache'] ?? '(absent)',
      hasDrp: body.includes('%%drp'),
      body,
    }
  }
})

await page.goto(base + '/')
await page.waitForTimeout(1000)
await page.click('#link-a')
await page.waitForTimeout(3000)

const titleVisible = await page.locator('#title').isVisible().catch(() => false)
const has412 = consoleErrors.some((e) => /#412|Connection closed/.test(e))
const errorUi = await page.getByText(/client-side exception|Application error/i).isVisible().catch(() => false)

console.log('--- client navigation / -> /items/a ---')
console.log('url after nav      :', page.url())
console.log('#title visible     :', titleVisible)
console.log('React #412 logged  :', has412)
console.log('Next error UI shown:', errorUi)
if (nav) {
  console.log('RSC nav response   :', nav.status, nav.url)
  console.log('x-nextjs-postponed :', nav.postponed)
  console.log('x-nextjs-cache     :', nav.cache)
  console.log('body has drp marker :', nav.hasDrp, '(placeholder %' + '%drp:…%' + '% present)')
  console.log('--- RSC body (first 1200 chars) ---')
  console.log(nav.body.slice(0, 1200))
} else {
  console.log('RSC nav response   : (not captured)')
}
if (consoleErrors.length) console.log('--- console errors ---\n' + consoleErrors.map((e) => e.slice(0, 300)).join('\n'))

// Hard load of the same URL
const hard = await browser.newPage()
await hard.goto(base + '/items/a')
await hard.waitForTimeout(1500)
console.log('--- hard load /items/a ---')
console.log('#title visible     :', await hard.locator('#title').isVisible().catch(() => false))

await browser.close()
process.exit(titleVisible && !has412 ? 0 : 1)
