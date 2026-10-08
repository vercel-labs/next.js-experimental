import { isNextDev, nextTestSetup } from 'e2e-utils'
import { retry, waitFor } from 'next-test-utils'

// Regression test for duplicated root metadata in `<head>` after
// `router.refresh()` (Cache Components + `partialPrefetching`, dev mode).
//
// The root layout's `generateMetadata()` resolves slowly, so the root metadata
// of the initial render is still streaming in when a client component calls
// `router.refresh()` right after hydration. The refresh RSC response then
// inserts a *second* copy of the root metadata tags instead of replacing or
// deduping the ones already in `document.head`.
//
// This asserts the currently observed (incorrect) behavior: the single
// `app/icon.svg` file convention ends up as two identical `link[rel="icon"]`
// elements. When the duplication is fixed, the expectation below has to be
// updated to a single icon link.
describe('metadata-refresh-duplication', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    // The fixture's slow root `generateMetadata()` blocks prerendering with
    // Cache Components, so only the dev server is started.
    skipStart: !isNextDev,
  })

  if (!isNextDev) {
    it('only applies to `next dev`', () => {})
    return
  }

  function headMetadata(browser: any): Promise<{
    icons: string[]
    titles: number
  }> {
    return browser.eval(() => ({
      icons: Array.from(document.head.querySelectorAll('link[rel="icon"]')).map(
        (el: any) => el.getAttribute('href')
      ),
      titles: document.head.querySelectorAll('title').length,
    }))
  }

  // Loads the page, waits for the dynamic hole to be filled and for the slow
  // root metadata to have landed (the title is only set once it resolves), then
  // lets the head settle so the assertions observe the final state.
  async function loadAndSettle(url: string) {
    const browser = await next.browser(url)
    await browser.waitForElementByCss('#dynamic-content')
    await retry(async () => {
      expect(await browser.eval(() => document.title)).toBe('Root Title')
    })
    await waitFor(2000)
    return browser
  }

  it('renders one set of root metadata tags in the initial HTML', async () => {
    const html = await next.render('/')
    expect(html.match(/<link rel="icon"/g)).toHaveLength(1)
    expect(html.match(/<title>/g)).toHaveLength(1)
  })

  it('keeps one icon link when the page is not refreshed', async () => {
    const browser = await loadAndSettle('/')
    const { icons, titles } = await headMetadata(browser)
    expect(icons).toHaveLength(1)
    expect(icons[0]).toContain('/icon.svg')
    expect(titles).toBe(1)
  })

  it('duplicates the root icon link after router.refresh()', async () => {
    const browser = await loadAndSettle('/?refresh=1')
    expect(await browser.elementByCss('#refreshed').text()).toBe('refreshed')

    const { icons, titles } = await headMetadata(browser)

    // Observed (incorrect) behavior: the refresh response adds a second,
    // identical copy of the root icon link. The expected behavior is a single
    // `link[rel="icon"]`, as in the initial HTML.
    expect(icons).toHaveLength(2)
    expect(icons[0]).toBe(icons[1])
    expect(icons[0]).toContain('/icon.svg')
    // The `<title>` is not duplicated in this fixture.
    expect(titles).toBe(1)
  })
})
