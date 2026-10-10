import { readFile, writeFile } from 'node:fs/promises'

const origin = process.env.ORIGIN || 'http://localhost:3000'
const cssFile = new URL('./app/globals.css', import.meta.url)
const page = await fetch(origin).then(r => r.text())
const href = page.match(/href="([^"]+\.css[^"]*)"/)?.[1]
if (!href) throw new Error('CSS chunk URL not found')
const cssUrl = new URL(href.replaceAll('&amp;', '&'), origin)
const initial = await fetch(cssUrl, { cache: 'no-store' }).then(r => r.text())
if (!initial.includes('INITIAL_MARKER')) throw new Error('Initial marker not served')
const original = await readFile(cssFile, 'utf8')
const edited = original.replace('INITIAL_MARKER', 'EDITED_MARKER_1')
await writeFile(cssFile, edited)
let updated = ''
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 200))
  updated = await fetch(cssUrl, { cache: 'no-store' }).then(r => r.text())
  if (updated.includes('EDITED_MARKER_1')) break
}
console.log(JSON.stringify({
  cssPathBeforeAndAfter: cssUrl.pathname,
  initialMarker: initial.includes('INITIAL_MARKER'),
  editedMarker: updated.includes('EDITED_MARKER_1'),
  staleInitialMarker: updated.includes('INITIAL_MARKER')
}, null, 2))
if (!updated.includes('EDITED_MARKER_1')) process.exitCode = 1
