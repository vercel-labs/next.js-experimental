// Turbopack dev: a global stylesheet edit that lands while the page is doing its
// initial load is never delivered over HMR. The browser keeps the pre-edit CSS
// until a manual reload / dev-server restart, even though the dev server already
// serves the updated CSS chunk.
//
// Usage:
//   npm install && npx playwright install chromium
//   node repro.mjs                   # turbopack (default) -> edit 1 is lost
//   BUNDLER=webpack node repro.mjs   # webpack -> edit 1 is applied
import { chromium } from 'playwright'
import fs from 'fs'
import { spawn, execSync } from 'child_process'

const DIR = process.cwd()
const CSS = DIR + '/app/globals.css'
const ART = DIR + '/artifacts'
const BUNDLER = process.env.BUNDLER === 'webpack' ? '--webpack' : '--turbopack'
const EDIT_OFFSET_MS = Number(process.env.OFFSET || 200)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try { execSync('pkill -f "next-server" || true') } catch {}
try { execSync('pkill -f "next dev" || true') } catch {}
await sleep(500)
execSync(`rm -rf ${DIR}/.next`)
fs.mkdirSync(ART, { recursive: true })
fs.writeFileSync(CSS, '.before-edit { color: rgb(1, 2, 3); }\n')

const out = fs.openSync(ART + '/dev-server.log', 'w')
const srv = spawn('npx', ['next', 'dev', BUNDLER, '-p', '3000'], {
  cwd: DIR,
  stdio: ['ignore', out, out],
})

for (let i = 0; i < 100; i++) {
  await sleep(300)
  try {
    if ((await fetch('http://localhost:3000/')).ok) break
  } catch {}
}

const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on('console', (m) => logs.push(m.text()))

// Start the navigation, then edit the stylesheet while the page is still loading.
const nav = page.goto('http://localhost:3000/')
await sleep(EDIT_OFFSET_MS)
fs.writeFileSync(
  CSS,
  '.before-edit { color: rgb(1, 2, 3); }\n.after-edit { color: rgb(9, 9, 9); }\n'
)
await nav.catch(() => {})
await sleep(6000)

const color = () => page.$eval('.after-edit', (e) => getComputedStyle(e).color)
console.log(`bundler=${BUNDLER}`)
console.log(
  'edit 1 (raced with initial load) -> browser color:',
  await color(),
  '(expected rgb(9, 9, 9))'
)

const html = await (await fetch('http://localhost:3000/')).text()
const chunk = html.match(/\/_next\/static\/[^"\\]*\.css/)[0]
const served = await (await fetch('http://localhost:3000' + chunk)).text()
console.log('dev server css chunk contains ".after-edit":', served.includes('after-edit'))

await page.screenshot({ path: ART + '/after-raced-edit.png' })

// Later edits (made while the page is idle) are delivered normally.
fs.writeFileSync(
  CSS,
  '.before-edit { color: rgb(1, 2, 3); }\n.after-edit { color: rgb(20, 20, 20); }\n'
)
await sleep(6000)
console.log('edit 2 (idle) -> browser color:', await color(), '(expected rgb(20, 20, 20))')

await page.reload({ waitUntil: 'load' })
await sleep(1500)
console.log('after manual reload -> browser color:', await color())
console.log('browser console:', logs.join(' | '))

await browser.close()
srv.kill('SIGKILL')
try { execSync('pkill -f "next-server" || true') } catch {}
