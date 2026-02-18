import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

type Language = "en" | "zh-CN" | "zh-TW";
type WishCategory = "career" | "wealth" | "love" | "health" | "family";

const getCategoryLabel = (cat: WishCategory, lang: Language): string => {
  const labels: Record<WishCategory, Record<Language, string>> = {
    career: { en: "Career & Success", "zh-CN": "事业前程", "zh-TW": "事業前程" },
    wealth: { en: "Wealth & Prosperity", "zh-CN": "财运亨通", "zh-TW": "財運亨通" },
    love: { en: "Love & Marriage", "zh-CN": "姻缘情感", "zh-TW": "姻緣情感" },
    health: { en: "Health & Well-being", "zh-CN": "身体健康", "zh-TW": "身體健康" },
    family: { en: "Family Safety", "zh-CN": "阖家平安", "zh-TW": "闔家平安" },
  };
  return labels[cat]?.[lang] || cat;
};

const getLangInstruction = (lang: Language) => {
  if (lang === "zh-CN") return "请用简体中文回答。";
  if (lang === "zh-TW") return "請用繁體中文回答。";
  return "Please respond in English.";
};

function fallback(stickNumbers: number[], language: Language) {
  return {
    stickNumbers,
    mainPoem:
      language === "en"
        ? ["New Year brings new hope,", "Three stars shine from above.", "Peace in the heart remains,", "Prosperity flows with love."]
        : ["新春迎新福，", "三星照九霄。", "心安万事顺，", "福运自来潮。"],
    overallLuck: language === "en" ? "Good Fortune" : "吉 · 上签",
    explanation:
      language === "en"
        ? "The stars are aligning in your favor. The general direction is positive and promising."
        : "三签合观，运势向好。虽前路迷蒙，但大方向吉利，宜稳步前行。",
    advice:
      language === "en"
        ? "Proceed with confidence and optimism. The new year favors those who take thoughtful action."
        : "宜怀信心与乐观之心前行。新年利于深思而行之人。",
    x402_paid: false,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { stickNumbers, category, language = "zh-CN", wishText } = req.body || {};

  if (!stickNumbers || !category) {
    return res.status(400).json({ error: "Missing stickNumbers or category" });
  }

  // If no AI key, return fallback
  if (!process.env.AI_API_KEY) {
    return res.json(fallback(stickNumbers, language));
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
    });

    const categoryLabel = getCategoryLabel(category, language);
    const wishContext = wishText ? `\nThe user also wrote a personal wish: "${wishText}"` : "";

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a wise Taoist master for Lunar New Year fortune interpretation.
The user drew THREE fortune sticks regarding "${categoryLabel}".
${getLangInstruction(language)}
Respond with valid JSON only: {"stickNumbers":[],"mainPoem":[],"overallLuck":"","explanation":"","advice":""}`,
        },
        {
          role: "user",
          content: `Sticks: ${stickNumbers.join(", ")}. Category: ${categoryLabel}.${wishContext}\nOutput JSON.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    let jsonText = text;
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) jsonText = m[1].trim();

    const result = JSON.parse(jsonText);
    result.stickNumbers = stickNumbers;
    result.x402_paid = false;
    return res.json(result);
  } catch (e) {
    console.error("AI error:", e);
    return res.json(fallback(stickNumbers, language));
  }
}
