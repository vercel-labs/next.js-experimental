import fs from 'node:fs'
const ROOT = '/workspace/variant-barrel'
const BASE = 'http://localhost:3103'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const leaf = `${ROOT}/src/lib/data.ts`
const barrel = `${ROOT}/src/lib/index.ts`
const dash = `${ROOT}/src/app/(main)/dash/page.tsx`
const item = `${ROOT}/src/app/(main)/items/[id]/page.tsx`

const baseLeaf = `import 'server-only'

export type Item = { id: string; title: string }

export async function getItems(): Promise<Item[]> {
  return [ { id: '1', title: 'One' }, { id: '2', title: 'Two' } ]
}

export async function getItem(id: string): Promise<Item> {
  return { id, title: \`Item \${id}\` }
}
`

function writeLeaf(n) {
  let s = baseLeaf
  for (let i = 1; i <= n; i++) {
    s += `\nexport function newFn${i}(): string {\n  return 'NEW${i}'\n}\n`
  }
  fs.writeFileSync(leaf, s)
}

function writeBarrelStar() {
  fs.writeFileSync(barrel, `export * from './data'\nexport * from './db'\nexport * from './users'\nexport * from './generated'\n`)
}

function writeBarrelNamed(n) {
  const names = ['getItems', 'getItem']
  for (let i = 1; i <= n; i++) names.push(`newFn${i}`)
  let s = `export type { Item } from './data'\nexport { ${names.join(', ')} } from './data'\nexport * from './db'\nexport * from './users'\nexport * from './generated'\n`
  fs.writeFileSync(barrel, s)
}

function writeDash(n) {
  const extra = n ? `, newFn${n}` : ''
  fs.writeFileSync(dash, `import { getItems, getUsers, compute1${extra} } from '@/lib'

export default async function Dash() {
  const items = await getItems()
  const users = await getUsers()
  return (
    <main>
      dash:{items.length}:{users.length}:{compute1(2)}:${n ? `{newFn${n}()}` : ''}
    </main>
  )
}
`)
}

function writeItem(n) {
  const extra = n ? `, newFn${n}` : ''
  fs.writeFileSync(item, `import { getItem, compute2${extra} } from '@/lib'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const it = await getItem(id)
  return (
    <main>
      item:{it.title}:{compute2(3)}:${n ? `{newFn${n}()}` : ''}
    </main>
  )
}
`)
}

const BAD = ['is not a function', 'not found in module', "doesn't exist in target module", 'is not exported from', 'Cannot find module', 'undefined is not']

async function get(path) {
  try {
    const r = await fetch(BASE + path, { headers: { 'x-loop': '1' } })
    const t = await r.text()
    const bad = BAD.filter((b) => t.includes(b))
    return { status: r.status, bad, len: t.length, snip: bad.length ? t.slice(Math.max(0, t.indexOf(bad[0]) - 200), t.indexOf(bad[0]) + 300) : '' }
  } catch (e) {
    return { status: 0, bad: ['fetch-failed:' + e.message], len: 0, snip: String(e) }
  }
}

async function probe(label, path, attempts) {
  const results = []
  for (const d of attempts) {
    await sleep(d)
    const r = await get(path)
    results.push(`${path} after ${d}ms -> ${r.status}${r.bad.length ? ' BAD[' + r.bad.join('|') + ']' : ' ok'}`)
    if (r.bad.length) console.log(`!!! ${label} SNIPPET: ${r.snip.replace(/\s+/g, ' ')}`)
  }
  console.log(`${label}: ${results.join(' ; ')}`)
  return results.some((x) => x.includes('BAD'))
}

const orders = ['leaf-first', 'page-first', 'both-at-once', 'barrel-last']
let failures = 0

// reset
writeLeaf(0); writeBarrelStar(); writeDash(0); writeItem(0)
await sleep(2500)
console.log('reset probe:', JSON.stringify(await get('/dash')), JSON.stringify(await get('/items/7')))

for (let i = 1; i <= 28; i++) {
  const mode = i <= 14 ? 'star' : 'named'
  const order = orders[i % orders.length]
  const label = `iter ${i} [${mode}/${order}]`
  if (mode === 'star') writeBarrelStar()

  if (order === 'leaf-first') {
    writeLeaf(i)
    if (mode === 'named') { await sleep(600); writeBarrelNamed(i) }
    await sleep(800)
    writeDash(i); writeItem(i)
  } else if (order === 'page-first') {
    writeDash(i); writeItem(i)
    await sleep(900)
    await get('/dash') // force compile of broken state
    writeLeaf(i)
    if (mode === 'named') { await sleep(500); writeBarrelNamed(i) }
  } else if (order === 'both-at-once') {
    writeLeaf(i); if (mode === 'named') writeBarrelNamed(i); writeDash(i); writeItem(i)
  } else {
    // barrel-last
    writeLeaf(i); writeDash(i); writeItem(i)
    await sleep(1200)
    await get('/dash')
    if (mode === 'named') writeBarrelNamed(i); else writeBarrelStar()
  }

  let bad = await probe(label, '/dash', [700, 1200, 2500])
  bad = (await probe(label, '/items/5', [300, 1500])) || bad

  if (bad) {
    console.log(`${label} RETRY after longer wait`)
    const still = await probe(label + ' retry', '/dash', [5000, 5000])
    if (still) {
      console.log(`${label} touching leaf + barrel`)
      fs.appendFileSync(leaf, `\n// touch ${Date.now()}\n`)
      fs.appendFileSync(barrel, `\n// touch ${Date.now()}\n`)
      const persist = await probe(label + ' after-touch', '/dash', [3000, 4000, 6000])
      if (persist) { failures++; console.log(`${label} PERSISTENT FAILURE`) }
      else console.log(`${label} recovered after touch`)
    } else console.log(`${label} recovered after wait`)
  }
}
console.log('DONE persistent-failures=' + failures)
