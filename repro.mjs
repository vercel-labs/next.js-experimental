import { spawn, spawnSync } from 'node:child_process'
import { chromium } from 'playwright'

const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' })
if (build.status !== 0) process.exit(build.status ?? 1)

const server = spawn('npm', ['run', 'start'], { stdio: 'inherit', detached: true })
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:3000/en/listing')
      if (response.ok) break
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } })
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('_rsc=')) {
      requests.push({
        time: Date.now(),
        path: new URL(request.url()).pathname,
        segment: request.headers()['next-router-segment-prefetch'] || '',
      })
    }
  })

  await page.goto('http://127.0.0.1:3000/en/listing', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const idleStart = Date.now()
  await page.waitForTimeout(5000)
  const idleRequests = requests.filter((request) => request.time >= idleStart)
  const counts = Object.groupBy(idleRequests, ({ path, segment }) => `${path}|${segment}`)

  console.log(JSON.stringify({
    totalRscRequests: requests.length,
    idleRscRequestsIn5Seconds: idleRequests.length,
    idleRequestsByPathAndSegment: Object.fromEntries(
      Object.entries(counts).map(([key, values]) => [key, values.length])
    ),
  }, null, 2))
  await browser.close()
} finally {
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
}
