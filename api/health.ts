import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    status: "ok",
    platform: "vercel",
    payment_address: process.env.PAYMENT_ADDRESS ? "configured" : "NOT SET",
    cdp_key: process.env.CDP_API_KEY_ID ? "configured" : "NOT SET",
    ai_key: process.env.AI_API_KEY ? "configured" : "NOT SET",
    network: process.env.NETWORK || "eip155:8453",
  });
}
