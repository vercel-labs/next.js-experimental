import { chromium } from 'playwright'
import fs from 'node:fs'

const browser = await chromium.launch()
const page = await browser.newPage()
const reqs = []
page.on('request', (r) => {
  const h = r.headers()
  reqs.push({ url: r.url().replace('http://localhost:3000',''), prefetch: h['next-router-prefetch'] ?? null, seg: h['next-router-segment-prefetch'] ?? null, rsc: h['rsc'] ?? null })
})
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
console.log('=== after initial load (Link prefetches)')
reqs.filter(r=>r.rsc).forEach(r=>console.log(JSON.stringify(r)))

async function trial(label, sel) {
  reqs.length = 0
  await page.hover(sel)
  await page.waitForTimeout(2500)
  console.log('=== ' + label)
  reqs.filter(r=>r.rsc).forEach(r=>console.log(JSON.stringify(r)))
  if (reqs.filter(r=>r.rsc).length === 0) console.log('(no RSC requests)')
}
await trial('hover #manual-default (router.prefetch(href))', '#manual-default')
await trial('hover #manual-full (router.prefetch(href,{kind:"full"}))', '#manual-full')
await trial('hover #link-true (<Link prefetch={true}>)', '#link-true')
await trial('hover #link-auto (<Link>)', '#link-auto')
await page.screenshot({ path: '/workspace/.next-maintainer/reproduction-artifacts/playwright/home.png' })
await browser.close()
