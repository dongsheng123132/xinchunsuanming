---
name: ai-fortune-x402
version: 1.0.0
description: AI 新春福签解签服务 — 支付 0.1 USDC 通过 x402 协议，AI 大师为你抽签解签。Pay 0.1 USDC via x402 and get your Lunar New Year fortune interpreted by AI.
homepage: https://xinchunsuanming.vercel.app
metadata: {"emoji":"🔮","category":"ai-service","api_base":"https://xinchunsuanming.vercel.app/api","price":"0.1 USDC","network":"Base"}
---

# 🔮 AI 新春福签 · x402 Fortune Stick Oracle

Draw 3 fortune sticks and receive an AI-powered Lunar New Year fortune interpretation. Every reading costs **0.1 USDC** via the x402 payment protocol on Base chain.

**Base URL:** `https://xinchunsuanming.vercel.app`

---

## How It Works

1. **Pay 0.1 USDC** → AI Master interprets your fortune
2. **No payment = No interpretation** — the oracle only speaks after receiving your offering
3. Payment is gasless (EIP-3009 signature, settled by facilitator)

---

## Quick Start (AI Agent)

### Option A: Awal CLI (Recommended for Agents)

```bash
# Install Awal
npm install awal

# Login & setup wallet
npx awal auth login your-email@example.com
npx awal auth verify <Flow_ID> <code>

# Check balance (need ≥0.1 USDC on Base)
npx awal balance

# Pay & get fortune in one command
npx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"stickNumbers":[42,17,88],"category":"career","language":"zh-CN"}'
```

### Option B: Direct x402 HTTP Flow

```bash
# Step 1: Call endpoint → get 402 Payment Required
curl -s -X POST https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -H "Content-Type: application/json" \
  -d '{"stickNumbers":[42,17,88],"category":"career","language":"zh-CN"}'

# Response: HTTP 402
# Header: X-Payment-Requirements (base64 JSON with payment details)

# Step 2: Sign EIP-3009 transferWithAuthorization for 0.1 USDC
# Step 3: Retry with X-PAYMENT header containing signed payment
curl -s -X POST https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64-encoded-payment>" \
  -d '{"stickNumbers":[42,17,88],"category":"career","language":"zh-CN"}'
```

### Option C: Browser (Human Users)

Visit the website, connect MetaMask/Coinbase Wallet, and draw fortune sticks:
```
https://xinchunsuanming.vercel.app
```

---

## API Reference

### POST `/api/fortune/interpret` (x402 Protected — 0.1 USDC)

**Request Body:**
```json
{
  "stickNumbers": [42, 17, 88],
  "category": "career",
  "language": "zh-CN",
  "wishText": "希望今年顺利完成职业转型"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stickNumbers` | `number[]` | Yes | Array of exactly 3 numbers (1-100) |
| `category` | `string` | Yes | One of: `career`, `wealth`, `love`, `health`, `family` |
| `language` | `string` | No | `zh-CN` (default), `zh-TW`, or `en` |
| `wishText` | `string` | No | Personal wish for more tailored interpretation |

**Response (200 OK — after payment verified):**
```json
{
  "stickNumbers": [42, 17, 88],
  "mainPoem": ["新歲啟程風漸暖，", "三星隱現護前程。", "心安處處皆為福，", "但憑腳步踏實行。"],
  "overallLuck": "中上 · 穩中有升",
  "explanation": "三签合观，运势向好。虽前路迷蒙，但大方向吉利，宜稳步前行。",
  "advice": "宜怀信心与乐观之心前行。新年利于深思而行之人。",
  "payer": "0x1234...abcd",
  "x402_paid": true,
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

**Response (402 Payment Required — no payment):**
```
HTTP 402
X-Payment-Requirements: <base64 JSON>
```

The `X-Payment-Requirements` header decodes to:
```json
[{
  "scheme": "exact",
  "network": "eip155:8453",
  "maxAmountRequired": "100000",
  "payTo": "0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6",
  "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "description": "AI Fortune Interpretation - 0.1 USDC"
}]
```

### POST `/api/fortune/interpret-free` (No Payment)

Same request/response format but free. Returns `"x402_paid": false`. For testing only.

### GET `/api/health`

```json
{"status": "ok", "x402_ready": true}
```

---

## Categories

| Value | 中文 | English |
|-------|------|---------|
| `career` | 事业前程 | Career & Growth |
| `wealth` | 财运亨通 | Wealth & Stability |
| `love` | 姻缘情感 | Love & Relationships |
| `health` | 身体健康 | Health & Energy |
| `family` | 阖家平安 | Family & Safety |

---

## Payment Details

| Parameter | Value |
|-----------|-------|
| **Price** | 0.1 USDC |
| **Network** | Base (eip155:8453) |
| **USDC Contract** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **Treasury** | `0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6` |
| **Protocol** | x402 (EIP-3009 transferWithAuthorization) |
| **Gas** | None — payment is a gasless signature |

---

## Integration Example (Node.js)

```typescript
import { privateKeyToAccount } from "viem/accounts";

// Setup x402 client
const { x402Client, wrapFetchWithPayment } = await import("@x402/fetch");
const { registerExactEvmScheme } = await import("@x402/evm/exact/client");

const account = privateKeyToAccount("0xYOUR_PRIVATE_KEY");
const client = new x402Client();
registerExactEvmScheme(client, { signer: account });
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Draw fortune (auto-pays 0.1 USDC)
const res = await fetchWithPayment("https://xinchunsuanming.vercel.app/api/fortune/interpret", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stickNumbers: [42, 17, 88],
    category: "career",
    language: "zh-CN",
    wishText: "希望今年事业顺利"
  }),
});

const fortune = await res.json();
console.log(fortune.mainPoem.join("\n"));
console.log(`运势: ${fortune.overallLuck}`);
```

---

## For AgentVerse Grid Integration

Register this service on the AgentVerse grid to let other agents discover you:

```bash
curl -X PUT https://www.agent-verse.live/api/cells/update \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔮 AI Fortune Oracle",
    "summary": "Pay 0.1 USDC, draw 3 sticks, get AI fortune interpretation",
    "fill_color": "#8A0000",
    "content_url": "https://xinchunsuanming.vercel.app",
    "iframe_url": "https://xinchunsuanming.vercel.app",
    "markdown": "## 🔮 AI 新春福签\n\nDraw fortune sticks and receive AI-powered Lunar New Year interpretation.\n\n### API\n- `POST /api/fortune/interpret` — 0.1 USDC via x402\n- Categories: career, wealth, love, health, family\n- Languages: zh-CN, zh-TW, en\n\n### Quick Test\n```\nnpx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret -X POST -d {\"stickNumbers\":[42,17,88],\"category\":\"career\"}\n```"
  }'
```
