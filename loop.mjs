// Repro harness: add a new export to a server-only leaf module (re-exported via a
// barrel + consumed with a namespace import inside a `use cache` component), then
// wire it into the component while a request is in flight. Watch for
// `{imported module ...}.fN is not a function` from the dev server.
import fs from 'node:fs'
import path from 'node:path'

const PORT = process.env.PORT ?? '3200'
const ITER = Number(process.env.ITER ?? 40)
const root = path.dirname(new URL(import.meta.url).pathname)
const leaf = path.join(root, 'lib/data.ts')
const comp = path.join(root, 'app/_components/extra.tsx')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const get = async () => {
  const res = await fetch(`http://localhost:${PORT}/?t=${Date.now()}`)
  return { status: res.status, body: await res.text() }
}

let transient = 0
let persistent = 0

for (let i = 1; i <= ITER; i++) {
  fs.writeFileSync(
    leaf,
    `import 'server-only'\n\nexport async function getTitle(): Promise<string> {\n  return 'title'\n}\n\nexport async function f${i}(): Promise<string> {\n  return 'F${i}'\n}\n`
  )
  const inflight = get().catch(() => ({ status: 0, body: '' }))
  await sleep(Number(process.env.GAP ?? 120))
  fs.writeFileSync(
    comp,
    `import * as data from '@/lib'\n\nexport async function Extra() {\n  'use cache'\n  const title = await data.getTitle()\n  const value = await (data as any).f${i}()\n  return (\n    <div id="extra">\n      extra:{title}:{value}\n    </div>\n  )\n}\n`
  )
  await inflight
  await sleep(500)
  let r = await get()
  if (!r.body.includes(`F${i}`)) {
    transient++
    const typeErr = /is not a function/.test(r.body)
    console.log(`iter ${i}: FAIL status=${r.status} isNotAFunction=${typeErr}`)
    for (let a = 0; a < 6; a++) {
      await sleep(1500)
      r = await get()
      if (r.body.includes(`F${i}`)) break
    }
    if (!r.body.includes(`F${i}`)) {
      persistent++
      console.log(`iter ${i}: PERSISTENT (did not recover after ~9s of reloads)`)
    } else {
      console.log(`iter ${i}: recovered without restart`)
    }
  }
}
console.log(`DONE iterations=${ITER} transientFailures=${transient} persistentFailures=${persistent}`)
