import { readFileSync } from 'node:fs'
const m = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'))
console.log('prerender-manifest routes:')
for (const [k, v] of Object.entries(m.routes)) {
  console.log(' ', k, 'initialRevalidateSeconds=' + v.initialRevalidateSeconds, 'initialExpireSeconds=' + v.initialExpireSeconds)
}
