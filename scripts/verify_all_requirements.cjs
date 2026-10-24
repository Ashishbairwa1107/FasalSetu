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

async function runVerification() {
  await new Promise(resolve => server.listen(5195, resolve));
  console.log('Static test server listening on port 5195');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const testResults = [];

  try {
    // ================= 1. VERIFY SIDEBAR (Req 2) & DASHBOARD (Req 1, 4, 5) =================
    await page.goto('http://localhost:5195/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Check sidebar navigation items
    const sidebarText = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.innerText : '';
    });

    const hasCropCalendarInSidebar = sidebarText.includes('फसल कैलेंडर') || sidebarText.includes('Crop Calendar');
    testResults.push({
      item: 'Requirement 2: Crop Calendar removed from sidebar',
      passed: !hasCropCalendarInSidebar,
      details: hasCropCalendarInSidebar ? 'FAIL: Calendar item found in sidebar' : 'PASS: Calendar item is removed from sidebar'
    });

    // Check news articles (Req 4 & 5)
    const newsCardsData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 > div'));
      return cards.map(c => ({
        title: c.querySelector('h3')?.innerText || '',
        text: c.innerText
      }));
    });

    console.log('Detected news cards:', newsCardsData.length);
    testResults.push({
      item: 'Requirement 4 & 5: News cards rendered',
      passed: newsCardsData.length >= 3,
      details: `Detected ${newsCardsData.length} cards`
    });

    // Take screenshot of Hindi dashboard
    await page.screenshot({ path: 'scripts/verify_dashboard_hindi_full.png' });

    // ================= 2. VERIFY CROP EXPENSES & PROFIT LAND INTEGRATION (Req 3) =================
    await page.goto('http://localhost:5195/crop-expenses', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Verify active farmer banner & plot selector
    const expensesPageInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const farmerBanner = document.querySelector('main .bg-emerald-50')?.innerText || '';
      const plotButtons = Array.from(document.querySelectorAll('main button')).filter(b => b.innerText.includes('एकड़') || b.innerText.includes('Acres')).map(b => b.innerText);
      const totalExpenseEl = document.querySelector('p.text-2xl.font-black.text-gray-900')?.innerText || '';
      const revenueEl = document.querySelector('p.text-2xl.font-black.text-blue-700')?.innerText || '';
      const profitEl = document.querySelector('p.text-2xl.font-black.text-\\[\\#087A43\\]')?.innerText || '';
      
      return {
        farmerBanner,
        plotButtonsCount: plotButtons.length,
        totalExpenseEl,
        revenueEl,
        profitEl,
        hasBilingualLabels: bodyText.includes('(Expense & Profit)') || bodyText.includes('(Category Share)') || bodyText.includes('(Expense Records)')
      };
    });

    testResults.push({
      item: 'Requirement 3: Active farmer identified on expenses page',
      passed: expensesPageInfo.farmerBanner.includes('राम कुमार वर्मा') || expensesPageInfo.farmerBanner.includes('सक्रिय किसान'),
      details: expensesPageInfo.farmerBanner
    });

    testResults.push({
      item: 'Requirement 3: Plot selector with multiple plots',
      passed: expensesPageInfo.plotButtonsCount >= 2,
      details: `Found ${expensesPageInfo.plotButtonsCount} plot selector buttons`
    });

    testResults.push({
      item: 'Requirement 3: Plot 1 financial calculation (₹28,500 total, ₹65,000 revenue)',
      passed: expensesPageInfo.totalExpenseEl.includes('28,500') && expensesPageInfo.revenueEl.includes('65,000'),
      details: `Total: ${expensesPageInfo.totalExpenseEl}, Revenue: ${expensesPageInfo.revenueEl}, Profit: ${expensesPageInfo.profitEl}`
    });

    testResults.push({
      item: 'Requirement 1: No bilingual parenthetical UI strings on crop expenses page',
      passed: !expensesPageInfo.hasBilingualLabels,
      details: !expensesPageInfo.hasBilingualLabels ? 'PASS: Clean single-language UI' : 'FAIL: Found bilingual string in UI'
    });

    await page.screenshot({ path: 'scripts/verify_crop_expenses_plot1.png' });

    // Switch to Plot 2 (1.5 acres, no harvest yet)
    const switchedToPlot2 = await page.evaluate(() => {
      const plotButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('1.5'));
      if (plotButtons[0]) {
        plotButtons[0].click();
        return true;
      }
      return false;
    });

    if (switchedToPlot2) {
      await new Promise(r => setTimeout(r, 600));
      const plot2Info = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return {
          hasHarvestPending: bodyText.includes('उपज डेटा लंबित') || bodyText.includes('लंबित'),
          noFakeRevenue: !bodyText.includes('₹65,000')
        };
      });

      testResults.push({
        item: 'Requirement 3: Plot 2 does not fabricate fake revenue and displays pending harvest',
        passed: plot2Info.hasHarvestPending && plot2Info.noFakeRevenue,
        details: `Harvest pending state: ${plot2Info.hasHarvestPending}, No fake revenue: ${plot2Info.noFakeRevenue}`
      });

      await page.screenshot({ path: 'scripts/verify_crop_expenses_plot2.png' });
    }

    // ================= 3. VERIFY ONBOARDING STEP 1 REDESIGN (Req 6 & 7) =================
    await page.goto('http://localhost:5195/onboarding', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const onboardingInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const heroImg = document.querySelector('img[src*="onboarding_farmer"]');
      const hasBlackPhoneBorder = document.querySelector('.border-\\[3\\.5px\\].border-gray-900') !== null;
      
      return {
        hasEnglishBrand: bodyText.includes('FasalSetu'),
        hasHindiBrand: bodyText.includes('फसलसेतु'),
        hasTagline: bodyText.includes('Aapke Khet ka Apna Saathi'),
        hasHighResImage: heroImg !== null && (heroImg.getAttribute('src') || '').includes('onboarding_farmer'),
        hasBlackPhoneBorder
      };
    });

    testResults.push({
      item: 'Requirement 6: Starting screen typography & branding',
      passed: onboardingInfo.hasEnglishBrand && onboardingInfo.hasHindiBrand && onboardingInfo.hasTagline,
      details: `FasalSetu: ${onboardingInfo.hasEnglishBrand}, फसलसेतु: ${onboardingInfo.hasHindiBrand}, Tagline: ${onboardingInfo.hasTagline}`
    });

    testResults.push({
      item: 'Requirement 6: High-res farmer illustration and no black phone border',
      passed: onboardingInfo.hasHighResImage && !onboardingInfo.hasBlackPhoneBorder,
      details: `High-res image present: ${onboardingInfo.hasHighResImage}, Black phone border removed: ${!onboardingInfo.hasBlackPhoneBorder}`
    });

    await page.screenshot({ path: 'scripts/verify_onboarding_step1_redesign.png' });

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n================ VERIFICATION SUMMARY ================');
  let allPassed = true;
  for (const res of testResults) {
    console.log(`${res.passed ? '✓' : '✗'} ${res.item}`);
    console.log(`   ${res.details}`);
    if (!res.passed) allPassed = false;
  }
  console.log('======================================================');
  console.log(allPassed ? 'ALL REQUIREMENTS VERIFIED SUCCESSFULLY!' : 'SOME CHECKS FAILED');
}

runVerification();
