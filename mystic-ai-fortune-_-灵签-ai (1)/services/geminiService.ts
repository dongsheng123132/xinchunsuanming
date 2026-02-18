import { FortuneResult, Language, WishCategory } from "../types";
import { getX402PaymentHeader } from "./paymentService";

export const interpretFortune = async (
  stickNumbers: number[],
  category: WishCategory,
  language: Language = "zh-CN",
  wishText?: string
): Promise<FortuneResult> => {
  const body = JSON.stringify({ stickNumbers, category, language, wishText });
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // First attempt — server may return 402 if x402 is enabled
  let res = await fetch("/api/fortune/interpret", { method: "POST", headers, body });

  // Handle x402 payment flow
  if (res.status === 402) {
    const paymentHeader = await getX402PaymentHeader(res);
    if (paymentHeader) {
      headers["X-PAYMENT"] = paymentHeader;
      res = await fetch("/api/fortune/interpret", { method: "POST", headers, body });
    }
  }

  if (!res.ok) {
    // Fallback: try the free endpoint
    const freeRes = await fetch("/api/fortune/interpret-free", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (freeRes.ok) return freeRes.json();
    throw new Error(`Server error: ${res.status}`);
  }

  return res.json();
};
