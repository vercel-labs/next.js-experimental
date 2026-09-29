import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

const encoded = {
  static: '/%D1%82%D0%B5%D1%81%D1%82',
  nested:
    '/%D1%82%D0%B5%D1%81%D1%82/%D0%B2%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%BD%D0%B0%D1%8F',
  dynamicPrerendered:
    '/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
  dynamicAscii: '/%D0%B1%D0%BB%D0%BE%D0%B3/hello',
  dynamicOnDemand: '/%D0%B1%D0%BB%D0%BE%D0%B3/other',
  catchAll: '/%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3/one/two',
  routeHandler: '/%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5',
}

describe('non-ascii-route-names (app router)', () => {
  const { next } = nextTestSetup({ files: __dirname })

  describe('server rendering with percent-encoded paths', () => {
    it('renders a static route whose segment is non-ASCII', async () => {
      const $ = await next.render$(encoded.static)
      expect($('#static').text()).toBe('static тест')
    })

    it('renders a nested static route whose segments are non-ASCII', async () => {
      const $ = await next.render$(encoded.nested)
      expect($('#nested').text()).toBe('nested вложенная')
    })

    it('renders a dynamic route under a non-ASCII segment', async () => {
      const $ = await next.render$(encoded.dynamicAscii)
      expect($('#dynamic').text()).toBe('блог: hello')
    })

    it('renders a dynamic route under a non-ASCII segment that was not prerendered', async () => {
      const $ = await next.render$(encoded.dynamicOnDemand)
      expect($('#dynamic').text()).toBe('блог: other')
    })

    it('renders a prerendered dynamic route with a non-ASCII param', async () => {
      const res = await next.fetch(encoded.dynamicPrerendered)
      expect(res.status).toBe(200)
      // The param value reaches the page still percent-encoded, which is
      // pre-existing app router behavior for every dynamic route and is not
      // specific to a non-ASCII route name. What matters here is that the
      // route is resolved instead of rendering the 404 page.
      expect(await res.text()).toContain('id="dynamic"')
    })

    it('renders a catch-all route under a non-ASCII segment', async () => {
      const $ = await next.render$(encoded.catchAll)
      expect($('#catch-all').text()).toBe('каталог: one/two')
    })

    it('serves a route handler with a non-ASCII name', async () => {
      const res = await next.fetch(encoded.routeHandler)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ route: 'данные' })
    })
  })

  describe('server rendering with unencoded paths', () => {
    // Clients percent-encode these paths, but proxies such as nginx can
    // forward the decoded form.
    it('renders a static route', async () => {
      const $ = await next.render$('/тест')
      expect($('#static').text()).toBe('static тест')
    })

    it('renders a dynamic route under a non-ASCII segment', async () => {
      const $ = await next.render$('/блог/hello')
      expect($('#dynamic').text()).toBe('блог: hello')
    })
  })

  describe('client-side navigation', () => {
    it('navigates to a static non-ASCII route', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-static').click()

      await retry(async () => {
        expect(await browser.elementByCss('#static').text()).toBe('static тест')
      })
    })

    it('navigates to a nested static non-ASCII route', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-nested').click()

      await retry(async () => {
        expect(await browser.elementByCss('#nested').text()).toBe(
          'nested вложенная'
        )
      })
    })

    it('navigates to a dynamic route under a non-ASCII segment', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-dynamic').click()

      await retry(async () => {
        expect(await browser.elementByCss('#dynamic').text()).toBe(
          'блог: hello'
        )
      })
    })

    it('navigates to a catch-all route under a non-ASCII segment', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-catch-all').click()

      await retry(async () => {
        expect(await browser.elementByCss('#catch-all').text()).toBe(
          'каталог: one/two'
        )
      })
    })
  })

  it('builds and serves the non-ASCII routes without an encoding error', async () => {
    // Encoding a non-Latin1 segment used to throw `InvalidCharacterError`
    // from `btoa` while prerendering.
    expect(next.cliOutput).not.toContain('InvalidCharacterError')
  })
})
