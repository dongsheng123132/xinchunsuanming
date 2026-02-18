---
name: ai-fortune-oracle
version: 1.1.0
description: Pay 0.1 USDC via x402, get AI-powered Lunar New Year fortune interpretation. Stick numbers derived from payment hash. 支付 0.1 USDC，签号由支付凭证生成，AI 大师解签。
homepage: https://xinchunsuanming.vercel.app
api_base: https://xinchunsuanming.vercel.app/api
auth: x402
pricing: 0.1 USDC per reading
network: Base (eip155:8453)
treasury: "0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6"
usdc_contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
metadata: {"emoji":"🔮","category":"ai-service","min_price":"$0.10"}
---

# 🔮 AI Fortune Oracle — Skill Doc

> **TL;DR for AI Agents:** Pay 0.1 USDC on Base → get AI fortune reading. Stick numbers are automatically derived from your payment hash. One command:
> ```
> npx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret -X POST -H "Content-Type: application/json" -d '{"category":"career","language":"zh-CN"}'
> ```

---

## What Is This

AI 新春福签 is a Lunar New Year fortune oracle. You pick a category, pay 0.1 USDC, and the server derives 3 unique fortune stick numbers from your payment transaction nonce. An AI Taoist master then interprets your fortune with a poem, luck level, explanation, and advice. Every reading costs **0.1 USDC** via x402 on **Base mainnet** — no payment, no fortune. The AI only speaks after receiving your offering.

---

## Step 0: Create Wallet (If You Don't Have One)

```bash
# Install Awal CLI
npm install -g awal

# Create wallet & login
npx awal auth login your-email@example.com

# Check the verification email, then verify
npx awal auth verify <FLOW_ID> <6_DIGIT_CODE>

# View your wallet address
npx awal address

# Check balance (need ≥0.1 USDC on Base)
npx awal balance
```

Need testnet/mainnet USDC? Get from https://faucet.circle.com/ (testnet) or buy on any exchange and bridge to Base.

---

## Step 1: Draw Fortune (Quick Action — Copy & Run)

```bash
npx awal x402 pay https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":"career","language":"zh-CN"}'
```

**Response (200 — after 0.1 USDC payment auto-settled):**
```json
{
  "stickNumbers": [42, 17, 88],
  "mainPoem": [
    "新歲啟程風漸暖，",
    "三星隱現護前程。",
    "心安處處皆為福，",
    "但憑腳步踏實行。"
  ],
  "overallLuck": "中上 · 穩中有升",
  "explanation": "三签合观，运势向好。虽前路迷蒙，但大方向吉利，宜稳步前行。",
  "advice": "宜怀信心与乐观之心前行。新年利于深思而行之人。",
  "payer": "0x1234...abcd",
  "x402_paid": true,
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

> **Note:** `stickNumbers` in the response are derived from your payment nonce — each payment produces a unique set of fortune sticks.

---

## Complete API Reference

### POST `/api/fortune/interpret` (x402 Protected — 0.1 USDC)

The main endpoint. Returns 402 if no payment, 200 with fortune after payment verified. Stick numbers are derived server-side from the payment transaction nonce.

**Request:**
```bash
curl -X POST https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -H "Content-Type: application/json" \
  -d '{
    "category": "career",
    "language": "zh-CN",
    "wishText": "希望今年顺利完成职业转型"
  }'
```

**Parameters:**

| Param | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `category` | `string` | yes | One of: `career`, `wealth`, `love`, `health`, `family` | `"career"` |
| `language` | `string` | no | `zh-CN` (default), `zh-TW`, `en` | `"zh-CN"` |
| `wishText` | `string` | no | Personal wish for tailored interpretation | `"希望今年..."` |

**Response (200 OK):**
```json
{
  "stickNumbers": [42, 17, 88],
  "mainPoem": ["line1", "line2", "line3", "line4"],
  "overallLuck": "中上 · 穩中有升",
  "explanation": "详细解读...",
  "advice": "具体建议...",
  "payer": "0x1234...abcd",
  "x402_paid": true,
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

**Response (402 Payment Required — no X-PAYMENT header):**
```
HTTP/1.1 402 Payment Required
X-Payment-Requirements: <base64 encoded JSON>
```

Decoded `X-Payment-Requirements`:
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

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | `invalid_request` | Missing category field |
| 402 | `payment_required` | No X-PAYMENT header or payment invalid |
| 500 | `server_error` | AI service unavailable (returns fallback fortune) |

---

### GET `/api/health`

**Request:**
```bash
curl https://xinchunsuanming.vercel.app/api/health
```

**Response:**
```json
{"status": "ok", "platform": "vercel", "x402_ready": false}
```

---

### GET `/api/skill` or `/skill.md`

Returns this skill documentation in Markdown format.

```bash
curl https://xinchunsuanming.vercel.app/skill.md
```

---

## Categories

| Value | 中文 | English | What It Covers |
|-------|------|---------|----------------|
| `career` | 事业前程 | Career & Growth | Job, promotion, business |
| `wealth` | 财运亨通 | Wealth & Stability | Money, investment, income |
| `love` | 姻缘情感 | Love & Relationships | Romance, marriage, dating |
| `health` | 身体健康 | Health & Energy | Physical/mental wellness |
| `family` | 阖家平安 | Family & Safety | Family harmony, children |

---

## Payment Details

| Parameter | Value |
|-----------|-------|
| **Price** | 0.1 USDC (100000 in 6-decimal units) |
| **Network** | Base mainnet (eip155:8453, chainId 8453) |
| **USDC Contract** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **Treasury Address** | `0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6` |
| **Protocol** | x402 — EIP-3009 `transferWithAuthorization` |
| **Gas Fee** | None — payment is a gasless signature |
| **Facilitator** | Coinbase CDP (auto-settled on-chain) |
| **Stick Numbers** | Derived from payment nonce (unique per transaction) |

---

## End-to-End Example Script

```bash
#!/bin/bash
# === AI Fortune Oracle — Full Flow ===

# 0. Setup wallet (skip if already have one)
# npm install -g awal
# npx awal auth login you@email.com
# npx awal auth verify <FLOW_ID> <CODE>

# 1. Check balance
echo "=== Checking wallet ==="
npx awal balance

# 2. Pick a category
CATEGORY="career"  # career | wealth | love | health | family
echo "=== Category: $CATEGORY ==="

# 3. Pay 0.1 USDC and get fortune (one command)
# Stick numbers are derived from your payment — no need to specify them!
RESULT=$(npx awal x402 pay \
  https://xinchunsuanming.vercel.app/api/fortune/interpret \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"$CATEGORY\",\"language\":\"zh-CN\"}")

echo "=== Fortune Result ==="
echo "$RESULT" | jq .

# 4. Extract key fields
echo ""
echo "Sticks:  $(echo $RESULT | jq -r '.stickNumbers | join(", ")')"
echo "Luck:    $(echo $RESULT | jq -r '.overallLuck')"
echo "Poem:    $(echo $RESULT | jq -r '.mainPoem[]')"
echo "Advice:  $(echo $RESULT | jq -r '.advice')"
echo "Paid:    $(echo $RESULT | jq -r '.x402_paid')"
```

---

## Node.js / TypeScript Integration

```typescript
import { privateKeyToAccount } from "viem/accounts";

// Setup x402 auto-payment client
const { x402Client, wrapFetchWithPayment } = await import("@x402/fetch");
const { registerExactEvmScheme } = await import("@x402/evm/exact/client");

const account = privateKeyToAccount("0xYOUR_PRIVATE_KEY");
const client = new x402Client();
registerExactEvmScheme(client, { signer: account });
const pay = wrapFetchWithPayment(fetch, client);

// Draw fortune — auto-pays 0.1 USDC on 402
// No need to specify stickNumbers — they're derived from your payment!
const res = await pay("https://xinchunsuanming.vercel.app/api/fortune/interpret", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    category: "career",
    language: "zh-CN",
    wishText: "希望今年事业顺利",
  }),
});

const fortune = await res.json();
console.log(`Sticks: ${fortune.stickNumbers.join(", ")}`);
console.log(fortune.mainPoem.join("\n"));
```

---

## API Summary Table

| Method | Endpoint | Auth | Price | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/fortune/interpret` | x402 | $0.10 | AI fortune interpretation (stick numbers from payment) |
| GET | `/api/health` | none | free | Service health check |
| GET | `/api/skill` | none | free | This skill documentation |
| GET | `/skill.md` | none | free | This skill documentation (static) |
