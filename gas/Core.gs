function text_(value, max, required) {
  var s = typeof value === 'string' ? value.trim() : '';
  if ((required && !s) || s.length > max) throw new Error('必填資料不足或文字超過長度限制。');
  return s;
}
function validateSubmission_(input) {
  if (!input || input.consent !== true || input.website) throw new Error('請確認投稿同意欄位。');
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(input.requestId || '')) throw new Error('投稿識別碼無效，請重新整理。');
  if (['visual','music','perform'].indexOf(input.cat) < 0 || ['creation','tool'].indexOf(input.kind) < 0) throw new Error('作品分類無效。');
  var r = {requestId:input.requestId, kind:input.kind, cat:input.cat, status:'pending', fileId:'', fileName:''};
  r.title = text_(input.title,120,true);
  r.author = text_(input.author,80,true);
  r.email = text_(input.email,200,true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) throw new Error('請填寫有效的聯絡信箱。');
  r.url = text_(input.url,1500,false);
  if (r.url && !/^https:\/\/[^\s<>"'\\]+$/i.test(r.url)) throw new Error('作品網址必須是完整的 HTTPS 網址。');
  r.tool = text_(input.tool,200,false);
  r.description = text_(input.description,3000,true);
  r.prompt = text_(input.prompt,2000,false);
  r.mine = text_(input.mine,2000,false);
  r.use = text_(input.use,1500,false);
  r.grade = text_(input.grade,100,false);
  if (r.kind === 'tool' && !r.url) throw new Error('互動工具請提供已上線的 HTTPS 網址。');
  if (!r.url && !input.file) throw new Error('請提供作品網址或附件。');
  if (JSON.stringify(r).length > 14000) throw new Error('投稿文字總量過長，請精簡。');
  return r;
}
function validateFile_(file) {
  if (!file) return null;
  var name = text_(file.name,150,true).replace(/[\x00-\x1f/\\]/g,'_');
  var base64 = file.base64;
  if (typeof base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length > 6990508) throw new Error('附件無效或超過 5MB。');
  var header = base64Header_(base64);
  var formats = [
    ['image/png',/\.png$/i,header.slice(0,8) === '\x89PNG\r\n\x1a\n'],
    ['image/jpeg',/\.jpe?g$/i,header.slice(0,3) === '\xff\xd8\xff'],
    ['image/webp',/\.webp$/i,header.slice(0,4) === 'RIFF' && header.slice(8,12) === 'WEBP'],
    ['application/pdf',/\.pdf$/i,header.slice(0,5) === '%PDF-'],
    ['audio/mpeg',/\.mp3$/i,header.slice(0,3) === 'ID3' || (header.charCodeAt(0) === 255 && (header.charCodeAt(1) & 224) === 224)],
    ['video/mp4',/\.mp4$/i,header.slice(4,8) === 'ftyp']
  ];
  var ok = formats.some(function(f) { return f[0] === file.type && f[1].test(name) && f[2]; });
  if (!ok) throw new Error('附件僅接受有效的 PNG、JPEG、WebP、PDF、MP3 或 MP4，不能上傳 HTML。');
  return {name:name,type:file.type,base64:base64};
}
function base64Header_(value) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', bits = 0, count = 0, out = '';
  for (var i = 0; i < Math.min(value.length,32); i++) {
    var n = alphabet.indexOf(value.charAt(i)); if (n < 0) break;
    bits = (bits << 6) | n; count += 6;
    if (count >= 8) { count -= 8; out += String.fromCharCode((bits >> count) & 255); }
  }
  return out;
}
function isAdminIdentity_(email, admins) {
  return !!email && admins.some(function(a) { return a.toLowerCase() === email.toLowerCase(); });
}
function validCallback_(s) { return /^[A-Za-z_$][A-Za-z0-9_$]{0,79}$/.test(s || ''); }
function publicRecords_(records) {
  return records.filter(function(r) { return r.status === 'approved'; }).map(function(r) {
    var out = {};
    ['id','createdAt','kind','cat','title','author','tool','url','description','prompt','mine','use','grade','fileName'].forEach(function(k) { out[k] = r[k] || ''; });
    out.fileUrl = r.fileId ? 'https:/' + '/drive.google.com/file/d/' + encodeURIComponent(r.fileId) + '/view' : '';
    return out;
  });
}
