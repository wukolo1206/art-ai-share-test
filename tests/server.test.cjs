const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
function backend(identity=''){
 const rows=[['id','createdAt','status','category','title','author','record','reviewNote','updatedAt']], sharing=[];
 const sheet={getLastRow:()=>rows.length,appendRow:r=>rows.push(r),getRange:(row,col,n=1,width=1)=>({getValues:()=>rows.slice(row-1,row-1+n).map(r=>r.slice(col-1,col-1+width).map(v=>typeof v==='string'?v.replace(/^'(?=[=+@-])/,''):v)),setValue:v=>{rows[row-1][col-1]=v;},setValues:v=>{v.forEach((r,i)=>r.forEach((x,j)=>rows[row-1+i][col-1+j]=x));}})};
 const c=vm.createContext({ADMIN_EMAILS:['owner@example.com'],Session:{getActiveUser:()=>({getEmail:()=>identity})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'new-test-resource'})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},Utilities:{getUuid:()=> 'server-generated-id'},DriveApp:{Access:{ANYONE_WITH_LINK:'public',PRIVATE:'private'},Permission:{VIEW:'view',NONE:'none'},getFileById:()=>({setSharing:(access,permission)=>sharing.push([access,permission])})}});
 for(const f of ['Core.gs','Server.gs'])vm.runInContext(fs.readFileSync('gas/'+f,'utf8'),c);
 return {c,rows,sharing,sheet};
}
function input(){return {requestId:'request-test-123456789',kind:'creation',cat:'visual',title:'=IMPORTXML("evil")',author:'測試教師',email:'private@example.com',description:'虛構測試',url:'https://example.com',consent:true,status:'approved'};}
test('匿名投稿寫入新收件表且一律待審；相同請求不重複收件',()=>{
 const {c,rows}=backend();const a=c.submitWork(input()),b=c.submitWork(input());
 assert.equal(a.ok,true);assert.equal(b.id,a.id);assert.equal(rows.length,2);assert.equal(rows[1][2],'pending');assert.match(rows[1][4],/^'/);
 assert.equal(c.publicRecords_(c.records_()).length,0);
});
test('匿名或其他帳號不能初始化、列投稿或執行審核',()=>{
 for(const identity of ['', 'someone@example.com']){
  const {c}=backend(identity);
  for(const action of [()=>c.setupWorkspace(),()=>c.adminList(),()=>c.adminReview('id','approved','', '')])assert.throws(action,/無管理權限/);
 }
});
test('核准公開後僅回傳公開欄位，下架立即從公開資料消失',()=>{
 const {c}=backend('owner@example.com');const r=c.submitWork(input());const before=c.adminList().works[0];
 c.adminReview(r.id,'approved','私有審核註記',before.updatedAt);
 let p=JSON.parse(JSON.stringify(c.publicRecords_(c.records_())));assert.equal(p.length,1);assert.equal(p[0].title,input().title);assert.equal(p[0].email,undefined);assert.equal(p[0].reviewNote,undefined);
 assert.throws(()=>c.adminReview(r.id,'hidden','',before.updatedAt),/資料已被更新/);
 const current=c.adminList().works[0];c.adminReview(r.id,'hidden','',current.updatedAt);assert.equal(c.publicRecords_(c.records_()).length,0);
});
test('有附件時核准才公開、下架收回檔案權限',()=>{
 const {c,rows,sharing}=backend('owner@example.com');const r=c.submitWork(input());let record=JSON.parse(rows[1][6]);record.fileId='test-file';record.fileName='test.png';rows[1][6]=JSON.stringify(record);
 c.adminReview(r.id,'approved','',c.records_()[0].updatedAt);assert.deepEqual(sharing[0],['public','view']);
 c.adminReview(r.id,'hidden','',c.records_()[0].updatedAt);assert.deepEqual(sharing[1],['private','none']);
});
test('審核資料寫入失敗時，待審附件不能殘留公開權限',()=>{
 const {c,rows,sharing,sheet}=backend('owner@example.com');const r=c.submitWork(input());
 const record=JSON.parse(rows[1][6]);record.fileId='test-file';record.fileName='test.png';rows[1][6]=JSON.stringify(record);
 const originalRange=sheet.getRange;
 sheet.getRange=function(...args){const range=originalRange(...args);return {...range,setValue(){throw new Error('Sheets unavailable');},setValues(){throw new Error('Sheets unavailable');}};};
 assert.throws(()=>c.adminReview(r.id,'approved','',c.records_()[0].updatedAt),/Sheets unavailable/);
 assert.equal(rows[1][2],'pending');assert.deepEqual(sharing.at(-1),['private','none']);
});
test('審核回寫也必須保護 Sheets 讀回後的等號標題與署名',()=>{
 const {c,rows}=backend('owner@example.com');const r=c.submitWork({...input(),author:'=IMPORTXML("author")'});
 c.adminReview(r.id,'approved','',c.records_()[0].updatedAt);
 assert.match(rows[1][4],/^'=/);assert.match(rows[1][5],/^'=/);
 assert.equal(c.publicRecords_(c.records_())[0].title,input().title);
});
