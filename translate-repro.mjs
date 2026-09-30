import { chromium } from 'playwright'

const ART = process.env.ART || '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => { errors.push('pageerror: ' + e.message); console.log('PAGEERROR:', e.message) })

// Chrome's built-in translation replaces every text node with a <font>-wrapped
// translated text node. This function emulates exactly that DOM rewrite.
const installTranslator = () => page.evaluate(() => {
  const translate = (root) => {
    for (const n of Array.from(root.childNodes)) {
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim() && !n.__translated) {
        const font = document.createElement('font')
        font.setAttribute('_msttexthash', '1')
        const t = document.createTextNode('[EN] ' + n.nodeValue)
        t.__translated = true
        font.appendChild(t)
        n.parentNode.replaceChild(font, n)
      } else if (n.nodeType === 1) {
        translate(n)
        if (n.shadowRoot) translate(n.shadowRoot)
      }
    }
  }
  const run = () => {
    translate(document.body)
    const a = document.getElementsByTagName('next-route-announcer')[0]
    if (a?.shadowRoot) translate(a.shadowRoot)
  }
  run()
  const mo = new MutationObserver(run)
  mo.observe(document.body, { childList: true, subtree: true, characterData: true })
  const a = document.getElementsByTagName('next-route-announcer')[0]
  if (a?.shadowRoot) mo.observe(a.shadowRoot, { childList: true, subtree: true, characterData: true })
})

const announcer = () => page.evaluate(() => {
  const a = document.getElementsByTagName('next-route-announcer')[0]
  return a?.shadowRoot ? a.shadowRoot.innerHTML.replace(/ style="[^"]*"/, '') : null
})

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000) // let React hydrate first, then "translate"
await installTranslator()
await page.waitForTimeout(300)
console.log('1. nav links after translation:', await page.locator('nav a').allInnerTexts())

await page.locator('nav a').nth(1).click()   // "Seite mit Titel" / "Page with title"
await page.waitForTimeout(800)
console.log('2. announcer on /titled:', await announcer())

await page.locator('nav a').nth(0).click()   // "Startseite" / "Homepage"
await page.waitForTimeout(1500)
console.log('3. announcer on /   :', await announcer())
console.log('4. visible body text:', (await page.locator('body').innerText()).replace(/\n+/g, ' | ').slice(0, 160))
await page.screenshot({ path: ART + '/after-navigation.png', fullPage: true })
await browser.close()
const crash = errors.find((e) => /removeChild/.test(e))
console.log('\nRESULT:', crash ? 'CRASHED -> ' + crash : 'no removeChild crash')
console.log('all page errors:', JSON.stringify(errors, null, 2))
process.exit(crash ? 1 : 0)
