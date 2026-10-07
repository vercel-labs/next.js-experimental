import { chromium } from 'playwright'
const OUT = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ javaScriptEnabled: false })
const page = await ctx.newPage()
await page.goto('http://localhost:3000/hello', { waitUntil: 'load' })
await page.waitForTimeout(3000)
const html = await page.content()
console.log('hiddenSlot:', /<div hidden id="S:0">/.test(html), 'fallbackInDom:', html.includes('full-page-fallback'))
await page.screenshot({ path: OUT + '/nojs-fallback.png', fullPage: true })
await browser.close()
