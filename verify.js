const { chromium } = require('playwright');
(async () => {
  const [url, runsArg, tag, inject] = process.argv.slice(2);
  const runs = Number(runsArg);
  const browser = await chromium.launch();
  let errs = 0;
  for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext();
    if (inject === 'inject') {
      // Simulate a browser extension that inserts a wrapper div as the first
      // child of <body> before React hydrates (many password managers do this).
      await ctx.addInitScript(() => {
        const add = () => {
          if (!document.body) return false;
          const d = document.createElement('div');
          d.style.display = 'contents';
          d.setAttribute('data-fake-extension', '1');
          document.body.insertBefore(d, document.body.firstChild);
          return true;
        };
        if (!add()) {
          const t = setInterval(() => { if (add()) clearInterval(t); }, 1);
        }
      });
    }
    const page = await ctx.newPage();
    const msgs = [];
    page.on('console', m => msgs.push(m.text()));
    page.on('pageerror', e => msgs.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const hit = msgs.filter(m => /Hydration failed/i.test(m));
    if (hit.length) {
      errs++;
      if (i === 0) console.log('FIRST ERROR:\n' + hit[0].slice(0, 1800));
      await page.screenshot({ path: `/workspace/.next-maintainer/reproduction-artifacts/playwright/${tag}-load${i+1}.png` });
    }
    await ctx.close();
  }
  console.log(`RESULT ${tag}: ${errs}/${runs} loads with hydration error`);
  await browser.close();
})();
