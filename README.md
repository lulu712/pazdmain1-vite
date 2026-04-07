# 陪診系統 (Patient Companion System)

一套基於 Vue 3 開發的陪診管理平台，提供患者、陪診員與管理員之間的協作介面，整合資訊看板、資料視覺化與權限管理等功能。

---

## 技術棧 (Tech Stack)

| 分類 | 套件 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 元件庫 | Element Plus + @element-plus/icons-vue |
| 狀態管理 | Pinia / Vuex + vuex-persistedstate |
| 路由管理 | Vue Router 5 |
| 資料視覺化 | ECharts 6 |
| HTTP 請求 | Axios |
| 樣式 | SCSS / LESS |

---

## 專案結構 (Project Structure)

```
src/
├── api/          # API 呼叫模組
├── assets/       # 靜態資源（圖片、字體等）
├── components/   # 共用元件
├── router/       # 路由設定
├── store/        # 狀態管理
├── utils/        # 工具函式
└── views/
    ├── auth/     # 登入 / 註冊
    ├── dashboard/# 資訊看板
    ├── vppz/     # 陪診功能頁面
    └── Login/    # 登入頁面
```

---

## 快速開始 (Getting Started)

### 環境需求

- Node.js >= 18（建議使用 `.nvmrc` 指定版本）
- npm 或 yarn

### 安裝依賴

```bash
npm install
```

### 本地開發

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

---

## 主要功能 (Features)

- 🏠 **資訊看板**：整合 ECharts 顯示陪診統計數據
- 🔐 **身份驗證**：登入 / 登出 / 權限控制
- 👤 **使用者管理**：不同角色（患者、陪診員、管理員）的功能區分
- 📋 **陪診記錄**：建立、查詢與管理陪診案件
- 💾 **狀態持久化**：使用 vuex-persistedstate 保存登入狀態

---

## 開發規範 (Development Notes)

- 使用 `<script setup>` SFC 語法
- 元件命名採用 PascalCase
- API 請求統一集中在 `src/api/` 目錄管理
- 全域樣式定義於 `src/style.css`
