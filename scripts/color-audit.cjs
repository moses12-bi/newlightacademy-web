const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='http://localhost:3000';
const ROUTES=['/','/home-2','/about','/gallery','/our-teachers','/careers','/daily-schedule','/programs','/infants','/toddlers','/preschool','/kindergarten','/flex-care','/art-program','/admissions','/tuition','/how-to-apply','/faq','/schedule-a-tour','/coming-soon','/parents','/attendance-policy','/make-a-payment','/student-handbook','/school-calendar','/location','/blog'];
// retired palette, as rgb() strings
const RETIRED={'rgb(231, 76, 37)':'#e74c25 orange','rgb(22, 114, 135)':'#167287 teal','rgb(10, 48, 58)':'#0a303a deep teal','rgb(101, 114, 174)':'#6572ae periwinkle','rgb(112, 72, 177)':'#7048b1 purple','rgb(170, 129, 237)':'#aa81ed violet','rgb(65, 155, 201)':'#419bc9 sky','rgb(17, 165, 228)':'#11a5e4 sky','rgb(32, 111, 235)':'#206feb blue','rgb(56, 188, 131)':'#38bc83 green','rgb(246, 143, 41)':'#f68f29 orange','rgb(233, 93, 58)':'#e95d3a coral','rgb(255, 219, 210)':'#ffdbd2 peach','rgb(223, 248, 255)':'#dff8ff ice','rgb(254, 192, 185)':'#fec0b9 blush','rgb(213, 230, 235)':'#d5e6eb powder','rgb(185, 216, 224)':'#b9d8e0 hairline','rgb(244, 241, 234)':'#f4f1ea old cream'};
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'});
 const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const hits={}; const errs=[];
 for(const r of ROUTES){
  try{
   const resp=await p.goto(base+r,{waitUntil:'networkidle',timeout:60000});
   if(resp&&resp.status()>=400){errs.push(`${r} HTTP ${resp.status()}`);continue;}
   const found=await p.evaluate((RET)=>{
    const out={};
    for(const el of document.querySelectorAll('*')){
     const s=getComputedStyle(el);
     for(const prop of ['color','backgroundColor','borderTopColor','borderBottomColor','fill','outlineColor']){
      const v=s[prop]; if(!v)continue;
      const key=v.replace(/rgba?\(([^)]+?)(,\s*[\d.]+)?\)/,(m,g)=>'rgb('+g.split(',').map(x=>x.trim()).join(', ')+')');
      if(RET[key]){out[key]=(out[key]||0)+1;}
     }
    }
    return out;
   },RETIRED);
   for(const[k,v]of Object.entries(found)){hits[k]=hits[k]||{count:0,routes:[]};hits[k].count+=v;if(!hits[k].routes.includes(r))hits[k].routes.push(r);}
  }catch(e){errs.push(`${r}: ${e.message}`);}
 }
 await b.close();
 console.log('routes scanned: '+ROUTES.length+'  errors: '+errs.length);
 errs.forEach(e=>console.log('  ERR '+e));
 const keys=Object.keys(hits);
 if(!keys.length){console.log('\n*** NO RETIRED PALETTE COLOUR RENDERS ANYWHERE ***');}
 else{console.log('\nRETIRED COLOURS STILL RENDERING:');keys.forEach(k=>console.log(`  ${k} = ${RETIRED[k]}  x${hits[k].count}  on ${hits[k].routes.join(', ')}`));}
})();
