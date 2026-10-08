// Writes one of two source-tree variants ("base" | "variant").
// Swapping between them is equivalent to reverting/reapplying source files with git.
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const ui = path.join(root, 'packages/ui')
const app = path.join(root, 'apps/web/app')
const TOTAL = 400

const which = process.argv[2] || 'base'
const count = which === 'variant' ? 250 : TOTAL
const version = which === 'variant' ? 'v2' : 'v1'

fs.mkdirSync(path.join(ui, 'mods'), { recursive: true })
for (let i = 0; i < TOTAL; i++) {
  const file = path.join(ui, 'mods', `m${i}.js`)
  if (i < count) {
    fs.writeFileSync(file, `export const v${i} = ${i};\nexport function C${i}(){return <span>mod ${i} ${version}</span>}\n`)
  } else if (fs.existsSync(file)) {
    fs.rmSync(file)
  }
}
const idx = [...Array(count).keys()]
fs.writeFileSync(
  path.join(ui, 'index.js'),
  `export function Button({children}){return <button>{children}</button>}\nexport const VERSION = '${version}'\n` +
    idx.map((i) => `export { C${i}, v${i} } from "./mods/m${i}.js"`).join('\n') +
    '\n'
)
fs.writeFileSync(
  path.join(app, 'page.js'),
  `import * as UI from "@repro/ui"\nimport { Extra } from "./extra"\nexport default function Page(){\n  return <div><UI.Button>hi {UI.VERSION}</UI.Button><Extra />{${JSON.stringify(idx)}.map(i=>{const C=UI["C"+i];return <C key={i}/>})}</div>\n}\n`
)
fs.writeFileSync(path.join(app, 'extra.js'), `export function Extra(){return <p>extra ${version}</p>}\n`)
// extra routes exist only in the "variant" tree
for (let r = 0; r < 20; r++) {
  const dir = path.join(app, `r${r}`)
  if (which === 'variant') {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'page.js'), `export default function P(){return <p>route ${r}</p>}\n`)
  } else if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
console.log(`applied ${which} tree (${count} modules)`)
