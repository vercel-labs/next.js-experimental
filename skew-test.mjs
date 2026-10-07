// Reproduction: a long-lived browser session running the next@16.3.8 client
// calls a Server Action after the same origin has been redeployed with next@16.4.0.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const APP = path.join(ROOT, 'app')
const STASH = path.join(ROOT, 'stash')
const ART = process.env.ARTIFACT_DIR || path.join(ROOT, 'artifacts')
fs.mkdirSync(path.join(ART, 'next-server'), { recursive: true })
fs.mkdirSync(path.join(ART, 'playwright'), { recursive: true })
const PORT = 3000
const env = { ...process.env, NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: 'cGFkZGluZ3BhZGRpbmdwYWRkaW5ncGFkZGluZzEyMzQ1Ng==' }

function link(version) {
  for (const name of ['.next', 'node_modules']) {
    const target = path.join(APP, name)
    fs.rmSync(target, { recursive: true, force: true })
    fs.symlinkSync(path.join(STASH, version, name), target)
  }
}
function startServer(version) {
  const out = fs.openSync(path.join(ART, 'next-server', `server-${version}.log`), 'a')
  return spawn(process.execPath, [path.join(STASH, version, 'node_modules/next/dist/bin/next'), 'start', '-p', String(PORT)],
    { cwd: APP, env, stdio: ['ignore', out, out], detached: true })
}
const wait = ms => new Promise(r => setTimeout(r, ms))
async function up() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/`); if (r.ok) return } catch {}
    await wait(500)
  }
  throw new Error('server never became ready')
}
async function down(proc) {
  try { process.kill(-proc.pid, 'SIGKILL') } catch {}
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://127.0.0.1:${PORT}/`) } catch { return }
    await wait(500)
  }
  throw new Error(`port ${PORT} is still serving; kill the stale next-server process`)
}
async function runAction(page) {
  await page.evaluate(() => { document.querySelector('#out').textContent = 'idle' })
  await page.click('#run')
  await page.waitForFunction(() => document.querySelector('#out').textContent !== 'idle', null, { timeout: 30000 })
  return page.textContent('#out')
}

link('16.3.8')
let server = startServer('16.3.8')
await up()

const browser = await chromium.launch()
const page = await browser.newPage()
const bodies = []
page.on('requestfinished', async req => {
  if (req.method() !== 'POST') return
  const res = await req.response()
  let body = ''
  try { body = (await res.text()).slice(0, 500) } catch (e) { body = '<' + e.message + '>' }
  bodies.push(`HTTP ${res.status()} ${res.headers()['content-type']}\n${body}`)
})
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' })
console.log('[1] session opened against next@16.3.8 deployment')
console.log('    action result:', (await runAction(page)).split('\n')[0])
console.log('    action response:\n' + bodies.at(-1))

await down(server)
link('16.4.0')
server = startServer('16.4.0')
await up()
console.log('[2] origin redeployed with next@16.4.0; browser still runs the 16.3.8 client')
const result = await runAction(page)
console.log('    action result:', result)
console.log('    action response:\n' + bodies.at(-1))
// Raw action response from the 16.4.0 server, for the record.
const raw = await page.evaluate(async (id) => {
  const r = await fetch(location.href, { method: 'POST', headers: { 'next-action': id, 'content-type': 'text/plain;charset=UTF-8', 'accept': 'text/x-component' }, body: '[]' })
  return r.status + ' ' + r.headers.get('content-type') + '\n' + (await r.text())
}, process.env.ACTION_ID || '004296b45c6a9b661f22fd048c4fcadf3a3e56e35e')
console.log('    raw 16.4.0 action response:\n' + raw)
await page.screenshot({ path: path.join(ART, 'playwright', 'skew-action-result.png'), fullPage: true })
await browser.close()
await down(server)
console.log(result.startsWith('rejected') ? '\nREPRODUCED: the action promise rejected' : '\nNOT REPRODUCED: the action resolved')
process.exit(0)
