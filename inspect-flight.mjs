// Fetches a page and prints the Flight payload rows, plus a count of how many
// times each client chunk path literally appears in the wire bytes.
const url = process.argv[2] || 'http://localhost:3000/'
const html = await (await fetch(url)).text()
const parts = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
let buf = ''
for (const [, raw] of parts) {
  try {
    const a = JSON.parse(raw)
    if (typeof a[1] === 'string') buf += a[1]
  } catch {}
}
console.log(buf)
const counts = new Map()
for (const m of buf.matchAll(/(?:\/_next\/)?static\/chunks\/[^"\\]+/g)) {
  counts.set(m[0], (counts.get(m[0]) ?? 0) + 1)
}
console.log('\n--- literal occurrences of each chunk path in payload ---')
console.log(counts)
console.log('client reference rows:', [...buf.matchAll(/^[0-9a-f]+:I\[.*$/gm)].map((m) => m[0]))
