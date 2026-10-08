import { test, expect } from '@playwright/test'
import { instant } from '@next/playwright'

const INSTANT_COOKIE = 'next-instant-navigation-testing'

// Variant: the instant() scope contains a full (MPA) page load, which is the
// path where the page itself re-writes the lock cookie during bootstrap and
// can race the protocol-level expiry performed on release.
test('instant() releases the lock after an MPA page load inside the scope', async ({
  page,
  context,
}) => {
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

  await instant(page, async () => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard')).toBeVisible()
  })

  // Unlock after an MPA load can fall back to a hard reload; let it settle so
  // the fetch probe below runs in a stable execution context.
  await expect(page.getByTestId('content')).toBeVisible()
  await page.waitForLoadState('load')

  const jar = (await context.cookies()).filter((c) => c.name === INSTANT_COOKIE)
  console.log('[mpa] cookie jar after instant():', JSON.stringify(jar))
  const events = await page.evaluate(() => (window as any).__cookieEvents)
  console.log('[mpa] CookieStore events:', JSON.stringify(events))
  const fetchResult = await page.evaluate(() =>
    Promise.race([
      fetch('/api/ping').then((r) => r.text()),
      new Promise((r) => setTimeout(() => r('TIMEOUT: lock still held'), 5000)),
    ])
  )
  console.log('[mpa] out-of-band fetch after instant():', fetchResult)

  expect(jar).toHaveLength(0)
  expect(fetchResult).toBe('pong')
})
