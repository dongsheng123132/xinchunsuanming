import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult, Language, WishCategory } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageInstruction = (lang: Language): string => {
  switch (lang) {
    case 'zh-CN': return "Simplified Chinese (简体中文).";
    case 'zh-TW': return "Traditional Chinese (繁體中文).";
    case 'en': return "English.";
    default: return "English";
  }
};

export const interpretFortune = async (stickNumbers: number[], category: WishCategory, language: Language = 'zh-CN'): Promise<FortuneResult> => {
  const model = "gemini-3-flash-preview";
  const langInstruction = getLanguageInstruction(language);
  
  const systemInstruction = `
    You are a wise, mystical I Ching and Taoist master for the Lunar New Year. 
    The user has drawn THREE fortune sticks (Chien Tung).
    Your task is to synthesize the meaning of these three sticks specifically regarding their wish: "${category}".
    
    Tone: Festive, encouraging, mystical, and wise.
    Output Language: ${langInstruction}
    
    Structure:
    1. A combined poem or the most significant poem of the three.
    2. An overall luck level (e.g., Upper-Upper, Medium-Flat).
    3. A detailed explanation combining the meanings.
    4. Actionable advice for the New Year.
  `;

  const prompt = `
    The user drew sticks: ${stickNumbers.join(', ')}.
    Wish Category: ${category}.
    
    Please output the fortune details strictly in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stickNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            mainPoem: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "The main poem associated with the result" 
            },
            overallLuck: { type: Type.STRING, description: "Overall luck level (e.g. 'Great Fortune')" },
            explanation: { type: Type.STRING, description: "Detailed interpretation" },
            advice: { type: Type.STRING, description: "Specific advice for the wish" }
          },
          required: ["stickNumbers", "mainPoem", "overallLuck", "explanation", "advice"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FortuneResult;
    }
    throw new Error("Empty response from Oracle");
  } catch (error) {
    console.error("Gemini Oracle Error:", error);
    // Fallback
    return {
      stickNumbers: stickNumbers,
      mainPoem: ["New Year brings new hope,", "Three stars shine from above.", "Peace in the heart remains,", "Prosperity flows with love."],
      overallLuck: "Lucky / 吉",
      explanation: "The stars are aligning. Though the details are misty, the general direction is positive.",
      advice: "Proceed with caution but optimism."
    };
  }
};