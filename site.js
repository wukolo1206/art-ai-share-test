'use strict';
const $ = (s, root = document) => root.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => /^https:\/\/[^\s<>"'\\]+$/i.test(value || '') ? value : '';
let cloudWorks = [], projectFilter = 'all', loading = false;

function renderTools(filter) {
  $('#toolList').innerHTML = TOOLS.filter(t => filter === 'all' || t.cat === filter).map(t => {
    const c = CATS[t.cat];
    return `<article class="tool" style="--c:${c.c};--cs:${c.cs}"><span class="tag">${c.name}</span><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="use"><b>課堂運用：</b>${esc(t.use)}</div><a class="go" href="${esc(safeUrl(t.url))}" target="_blank" rel="noopener noreferrer">前往官網 ↗</a></article>`;
  }).join('');
}
document.querySelectorAll('#tools .chip').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#tools .chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderTools(b.dataset.f);
}));

function submissionPanel(container, category, kind) {
  if (!safeUrl(SITE_CONFIG.publicAppUrl)) {
    container.innerHTML = '<p class="note">投稿尚未啟用，請稍後再試。</p>';
    return;
  }
  const url = new URL(SITE_CONFIG.publicAppUrl);
  url.searchParams.set('cat', category); url.searchParams.set('kind', kind);
  container.innerHTML = `<p class="muted">投稿將送至管理者審核，不會立即公開。</p><a class="submit-link" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">另開完整投稿表單 ↗</a><iframe class="submit-frame" title="${kind === 'tool' ? '教學互動工具' : CATS[category].name}投稿表單" src="${esc(url.href)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function renderProjects() {
  const originals = PROJECTS.map(p => ({...p, author:'', description:p.idea, tool:p.ai.join('、'), source:true}));
  const all = originals.concat(cloudWorks.filter(w => w.kind === 'tool'));
  const list = all.filter(w => projectFilter === 'all' || w.cat === projectFilter);
  $('#projList').innerHTML = list.length ? list.map(w => {
    const c = CATS[w.cat] || CATS.visual, url = safeUrl(w.url), fileUrl = safeUrl(w.fileUrl);
    return `<article class="proj" style="--c:${c.c};--cs:${c.cs}"><div class="band"><div class="ic" aria-hidden="true">${esc(w.icon || '✨')}</div><div><div class="tag">${c.name}${w.source ? ' · 原站展示資料' : ''}</div><h3>${esc(w.title)}</h3></div></div><div class="pb"><div class="meta">${esc(w.author || '原站成果')}</div><div><div class="lbl">使用的 AI</div><p>${esc(w.tool)}</p></div><div><div class="lbl">設計理念</div><p>${esc(w.description)}</p></div>${w.use ? `<div><div class="lbl">課堂使用方式</div><p>${esc(w.use)}</p></div>` : ''}${w.grade ? `<div class="meta">適用對象：${esc(w.grade)}</div>` : ''}${url ? `<a class="btn sm open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">開啟工具 ↗</a>` : '<span class="meta">連結準備中</span>'}${fileUrl ? `<a href="${esc(fileUrl)}" target="_blank" rel="noopener noreferrer">查看附件：${esc(w.fileName)}</a>` : ''}</div></article>`;
  }).join('') : '<p class="empty">這個類別還沒有公開成果。</p>';
}
document.querySelectorAll('.wchip').forEach(b => b.addEventListener('click', () => {
  projectFilter = b.dataset.f;
  document.querySelectorAll('.wchip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderProjects();
}));

function renderGallery(cat) {
  const list = cloudWorks.filter(w => w.kind === 'creation' && w.cat === cat);
  const gallery = $(`#${cat} .gallery`);
  gallery.innerHTML = list.length ? list.map(w => {
    const c = CATS[cat], url = safeUrl(w.url), fileUrl = safeUrl(w.fileUrl);
    return `<article class="work" style="--c:${c.c};--cs:${c.cs}"><div class="body"><span class="toolname">${esc(w.tool || 'AI 創作')}</span><h3>${esc(w.title)}</h3><div class="by">${esc(w.author)}</div><p class="detail">${esc(w.description)}</p>${w.prompt ? `<details><summary>提示詞</summary><p>${esc(w.prompt)}</p></details>` : ''}${w.mine ? `<details><summary>自己的貢獻</summary><p>${esc(w.mine)}</p></details>` : ''}<div class="row">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">開啟作品 ↗</a>` : ''}${fileUrl ? `<a href="${esc(fileUrl)}" target="_blank" rel="noopener noreferrer">查看附件：${esc(w.fileName)}</a>` : ''}</div></div></article>`;
  }).join('') : '<p class="empty">目前沒有已公開的作品。投稿通過審核後會顯示在這裡。</p>';
}
function buildCategory(cat) {
  const c = CATS[cat], el = $(`#${cat}`);
  el.style.setProperty('--c', c.c); el.style.setProperty('--cs', c.cs);
  el.innerHTML = `<div class="cathead"><h1>${c.name}</h1><p>${esc(c.intro)}</p><div class="ideas">${c.ideas.map(i => `<span>💡 ${esc(i)}</span>`).join('')}</div></div><div class="split"><section class="submission-panel"><h2>分享 AI 創作</h2><div class="form-host"></div></section><section><div class="gal-top"><h2>公開作品集</h2></div><div class="gallery" aria-live="polite"></div></section></div>`;
  // 表單只在該分類首次開啟時載入，避免同時啟動多個 GAS iframe。
  renderGallery(cat);
}

function loadWorks() {
  if (loading) return;
  if (!safeUrl(SITE_CONFIG.publicAppUrl)) { $('#cloud-status').textContent = '測試收件服務尚未設定。'; return; }
  loading = true; $('#refresh-works').disabled = true;
  $('#cloud-status').textContent = '正在讀取公開作品…';
  const name = 'artShare_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const script = document.createElement('script'), url = new URL(SITE_CONFIG.publicAppUrl);
  url.searchParams.set('action','public'); url.searchParams.set('callback',name); url.searchParams.set('_',Date.now());
  let timeout;
  function finish(error) {
    clearTimeout(timeout); script.remove(); delete window[name]; loading = false; $('#refresh-works').disabled = false;
    if (error) { cloudWorks = []; renderProjects(); Object.keys(CATS).forEach(renderGallery); $('#cloud-status').textContent = '公開作品暫時無法載入，請稍後按「重新整理作品」。'; }
  }
  window[name] = result => {
    if (!result || !result.ok || !Array.isArray(result.works)) return finish(true);
    cloudWorks = result.works.filter(w => w && CATS[w.cat] && ['tool','creation'].includes(w.kind));
    renderProjects(); Object.keys(CATS).forEach(renderGallery);
    $('#cloud-status').textContent = `目前有 ${cloudWorks.length} 件審核通過的投稿。`; finish(false);
  };
  script.onerror = () => finish(true); script.src = url.href;
  timeout = setTimeout(() => finish(true),25000); document.body.append(script);
}
function route() {
  const id = (location.hash || '#home').slice(1);
  const target = document.getElementById(id)?.classList.contains('page') ? id : 'home';
  document.querySelectorAll('section.page').forEach(s => s.classList.toggle('on',s.id === target));
  document.querySelectorAll('nav.main a').forEach(a => { if (a.hash === '#' + target) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  if (CATS[target] && !$(`#${target} .form-host iframe`)) submissionPanel($(`#${target} .form-host`),target,'creation');
  window.scrollTo(0,0);
}
$('#tool-submission').closest('details').addEventListener('toggle', function() {
  if (this.open && !$('#tool-submission iframe')) submissionPanel($('#tool-submission'),'visual','tool');
});
$('#admin-link').href = SITE_CONFIG.adminAppUrl;
$('#refresh-works').addEventListener('click',loadWorks);
window.addEventListener('hashchange',route);
renderTools('all'); Object.keys(CATS).forEach(buildCategory); renderProjects(); route(); loadWorks();
