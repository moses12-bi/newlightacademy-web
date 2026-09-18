/**
 * Section 25 final search: scans production source for every demo/foreign term
 * the brand transformation was supposed to remove. Separates user-visible
 * occurrences from ones surviving only in comments, which are reported and
 * explained rather than counted as failures.
 */
const fs = require("node:fs");
const path = require("node:path");

const TERMS = [
  "Skole", "Scole", "SKole", "Bright Horizons", "Chick-fil-A", "Truett", "WinShape", "Safari Kid",
  "Lively Letters", "Open Court", "Responsive Classroom", "Handwriting Without Tears", "Everyday Math",
  "Park Street", "Centertown", "Warren County", "Goldfish", "Cheez-its", "JCPenney", "WalMart",
  "Land's End", "Valeria", "Antonia", "hi@kindergarten.com", "541-754-3010", "201 700 5353",
  "kindergarten.com", "Manchester Square", "W1U", "London", "United Kingdom", "paypal",
  "VamTam", "Freepik", "401(k)", "Multnomah", "Portland", "Los Angeles", "Oregon",
];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx?|css|mjs)$/.test(entry.name)) files.push(p);
  }
})("src");

/** True when the line sits inside a block comment or starts one. */
function isComment(lines, idx) {
  const trimmed = lines[idx].trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return true;
  let open = 0;
  for (let i = 0; i <= idx; i++) {
    open += (lines[i].match(/\/\*/g) || []).length;
    open -= (lines[i].match(/\*\//g) || []).length;
  }
  return open > 0;
}

const hits = [];
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (const term of TERMS) {
    lines.forEach((line, i) => {
      if (!line.includes(term)) return;
      hits.push({
        file: file.split(path.sep).join("/"),
        line: i + 1,
        term,
        comment: isComment(lines, i),
        text: line.trim().slice(0, 130),
      });
    });
  }
}

const code = hits.filter((h) => !h.comment);
const comments = hits.filter((h) => h.comment);

console.log(`=== IN CODE (user-visible risk): ${code.length} ===`);
for (const h of code) console.log(`  ${h.file}:${h.line}  [${h.term}]  ${h.text}`);
console.log(`\n=== IN COMMENTS ONLY: ${comments.length} ===`);
for (const h of comments) console.log(`  ${h.file}:${h.line}  [${h.term}]  ${h.text}`);
console.log(`\nscanned ${files.length} files against ${TERMS.length} terms`);
