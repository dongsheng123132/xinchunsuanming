# AI Fortune Teller · 新春福签 x402 白皮书 / Whitepaper

---

## 一、白皮书（简体中文）

### 1. 产品简介

AI 新春福签 · x402 开运小神坛  

这是一个专为春节打造的「AI 开运福签」应用。你可以先选一个愿望方向（事业、财运、感情、健康、家人平安），通过摇签筒抽出三支新年福签，再由 AI 为你解签，送上一份专属的新春祝福和行动建议，让新的一年更有仪式感和好运气。  

每一次解签都通过 Coinbase x402 协议，用 0.1 USDC 完成支付，安全透明、按次计费，不需要复杂账户体系，非常适合 AI Agent 和个人用户轻量使用。

### 2. 项目结构

- `frontend/`：React 前端应用，提供抽签动画、解签界面和多语言切换。  
- `agent/`：Python uAgents 脚本，用于模拟 AI 算命服务（可部署到 Agent Verse）。

### 3. 快速开始

**启动前端**

确保已安装 Node.js。

```bash
cd frontend
npm install
npm run dev
```

浏览器访问本地地址（默认 http://localhost:5173）。

**运行 AI Agent（本地模拟）**

确保已安装 Python 3.10+。

```bash
cd agent
pip install -r requirements.txt
python oracle.py
```

### 4. Agent Verse 部署

要将 Agent 部署到 [Agent Verse](https://www.agent-verse.live)：

1. 注册并登录 Agent Verse。  
2. 创建一个新的 Hosted Agent。  
3. 将 `agent/oracle.py` 中的逻辑复制到在线编辑器中并按需调整。  
4. Hosted Agent 不需要 `if __name__ == "__main__": oracle.run()`，平台会自动运行。

### 5. 功能说明

- 摇签仪式：用户点击签筒进行摇动，模拟真实的抽签体验。  
- 三签定数：每次会话需连续抽取三支签，组合决定本次签运。  
- AI 解签：抽取完成后调用 AI 生成签文解读和新年祝福。  
- x402 支付：每次解签按 0.1 USDC 收费，只支持基于 HTTP 402 的 x402 协议支付。

### 6. 技术栈

- 前端：React、TypeScript、Tailwind CSS、Framer Motion、Lucide React  
- 后端 / AI：Python、uAgents，可扩展对接 LLM（如 OpenAI / Anthropic 等）

### 7. 签号生成与链上公平性（非随机数，基于区块链）

本项目不使用传统伪随机数来决定签号，而是将每一次付费解签，与区块链上的真实交易绑定，做到「童叟无欺」：

- 当前版本固定使用 Base 链上的 USDC 支付交易作为来源。  
- 每一次解签，对应一次在 Base 链上、通过 x402 完成的 USDC 支付交易（记为该次会话的 `txHash`）。  
- 在链上确认后，任何人都可以查询到这笔交易的 `txHash`。  
- 应用将 `txHash` 视为一个大整数 H，并按如下规则从中「切出」三支签：
  - 假设一共有 N 支签（例如 N = 100）。  
  - 第一支签：`lot1 = (H mod N) + 1`  
  - 第二支签：`lot2 = ((H / N) mod N) + 1`  
  - 第三支签：`lot3 = ((H / N^2) mod N) + 1`  
- 这样，每一支签都是由链上交易哈希推导出来，后台不额外注入任何随机数。  
- 用户只要知道本次支付的 `txHash` 和公开的 N，即可在本地独立复算 `lot1/lot2/lot3`，验证没有被「换签」。

因此：  
- 「出签顺序」由链上交易决定，不靠中心化随机数。  
- 「可验证性」由公开的 `txHash` 和固定算法保证，真正做到可查、可复算、可追溯。

---

## II. Whitepaper (English)

### 1. Product Overview

AI Lunar New Year Fortune · Powered by x402  

This app is a “Lunar New Year Fortune & Blessing” experience designed for both humans and AI agents. You first choose a focus area (Career, Wealth, Love, Health, or Family), then shake the virtual fortune tube to draw three lots. An AI oracle interprets your lots and generates a personalized New Year blessing card with clear guidance and positive wishes for the year ahead.  

Each interpretation is paid via the Coinbase x402 protocol with a 0.1 USDC per-session fee, using HTTP 402 payments for secure, transparent, pay-per-use access—ideal for lightweight usage by AI agents and individual users.

### 2. Project Structure

- `frontend/`: React SPA providing the shaking animation, interpretation screen, and language switching.  
- `agent/`: Python uAgents script that can be deployed to Agent Verse as an AI oracle.

### 3. Quickstart

**Start the frontend**

Make sure Node.js is installed.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL in your browser (typically http://localhost:5173).

**Run the AI Agent (local)**

Make sure Python 3.10+ is installed.

```bash
cd agent
pip install -r requirements.txt
python oracle.py
```

### 4. Agent Verse Deployment

To deploy the agent on [Agent Verse](https://www.agent-verse.live):

1. Sign up and log in to Agent Verse.  
2. Create a new hosted agent.  
3. Copy the logic from `agent/oracle.py` into the online editor and adapt as needed.  
4. Hosted agents do not require `if __name__ == "__main__": oracle.run()`; the platform runs them automatically.

### 5. Features

- Shaking ritual: users tap the tube to shake and draw lots with an immersive animation.  
- Three-lot session: each session draws three lots; the combination defines the fortune.  
- AI interpretation: after drawing, the AI generates an interpretation and New Year blessing.  
- x402 payments: each interpretation costs 0.1 USDC and is paid exclusively via the x402 protocol (HTTP 402).

### 6. Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Framer Motion, Lucide React  
- Backend / AI: Python, uAgents Framework, can be extended to real LLM providers (OpenAI / Anthropic, etc.)

### 7. On-chain Lot Selection & Fairness (Hash-based, Not Random)

This project does not rely on traditional pseudo-random generators to pick lots.  
Instead, each fortune session is cryptographically tied to a real on-chain transaction on Base so the result is transparent and verifiable:

- In the current version, all payments are USDC transfers on the Base network.  
- Every paid interpretation corresponds to a USDC payment executed via x402 on Base, with an on-chain transaction hash `txHash`.  
- Once the payment is confirmed on-chain, anyone can look up that `txHash`.  
- The app treats `txHash` as a large integer H and derives the three lot numbers from it as follows:
  - Assume there are N possible lots in total (e.g. N = 100).  
  - First lot: `lot1 = (H mod N) + 1`  
  - Second lot: `lot2 = ((H / N) mod N) + 1`  
  - Third lot: `lot3 = ((H / N^2) mod N) + 1`  
- No extra randomness is injected by the backend; the lots are fully determined by the on-chain transaction hash and the public parameter N.  
- Any user who knows their payment `txHash` and N can independently recompute `lot1/lot2/lot3` and verify the result.

In other words:

- The lot selection is anchored to the blockchain, not to a centralized random source.  
- Auditability and “fair play” come from the public `txHash` and a fixed, documented algorithm.

---

## 三、白皮書（繁體中文）

### 1. 產品簡介

AI 新春福籤 · x402 開運小神壇  

這是一個為農曆新年打造的「AI 開運福籤」應用。你可以先選擇一個心願方向（事業、財運、感情、健康、闔家平安），透過搖籤筒抽出三支新年福籤，接著由 AI 為你解籤，送上一份專屬的新春祝福與行動建議，讓新的一年更有儀式感與好運加持。  

每一次解籤都透過 Coinbase x402 協議，以 0.1 USDC 完成支付，安全透明、按次收費，無需複雜帳號系統，非常適合 AI Agent 以及個人用戶輕量使用。

### 2. 專案結構

- `frontend/`：React 前端應用，提供抽籤動畫、解籤介面與多語切換。  
- `agent/`：Python uAgents 腳本，用於模擬 AI 算命服務（可部署到 Agent Verse）。

### 3. 快速開始

**啟動前端**

請先安裝 Node.js。

```bash
cd frontend
npm install
npm run dev
```

在瀏覽器中開啟本機網址（預設 http://localhost:5173）。

**執行 AI Agent（本機模擬）**

請先安裝 Python 3.10+。

```bash
cd agent
pip install -r requirements.txt
python oracle.py
```

### 4. Agent Verse 部署

要將 Agent 部署到 [Agent Verse](https://www.agent-verse.live)：

1. 註冊並登入 Agent Verse。  
2. 建立一個新的 Hosted Agent。  
3. 將 `agent/oracle.py` 中的邏輯複製到線上編輯器中並視需求調整。  
4. Hosted Agent 不需要 `if __name__ == "__main__": oracle.run()`，平台會自動執行。

### 5. 功能說明

- 搖籤儀式：使用者點擊籤筒進行搖籤，模擬真實抽籤體驗。  
- 三籤定數：每次會話需連續抽出三支籤，組合決定本次籤運。  
- AI 解籤：完成抽籤後，由 AI 生成籤文解讀與新年祝福。  
- x402 支付：每次解籤以 0.1 USDC 收費，只支援基於 HTTP 402 的 x402 協議支付。

### 6. 技術棧

- 前端：React、TypeScript、Tailwind CSS、Framer Motion、Lucide React  
- 後端 / AI：Python、uAgents，可延伸串接 LLM（如 OpenAI / Anthropic 等）

### 7. 簽號生成與鏈上公平性（非隨機數，基於區塊鏈）

本專案不使用傳統的偽隨機數來決定簽號，而是將每一次付費解籤，與區塊鏈上的真實交易綁定，做到「童叟無欺」：

- 目前版本固定採用 Base 鏈上的 USDC 支付交易作為來源。  
- 每一次解籤，都對應一筆在 Base 鏈上、透過 x402 完成的 USDC 支付交易（作為本次會話的 `txHash`）。  
- 交易在鏈上確認後，任何人都可以查到這個 `txHash`。  
- 應用將 `txHash` 視為一個大整數 H，並依下列規則從中「切出」三支籤：
  - 假設總共有 N 支籤（例如 N = 100）。  
  - 第一支籤：`lot1 = (H mod N) + 1`  
  - 第二支籤：`lot2 = ((H / N) mod N) + 1`  
  - 第三支籤：`lot3 = ((H / N^2) mod N) + 1`  
- 如此一來，每一支籤都是由鏈上交易雜湊推導而來，後端不額外注入任何隨機數。  
- 使用者只要知道本次支付的 `txHash` 與公開的 N，就能在本地獨立重算 `lot1/lot2/lot3`，驗證沒有被「換籤」。

因此：

- 「出籤順序」由鏈上交易決定，而不是中心化伺服器的隨機函式。  
- 「可驗證性」由公開的 `txHash` 與固定演算法保證，真正做到可查、可重算、可追溯。
