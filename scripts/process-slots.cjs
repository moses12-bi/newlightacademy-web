/**
 * Builds the single-photo slots outside /programs and /our-teachers (About,
 * Paying School Fees, Pupil Handbook) from the school's own photographs.
 *
 *   node scripts/process-slots.cjs            (ONLY=graduates limits a run)
 *
 * Each job cuts a window out of an original (fractions x, y, w, h) at the
 * shape the slot displays, then scales it down. Nothing is upscaled.
 *
 * Output goes to public/images/school/ as WebP.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const ARCHIVE = process.env.PHOTO_ARCHIVE || "C:/Users/moses/Downloads/school_theme/newlight-accademy_images";
const OUT = path.join(__dirname, "..", "public", "images", "school");

const JOBS = [
  /* /about, "Our graduates" (OurGraduates.tsx, 1000x650 = 20:13): the
     graduating class in red gowns and caps in front of the school, chosen by
     the school. The full frame, less a sliver of sky to reach 20:13. */
  {
    from: "PHOTOS-1-001/PHOTOS/KOLY3207.jpg",
    to: "graduates",
    crop: { x: 0, y: 0.025, w: 1, h: 0.975 },
    maxW: 1600,
  },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;

  for (const job of JOBS) {
    if (only && !only.includes(job.to)) continue;
    const file = path.resolve(ARCHIVE, job.from);
    if (!fs.existsSync(file)) {
      console.error(`  ! missing ${job.from}`);
      process.exitCode = 1;
      continue;
    }
    const mime = /\.png$/i.test(file) ? "image/png" : "image/jpeg";
    const b64 = fs.readFileSync(file).toString("base64");
    const result = await page.evaluate(
      ([data, type, crop, maxW]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const sx = img.width * crop.x;
            const sy = img.height * crop.y;
            const sw = img.width * crop.w;
            const sh = img.height * crop.h;
            const scale = Math.min(1, maxW / sw);
            const c = document.createElement("canvas");
            c.width = Math.round(sw * scale);
            c.height = Math.round(sh * scale);
            const ctx = c.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
            resolve({ data: c.toDataURL("image/webp", 0.86).split(",")[1], w: c.width, h: c.height });
          };
          img.onerror = () => reject(new Error("decode failed"));
          img.src = `data:${type};base64,${data}`;
        }),
      [b64, mime, job.crop, job.maxW]
    );
    const dest = path.join(OUT, `${job.to}.webp`);
    fs.writeFileSync(dest, Buffer.from(result.data, "base64"));
    console.log(`  ${job.to.padEnd(18)} ${result.w}x${result.h}  ${(fs.statSync(dest).size / 1024).toFixed(0)}KB  <- ${job.from}`);
  }
  await browser.close();
})();
