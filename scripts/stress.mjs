// Stress harness for: "next dev panics with a missing-task error after cache
// compaction when turbopackGc is on".
//
// Each cycle:
//   1. `next build` (persistent build cache writes into .next/cache)
//   2. `next dev`   -> request routes, idle so GC + fs-cache compaction run
//   3. edit next.config.ts (CONFIG_REV bump) -> dev server restarts
//   4. request routes again, edit a source module, request again
//   5. kill dev, next cycle reuses the persistent dev cache
//
// Fails as soon as a Turbopack panic / missing-task error / HTTP 500 /
// hung request is observed.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const ROOT = path.resolve(import.meta.dirname, '..')
const LOGDIR =
  process.env.LOGDIR ??
  '/workspace/.next-maintainer/reproduction-artifacts/next-server'
fs.mkdirSync(LOGDIR, { recursive: true })

const CYCLES = Number(process.env.CYCLES ?? 6)
const PORT = Number(process.env.PORT ?? 3000)
const IDLE_MS = Number(process.env.IDLE_MS ?? 20000)

const BAD = [
  /panicked/i,
  /missing in memory and persistent storage/i,
  /Next.js package not found/i,
  /internal (turbopack|error)/i,
  /FATAL/,
]

let rev = 0
const findings = []

function bumpConfig() {
  rev++
  const p = path.join(ROOT, 'next.config.ts')
  const src = fs.readFileSync(p, 'utf8')
  fs.writeFileSync(p, src.replace(/CONFIG_REV = \d+/, `CONFIG_REV = ${rev}`))
}

function touchModule(i) {
  const p = path.join(ROOT, 'gen', `m${i}.ts`)
  const src = fs.readFileSync(p, 'utf8')
  fs.writeFileSync(p, src + `// touched ${Date.now()}\n`)
}

function run(cmd, args, logFile, opts = {}) {
  const out = fs.createWriteStream(logFile, { flags: 'a' })
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, FORCE_COLOR: '0', ...(opts.env ?? {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let buf = ''
  const onData = (d) => {
    const s = d.toString()
    buf += s
    out.write(s)
  }
  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  return { child, get log() { return buf }, close: () => out.end() }
}

async function get(url, timeoutMs = 60000) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), timeoutMs)
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: ac.signal })
    const body = await res.text()
    return { status: res.status, body, ms: Date.now() - start }
  } catch (e) {
    return { status: 0, body: String(e), ms: Date.now() - start, error: true }
  } finally {
    clearTimeout(t)
  }
}

function scan(label, log) {
  for (const re of BAD) {
    const m = log.match(new RegExp(`.*${re.source}.*`, re.flags.includes('i') ? 'i' : ''))
    if (m) {
      findings.push(`${label}: ${m[0].trim().slice(0, 400)}`)
      return true
    }
  }
  return false
}

async function waitReady(h, timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (/Ready in|started server on|- Local:/i.test(h.log)) return true
    if (h.child.exitCode !== null) return false
    await sleep(500)
  }
  return false
}

async function hit(paths, label) {
  for (const p of paths) {
    const r = await get(`http://127.0.0.1:${PORT}${p}`)
    console.log(`    GET ${p} -> ${r.status} in ${r.ms}ms`)
    if (r.status === 0) {
      findings.push(`${label}: GET ${p} hung/failed after ${r.ms}ms (${r.body.slice(0, 120)})`)
      return false
    }
    if (r.status >= 500) {
      findings.push(`${label}: GET ${p} -> HTTP ${r.status}`)
      return false
    }
  }
  return true
}

for (let cycle = 1; cycle <= CYCLES; cycle++) {
  console.log(`\n=== cycle ${cycle}/${CYCLES} ===`)

  // 1. production build in between dev sessions
  const buildLog = path.join(LOGDIR, `cycle${cycle}-build.log`)
  fs.writeFileSync(buildLog, '')
  const b = run('node', ['node_modules/next/dist/bin/next', 'build'], buildLog)
  await new Promise((r) => b.child.on('exit', r))
  b.close()
  console.log(`  build exit=${b.child.exitCode}`)
  if (scan(`cycle${cycle} build`, b.log) || b.child.exitCode !== 0) break

  // 2. dev session
  const devLog = path.join(LOGDIR, `cycle${cycle}-dev.log`)
  fs.writeFileSync(devLog, '')
  const d = run(
    'node',
    ['node_modules/next/dist/bin/next', 'dev', '-p', String(PORT)],
    devLog
  )
  const ready = await waitReady(d)
  console.log(`  dev ready=${ready}`)
  let ok = ready
  if (ok) ok = await hit(['/', '/about', '/api/ping'], `cycle${cycle} initial`)

  if (ok) {
    console.log(`  idling ${IDLE_MS}ms for GC / fs-cache compaction…`)
    await sleep(IDLE_MS)
    ok = await hit(['/', '/about'], `cycle${cycle} post-idle`)
  }

  if (ok) {
    console.log('  editing source module (invalidate + collect)')
    touchModule(cycle % 120)
    await sleep(3000)
    ok = await hit(['/about'], `cycle${cycle} post-edit`)
  }

  if (ok) {
    console.log('  bumping next.config.ts -> dev server restart')
    bumpConfig()
    await sleep(8000)
    ok = await hit(['/', '/about', '/api/ping'], `cycle${cycle} post-config-restart`)
  }

  if (ok) {
    console.log(`  second idle ${IDLE_MS}ms`)
    await sleep(IDLE_MS)
    ok = await hit(['/', '/about'], `cycle${cycle} post-idle-2`)
  }

  const bad = scan(`cycle${cycle} dev`, d.log)
  d.child.kill('SIGINT')
  await sleep(4000)
  if (d.child.exitCode === null) d.child.kill('SIGKILL')
  d.close()

  if (bad || !ok) {
    console.log(`\nFAILED at cycle ${cycle}`)
    break
  }
}

console.log('\n==== FINDINGS ====')
console.log(findings.length ? findings.join('\n') : 'none')
process.exit(findings.length ? 1 : 0)
