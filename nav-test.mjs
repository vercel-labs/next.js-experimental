import { chromium } from 'playwright'
import fs from 'node:fs'

// usage: node nav-test.mjs <blocking|fallback> <slug>
const OUT = 'artifacts'
fs.mkdirSync(OUT, { recursive: true })
const policy = process.argv[2] || 'blocking'
const slug = process.argv[3] || 'novel-1'
const base = process.env.BASE || 'http://localhost:3100'

const browser = await chromium.launch()
const page = await browser.newPage()
const net = []
page.on('request', (r) => { if (/\/(blocking|fallback)\//.test(r.url())) net.push({ t: Date.now(), kind: 'req', url: r.url(), rsc: r.headers()['rsc'], prefetch: r.headers()['next-router-prefetch'] }) })
page.on('response', (r) => { if (/\/(blocking|fallback)\//.test(r.url())) net.push({ t: Date.now(), kind: 'res', url: r.url(), status: r.status() }) })

await page.goto(base + '/', { waitUntil: 'load' })
const t0 = Date.now()
await page.click(`#to-${policy}-${slug}`)
let fallbackAt = null
try {
  await page.waitForSelector('#fallback', { timeout: 5000, state: 'attached' })
  fallbackAt = Date.now() - t0
  await page.screenshot({ path: `${OUT}/${policy}-${slug}-fallback.png` })
} catch {}
await page.waitForSelector('#data', { timeout: 20000 })
const dataAt = Date.now() - t0
const out = {
  policy, slug, url: page.url(),
  fallbackVisibleAfterMs: fallbackAt,
  dataVisibleAfterMs: dataAt,
  dataText: await page.textContent('#data'),
  network: net.map((e) => ({ ...e, dt: e.t - t0 })),
}
await page.screenshot({ path: `${OUT}/${policy}-${slug}-final.png` })
console.log(JSON.stringify(out, null, 2))
fs.writeFileSync(`${OUT}/client-nav-${policy}-${slug}.json`, JSON.stringify(out, null, 2))
await browser.close()
