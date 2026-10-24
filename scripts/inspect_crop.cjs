const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function cropFarmerClean() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  const base64 = fs.readFileSync('public/images/onboarding_hero_reference.jpg').toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body><canvas id="c"></canvas></body></html>`);
  
  const dataUrl = await page.evaluate((b64) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('c');
        // Total image is 682 x 1024.
        // Text "Aapke Khet ka Apna Saathi" ends at y=385.
        // Starting crop from y=410 gives pure sky at the top without any text whatsoever.
        // Height from 410 to 1024 is 614.
        const cropY = 410;
        const cropH = img.naturalHeight - cropY;
        canvas.width = img.naturalWidth;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, cropY, img.naturalWidth, cropH, 0, 0, img.naturalWidth, cropH);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = 'data:image/jpeg;base64,' + b64;
    });
  }, base64);

  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync('public/images/onboarding_farmer_highres.jpg', buffer);
  console.log('Saved clean public/images/onboarding_farmer_highres.jpg, size:', buffer.length);
  await browser.close();
}

cropFarmerClean().catch(console.error);
