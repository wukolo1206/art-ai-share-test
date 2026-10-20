function include_(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }
function requireAdmin_() {
  var email = Session.getActiveUser().getEmail();
  if (!isAdminIdentity_(email, ADMIN_EMAILS)) throw new Error('無管理權限，請以管理者 Google 帳號登入。');
  return email;
}
function doGet(e) {
  var p = e && e.parameter || {};
  if (p.action === 'public') {
    var output = {ok:true,works:publicRecords_(records_()),updatedAt:new Date().toISOString()};
    var json = JSON.stringify(output).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    if (p.callback) {
      if (!validCallback_(p.callback)) return ContentService.createTextOutput('Invalid callback');
      return ContentService.createTextOutput(p.callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
  if (p.page === 'admin') {
    try { requireAdmin_(); } catch(err) { return HtmlService.createHtmlOutput('<h1>管理者專用</h1><p>請使用管理者帳號開啟專用後台網址。</p>'); }
    return HtmlService.createTemplateFromFile('Admin').evaluate().setTitle('藝術分享｜投稿審核');
  }
  var t = HtmlService.createTemplateFromFile('Submit');
  t.category = ['visual','music','perform'].indexOf(p.cat) >= 0 ? p.cat : 'visual';
  t.kind = p.kind === 'tool' ? 'tool' : 'creation';
  return t.evaluate().setTitle('藝術分享｜送出投稿').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function setupWorkspace() {
  requireAdmin_();
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty('SHEET_ID')) return {ok:true,message:'測試收件空間已建立。'};
    var ss = SpreadsheetApp.create('藝術AI分享_測試投稿_20261020');
    var sheet = ss.getSheets()[0]; sheet.setName('Submissions');
    sheet.appendRow(['id','createdAt','status','category','title','author','record','reviewNote','updatedAt']);
    sheet.setFrozenRows(1);
    var folder = DriveApp.createFolder('藝術AI分享_測試附件_20261020');
    props.setProperties({SHEET_ID:ss.getId(),FOLDER_ID:folder.getId()});
    return {ok:true,message:'測試收件空間已建立。',sheetUrl:ss.getUrl(),folderUrl:folder.getUrl()};
  } finally { lock.releaseLock(); }
}
function sheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('收件尚未啟用，請稍後再試。');
  return SpreadsheetApp.openById(id).getSheetByName('Submissions');
}
function records_() {
  var s = sheet_(); if (s.getLastRow() < 2) return [];
  return s.getRange(2,1,s.getLastRow()-1,9).getValues().map(function(row,i) {
    var r = JSON.parse(row[6]); r.status = row[2]; r.reviewNote = row[7] || ''; r.updatedAt = row[8] || ''; r.row = i+2; return r;
  });
}
function cell_(s) { return /^[=+@-]/.test(s || '') ? "'" + s : s; }
function submitWork(input) {
  var r = validateSubmission_(input), f = validateFile_(input.file);
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  var uploaded = null;
  try {
    var all = records_();
    var existing = all.filter(function(w) { return w.requestId === r.requestId; })[0];
    if (existing) return {ok:true,id:existing.id,message:'這件投稿已收到，待管理者審核。'};
    var today = new Date().toISOString().slice(0,10);
    if (all.length >= 3000 || all.filter(function(w) { return w.createdAt.slice(0,10) === today; }).length >= 30) throw new Error('測試站今日收件額度已滿，請稍後再試。');
    r.id = Utilities.getUuid(); r.createdAt = new Date().toISOString();
    if (f) {
      var bytes = Utilities.base64Decode(f.base64);
      if (bytes.length > 5*1024*1024) throw new Error('附件超過 5MB。');
      var folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOLDER_ID'));
      uploaded = folder.createFile(Utilities.newBlob(bytes,f.type,r.id + '_' + f.name));
      uploaded.setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.NONE);
      r.fileId = uploaded.getId(); r.fileName = f.name;
    }
    sheet_().appendRow([r.id,r.createdAt,'pending',r.cat,cell_(r.title),cell_(r.author),JSON.stringify(r),'',r.createdAt]);
    return {ok:true,id:r.id,message:'投稿成功！待管理者審核後公開。'};
  } catch(err) {
    if (uploaded) uploaded.setTrashed(true);
    throw new Error(err.message || '送出失敗，請保留內容後重試。');
  } finally { lock.releaseLock(); }
}
function adminList() {
  var email = requireAdmin_();
  return {ok:true,email:email,works:records_().reverse()};
}
function adminReview(id,status,note,expectedUpdatedAt) {
  var email = requireAdmin_();
  if (['approved','rejected','hidden'].indexOf(status) < 0) throw new Error('審核狀態無效。');
  note = text_(note,1000,false);
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    var r = records_().filter(function(w) { return w.id === id; })[0];
    if (!r) throw new Error('找不到投稿。');
    if (r.updatedAt !== expectedUpdatedAt) throw new Error('資料已被更新，請重新載入後再審核。');
    var updatedAt = new Date(Math.max(Date.now(),Date.parse(r.updatedAt)+1)).toISOString();
    var file = null;
    try {
      if (r.fileId) {
        file = DriveApp.getFileById(r.fileId);
        file.setSharing(status === 'approved' ? DriveApp.Access.ANYONE_WITH_LINK : DriveApp.Access.PRIVATE,
          status === 'approved' ? DriveApp.Permission.VIEW : DriveApp.Permission.NONE);
      }
      var row = sheet_().getRange(r.row,1,1,9).getValues()[0];
      row[4] = cell_(r.title); row[5] = cell_(r.author);
      row[2] = status; row[7] = cell_(note); row[8] = updatedAt;
      sheet_().getRange(r.row,1,1,9).setValues([row]);
    } catch(err) {
      if (file) {
        try {
          file.setSharing(r.status === 'approved' ? DriveApp.Access.ANYONE_WITH_LINK : DriveApp.Access.PRIVATE,
            r.status === 'approved' ? DriveApp.Permission.VIEW : DriveApp.Permission.NONE);
        } catch(rollbackError) {
          throw new Error('審核未完成，且附件權限回復失敗。請立即在 Drive 檢查這件投稿的附件權限，再重新載入後台。');
        }
      }
      throw err;
    }
    return {ok:true,message:status === 'approved' ? '已核准公開。' : status === 'hidden' ? '已下架，附件已收回公開權限。' : '已設為不公開。',reviewer:email};
  } finally { lock.releaseLock(); }
}
