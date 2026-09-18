/**
 * Downscales the supplied staff portraits into web-sized assets.
 *
 * The originals are 1122x1402 cut-outs on a transparent background, 1.5-2.2MB
 * each — about 13MB for the seven, which would dominate the page weight of any
 * page that showed them. They are re-encoded to WebP at 700px wide, which keeps
 * the alpha channel and lands around a tenth of the size.
 *
 * Source PNGs stay in public/images/ so the originals are not lost.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const SRC_DIR = "public/images";
const OUT_DIR = "public/images/staff";
const WIDTH = 700;
const QUALITY = 0.9;

const FILES = [
  { from: "CEO.png", to: "director" },
  { from: "teach1.png", to: "teacher-1" },
  { from: "teach2.png", to: "teacher-2" },
  { from: "teach3.png", to: "teacher-3" },
  { from: "teach4.png", to: "teacher-4" },
  { from: "teach5.png", to: "teacher-5" },
  { from: "teach6.png", to: "teacher-6" },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();

  for (const file of FILES) {
    const src = path.join(SRC_DIR, file.from);
    if (!fs.existsSync(src)) {
      console.error(`  ! ${file.from} missing`);
      continue;
    }
    const b64 = fs.readFileSync(src).toString("base64");
    const out = await page.evaluate(
      ([data, width, quality]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const scale = width / img.width;
            const c = document.createElement("canvas");
            c.width = width;
            c.height = Math.round(img.height * scale);
            const ctx = c.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            /* No fill: the cut-outs are transparent and must stay that way, so
               they sit on whatever card colour the theme gives them. */
            ctx.drawImage(img, 0, 0, c.width, c.height);
            resolve({ data: c.toDataURL("image/webp", quality).split(",")[1], w: c.width, h: c.height });
          };
          img.onerror = () => reject(new Error("decode failed"));
          img.src = "data:image/png;base64," + data;
        }),
      [b64, WIDTH, QUALITY]
    );

    const dest = path.join(OUT_DIR, `${file.to}.webp`);
    fs.writeFileSync(dest, Buffer.from(out.data, "base64"));
    const before = fs.statSync(src).size / 1024;
    const after = fs.statSync(dest).size / 1024;
    console.log(
      `  ${file.from.padEnd(11)} -> ${file.to}.webp  ${out.w}x${out.h}  ${before.toFixed(0)}KB -> ${after.toFixed(0)}KB`
    );
  }

  await browser.close();
})();
