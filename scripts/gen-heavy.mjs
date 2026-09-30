// Generates 300 components imported by /about and /contact so on-demand dev
// compilation of the destination route is measurable (~1s).
import fs from 'node:fs'
fs.mkdirSync('components', { recursive: true })
let imp = '', use = ''
for (let i = 0; i < 300; i++) {
  fs.writeFileSync(`components/C${i}.js`, `export default function C${i}(){return <span>c${i}</span>}\n`)
  imp += `import C${i} from '../../components/C${i}'\n`
  use += `<C${i} />`
}
fs.writeFileSync('app/about/page.js', imp + `export default function About(){return <div><h1 id="about">About page</h1>${use}</div>}\n`)
fs.writeFileSync('app/contact/page.js', imp + `export default function Contact(){return <div><h1 id="contact">Contact page</h1>${use}</div>}\n`)
