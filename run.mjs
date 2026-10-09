import { chromium } from 'playwright'
const out = '/workspace/.next-maintainer/reproduction-artifacts/playwright'
const paths = process.argv.slice(2)
const b = await chromium.launch()
for (const path of paths) {
  const p = await b.newPage()
  p.on('pageerror', e => console.log('[pageerror]', path, String(e).slice(0, 300)))
  await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' })
  await p.click('#load')
  await p.waitForTimeout(4000)
  console.log(path, '->', (await p.textContent('body')).slice(0, 80))
  await p.screenshot({ path: `${out}/page${path.replaceAll('/', '-')}.png`, fullPage: true })
  await p.close()
}
await b.close()
