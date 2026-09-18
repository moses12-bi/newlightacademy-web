/**
 * Writes the curated school photographs into public/images/school/ and
 * regenerates the gallery data module from what it actually produced.
 *
 *   node scripts/process-photos.cjs
 *
 * Originals are 4000-5500px and ~5MB each. They are downscaled to 1800px on the
 * long edge, which is larger than any slot on the site — next/image builds the
 * responsive variants from there.
 *
 * Dimensions in photos.ts are read back off the encoded file rather than
 * assumed, so the justified layout's aspect ratios cannot drift from the images.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const PICKS = require("./photo-picks.cjs");
const MANIFEST = "artifacts/contact/manifest.json";
const OUT_DIR = "public/images/school";
const DATA_FILE = "src/components/sections/gallery/photos.ts";
const MAX_EDGE = 1800;
const QUALITY = 0.85;

/** Reads width/height straight out of the JPEG's SOF marker. */
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) break;
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

(async () => {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`missing ${MANIFEST} — run: node scripts/contact-sheets.cjs`);
    process.exit(1);
  }
  const byId = new Map(JSON.parse(fs.readFileSync(MANIFEST, "utf8")).map((m) => [m.id, m]));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();
  const done = [];

  for (const pick of PICKS) {
    const frame = byId.get(pick.id);
    if (!frame) {
      console.error(`  ! ${pick.id} not in manifest`);
      continue;
    }
    const b64 = fs.readFileSync(frame.file).toString("base64");
    const jpeg = await page.evaluate(
      ([data, maxEdge, quality]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            const ctx = c.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL("image/jpeg", quality).split(",")[1]);
          };
          img.onerror = () => reject(new Error("decode failed"));
          img.src = "data:image/jpeg;base64," + data;
        }),
      [b64, MAX_EDGE, QUALITY]
    );

    const out = path.join(OUT_DIR, `${pick.slug}.jpg`);
    fs.writeFileSync(out, Buffer.from(jpeg, "base64"));
    const size = jpegSize(out);
    done.push({ ...pick, src: `/images/school/${pick.slug}.jpg`, ...size });
    console.log(`  ${pick.id.padEnd(5)} ${pick.slug.padEnd(30)} ${size.width}x${size.height}  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
  }
  await browser.close();

  /* Regenerate the gallery module from what was actually written. */
  const gallery = done.filter((p) => p.tags.includes("gallery"));
  const entries = gallery
    .map(
      (p) => `  {
    src: "${p.src}",
    width: ${p.width},
    height: ${p.height},
    ratio: ${p.width} / ${p.height},
    alt: "${p.alt.replace(/"/g, '\\"')}",
  },`
    )
    .join("\n");

  fs.writeFileSync(
    DATA_FILE,
    `export interface GalleryPhoto {
  /** Local file under public/images/school/. */
  src: string;
  width: number;
  height: number;
  /** Aspect ratio the justified layout lays each row out from. */
  ratio: number;
  /**
   * What the picture shows, for screen readers. Each line describes only what
   * is visibly in the frame — no names, and no claim about the occasion beyond
   * what the photograph itself shows.
   */
  alt?: string;
}

/**
 * New Light Academy's own photographs, curated from the school's library and
 * written here by scripts/process-photos.cjs. Do not hand-edit: change
 * scripts/photo-picks.cjs and re-run it, so the dimensions stay tied to the
 * files on disk.
 *
 * The school has confirmed it holds parental consent for these images. The
 * gallery page carries a route for a parent to ask for a photograph of their
 * child to be removed, which Rwanda's Law 058/2021 requires alongside consent.
 */
export const galleryPhotos: GalleryPhoto[] = [
${entries}
];
`
  );

  console.log(`\n${done.length} photographs written to ${OUT_DIR}`);
  console.log(`${gallery.length} of them wired into ${DATA_FILE}`);
  const total = done.reduce((n, p) => n + fs.statSync(path.join(OUT_DIR, `${p.slug}.jpg`)).size, 0);
  console.log(`total ${(total / 1048576).toFixed(1)}MB`);
})();
