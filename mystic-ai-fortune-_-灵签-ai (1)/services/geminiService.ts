import { FortuneResult, Language, WishCategory } from "../types";
import { getX402PaymentHeader } from "./paymentService";

export const interpretFortune = async (
  category: WishCategory,
  language: Language = "zh-CN",
  wishText?: string
): Promise<FortuneResult> => {
  const body = JSON.stringify({ category, language, wishText });
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // First attempt — server returns 402 requiring payment
  let res = await fetch("/api/fortune/interpret", { method: "POST", headers, body });

  // Handle x402 payment flow
  if (res.status === 402) {
    const paymentHeader = await getX402PaymentHeader(res);
    if (paymentHeader) {
      headers["X-PAYMENT"] = paymentHeader;
      res = await fetch("/api/fortune/interpret", { method: "POST", headers, body });
    } else {
      throw new Error("Payment required but signing failed");
    }
  }

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  return res.json();
};
