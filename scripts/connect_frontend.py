"""一次性從原始備份移植版型與內容；不覆蓋後續人工編輯。"""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
marker = root / '.local' / 'frontend-imported'
if marker.exists():
    raise SystemExit('原版已匯入，禁止重新產生並覆蓋目前編輯。請直接修改現況檔。')
source = (root / 'index.html.bak').read_text(encoding='utf-8')
content = []
for name in ['CATS', 'PROJECTS', 'TOOLS']:
    match = re.search(r'const '+name+r' = ([\s\S]*?\n[}\]]);', source)
    if not match:
        raise RuntimeError(name)
    content.append('const '+name+' = '+match.group(1)+';')
(root/'site-content.js').write_text('\n\n'.join(content)+'\n', encoding='utf-8')
html = source[:source.index('<script>')]
html = re.sub(r'    <details class="adder">[\s\S]*?</details>', '''    <details class="adder">
      <summary>分享一項教學互動工具</summary>
      <div id="tool-submission"></div>
    </details>''', html)
html = html.replace('<footer>AI × 藝術｜藝術領域 AI 運用教學網站</footer>', '<footer>AI × 藝術｜藝術領域 AI 運用教學網站 · 隔離測試版<br><a id="admin-link" target="_blank" rel="noopener">管理者登入</a></footer>')
html = html.replace('<main class="container">', '<main class="container"><p class="note" role="note">測試站：請使用虛構作品資料。投稿經管理者審核後才公開。</p><p id="cloud-status" role="status" class="msg">正在讀取公開作品…</p><button id="refresh-works" type="button" class="chip">重新整理作品</button>')
html = html.replace('<title>AI × 藝術｜藝術領域 AI 運用教學網站</title>', '<title>AI × 藝術｜投稿分享測試站</title>')
html = html.replace('</style>', '.submit-frame{width:100%;height:1570px;border:0;border-radius:18px;background:var(--bg)}.submit-link{display:inline-block;margin:12px 0}.split{grid-template-columns:minmax(300px,420px) minmax(0,1fr)}.work .body{overflow-wrap:anywhere}.page>h1{margin-bottom:10px}@media(max-width:900px){.split{grid-template-columns:1fr}}\n</style>')
html += '<script src="site-config.js"></script>\n<script src="site-content.js"></script>\n<script src="site.js"></script>\n</body>\n</html>\n'
(root/'index.html').write_text(html,encoding='utf-8')
marker.parent.mkdir(exist_ok=True)
marker.write_text('imported',encoding='utf-8')
