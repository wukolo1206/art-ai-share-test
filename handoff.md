## 目前狀態

2026-10-20，0.1.0-test 實作已存本機，分支 feature/cloud-submissions，尚未 push。

- 工作目錄：C:\repos\art-ai-share-test，從 artjur0222-cmd/web 複製；原站及研習講義既有工作未修改。
- 新 GitHub repo：https://github.com/wukolo1206/art-ai-share-test，目前空白，推送前須使用者確認。
- 新 GAS script：1Va-iP1rxudS0U84thVAaXtq02HBr5R8k8GPbmysTIw6ST8smvpXsNl-a。
- 管理部署固定 ID：AKfycbwGPAHtgGgqHavlm9tH1gnwmuUeSHF19RFPoIjlzdvVHmzPp-WD_BEI75zHUa9Fuw1Q，版本 8，MYSELF，網址後加 ?page=admin。
- 公開部署固定 ID：AKfycbzo90bk4xKjcsdXHUFg2ZEO5WiX9eD7VpovWqPy-b2kJxh4fLuaDKY60lOxl-3ECFAE，版本 9，ANYONE_ANONYMOUS。
- 首次授權頁已在 Chrome 開啟，使用者尚未回覆完成授權。未初始化收件表／附件資料夾，未通過真實雲端驗收。

## 本次驗證

- npm test：14 項通過，涵蓋輸入、附件檔頭、匿名管理拒絕、重複收件、公開欄位與審核／下架流程；使用模擬 Google services。
- node tests/browser.spec.cjs：11 項本機 Chrome 檢查通過，涵蓋桌機／手機、嵌入投稿、失敗保留、成功收據、重試識別碼、後台篩選與前端錯誤；使用模擬 GAS 回應。
- node --check 檢查三個前端 JS 通過；GAS 程式無反引號／裸寫 URL 字串，HTML 單檔均小於 27K。
- 獨立程式審查發現並修復：審核寫入失敗時的附件權限補償、工具投稿附件缺少公開入口；均新增先失敗再通過的回歸測試；複查另補審核回寫公式字元防護。
- clasp 已確認管理者帳號為 wukolo1206@gmail.com，更新既有管理與公開部署成功。
- 本機截圖與 browser-evidence.json 在 .local，僅為本機模擬預覽，不能當作雲端成功證據。

## 下次接續

1. 使用者完成 Google 首次授權；進管理頁按「首次建立測試收件空間」，保存新資源 ID 至本機 .local，不回寫既有表格。
2. 實際匿名瀏覽器投稿（含一件虛構 PNG），確認待審不公開；管理者核准後另一瀏覽器可讀，信箱／註記不外洩；下架後公開 API 與附件分享均回收。
3. 補測未登入與其他 Google 帳號的後台拒絕；確認 iframe 在 GitHub Pages 上能正常送出。
4. 取得明確 push 同意後，git push origin HEAD:main；啟用該新 repo 的 Pages Actions（gh api repos/wukolo1206/art-ai-share-test/pages -X POST -f build_type=workflow）。核對 Actions 和實際 Pages 網址。
5. 真實雲端驗收完成後，更新狀態與已知風險，再交給使用者測試。

## 注意事項

- 不要在 D:\備課ai\研習講義 根目錄 add/commit/push，既有工作區有其他異動。
- 本地 .clasp.json、gas/Config.gs、.local/、*.bak 均忽略；不得提交 OAuth token、憑證或真實投稿資料。
- 後端每個管理方法各自檢查 ActiveUser allowlist；不能改成 EffectiveUser 當訪客身分。
- 更新後端用 python scripts/deploy_backend.py：先 owner-only manifest 更新管理部署，再 anonymous manifest 更新公開部署，保留固定 URL。
- 管理部署不能誤用公開版本更新。Config.gs 目前僅你的管理帳號；移交需重新建立她的 Google 資源與部署。
- scripts/connect_frontend.py 僅初次匯入原站版型；已有標記會拒絕重跑，後續直接改現況檔。
- 第一版不含會員、寄信、HTML 自動部署或惡意附件掃描；匿名測試每日 30 件、單附件 5MB。
