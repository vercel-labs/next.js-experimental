// Usage: node repro.mjs            (control: no third-party mutation)
//        node repro.mjs third-party (simulated third-party inert mutation)
import { chromium } from 'playwright'

const variant = process.argv[2] === 'third-party' ? '?third-party=1' : ''
const base = process.env.BASE_URL || 'http://localhost:3000'
const browser = await chromium.launch()
const page = await browser.newPage()
const hydration = []
page.on('console', (m) => {
  const t = m.text()
  if (/hydrat/i.test(t)) hydration.push(`[console.${m.type()}] ${t}`)
})
page.on('pageerror', (e) => {
  if (/hydrat/i.test(e.message)) hydration.push(`[pageerror] ${e.message}`)
})

await page.goto(`${base}/${variant}`, { waitUntil: 'load' })
await page.waitForSelector('#box-home', { timeout: 20000 })
await page.waitForTimeout(1500)
await page.click('#to-other')
await page.waitForSelector('#box-other', { timeout: 20000 })
await page.waitForTimeout(1500)

console.log('variant:', variant || '(control)')
console.log(
  'elements carrying inert in the DOM:',
  await page.evaluate(() => [...document.querySelectorAll('[inert]')].map((e) => e.tagName + '#' + e.id))
)
console.log('hydration messages:', hydration.length)
console.log(hydration.join('\n\n'))
await browser.close()
process.exit(hydration.length ? 1 : 0)
