import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * x402-protected interpret endpoint (Vercel serverless version).
 *
 * On Vercel, full x402 Express middleware isn't available.
 * This redirects to the free endpoint for now.
 * For production x402, deploy the server/ Express app separately
 * (e.g., Railway, Render, or a VPS).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Import and delegate to the free endpoint handler
  const { default: freeHandler } = await import("./interpret-free");
  return freeHandler(req, res);
}
