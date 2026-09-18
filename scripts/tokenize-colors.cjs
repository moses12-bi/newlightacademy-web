/**
 * Replaces raw hex colours in src with the design tokens declared in
 * globals.css `@theme`, so the palette has one source of truth.
 *
 *   node scripts/tokenize-colors.cjs --check   report only, exit 1 if any remain
 *   node scripts/tokenize-colors.cjs           rewrite in place
 *
 * Idempotent: rerunning after more code lands only converts what is new.
 * Only exact, known palette values are touched — anything else is reported
 * rather than guessed at, and Elementor element ids in comments (`#5dbd4e4c`)
 * are left alone because a match must be exactly six hex digits.
 */
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src');
const GLOBALS = path.join(SRC, 'app', 'globals.css');
const check = process.argv.includes('--check');

/** hex -> token name, mirroring the @theme block. */
const MAP = {
  '#e74c25': 'accent-1',
  '#167287': 'accent-2',
  '#0a303a': 'accent-3',
  '#d8d8d8': 'accent-4',
  '#ffffff': 'accent-5',
  '#000000': 'accent-6',
  '#ededed': 'accent-7',
  '#f4f1ea': 'accent-8',
  '#333333': 'ink',
  '#4a4a4a': 'muted',
  '#6572ae': 'nav-3',
  '#38bc83': 'nav-4',
  '#a79201': 'nav-5',
  '#11a5e4': 'nav-6',
  '#206feb': 'nav-7',
  '#f68f29': 'brand-orange',
  '#e95d3a': 'brand-coral',
  '#5e9f5a': 'brand-green',
  '#7048b1': 'brand-purple',
  '#aa81ed': 'brand-violet',
  '#419bc9': 'brand-sky',
  '#e0b53c': 'brand-gold',
  '#ffbc7d': 'brand-apricot',
  '#ffdbd2': 'tint-peach',
  '#ffd3c9': 'tint-peach-hover',
  '#ffefdf': 'tint-cream',
  '#ffe6cd': 'tint-cream-hover',
  '#dff8ff': 'tint-ice',
  '#cfeff7': 'tint-ice-hover',
  '#e6f9e5': 'tint-mint',
  '#d9f3d8': 'tint-mint-hover',
  '#f8f8f8': 'surface-muted',
  '#f9f8f4': 'surface-warm',
  '#b9d8e0': 'hairline',
  '#020d26': 'midnight',
  '#3b5998': 'facebook',
  '#1da1f2': 'twitter',
  '#0077b5': 'linkedin',
  '#8ab73a': 'brand-lime',
  '#488881': 'brand-teal-deep',
  '#e3b020': 'brand-amber',
  '#d5e6eb': 'tint-powder',
  '#fec0b9': 'tint-blush',
  '#faf8f5': 'surface-warm-alt',
};

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(css|ts|tsx)$/.test(entry.name) && full !== GLOBALS) files.push(full);
  }
})(SRC);

let changed = 0;
const remaining = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  let touched = false;

  const next = lines
    .map((line) => {
      // Leave comment lines alone: the page CSS carries Elementor element ids.
      const isComment = /^\s*(\/\*|\*|\/\/)/.test(line);
      return line.replace(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g, (hex) => {
        const token = MAP[hex.toLowerCase()];
        if (!token) {
          if (!isComment) remaining.push(`${path.relative(SRC, file)}: ${hex}`);
          return hex;
        }
        if (isComment) return hex;
        touched = true;
        return `var(--color-${token})`;
      });
    })
    .join('\n');

  if (touched) {
    changed++;
    if (!check) fs.writeFileSync(file, next, 'utf8');
  }
}

const stillHex = [];
for (const file of files) {
  const text = check ? fs.readFileSync(file, 'utf8') : fs.readFileSync(file, 'utf8');
  text.split('\n').forEach((line, i) => {
    if (/^\s*(\/\*|\*|\/\/)/.test(line)) return;
    const m = line.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g);
    if (m) stillHex.push(`${path.relative(SRC, file)}:${i + 1}  ${m.join(' ')}`);
  });
}

console.log(check ? 'CHECK ONLY — no files written' : `rewrote ${changed} file(s)`);
if (stillHex.length) {
  console.log(`\n${stillHex.length} line(s) still carry a raw hex colour:`);
  stillHex.slice(0, 40).forEach((l) => console.log('  ' + l));
  if (check) process.exit(1);
} else {
  console.log('no raw hex colours remain outside globals.css');
}
