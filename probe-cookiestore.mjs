import { webkit, chromium } from 'playwright';
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(`<!doctype html><html><body><h1>probe</h1><script>
    window.__events = [];
    window.__hasCookieStore = typeof cookieStore !== 'undefined';
    if (typeof cookieStore !== 'undefined') {
      cookieStore.addEventListener('change', (e) => {
        window.__events.push({
          changed: e.changed.map(c => c.name + '=' + c.value),
          deleted: e.deleted.map(c => c.name),
        });
      });
    }
  </script></body></html>`);
});
await new Promise(r => server.listen(3100, r));

for (const [name, type] of [['webkit', webkit], ['chromium', chromium]]) {
  const browser = await type.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('http://localhost:3100/');
  console.log(name, 'cookieStore available:', await page.evaluate(() => window.__hasCookieStore));
  // acquire: protocol set
  await ctx.addCookies([{ name: 'next-instant-navigation-testing', value: '[0,"cx"]', url: 'http://localhost:3100/' }]);
  await page.waitForTimeout(500);
  console.log(name, 'after protocol SET events:', JSON.stringify(await page.evaluate(() => window.__events)));
  console.log(name, 'document.cookie:', await page.evaluate(() => document.cookie));
  // release: protocol expiry, mirroring releaseInstantCookie
  const cookies = (await ctx.cookies()).filter(c => c.name === 'next-instant-navigation-testing');
  await ctx.addCookies(cookies.map(c => ({ name: c.name, value: c.value, domain: c.domain, path: c.path, expires: 1 })));
  await page.waitForTimeout(800);
  console.log(name, 'after protocol EXPIRY events:', JSON.stringify(await page.evaluate(() => window.__events)));
  console.log(name, 'document.cookie after expiry:', JSON.stringify(await page.evaluate(() => document.cookie)));
  console.log(name, 'jar after expiry:', JSON.stringify((await ctx.cookies()).map(c=>c.name)));
  await browser.close();
}
server.close();
