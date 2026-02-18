import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { charge_id, category, language = "zh-CN", wishText } = req.body || {};
    if (!charge_id) {
      return res.status(400).json({ error: "Missing charge_id" });
    }
    if (!category) {
      return res.status(400).json({ error: "Missing category" });
    }

    // Verify Commerce charge is actually paid
    const apiKey = process.env.COMMERCE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Commerce API key not configured" });
    }

    const chargeRes = await fetch(`https://api.commerce.coinbase.com/charges/${charge_id}`, {
      headers: {
        "X-CC-Api-Key": apiKey,
        "X-CC-Version": "2018-03-22",
      },
    });

    if (!chargeRes.ok) {
      console.error("Commerce verify error:", chargeRes.status, await chargeRes.text());
      return res.status(400).json({ error: "Invalid charge_id" });
    }

    const chargeData = await chargeRes.json();
    const charge = chargeData.data;

    // Check payment status from timeline
    const timeline = charge.timeline || [];
    const isPaid = timeline.some(
      (ev: { status: string }) => ev.status === "COMPLETED" || ev.status === "RESOLVED"
    );

    if (!isPaid) {
      return res.status(402).json({
        error: "Payment not completed",
        status: timeline[timeline.length - 1]?.status || "UNKNOWN",
        message: language === "zh-CN"
          ? "尚未检测到支付，请先在 Coinbase Commerce 完成支付"
          : language === "zh-TW"
          ? "尚未偵測到支付，請先在 Coinbase Commerce 完成支付"
          : "Payment not detected. Please complete payment in Coinbase Commerce first.",
      });
    }

    // Derive stick numbers from charge code (deterministic per payment)
    const chargeCode = charge.code || charge_id;
    let hash = 0;
    for (let i = 0; i < chargeCode.length; i++) {
      hash = ((hash << 5) - hash + chargeCode.charCodeAt(i)) | 0;
    }
    const stickNumbers = [
      (Math.abs(hash) % 100) + 1,
      (Math.abs(hash >> 8) % 100) + 1,
      (Math.abs(hash >> 16) % 100) + 1,
    ];

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
      result.commerce_paid = true;
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
        commerce_paid: true,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
