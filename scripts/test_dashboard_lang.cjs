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

async function runTest() {
  await new Promise(resolve => server.listen(5189, resolve));
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 }); // Desktop view

  // 1. Visit main dashboard
  await page.goto('http://localhost:5189/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'scripts/verify_dashboard_hi.png' });
  console.log('Saved scripts/verify_dashboard_hi.png');

  // 2. Open Language Switcher in Header and select English
  const buttons = await page.$$('header button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('हिंदी') || text.includes('Eng') || text.includes('भाषा')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/verify_lang_dropdown.png' });
  console.log('Saved scripts/verify_lang_dropdown.png');

  // Click English in dropdown
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('English') && text.includes('Universal')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/verify_dashboard_en.png' });
  console.log('Saved scripts/verify_dashboard_en.png');

  await browser.close();
  server.close();
  console.log('Dashboard test done!');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
