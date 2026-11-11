// Run with npm start in another terminal; Playwright and Chromium are test-only prerequisites.
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.TEST_SCREENSHOT_DIR || '/workspace/scratch/ciclodias-temas';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--disable-gpu']});
const errors=[];
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
async function loaded(page) {
  check(await page.locator('main h1').isVisible(),'page rendered');
  await page.evaluate(async()=>{
    document.querySelectorAll('img').forEach(image=>image.loading='eager');
    await document.fonts.ready;
    await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));
  });
  check(await page.evaluate(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0&&!image.dataset.fallback)),'all photographs loaded');
}
async function contrasts(page) {
  const results=await page.evaluate(()=>{
    function rgb(s){return (s.match(/[\d.]+/g)||[]).map(Number);}
    function luminance(c){const s=c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*s[0]+.7152*s[1]+.0722*s[2];}
    return ['body','.examples-note','.product-category','.product-reference','.product-price','.add-button','.demo-tag','.theme-toggle','.footer-bottom'].map(selector=>{
      const e=document.querySelector(selector);if(!e)return null;
      const fg=rgb(getComputedStyle(e).color);let bg,ancestor=e;
      while(ancestor){const color=rgb(getComputedStyle(ancestor).backgroundColor);if(color.length>=3&&(color.length<4||color[3]===1)){bg=color;break;}ancestor=ancestor.parentElement;}
      if(!bg)return null;
      const a=luminance(fg),b=luminance(bg);return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    }).filter(Boolean);
  });
  for(const result of results)check(result.ratio>=4.5,`${result.selector} contrast ${result.ratio.toFixed(2)}`);
}
try {
 await mkdir(output,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await loaded(page);
 check(await page.locator('html').getAttribute('data-theme')==='light','default follows light system');
 check(await page.locator('.theme-toggle').getAttribute('aria-label')==='Ativar tema escuro','accessible toggle label');
 const cardPhotos=await page.locator('.home-products .product-image img').evaluateAll(images=>images.map(image=>image.src));
 const categoryPhotos=await page.locator('.photo-categories img').evaluateAll(images=>images.map(image=>image.src));
 check(cardPhotos.length===4&&new Set(cardPhotos).size===4,'four distinct item photos');
 check(categoryPhotos.length===4&&new Set(categoryPhotos).size===4,'four distinct category photos');
 check(new Set([...cardPhotos,...categoryPhotos]).size===8,'no repeated photo across home cards');
 check(await page.locator('.product-image img').evaluateAll(images=>images.every(image=>getComputedStyle(image).objectFit==='contain')),'product photos remain whole');
 await contrasts(page);
 await page.screenshot({path:output+'/inicio-claro-desktop.png',fullPage:true});
 await page.locator('.theme-toggle').click();
 check(await page.locator('html').getAttribute('data-theme')==='dark','dark enabled');
 check(await page.evaluate(()=>localStorage.getItem('ciclodias-theme'))==='dark','preference saved');
 check(await page.locator('.theme-toggle').getAttribute('aria-pressed')==='true','toggle state announced');
 await contrasts(page);
 await page.reload();
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await loaded(page);
 await page.screenshot({path:output+'/inicio-escuro-desktop.png',fullPage:true});
 await page.reload();await loaded(page);
 check(await page.locator('html').getAttribute('data-theme')==='dark','dark survives reload');
 const returning=await context.newPage();await returning.goto(base);await loaded(returning);
 check(await returning.locator('html').getAttribute('data-theme')==='dark','returning visit preserves preference');await returning.close();
 for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.theme-toggle').click();
   for(const width of [1440,390,320]){
     await page.setViewportSize({width,height:844});
     for(const route of ['/','/produtos','/produtos?modo=demo','/produto/demo-capacete','/sobre','/entregas','/contato','/carrinho','/tabelas']){
       await page.goto(base+'/#'+route);await loaded(page);
       check(await page.locator('html').getAttribute('data-theme')===theme,'theme preserved through navigation');
       check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no overflow ${theme} ${width} ${route}`);
       if(route==='/'&&width===390)await page.screenshot({path:`${output}/inicio-${theme==='dark'?'escuro':'claro'}-celular.png`,fullPage:true});
     }
   }
 }
 await context.close();
 const system=await browser.newContext({colorScheme:'dark'});const systemPage=await system.newPage();
 await systemPage.goto(base);await loaded(systemPage);
 check(await systemPage.locator('html').getAttribute('data-theme')==='dark','default follows dark system');
 await systemPage.emulateMedia({colorScheme:'light'});
 await systemPage.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 check(await systemPage.locator('html').getAttribute('data-theme')==='light','system changes followed before manual choice');
 await systemPage.locator('.theme-toggle').click();await systemPage.emulateMedia({colorScheme:'light'});
 check(await systemPage.locator('html').getAttribute('data-theme')==='dark','manual choice wins over system');
 await system.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('denied')}});});
 const blockedPage=await blocked.newPage();await blockedPage.goto(base);await loaded(blockedPage);await blockedPage.locator('.theme-toggle').click();
 check(await blockedPage.locator('html').getAttribute('data-theme')==='dark','theme works with storage blocked');await blocked.close();
 check(errors.length===0,'no JavaScript errors');
 console.log(`PASS: ${checks} theme/image checks, both themes, desktop/mobile, persistence, contrast, unique photos and contain.`);
} finally {await browser.close();}
