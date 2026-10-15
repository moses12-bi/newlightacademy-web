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
/* The "new light" folder: the school's second batch of photographs. */
const NEW_LIGHT = process.env.NEW_LIGHT_SRC || "C:/Users/moses/Downloads/new light";
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
  /* /about, "Health and safety" (HealthAndSafety.tsx, 1000x800 = 5:4): a
     teacher helping a child in the nursery room. */
  {
    from: path.join(NEW_LIGHT, "KARISIMBI im(12).jpg.jpeg"),
    to: "nursery-classroom-help",
    crop: { x: 0.1683, y: 0, w: 0.8317, h: 1 },
    maxW: 1400,
  },
  /* /about, "Our community" (OurCommunity.tsx, 1000x650 = 20:13): the campus
     and its court. */
  {
    from: path.join(NEW_LIGHT, "KARISIMBI im(5).jpg.jpeg"),
    to: "campus-and-court",
    crop: { x: 0, y: 0, w: 1, h: 0.9769 },
    maxW: 1600,
  },
  /* /make-a-payment, intro (PaymentIntro.tsx, 1000x650 = 20:13): a lesson,
     trimmed of the orange door frame at the right. */
  {
    from: path.join(NEW_LIGHT, "KARISIMBI im(3).jpg.jpeg"),
    to: "classroom-lesson",
    crop: { x: 0, y: 0.07, w: 0.82, h: 0.8011 },
    maxW: 1600,
  },
  /* /make-a-payment, paying online (PaymentOnline.tsx, 800x800 = 1:1): pupils
     waving from the school bus. */
  {
    from: path.join(NEW_LIGHT, "KARISIMBI im(14).jpg.jpeg"),
    to: "pupils-on-the-bus",
    crop: { x: 0.1, y: 0, w: 0.6653, h: 1 },
    maxW: 1200,
  },
  /* /student-handbook, intro (HandbookIntro.tsx, 1000x550 = 20:11): a class
     lined up in front of the building with the map murals. */
  {
    from: path.join(NEW_LIGHT, "KARISIMBI im(6).jpg.jpeg"),
    to: "line-up-by-the-murals",
    crop: { x: 0, y: 0.1, w: 1, h: 0.8266 },
    maxW: 1800,
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
