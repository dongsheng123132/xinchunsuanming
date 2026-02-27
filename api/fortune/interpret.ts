import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    exposedHeaders: [
      "x-payment-response",
      "X-PAYMENT-RESPONSE",
      "x-payment-requirements",
      "X-PAYMENT-REQUIREMENTS",
    ],
  })
);

let initPromise: Promise<void> | null = null;

async function ensureInit() {
  if (!initPromise) {
    initPromise = doInit();
  }
  return initPromise;
}

async function doInit() {
  const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS;
  const NETWORK = process.env.NETWORK || "eip155:8453";

  if (PAYMENT_ADDRESS && PAYMENT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    try {
      const [
        { paymentMiddleware, x402ResourceServer },
        { ExactEvmScheme },
        { facilitator },
      ] = await Promise.all([
        import("@x402/express"),
        import("@x402/evm/exact/server"),
        import("@coinbase/x402"),
      ]);

      const server = new x402ResourceServer(facilitator).register(
        NETWORK,
        new ExactEvmScheme()
      );

      app.use(
        paymentMiddleware(
          {
            "POST /api/fortune/interpret": {
              accepts: [
                {
                  scheme: "exact",
                  price: "$0.01",
                  network: NETWORK,
                  payTo: PAYMENT_ADDRESS,
                },
              ],
              description: "AI Fortune Interpretation - 0.01 USDC",
              mimeType: "application/json",
            },
          },
          server
        )
      );
      console.log(`x402 ready: network=${NETWORK}, payTo=${PAYMENT_ADDRESS}`);
    } catch (e: any) {
      console.error("x402 init failed:", e.message);
    }
  }

  // Route handler (runs after x402 middleware verifies payment)
  app.post("/api/fortune/interpret", async (req, res) => {
    try {
      const { category, language = "zh-CN", wishText } = req.body || {};
      if (!category) {
        return res.status(400).json({ error: "Missing category" });
      }

      // Extract payer and derive stick numbers from x402 payment nonce
      let payer = "unknown";
      let stickNumbers: number[] = [];
      try {
        const xPayment = req.headers["x-payment"] as string;
        if (xPayment) {
          const decoded = JSON.parse(Buffer.from(xPayment, "base64").toString());
          // Extract payer address
          if (decoded?.payload?.authorization?.from) payer = decoded.payload.authorization.from;
          else if (decoded?.authorization?.from) payer = decoded.authorization.from;
          // Derive stick numbers from payment nonce (unique per payment)
          const nonce = decoded?.payload?.authorization?.nonce || decoded?.authorization?.nonce || "";
          const hex = nonce.replace("0x", "");
          if (hex.length >= 24) {
            stickNumbers = [
              (parseInt(hex.slice(0, 8), 16) % 100) + 1,
              (parseInt(hex.slice(8, 16), 16) % 100) + 1,
              (parseInt(hex.slice(16, 24), 16) % 100) + 1,
            ];
          }
        }
      } catch {}
      // Fallback if nonce parsing failed
      if (stickNumbers.length !== 3) {
        const seed = Date.now();
        stickNumbers = [
          (seed % 100) + 1,
          ((seed >> 8) % 100) + 1,
          ((seed >> 16) % 100) + 1,
        ];
      }

      // Call AI
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({
        apiKey: process.env.AI_API_KEY,
        baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
      });

      const categoryLabels: Record<string, Record<string, string>> = {
        career: { en: "Career", "zh-CN": "事业前程", "zh-TW": "事業前程" },
        wealth: { en: "Wealth", "zh-CN": "财运亨通", "zh-TW": "財運亨通" },
        love: { en: "Love", "zh-CN": "姻缘情感", "zh-TW": "姻緣情感" },
        health: { en: "Health", "zh-CN": "身体健康", "zh-TW": "身體健康" },
        family: { en: "Family", "zh-CN": "阖家平安", "zh-TW": "闔家平安" },
      };
      const catLabel = categoryLabels[category]?.[language] || category;
      const langInst =
        language === "zh-CN" ? "请用简体中文回答。" :
        language === "zh-TW" ? "請用繁體中文回答。" :
        "Please respond in English.";
      const wishContext = wishText ? `\nUser's personal wish: "${wishText}"` : "";

      try {
        const aiRes = await client.chat.completions.create({
          model: process.env.AI_MODEL || "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a wise Taoist master for Lunar New Year fortune interpretation.
The user drew THREE fortune sticks regarding "${catLabel}".
${langInst}
Respond with valid JSON only: {"mainPoem":["line1","line2","line3","line4"],"overallLuck":"","explanation":"","advice":""}`,
            },
            {
              role: "user",
              content: `Sticks: ${stickNumbers.join(", ")}. Category: ${catLabel}.${wishContext}\nOutput JSON.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 1024,
        });

        const text = aiRes.choices[0]?.message?.content?.trim() || "";
        let jsonText = text;
        const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (m) jsonText = m[1].trim();

        const result = JSON.parse(jsonText);
        result.stickNumbers = stickNumbers;
        result.payer = payer;
        result.x402_paid = true;
        result.timestamp = new Date().toISOString();
        return res.json(result);
      } catch (aiErr) {
        console.error("AI error:", aiErr);
        return res.json({
          stickNumbers,
          mainPoem: language === "en"
            ? ["New Year brings new hope,", "Three stars shine from above.", "Peace in the heart remains,", "Prosperity flows with love."]
            : ["新春迎新福，", "三星照九霄。", "心安万事顺，", "福运自来潮。"],
          overallLuck: language === "en" ? "Good Fortune" : "吉 · 上签",
          explanation: language === "en"
            ? "The stars align in your favor. The direction is positive and promising."
            : "三签合观，运势向好。大方向吉利，宜稳步前行。",
          advice: language === "en"
            ? "Proceed with confidence. The new year favors thoughtful action."
            : "宜怀信心与乐观之心前行。新年利于深思而行之人。",
          payer,
          x402_paid: true,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Handler error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureInit();
  return new Promise<void>((resolve) => {
    res.on("finish", resolve);
    app(req as any, res as any);
  });
}
