import { chromium } from 'playwright'
import fs from 'node:fs'
const ART = new URL('../artifacts/', import.meta.url).pathname
const sleep = ms => new Promise(r => setTimeout(r, ms))
const LIB = new URL('../lib/data.ts', import.meta.url).pathname
const PAGE = new URL('../app/page.tsx', import.meta.url).pathname

const libSrc = (n, { prepend, cache }) => {
  const g = cache
    ? `export async function getGreeting() {\n  'use cache'\n  return 'greeting'\n}\n`
    : `export function getGreeting() {\n  return 'greeting'\n}\n`
  const ne = n ? (cache
    ? `export async function newExport${n}() {\n  'use cache'\n  return 'NEW ${n}'\n}\n`
    : `export function newExport${n}() {\n  return 'NEW ${n}'\n}\n`) : ''
  return `import 'server-only'\n\n` + (prepend ? ne + '\n' + g : g + '\n' + ne)
}
const pageSrc = (n, { cache }) => {
  const imp = n ? `import { getGreeting, newExport${n} } from '@/lib/data'` : `import { getGreeting } from '@/lib/data'`
  const call = n ? `<h2 id="new">{${cache ? 'await ' : ''}newExport${n}()}</h2>` : ''
  return `${imp}\n\nexport default async function Page() {\n${cache ? "  'use cache'\n" : ''}  return <main><h1 id="greeting">{${cache ? 'await ' : ''}getGreeting()}</h1>${call}</main>\n}\n`
}

const b = await chromium.launch()
const p = await (await b.newContext()).newPage()
const errs = []
p.on('pageerror', e => errs.push(e.message))
let n = 0, failures = 0
const combos = []
for (const order of ['lib-first', 'page-first', 'simultaneous'])
  for (const prepend of [false, true])
    for (const cache of [false, true])
      for (const racy of [false, true])
        combos.push({ order, prepend, cache, racy })

fs.writeFileSync(LIB, libSrc(0, { prepend: false, cache: false }))
fs.writeFileSync(PAGE, pageSrc(0, { cache: false }))
await sleep(4000)
await p.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 })

for (const c of combos) {
  n++
  errs.length = 0
  const opts = { prepend: c.prepend, cache: c.cache }
  const L = libSrc(n, opts), P = pageSrc(n, opts)
  if (c.order === 'lib-first') { fs.writeFileSync(LIB, L); await sleep(600); fs.writeFileSync(PAGE, P) }
  else if (c.order === 'page-first') { fs.writeFileSync(PAGE, P); await sleep(600); fs.writeFileSync(LIB, L) }
  else { fs.writeFileSync(PAGE, P); fs.writeFileSync(LIB, L) }
  if (c.racy) { await sleep(150); p.reload({ waitUntil: 'commit' }).catch(() => {}) }
  await sleep(3500)
  await p.reload({ waitUntil: 'load', timeout: 60000 }).catch(() => {})
  await sleep(1200)
  let body = await p.textContent('body')
  let ok = body.includes(`NEW ${n}`)
  if (!ok) { // give it another chance / check persistence
    await sleep(5000); await p.reload({ waitUntil: 'load', timeout: 60000 }).catch(() => {})
    body = await p.textContent('body'); ok = body.includes(`NEW ${n}`)
  }
  const te = /is not a function/.test(body) || errs.some(e => /is not a function/.test(e))
  console.log(`${n} ${JSON.stringify(c)} ok=${ok} typeError=${te}`)
  if (!ok || te) {
    failures++
    await p.screenshot({ path: `${ART}/sweep-fail-${n}.png`, fullPage: true })
    fs.writeFileSync(`${ART}/sweep-fail-${n}.txt`, JSON.stringify(c) + '\n\n' + body.slice(0, 5000) + '\n\nPAGEERRORS:\n' + errs.join('\n') + '\n\nLIB:\n' + L + '\nPAGE:\n' + P)
    if (failures >= 2) break
  }
}
await b.close()
console.log('SWEEPDONE failures=' + failures)
