import { readFileSync } from 'node:fs'
const m = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'))
console.log('--- static routes (prerender-manifest.routes) ---')
for (const [k, v] of Object.entries(m.routes))
  console.log(k, '| response:', v.response, '| compute:', v.compute)
console.log('--- dynamic routes (prerender-manifest.dynamicRoutes) ---')
for (const [k, v] of Object.entries(m.dynamicRoutes))
  console.log(k, '| response:', v.response, '| compute:', v.compute)
