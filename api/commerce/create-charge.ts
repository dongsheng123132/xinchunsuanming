import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Creates a Coinbase Commerce charge ($0.10 USDC).
 * Returns the hosted_url for the user to pay, and charge_id to verify later.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.COMMERCE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Commerce API key not configured" });
  }

  const { category, language } = req.body || {};

  try {
    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": apiKey,
        "X-CC-Version": "2018-03-22",
      },
      body: JSON.stringify({
        name: "AI Fortune Oracle",
        description: `AI 新春福签 — ${category || "fortune"} (${language || "zh-CN"})`,
        pricing_type: "fixed_price",
        local_price: {
          amount: "0.10",
          currency: "USD",
        },
        metadata: {
          category: category || "career",
          language: language || "zh-CN",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Commerce API error:", response.status, errText);
      return res.status(502).json({ error: "Failed to create charge" });
    }

    const data = await response.json();
    const charge = data.data;

    return res.json({
      charge_id: charge.id,
      charge_code: charge.code,
      hosted_url: charge.hosted_url,
      expires_at: charge.expires_at,
    });
  } catch (err: any) {
    console.error("Create charge error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
