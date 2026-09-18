/**
 * Removes CSS rules belonging to a deleted route.
 *
 *   node scripts/strip-dead-css.cjs src/styles/misc.css home2-
 *
 * Rules are dropped only when EVERY selector in the list matches the prefix, so
 * a rule shared with a surviving page is left alone. @media blocks are walked
 * recursively and removed when stripping empties them. Prints what it removed;
 * run the verification suite afterwards.
 */
const fs = require("node:fs");

const [file, prefix] = process.argv.slice(2);
if (!file || !prefix) {
  console.error("usage: node scripts/strip-dead-css.cjs <file.css> <class-prefix>");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");

/** Splits a block's body into top-level chunks: comments, at-rules and rules. */
function parse(body) {
  const chunks = [];
  let i = 0;
  let start = 0;
  while (i < body.length) {
    if (body.startsWith("/*", i)) {
      const end = body.indexOf("*/", i + 2);
      const stop = end === -1 ? body.length : end + 2;
      if (i > start) chunks.push({ type: "text", text: body.slice(start, i) });
      chunks.push({ type: "comment", text: body.slice(i, stop) });
      i = stop;
      start = i;
      continue;
    }
    if (body[i] === "{") {
      let depth = 1;
      let j = i + 1;
      while (j < body.length && depth > 0) {
        if (body.startsWith("/*", j)) {
          const end = body.indexOf("*/", j + 2);
          j = end === -1 ? body.length : end + 2;
          continue;
        }
        if (body[j] === "{") depth += 1;
        else if (body[j] === "}") depth -= 1;
        j += 1;
      }
      const prelude = body.slice(start, i);
      chunks.push({ type: "block", prelude, body: body.slice(i + 1, j - 1), raw: body.slice(start, j) });
      i = j;
      start = i;
      continue;
    }
    i += 1;
  }
  if (start < body.length) chunks.push({ type: "text", text: body.slice(start) });
  return chunks;
}

let removed = 0;

function strip(body) {
  const out = [];
  for (const chunk of parse(body)) {
    if (chunk.type !== "block") {
      out.push(chunk.text);
      continue;
    }
    const prelude = chunk.prelude.trim();
    if (prelude.startsWith("@")) {
      const inner = strip(chunk.body);
      /* An at-rule whose body is now only whitespace has nothing left to apply. */
      if (inner.trim() === "") {
        removed += 1;
        continue;
      }
      out.push(`${chunk.prelude}{${inner}}`);
      continue;
    }
    const selectors = prelude.split(",").map((s) => s.trim()).filter(Boolean);
    const allDead = selectors.length > 0 && selectors.every((s) => s.includes(`.${prefix}`));
    if (allDead) {
      removed += selectors.length;
      continue;
    }
    out.push(chunk.raw);
  }
  return out.join("");
}

const result = strip(source).replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(file, result);

const before = source.split("\n").length;
const after = result.split("\n").length;
console.log(`${file}: removed ${removed} selectors, ${before} -> ${after} lines`);
const leftover = (result.match(new RegExp(`\\.${prefix}[\\w-]*`, "g")) || []).length;
console.log(leftover ? `  ${leftover} .${prefix}* mentions remain (shared rules or comments) — check them` : `  no .${prefix}* left`);
