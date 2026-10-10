import { chromium } from 'playwright'
import { createHash } from 'node:crypto'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const requests = new Map()
const results = []

page.on('request', request => {
  const url = new URL(request.url())
  if (url.pathname.includes('/items/')) {
    requests.set(request, {
      path: url.pathname,
      query: url.search,
      purpose: request.headers()['purpose'] ?? null,
      routerPrefetch: request.headers()['next-router-prefetch'] ?? null,
      segmentPrefetch: request.headers()['next-router-segment-prefetch'] ?? null,
    })
  }
})
page.on('response', async response => {
  const request = response.request()
  if (!requests.has(request)) return
  const body = await response.body()
  results.push({
    ...requests.get(request),
    status: response.status(),
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    containsMarker: body.includes(Buffer.from('FULL_RSC_PAYLOAD_MARKER_')),
    bodyPreview: body.toString('utf8').slice(0, 500),
  })
})

await page.goto(baseURL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await browser.close()
results.sort((a, b) => a.path.localeCompare(b.path) || a.query.localeCompare(b.query))
console.log(JSON.stringify(results, null, 2))
