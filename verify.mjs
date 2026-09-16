import { spawn } from 'node:child_process'
import { once } from 'node:events'

const build = spawn('npx', ['next', 'build'], { stdio: 'inherit' })
if ((await once(build, 'exit'))[0] !== 0) process.exit(1)

const server = spawn('npx', ['next', 'start', '-p', '3123'], { stdio: 'inherit' })
let html = ''
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 500))
  try {
    const res = await fetch('http://localhost:3123/')
    html = await res.text()
    break
  } catch {}
}
server.kill('SIGKILL')

const head = html.slice(0, html.indexOf('</head>'))
const links = head.match(/<link[^>]*>/g) ?? []
console.log('\nHead links:\n' + links.join('\n'))

const stylesheets = links.filter((l) => l.includes('rel="stylesheet"'))
const stylePreloads = links.filter(
  (l) => l.includes('rel="preload"') && l.includes('as="style"')
)
console.log(
  `\nstylesheet links: ${stylesheets.length}, style preload hints: ${stylePreloads.length}`
)
if (stylesheets.length > 0 && stylePreloads.length === 0) {
  console.log('REPRODUCED: layout CSS has no rel="preload" as="style" hint')
  process.exit(0)
}
console.log('NOT REPRODUCED')
process.exit(1)
