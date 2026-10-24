const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url.split('?')[0]);
  if (req.url === '/' || !path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(distDir, 'index.html'), (err2, fallback) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback, 'utf-8');
        }
      });
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

async function runEnglishVerification() {
  await new Promise(resolve => server.listen(5199, resolve));

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Click the language selector in the header
    const langBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const btn = buttons.find(b => b.innerText.includes('हिंदी') || b.innerText.includes('हिन्दी') || b.innerText.includes('भाषा') || b.innerText.includes('English'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log('Language selector opened:', langBtn);
    await new Promise(r => setTimeout(r, 400));

    // Click English in the dropdown
    const clickedEn = await page.evaluate(() => {
      const dropdownBtns = Array.from(document.querySelectorAll('header div button'));
      const enBtn = dropdownBtns.find(b => b.innerText.includes('English'));
      if (enBtn) {
        enBtn.click();
        return true;
      }
      return false;
    });

    console.log('Clicked English in dropdown:', clickedEn);
    await new Promise(r => setTimeout(r, 600));

    // Verify Dashboard in English
    const dashboardEnInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const asideText = document.querySelector('aside')?.innerText || '';
      return {
        hasEnglishGreeting: bodyText.includes('Hello,') || bodyText.includes('Welcome'),
        hasEnglishNav: asideText.includes('Dashboard') && asideText.includes('My Land') && asideText.includes('Expenses & Profit'),
        hasNoHindiCalendarInSidebar: !asideText.includes('फसल कैलेंडर') && !asideText.includes('Crop Calendar'),
        sidebarNavLabels: asideText.split('\n').filter(Boolean)
      };
    });

    console.log('\nEnglish Dashboard Results:');
    console.log('- English Greeting:', dashboardEnInfo.hasEnglishGreeting);
    console.log('- English Navigation:', dashboardEnInfo.hasEnglishNav);
    console.log('- No Calendar in Sidebar:', dashboardEnInfo.hasNoHindiCalendarInSidebar);

    await page.screenshot({ path: 'scripts/verify_dashboard_english_full.png' });

    // Visit /expenses in English
    await page.goto('http://localhost:5199/expenses', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const expensesEnInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        h1: document.querySelector('h1')?.innerText || '',
        hasTotalExpenses: bodyText.includes('Total Expenses'),
        hasCostPerAcre: bodyText.includes('Cost Per Acre'),
        hasGrossRevenue: bodyText.includes('Gross Revenue'),
        hasNetProfit: bodyText.includes('Net Profit'),
        hasActiveFarmer: bodyText.includes('Active Farmer:')
      };
    });

    console.log('\nEnglish Expenses Page Results:');
    console.log('- Heading:', expensesEnInfo.h1);
    console.log('- Total Expenses Label:', expensesEnInfo.hasTotalExpenses);
    console.log('- Cost Per Acre Label:', expensesEnInfo.hasCostPerAcre);
    console.log('- Gross Revenue Label:', expensesEnInfo.hasGrossRevenue);
    console.log('- Net Profit Label:', expensesEnInfo.hasNetProfit);
    console.log('- Active Farmer Banner:', expensesEnInfo.hasActiveFarmer);

    await page.screenshot({ path: 'scripts/verify_crop_expenses_english.png' });

    const allPassed = dashboardEnInfo.hasEnglishNav &&
      expensesEnInfo.hasTotalExpenses &&
      expensesEnInfo.hasCostPerAcre &&
      expensesEnInfo.hasGrossRevenue &&
      expensesEnInfo.hasNetProfit;

    console.log('\n' + (allPassed ? '✓ ALL ENGLISH LOCALIZATION CHECKS PASSED!' : '✗ SOME CHECKS FAILED'));
  } finally {
    await browser.close();
    server.close();
  }
}

runEnglishVerification();
