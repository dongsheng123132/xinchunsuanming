import "dotenv/config";
import express from "express";
import cors from "cors";
import { interpretFortune, type FortuneResult } from "./fortune.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    exposedHeaders: [
      "x-payment-response",
      "X-PAYMENT-RESPONSE",
      "payment-required",
      "PAYMENT-REQUIRED",
    ],
  })
);

const PORT = parseInt(process.env.PORT || "4021");
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || "";
const NETWORK = process.env.NETWORK || "eip155:84532"; // Base Sepolia by default

// --- x402 middleware (lazy loaded to avoid crashes) ---
let x402Ready = false;
let x402Error: string | null = null;

async function initX402(app: express.Express) {
  try {
    if (!PAYMENT_ADDRESS || PAYMENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error("PAYMENT_ADDRESS not configured — set a real wallet address in server/.env");
    }

    // Lazy load all x402 modules (critical for deployment stability)
    const [
      { paymentMiddleware, x402ResourceServer },
      { ExactEvmScheme },
      { facilitator },
    ] = await Promise.all([
      import("@x402/express"),
      import("@x402/evm/exact/server"),
      import("@coinbase/x402"),
    ]);

    // Use Coinbase CDP facilitator (reads CDP_API_KEY_ID & CDP_API_KEY_SECRET from env)
    const server = new x402ResourceServer(facilitator).register(
      NETWORK,
      new ExactEvmScheme()
    );

    // Apply payment middleware to protected routes
    app.use(
      paymentMiddleware(
        {
          "POST /api/fortune/interpret": {
            accepts: [
              {
                scheme: "exact",
                price: "$0.01",
                network: NETWORK,
                payTo: PAYMENT_ADDRESS,
              },
            ],
            description: "AI Fortune Interpretation - Draw 3 sticks and get your Lunar New Year fortune",
            mimeType: "application/json",
          },
        },
        server
      )
    );

    x402Ready = true;
    console.log(`✅ x402 middleware ready (network: ${NETWORK}, payTo: ${PAYMENT_ADDRESS})`);
  } catch (e: any) {
    x402Error = e.message;
    console.error("⚠️  x402 init failed:", e.message);
    console.log("   Server will run without x402 payment protection.");
    console.log("   To enable x402, set in server/.env:");
    console.log("     PAYMENT_ADDRESS=0xYourWallet");
    console.log("     CDP_API_KEY_ID=xxx");
    console.log("     CDP_API_KEY_SECRET=xxx");
  }
}

// --- Routes ---

// Health / status endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    x402_ready: x402Ready,
    x402_error: x402Error,
    network: NETWORK,
    payTo: PAYMENT_ADDRESS || "(not set)",
    price: "$0.01 USDC",
  });
});

// Fortune interpretation endpoint (protected by x402 when configured)
app.post("/api/fortune/interpret", async (req, res) => {
  try {
    const { stickNumbers, category, language } = req.body;

    if (
      !stickNumbers ||
      !Array.isArray(stickNumbers) ||
      stickNumbers.length !== 3
    ) {
      res.status(400).json({ error: "stickNumbers must be an array of 3 numbers" });
      return;
    }
    if (!category) {
      res.status(400).json({ error: "category is required" });
      return;
    }

    console.log(
      `🔮 Interpreting fortune: sticks=[${stickNumbers}], category=${category}, lang=${language || "zh-CN"}`
    );

    const result: FortuneResult = await interpretFortune(
      stickNumbers,
      category,
      language || "zh-CN"
    );

    // Extract payer address from x402 payment header if available
    let payerAddress = "demo";
    try {
      const xPayment = req.headers["x-payment"] as string;
      if (xPayment) {
        const decoded = JSON.parse(Buffer.from(xPayment, "base64").toString());
        if (decoded?.authorization?.from) {
          payerAddress = decoded.authorization.from;
        }
      }
    } catch {}

    res.json({
      ...result,
      payer: payerAddress,
      x402_paid: x402Ready,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Fortune interpretation error:", error);
    res.status(500).json({ error: "Failed to interpret fortune" });
  }
});

// Free endpoint for testing (no payment required)
app.post("/api/fortune/interpret-free", async (req, res) => {
  try {
    const { stickNumbers, category, language } = req.body;

    if (
      !stickNumbers ||
      !Array.isArray(stickNumbers) ||
      stickNumbers.length !== 3
    ) {
      res.status(400).json({ error: "stickNumbers must be an array of 3 numbers" });
      return;
    }

    const result = await interpretFortune(
      stickNumbers,
      category || "career",
      language || "zh-CN"
    );

    res.json({ ...result, x402_paid: false });
  } catch (error: any) {
    console.error("Fortune interpretation error:", error);
    res.status(500).json({ error: "Failed to interpret fortune" });
  }
});

// --- Start server ---
async function start() {
  // Init x402 middleware first (before route handlers)
  await initX402(app);

  app.listen(PORT, () => {
    console.log(`\n🏮 Fortune x402 Server running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(
      `   Interpret (x402): POST http://localhost:${PORT}/api/fortune/interpret`
    );
    console.log(
      `   Interpret (free): POST http://localhost:${PORT}/api/fortune/interpret-free\n`
    );
  });
}

start();
