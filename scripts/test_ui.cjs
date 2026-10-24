const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Simple static server for dist
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
      if (err.code === 'ENOENT') {
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
        res.writeHead(500);
        res.end('Server error: ' + err.code);
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

async function runTest() {
  await new Promise(resolve => server.listen(5188, resolve));
  console.log('Static preview server running on port 5188');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 850 }); // Mobile view like reference

  // 1. Test Onboarding Step 1
  await page.goto('http://localhost:5188/onboarding', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');
  await page.screenshot({ path: 'scripts/verify_step1.png' });
  console.log('Saved scripts/verify_step1.png');

  // 2. Click Continue to go to Step 2 (Language Selection)
  const buttons = await page.$$('button');
  // Click the bottom primary button
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('आगे बढ़ें') || text.includes('भाषा चयन') || text.includes('Continue')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/verify_step2_languages.png' });
  console.log('Saved scripts/verify_step2_languages.png');

  // Select Chhattisgarhi
  const langButtons = await page.$$('button');
  for (const b of langButtons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('छत्तीसगढ़ी')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // Advance to Step 3, 4, 5 to check State & District dropdowns
  // Click continue button
  const clickNext = async () => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text.includes('आघू बढ़व') || text.includes('आगे बढ़ें') || text.includes('Continue')) {
        await b.click();
        return;
      }
    }
  };

  await clickNext(); // to step 3 (auth)
  await new Promise(r => setTimeout(r, 500));
  await clickNext(); // to step 4 (OTP)
  await new Promise(r => setTimeout(r, 500));
  await clickNext(); // to step 5 (profile creation)
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: 'scripts/verify_step5_dropdowns.png' });
  console.log('Saved scripts/verify_step5_dropdowns.png');

  // Test selecting different state
  const selects = await page.$$('select');
  console.log('Found selects:', selects.length);
  if (selects.length >= 2) {
    // Select Madhya Pradesh
    await selects[1].select('madhya_pradesh');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'scripts/verify_step5_mp_selected.png' });
    console.log('Saved scripts/verify_step5_mp_selected.png');
  }

  await browser.close();
  server.close();
  console.log('All tests completed successfully!');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
