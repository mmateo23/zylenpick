import { test, chromium } from 'playwright/test';
import fs from 'fs';
import path from 'path';

const base = 'https://pick.zylenlabs.com';
const outDir = path.join(process.cwd(), '.codex-audit');
const routes = ['/', '/platos', '/zonas', '/zonas/talavera-de-la-reina', '/cart', '/unete', '/el-proyecto'];
const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

async function inspect(page: any, route: string, viewportName: string) {
  const url = base + route;
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e: Error) => ({ error: e.message }));
  await page.waitForTimeout(1200);
  const title = await page.title().catch(() => null);
  const status = response && response.status ? response.status() : null;
  const text = await page.locator('body').innerText({ timeout: 10000 }).catch((e: Error) => 'TEXT_ERROR: ' + e.message);
  const links = await page.locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.slice(0, 80).map(a => ({ text: a.innerText, href: a.href, aria: a.getAttribute('aria-label') })) ).catch(() => []);
  const buttons = await page.locator('button').evaluateAll((els: HTMLButtonElement[]) => els.slice(0, 80).map(b => ({ text: b.innerText, aria: b.getAttribute('aria-label') })) ).catch(() => []);
  const file = path.join(outDir, `${viewportName}-${route.replace(/[\\/]/g,'_') || 'home'}.png`);
  await page.screenshot({ path: file, fullPage: false }).catch(() => {});
  return {
    route, url, status, title, screenshot: file,
    text: clean(text).slice(0, 3000),
    links: links.map((l: any) => ({...l, text: clean(l.text), aria: clean(l.aria)})).filter((l: any) => l.text || l.aria).slice(0,25),
    buttons: buttons.map((b: any) => ({...b, text: clean(b.text), aria: clean(b.aria)})).filter((b: any) => b.text || b.aria).slice(0,25),
  };
}

test('audit zylenpick routes', async () => {
  const browser = await chromium.launch({ headless: true });
  const results: any = { desktop: [], mobile: [], localHref: null, success: null, consoleErrors: [] };
  for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 950 }, mobile: { width: 390, height: 844 } })) {
    const page = await browser.newPage({ viewport });
    page.on('console', (msg: any) => { if (['error','warning'].includes(msg.type())) results.consoleErrors.push({ route: page.url(), type: msg.type(), text: msg.text().slice(0,300) }); });
    for (const r of routes) results[name].push(await inspect(page, r, name));
    if (name === 'desktop') {
      await page.goto(base + '/zonas/talavera-de-la-reina', { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1000);
      const hrefs = await page.locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(a => ({ text: a.innerText, href: a.href })).filter(a => a.href.includes('/venues/')));
      results.localHref = hrefs[0] || null;
      if (results.localHref) {
        const route = new URL(results.localHref.href).pathname;
        results.desktop.push(await inspect(page, route, 'desktop'));
      }
      results.success = await inspect(page, '/checkout/success/audit-placeholder', 'desktop');
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(JSON.stringify({ out: path.join(outDir,'audit.json'), localHref: results.localHref, screenshots: outDir, consoleErrors: results.consoleErrors.slice(0,8) }, null, 2));
});
