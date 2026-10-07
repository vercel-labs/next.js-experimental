import { nextTestSetup } from 'e2e-utils'

// TODO(deploy-test-completion): Re-enable this suite in deploy mode once the
// HTTP status of a client-thrown `notFound()` is verified on Vercel.
// @force-gate !deploy
describe('app dir - notFound() called while rendering a Client Component', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('renders the nearest not-found boundary on a client navigation', async () => {
    const browser = await next.browser('/')
    await browser.elementById('to-invalid-item').click()

    expect(await browser.waitForElementByCss('#item-not-found').text()).toBe(
      'item not found'
    )
  })

  it('renders the page normally for a valid param', async () => {
    const browser = await next.browser('/item/1')
    expect(await browser.waitForElementByCss('#item').text()).toBe('item 1')
  })

  // Current behavior: because `notFound()` is called while rendering a Client
  // Component, the server never throws the not-found error. The streamed HTML
  // only contains the Suspense fallback and the response is a 200 instead of a
  // 404.
  it('responds with 200 and the Suspense fallback on a full page load', async () => {
    const res = await next.fetch('/item/nope')
    expect(res.status).toBe(200)

    const html = await res.text()
    expect(html).toContain('id="suspense-fallback"')
    expect(html).not.toContain('id="item-not-found"')
  })

  it('swaps in the not-found boundary after hydration on a full page load', async () => {
    const browser = await next.browser('/item/nope')

    expect(await browser.waitForElementByCss('#item-not-found').text()).toBe(
      'item not found'
    )
  })
})
