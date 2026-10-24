const fs = require('fs');
const puppeteer = require('puppeteer-core');
const path = require('path');

async function crop() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  const imgPath = path.resolve('public/images/onboarding_reference.png');
  const base64 = fs.readFileSync(imgPath).toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <canvas id="c"></canvas>
      <script>
        const img = new Image();
        img.onload = () => {
          const canvas = document.getElementById('c');
          // Image is 257 x 445. Phone inner content width ~ 240, height ~ 430
          // Let's crop just the farmer field landscape
          // The text "Aapke Khet ka Apna Saathi" ends around y=185
          // Let's crop from y=192 to avoid any text, and x=11 to x=245 to stay cleanly inside the border
          canvas.width = 230;
          canvas.height = 236;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 13, 192, 230, 236, 0, 0, 230, 236);
          window.done = canvas.toDataURL('image/png');
        };
        img.src = "data:image/png;base64,${base64}";
      </script>
    </body></html>
  `);
  
  await page.waitForFunction(() => window.done);
  const dataUrl = await page.evaluate(() => window.done);
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync('public/images/onboarding_farmer_cropped.png', buffer);
  console.log('Saved public/images/onboarding_farmer_cropped.png, size:', buffer.length);
  await browser.close();
}
crop().catch(err => {
  console.error(err);
  process.exit(1);
});
