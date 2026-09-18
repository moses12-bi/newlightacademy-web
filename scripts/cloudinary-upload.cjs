/**
 * Uploads the curated New Light Academy photographs to Cloudinary.
 *
 *   node scripts/cloudinary-upload.cjs            # dry run: prints the plan
 *   node scripts/cloudinary-upload.cjs --upload   # actually uploads
 *
 * Reads credentials from .env.local. Nothing is written back into the
 * repository: the site reads the gallery from Cloudinary by tag at build time,
 * so adding or removing a photo is done in the Cloudinary console.
 *
 * Originals are 4000-5500px and ~5MB each. They are downscaled to 2560px on the
 * long edge before upload — still far larger than any slot on the site, and it
 * keeps storage and upload time sane. Cloudinary resizes per request from there.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const MANIFEST = "artifacts/contact/manifest.json";
const FOLDER = "new-light-academy";
const MAX_EDGE = 2560;

/* ---------------------------------------------------------------- credentials */

function loadEnv(file = ".env.local") {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

/* ---------------------------------------------------------------- the picks */

/**
 * Frame ids come from the contact sheets in artifacts/contact/. `alt` describes
 * what is visibly in the frame and nothing more — no names, no claims about the
 * occasion beyond what the picture itself shows.
 */
const PICKS = [
  // --- gallery -----------------------------------------------------------
  { id: "U26", slug: "children-in-uniform-line", alt: "Young pupils in gold and navy uniform standing in a line outdoors", tags: ["gallery", "nursery"] },
  { id: "U69", slug: "pupil-white-coat-microphone", alt: "A pupil in a white coat speaking into a microphone", tags: ["gallery", "careers"] },
  { id: "U139", slug: "nursery-graduation-gowns", alt: "Nursery pupils in blue and gold graduation gowns and caps", tags: ["gallery", "graduation"] },
  { id: "P97", slug: "graduates-red-gowns", alt: "Pupils in red graduation gowns and caps gathered together", tags: ["gallery", "graduation"] },
  { id: "U54", slug: "football-team-green-kit", alt: "Pupils in green football kit on a pitch", tags: ["gallery", "sport"] },
  { id: "U95", slug: "karate-demonstration", alt: "Pupils in white karate uniforms with coloured belts mid-demonstration", tags: ["gallery", "sport"] },
  { id: "U80", slug: "brass-band", alt: "Pupils playing brass instruments and a bass drum", tags: ["gallery", "music"] },
  { id: "P108", slug: "traditional-dance", alt: "Pupils performing a traditional dance in patterned costume", tags: ["gallery", "culture"] },
  { id: "U76", slug: "role-play-activity-table", alt: "Children in white coats and chef hats at an activity table", tags: ["gallery", "careers"] },
  { id: "P44", slug: "school-building", alt: "The school building, painted in pink and green, with an open walkway", tags: ["gallery", "campus"] },
  { id: "U22", slug: "pupils-with-certificates", alt: "Pupils in uniform holding framed certificates", tags: ["gallery", "primary"] },
  { id: "P99", slug: "graduation-assembly", alt: "A large group of pupils in blue graduation gowns seated together", tags: ["gallery", "graduation"] },

  // --- page slots --------------------------------------------------------
  { id: "U27", slug: "nursery-pupils-outdoors", alt: "Young pupils in uniform standing on green ground outdoors", tags: ["hero", "nursery"] },
  { id: "U29", slug: "nursery-pair", alt: "Two young pupils in gold and navy uniform", tags: ["nursery"] },
  { id: "U30", slug: "nursery-group-small", alt: "A small group of nursery pupils in uniform", tags: ["nursery"] },
  { id: "U21", slug: "primary-pupils-certificates", alt: "Primary pupils in uniform holding certificates", tags: ["primary"] },
  { id: "U24", slug: "primary-pupils-group", alt: "Primary pupils in uniform standing together outdoors", tags: ["primary"] },
  { id: "U53", slug: "football-match", alt: "Pupils in football kit during a match", tags: ["sport"] },
  { id: "U96", slug: "karate-line", alt: "Pupils in karate uniforms standing in a line", tags: ["sport"] },
  { id: "U136", slug: "band-procession", alt: "Pupils marching with brass instruments and drums", tags: ["music"] },
  { id: "U75", slug: "role-play-pair", alt: "Two children in dress-up costume holding microphones", tags: ["careers"] },
  { id: "U140", slug: "nursery-graduation-group", alt: "Nursery pupils in graduation gowns raising their arms", tags: ["graduation"] },
  { id: "P41", slug: "campus-walkway", alt: "A walkway alongside the school building", tags: ["campus"] },
  { id: "P45", slug: "campus-courtyard", alt: "The school courtyard with classroom blocks around it", tags: ["campus"] },
  { id: "P110", slug: "dance-performance", alt: "Pupils performing a dance in front of an audience", tags: ["culture"] },
  { id: "P21", slug: "graduation-board", alt: "A board of pupil photographs displayed at a graduation ceremony", tags: ["graduation"] },
];

/* ---------------------------------------------------------------- upload */

function signature(params, secret) {
  const canonical = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(canonical + secret).digest("hex");
}

(async () => {
  const env = loadEnv();
  const cloud = env.CLOUDINARY_CLOUD_NAME;
  const key = env.CLOUDINARY_API_KEY;
  const secret = env.CLOUDINARY_API_SECRET;
  const doUpload = process.argv.includes("--upload");

  if (!fs.existsSync(MANIFEST)) {
    console.error(`missing ${MANIFEST} — run: node scripts/contact-sheets.cjs`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const byId = new Map(manifest.map((m) => [m.id, m]));

  const plan = [];
  for (const pick of PICKS) {
    const frame = byId.get(pick.id);
    if (!frame) {
      console.error(`  ! ${pick.id} not found in manifest`);
      continue;
    }
    plan.push({ ...pick, file: frame.file, name: frame.name });
  }

  console.log(`${plan.length} of ${PICKS.length} picks resolved.`);
  if (!doUpload) {
    for (const p of plan) console.log(`  ${p.id.padEnd(5)} ${p.name.padEnd(16)} -> ${FOLDER}/${p.slug}  [${p.tags.join(", ")}]`);
    console.log("\nDry run. Re-run with --upload to send these to Cloudinary.");
    return;
  }
  if (!cloud || !key || !secret) {
    console.error("CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET must all be set in .env.local");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();

  let ok = 0;
  for (const p of plan) {
    /* Downscale in the browser: the project has no image library, and the
       originals are far larger than anything the site or Cloudinary needs. */
    const b64 = fs.readFileSync(p.file).toString("base64");
    const jpeg = await page.evaluate(
      ([data, maxEdge]) =>
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
            resolve(c.toDataURL("image/jpeg", 0.9).split(",")[1]);
          };
          img.onerror = () => reject(new Error("decode failed"));
          img.src = "data:image/jpeg;base64," + data;
        }),
      [b64, MAX_EDGE]
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const context = `alt=${p.alt}`;
    const signed = {
      context,
      public_id: `${FOLDER}/${p.slug}`,
      tags: ["nla", ...p.tags.map((t) => `nla-${t}`)].join(","),
      timestamp,
    };

    const form = new FormData();
    form.append("file", `data:image/jpeg;base64,${jpeg}`);
    form.append("api_key", key);
    form.append("timestamp", String(timestamp));
    form.append("public_id", signed.public_id);
    form.append("tags", signed.tags);
    form.append("context", context);
    form.append("signature", signature(signed, secret));

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      body: form,
    });
    const body = await res.json();
    if (!res.ok) {
      console.error(`  FAIL ${p.id} ${p.slug}: ${body.error ? body.error.message : res.status}`);
      continue;
    }
    ok += 1;
    console.log(`  ok ${p.id.padEnd(5)} ${body.public_id}  ${body.width}x${body.height}  ${(body.bytes / 1024).toFixed(0)}KB`);
  }

  await browser.close();
  console.log(`\n${ok}/${plan.length} uploaded.`);
})();
