import { chromium } from '@playwright/test'

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) })
const page = await browser.newPage()
const requests = []
const responses = []
page.on('request', (request) => {
  const url = request.url()
  if (url.includes('_rsc=') || request.headers()['next-router-prefetch']) {
    requests.push({ time: Date.now(), url, headers: request.headers() })
  }
})
page.on('response', (response) => {
  if (response.url().includes('_rsc=')) responses.push({ status: response.status(), url: response.url() })
})
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
const start = Date.now()
await page.waitForTimeout(5000)
const idleRequests = requests.filter((request) => request.time >= start)
const byUrl = Object.entries(idleRequests.reduce((counts, request) => {
  const url = new URL(request.url)
  const key = `${url.pathname}?${[...url.searchParams.keys()].sort().join(',')}`
  counts[key] = (counts[key] || 0) + 1
  return counts
}, {})).sort((a, b) => b[1] - a[1])
const result = { totalPrefetchRequests: requests.length, requestsDuringFiveIdleSeconds: idleRequests.length, responseStatuses: responses.reduce((counts, response) => { counts[response.status] = (counts[response.status] || 0) + 1; return counts }, {}), byUrl }
console.log(JSON.stringify(result, null, 2))
if (process.env.PLAYWRIGHT_SCREENSHOT_PATH) {
  await page.screenshot({ path: process.env.PLAYWRIGHT_SCREENSHOT_PATH, fullPage: true })
}
await browser.close()
