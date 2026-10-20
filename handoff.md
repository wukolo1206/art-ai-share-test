## 目前狀態

2026-10-20，0.1.1-test 已推送並發布 GitHub Pages，分支 feature/cloud-submissions 對應 origin/main。

- 工作目錄：C:\repos\art-ai-share-test，從 artjur0222-cmd/web 複製；原站及研習講義既有工作未修改。
- 新 GitHub repo：https://github.com/wukolo1206/art-ai-share-test，使用者已同意推送，Pages 使用 Actions；網址 https://wukolo1206.github.io/art-ai-share-test/。
- 新 GAS script：1Va-iP1rxudS0U84thVAaXtq02HBr5R8k8GPbmysTIw6ST8smvpXsNl-a。
- 管理部署固定 ID：AKfycbwGPAHtgGgqHavlm9tH1gnwmuUeSHF19RFPoIjlzdvVHmzPp-WD_BEI75zHUa9Fuw1Q，版本 8，MYSELF，網址後加 ?page=admin。
- 公開部署固定 ID：AKfycbzo90bk4xKjcsdXHUFg2ZEO5WiX9eD7VpovWqPy-b2kJxh4fLuaDKY60lOxl-3ECFAE，版本 9，ANYONE_ANONYMOUS。
- 使用者已完成 Google 授權，已透過管理頁初始化全新私人試算表與附件資料夾；資源 ID 保存在 .local/resources.json。作品網址流程與附件後端通過真實雲端驗證；0.1.1 移除空白嵌入，改完整頁投稿。

## 本次驗證

### 0.1.1 發布與附件後端驗收

- 使用者同意 push 後發布 Pages，第一輪 Actions run 39419185075 成功；發布白名單僅包含四個前端檔。
- 真實 Pages HTTPS 嵌入仍空白，移除 iframe，改「填寫投稿表單」另開完整 GAS 頁，保留各類 cat/kind 參數。
- Apps Script 編輯器執行 verification/attachment-lifecycle.gs，20:06:18 執行完成，五項實際服務檢查皆 true：receivedPrivate / approvedPublic / approvedListed / hiddenPrivate / hiddenRemoved。
- 附件測試投稿 f85e79ab-d999-451a-b617-3c5043cf05e3 保留下架；驗收函式不屬公開部署，測試後已從 GAS HEAD 移除。
- 後端公開／管理部署仍為版本 9／8，不需更新版本；本次功能變更在 GitHub 前端。



- npm test：14 項通過，涵蓋輸入、附件檔頭、匿名管理拒絕、重複收件、公開欄位與審核／下架流程；使用模擬 Google services。
- node tests/browser.spec.cjs：12 項本機 Chrome 檢查通過，涵蓋桌機／手機、完整投稿入口、FileReader 附件內容、失敗保留、成功收據、重試識別碼、後台篩選與前端錯誤；使用模擬 GAS 回應。
- node --check 檢查三個前端 JS 通過；GAS 程式無反引號／裸寫 URL 字串，HTML 單檔均小於 27K。
- 獨立程式審查發現並修復：審核寫入失敗時的附件權限補償、工具投稿附件缺少公開入口；均新增先失敗再通過的回歸測試；複查另補審核回寫公式字元防護。
- clasp 已確認管理者帳號為 wukolo1206@gmail.com，更新既有管理與公開部署成功。
- 本機截圖與 browser-evidence.json 在 .local，僅為本機模擬預覽，不能當作雲端成功證據。

### 真實雲端驗證（2026-10-20 授權後）

- Chrome 公開投稿頁送出虛構作品，取得收據 f6f95ba2-6ede-4124-9c9d-1644af9921b6，後台收到 pending。
- 不帶 Cookie 的 requests 呼叫公開 API：pending 時 0 件；核准後 1 件，無 email/reviewNote/requestId/status/row/fileId；下架後 0 件。
- 管理者網頁核准與下架成功，本機網站使用真實 API 曾顯示該卡片。
- 不帶 Cookie 讀取公開 deployment 的 ?page=admin，回傳「管理者專用」，拒絕匿名管理頁。
- Drive API 核對新表／資料夾均僅 user owner 權限。
- 實際送出使用已登入的 Chrome，不能據此宣稱未登入瀏覽器已成功送出；匿名 HTTP 僅確認表單頁可讀、公開 API 可讀與管理頁拒絕。
- 附件選擇器逾時：需使用者在 ChatGPT Chrome extension 開啟 Allow access to file URLs，已提供官方指引；本次投稿未含附件。
- 真實 localhost 外嵌 GAS frame 為空白，另開完整投稿頁正常。測試過隔離 cookie 的 credentialless iframe 亦空白，未確認原因。不要把這項宣稱為通過。
- 詳細 JSON 證據在 .local/live-evidence.json；測試作品保留下架狀態，未刪除。

## 下次接續

1. 使用另一個 Google 帳號或真正未登入的瀏覽器，由線上「填寫投稿表單」跑一次實際投稿，並檢查管理入口拒絕非管理員。
2. 請使用者在真實瀏覽器選一件虛構附件完成表單送出；後端附件生命週期與本機 FileReader 已驗證，但連線 Chrome 選檔受擴充功能權限限制。
3. 交由老師用虛構作品試用；確認適合後再移交到她持有的 GitHub/Google 帳號，不直接改原站。

## 注意事項

- 不要在 D:\備課ai\研習講義 根目錄 add/commit/push，既有工作區有其他異動。
- 本地 .clasp.json、gas/Config.gs、.local/、*.bak 均忽略；不得提交 OAuth token、憑證或真實投稿資料。
- 後端每個管理方法各自檢查 ActiveUser allowlist；不能改成 EffectiveUser 當訪客身分。
- 更新後端用 python scripts/deploy_backend.py：先 owner-only manifest 更新管理部署，再 anonymous manifest 更新公開部署，保留固定 URL。
- 管理部署不能誤用公開版本更新。Config.gs 目前僅你的管理帳號；移交需重新建立她的 Google 資源與部署。
- scripts/connect_frontend.py 僅初次匯入原站版型；已有標記會拒絕重跑，後續直接改現況檔。
- 第一版不含會員、寄信、HTML 自動部署或惡意附件掃描；匿名測試每日 30 件、單附件 5MB。
