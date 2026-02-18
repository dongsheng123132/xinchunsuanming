import { Language } from "./types";

export const TRANSLATIONS: Record<Language, {
  appTitle: string;
  whitepaperBtn: string;
  closeBtn: string;
  startBtn: string;
  
  categoryTitle: string;
  catCareer: string;
  catWealth: string;
  catLove: string;
  catHealth: string;
  catFamily: string;

  wishTitle: string;
  wishPlaceholder: string;
  wishNote: string;
  
  payTitle: string;
  payDesc: string;
  payBtn: string;
  processing: string;
  
  shakeTitle: string;
  shakeInstruction: (count: number) => string;
  shakeBtn: string;
  
  interpreting: string;
  
  resultTitle: string;
  luckLabel: string;
  poemLabel: string;
  explainLabel: string;
  adviceLabel: string;
  againBtn: string;
  
  footer: string;
  
  whitepaperTitle: string;
  whitepaperContent: string;

  saveImageBtn: string;
  copyLinkBtn: string;
  linkCopied: string;
  shareModalTitle: string;
  shareModalDesc: string;
}> = {
  en: {
    appTitle: "New Year Wish Sticks · Write your prayer on-chain with x402",
    whitepaperBtn: "Whitepaper",
    closeBtn: "Close",
    startBtn: "Enter Shrine",
    
    categoryTitle: "Choose a direction for your wish",
    catCareer: "Career & Growth",
    catWealth: "Wealth & Stability",
    catLove: "Love & Relationships",
    catHealth: "Health & Energy",
    catFamily: "Family & Safety",

    wishTitle: "Write down your New Year wish",
    wishPlaceholder: "For example: I hope to smoothly change my career this year and find work I truly enjoy.",
    wishNote: "This text will not be made public. It will be treated as your personal New Year prayer and used together with the three sticks to generate a more tailored blessing and guidance.",
    
    payTitle: "Offering of Sincerity",
    payDesc: "Offer 0.1 USDC via x402 to seal this wish on-chain.",
    payBtn: "Offer 0.1 USDC",
    processing: "Processing Offering...",
    
    shakeTitle: "Ask the Oracle",
    shakeInstruction: (count) => `Shake for Stick #${count} of 3`,
    shakeBtn: "Shake Cylinder",
    
    interpreting: "The AI Master is consulting the heavens...",
    
    resultTitle: "Oracle's Decree",
    luckLabel: "Fortune Level",
    poemLabel: "The Verse",
    explainLabel: "Interpretation",
    adviceLabel: "Guidance",
    againBtn: "Draw Again",
    
    footer: "© 2024 AI New Year Fortune · x402 Lucky Shrine",
    
    whitepaperTitle: "Whitepaper: AI New Year Fortune Stick · x402 Lucky Shrine",
    whitepaperContent: `
## Introduction

This is an **AI Fortune Oracle** built for the Lunar New Year. Users select a wish direction (Career, Wealth, Love, Health, Family), write a personal prayer, pay 0.1 USDC, and receive an exclusive fortune poem with interpretation and guidance from an AI Taoist master.

## Core Mechanism: Payment-Derived Fortune Sticks

Unlike traditional fortune-telling apps that use random numbers, our fortune sticks are **cryptographically derived from your payment transaction**. Each x402 payment contains a unique 32-byte nonce — the server extracts 3 stick numbers (1–100) from this nonce, ensuring:

- **One payment = One unique fortune** — no two payments yield the same sticks
- **Verifiable** — the stick numbers are deterministic from your payment proof
- **No pre-selection** — sticks are unknown until after you pay, just like a real temple

## x402 Payment Protocol

We use Coinbase's [x402 protocol](https://www.x402.org/) — an HTTP-native payment standard:

1. Client sends request → Server responds **HTTP 402** with payment requirements
2. Client signs an **EIP-3009 \`transferWithAuthorization\`** (gasless USDC signature on Base)
3. Client retries with \`X-PAYMENT\` header containing the signed authorization
4. Coinbase CDP Facilitator verifies and settles the payment on-chain
5. Server extracts stick numbers from payment nonce → AI interprets → returns fortune

**Key properties:**
- **Gasless** — users pay zero gas; payment is a pure signature
- **Base L2** — low cost, fast finality, Coinbase ecosystem
- **0.1 USDC per reading** — transparent, no subscriptions, no accounts

## AI Interpretation Engine

The AI master receives the 3 stick numbers, wish category, and personal prayer, then generates:

- **Fortune Poem (签诗)** — a 4-line classical Chinese poem
- **Luck Level (运势)** — overall fortune assessment
- **Explanation (详解)** — deep interpretation combining I Ching wisdom with modern context
- **Guidance (指点)** — actionable advice tailored to the user's wish

Supports three languages: Simplified Chinese, Traditional Chinese, and English.

## Agent-Native Design

This service is built for both humans and AI agents:

- **\`/skill.md\`** — AI-readable documentation following the skill doc standard
- **\`/llms.txt\`** — AI discoverability index (like robots.txt for LLMs)
- **Awal CLI** — one-command payment + fortune: \`npx awal x402 pay ...\`
- **PayLink** — shareable URL with category pre-selected

AI agents can discover, understand, pay, and consume this service autonomously.

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Vercel Serverless Functions |
| Payment | x402 + Coinbase CDP + EIP-3009 |
| AI | LLM API (OpenAI-compatible) |
| Chain | Base Mainnet (EIP-155:8453) |
| Token | USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

## Links

- Website: [xinchunsuanming.vercel.app](https://xinchunsuanming.vercel.app)
- Skill Doc: [xinchunsuanming.vercel.app/skill.md](https://xinchunsuanming.vercel.app/skill.md)
- Treasury: \`0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6\`
    `,

    saveImageBtn: "Save Image",
    copyLinkBtn: "Copy Link",
    linkCopied: "Link Copied!",
    shareModalTitle: "Save Your Fortune",
    shareModalDesc: "Long press the image below to save it to your photos, then share it with friends!",
  },
  'zh-CN': {
    appTitle: "新春心愿签 · 用 x402 为心愿上香",
    whitepaperBtn: "项目白皮书",
    closeBtn: "关闭",
    startBtn: "进入神坛",
    
    categoryTitle: "请选择本次祈愿的方向",
    catCareer: "事业前程",
    catWealth: "财运亨通",
    catLove: "姻缘情感",
    catHealth: "身体健康",
    catFamily: "阖家平安",

    wishTitle: "写下你的新春心愿",
    wishPlaceholder: "例如：希望今年顺利完成职业转型，找到更喜欢的工作。",
    wishNote: "这段话不会公开展示，但会与本次求签一起，被视作你写给这一年的认真祈愿。AI 解签时会结合「方向 + 心愿内容 + 三支签号」给出更贴近你当下状态的祝福与建议。",
    
    payTitle: "香火供奉",
    payDesc: "通过 x402 协议支付 0.1 USDC 香火钱，将这份心愿郑重立为新春祈愿。",
    payBtn: "支付 0.1 USDC",
    processing: "确认香火中...",
    
    shakeTitle: "诚心求籤",
    shakeInstruction: (count) => `摇出第 ${count} 支灵籤 (共3支)`,
    shakeBtn: "摇动籤筒",
    
    interpreting: "AI 大师正在解籤...",
    
    resultTitle: "新春籤文",
    luckLabel: "运势",
    poemLabel: "籤诗",
    explainLabel: "籤文详解",
    adviceLabel: "大师指点",
    againBtn: "再求一籤",
    
    footer: "© 2024 AI 新春福籤 · x402 开运小神坛",
    
    whitepaperTitle: "白皮书：AI 新春福签 · x402 开运小神坛",
    whitepaperContent: `
## 项目简介

这是一个为农历新年打造的 **AI 开运福签** 应用。用户选择心愿方向（事业、财运、感情、健康、阖家平安），写下新春祈愿，支付 0.1 USDC 香火钱，由 AI 道学大师为你抽签解签，送上专属签诗、运势、详解与行动指引。

## 核心机制：支付即求签

与传统随机签号不同，本应用的签号由 **支付凭证密码学推导** 而来。每次 x402 支付包含唯一的 32 字节 nonce（随机数），服务端从中提取 3 个签号（1–100），确保：

- **一次支付 = 一组唯一签文** — 不同支付永远不会抽到相同的签
- **可验证** — 签号由支付凭证确定性生成，透明可追溯
- **不可预知** — 签号在支付前未知，如同真实庙宇求签

## x402 支付协议

采用 Coinbase [x402 协议](https://www.x402.org/)，将支付嵌入 HTTP 协议层：

1. 客户端发起请求 → 服务端返回 **HTTP 402** 及支付要求
2. 客户端签署 **EIP-3009 \`transferWithAuthorization\`**（Base 链上 USDC 免 Gas 签名）
3. 客户端携带 \`X-PAYMENT\` 头重新请求
4. Coinbase CDP Facilitator 验证并完成链上结算
5. 服务端从支付 nonce 提取签号 → AI 解签 → 返回签文

**核心优势：**
- **零 Gas** — 用户无需支付 Gas 费，支付仅需一次签名
- **Base L2** — 低成本、高速确认、Coinbase 生态
- **0.1 USDC/次** — 透明按次收费，无需注册、无需订阅

## AI 解签引擎

AI 大师接收三支签号、心愿方向与祈愿文，生成：

- **签诗** — 四句古典诗词
- **运势等级** — 总体运势评定（上签/中签/下签）
- **签文详解** — 结合易经智慧与现代语境的深度解读
- **大师指点** — 针对用户心愿的具体行动建议

支持三种语言：简体中文、繁体中文、English

## Agent 原生设计

本服务同时面向人类用户和 AI Agent 设计：

- **\`/skill.md\`** — AI 可读的技能文档，遵循 skill doc 标准
- **\`/llms.txt\`** — AI 发现索引（类似 robots.txt，面向大模型）
- **Awal CLI** — 一条命令完成支付 + 求签：\`npx awal x402 pay ...\`
- **PayLink** — 可分享的支付链接，预选心愿方向

AI Agent 可以自主发现、理解、支付、调用本服务，无需人工介入。

## 技术架构

| 层级 | 技术方案 |
|------|---------|
| 前端 | React + Vite + Tailwind CSS |
| 后端 | Vercel Serverless Functions |
| 支付 | x402 + Coinbase CDP + EIP-3009 |
| AI | LLM API（OpenAI 兼容接口） |
| 链 | Base 主网 (EIP-155:8453) |
| 代币 | USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

## 相关链接

- 网站：[xinchunsuanming.vercel.app](https://xinchunsuanming.vercel.app)
- 技能文档：[xinchunsuanming.vercel.app/skill.md](https://xinchunsuanming.vercel.app/skill.md)
- 收款地址：\`0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6\`
    `,

    saveImageBtn: "生成分享图",
    copyLinkBtn: "复制链接",
    linkCopied: "链接已复制！",
    shareModalTitle: "保存您的福籤",
    shareModalDesc: "长按下方图片保存到相册，分享到朋友圈集赞祈福！",
  },
  'zh-TW': {
    appTitle: "新春心願籤 · 用 x402 為祈願上香",
    whitepaperBtn: "項目白皮書",
    closeBtn: "關閉",
    startBtn: "進入神壇",
    
    categoryTitle: "請選擇本次祈願的方向",
    catCareer: "事業前程",
    catWealth: "財運亨通",
    catLove: "姻緣情感",
    catHealth: "身體健康",
    catFamily: "闔家平安",

    wishTitle: "寫下你的新春心願",
    wishPlaceholder: "例如：希望今年順利完成職涯轉換，找到更喜歡的工作。",
    wishNote: "這段話不會公開展示，但會與本次求籤一起，被視作你寫給這一年的認真祈願。AI 解籤時會結合「方向 + 心願內容 + 三支籤號」給出更貼近你當下狀態的祝福與建議。",
    
    payTitle: "香火供奉",
    payDesc: "透過 x402 協議支付 0.1 USDC 香火錢，將這份心願鄭重立為新春祈願。",
    payBtn: "支付 0.1 USDC",
    processing: "確認香火中...",
    
    shakeTitle: "誠心求籤",
    shakeInstruction: (count) => `搖出第 ${count} 支靈籤 (共3支)`,
    shakeBtn: "搖動籤筒",
    
    interpreting: "AI 大師正在解籤...",
    
    resultTitle: "新春籤文",
    luckLabel: "運勢",
    poemLabel: "籤詩",
    explainLabel: "籤文詳解",
    adviceLabel: "大師指點",
    againBtn: "再求一籤",
    
    footer: "© 2024 AI 新春福籤 · x402 開運小神壇",
    
    whitepaperTitle: "白皮書：AI 新春福籤 · x402 開運小神壇",
    whitepaperContent: `
## 專案簡介

這是一個為農曆新年打造的 **AI 開運福籤** 應用。用戶選擇心願方向（事業、財運、感情、健康、闔家平安），寫下新春祈願，支付 0.1 USDC 香火錢，由 AI 道學大師為你抽籤解籤，送上專屬籤詩、運勢、詳解與行動指引。

## 核心機制：支付即求籤

與傳統隨機籤號不同，本應用的籤號由 **支付憑證密碼學推導** 而來。每次 x402 支付包含唯一的 32 位元組 nonce（隨機數），伺服端從中提取 3 個籤號（1–100），確保：

- **一次支付 = 一組唯一籤文** — 不同支付永遠不會抽到相同的籤
- **可驗證** — 籤號由支付憑證確定性生成，透明可追溯
- **不可預知** — 籤號在支付前未知，如同真實廟宇求籤

## x402 支付協議

採用 Coinbase [x402 協議](https://www.x402.org/)，將支付嵌入 HTTP 協議層：

1. 客戶端發起請求 → 伺服端返回 **HTTP 402** 及支付要求
2. 客戶端簽署 **EIP-3009 \`transferWithAuthorization\`**（Base 鏈上 USDC 免 Gas 簽名）
3. 客戶端攜帶 \`X-PAYMENT\` 頭重新請求
4. Coinbase CDP Facilitator 驗證並完成鏈上結算
5. 伺服端從支付 nonce 提取籤號 → AI 解籤 → 返回籤文

**核心優勢：**
- **零 Gas** — 用戶無需支付 Gas 費，支付僅需一次簽名
- **Base L2** — 低成本、高速確認、Coinbase 生態
- **0.1 USDC/次** — 透明按次收費，無需註冊、無需訂閱

## AI 解籤引擎

AI 大師接收三支籤號、心願方向與祈願文，生成：

- **籤詩** — 四句古典詩詞
- **運勢等級** — 總體運勢評定（上籤/中籤/下籤）
- **籤文詳解** — 結合易經智慧與現代語境的深度解讀
- **大師指點** — 針對用戶心願的具體行動建議

支援三種語言：簡體中文、繁體中文、English

## Agent 原生設計

本服務同時面向人類用戶和 AI Agent 設計：

- **\`/skill.md\`** — AI 可讀的技能文檔，遵循 skill doc 標準
- **\`/llms.txt\`** — AI 發現索引（類似 robots.txt，面向大模型）
- **Awal CLI** — 一條命令完成支付 + 求籤：\`npx awal x402 pay ...\`
- **PayLink** — 可分享的支付連結，預選心願方向

AI Agent 可以自主發現、理解、支付、調用本服務，無需人工介入。

## 技術架構

| 層級 | 技術方案 |
|------|---------|
| 前端 | React + Vite + Tailwind CSS |
| 後端 | Vercel Serverless Functions |
| 支付 | x402 + Coinbase CDP + EIP-3009 |
| AI | LLM API（OpenAI 相容介面） |
| 鏈 | Base 主網 (EIP-155:8453) |
| 代幣 | USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

## 相關連結

- 網站：[xinchunsuanming.vercel.app](https://xinchunsuanming.vercel.app)
- 技能文檔：[xinchunsuanming.vercel.app/skill.md](https://xinchunsuanming.vercel.app/skill.md)
- 收款地址：\`0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6\`
    `,

    saveImageBtn: "生成分享圖",
    copyLinkBtn: "複製連結",
    linkCopied: "連結已複製！",
    shareModalTitle: "保存您的福籤",
    shareModalDesc: "長按下方圖片保存到相冊，分享到朋友圈集贊祈福！",
  }
};
