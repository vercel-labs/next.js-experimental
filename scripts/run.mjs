// Drives the reproduction in a real browser:
//   /a  -> open the deferred UI (markdown + syntax highlighting + mermaid diagram)
//   /b  -> open a second deferred UI that shares the same lazy modules
//   /a  -> open again
// Watch the dev server log while this runs.
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const browser = await chromium.launch()
const page = await browser.newPage()

page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 250)))
page.on('response', (r) => {
  if (r.status() >= 400) console.log('[http ' + r.status() + ']', r.url())
})

for (const route of ['/a', '/b', '/a']) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500) // let the page hydrate before clicking
  await page.click('#open-link')
  await page.waitForTimeout(15000) // lazy compilation of the deferred chunks
  const body = await page.locator('body').innerText()
  console.log(
    '===',
    route,
    '| markdown:',
    body.includes('Some markdown content'),
    '| diagram:',
    (await page.locator('#diagram svg').count()) > 0
  )
}

await browser.close()
