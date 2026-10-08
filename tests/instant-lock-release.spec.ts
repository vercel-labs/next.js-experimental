import { test, expect } from '@playwright/test'
import { instant } from '@next/playwright'

const INSTANT_COOKIE = 'next-instant-navigation-testing'

test('instant() releases the navigation lock after the scope ends', async ({
  page,
  context,
}) => {
  // Record every CookieStore change event the page observes, so we can see
  // whether the protocol-level expiry performed by releaseInstantCookie()
  // surfaces as a `deleted` event in this browser.
  await page.addInitScript(() => {
    ;(window as any).__cookieEvents = []
    if (typeof (globalThis as any).cookieStore !== 'undefined') {
      ;(globalThis as any).cookieStore.addEventListener('change', (e: any) => {
        ;(window as any).__cookieEvents.push({
          changed: e.changed.map((c: any) => `${c.name}=${c.value}`),
          deleted: e.deleted.map((c: any) => c.name),
        })
      })
    }
  })

  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  expect(
    await page.evaluate(() => typeof (globalThis as any).cookieStore !== 'undefined')
  ).toBe(true)

  await instant(page, async () => {
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page.getByTestId('dashboard')).toBeVisible()
  })

  // The lock cookie must be gone from the Playwright cookie jar...
  const jar = (await context.cookies()).filter((c) => c.name === INSTANT_COOKIE)
  console.log('cookie jar after instant():', JSON.stringify(jar))

  const events = await page.evaluate(() => (window as any).__cookieEvents)
  console.log('CookieStore events observed by the page:', JSON.stringify(events, null, 2))

  const sawDeletion = events.some((e: any) => e.deleted.includes(INSTANT_COOKIE))
  console.log('page observed a CookieStore deletion for the lock cookie:', sawDeletion)

  // ...and the in-page lock must have been released. While the lock is held,
  // navigation-testing-lock.ts replaces window.fetch with an override that
  // defers every user fetch until release, so a page-side fetch that never
  // settles means the lock is still held.
  const fetchResult = await page.evaluate(async () => {
    const result = await Promise.race([
      fetch('/api/ping').then((r) => r.text()),
      new Promise((r) => setTimeout(() => r('TIMEOUT: lock still held'), 5000)),
    ])
    return result
  })
  console.log('out-of-band fetch after instant():', fetchResult)

  expect(jar).toHaveLength(0)
  expect(sawDeletion).toBe(true)
  expect(fetchResult).toBe('pong')
})
