const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({});
const source=fs.existsSync('gas/Core.gs')?fs.readFileSync('gas/Core.gs','utf8'):'';
vm.runInContext(source,context);
const valid=()=>({requestId:'test-request-12345678',kind:'creation',cat:'visual',title:'測試作品',author:'虛構教師',email:'teacher@example.com',tool:'AI',description:'測試說明',url:'https://example.com/art',consent:true});
test('投稿一律待審，不能從前端指定公開或檔案識別碼',()=>{
 assert.equal(typeof context.validateSubmission_,'function');
 const r=context.validateSubmission_({...valid(),status:'approved',fileId:'stolen'});
 assert.equal(r.status,'pending');assert.equal(r.fileId,'');
});
test('拒絕危險網址、缺少同意、沒有作品、無效分類與過長文字',()=>{
 for(const patch of [{url:'javascript:alert(1)'},{consent:false},{url:'',description:''},{cat:'unknown'},{title:'a'.repeat(121)}])
  assert.throws(()=>context.validateSubmission_({...valid(),...patch}));
});
test('互動工具必須附已部署網址',()=>{assert.throws(()=>context.validateSubmission_({...valid(),kind:'tool',url:''}));});
test('公開資料僅含核准作品與明確白名單，移除聯絡信箱及審核紀錄',()=>{
 assert.equal(typeof context.publicRecords_,'function');
 const records=[{...valid(),id:'one',status:'pending'},{...valid(),id:'two',status:'approved',reviewNote:'private',fileId:'abc123',fileName:'art.png'}];
 const result=JSON.parse(JSON.stringify(context.publicRecords_(records)));
 assert.equal(result.length,1);assert.equal(result[0].id,'two');
 for(const k of ['email','reviewNote','requestId','status','fileId','consent']) assert.equal(k in result[0],false);
 assert.match(result[0].fileUrl,/abc123/);
});
test('管理者需真實非空身分且在伺服器名單中',()=>{
 assert.equal(typeof context.isAdminIdentity_,'function');
 assert.equal(context.isAdminIdentity_('', ['owner@example.com']),false);
 assert.equal(context.isAdminIdentity_('attacker@example.com',['owner@example.com']),false);
 assert.equal(context.isAdminIdentity_('OWNER@example.com',['owner@example.com']),true);
});
test('附件拒絕 HTML、假圖片與超過大小限制，接受有效 PNG',()=>{
 assert.equal(typeof context.validateFile_,'function');
 assert.throws(()=>context.validateFile_({name:'a.html',type:'text/html',base64:'PGh0bWw+'}));
 assert.throws(()=>context.validateFile_({name:'a.png',type:'image/png',base64:'PGh0bWw+'}));
 assert.throws(()=>context.validateFile_({name:'a.png',type:'image/png',base64:'A'.repeat(7*1024*1024)}));
 assert.equal(context.validateFile_({name:'a.png',type:'image/png',base64:'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGO8FGjFwMDAxAAGABEeAWGLN1lEAAAAAElFTkSuQmCC'}).name,'a.png');
});
test('JSONP 回呼僅允許固定字元，不能插入程式碼',()=>{
 assert.equal(typeof context.validCallback_,'function');
 assert.equal(context.validCallback_('artShare_123'),true);
 for(const s of ['alert(1)//','x.y','a;alert(1)','']) assert.equal(context.validCallback_(s),false);
});
test('依真正檔頭辨識 MP4 與 WebP，不能只靠檔名或 MIME',()=>{
 const mp4=Buffer.from([0,0,0,24,102,116,121,112,109,112,52,50,0,0,0,0]).toString('base64');
 const webp=Buffer.from([82,73,70,70,24,0,0,0,87,69,66,80,86,80,56,32]).toString('base64');
 assert.equal(context.validateFile_({name:'clip.mp4',type:'video/mp4',base64:mp4}).name,'clip.mp4');
 assert.equal(context.validateFile_({name:'art.webp',type:'image/webp',base64:webp}).name,'art.webp');
});
