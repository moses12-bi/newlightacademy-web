/**
 * Builds the Our Teachers images from the school's staff photographs.
 *
 *   node scripts/process-staff.cjs
 *
 * Source: the "new light" folder of staff photographs supplied by the school,
 * except staff-07b, whose studio portrait (public/images/teach3.png, supplied
 * earlier) replaced a low-resolution phone photo of the same person.
 * Portraits are cropped to 4:5 (the card shape) around the person, who stands
 * centred in every frame; the group photograph is cropped to a wide 16:7 band
 * around the team, trimming sky and lawn. Nothing is upscaled: a source smaller
 * than the target keeps its own resolution.
 *
 * Output goes to public/images/staff/ as WebP. ONLY=staff-07b limits a run to
 * the named outputs.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const SRC = process.env.STAFF_SRC || "C:/Users/moses/Downloads/new light";
const OUT = path.join(__dirname, "..", "public", "images", "staff");

/**
 * crop: fractions of the source frame — x, y, w, h. `null` means "the
 * largest 4:5 window, centred horizontally, full height".
 */
const JOBS = [
  { from: "KARISIMBI im(16).jpg.jpeg", to: "staff-01", crop: null, maxW: 800 },
  { from: "KARISIMBI im(17).jpg.jpeg", to: "staff-02", crop: null, maxW: 800 },
  { from: "KARISIMBI im(18).jpg.jpeg", to: "staff-03", crop: null, maxW: 800 },
  { from: "KARISIMBI im(19).jpg.jpeg", to: "staff-04", crop: null, maxW: 800 },
  { from: "KARISIMBI im(20).jpg.jpeg", to: "staff-05", crop: null, maxW: 800 },
  /* Already 4:5 (1122x1402), so the whole frame. */
  { from: path.join(__dirname, "..", "public", "images", "teach3.png"), to: "staff-07b", crop: null, maxW: 800 },
  /* The whole teaching team, 16:7, centred on the group. */
  { from: "KARISIMBI im(22).jpg.jpeg", to: "team-group", crop: { x: 0, y: 0.281, w: 1, h: 0.657 }, maxW: 1800 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();

  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
  for (const job of JOBS) {
    if (only && !only.includes(job.to)) continue;
    const file = path.resolve(SRC, job.from);
    if (!fs.existsSync(file)) {
      console.error(`  ! missing ${job.from}`);
      continue;
    }
    const b64 = fs.readFileSync(file).toString("base64");
    const result = await page.evaluate(
      ([data, crop, maxW, mime]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const W = img.width;
            const H = img.height;
            let sx, sy, sw, sh;
            if (crop) {
              sx = W * crop.x;
              sy = H * crop.y;
              sw = W * crop.w;
              sh = H * crop.h;
            } else {
              sh = H;
              sw = Math.min(W, H * 0.8);
              sx = (W - sw) / 2;
              sy = 0;
            }
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
          img.src = "data:" + mime + ";base64," + data;
        }),
      [b64, job.crop, job.maxW, file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"]
    );
    const dest = path.join(OUT, `${job.to}.webp`);
    fs.writeFileSync(dest, Buffer.from(result.data, "base64"));
    console.log(`  ${job.to.padEnd(11)} ${result.w}x${result.h}  ${(fs.statSync(dest).size / 1024).toFixed(0)}KB  <- ${job.from}`);
  }
  await browser.close();
})();
