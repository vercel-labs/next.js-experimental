import { test, expect } from '@playwright/test'
import { instant } from '@next/playwright'

/** Count RSC/dynamic navigation requests the router makes. */
function recordRequests(page: import('@playwright/test').Page) {
  const requests: string[] = []
  page.on('request', (req) => {
    const url = new URL(req.url())
    if (url.pathname.startsWith('/_next/static')) return
    if (req.resourceType() === 'document') return
    requests.push(`${req.method()} ${url.pathname}${url.search}`)
  })
  return requests
}

test('1. plain Link click is instant', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  // give prefetches time to settle
  await page.waitForTimeout(1500)

  await instant(page, async () => {
    await page.getByTestId('link-plain').click()
    await page.waitForURL('**/post/2', { timeout: 10_000 })
    await expect(page.getByTestId('post')).toHaveText('Post 2')
  })
})

test('2. router.push to the same prefetched href inside instant()', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  await page.waitForTimeout(1500)

  const requests = recordRequests(page)

  try {
    await instant(page, async () => {
      await page.getByTestId('link-push').click()
      await page.waitForURL('**/post/1', { timeout: 10_000 })
      await expect(page.getByTestId('post')).toHaveText('Post 1')
    })
  } finally {
    console.log('URL after instant():', page.url())
    console.log('requests during instant():', requests)
  }
})

test('3. control: same router.push WITHOUT instant()', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  await page.waitForTimeout(1500)

  const requests = recordRequests(page)
  await page.getByTestId('link-push').click()
  await page.waitForURL('**/post/1', { timeout: 10_000 })
  await expect(page.getByTestId('post')).toHaveText('Post 1')
  console.log('requests during router.push (no lock):', requests)
})
