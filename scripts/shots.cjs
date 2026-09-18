const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://localhost:3000';
const out=process.env.SHOT_DIR||'artifacts/shots';
const ROUTES=['/','/about','/gallery','/our-teachers','/careers','/daily-schedule','/programs','/infants','/toddlers','/preschool','/kindergarten','/flex-care','/art-program','/admissions','/tuition','/how-to-apply','/faq','/schedule-a-tour','/coming-soon','/parents','/make-a-payment','/student-handbook','/school-calendar','/location','/blog',process.env.BLOG_SLUG||'/blog/x'];
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 fs.mkdirSync(out,{recursive:true});
 const fails=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>fails.push(`${width} pageerror: ${e.message}`));
  for(const r of ROUTES){
   const name=r==='/'?'home':r.replace(/^\//,'').replace(/\//g,'_');
   try{
    const resp=await page.goto(base+r,{waitUntil:'networkidle',timeout:60000});
    if(resp&&resp.status()>=400)fails.push(`${r} -> HTTP ${resp.status()}`);
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}scrollTo(0,0);});
    await page.waitForTimeout(400);
    await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});
   }catch(e){fails.push(`${r}@${width}: ${e.message}`);}
  }
  await page.close();
 }
 await browser.close();
 fs.writeFileSync(`${out}/_fails.txt`,fails.join('\n'));
 console.log(fails.length?('ISSUES:\n'+fails.join('\n')):'all routes captured clean');
})();
