// node scripts/check.mjs  (requires `npm run dev` on port 3000)
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()

const read = () =>
  page.evaluate(() => ({
    icons: document.head.querySelectorAll('link[rel~="icon"]').length,
    titles: document.head.querySelectorAll('title').length,
    headTags: document.head.innerHTML.match(
      /<title>[^<]*<\/title>|<link rel="icon"[^>]*>|<meta name="description"[^>]*>/g
    ),
  }))

await page.goto('http://localhost:3000/')
await page.waitForTimeout(6000)
console.log('after hydration + router.refresh():')
console.log(JSON.stringify(await read(), null, 2))
console.log('expected: icons: 2, titles: 1')
await browser.close()
