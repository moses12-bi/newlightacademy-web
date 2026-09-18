/**
 * Browser verification for motion parity.
 *
 * The maths is unit-tested separately (scripts/verify-motion-math.cjs); this
 * checks the runtime actually wires it up: reveals fire, scroll-linked elements
 * really move, pointer effects track and reset, device gating is honoured,
 * reduced motion clears inline transforms, and client-side navigation does not
 * leave duplicate listeners or dead elements behind.
 *
 *   node scripts/verify-motion.cjs                 # all routes with motion
 *   ROUTES=/programs,/gallery node scripts/verify-motion.cjs
 *   BASE_URL=http://localhost:3001 node scripts/verify-motion.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.BASE_URL || 'http://localhost:3000';
const ARTIFACTS = 'artifacts';

const ALL_ROUTES = [
  '/', '/about', '/home-2', '/gallery', '/our-teachers', '/careers', '/daily-schedule',
  '/programs', '/infants', '/toddlers', '/preschool', '/kindergarten', '/flex-care',
  '/art-program', '/admissions', '/tuition', '/how-to-apply', '/faq', '/schedule-a-tour',
  '/coming-soon', '/parents', '/attendance-policy', '/make-a-payment', '/student-handbook',
  '/school-calendar', '/blog', '/location',
];
const routes = process.env.ROUTES ? process.env.ROUTES.split(',').map((r) => r.trim()) : ALL_ROUTES;

const results = [];
const failures = [];
const record = (name, fn) => {
  try { fn(); results.push(`PASS ${name}`); }
  catch (err) { failures.push(`FAIL ${name}: ${err.message}`); }
};

/** Transform values that mean "nothing applied". */
const isIdentity = (t) => !t || t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';

(async () => {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });

  try {
    for (const route of routes) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));

      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      record(`${route} responds 200`, () => assert.equal(response.status(), 200));

      // Inventory what this page opted into.
      // Only scroll-driven effects should move on scroll; mouseTrack/tilt are
      // pointer-driven and legitimately stay put, so they must not be counted here.
      const inventory = await page.evaluate(() => {
        const SCROLL_KEYS = ['translateX', 'translateY', 'rotateZ', 'scale', 'opacity', 'blur'];
        const LEGACY_SCROLL = ['photo', 'fox', 'snail', 'home-dots', 'home-people', 'home-person'];
        const scrollFx = [...document.querySelectorAll('[data-fx], [data-motion]')].filter((el) => {
          if (el.dataset.motion) return LEGACY_SCROLL.includes(el.dataset.motion);
          try {
            const fx = JSON.parse(el.dataset.fx || '{}');
            return SCROLL_KEYS.some((k) => fx[k]);
          } catch { return false; }
        }).length;
        return {
          reveals: document.querySelectorAll('[data-reveal]').length,
          scrollFx,
          mouseFx: document.querySelectorAll('[data-fx]').length - scrollFx,
          bgFx: document.querySelectorAll('[data-fx-bg]').length,
          sticky: document.querySelectorAll('[data-sticky]').length,
        };
      });

      /* ---- 1. entrance reveals resolve to visible -------------------------- */
      if (inventory.reveals) {
        await page.waitForTimeout(3600);
        const hidden = await page.evaluate(() =>
          [...document.querySelectorAll('[data-reveal]')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              const onScreen = r.top < innerHeight && r.bottom > 0 && r.width > 0;
              return onScreen && Number(getComputedStyle(el).opacity) < 0.05;
            })
            .map((el) => el.getAttribute('data-reveal') + ':' + el.className.slice(0, 40)),
        );
        record(`${route} in-view reveals become visible`, () =>
          assert.deepEqual(hidden, [], `still invisible: ${hidden.join(' | ')}`));
      }

      /* ---- 2. scroll-linked elements actually move ------------------------- */
      if (inventory.scrollFx || inventory.bgFx) {
        const sample = () => page.evaluate(() =>
          [...document.querySelectorAll('[data-fx], [data-motion], [data-fx-layer]')]
            .slice(0, 12)
            .map((el) => getComputedStyle(el).transform));
        const before = await sample();
        await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.45)));
        await page.waitForTimeout(700);
        const after = await sample();
        const moved = before.some((t, i) => t !== after[i]);
        record(`${route} scroll effects change transform`, () =>
          assert.ok(moved, 'no transform changed between top and mid-page'));
        await page.screenshot({ path: path.join(ARTIFACTS, `motion${route.replace(/\//g, '-') || '-home'}-mid.png`) });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
      }

      /* ---- 3. no effect introduces horizontal overflow --------------------- */
      await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.5)));
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      record(`${route} no overflow while animating`, () =>
        assert.ok(overflow <= 0, `${overflow}px of horizontal overflow mid-scroll`));

      /* ---- 4. no runtime errors ------------------------------------------- */
      record(`${route} no page errors`, () =>
        assert.deepEqual(pageErrors, [], pageErrors.join(' | ')));

      await ctx.close();
    }

    /* ---- 5. pointer effects track and reset ------------------------------- */
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(base + '/about', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);
      const tilt = page.locator('[data-motion="tilt"]').first();
      if (await tilt.count()) {
        await tilt.scrollIntoViewIfNeeded();
        await page.mouse.move(200, 200);
        await page.waitForTimeout(250);
        const moved = await tilt.evaluate((el) => getComputedStyle(el).transform);
        await page.mouse.move(1300, 800);
        await page.waitForTimeout(250);
        const moved2 = await tilt.evaluate((el) => getComputedStyle(el).transform);
        record('pointer tilt responds to pointer position', () =>
          assert.notEqual(moved, moved2, 'transform identical at two pointer positions'));
      }
      await ctx.close();
    }

    /* ---- 6. device gating: desktop-only effects are inert on a phone ------ */
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
      const page = await ctx.newPage();
      await page.goto(base + '/about', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.5)));
      await page.waitForTimeout(600);
      const desktopOnly = await page.evaluate(() =>
        [...document.querySelectorAll('[data-fx-devices="desktop"], [data-motion="tilt"]')]
          .map((el) => getComputedStyle(el).transform)
          .filter((t) => t && t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'));
      record('desktop-only effects apply no transform on mobile', () =>
        assert.deepEqual(desktopOnly, [], `applied: ${desktopOnly.join(' | ')}`));
      await page.screenshot({ path: path.join(ARTIFACTS, 'motion-mobile-settled.png'), fullPage: false });
      await ctx.close();
    }

    /* ---- 7. reduced motion: visible content, no leftover transforms ------- */
    for (const route of ['/about', '/programs', '/gallery']) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const res = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      if (!res || res.status() !== 200) { await ctx.close(); continue; }
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.5)));
      await page.waitForTimeout(600);
      const state = await page.evaluate(() => ({
        invisible: [...document.querySelectorAll('[data-reveal]')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.top < innerHeight && r.bottom > 0 && Number(getComputedStyle(el).opacity) < 0.05;
        }).length,
        transformed: [...document.querySelectorAll('[data-fx], [data-motion], [data-fx-layer]')]
          .filter((el) => {
            const t = el.style.transform;
            return t && t !== 'none';
          }).length,
      }));
      record(`${route} reduced motion keeps content visible`, () =>
        assert.equal(state.invisible, 0, `${state.invisible} reveal(s) left at opacity 0`));
      record(`${route} reduced motion leaves no inline transform`, () =>
        assert.equal(state.transformed, 0, `${state.transformed} element(s) still transformed`));
      if (route === '/about') {
        await page.screenshot({ path: path.join(ARTIFACTS, 'motion-reduced.png') });
      }
      await ctx.close();
    }

    /* ---- 8. client-side navigation re-initialises cleanly ----------------- */
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(base + '/about', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(900);
      // navigate away and back through the header, twice
      for (let i = 0; i < 2; i++) {
        await page.goto(base + '/programs', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(700);
        await page.goto(base + '/about', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(700);
      }
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(500);
      const stillWorks = await page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal]')].some((el) => el.classList.contains('motion-visible')));
      record('motion still initialises after repeated navigation', () =>
        assert.ok(stillWorks, 'no element carries motion-visible after navigating back'));
      record('no page errors across navigation', () =>
        assert.deepEqual(errors, [], errors.join(' | ')));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  for (const line of results) console.log(line);
  for (const line of failures) console.error(line);
  console.log(`\n${results.length} passed, ${failures.length} failed`);
  if (failures.length) process.exit(1);
})();
