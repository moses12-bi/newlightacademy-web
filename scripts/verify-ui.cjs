const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://localhost:3000';
(async () => {
 const browser = await chromium.launch({headless:true, channel: 'msedge'});
 const errors = [];
 const results = [];
 fs.mkdirSync('artifacts', {recursive:true});
 try {
  for (const width of [320,390,768,1024,1025,1280,1440]) {
   const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   page.on('pageerror', e => errors.push(e.message));
   await page.goto(`${base}/about`);
   await page.locator('.hero-art.motion-visible').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').innerText(), 'About');
   const dimensions = await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(dimensions.scroll<=width, `Horizontal overflow at ${width}: ${dimensions.scroll}`);
   assert.equal(await page.locator('header a[aria-current="page"]').innerText(),'About');
   if (width <= 1024) {
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.getByRole('button',{name:'Show About submenu',exact:true}).click();
    assert.ok(await page.getByRole('dialog').getByRole('link',{name:'About Us',exact:true}).isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button',{name:'Open menu',exact:true}).getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
   } else {
    assert.equal(await page.getByRole('button',{name:'Open menu',exact:true}).isVisible(),false);
    const about=page.locator('header nav').getByRole('link',{name:'About',exact:true});
    await about.hover();
    assert.ok(await page.locator('header nav').getByRole('link',{name:'About Us',exact:true}).isVisible());
    await page.mouse.move(width-1,800);
   }
   if(width<768) {
    const order=await page.locator('.graduates-section').evaluate(e=>({photo:e.querySelector('.section-photo').getBoundingClientRect().top,card:e.querySelector('.section-card').getBoundingClientRect().top}));
    assert.ok(order.photo<order.card,'Mobile photo must precede card');
   }
   for (const img of await page.locator('main img, footer img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(i=>i.complete ? Promise.resolve() : new Promise(resolve=>{ i.addEventListener('load',resolve,{once:true}); i.addEventListener('error',resolve,{once:true}); }));
   }
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete && !i.naturalWidth).map(i=>i.src));
   assert.deepEqual(broken,[],`Broken images at ${width}`);
   await page.evaluate(()=>window.scrollTo(0,0));
   if([390,768,1440].includes(width)) await page.screenshot({path:`artifacts/about-${width}.png`,fullPage:true});
   results.push({width,overflow:false,menu:'passed',images:'passed'});
   console.log(`PASS layout, menu, images: ${width}px`);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/about`);
  await page.locator('.hero-art.motion-visible').waitFor();
  await page.waitForTimeout(1500);
  const before=await page.locator('.graduates-section [data-motion="photo"]').evaluate(e=>getComputedStyle(e).transform);
  await page.evaluate(()=>window.scrollTo(0,1400));
  await page.waitForTimeout(200);
  const after=await page.locator('.graduates-section [data-motion="photo"]').evaluate(e=>getComputedStyle(e).transform);
  assert.notEqual(before,after,'Photo must move on scroll');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.mouse.move(100,100);
  await page.waitForTimeout(150);
  const tiltBefore=await page.locator('[data-motion="tilt"]').evaluate(e=>e.style.transform);
  await page.mouse.move(1300,700);
  await page.waitForTimeout(150);
  assert.notEqual(tiltBefore,await page.locator('[data-motion="tilt"]').evaluate(e=>e.style.transform));
  assert.ok(await page.locator('[data-reveal="rotateInUpRight"]').evaluate(e=>e.classList.contains('motion-visible')));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(150);
  assert.equal(await page.locator('[data-motion="tilt"]').evaluate(e=>getComputedStyle(e).transform),'none');
  assert.equal(await page.locator('.graduates-section [data-motion="photo"]').evaluate(e=>getComputedStyle(e).transform),'none');
  await page.setViewportSize({width:1024,height:900});
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.setViewportSize({width:1025,height:900});
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await page.route('https://www.youtube.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<html><body>Player test</body></html>'}));
  await page.getByRole('button',{name:'Play video: Introductory video'}).click();
  assert.match(await page.locator('iframe[title="Introductory video"]').getAttribute('src'),/67ouh2PgUfk\?autoplay=1/);
  await page.goto(`${base}/`);
  await page.locator('header nav').getByRole('link',{name:'About',exact:true}).first().click();
  await page.locator('.hero-art.motion-visible').waitFor();
  assert.equal(await page.locator('h1').innerText(),'About');
  assert.deepEqual(errors,[]);
  console.log('PASS scroll motion, pointer tilt, reduced motion, breakpoint resize, video activation, client navigation');
  fs.writeFileSync('artifacts/ui-verification.json',JSON.stringify({results,motion:'passed',reducedMotion:'passed',videoActivation:'passed (external player mocked)',errors},null,2));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
