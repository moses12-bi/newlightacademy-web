/**
 * Unit checks for src/lib/motion-fx.ts against Elementor's own formulas, which
 * are reproduced here independently (transcribed from the theme's runtime) so a
 * mistake in the port shows up as a disagreement rather than matching bugs.
 *
 *   node scripts/verify-motion-math.cjs
 */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Compile the TS module to CJS with the project's own TypeScript, then load it.
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'motionfx-'));
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), 'src/lib/motion-fx.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { stdio: 'pipe' },
);
const fx = require(path.join(out, 'motion-fx.js'));

/* ---- reference implementations, transcribed from Elementor ---------------- */

const refMovePointFromPassed = (e, t) => +((t / e) * 100).toFixed(2);
const refEffectValue = (e, t) => (e * t) / 100;

function refDirectionMovePoint(e, t, n) {
  let s;
  if (e < n.start) {
    if ('out-in' === t) s = 0;
    else if ('in-out' === t) s = 100;
    else { s = refMovePointFromPassed(n.start, e); if ('in-out-in' === t) s = 100 - s; }
  } else if (e < n.end) {
    if ('in-out-in' === t) s = 0;
    else if ('out-in-out' === t) s = 100;
    else { s = refMovePointFromPassed(n.end - n.start, e - n.start); if ('in-out' === t) s = 100 - s; }
  } else {
    if ('in-out' === t) s = 0;
    else if ('out-in' === t) s = 100;
    else { s = refMovePointFromPassed(100 - n.end, 100 - e); if ('in-out-in' === t) s = 100 - s; }
  }
  return s;
}

const refElementStep = (e, t) => -(e - 50) * t.speed;

function refElementViewportPercentage(rect, innerHeight, opts = {}) {
  const n = opts.start || 0, i = opts.end || 0;
  const s = (innerHeight * n) / 100, o = (innerHeight * i) / 100;
  const a = rect.top - innerHeight;
  const c = 0 - a + s;
  const l = rect.top + s + rect.height - a + o;
  const u = Math.max(0, Math.min(c / l, 1));
  return parseFloat((100 * u).toFixed(2));
}

function refPageScrollPercentage(scrollTop, range, opts = {}) {
  const r = opts.start || 0, n = opts.end || 0;
  const i = range;
  const s = (i * r) / 100;
  const o = i + s + (i * n) / 100;
  return ((scrollTop + s) / o) * 100;
}

/* ---- the real settings the 25 pages use ---------------------------------- */

const DIRECTIONS = ['', 'in-out', 'out-in', 'in-out-in', 'out-in-out'];
const RANGES = [
  { start: 0, end: 40 }, { start: 50, end: 100 }, { start: 1, end: 100 },
  { start: 0, end: 30 }, { start: 30, end: 100 }, { start: 0, end: 96 }, { start: 0, end: 94 },
];
const SPEEDS = [2, 6, 4, 3, -3, 0.6, 10, 11];

let checks = 0;
// The port reproduces Elementor's NaN exactly; non-finite values are then skipped
// at emission time (the browser drops such a declaration anyway).
const near = (a, b, msg) => {
  if (Number.isNaN(b)) { assert.ok(Number.isNaN(a), ); checks++; return; }
  assert.ok(Math.abs(a - b) < 1e-9, );
  checks++;
};

// movePoint across every direction x range x progress
for (const d of DIRECTIONS) {
  for (const r of RANGES) {
    for (let p = 0; p <= 100; p += 0.5) {
      near(fx.movePoint(p, d, r), refDirectionMovePoint(p, d, r), `movePoint(${p},"${d}",${JSON.stringify(r)})`);
    }
  }
}

// scale = 1 + speed*mp/1000
for (const d of DIRECTIONS) for (const r of RANGES) for (const speed of SPEEDS) for (let p = 0; p <= 100; p += 5) {
  near(fx.scaleValue(p, { speed, direction: d, range: r }), 1 + (speed * refDirectionMovePoint(p, d, r)) / 1000, 'scale');
}

// translate/rotateZ = -(p-50)*speed, direction flips the progress
for (const speed of SPEEDS) for (let p = 0; p <= 100; p += 5) {
  near(fx.translateValue(p, { speed }), refElementStep(p, { speed }), 'translate');
  near(fx.translateValue(p, { speed, direction: 'in-out' }), refElementStep(100 - p, { speed }), 'translate flipped');
}

// opacity = 1 - level/10 + (level/10)*mp/100
for (const level of [1, 3, 5, 10]) for (const r of RANGES) for (let p = 0; p <= 100; p += 10) {
  const mp = refDirectionMovePoint(p, 'in-out', r);
  near(fx.opacityValue(p, { level, direction: 'in-out', range: r }), 1 - level / 10 + refEffectValue(level / 10, mp), 'opacity');
}

// blur = level - level*mp/100
for (const level of [2, 5, 8]) for (const r of RANGES) for (let p = 0; p <= 100; p += 10) {
  const mp = refDirectionMovePoint(p, '', r);
  near(fx.blurValue(p, { level, direction: '', range: r }), level - refEffectValue(level, mp), 'blur');
}

// affectedRange clamps before the action
near(fx.clampToAffected(10, { start: 25, end: 75 }), 25, 'clamp low');
near(fx.clampToAffected(90, { start: 25, end: 75 }), 75, 'clamp high');
near(fx.clampToAffected(50, { start: 25, end: 75 }), 50, 'clamp inside');

// viewport + page progress
for (const top of [-900, -200, 0, 150, 400, 900, 1600]) for (const height of [100, 420, 900]) {
  near(fx.elementViewportPercent({ top, height }, 900), refElementViewportPercentage({ top, height }, 900), 'viewport%');
  near(fx.elementViewportPercent({ top, height }, 900, { start: 10, end: 20 }),
       refElementViewportPercentage({ top, height }, 900, { start: 10, end: 20 }), 'viewport% ranged');
}
for (const st of [0, 250, 1200, 4000]) {
  near(fx.pageScrollPercent(st, 5000), refPageScrollPercentage(st, 5000), 'page%');
}

// tilt halves the speed and inverts X, per Elementor's tilt()
{
  const s = { speed: 4 };
  const got = fx.tiltValue(25, 75, s);
  const inner = { speed: 0.4 };
  near(got.rotateX, refElementStep(75, inner), 'tilt rotateX');
  near(got.rotateY, refElementStep(100 - 25, inner), 'tilt rotateY');
}

// devices
assert.equal(fx.deviceFor(320), 'mobile');
assert.equal(fx.deviceFor(767), 'mobile');
assert.equal(fx.deviceFor(768), 'tablet');
assert.equal(fx.deviceFor(1024), 'tablet');
assert.equal(fx.deviceFor(1025), 'desktop');
assert.equal(fx.deviceFor(1440), 'desktop');
checks += 6;

// a null result means "clear the inline styles", not "write identity"
assert.equal(fx.scrollStyles(50, {}), null);
assert.equal(fx.mouseStyles(50, 50, {}), null);
checks += 2;

// real config from the pages: scale in-out 0-40 @ speed 2
{
  const s = { speed: 2, direction: 'in-out', range: { start: 0, end: 40 } };
  near(fx.scaleValue(0, s), 1 + (2 * refDirectionMovePoint(0, 'in-out', s.range)) / 1000, 'real scale @0');
  near(fx.scaleValue(100, s), 1 + (2 * refDirectionMovePoint(100, 'in-out', s.range)) / 1000, 'real scale @100');
  const styles = fx.scrollStyles(20, { scale: s, translateY: { speed: 4 } });
  assert.ok(styles.transform.includes('translateY(') && styles.transform.includes('scale('), 'combined transform');
  checks++;
}

fs.rmSync(out, { recursive: true, force: true });
console.log(`PASS motion-fx maths — ${checks} assertions against Elementor's own formulas`);
