/**
 * Downscales the supplied New Light Academy artwork into web-sized assets.
 * The source crests are 1254x1254 PNGs of ~1MB each; shipping those raw would
 * blow the page-weight budget for a 39px header mark. Chromium does the
 * resampling because the project has no image library.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const SRC = path.join(__dirname, '..', 'brand');
const JOBS = [
  { from: 'homelogo.png', to: 'public/images/logo-nla.png', size: 320 },
  { from: 'tabicon.png', to: 'src/app/icon.png', size: 512 },
  { from: 'tabicon.png', to: 'src/app/apple-icon.png', size: 180 },
];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  for (const job of JOBS) {
    const data = fs.readFileSync(path.join(SRC, job.from)).toString('base64');
    const out = await page.evaluate(
      ([b64, size]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = size;
            c.height = size;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            // Square sources, so a straight fit keeps the aspect ratio exact.
            ctx.drawImage(img, 0, 0, size, size);
            resolve(c.toDataURL('image/png').split(',')[1]);
          };
          img.onerror = () => reject(new Error('decode failed'));
          img.src = 'data:image/png;base64,' + b64;
        }),
      [data, job.size]
    );
    fs.mkdirSync(path.dirname(job.to), { recursive: true });
    fs.writeFileSync(job.to, Buffer.from(out, 'base64'));
    console.log(`${job.from} -> ${job.to} @${job.size}px  ${(fs.statSync(job.to).size / 1024).toFixed(0)}KB`);
  }
  await browser.close();
})();
