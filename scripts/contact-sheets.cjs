/**
 * Renders numbered contact sheets of the school photo library so the shots can
 * be reviewed and picked by index rather than opened one at a time.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const ROOT = "C:/Users/moses/Downloads/school_theme/newlight-accademy_images";
const SETS = [
  { key: "P", dir: path.join(ROOT, "PHOTOS-1-001/PHOTOS") },
  { key: "U", dir: path.join(ROOT, "Untitled-1-001/Untitled") },
];
const PER_SHEET = 48;
const COLS = 8;
const CELL = 230;

const fileUrl = (p) => "file:///" + p.split(path.sep).join("/");

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const manifest = [];
  for (const set of SETS) {
    const files = fs.readdirSync(set.dir).filter((f) => /\.jpg$/i.test(f)).sort();
    for (let start = 0; start < files.length; start += PER_SHEET) {
      const chunk = files.slice(start, start + PER_SHEET);
      const cells = chunk
        .map((f, i) => {
          const id = `${set.key}${start + i + 1}`;
          const full = path.join(set.dir, f);
          manifest.push({ id, file: full, name: f });
          return `<figure><img src="${fileUrl(full)}" loading="eager"><figcaption>${id}</figcaption></figure>`;
        })
        .join("");
      const page = await browser.newPage({
        viewport: {
          width: COLS * CELL + 24,
          height: Math.ceil(chunk.length / COLS) * (CELL + 26) + 24,
        },
      });
      /* The sheet is written to disk and navigated to, rather than injected with
         setContent: a page served from about:blank has no file: origin, so every
         file:/// image is blocked and the sheet renders as broken icons. */
      const html = `<style>
          body{margin:12px;background:#111;display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:4px}
          figure{margin:0}
          img{width:${CELL}px;height:${CELL}px;object-fit:cover;display:block;background:#222}
          figcaption{color:#9f9;font:12px monospace;text-align:center;padding:2px}
        </style>${cells}`;
      const htmlPath = path.resolve("artifacts/contact/_sheet.html");
      fs.writeFileSync(htmlPath, html);
      await page.goto(fileUrl(htmlPath), { waitUntil: "load" });
      await page
        .waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 180000 })
        .catch(() => {});
      const sheet = String(Math.floor(start / PER_SHEET) + 1).padStart(2, "0");
      const out = `artifacts/contact/sheet-${set.key}-${sheet}.png`;
      await page.screenshot({ path: out, fullPage: true });
      await page.close();
      console.log(`${out}  ${chunk.length} frames (${set.key}${start + 1}-${set.key}${start + chunk.length})`);
    }
  }
  fs.writeFileSync("artifacts/contact/manifest.json", JSON.stringify(manifest, null, 1));
  await browser.close();
  console.log(`manifest: ${manifest.length} frames`);
})();
