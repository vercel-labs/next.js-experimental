// Requests /edge (runtime = 'edge') and /node (default runtime) with several bot
// user agents and reports whether the metadata is emitted before </head>.
import http from 'http'

const uas = [
  'TelegramBot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Twitterbot',
  'facebookexternalhit/1.1',
  'Slackbot-LinkExpanding 1.0',
  'Mozilla/5.0',
]
const paths = ['/edge', '/node']
const port = process.env.PORT || 3000

function get(path, ua) {
  return new Promise((resolve) => {
    const start = Date.now()
    const chunks = []
    http.get(
      { host: 'localhost', port, path, headers: { 'user-agent': ua } },
      (res) => {
        res.setEncoding('utf8')
        res.on('data', (d) => chunks.push({ t: Date.now() - start, d }))
        res.on('end', () => resolve(chunks))
      }
    )
  })
}

for (const path of paths) {
  for (const ua of uas) {
    const chunks = await get(path, ua)
    const first = chunks[0]?.d ?? ''
    const full = chunks.map((c) => c.d).join('')
    const headEnd = full.indexOf('</head>')
    const titleIdx = full.indexOf('<title>')
    console.log(`${path} | UA=${ua}`)
    console.log(
      `  chunks=${chunks.length} firstChunkAt=${chunks[0]?.t}ms lastAt=${chunks.at(-1)?.t}ms`
    )
    console.log(
      `  firstChunkHasTitle=${first.includes('<title>')} titleBeforeHeadClose=${
        titleIdx > -1 && headEnd > -1 ? titleIdx < headEnd : 'n/a'
      } (titleIdx=${titleIdx}, headEnd=${headEnd})`
    )
  }
}
