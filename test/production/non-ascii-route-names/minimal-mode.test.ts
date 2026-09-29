import { join } from 'path'
import cheerio from 'cheerio'
import { FileRef, nextTestSetup } from 'e2e-utils'
import { createNowRouteMatches } from 'next-test-utils'

/**
 * In minimal mode the platform does the routing and tells Next.js which route
 * to render through the matched path header, so the header carries the
 * percent-encoded pathname (for a static route) or the percent-encoded route
 * pattern (for a dynamic route). This is the shape a deployment sees.
 */
describe('non-ascii route names - minimal mode', () => {
  const { next } = nextTestSetup({
    files: new FileRef(join(__dirname, 'fixture')),
    // This test synthesizes an adapter invocation using private runtime
    // switches; it does not exercise the deployed platform proxy.
    skipDeployment: true,
    env: {
      NEXT_PRIVATE_TEST_HEADERS: '1',
      NEXT_PRIVATE_MINIMAL_MODE: '1',
    },
  })

  it('renders a static app route from an encoded matched path', async () => {
    const res = await next.fetch('/%D1%82%D0%B5%D1%81%D1%82', {
      headers: { 'x-matched-path': '/%D1%82%D0%B5%D1%81%D1%82' },
    })

    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#static')
        .text()
    ).toBe('static тест')
  })

  it('renders a static pages route from an encoded matched path', async () => {
    const res = await next.fetch('/%D0%BF%D0%B5%D0%B9%D0%B4%D0%B6', {
      headers: { 'x-matched-path': '/%D0%BF%D0%B5%D0%B9%D0%B4%D0%B6' },
    })

    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#pages-static')
        .text()
    ).toBe('static пейдж')
  })

  it('renders a dynamic app route from an encoded matched route pattern', async () => {
    const res = await next.fetch(
      '/%D0%B1%D0%BB%D0%BE%D0%B3/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
      {
        headers: {
          'x-matched-path': '/%D0%B1%D0%BB%D0%BE%D0%B3/[slug]',
          'x-now-route-matches': createNowRouteMatches({
            slug: 'привет',
          }).toString(),
        },
      }
    )

    expect(res.status).toBe(200)
    // The param value reaches an app router page still percent-encoded, which
    // is pre-existing behavior for every dynamic app route and not specific to
    // a non-ASCII route name. What matters here is that the platform's matched
    // route pattern resolves to this route at all.
    expect(
      cheerio
        .load(await res.text())('#dynamic')
        .text()
    ).toStartWith('блог: ')
  })

  it('renders a dynamic pages route from an encoded matched route pattern', async () => {
    const res = await next.fetch(
      '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82',
      {
        headers: {
          'x-matched-path': '/%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F/[slug]',
          'x-now-route-matches': createNowRouteMatches({
            slug: 'привет',
          }).toString(),
        },
      }
    )

    expect(res.status).toBe(200)
    expect(
      cheerio
        .load(await res.text())('#pages-dynamic')
        .text()
    ).toBe('статья: привет')
  })
})
