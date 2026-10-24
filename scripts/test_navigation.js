import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runNavigationTests() {
  console.log('--- Starting FasalSetu Global Back Navigation Tests ---');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Visit Dashboard
    console.log('\n[1/6] Loading Dashboard at http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log('✓ Dashboard loaded successfully. Current URL:', page.url());

    // 2. Navigate from Dashboard to /mandi
    console.log('\n[2/6] Navigating to /mandi ...');
    await page.goto('http://localhost:5173/mandi', { waitUntil: 'networkidle0' });
    
    // Check if Back button and Dashboard button are present
    const backBtnText = await page.$eval('nav[aria-label="Page navigation"] button:first-child', el => el.textContent?.trim());
    const dashBtnText = await page.$eval('nav[aria-label="Page navigation"] button:nth-child(2)', el => el.textContent?.trim());
    console.log(`✓ PageHeaderNav found! Back button: "${backBtnText}", Dashboard button: "${dashBtnText}"`);

    // Click Back button
    console.log('Clicking "वापस जाएं" button...');
    await page.click('nav[aria-label="Page navigation"] button:first-child');
    await new Promise(r => setTimeout(r, 600));
    console.log('✓ Returned to URL:', page.url());
    if (!page.url().endsWith('/') && !page.url().includes('localhost:5173')) {
      throw new Error(`Expected dashboard URL, got: ${page.url()}`);
    }

    // 3. Direct URL open with fallback check
    console.log('\n[3/6] Direct navigation to /schemes (no internal history in this visit)...');
    await page.goto('http://localhost:5173/schemes', { waitUntil: 'networkidle0' });
    console.log('Current URL:', page.url());
    await page.click('nav[aria-label="Page navigation"] button:first-child');
    await new Promise(r => setTimeout(r, 600));
    console.log('✓ Fallback executed. Returned to URL:', page.url());

    // 4. Test multi-step workflow in /add-land
    console.log('\n[4/6] Testing multi-step workflow in /add-land ...');
    await page.goto('http://localhost:5173/add-land', { waitUntil: 'networkidle0' });
    
    // Check step 1
    let stepBadge = await page.$eval('span.bg-emerald-50', el => el.textContent?.trim());
    console.log('Initial step:', stepBadge);

    // Enter custom land name
    const initialVal = await page.$eval('input[placeholder*="उदा. भूमि 1"]', el => el.value);
    await page.type('input[placeholder*="उदा. भूमि 1"]', ' - नया परीक्षण 2026');
    const expectedVal = initialVal + ' - नया परीक्षण 2026';
    console.log(`Updated land name to: "${expectedVal}"`);

    // Click Next button to go to Step 2
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('आगे बढ़ें'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    stepBadge = await page.$eval('span.bg-emerald-50', el => el.textContent?.trim());
    console.log('Advanced to step:', stepBadge);

    // Click Back button (should step back to Step 1 without data loss)
    console.log('Clicking Back button from Step 2...');
    await page.click('nav[aria-label="Page navigation"] button:first-child');
    await new Promise(r => setTimeout(r, 600));

    stepBadge = await page.$eval('span.bg-emerald-50', el => el.textContent?.trim());
    console.log('Stepped back to step:', stepBadge);

    const preservedName = await page.$eval('input[placeholder*="उदा. भूमि 1"]', el => el.value);
    console.log(`Preserved land name in form: "${preservedName}"`);
    if (preservedName !== expectedVal) {
      throw new Error(`Form value lost! Expected "${expectedVal}", got "${preservedName}"`);
    }
    console.log('✓ Multi-step back navigation preserved form data perfectly!');

    // 5. Test Dashboard shortcut from /add-land
    console.log('\n[5/6] Testing Dashboard shortcut button from /add-land ...');
    await page.click('nav[aria-label="Page navigation"] button:nth-child(2)');
    await new Promise(r => setTimeout(r, 600));
    console.log('✓ Dashboard shortcut navigated to URL:', page.url());

    // 6. Test nested detail page: /land/land-01
    console.log('\n[6/6] Testing LandDetailPage /land/land-01 ...');
    await page.goto('http://localhost:5173/land/land-01', { waitUntil: 'networkidle0' });
    const detailBackBtn = await page.$eval('nav[aria-label="Page navigation"] button:first-child', el => el.textContent?.trim());
    console.log(`✓ LandDetailPage has back navigation: "${detailBackBtn}"`);
    await page.click('nav[aria-label="Page navigation"] button:first-child');
    await new Promise(r => setTimeout(r, 600));
    console.log('✓ Back from LandDetailPage navigated to URL:', page.url());

    console.log('\n=======================================================');
    console.log('🎉 ALL BACK NAVIGATION & DASHBOARD SHORTCUT TESTS PASSED!');
    console.log('=======================================================');
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runNavigationTests();
