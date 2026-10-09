import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const DEF_SRC =
  '"((?:\\[project\\]|\\[next\\]|\\[turbopack\\])[^"]+)",\\s*(?:async\\s*)?(?:\\([\\w,\\s]*\\)|\\w+)\\s*=>\\s*\\{'

function defs(file) {
  const src = fs.readFileSync(file, 'utf8')
  const re = new RegExp(DEF_SRC, 'g')
  const found = []
  let m
  while ((m = re.exec(src))) found.push({ id: m[1], start: m.index })
  const out = new Map()
  for (let i = 0; i < found.length; i++)
    out.set(
      found[i].id,
      src.slice(found[i].start, i + 1 < found.length ? found[i + 1].start : src.length)
    )
  return out
}

const dir = '.next/static/chunks'
const files = fs.readdirSync(dir).map((f) => path.join(dir, f)).filter((f) => f.endsWith('.js'))
const map = new Map()
for (const f of files)
  for (const [id, code] of defs(f)) {
    const e = map.get(id) || { chunks: [], code }
    e.chunks.push(path.basename(f))
    if (code.length > e.code.length) e.code = code
    map.set(id, e)
  }
const dups = [...map].filter(([, e]) => e.chunks.length > 1)
const raw = dups.reduce((a, [, e]) => a + e.code.length * (e.chunks.length - 1), 0)
const br = dups.length
  ? zlib.brotliCompressSync(Buffer.from(dups.map(([, e]) => e.code).join('\n'))).length
  : 0
console.log(`build-wide duplicated module definitions: ${dups.length} (extra raw ${raw}B, brotli of one copy ~${br}B)`)
for (const [id, e] of dups.sort((a, b) => b[1].code.length - a[1].code.length).slice(0, 12))
  console.log(`  x${e.chunks.length} ${e.code.length}B ${id.replace('[project]/', '')} -> ${e.chunks.join(', ')}`)

// which routes load each duplicated chunk
const routes = fs.readdirSync('.next/server/app').filter((f) => f.endsWith('.html'))
const byRoute = {}
for (const r of routes)
  byRoute[r] = [...new Set((fs.readFileSync('.next/server/app/' + r, 'utf8').match(/static\/chunks\/[\w./-]+\.js/g) || []).map((c) => path.basename(c)))]
console.log('\nroute -> chunks')
for (const [r, c] of Object.entries(byRoute)) console.log(' ', r, c.join(' '))
