import { test, expect } from '@playwright/test'

const MENU_BUTTON = '#menu-button'

async function geometry(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('#menu-button').getBoundingClientRect()
    const portal = document.querySelector('nextjs-portal')
    const ind = portal?.shadowRoot?.getElementById('devtools-indicator')
    const i = ind?.getBoundingClientRect()
    const center = [btn.left + btn.width / 2, btn.top + btn.height / 2]
    const hit = document.elementFromPoint(center[0], center[1])
    return {
      viewport: [innerWidth, innerHeight],
      button: [Math.round(btn.x), Math.round(btn.y), Math.round(btn.width), Math.round(btn.height)],
      indicator: i ? [Math.round(i.x), Math.round(i.y), Math.round(i.width), Math.round(i.height)] : null,
      hitTargetAtButtonCenter: hit ? hit.tagName.toLowerCase() : null,
    }
  })
}

test('BUG: locator.click() on the bottom-left control times out, dev indicator portal intercepts', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator(MENU_BUTTON)).toBeVisible()
  await expect(page.locator(MENU_BUTTON)).toBeEnabled()
  await page.waitForTimeout(2000)
  console.log('geometry:', JSON.stringify(await geometry(page)))

  const error = await page
    .locator(MENU_BUTTON)
    .click({ timeout: 8000 })
    .then(() => null, (e) => String(e))

  console.log('click error:\n' + error)
  expect(error, 'locator.click() is expected to time out in dev').toContain('Timeout')
  expect(error).toContain('nextjs-portal')
  await expect(page).toHaveURL(/\/$/)
})

test('DOM element.click() on the very same control navigates', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2000)
  await page.locator(MENU_BUTTON).evaluate((el) => el.click())
  await expect(page.locator('#menu-title')).toBeVisible()
})

test('CONTROL: hiding the dev overlay portal makes the identical click pass', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2000)
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important }' })
  console.log('geometry (portal hidden):', JSON.stringify(await geometry(page)))
  await page.locator(MENU_BUTTON).click({ timeout: 8000 })
  await expect(page.locator('#menu-title')).toBeVisible()
})

test('BUG: expanded "issue" pill blocks a control well outside the Next.js logo', async ({ page }) => {
  await page.goto('/issue')
  await page.waitForTimeout(2500)
  const geo = await page.evaluate(() => {
    const b = document.querySelector('#tab-button').getBoundingClientRect()
    const i = document
      .querySelector('nextjs-portal')
      .shadowRoot.getElementById('devtools-indicator')
      .getBoundingClientRect()
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return {
      button: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      indicator: [Math.round(i.x), Math.round(i.y), Math.round(i.width), Math.round(i.height)],
      hitTargetAtButtonCenter: hit ? hit.tagName.toLowerCase() : null,
    }
  })
  console.log('geometry (/issue):', JSON.stringify(geo))
  const error = await page
    .locator('#tab-button')
    .click({ timeout: 8000 })
    .then(() => null, (e) => String(e))
  console.log('click error (/issue):\n' + error)
  expect(error).toContain('nextjs-portal')
})
