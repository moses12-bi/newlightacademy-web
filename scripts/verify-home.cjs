const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.BASE_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  try {
    for (const width of [320, 390, 768, 1024, 1025, 1440]) {
      const errors = [];
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/`);
      await page.locator(".home-one-title strong").waitFor();
      assert.equal(await page.locator(".home-one-title strong").innerText(), "Happiness");
      assert.ok(await page.getByRole("link", { name: "Explore Our School" }).isVisible());
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter((image) => image.complete && !image.naturalWidth).map((image) => image.src),
      }));
      assert.ok(metrics.scrollWidth <= metrics.width, `Horizontal overflow at ${width}px`);
      assert.deepEqual(metrics.brokenImages, []);
      if (width <= 1024) {
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
        await page.getByRole("dialog").waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
      }
      const safetyTab = page.getByRole("tab", { name: /Christian Values/ });
      await safetyTab.scrollIntoViewIfNeeded();
      await safetyTab.click();
      assert.equal(await safetyTab.getAttribute("aria-selected"), "true");
      assert.match(await page.locator("#home-feature-panel img").getAttribute("src"), /h-15/);
      assert.deepEqual(errors, []);
      console.log(`PASS Home 1: ${width}px`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
