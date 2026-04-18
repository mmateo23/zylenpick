const { chromium, devices } = require('playwright');

const base = 'http://localhost:3001';
const routes = [
  ['platos', '/platos'],
  ['zonas', '/zonas'],
  ['zona-city', '/zonas/talavera-de-la-reina'],
  ['venue', '/zonas/talavera-de-la-reina/venues/Casco-Viejo-Bar-Kitchen'],
  ['cart-empty', '/cart'],
];

(async () => {
  const browser = await chromium.launch();
  const viewports = [
    ['desktop', { width: 1440, height: 1100 }],
    ['mobile', { width: 390, height: 844, isMobile: true }],
  ];

  for (const [vpName, viewport] of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const [name, route] of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 });
      await page.screenshot({ path: `.codex-logs/screenshots/${vpName}-${name}.png`, fullPage: false });
    }
    await context.close();
  }

  await browser.close();
})();
