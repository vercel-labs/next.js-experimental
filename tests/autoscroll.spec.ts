import { test, expect } from '@playwright/test'

async function run(page: any, route: string) {
  await page.goto(`/${route}`)
  await page.waitForSelector('#index-page')
  // wait for hydration / prefetch
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 5000))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
  await page.click('#to-suspended-page')
  await page.waitForSelector('#suspended-content')
  await page.waitForTimeout(500)
  return page.evaluate(() => window.scrollY)
}

test('scrolls to top: Suspense fallback={null}', async ({ page }) => {
  const y = await run(page, 'suspense-without-fallback')
  console.log('scrollY after navigation (fallback={null}):', y)
  expect(y).toBe(0)
})

test('control: scrolls to top with a rendering fallback', async ({ page }) => {
  const y = await run(page, 'with-fallback')
  console.log('scrollY after navigation (fallback=<div/>):', y)
  expect(y).toBe(0)
})
