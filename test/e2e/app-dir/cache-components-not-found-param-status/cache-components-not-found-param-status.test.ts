import { nextTestSetup } from 'e2e-utils'

// The inconsistency only exists for a built app served by `next start`: it
// depends on the partial prerender of `/item/[slug]` being served before the
// param is known to be invalid.
// @force-gate start
describe('cache-components-not-found-param-status', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('serves a prerendered param with a 200', async () => {
    const res = await next.fetch('/item/alpha')
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<p id="item">alpha</p>')
  })

  it('answers the first request for an unlisted invalid param with 200, later requests with 404', async () => {
    const pathname = '/item/never-requested-before'

    const first = await next.fetch(pathname)
    // Current behavior: the 404 document is streamed into a shell that was
    // already flushed with a 200 status. Expected: 404 on the first request
    // too.
    expect(first.status).toBe(200)
    expect(await first.text()).toContain('name="robots"')

    expect((await next.fetch(pathname)).status).toBe(404)
    expect((await next.fetch(pathname)).status).toBe(404)
  })

  it('answers the first request with 200 for a crawler user agent as well', async () => {
    const pathname = '/item/never-requested-by-a-crawler'
    const headers = {
      'user-agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    }

    const first = await next.fetch(pathname, { headers })
    expect(first.status).toBe(200)

    expect((await next.fetch(pathname, { headers })).status).toBe(404)
  })
})
