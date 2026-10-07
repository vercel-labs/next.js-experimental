import { chromium } from 'playwright'
const OUT = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const url = process.argv[2] || 'http://localhost:3000/hello'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(5000)
const state = await page.evaluate(() => {
  const vis = (el) => !!el && !!el.offsetParent || (el && getComputedStyle(el).position === 'fixed' && getComputedStyle(el).display !== 'none')
  const fb = document.getElementById('full-page-fallback')
  const content = document.getElementById('route-content')
  const hiddenSlots = [...document.querySelectorAll('div[hidden][id^="S:"]')].map((d) => d.id)
  return {
    readyState: document.readyState,
    fallbackPresent: !!fb,
    fallbackVisible: vis(fb),
    contentPresent: !!content,
    contentHiddenParent: content ? !!content.closest('[hidden]') : null,
    contentVisible: !!content && content.getClientRects().length > 0,
    hiddenSlots,
    canvas: !!document.getElementById('webgl'),
    bodyText: document.body.innerText.slice(0, 200),
  }
})
console.log(JSON.stringify({ url, state, errors: errors.slice(0, 10) }, null, 2))
await page.screenshot({ path: `${OUT}/${url.split('/').pop()}.png`, fullPage: true })
await browser.close()
