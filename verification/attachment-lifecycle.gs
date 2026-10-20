// 開發驗收用：複製到 GAS 編輯器執行，非公開部署的一部分。
function verifyAttachmentLifecycle() {
  requireAdmin_();
  var result = submitWork({
    requestId:'live-attachment-' + Date.now(), kind:'creation', cat:'visual',
    title:'附件生命週期驗收（虛構測試）',author:'虛構測試教師',email:'attachment-test@example.com',
    tool:'系統驗收',description:'虛構 PNG，驗證實際 Drive 收件、公開與下架權限。',
    consent:true,file:{name:'test-art.png',type:'image/png',
      base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII='}
  });
  var r = records_().filter(function(w){return w.id === result.id;})[0];
  var file = DriveApp.getFileById(r.fileId);
  var evidence = {id:r.id,receivedPrivate:file.getSharingAccess() === DriveApp.Access.PRIVATE};
  try {
    adminReview(r.id,'approved','附件驗收用，不公開聯絡信箱。',r.updatedAt);
    evidence.approvedPublic = file.getSharingAccess() === DriveApp.Access.ANYONE_WITH_LINK;
    evidence.approvedListed = publicRecords_(records_()).some(function(w){return w.id === result.id && !!w.fileUrl;});
  } finally {
    r = records_().filter(function(w){return w.id === result.id;})[0];
    adminReview(r.id,'hidden','附件驗收完成後保留下架。',r.updatedAt);
  }
  evidence.hiddenPrivate = file.getSharingAccess() === DriveApp.Access.PRIVATE;
  evidence.hiddenRemoved = !publicRecords_(records_()).some(function(w){return w.id === result.id;});
  if (!evidence.receivedPrivate || !evidence.approvedPublic || !evidence.approvedListed || !evidence.hiddenPrivate || !evidence.hiddenRemoved) throw new Error(JSON.stringify(evidence));
  Logger.log(JSON.stringify(evidence));
  return evidence;
}
