// Regenera assets/checklist-minuto-uno.pdf desde lead-magnet/checklist.html
// Uso (desde la raíz del repo): node lead-magnet/build-pdf.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(__dirname, 'checklist.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.resolve(__dirname, '../assets/checklist-minuto-uno.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('PDF listo');
})();
