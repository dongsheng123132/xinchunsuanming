import OpenAI from "openai";

export interface FortuneResult {
  stickNumbers: number[];
  mainPoem: string[];
  overallLuck: string;
  explanation: string;
  advice: string;
}

type Language = "en" | "zh-CN" | "zh-TW";
type WishCategory = "career" | "wealth" | "love" | "health" | "family";

const getLanguageInstruction = (lang: Language): string => {
  switch (lang) {
    case "zh-CN":
      return "请用简体中文回答 (Simplified Chinese)。";
    case "zh-TW":
      return "請用繁體中文回答 (Traditional Chinese)。";
    case "en":
      return "Please respond in English.";
    default:
      return "Please respond in English.";
  }
};

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

export async function interpretFortune(
  stickNumbers: number[],
  category: WishCategory,
  language: Language = "zh-CN"
): Promise<FortuneResult> {
  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
  });

  const langInstruction = getLanguageInstruction(language);
  const categoryLabel = getCategoryLabel(category, language);

  const systemPrompt = `You are a wise, mystical I Ching and Taoist master for the Lunar New Year.
The user has drawn THREE fortune sticks (Chien Tung).
Your task is to synthesize the meaning of these three sticks specifically regarding their wish: "${categoryLabel}".

Tone: Festive, encouraging, mystical, and wise. Bring good fortune and positive energy.
Output Language: ${langInstruction}

You MUST respond with valid JSON matching this exact schema:
{
  "stickNumbers": [array of the input stick numbers],
  "mainPoem": [array of 4 poem lines as strings],
  "overallLuck": "string - overall luck level (e.g. 'Great Fortune / 上上签', 'Good Fortune / 上签', etc.)",
  "explanation": "string - detailed interpretation combining the meanings of all three sticks",
  "advice": "string - specific actionable advice for the wish category"
}

IMPORTANT: Output ONLY the JSON object, no markdown code blocks, no extra text.`;

  const userPrompt = `The user drew sticks: ${stickNumbers.join(", ")}.
Wish Category: ${categoryLabel}.
Please output the fortune interpretation as JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from AI");

    // Try to parse, handling possible markdown code block wrapping
    let jsonText = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    const result = JSON.parse(jsonText) as FortuneResult;
    result.stickNumbers = stickNumbers; // Ensure correct stick numbers
    return result;
  } catch (error) {
    console.error("AI interpretation error:", error);
    // Fallback response
    return {
      stickNumbers,
      mainPoem:
        language === "en"
          ? [
              "New Year brings new hope,",
              "Three stars shine from above.",
              "Peace in the heart remains,",
              "Prosperity flows with love.",
            ]
          : [
              "新春迎新福，",
              "三星照九霄。",
              "心安万事顺，",
              "福运自来潮。",
            ],
      overallLuck: language === "en" ? "Lucky / Good Fortune" : "吉 · 上签",
      explanation:
        language === "en"
          ? "The stars are aligning in your favor. Though the path ahead holds mystery, the general direction is positive and promising."
          : "三签合观，运势向好。虽前路迷蒙，但大方向吉利，宜稳步前行。",
      advice:
        language === "en"
          ? "Proceed with confidence and optimism. The new year favors those who take thoughtful action."
          : "宜怀信心与乐观之心前行。新年利于深思而行之人。",
    };
  }
}
