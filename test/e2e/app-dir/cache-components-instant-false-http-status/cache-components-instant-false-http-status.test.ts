import { nextTestSetup } from 'e2e-utils'

describe('cache-components - instant = false HTTP status', () => {
  const { next, isNextDev, skipped } = nextTestSetup({
    files: __dirname,
    // The behavior under test is the status code of the production server
    // response, which the deploy harness serves through a different proxy.
    skipDeployment: true,
  })

  if (skipped) return

  it('answers 307 for a redirect() page without request data', async () => {
    const response = await next.fetch('/redirect-static', {
      redirect: 'manual',
    })

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('/')
  })

  it('answers 200 instead of 307 for a redirect() page that reads searchParams', async () => {
    const response = await next.fetch('/redirect-dynamic', {
      redirect: 'manual',
    })

    if (isNextDev) {
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('/')
      return
    }

    // TODO(cache-components): This intentionally asserts broken behavior.
    // `instant = false` is documented to keep the route rendering as before,
    // so the server `redirect()` should still produce a 307. Because the
    // prerendered shell of this partially prerendered route is flushed before
    // the dynamic render reaches `redirect()`, the response is downgraded to a
    // 200 that performs the redirect on the client instead.
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBe(null)

    // The redirect still happens, but only once the client has run.
    const browser = await next.browser('/redirect-dynamic')
    await browser.waitForElementByCss('#home')
  })

  it('answers 200 instead of 404 for a notFound() page that reads params', async () => {
    const okResponse = await next.fetch('/items/ok')
    expect(okResponse.status).toBe(200)

    const response = await next.fetch('/items/unknown')

    if (isNextDev) {
      expect(response.status).toBe(404)
      return
    }

    // TODO(cache-components): This intentionally asserts broken behavior.
    // With `instant = false` the server `notFound()` should still produce a
    // 404. The prerendered shell is flushed first, so the 404 UI is streamed
    // in with a 200 status instead.
    expect(response.status).toBe(200)

    const browser = await next.browser('/items/unknown')
    expect(await browser.elementByCss('body').text()).toContain(
      'This page could not be found'
    )
  })
})
