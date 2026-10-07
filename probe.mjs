import { chromium } from '/workspace/node_modules/playwright/index.mjs'

const label = process.argv[2] || 'baseline'
const mode = process.argv[3] || 'none' // none | abortchunk
const OUT = '/workspace/.next-maintainer/reproduction-artifacts/playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
const consoleErrors = []
const pageErrors = []
const blocked = []
const responses = []

page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', (e) => pageErrors.push(String(e)))
page.on('requestfailed', (r) => blocked.push(`${r.url()} :: ${r.failure()?.errorText}`))
page.on('response', (r) => responses.push(`${r.status()} ${r.url()}`))

if (mode === 'abortchunk') {
  await page.route('**/*', (route) => {
    const u = route.request().url()
    if (/webgl|canvas/i.test(u) && /\.(js|mjs)/.test(u.split('?')[0])) {
      blocked.push('ABORTED_BY_TEST ' + u)
      return route.abort('failed')
    }
    return route.continue()
  })
}

await page.goto('http://localhost:3102/a', { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(6000)

const result = await page.evaluate(() => {
  const vis = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return { w: r.width, h: r.height, display: cs.display, visibility: cs.visibility, opacity: cs.opacity }
  }
  const hiddenAncestors = (el) => {
    const out = []
    let n = el
    while (n && n !== document.documentElement) {
      const cs = n.nodeType === 1 ? getComputedStyle(n) : null
      if (n.nodeType === 1 && (cs.display === 'none' || n.hasAttribute('hidden'))) {
        out.push({ tag: n.tagName, id: n.id, hidden: n.hasAttribute('hidden'), display: cs.display })
      }
      n = n.parentElement
    }
    return out
  }
  const fb = document.querySelector('[data-testid=fallback]')
  const rc = document.querySelector('[data-testid=route-content]')
  return {
    readyState: document.readyState,
    fallback: { present: !!fb, box: vis(fb), hiddenAncestors: fb ? hiddenAncestors(fb) : null },
    routeContent: { present: !!rc, box: vis(rc), hiddenAncestors: rc ? hiddenAncestors(rc) : null },
    canvasPresent: !!document.querySelector('[data-testid=webgl-canvas]'),
    hiddenDivCount: document.querySelectorAll('div[hidden]').length,
    bodyInnerText: document.body.innerText.slice(0, 600),
  }
})

result.label = label
result.consoleErrors = consoleErrors.slice(0, 25)
result.pageErrors = pageErrors.slice(0, 10)
result.failedRequests = blocked.slice(0, 25)
result.cspHeaderPresent = undefined

await page.screenshot({ path: `${OUT}/probe-csp-${label}.png`, fullPage: false })
console.log(JSON.stringify(result, null, 2))
await browser.close()
