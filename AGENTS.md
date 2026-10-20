---
project: 藝術 AI 分享測試站
category: GAS教學工具
status: 開發中
version: 0.1.0-dev
next_action: 完成隔離投稿與審核測試，再由使用者確認推送
updated: 2026-10-20
---

# 藝術 AI 分享測試站

沿用 artjur0222-cmd/web 版型；GitHub Pages 展示，GAS 收件與審核，Sheets/Drive 儲存。

## 不能動的地方
- 不修改 artjur0222-cmd/web 或原 Google Sites。
- 僅使用本測試站新建 Google 資源，不覆寫既有試算表。
- 憑證、私有收件資料、管理員設定不得發布到 GitHub Pages。
- 既有程式修改前備份同名 .bak；GAS 程式不使用反引號及 hash 路由。
- git push 須取得使用者確認。

## 部署後驗證清單
- 匿名投稿成功且待審不公開，附件保持私有。
- 非管理者不得讀取投稿清單或執行審核。
- 管理者登入、審核、下架正常；核准後跨裝置能看見。
- 公開回應不包含信箱、審核註記及待審作品。
- 導覽、分類、送出狀態、錯誤及重複送出處理正常。
