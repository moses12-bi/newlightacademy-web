/**
 * Compares two screenshot directories and reports, per page, how much of the
 * rendering moved. The brand pass is expected to change colour and text, so the
 * signal we want is STRUCTURAL: whether the full-page height changed, which is
 * what shifts when layout or section structure drifts.
 *
 * Usage: node scripts/compare-shots.cjs artifacts/before artifacts/after
 */
const fs = require('node:fs');
const path = require('node:path');

const [a, b] = process.argv.slice(2);
const dims = (file) => {
  const buf = fs.readFileSync(file);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), bytes: buf.length };
};

const names = fs
  .readdirSync(a)
  .filter((f) => f.endsWith('.png'))
  .sort();

const rows = [];
for (const name of names) {
  const fileB = path.join(b, name);
  if (!fs.existsSync(fileB)) {
    rows.push({ name, status: 'MISSING AFTER' });
    continue;
  }
  const x = dims(path.join(a, name));
  const y = dims(fileB);
  const dh = y.h - x.h;
  const pct = x.h ? (dh / x.h) * 100 : 0;
  rows.push({
    name,
    before: `${x.w}x${x.h}`,
    after: `${y.w}x${y.h}`,
    dh,
    pct: pct.toFixed(1) + '%',
    status: y.w !== x.w ? 'WIDTH CHANGED' : Math.abs(pct) < 0.5 ? 'ok' : Math.abs(pct) < 3 ? 'minor' : 'HEIGHT DRIFT',
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('page', 26) + pad('before', 14) + pad('after', 14) + pad('dh', 8) + pad('%', 9) + 'status');
for (const r of rows) {
  if (r.status === 'MISSING AFTER') {
    console.log(pad(r.name, 26) + r.status);
    continue;
  }
  console.log(pad(r.name, 26) + pad(r.before, 14) + pad(r.after, 14) + pad(r.dh, 8) + pad(r.pct, 9) + r.status);
}
const bad = rows.filter((r) => r.status !== 'ok' && r.status !== 'minor');
console.log(`\n${rows.length} pages compared — ${rows.filter((r) => r.status === 'ok').length} unchanged, ` +
  `${rows.filter((r) => r.status === 'minor').length} minor, ${bad.length} needing a look`);
