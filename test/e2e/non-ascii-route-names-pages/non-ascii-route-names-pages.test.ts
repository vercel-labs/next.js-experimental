import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

const encoded = {
  static: '/%D0%BF%D0%B5%D0%B9%D0%B4%D0%B6',
  ssgPrerendered:
    '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
  ssgAscii: '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/hello',
  ssgOnDemand:
    '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C',
  ssr: '/%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
  api: '/api/%D1%8D%D1%85%D0%BE',
}

describe('non-ascii-route-names (pages router)', () => {
  const { next } = nextTestSetup({ files: __dirname })

  describe('server rendering with percent-encoded paths', () => {
    it('renders a static page whose name is non-ASCII', async () => {
      const $ = await next.render$(encoded.static)
      expect($('#static').text()).toBe('static пейдж')
    })

    it('renders a prerendered dynamic page under a non-ASCII segment', async () => {
      const $ = await next.render$(encoded.ssgPrerendered)
      expect($('#ssg').text()).toBe('статья: привет')
    })

    it('renders a dynamic page under a non-ASCII segment with an ASCII param', async () => {
      const $ = await next.render$(encoded.ssgAscii)
      expect($('#ssg').text()).toBe('статья: hello')
    })

    it('renders a fallback dynamic page under a non-ASCII segment', async () => {
      const $ = await next.render$(encoded.ssgOnDemand)
      expect($('#ssg').text()).toBe('статья: новость')
    })

    it('renders a server-rendered page under a non-ASCII segment', async () => {
      const $ = await next.render$(encoded.ssr)
      expect($('#ssr').text()).toBe('сервер: привет')
    })

    it('serves an API route with a non-ASCII name', async () => {
      const res = await next.fetch(encoded.api)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ route: 'эхо' })
    })
  })

  describe('server rendering with unencoded paths', () => {
    it('renders a static page', async () => {
      const $ = await next.render$('/пейдж')
      expect($('#static').text()).toBe('static пейдж')
    })

    it('renders a dynamic page under a non-ASCII segment', async () => {
      const $ = await next.render$('/статья/привет')
      expect($('#ssg').text()).toBe('статья: привет')
    })
  })

  describe('data requests', () => {
    it('serves the data route of a dynamic page under a non-ASCII segment', async () => {
      const buildId = next.buildId
      const res = await next.fetch(
        `/_next/data/${buildId}${encoded.ssgPrerendered}.json`
      )
      expect(res.status).toBe(200)
      expect((await res.json()).pageProps).toEqual({ slug: 'привет' })
    })
  })

  describe('client-side navigation', () => {
    it('navigates to a static non-ASCII page', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-static').click()

      await retry(async () => {
        expect(await browser.elementByCss('#static').text()).toBe(
          'static пейдж'
        )
      })
    })

    it('navigates to a dynamic page under a non-ASCII segment', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-ssg').click()

      await retry(async () => {
        expect(await browser.elementByCss('#ssg').text()).toBe('статья: привет')
      })
    })

    it('navigates to a server-rendered page under a non-ASCII segment', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('#to-ssr').click()

      await retry(async () => {
        expect(await browser.elementByCss('#ssr').text()).toBe('сервер: привет')
      })
    })
  })
})
