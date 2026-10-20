# 藝術 AI 分享測試站設計 — 2026-10-20

## 已確認需求
保留原網站分類與版型；投稿者不建立會員、不自行管理作品。管理者在網頁審核。先在 wukolo1206 帳號隔離測試，原站不變。

## 方案
GitHub Pages 展示原站。每類投稿表單由 GAS HTML 以完整獨立頁提供；網站分類按鈕附帶類別與投稿類型。保留原有欄位與配色，使用 google.script.run 可靠呼叫後端，避免跨站 POST 無法讀取成功回應。0.1.1 因真實嵌入空白移除 iframe。公開卡片透過唯讀 JSONP 取得白名單欄位；所有值以 DOM/textContent 或跳脫後輸出。

建立一份新的試算表及私人附件資料夾。投稿 pending；僅 approved 可公開。管理者頁使用 Google 帳號識別與伺服器 allowlist；另用 owner-only deployment 提供入口。公開部署下管理函式也必須逐次驗證身分。

附件第一版限制圖片、PDF、MP3/MP4 與 5MB，檢查型別/副檔名/檔頭。HTML 不執行也不收件；互動工具提交已部署 HTTPS 網址。審核時明確公開所附檔案，下架回收共享權限；分享失敗不得將狀態標記為成功。

## 資料與邊界
投稿欄位：id/requestId、建立時間、kind、cat、title、author、email、tool、url、prompt、mine、description、use、grade、fileId、fileName、status、reviewNote、updatedAt。回覆不信任前端 status。公開資料不含 email、reviewNote、requestId。試算表輸入防公式注入；重複 requestId 回傳既有結果；鎖定避免並發重複。

## 驗收
單元測試涵蓋輸入驗證、未授權拒絕、公開欄位、狀態篩選；瀏覽器檢查分類、表單互動、後台、跨裝置公開與下架。自動測試與實際雲端驗證分別記錄，不以本機 mock 宣稱雲端成功。
