import fs from 'node:fs'
const N = Number(process.argv[2] ?? 2000)
const dir = new URL('../generated/client/', import.meta.url)
fs.rmSync(dir, { recursive: true, force: true })
fs.mkdirSync(dir, { recursive: true })
for (let i = 0; i < N; i++) {
  const next = i + 1 < N ? `import Next from './mod${i + 1}.js'\n` : ''
  const render = i + 1 < N ? '<Next />' : 'null'
  fs.writeFileSync(new URL(`mod${i}.js`, dir),
`'use client'
${next}export const value${i} = ${i}
export default function Mod${i}() {
  return ${render}
}
`)
}
console.log('generated', N, 'modules')
