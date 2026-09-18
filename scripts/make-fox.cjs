/**
 * Builds public/images/fox-color.svg from the supplied fox artwork.
 *
 * The intrinsic box MUST stay 157x145: several slots size the fox with
 * `md:w-auto`, and CSS `width:auto` on an <img> resolves against the image's
 * intrinsic size, not its width attribute. Any other intrinsic size silently
 * resizes the mascot on every page that uses it.
 *
 * The artwork is embedded at 3x (471x435) so it stays sharp on high-density
 * screens while the declared box keeps the layout identical.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const SRC = path.join(__dirname, '..', 'brand', 'fox1.png');
const OUT = 'public/images/fox-color.svg';
const BOX = { w: 157, h: 145 };
const SCALE = 3;

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  const b64 = fs.readFileSync(SRC).toString('base64');
  const webp = await page.evaluate(
    ([data, w, h]) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/webp', 0.92).split(',')[1]);
        };
        img.onerror = () => reject(new Error('decode failed'));
        img.src = 'data:image/png;base64,' + data;
      }),
    [b64, BOX.w * SCALE, BOX.h * SCALE]
  );
  await browser.close();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${BOX.w}" height="${BOX.h}" viewBox="0 0 ${BOX.w} ${BOX.h}">
  <title>Fox mascot</title>
  <!-- Intrinsic box is ${BOX.w}x${BOX.h}, matching the mark this replaces: several slots
       size the fox with CSS width:auto, which resolves against the intrinsic
       size, so changing it would resize the mascot site-wide. -->
  <image x="0" y="0" width="${BOX.w}" height="${BOX.h}" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/webp;base64,${webp}"/>
</svg>
`;
  fs.writeFileSync(OUT, svg);
  console.log(`${OUT}  ${(fs.statSync(OUT).size / 1024).toFixed(1)}KB  intrinsic ${BOX.w}x${BOX.h}  artwork ${BOX.w * SCALE}x${BOX.h * SCALE}`);
})();
