import { test, expect } from '@playwright/test'
import { instant } from '@next/playwright'

// Under Partial Prefetching the instant() navigation lock restricts the
// navigation to the route shell, so `param-value` can never commit inside the
// instant() scope. Waiting for it makes the test hit the Playwright timeout
// *while inside* instant().
//
// Expected: the test fails with the navigation/locator timeout.
// Actual: instant()'s `finally` cleanup calls context.cookies() after
// Playwright has already closed the browser context, so the reported error is
// a protocol/"context closed" failure that hides the real timeout.
test('blocked navigation inside instant() should report the timeout', async ({
  page,
  baseURL,
}) => {
  await page.goto('/')
  await page.hover('#partial-link')
  await page.waitForTimeout(1000)

  await instant(
    page,
    async () => {
      await page.click('#partial-link')
      // Never commits under the lock -> runs until the test timeout.
      await page
        .locator('[data-testid="param-value"]')
        .waitFor({ state: 'visible', timeout: 60_000 })
    },
    { baseURL: baseURL! }
  )
})
