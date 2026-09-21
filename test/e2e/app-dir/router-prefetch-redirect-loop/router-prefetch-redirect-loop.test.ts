import { nextTestSetup } from 'e2e-utils'
import { waitFor } from 'next-test-utils'
import type { Page, Request } from 'playwright'

// One imperative prefetch of a redirecting URL should settle after a handful
// of requests. The bug turns it into an unbounded retry loop that fired
// hundreds of requests per second, so a generous bound still fails fast.
const MAX_ROUTER_REQUESTS_AFTER_PREFETCH = 50
// How long the router gets to settle after the single `router.prefetch` call.
const SETTLE_MS = 3000

describe('router-prefetch-redirect-loop', () => {
  const { next, isNextDev } = nextTestSetup({
    files: __dirname,
  })

  if (isNextDev) {
    // Only reproduces in a production build; dev resolves routes on demand
    // instead of predicting them from a learned pattern.
    test('skipped in dev mode', () => {})
    return
  }

  it('does not loop when router.prefetch(url, { kind: "full" }) hits a redirect', async () => {
    // Every router request carries the `_rsc` cache-busting search param,
    // including the ones the browser issues when following the 308 to
    // `/changelog`.
    const routerRequests: string[] = []

    const browser = await next.browser('/docs/alpha', {
      beforePageLoad(page: Page) {
        page.on('request', (request: Request) => {
          const url = new URL(request.url())
          if (url.searchParams.has('_rsc')) {
            routerRequests.push(url.pathname)
          }
        })
      },
    })

    // Let the automatic prefetches of the visible links settle first; they
    // are what teaches the router the `/[collection]/[...slug]` pattern that
    // `/docs/changelog` is later predicted with.
    await waitFor(1000)
    const beforePrefetch = routerRequests.length

    // A single imperative full prefetch of a URL that 308-redirects to a
    // route with a different tree shape. Pre-fix, the router detected the
    // divergence, invalidated the whole route cache (discarding the note it
    // had just recorded about the redirect), re-prefetched every visible link
    // and retried this prefetch with the same prediction — forever.
    await browser.elementByCss('[data-testid="prefetch-full"]').click()

    // Poll so a looping build fails in seconds with a legible count instead
    // of hanging until the jest timeout.
    const deadline = Date.now() + SETTLE_MS
    while (Date.now() < deadline) {
      if (
        routerRequests.length - beforePrefetch >
        MAX_ROUTER_REQUESTS_AFTER_PREFETCH
      ) {
        break
      }
      await waitFor(100)
    }

    const afterPrefetch = routerRequests.slice(beforePrefetch)
    const countsByPath: Record<string, number> = {}
    for (const pathname of afterPrefetch) {
      countsByPath[pathname] = (countsByPath[pathname] ?? 0) + 1
    }

    if (afterPrefetch.length > MAX_ROUTER_REQUESTS_AFTER_PREFETCH) {
      throw new Error(
        `A single router.prefetch(url, { kind: 'full' }) of a redirecting ` +
          `URL issued ${afterPrefetch.length} router requests in ` +
          `${SETTLE_MS}ms (bound: ${MAX_ROUTER_REQUESTS_AFTER_PREFETCH}), ` +
          `which means the prefetch retried in an unbounded loop.\n\n` +
          `Requests by path: ${JSON.stringify(countsByPath, null, 2)}`
      )
    }

    // The prefetch queue must also be quiet, not merely slow: no further
    // router requests once it has settled.
    const settled = routerRequests.length
    await waitFor(1000)
    expect(routerRequests.length).toBe(settled)

    // The prefetch is still useful: navigating to the redirecting URL lands
    // on the redirect destination.
    await browser.elementByCss('a[href="/changelog"]').click()
    expect(await browser.elementById('changelog-page').text()).toBe('changelog')
  })
})
