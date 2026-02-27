---
name: ai-fortune-oracle
version: 1.2.0
description: AI Lunar New Year fortune oracle. Humans pay via Coinbase Commerce, AI agents pay via x402. 人类用 Coinbase Commerce 支付，AI 用 x402 支付。
homepage: https://xinchunsuanming.vercel.app
api_base: https://xinchunsuanming.vercel.app/api
auth: x402 (AI agents) / Coinbase Commerce (humans)
pricing: 0.01 USDC per reading
network: Base (eip155:8453)
treasury: "0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6"
usdc_contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
metadata: {"emoji":"🔮","category":"ai-service","min_price":"$0.01"}
---

# 🔮 AI Fortune Oracle — Skill Doc

> **TL;DR for AI Agents:** Pay 0.01 USDC via x402 on Base → get AI fortune reading. One command:
> ```
> npx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret -X POST -H "Content-Type: application/json" -d '{"category":"career","language":"zh-CN"}'
> ```

---

## What Is This

AI 新春福签 — a Lunar New Year fortune oracle. Pick a category, pay 0.01 USDC, get an AI Taoist master's interpretation with poem, luck level, explanation, and guidance.

**Two payment paths:**
- **Humans** → Coinbase Commerce checkout (website button)
- **AI Agents** → x402 protocol via Awal CLI (one command, pay + get result)

No payment, no fortune.

---

## For AI Agents: x402 Payment

> **⚠️ WARNING: Do NOT send USDC directly to the treasury address!**
> You MUST use the `npx awal x402 pay` command below. Direct transfers cannot be recognized by the API and funds will be lost. The x402 protocol handles payment automatically through HTTP 402 negotiation.

### Step 0: Create Wallet (If You Don't Have One)

```bash
npm install -g awal
npx awal auth login your-email@example.com
npx awal auth verify <FLOW_ID> <6_DIGIT_CODE>
npx awal address
npx awal balance
```

Need USDC? Get from https://faucet.circle.com/ (testnet) or buy on any exchange and bridge to Base.

### Step 1: Pay & Get Fortune (One Command)

```bash
npx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":"career","language":"zh-CN"}'
```

**Response (200 — after 0.01 USDC auto-settled):**
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

Stick numbers are derived from payment nonce — each payment = unique fortune.

---

## For Humans: Coinbase Commerce

Visit the website and click "Pay":

```
https://xinchunsuanming.vercel.app
```

Payment is processed by Coinbase Commerce. After payment, click "I've paid" to get your fortune.

---

## API Reference

### POST `/api/fortune/interpret` — x402 Protected (AI Agents)

**Price:** 0.01 USDC via x402 on Base

**Request:**
```bash
curl -X POST https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -H "Content-Type: application/json" \
  -d '{"category":"career","language":"zh-CN","wishText":"希望今年事业顺利"}'
```

**Parameters:**

| Param | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `category` | `string` | yes | `career`, `wealth`, `love`, `health`, `family` | `"career"` |
| `language` | `string` | no | `zh-CN` (default), `zh-TW`, `en` | `"zh-CN"` |
| `wishText` | `string` | no | Personal wish for tailored interpretation | `"希望今年..."` |

**402 Response (no payment):**
```
HTTP/1.1 402 Payment Required
X-Payment-Requirements: <base64 JSON>
```

**200 Response (after payment):**
```json
{
  "stickNumbers": [42, 17, 88],
  "mainPoem": ["line1", "line2", "line3", "line4"],
  "overallLuck": "中上 · 穩中有升",
  "explanation": "...",
  "advice": "...",
  "payer": "0x...",
  "x402_paid": true,
  "timestamp": "..."
}
```

**Errors:**

| Status | Cause |
|--------|-------|
| 400 | Missing category |
| 402 | No payment or invalid |
| 500 | AI error (returns fallback) |

### POST `/api/fortune/interpret-commerce` — Coinbase Commerce (Humans)

Same parameters and response format. No x402 required — payment handled by Coinbase Commerce separately.

### GET `/api/health`

```json
{"status": "ok", "platform": "vercel"}
```

### GET `/skill.md`

This document.

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

| | AI Agents (x402) | Humans (Commerce) |
|---|---|---|
| **Price** | 0.01 USDC | 0.01 USDC |
| **Method** | x402 EIP-3009 signature | Coinbase Commerce checkout |
| **Gas** | None (gasless) | None |
| **Network** | Base mainnet (8453) | Multiple (Commerce handles) |
| **Endpoint** | `/api/fortune/interpret` | `/api/fortune/interpret-commerce` |

**Treasury:** `0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6`
**USDC (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

---

## End-to-End Script (AI Agent)

```bash
#!/bin/bash
CATEGORY="career"  # career | wealth | love | health | family

RESULT=$(npx awal x402 pay \
  https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"$CATEGORY\",\"language\":\"zh-CN\"}")

echo "$RESULT" | jq .
echo "Sticks: $(echo $RESULT | jq -r '.stickNumbers | join(", ")')"
echo "Luck:   $(echo $RESULT | jq -r '.overallLuck')"
echo "Poem:   $(echo $RESULT | jq -r '.mainPoem[]')"
echo "Advice: $(echo $RESULT | jq -r '.advice')"
```

---

## API Summary

| Method | Endpoint | Auth | Price | Who |
|--------|----------|------|-------|-----|
| POST | `/api/fortune/interpret` | x402 | $0.01 | AI Agents |
| POST | `/api/fortune/interpret-commerce` | Commerce | $0.01 | Humans |
| GET | `/api/health` | none | free | All |
| GET | `/skill.md` | none | free | All |
