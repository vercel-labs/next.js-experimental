// Harness: start `next dev`, wait until ready, then kill the forked dev-server
// child process with SIGSEGV (simulating a native crash), and report how the
// top-level `next dev` process terminates.
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const logDir = process.env.REPRO_LOG_DIR || process.cwd()
fs.mkdirSync(logDir, { recursive: true })
const logPath = path.join(logDir, 'next-dev.log')
const log = fs.createWriteStream(logPath)

const dev = spawn('node', ['node_modules/next/dist/bin/next', 'dev', '--port', '3000'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
})

let out = ''
for (const s of [dev.stdout, dev.stderr]) {
  s.on('data', (d) => {
    out += d
    process.stdout.write(d)
    log.write(d)
  })
}

const waitFor = (re, ms) =>
  new Promise((res, rej) => {
    const t0 = Date.now()
    const i = setInterval(() => {
      if (re.test(out)) { clearInterval(i); res() }
      else if (Date.now() - t0 > ms) { clearInterval(i); rej(new Error('timeout waiting for ' + re)) }
    }, 200)
  })

await waitFor(/Ready in|started server on|Local:/i, 120000)
await fetch('http://localhost:3000/').then((r) => r.text())

// find forked start-server child
const kids = execSync(`pgrep -P ${dev.pid}`).toString().trim().split('\n').filter(Boolean)
console.log('\n[repro] next dev pid=%d, child server pid(s)=%s', dev.pid, kids.join(','))
console.log('[repro] sending SIGSEGV to child server process\n')
for (const k of kids) process.kill(Number(k), 'SIGSEGV')

const [code, signal] = await new Promise((res) => dev.on('exit', (c, s) => res([c, s])))
const printedCrash = /SIGSEGV|crash|killed by signal|signal/i.test(out)
console.log('\n[repro] ---- RESULT ----')
console.log('[repro] `next dev` exit code :', code)
console.log('[repro] `next dev` exit signal:', signal)
console.log('[repro] mentioned the crash in output:', printedCrash)
console.log('[repro] expected: non-zero exit code + a message about the server process dying from SIGSEGV')
fs.writeFileSync(path.join(logDir, 'result.json'), JSON.stringify({ code, signal, printedCrash }, null, 2))
process.exit(0)
