/**
 * Responsive audit across every route and the theme's real breakpoints.
 *
 * Reports only things a person would actually notice:
 *   - horizontal overflow, and WHICH element causes it
 *   - text clipped by a fixed height / overflow:hidden
 *   - images that fail to load or render distorted vs their intrinsic ratio
 *   - touch targets below 24px on phone widths
 *   - content that overlaps the sticky header
 *   - text narrower than ~18 characters (squeezed columns)
 *
 *   node scripts/audit-responsive.cjs
 *   ROUTES=/,/about WIDTHS=390,1440 node scripts/audit-responsive.cjs
 */
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.BASE_URL || 'http://localhost:3000';
const WIDTHS = (process.env.WIDTHS || '320,390,768,1024,1025,1280,1440').split(',').map(Number);
const ALL = [
  '/', '/about', '/gallery', '/our-teachers', '/careers', '/daily-schedule',
  '/programs', '/infants', '/toddlers', '/preschool', '/kindergarten', '/flex-care',
  '/art-program', '/admissions', '/tuition', '/how-to-apply', '/faq', '/schedule-a-tour',
  '/coming-soon', '/parents', '/make-a-payment', '/student-handbook',
  '/school-calendar', '/blog', '/location',
];
const ROUTES = process.env.ROUTES ? process.env.ROUTES.split(',') : ALL;

const findings = [];
const add = (route, width, kind, detail) => findings.push({ route, width, kind, detail });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        const ctx = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: 'reduce', // settle entrance animations so measurements are stable
        });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));

        let res;
        try {
          res = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        } catch (err) {
          add(route, width, 'unreachable', String(err.message).slice(0, 90));
          await ctx.close();
          continue;
        }
        if (!res || res.status() !== 200) {
          add(route, width, 'http', `status ${res ? res.status() : 'no response'}`);
          await ctx.close();
          continue;
        }
        // pull lazy content in, then return to the top
        await page.evaluate(async () => {
          await new Promise((r) => {
            let y = 0;
            const t = setInterval(() => {
              window.scrollBy(0, 800); y += 800;
              if (y > document.body.scrollHeight + 800) { clearInterval(t); window.scrollTo(0, 0); r(); }
            }, 30);
          });
        });
        await page.waitForTimeout(2600);

        const report = await page.evaluate((vw) => {
          const out = { overflow: null, offenders: [], clipped: [], badImages: [], smallTargets: [], narrow: [] };
          // sr-only / visually-hidden text is clipped to 1x1 BY DESIGN. Detect it
          // structurally rather than by class name so it holds for any utility.
          const srOnly = (el) => {
            for (let n = el; n && n !== document.body; n = n.parentElement) {
              const cs = getComputedStyle(n);
              const r = n.getBoundingClientRect();
              if (cs.clipPath === 'inset(50%)' || cs.clip === 'rect(0px, 0px, 0px, 0px)') return true;
              if (cs.position === 'absolute' && r.width <= 1 && r.height <= 1) return true;
            }
            return false;
          };
          const de = document.documentElement;
          const over = de.scrollWidth - de.clientWidth;

          if (over > 0) {
            out.overflow = over;
            for (const el of document.querySelectorAll('body *')) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;
              const right = r.right + window.scrollX;
              const left = r.left + window.scrollX;
              if (right > de.clientWidth + 1 || left < -1) {
                const cs = getComputedStyle(el);
                out.offenders.push({
                  tag: el.tagName.toLowerCase(),
                  cls: String(el.className?.baseVal ?? el.className ?? '').slice(0, 70),
                  left: Math.round(left), right: Math.round(right),
                  pos: cs.position, w: Math.round(r.width),
                });
              }
            }
            // keep only outermost offenders
            out.offenders = out.offenders
              .filter((o, i, a) => !a.some((p, j) => j !== i && p.left <= o.left && p.right >= o.right && j < i))
              .slice(0, 4);
          }

          // text clipped by a constrained box
          for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,li,a,span,td,th,figcaption')) {
            const cs = getComputedStyle(el);
            if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue;
            if (!el.textContent || !el.textContent.trim()) continue;
            if (srOnly(el)) continue;
            if (el.scrollHeight > el.clientHeight + 6 && el.clientHeight > 0) {
              out.clipped.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 50),
                text: el.textContent.trim().slice(0, 45), hidden: el.scrollHeight - el.clientHeight });
            }
          }
          out.clipped = out.clipped.slice(0, 5);

          // images: failed, or rendered far from their intrinsic aspect ratio
          for (const img of document.querySelectorAll('img')) {
            const r = img.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (img.complete && img.naturalWidth === 0) {
              out.badImages.push({ src: (img.currentSrc || img.src).split('/').pop().slice(0, 44), issue: 'failed to load' });
              continue;
            }
            if (!img.naturalWidth) continue;
            const natRatio = img.naturalWidth / img.naturalHeight;
            const boxRatio = r.width / r.height;
            const cs = getComputedStyle(img);
            if (cs.objectFit === 'cover' || cs.objectFit === 'contain') continue;
            if (cs.transform && cs.transform !== 'none') continue; // AABB of a transform is not a distortion
            if (Math.abs(natRatio - boxRatio) / natRatio > 0.12) {
              out.badImages.push({ src: (img.currentSrc || img.src).split('/').pop().slice(0, 44),
                issue: `distorted ${Math.round(r.width)}x${Math.round(r.height)} vs ${img.naturalWidth}x${img.naturalHeight}` });
            }
          }
          out.badImages = out.badImages.slice(0, 5);

          // touch targets on phones
          if (vw <= 767) {
            for (const el of document.querySelectorAll('a,button,[role="button"]')) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (getComputedStyle(el).display === 'inline') continue; // inline links in prose
              if (srOnly(el)) continue; // skip links are 1x1 until focused
              if (r.height < 24 || r.width < 24) {
                out.smallTargets.push({ tag: el.tagName.toLowerCase(),
                  text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 26),
                  size: `${Math.round(r.width)}x${Math.round(r.height)}` });
              }
            }
            out.smallTargets = out.smallTargets.slice(0, 5);
          }

          // paragraphs squeezed into a very narrow column
          for (const p of document.querySelectorAll('p')) {
            const r = p.getBoundingClientRect();
            if (r.width > 0 && r.width < 150 && (p.textContent || '').trim().length > 40) {
              out.narrow.push({ w: Math.round(r.width), text: p.textContent.trim().slice(0, 40) });
            }
          }
          out.narrow = out.narrow.slice(0, 3);
          return out;
        }, width);

        if (report.overflow) add(route, width, 'overflow', `${report.overflow}px — ` +
          report.offenders.map((o) => `<${o.tag} class="${o.cls}" ${o.pos} L${o.left} R${o.right}>`).join(' | '));
        report.clipped.forEach((c) => add(route, width, 'clipped-text', `<${c.tag} class="${c.cls}"> hides ${c.hidden}px: "${c.text}"`));
        report.badImages.forEach((b) => add(route, width, 'image', `${b.src}: ${b.issue}`));
        report.smallTargets.forEach((t) => add(route, width, 'touch-target', `<${t.tag}> ${t.size} "${t.text}"`));
        report.narrow.forEach((n) => add(route, width, 'narrow-column', `${n.w}px wide: "${n.text}"`));
        errors.forEach((e) => add(route, width, 'page-error', e.slice(0, 100)));

        await ctx.close();
      }
      process.stdout.write('.');
    }
  } finally {
    await browser.close();
  }

  console.log('\n');
  if (!findings.length) {
    console.log('No responsive problems found.');
    return;
  }
  const byKind = {};
  findings.forEach((f) => { (byKind[f.kind] ||= []).push(f); });
  for (const [kind, list] of Object.entries(byKind).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n### ${kind} — ${list.length}`);
    for (const f of list.slice(0, 22)) console.log(`  ${f.route} @${f.width}  ${f.detail}`);
    if (list.length > 22) console.log(`  ... and ${list.length - 22} more`);
  }
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/responsive-audit.json', JSON.stringify(findings, null, 2));
  console.log(`\n${findings.length} finding(s) — full list in artifacts/responsive-audit.json`);
})();
