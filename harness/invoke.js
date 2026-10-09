// Invokes the generated launcher the way the Vercel image optimizer does when
// the local source answered 5xx: the function is invoked for the OUTER
// /_next/image URL (x-matched-path: /_next/image).
const http = require('http')
const path = require('path')

const root = path.join(__dirname, '..')
process.chdir(root)
const handler = require(path.join(root, '___next_launcher.cjs'))

const server = http.createServer((req, res) => {
  Promise.resolve(handler(req, res)).catch((err) => {
    if (!res.headersSent) {
      res.statusCode = 500
      res.end('launcher crashed: ' + err.code)
    }
  })
})

async function hit(label, url, matchedPath) {
  const res = await fetch(`http://127.0.0.1:3200${url}`, {
    headers: { 'x-matched-path': matchedPath },
  })
  console.log(`\n== ${label} -> ${res.status}\n${(await res.text()).slice(0, 200)}`)
}

server.listen(3200, async () => {
  await hit('source route /api/image', '/api/image', '/api/image')
  await hit(
    'image optimizer fallback invocation',
    '/_next/image?url=%2Fapi%2Fimage&w=64&q=75',
    '/_next/image'
  )
  server.close()
})
