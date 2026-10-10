import { test, expect } from '@playwright/test'

test('browser-skipped hidden transition is surfaced as a recoverable runtime error', async ({ page }) => {
  const consoleMessages: string[] = []
  const pageErrors: string[] = []
  page.on('console', message => consoleMessages.push(`${message.type()}: ${message.text()}`))
  page.on('pageerror', error => pageErrors.push(`${error.name}: ${error.message}`))

  await page.goto('/')
  await page.waitForTimeout(1000)

  // Deterministically model Chromium's hidden-document contract: the update runs,
  // but ViewTransition.ready rejects because the browser skips the animation.
  await page.evaluate(() => {
    Document.prototype.startViewTransition = function (options: StartViewTransitionOptions | UpdateCallback) {
      const update = typeof options === 'function' ? options : options.update
      const updateCallbackDone = Promise.resolve().then(() => update?.())
      const ready = Promise.reject(new DOMException(
        'Skipping view transition because document visibility state is hidden.',
        'InvalidStateError',
      ))
      const finished = updateCallbackDone.then(() => undefined)
      return { ready, updateCallbackDone, finished, skipTransition() {} } as ViewTransition
    }
  })

  await page.getByRole('button', { name: 'Navigate after 1.5 seconds' }).click()
  await expect(page.getByText('Navigation scheduled; hide this tab now.')).toBeVisible()
  await page.waitForURL('**/destination')
  await expect(page.locator('[data-page="destination"]')).toBeVisible()
  await page.waitForTimeout(1000)

  const nextErrorText = await page.locator('nextjs-portal').allTextContents()
  const evidence = { url: page.url(), nextErrorText, consoleMessages, pageErrors }
  console.log(`REPRO_EVIDENCE=${JSON.stringify(evidence)}`)

  const reportedErrors = [...nextErrorText, ...consoleMessages, ...pageErrors].join('\n')
  expect(reportedErrors).toContain('InvalidStateError')
  expect(reportedErrors).toMatch(/visibility state is hidden/i)
})
