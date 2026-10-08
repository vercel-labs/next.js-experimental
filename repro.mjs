// Simulates a no-JS (progressive enhancement) server action postback:
// a plain multipart/form-data POST with the hidden $ACTION fields + Origin.
const BASE = process.env.BASE ?? 'http://localhost:3000'
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? 120000)

const dec = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const field = (html, name) => {
  const m = html.match(
    new RegExp(`name="\\${name}"\\s+value="([^"]*)"`)
  )
  return m ? dec(m[1]) : ''
}

async function postback(path) {
  const html = await (await fetch(BASE + path)).text()
  const body = new FormData()
  body.set('$ACTION_REF_1', '')
  body.set('$ACTION_1:0', field(html, '$ACTION_1:0'))
  body.set('$ACTION_1:1', field(html, '$ACTION_1:1'))
  body.set('$ACTION_KEY', field(html, '$ACTION_KEY'))
  body.set('name', 'world')

  const t0 = Date.now()
  process.stdout.write(`POST ${path} (no-JS postback) ... `)
  try {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { Origin: BASE },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const text = await res.text()
    const state = text.match(/<pre id="state">([^<]*)/)?.[1] ?? '(none)'
    console.log(`HTTP ${res.status} in ${Date.now() - t0}ms, state=${dec(state)}`)
  } catch (err) {
    console.log(
      `NO RESPONSE after ${Date.now() - t0}ms (${err.name}) — check the dev server log`
    )
  }
}

await postback('/stable') // control: stable action reference
await postback('/') // bug: action bound during render
