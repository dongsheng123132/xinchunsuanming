/**
 * x402 Payment Test Client
 *
 * This script demonstrates the full x402 payment flow:
 * 1. Sends a POST request to the protected /api/fortune/interpret endpoint
 * 2. Receives a 402 Payment Required response
 * 3. Automatically signs a USDC transfer authorization (EIP-3009)
 * 4. Retries with the signed payment in X-PAYMENT header
 * 5. Receives the fortune interpretation
 *
 * Prerequisites:
 * - Server running at http://localhost:4021 with x402 enabled
 * - EVM_PRIVATE_KEY in .env (wallet with testnet USDC on Base Sepolia)
 * - Get testnet USDC: https://faucet.circle.com/
 *
 * Usage:
 *   npm run pay
 */

import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";

// Bypass local proxy for localhost requests
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

async function main() {
  const SERVER_URL = process.env.SERVER_URL || "http://localhost:4021";
  const privateKey = process.env.EVM_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ EVM_PRIVATE_KEY not set in .env");
    console.log("\nCreate a .env file with:");
    console.log("  EVM_PRIVATE_KEY=0xYourPrivateKey");
    console.log("\nMake sure this wallet has testnet USDC on Base Sepolia.");
    console.log("Get testnet USDC: https://faucet.circle.com/");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`🔑 Using wallet: ${account.address}`);
  console.log(`🌐 Server: ${SERVER_URL}`);

  // Lazy load x402 modules
  const { x402Client, wrapFetchWithPayment, x402HTTPClient } = await import(
    "@x402/fetch"
  );
  const { registerExactEvmScheme } = await import("@x402/evm/exact/client");

  // Create x402 client with EVM payment scheme
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });

  // Wrap fetch to handle 402 responses automatically
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  const body = {
    stickNumbers: [42, 17, 88],
    category: "career",
    language: "zh-CN",
  };

  console.log(`\n🔮 Drawing fortune sticks: [${body.stickNumbers}]`);
  console.log(`📋 Category: ${body.category}`);
  console.log(`🌏 Language: ${body.language}`);
  console.log(`\n💰 Sending request (will auto-pay 0.01 USDC via x402)...\n`);

  try {
    const response = await fetchWithPayment(
      `${SERVER_URL}/api/fortune/interpret`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Request failed: ${response.status} ${response.statusText}`
      );
      console.error(errorText);
      process.exit(1);
    }

    const result = await response.json();

    // Get payment receipt
    const httpClient = new x402HTTPClient(client);
    let paymentReceipt;
    try {
      paymentReceipt = httpClient.getPaymentSettleResponse(
        (name: string) => response.headers.get(name)
      );
    } catch {}

    console.log("✅ Fortune Interpretation Received!\n");
    console.log("═══════════════════════════════════════");
    console.log(`  签号 Sticks: ${result.stickNumbers?.join(", ")}`);
    console.log(`  运势 Luck:   ${result.overallLuck}`);
    console.log(`  签诗 Poem:`);
    result.mainPoem?.forEach((line: string) =>
      console.log(`    ${line}`)
    );
    console.log(`  解读 Explanation: ${result.explanation}`);
    console.log(`  建议 Advice: ${result.advice}`);
    console.log("═══════════════════════════════════════");

    if (paymentReceipt) {
      console.log("\n💳 Payment Receipt:");
      console.log(JSON.stringify(paymentReceipt, null, 2));
    }

    if (result.payer) {
      console.log(`\n👤 Payer: ${result.payer}`);
    }
    console.log(`⏰ Timestamp: ${result.timestamp}`);
    console.log(`💵 x402 Paid: ${result.x402_paid}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
