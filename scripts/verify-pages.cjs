/**
 * Browser verification for the 25 converted routes.
 *
 * Mirrors the style of scripts/verify-ui.cjs: Playwright drives the system Edge
 * (`channel: 'msedge'` — there is no bundled browser in this project), every
 * check is a plain `assert`, and screenshots land in artifacts/.
 *
 *   BASE_URL=http://localhost:3021 node scripts/verify-pages.cjs
 *
 * Failures are collected rather than thrown one at a time, so a single run
 * reports every defect instead of stopping at the first.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const root = path.resolve(__dirname, "..");
const artifacts = path.join(root, "artifacts");

const ALL_WIDTHS = [320, 390, 768, 1024, 1025, 1280, 1440];
const CORE_WIDTHS = [390, 1024, 1440];

/** The 25 converted routes, tagged with the archetype they belong to. */
const ROUTES = [
  { route: "/admissions", archetype: "content-hero" },
  { route: "/art-program", archetype: "program" },
  { route: "/attendance-policy", archetype: "policy" },
  { route: "/blog", archetype: "feed", sweep: true },
  { route: "/careers", archetype: "content-hero" },
  { route: "/coming-soon", archetype: "form-minimal", sweep: true },
  { route: "/daily-schedule", archetype: "schedule" },
  { route: "/faq", archetype: "accordion", sweep: true },
  { route: "/flex-care", archetype: "program" },
  { route: "/gallery", archetype: "gallery", sweep: true },
  { route: "/home-2", archetype: "landing", sweep: true },
  { route: "/how-to-apply", archetype: "form-long" },
  { route: "/infants", archetype: "program", sweep: true },
  { route: "/kindergarten", archetype: "program" },
  { route: "/location", archetype: "map-form", sweep: true },
  { route: "/make-a-payment", archetype: "form-long" },
  { route: "/our-teachers", archetype: "counters", sweep: true },
  { route: "/parents", archetype: "form-long" },
  { route: "/preschool", archetype: "program" },
  { route: "/programs", archetype: "flipboxes", sweep: true },
  { route: "/schedule-a-tour", archetype: "form-long" },
  { route: "/school-calendar", archetype: "schedule" },
  { route: "/student-handbook", archetype: "policy" },
  { route: "/toddlers", archetype: "program" },
  { route: "/tuition", archetype: "tables", sweep: true },
];

const SHOT_WIDTHS = [390, 1440];

/** `ONLY=/faq,/gallery` narrows a run while chasing one defect. */
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const wanted = (route) => ONLY.length === 0 || ONLY.includes(route);

const failures = [];
const internalLinks = new Map(); // href -> Set of routes that contain it

function record(label, error) {
  const message = error && error.message ? error.message : String(error);
  failures.push(`${label}: ${message}`);
  console.log(`FAIL ${label}: ${message}`);
}

async function check(label, fn) {
  try {
    await fn();
    console.log(`PASS ${label}`);
    return true;
  } catch (error) {
    record(label, error);
    return false;
  }
}

/** Watch a page for runtime errors and failed same-origin responses. */
function watch(page) {
  const errors = [];
  const badRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!url.startsWith(base)) return;
    /* Dev-server HMR sockets abort on navigation; they are not page assets. */
    if (/\/_next\/(webpack-hmr|static\/webpack)/.test(url)) return;
    badRequests.push(`${url} (${request.failure() ? request.failure().errorText : "failed"})`);
  });
  page.on("response", (response) => {
    const url = response.url();
    if (!url.startsWith(base)) return;
    if (response.status() >= 400) badRequests.push(`${url} -> ${response.status()}`);
  });
  return { errors, badRequests };
}

/** Walk the page so lazy images start loading, then settle every one of them. */
async function settleImages(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 120));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
  const images = await page.locator("main img, footer img").all();
  for (const image of images) {
    await image
      .evaluate(
        (node) =>
          node.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                node.addEventListener("load", resolve, { once: true });
                node.addEventListener("error", resolve, { once: true });
                setTimeout(resolve, 4000);
              }),
      )
      .catch(() => {});
  }
}

async function collectLinks(page, route) {
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && href.startsWith("/") && !href.startsWith("//")),
  );
  for (const href of hrefs) {
    const clean = href.split("#")[0] || "/";
    if (!internalLinks.has(clean)) internalLinks.set(clean, new Set());
    internalLinks.get(clean).add(route);
  }
}

/** One route at one viewport width: the checks every page must satisfy. */
async function verifyRoute(page, hooks, entry, width, shoot) {
  const { route } = entry;
  hooks.errors.length = 0;
  hooks.badRequests.length = 0;

  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);

  const heading = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll("h1")];
    return { count: h1s.length, text: h1s.map((h) => h.innerText.trim()), title: document.title.trim() };
  });
  assert.equal(heading.count, 1, `expected exactly one <h1>, found ${heading.count}`);
  assert.ok(heading.text[0] && heading.text[0].length > 0, "the <h1> is empty");
  assert.ok(heading.title.length > 0, "the <title> is empty");

  const metrics = await page.evaluate(() => ({
    inner: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    metrics.scroll <= width,
    `horizontal overflow: scrollWidth ${metrics.scroll} > ${width} (innerWidth ${metrics.inner})`,
  );

  await settleImages(page);
  const broken = await page.locator("main img, footer img").evaluateAll((images) =>
    images.filter((image) => image.complete && !image.naturalWidth).map((image) => image.currentSrc || image.src),
  );
  assert.deepEqual(broken, [], "broken images");

  /* Overflow can appear only after lazy content has landed, so re-measure. */
  const after = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(after <= width, `horizontal overflow after load: scrollWidth ${after} > ${width}`);

  if (width <= 1024) {
    /* The toggle renames itself to "Close menu" while open, so it is addressed
       by a selector that survives the rename rather than by accessible name. */
    const toggle = page.locator('header button[aria-label="Open menu"], header button[aria-label="Close menu"]');
    assert.equal(await toggle.getAttribute("aria-expanded"), "false", "the menu starts expanded");
    await toggle.click();
    await page.getByRole("dialog").waitFor({ state: "visible" });
    assert.equal(await toggle.getAttribute("aria-expanded"), "true", "menu button did not report expanded");
    assert.equal(await toggle.getAttribute("aria-label"), "Close menu", "the toggle did not relabel itself");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await toggle.getAttribute("aria-expanded"), "false", "menu button did not report collapsed");
    assert.equal(await page.evaluate(() => document.body.style.overflow), "", "body scroll lock was left behind");
  } else {
    assert.equal(
      await page.getByRole("button", { name: "Open menu", exact: true }).isVisible(),
      false,
      "the mobile menu button is still visible on desktop",
    );
  }

  await collectLinks(page, route);

  assert.deepEqual(hooks.errors, [], "runtime page errors");
  assert.deepEqual(hooks.badRequests, [], "failed local requests");

  if (shoot) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const name = route.replace(/^\//, "").replace(/\//g, "-") || "home";
    await page.screenshot({ path: path.join(artifacts, `${name}-${width}.png`), fullPage: true });
  }
}

/* --------------------------------------------------------------- form helper */

async function fillFormValidly(scope) {
  const controls = await scope.locator(".w-form__control, .w-form__check input").all();
  for (const control of controls) {
    const shape = await control.evaluate((node) => ({
      tag: node.tagName.toLowerCase(),
      type: (node.getAttribute("type") || "").toLowerCase(),
    }));
    if (shape.type === "checkbox") {
      await control.check();
      continue;
    }
    if (shape.tag === "select") {
      const value = await control.evaluate((node) => {
        const option = [...node.options].find((entry) => entry.value !== "");
        return option ? option.value : "";
      });
      if (value) await control.selectOption(value);
      continue;
    }
    if (shape.type === "email") await control.fill("parent@example.com");
    else if (shape.type === "tel") await control.fill("+1 555 010 1234");
    else if (shape.type === "number") await control.fill("20500");
    else if (shape.type === "date") await control.fill("2026-10-01");
    else if (shape.type === "time") await control.fill("10:30");
    else await control.fill("Verification test");
  }
}

const DELIVERY_VERB = /\b(sent|received|submitted|stored|processed|charged|paid|booked|delivered|subscribed)\b/i;
const NEGATION = /\b(no|not|nothing|never|none|cannot|can't|isn't|won't|doesn't|don't|without)\b/i;

/**
 * True when a sentence asserts that something actually happened.
 *
 * The demo copy deliberately says "nothing was sent, stored or charged", which
 * contains every delivery verb, so the test is per sentence and a negated
 * sentence is exactly what we want to see rather than a failure.
 */
function claimsDelivery(text) {
  return String(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .some((sentence) => DELIVERY_VERB.test(sentence) && !NEGATION.test(sentence));
}

async function verifyForm(page, route) {
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90000 });
  const form = page.locator("form.w-form, .w-form form").first();
  await form.waitFor();

  /* Empty submit must report errors and must not claim anything was sent. */
  await form.locator(".w-form__submit").click();
  await page.locator(".w-form__summary").first().waitFor({ state: "visible", timeout: 5000 });
  const errorCount = await page.locator(".w-form__error").count();
  assert.ok(errorCount > 0, "empty submit produced no per-field error messages");
  assert.equal(await page.locator(".w-form__success").count(), 0, "empty submit reached the success state");

  const invalidControls = await page.locator("[aria-invalid='true']").count();
  assert.ok(invalidControls > 0, "no control was marked aria-invalid after an empty submit");

  const bodyAfterFailure = await page.locator("main").innerText();
  assert.ok(!claimsDelivery(bodyAfterFailure), "the page claims something was sent after a failed submit");

  /* Every control must carry a real label. */
  const unlabelled = await page.locator("form .w-form__control, form .w-form__check input").evaluateAll((nodes) =>
    nodes
      .filter((node) => {
        if (node.getAttribute("aria-label")) return false;
        const id = node.getAttribute("id");
        return !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
      })
      .map((node) => node.getAttribute("name") || node.tagName),
  );
  assert.deepEqual(unlabelled, [], "form controls without a <label for>");

  await fillFormValidly(page.locator(".w-form").first());
  await page.locator(".w-form__submit").first().click();
  const success = page.locator(".w-form__success").first();
  await success.waitFor({ state: "visible", timeout: 8000 });
  const text = await success.innerText();
  assert.ok(text.trim().length > 0, "the success panel is empty");
  assert.ok(
    /nothing was sent|nothing has been sent|no tour was requested|not (yet )?connected|demo/i.test(text),
    `the success message must not imply delivery: ${text}`,
  );
  assert.ok(!claimsDelivery(text), `the success message claims delivery: ${text}`);
}

/* ------------------------------------------------------- route interactions */

async function verifyGallery(page) {
  await page.goto(`${base}/gallery`, { waitUntil: "load", timeout: 90000 });
  const thumbs = page.locator(".gallery-item");
  await thumbs.first().waitFor();
  const total = await thumbs.count();
  assert.ok(total > 1, "the gallery needs more than one photo to test navigation");

  // Click opens.
  await thumbs.nth(1).click();
  const dialog = page.locator(".gallery-lightbox");
  await dialog.waitFor({ state: "visible" });
  assert.equal(await dialog.getAttribute("aria-modal"), "true", "the lightbox is not a modal dialog");
  const first = await page.locator(".gallery-lightbox__count").innerText();

  // Next / previous.
  await page.getByRole("button", { name: "Next photo" }).click();
  const second = await page.locator(".gallery-lightbox__count").innerText();
  assert.notEqual(first, second, "Next did not change the photo");
  await page.getByRole("button", { name: "Previous photo" }).click();
  assert.equal(await page.locator(".gallery-lightbox__count").innerText(), first, "Previous did not return");

  // Arrow keys work too.
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator(".gallery-lightbox__count").innerText(), second, "ArrowRight did not advance");
  await page.keyboard.press("ArrowLeft");

  // Escape closes and focus returns to the thumbnail that opened it.
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const returned = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".gallery-item")];
    return items.indexOf(document.activeElement.closest(".gallery-item"));
  });
  assert.equal(returned, 1, "focus did not return to the thumbnail that opened the lightbox");

  // Keyboard opening: focus the thumbnail and press Enter.
  await page.locator(".gallery-item").nth(3).focus();
  await page.keyboard.press("Enter");
  await dialog.waitFor({ state: "visible" });
  assert.match(await page.locator(".gallery-lightbox__count").innerText(), /4 of/, "Enter opened the wrong photo");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const returnedTwo = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".gallery-item")];
    return items.indexOf(document.activeElement.closest(".gallery-item"));
  });
  assert.equal(returnedTwo, 3, "focus did not return after a keyboard open");
}

async function verifyAccordion(page, route) {
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90000 });
  const triggers = page.locator(".w-accordion__trigger");
  await triggers.first().waitFor();
  const count = await triggers.count();
  assert.ok(count > 0, "no accordion headers found");

  /* The component collapses on hydration; wait for that to settle. */
  await page.waitForFunction(
    () => document.querySelectorAll('.w-accordion__panel[hidden]').length > 0,
    undefined,
    { timeout: 8000 },
  );

  const trigger = triggers.first();
  const controls = await trigger.getAttribute("aria-controls");
  assert.ok(controls, "the accordion header has no aria-controls");
  const panel = page.locator(`[id="${controls}"]`);
  const before = await trigger.getAttribute("aria-expanded");

  await trigger.click();
  const afterOne = await trigger.getAttribute("aria-expanded");
  assert.notEqual(before, afterOne, "clicking the header did not change aria-expanded");
  const visibleOne = await panel.isVisible();
  assert.equal(visibleOne, afterOne === "true", "aria-expanded disagrees with the panel visibility");

  await trigger.click();
  const afterTwo = await trigger.getAttribute("aria-expanded");
  assert.equal(afterTwo, before, "the header did not toggle back");
  assert.equal(await panel.isVisible(), afterTwo === "true", "the panel did not toggle back");
}

async function verifyFaqToc(page) {
  await page.goto(`${base}/faq`, { waitUntil: "load", timeout: 90000 });
  const links = await page.locator(".faq-toc a[href^='#']").all();
  assert.ok(links.length > 0, "the FAQ table of contents has no links");
  const missing = [];
  for (const link of links) {
    const href = await link.getAttribute("href");
    const id = href.slice(1);
    const exists = await page.evaluate((value) => Boolean(document.getElementById(value)), id);
    if (!exists) missing.push(href);
  }
  assert.deepEqual(missing, [], "table-of-contents links pointing at ids that do not exist");

  const target = await links[1].getAttribute("href");
  await links[1].click();
  await page.waitForTimeout(600);
  const scrolled = await page.evaluate(() => window.scrollY);
  assert.ok(scrolled > 0, "a table-of-contents link did not move the page");
  const nearTop = await page.evaluate((id) => {
    const node = document.getElementById(id.slice(1));
    return node ? Math.abs(node.getBoundingClientRect().top) : Infinity;
  }, target);
  assert.ok(nearTop < 260, `the target heading is not near the top after the jump (${nearTop}px)`);
}

async function verifyCounters(page) {
  await page.goto(`${base}/our-teachers`, { waitUntil: "load", timeout: 90000 });
  const counters = page.locator(".w-counter__number");
  const count = await counters.count();

  /* The statistics strip is empty by design: the theme's figures described
     another school, and New Light Academy has not supplied its own. The block
     is guarded off until it does, so there is nothing to animate. Assert the
     guard rather than a count, and run the animation checks again as soon as
     real figures are added. */
  if (count === 0) {
    assert.equal(
      await page.locator(".teachers-stats").count(),
      0,
      "the statistics strip rendered with no counters in it",
    );
    console.log("SKIP counters: /our-teachers statistics are empty pending the school's own figures");
    return;
  }

  await counters.first().waitFor();
  assert.ok(count >= 2, "expected several counters on /our-teachers");
  for (let index = 0; index < count; index += 1) {
    await counters.nth(index).scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(2600);
  const values = await counters.evaluateAll((nodes) => nodes.map((node) => node.innerText.replace(/\s+/g, "")));
  const numeric = values.map((value) => Number(value.replace(/[^\d]/g, "")));
  assert.ok(
    numeric.every((value) => Number.isFinite(value) && value > 0),
    `counters did not reach a final value: ${values.join(", ")}`,
  );
  assert.ok(numeric.length >= 2, `counter final values: ${values.join(", ")}`);
}

async function verifyFlipBoxes(page) {
  await page.goto(`${base}/programs`, { waitUntil: "load", timeout: 90000 });
  const box = page.locator(".w-flipbox").first();
  await box.waitFor();
  await page.waitForFunction(() => document.querySelector('.w-flipbox[data-hydrated="true"]') !== null, undefined, {
    timeout: 8000,
  });
  await box.scrollIntoViewIfNeeded();
  assert.equal(await box.getAttribute("data-flipped"), "false", "the card starts flipped");

  /* These cards slide rather than rotate, so "revealed" means the back face has
     moved over the card and is no longer inert — not that its opacity changed. */
  const backState = () =>
    box.locator(".w-flipbox__back").evaluate((node) => {
      const card = node.closest(".w-flipbox").getBoundingClientRect();
      const back = node.getBoundingClientRect();
      const overlapX = Math.max(0, Math.min(card.right, back.right) - Math.max(card.left, back.left));
      const overlapY = Math.max(0, Math.min(card.bottom, back.bottom) - Math.max(card.top, back.top));
      const style = getComputedStyle(node);
      return {
        covered: card.width > 0 ? (overlapX * overlapY) / (card.width * card.height) : 0,
        opacity: Number(style.opacity),
        inert: node.hasAttribute("inert"),
      };
    });

  const before = await backState();
  assert.equal(before.inert, true, "the back face is reachable before focus");
  assert.ok(
    before.covered < 0.5 || before.opacity < 0.5,
    `the back face already covers the card before focus (${Math.round(before.covered * 100)}% at opacity ${before.opacity})`,
  );

  await box.focus();
  await page.waitForTimeout(900);
  assert.equal(await box.getAttribute("data-flipped"), "true", "keyboard focus did not flip the card");
  const after = await backState();
  assert.equal(after.inert, false, "the revealed back face is still inert");
  assert.ok(
    after.covered > 0.8 && after.opacity > 0.8,
    `the back face is not showing after focus (${Math.round(after.covered * 100)}% at opacity ${after.opacity})`,
  );
  const backText = (await box.locator(".w-flipbox__back").innerText()).trim();
  assert.ok(backText.length > 0, "the revealed back face has no copy");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  assert.equal(await box.getAttribute("data-flipped"), "false", "Escape did not flip the card back");
}

async function verifyBlogSearch(page) {
  await page.goto(`${base}/blog`, { waitUntil: "load", timeout: 90000 });
  const cards = page.locator(".blog-cards > li");
  const total = await cards.count();

  /* The post list is empty by design: the theme's articles belonged to another
     school and were removed rather than rewritten as invented school news. The
     search box still has to render and the empty state still has to show;
     filtering cannot be exercised until the school publishes real posts. */
  if (total === 0) {
    assert.ok(await page.locator(".blog-search__input").isVisible(), "the blog search box is missing");
    await page.locator(".blog-search__input").fill("anything");
    await page.waitForTimeout(300);
    assert.equal(await cards.count(), 0, "cards appeared from an empty post list");
    console.log("SKIP blog filtering: no posts published yet — search box and empty state verified");
    return;
  }

  await cards.first().waitFor();
  assert.ok(total > 1, "the blog needs more than one card to test filtering");

  const firstTitle = (await page.locator(".blog-card__title").first().innerText()).trim();
  const word = firstTitle.split(/\s+/).find((piece) => piece.length > 4) || firstTitle;

  const input = page.locator(".blog-search__input");
  await input.fill(word);
  await page.waitForTimeout(300);
  const filtered = await cards.count();
  assert.ok(filtered >= 1, `searching for "${word}" hid every card`);
  assert.ok(filtered <= total, "the filter added cards");

  await input.fill("zzzznotapost");
  await page.waitForTimeout(300);
  assert.equal(await cards.count(), 0, "a nonsense query still matched cards");
  assert.ok(await page.locator(".blog-empty").isVisible(), "no empty-state message for a query with no matches");

  await input.fill("");
  await page.waitForTimeout(300);
  assert.equal(await cards.count(), total, "clearing the search did not restore every card");
}

/* ------------------------------------------------------------------- passes */

async function verifyReducedMotion(browser, routes) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    for (const route of routes) {
      if (!wanted(route)) continue;
      await check(`reduced motion ${route}`, async () => {
        await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90000 });
        await page.waitForTimeout(500);
        const hidden = await page.locator("[data-reveal]").evaluateAll((nodes) =>
          nodes
            .filter((node) => {
              const style = getComputedStyle(node);
              return Number(style.opacity) < 0.99 || style.visibility === "hidden";
            })
            .map((node) => node.className || node.tagName),
        );
        assert.deepEqual(hidden, [], "elements left invisible under prefers-reduced-motion");
        const pending = await page.locator("[data-reveal]:not(.motion-visible)").count();
        assert.equal(pending, 0, "reveal elements never reached motion-visible");
      });
    }
  } finally {
    await context.close();
  }
}

async function verifyNoJs(browser, routes) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const route of routes) {
      if (!wanted(route)) continue;
      await check(`no-JS ${route}`, async () => {
        await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 90000 });
        const shape = await page.evaluate(() => {
          const main = document.querySelector("main") || document.body;
          return {
            h1: (document.querySelector("h1") || { innerText: "" }).innerText.trim(),
            title: document.title.trim(),
            body: main.innerText.replace(/\s+/g, " ").trim().length,
            images: main.querySelectorAll("img").length,
            links: main.querySelectorAll("a[href]").length,
          };
        });
        assert.ok(shape.h1.length > 0, "no visible <h1> without JavaScript");
        assert.ok(shape.title.length > 0, "no <title> without JavaScript");
        /* /gallery is a photo grid whose only copy is its heading, so a picture
           page counts as complete when its photos and their links are there. */
        assert.ok(
          shape.body > 600 || (shape.images >= 8 && shape.links >= 8),
          `the page is empty without JavaScript (${shape.body} chars, ${shape.images} images)`,
        );
      });
    }
  } finally {
    await context.close();
  }
}

async function verifyInternalLinks() {
  const targets = [...internalLinks.keys()].sort();
  const dead = [];
  for (const href of targets) {
    if (/\.(png|jpe?g|svg|webp|gif|ico|pdf)$/i.test(href)) continue;
    let status = 0;
    try {
      const response = await fetch(`${base}${href}`, { redirect: "follow" });
      status = response.status;
    } catch (error) {
      status = `network error: ${error.message}`;
    }
    if (status !== 200) dead.push(`${href} -> ${status} (linked from ${[...internalLinks.get(href)].join(", ")})`);
  }
  assert.deepEqual(dead, [], "internal links that do not resolve to a 200");
  console.log(`PASS internal links: ${targets.length} distinct targets resolve`);
}

/* --------------------------------------------------------------------- main */

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const started = Date.now();

  try {
    for (const width of ALL_WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const hooks = watch(page);
      const forWidth = ROUTES.filter((entry) => wanted(entry.route) && (entry.sweep || CORE_WIDTHS.includes(width)));
      for (const entry of forWidth) {
        await check(`${entry.route} @ ${width}`, () =>
          verifyRoute(page, hooks, entry, width, SHOT_WIDTHS.includes(width)),
        );
      }
      await context.close();
      console.log(`--- finished ${width}px (${forWidth.length} routes)`);
    }

    /* Interaction checks run at a desktop width with motion enabled, so the
       counter and the flip boxes behave exactly as a visitor sees them. */
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const hooks = watch(page);

    await check("/gallery lightbox", () => verifyGallery(page));
    await check("/faq accordion", () => verifyAccordion(page, "/faq"));
    await check("/faq table of contents", () => verifyFaqToc(page));
    await check("/location accordion", () => verifyAccordion(page, "/location"));
    await check("/our-teachers counter", () => verifyCounters(page));
    await check("/programs flip boxes", () => verifyFlipBoxes(page));
    await check("/blog search", () => verifyBlogSearch(page));

    for (const route of [
      "/how-to-apply",
      "/schedule-a-tour",
      "/coming-soon",
      "/make-a-payment",
      "/parents",
      "/home-2",
      "/location",
    ]) {
      if (wanted(route)) await check(`${route} form`, () => verifyForm(page, route));
    }

    if (hooks.errors.length > 0) record("interaction pass", new Error(`runtime errors: ${hooks.errors.join(" | ")}`));
    await context.close();

    await verifyReducedMotion(browser, ["/programs", "/our-teachers", "/home-2", "/tuition"]);
    await verifyNoJs(browser, ["/faq", "/tuition", "/student-handbook", "/programs", "/gallery", "/admissions"]);
    await check("internal links", () => verifyInternalLinks());
  } finally {
    await browser.close();
  }

  const report = {
    base,
    seconds: Math.round((Date.now() - started) / 1000),
    routes: ROUTES.length,
    fullSweep: ROUTES.filter((entry) => entry.sweep).map((entry) => entry.route),
    widthsFullSweep: ALL_WIDTHS,
    widthsEveryRoute: CORE_WIDTHS,
    internalLinkTargets: [...internalLinks.keys()].sort(),
    failures,
  };
  fs.writeFileSync(path.join(artifacts, "pages-verification.json"), JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.error(`\n${failures.length} failing check(s):`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
  }
  console.log(`\nAll checks passed for ${ROUTES.length} routes in ${report.seconds}s.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
