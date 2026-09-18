/**
 * Rebuilds the staff photos the site actually loads
 * (public/images/staff/*.webp) from their full-size sources
 * (public/images/teach*.png, director.png).
 *
 *   node scripts/build-staff-images.cjs           rebuild only what is stale
 *   node scripts/build-staff-images.cjs --force   rebuild everything
 *   node scripts/build-staff-images.cjs --check   report staleness, exit 1 if any
 *
 * Why this exists: the pages reference the .webp derivatives, not the PNGs, so
 * replacing a source photo has no visible effect until its .webp is rebuilt.
 * That silently served a stale portrait once already.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const STAFF = path.join(IMAGES, 'staff');

const force = process.argv.includes('--force');
const check = process.argv.includes('--check');

/** Matches the existing derivatives: 1122x1402 sources resized to 700 wide. */
const WIDTH = 700;
const QUALITY = 82;

/** source (in public/images) -> derivative (in public/images/staff) */
const PAIRS = [
  ...Array.from({ length: 6 }, (_, i) => ({
    from: `teach${i + 1}.png`,
    to: `teacher-${i + 1}.webp`,
  })),
  { from: 'director.png', to: 'director.webp' },
];

(async () => {
  const stale = [];
  const rebuilt = [];
  const missing = [];

  for (const { from, to } of PAIRS) {
    const src = path.join(IMAGES, from);
    const dest = path.join(STAFF, to);

    if (!fs.existsSync(src)) {
      // A derivative with no source is fine (it may predate this script);
      // a missing source is only worth reporting if the derivative is missing too.
      if (!fs.existsSync(dest)) missing.push(`${from} -> ${to} (neither exists)`);
      continue;
    }

    const srcTime = fs.statSync(src).mtimeMs;
    const destTime = fs.existsSync(dest) ? fs.statSync(dest).mtimeMs : 0;
    const isStale = srcTime > destTime;

    if (!isStale && !force) continue;
    stale.push(`${from} (${new Date(srcTime).toISOString()}) is newer than ${to}`);
    if (check) continue;

    const meta = await sharp(src).metadata();
    const height = Math.round((meta.height / meta.width) * WIDTH);
    await sharp(src).resize(WIDTH, height, { fit: 'cover' }).webp({ quality: QUALITY }).toFile(dest);
    rebuilt.push(`${to}  ${WIDTH}x${height}  ${fs.statSync(dest).size} bytes  <- ${from}`);
  }

  if (missing.length) {
    console.log('missing sources:');
    missing.forEach((m) => console.log('  ' + m));
  }

  if (check) {
    if (stale.length) {
      console.log(`${stale.length} derivative(s) are STALE — run: node scripts/build-staff-images.cjs`);
      stale.forEach((s) => console.log('  ' + s));
      process.exit(1);
    }
    console.log('all staff photos are up to date with their sources');
    return;
  }

  if (!rebuilt.length) {
    console.log('nothing to rebuild — every derivative is newer than its source');
    return;
  }
  console.log(`rebuilt ${rebuilt.length}:`);
  rebuilt.forEach((r) => console.log('  ' + r));
})();
