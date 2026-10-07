import { chromium } from '@playwright/test'
const dir = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const b = await chromium.launch()
const ctx = await b.newContext()
await ctx.addCookies([{ name: 'session', value: 'user-1', url: 'http://localhost:3000' }])
const logs = []
const attach = (p, tag) => {
  p.on('console', (m) => { if (m.type() === 'error') logs.push(`[${tag} console:error] ${m.text().slice(0, 400)}`) })
  p.on('pageerror', (e) => logs.push(`[${tag} pageerror] ${e.message.slice(0, 400)}`))
  p.on('requestfailed', (r) => logs.push(`[${tag} requestfailed] ${r.url().slice(0,150)} ${r.failure()?.errorText}`))
  p.on('response', (r) => { if (r.status() >= 400) logs.push(`[${tag} http ${r.status()}] ${r.url().slice(0, 170)}`) })
}
const pages = []
for (let i = 0; i < 3; i++) {
  const p = await ctx.newPage()
  attach(p, 't' + i)
  pages.push(p)
}
// all three tabs load and immediately open the deferred UI concurrently
await Promise.all(pages.map(async (p) => {
  await p.goto('http://localhost:3000/', { waitUntil: 'commit' })
  await p.waitForSelector('#open', { timeout: 60000 })
  await p.click('#open')
}))
await new Promise((r) => setTimeout(r, 15000))
// reload all mid-compile and re-open
await Promise.all(pages.map(async (p, i) => {
  await p.reload({ waitUntil: 'commit' })
  await p.waitForSelector('#open', { timeout: 60000 }).catch(() => {})
  await p.click('#open').catch(() => {})
  await p.waitForTimeout(100 * i)
  await p.evaluate(() => fetch('/api/data').then((r) => r.status)).catch(() => {})
}))
await new Promise((r) => setTimeout(r, 25000))
for (const [i, p] of pages.entries()) {
  await p.screenshot({ path: `${dir}/race-tab${i}.png`, fullPage: true })
  logs.push(`--- tab${i}: ` + (await p.locator('body').innerText()).replace(/\n+/g, ' | ').slice(0, 400))
}
console.log(logs.join('\n'))
await b.close()
