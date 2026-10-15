/**
 * Builds the Programs page images from the school's own photographs.
 *
 *   node scripts/process-programs.cjs
 *
 * Source: the "new light" folder of photographs supplied by the school. Each
 * job cuts a window out of the source frame (fractions x, y, w, h) shaped for
 * the slot it fills, then scales it down to the slot's display size at 2x.
 * Nothing is upscaled: a window smaller than the target keeps its own
 * resolution.
 *
 * Output goes to public/images/programs/ as WebP.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const SRC = process.env.PROGRAMS_SRC || "C:/Users/moses/Downloads/new light";
const OUT = path.join(__dirname, "..", "public", "images", "programs");

/**
 * crop: fractions of the source frame — x, y, w, h. blur: optional regions,
 * also as fractions of the source frame, that are softened past reading. A
 * region's `keepLeftOf` is a line of [x, y] points (top to bottom): nothing
 * to the left of it is blurred, so a subject beside the region stays sharp.
 *
 * The hero slides are 16:9; children fill the frame, and the page title's
 * panel covers the middle and right of them on a desktop. The age cards are
 * the ImageBox's 1300x800; the fees and safety photos match the shapes of the
 * bands they sit in (500x230 and 500x400).
 */
const JOBS = [
  /* A pupil lines up a basketball shot while her class looks on. */
  { from: "KARISIMBI im(7).jpg.jpeg", to: "hero-1", crop: { x: 0, y: 0.07, w: 1, h: 0.8457 }, maxW: 2400 },
  /* Pupils with their school bags walking to the minibus. The right edge is
     trimmed to leave out a passer-by, and the part of the number plate that
     shows between two heads is blurred, stopping at the edge of the girl's
     braids beside it. */
  {
    from: "KARISIMBI im(15).jpg.jpeg",
    to: "hero-2",
    crop: { x: 0, y: 0.12, w: 0.9, h: 0.7611 },
    blur: [
      {
        x: 0.2655,
        y: 0.331,
        w: 0.036,
        h: 0.047,
        keepLeftOf: [
          [0.258, 0.31],
          [0.2615, 0.3275],
          [0.2645, 0.3325],
          [0.2668, 0.336],
          [0.2676, 0.341],
          [0.269, 0.346],
          [0.27, 0.352],
          [0.2706, 0.358],
          [0.271, 0.364],
          [0.271, 0.4],
        ],
      },
    ],
    maxW: 2400,
  },
  /* The four classes, youngest first: the nursery room's little chairs, the
     playground, a classroom with hands up, the computer room. */
  { from: "KARISIMBI im(11).jpg.jpeg", to: "baby-class", crop: { x: 0, y: 0.075, w: 1, h: 0.925 }, maxW: 1300 },
  { from: "KARISIMBI im(8).jpg.jpeg", to: "middle-class", crop: { x: 0.06, y: 0.13, w: 0.8, h: 0.74 }, maxW: 1300 },
  { from: "KARISIMBI im(2).jpg.jpeg", to: "top-class", crop: { x: 0, y: 0.06, w: 0.9, h: 0.8325 }, maxW: 1300 },
  { from: "KARISIMBI im(32).jpg.jpeg", to: "primary-school", crop: { x: 0, y: 0.06, w: 0.86, h: 0.7955 }, maxW: 1300 },
  /* A game on the court, for the fees band (2.17:1). */
  { from: "KARISIMBI im(28).jpg.jpeg", to: "tuition", crop: { x: 0, y: 0.14, w: 1, h: 0.6913 }, maxW: 1400 },
  /* Children seated on the school bus, for health and safety (5:4). */
  { from: "KARISIMBI im(13).jpg.jpeg", to: "safety", crop: { x: 0.04, y: 0, w: 0.8317, h: 1 }, maxW: 1400 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();

  for (const job of JOBS) {
    const file = path.join(SRC, job.from);
    if (!fs.existsSync(file)) {
      console.error(`  ! missing ${job.from}`);
      process.exitCode = 1;
      continue;
    }
    const b64 = fs.readFileSync(file).toString("base64");
    const result = await page.evaluate(
      ([data, crop, blur, maxW]) =>
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
            for (const r of blur) {
              /* Source fractions -> output pixels. A blurred copy of the
                 picture is masked to the rectangle with a feathered edge, so
                 it reads as out of focus rather than as a patch. */
              const bx = (img.width * r.x - sx) * scale;
              const by = (img.height * r.y - sy) * scale;
              const bw = img.width * r.w * scale;
              const bh = img.height * r.h * scale;
              const radius = Math.max(6, Math.round(bh / 6));
              const feather = Math.round(radius / 2);
              const layer = document.createElement("canvas");
              layer.width = c.width;
              layer.height = c.height;
              const lctx = layer.getContext("2d");
              lctx.filter = `blur(${radius}px)`;
              lctx.drawImage(c, 0, 0);
              const mask = document.createElement("canvas");
              mask.width = c.width;
              mask.height = c.height;
              const mctx = mask.getContext("2d");
              mctx.filter = `blur(${feather}px)`;
              mctx.fillStyle = "#000";
              mctx.fillRect(bx - feather, by - feather, bw + feather * 2, bh + feather * 2);
              if (r.keepLeftOf) {
                /* Cut the mask away, with a hard edge, left of the line. */
                const pts = r.keepLeftOf.map(([px, py]) => [(img.width * px - sx) * scale, (img.height * py - sy) * scale]);
                mctx.filter = "none";
                mctx.globalCompositeOperation = "destination-out";
                mctx.beginPath();
                mctx.moveTo(0, pts[0][1]);
                for (const [px, py] of pts) mctx.lineTo(px, py);
                mctx.lineTo(0, pts[pts.length - 1][1]);
                mctx.closePath();
                mctx.fill();
              }
              lctx.filter = "none";
              lctx.globalCompositeOperation = "destination-in";
              lctx.drawImage(mask, 0, 0);
              ctx.drawImage(layer, 0, 0);
            }
            resolve({ data: c.toDataURL("image/webp", 0.86).split(",")[1], w: c.width, h: c.height });
          };
          img.onerror = () => reject(new Error("decode failed"));
          img.src = "data:image/jpeg;base64," + data;
        }),
      [b64, job.crop, job.blur || [], job.maxW]
    );
    const dest = path.join(OUT, `${job.to}.webp`);
    fs.writeFileSync(dest, Buffer.from(result.data, "base64"));
    console.log(`  ${job.to.padEnd(14)} ${result.w}x${result.h}  ${(fs.statSync(dest).size / 1024).toFixed(0)}KB  <- ${job.from}`);
  }
  await browser.close();
})();
