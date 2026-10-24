const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testWelcomeAndBadge() {
  console.log('--- Verifying Welcome Screen & Badge Removal ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test for Welcome Screen (/onboarding)
    await page.setViewport({ width: 1280, height: 900 });
    // Reset onboarding state in localStorage so we land on Step 1
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.removeItem('fasalsetu_onboarding_completed');
      sessionStorage.clear();
    });
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');

    // Screenshot Step 1 Desktop
    const desktopScreenshotPath = path.join(__dirname, 'verify_welcome_desktop.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`Saved desktop welcome screenshot to: ${desktopScreenshotPath}`);

    // Verify tagline occurrences in DOM
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hindiMatches = bodyText.match(/आपके खेत का अपना साथी/g) || [];
    const englishMatches = bodyText.match(/Aapke Khet ka Apna Saathi/g) || [];

    console.log(`Occurrences of 'आपके खेत का अपना साथी': ${hindiMatches.length}`);
    console.log(`Occurrences of 'Aapke Khet ka Apna Saathi': ${englishMatches.length}`);

    if (hindiMatches.length !== 1) {
      throw new Error(`Expected exactly 1 occurrence of 'आपके खेत का अपना साथी', got ${hindiMatches.length}`);
    }
    if (englishMatches.length !== 0) {
      throw new Error(`Expected 0 occurrences of 'Aapke Khet ka Apna Saathi', got ${englishMatches.length}`);
    }

    // 2. Mobile Viewport Test for Welcome Screen
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle0' });
    const mobileScreenshotPath = path.join(__dirname, 'verify_welcome_mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`Saved mobile welcome screenshot to: ${mobileScreenshotPath}`);

    const mobileBodyText = await page.evaluate(() => document.body.innerText);
    const mobileHindiMatches = mobileBodyText.match(/आपके खेत का अपना साथी/g) || [];
    const mobileEnglishMatches = mobileBodyText.match(/Aapke Khet ka Apna Saathi/g) || [];
    if (mobileHindiMatches.length !== 1 || mobileEnglishMatches.length !== 0) {
      throw new Error(`Mobile verification failed: Hindi matches = ${mobileHindiMatches.length}, English matches = ${mobileEnglishMatches.length}`);
    }

    // 3. Complete onboarding or go to Dashboard to test Excel Persistence Badge
    console.log('\n--- Verifying Excel Persistence Badge Removal on Dashboard ---');
    await page.setViewport({ width: 1280, height: 900 });
    await page.evaluate(() => {
      localStorage.setItem('fasalsetu_onboarding_completed', 'true');
    });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const dashboardScreenshotPath = path.join(__dirname, 'verify_dashboard_nobadge.png');
    await page.screenshot({ path: dashboardScreenshotPath, fullPage: true });
    console.log(`Saved dashboard screenshot to: ${dashboardScreenshotPath}`);

    // Check if Excel Persistence badge or text exists in DOM
    const badgeTextCount = await page.evaluate(() => {
      const allText = document.body.innerText;
      const matches = allText.match(/Excel Persistence|स्थानीय एक्सेल डेटा/gi) || [];
      const badgeElements = document.querySelectorAll('button, div, span');
      let foundVisibleBadge = false;
      for (const el of badgeElements) {
        if (el.textContent && el.textContent.includes('Excel Persistence')) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            foundVisibleBadge = true;
          }
        }
      }
      return { matchesCount: matches.length, foundVisibleBadge };
    });

    console.log('Dashboard badge search results:', badgeTextCount);
    if (badgeTextCount.foundVisibleBadge || badgeTextCount.matchesCount > 0) {
      throw new Error(`Visible Excel Persistence badge still found in dashboard!`);
    }

    // 4. Test Mobile Dashboard
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const mobileDashboardScreenshot = path.join(__dirname, 'verify_dashboard_mobile_nobadge.png');
    await page.screenshot({ path: mobileDashboardScreenshot, fullPage: true });
    console.log(`Saved mobile dashboard screenshot to: ${mobileDashboardScreenshot}`);

    const mobileBadgeCheck = await page.evaluate(() => {
      const allText = document.body.innerText;
      const matches = allText.match(/Excel Persistence|स्थानीय एक्सेल डेटा/gi) || [];
      return matches.length;
    });
    if (mobileBadgeCheck > 0) {
      throw new Error(`Visible Excel Persistence badge still found on mobile dashboard!`);
    }

    console.log('\n=========================================');
    console.log('🎉 ALL WELCOME & BADGE REMOVAL TESTS PASSED!');
    console.log('=========================================');

  } finally {
    await browser.close();
  }
}

testWelcomeAndBadge().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
