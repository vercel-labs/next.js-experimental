// Reproduction for vercel/next.js#99656
// nextjs.org/docs (mobile/tablet): opening the Search modal while the hamburger
// menu is open leaves the mobile menu mounted and stacked ON TOP of the modal.
//
// Usage: npm install && npx playwright install chromium && node repro.mjs
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./artifacts/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const MENU = '[class*=menuButton]';
const SEARCH = 'button[aria-label="Search documentation"]';

function probe(page, label) {
  return page.evaluate((label) => {
    const box = (s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: r.x | 0, y: r.y | 0, w: r.width | 0, h: r.height | 0, display: getComputedStyle(e).display };
    };
    return {
      label,
      menuButtonLabel: document.querySelector('[class*=menuButton]')?.getAttribute('aria-label'),
      mobileMenu: box('[class*=mobileMenu]'),
      searchDialog: box('[role=dialog]'),
      // what actually receives a tap in the middle of the search modal
      topmostAtModalCenter: document.elementFromPoint(195, 300)?.outerHTML.slice(0, 100) ?? null,
    };
  }, label);
}

for (const device of ['iPhone 13', 'iPad Mini']) {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ ...devices[device] })).newPage();
  const tag = device.replace(/\s+/g, '-');
  await page.goto('https://nextjs.org/docs', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForTimeout(4000);

  await page.locator(MENU).first().click();          // 1. open hamburger menu
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}${tag}-1-menu-open.png` });
  console.log(JSON.stringify(await probe(page, `${device}: menu open`), null, 1));

  await page.locator(SEARCH).first().click();        // 2. click search while menu is open
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}${tag}-2-search-over-menu.png` });
  const after = await probe(page, `${device}: after search click`);
  console.log(JSON.stringify(after, null, 1));

  const bug = after.mobileMenu && after.mobileMenu.h > 0 && after.searchDialog;
  console.log(bug
    ? `BUG REPRODUCED on ${device}: mobile menu still rendered (${after.mobileMenu.w}x${after.mobileMenu.h}) behind/over search dialog (${after.searchDialog.w}x${after.searchDialog.h}); menu button still "${after.menuButtonLabel}"`
    : `not reproduced on ${device}`);
  await browser.close();
}
