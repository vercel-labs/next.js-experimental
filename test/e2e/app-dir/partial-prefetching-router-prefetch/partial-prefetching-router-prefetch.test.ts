import { nextTestSetup } from 'e2e-utils'
import type * as Playwright from 'playwright'
import { createRouterAct } from 'router-act'

// Documents what a manual `router.prefetch()` actually includes when Partial
// Prefetching is enabled. Everything below `await prefetch()` (from
// `next/cache`) is excluded from the App Shell and only rendered when the
// per-link (runtime) prefetch stage is requested. `router.prefetch(href)` —
// the call shape documented by the `useRouter` API reference — maps to
// `FetchStrategy.PPR`, which never requests that stage; only the undocumented
// `{ kind: 'full' }` option does.
describe('partial prefetching - router.prefetch', () => {
  const { next, isNextDev } = nextTestSetup({
    files: __dirname,
  })
  if (isNextDev) {
    it('is skipped', () => {})
    return
  }

  it('does not request the per-link prefetch stage for a default router.prefetch(href)', async () => {
    let page: Playwright.Page
    const browser = await next.browser('/', {
      beforePageLoad(p: Playwright.Page) {
        page = p
      },
    })
    const act = createRouterAct(page)

    await act(async () => {
      await browser.elementById('prefetch-auto').click()
    }, [
      // The App Shell stage is prefetched...
      { includes: 'Shell content for auto' },
      // ...but the content below `await prefetch()` is not. This is the
      // current behavior, and it contradicts the docs, which say that an
      // explicit `useRouter().prefetch()` renders content below `prefetch()`.
      { includes: 'Prefetch-stage content for auto', block: 'reject' },
    ])
  })

  it('requests the per-link prefetch stage for router.prefetch(href, { kind: "full" })', async () => {
    let page: Playwright.Page
    const browser = await next.browser('/', {
      beforePageLoad(p: Playwright.Page) {
        page = p
      },
    })
    const act = createRouterAct(page)

    await act(async () => {
      await browser.elementById('prefetch-full').click()
    }, [
      { includes: 'Shell content for full' },
      // The undocumented `{ kind: 'full' }` option maps to
      // `FetchStrategy.Full`, which does issue the runtime prefetch request.
      { includes: 'Prefetch-stage content for full', kind: 'runtime' },
    ])
  })
})
