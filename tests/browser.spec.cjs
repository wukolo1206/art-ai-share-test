const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
function template(name){return fs.readFileSync(path.join(root,'gas',name+'.html'),'utf8').replace(/<\?!= include_\('([^']+)'\); \?>/g,(_,part)=>fs.readFileSync(path.join(root,'gas',part+'.html'),'utf8')).replace('<\?= category ?>','visual').replace('<\?= kind ?>','creation');}
function mockRun(admin){
 return '<script>window.testCalls=[];window.google={script:{run:new Proxy({},{get:function(_,key){if(key==="withSuccessHandler")return function(f){window.testSuccess=f;return google.script.run;};if(key==="withFailureHandler")return function(f){window.testFailure=f;return google.script.run;};return function(){var args=Array.from(arguments);testCalls.push({name:key,args:args});setTimeout(function(){if(window.failNext){window.failNext=false;return testFailure({message:"測試斷線，請重試"});}if(key==="adminList")return testSuccess({email:"owner@example.com",works:window.mockWorks});if(key==="submitWork")return testSuccess({ok:true,id:"test-receipt"});if(key==="adminReview"){window.mockWorks[0].status=args[1];return testSuccess({ok:true,message:"狀態已更新"});}testSuccess({ok:true,message:"已建立"});},0);};}})}};window.mockWorks='+JSON.stringify(admin?[{id:'test',title:'<測試作品>',author:'虛構教師',email:'private@example.com',kind:'creation',cat:'visual',status:'pending',createdAt:'2026-10-20',updatedAt:'2026-10-20',description:'測試說明',url:'https://example.com',reviewNote:''}]:[])+';</script>';
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/__submit'||url.pathname==='/__admin'){
  const admin=url.pathname==='/__admin';res.setHeader('Content-Type','text/html; charset=utf-8');res.end(template(admin?'Admin':'Submit').replace('</head>',mockRun(admin)+'</head>'));return;
 }
 const file=path.join(root,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end();}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const checks=[],page=await browser.newPage({viewport:{width:1365,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://script.google.com/**',async route=>{
  const url=new URL(route.request().url());
  if(url.searchParams.get('action')==='public')return route.fulfill({contentType:'text/javascript',body:url.searchParams.get('callback')+'('+JSON.stringify({ok:true,works:[{id:'visible',kind:'creation',cat:'visual',title:'核准的測試創作',author:'測試教師',description:'公開作品說明',tool:'AI',url:'https://example.com'},{id:'tool-with-file',kind:'tool',cat:'visual',title:'附教材的教學工具',author:'測試教師',description:'工具附說明教材',url:'https://example.com/tool',fileUrl:'https://drive.google.com/file/d/test-file/view',fileName:'使用說明.pdf'}]})+');'});
  return route.fulfill({contentType:'text/html; charset=utf-8',body:template('Submit').replace('data-category="visual"','data-category="'+(url.searchParams.get('cat')||'visual')+'"').replace('</head>',mockRun(false)+'</head>')});
 });
  await page.goto(base);await page.getByRole('status').filter({hasText:'目前有 2 件'}).waitFor();checks.push('公開作品載入');
 await page.locator('nav').getByRole('link',{name:'視覺藝術',exact:true}).click();await page.getByRole('heading',{name:'核准的測試創作'}).waitFor();
 assert.equal(await page.locator('#visual iframe').count(),1);assert.equal(await page.locator('#music iframe').count(),0);checks.push('分類作品與延遲載入表單');
  await page.frameLocator('#visual iframe').getByRole('heading',{name:'分享你的作品'}).waitFor();await page.screenshot({path:'.local/site-desktop.png',fullPage:false});
  await page.locator('nav').getByRole('link',{name:'互動工具成果',exact:true}).click();await page.getByRole('link',{name:'查看附件：使用說明.pdf',exact:true}).waitFor({timeout:3000});checks.push('工具投稿附件有公開入口');await page.getByText('分享一項教學互動工具',{exact:true}).click();await page.locator('#tool-submission iframe').waitFor({state:'attached'});checks.push('互動工具投稿入口');
  await page.setViewportSize({width:390,height:844});await page.locator('nav').getByRole('link',{name:'音樂藝術',exact:true}).click();await page.frameLocator('#music iframe').getByRole('heading',{name:'分享你的作品'}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'.local/site-mobile.png'});checks.push('手機無水平溢出');
 await page.goto(base+'/__submit');await page.locator('#title').fill('虛構測試作品');await page.locator('#author').fill('測試教師');await page.locator('#email').fill('teacher@example.com');await page.locator('#url').fill('https://example.com');await page.locator('#description').fill('測試作品說明');await page.locator('#consent').check();
 await page.evaluate(()=>{window.failNext=true;});await page.getByRole('button',{name:'送出投稿',exact:true}).click();await page.getByRole('status').filter({hasText:'測試斷線'}).waitFor();assert.equal(await page.locator('#title').inputValue(),'虛構測試作品');checks.push('失敗保留內容可重試');
 await page.getByRole('button',{name:'送出投稿',exact:true}).click();await page.getByRole('heading',{name:'投稿已收到'}).waitFor();assert.equal(await page.locator('#submission').isVisible(),false);assert.match(await page.locator('#receipt-id').textContent(),/test-receipt/);checks.push('送出成功顯示收據並清除表單');
 const requests=await page.evaluate(()=>testCalls.filter(c=>c.name==='submitWork'));assert.equal(requests[0].args[0].requestId,requests[1].args[0].requestId);checks.push('重試沿用同一投稿識別碼');await page.screenshot({path:'.local/submit-receipt.png'});
  await page.setViewportSize({width:1365,height:900});await page.goto(base+'/__admin');await page.getByRole('heading',{name:'<測試作品>',exact:true}).waitFor();assert.equal(await page.locator('.card h2 script,.card h2 img').count(),0);checks.push('後台安全顯示作品文字');
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'核准公開',exact:true}).click();await page.getByText('這個狀態沒有投稿。',{exact:true}).waitFor();await page.locator('#filter').selectOption('approved');await page.getByRole('heading',{name:'<測試作品>',exact:true}).waitFor();checks.push('網頁審核及狀態篩選');await page.screenshot({path:'.local/admin-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);checks.push('無前端 JavaScript 錯誤');
 fs.writeFileSync('.local/browser-evidence.json',JSON.stringify({environment:'local simulated GAS responses; NOT live cloud acceptance',checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,checks},null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
