import { createWalletClient, custom, parseUnits, type WalletClient, type Address } from "viem";
import { baseSepolia, base } from "viem/chains";
import { PaymentSession } from "../types";

let connectedAddress: Address | null = null;

/** Connect browser wallet (MetaMask / Coinbase Wallet) */
export const createPaymentSession = async (): Promise<PaymentSession> => {
  if (!(window as any).ethereum) {
    throw new Error("No wallet detected. Please install MetaMask or Coinbase Wallet.");
  }

  const ethereum = (window as any).ethereum;
  const [address] = await ethereum.request({ method: "eth_requestAccounts" });
  connectedAddress = address as Address;

  return {
    id: `wallet_${connectedAddress.slice(0, 10)}`,
    amount: 0.1,
    currency: "USDC",
    status: "completed",
  };
};

/** For backward compat — wallet connection is instant */
export const checkPaymentStatus = async (_sessionId: string): Promise<"completed"> => {
  return "completed";
};

/**
 * Handle x402 402 response: parse requirements, sign EIP-3009, return X-PAYMENT header.
 * Returns null if wallet not connected or signing fails.
 */
export const getX402PaymentHeader = async (response402: Response): Promise<string | null> => {
  try {
    // Parse payment requirements from header
    const reqHeader = response402.headers.get("x-payment-requirements");
    if (!reqHeader) {
      console.error("No x-payment-requirements header in 402 response");
      return null;
    }

    const requirements = JSON.parse(atob(reqHeader));
    const req = Array.isArray(requirements) ? requirements[0] : requirements;

    // Ensure wallet is connected
    if (!connectedAddress) {
      await createPaymentSession();
      if (!connectedAddress) return null;
    }

    // Determine chain from server requirements
    const chainId = req.network === "eip155:8453" ? 8453 : 84532;
    const chain = chainId === 8453 ? base : baseSepolia;
    const usdcAddress = req.asset || (chainId === 8453
      ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      : "0x036CbD53842c5426634e7929541eC2318f3dCF7e");

    // Switch wallet to correct chain
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchErr: any) {
      // If chain not added, try to add it
      if (switchErr.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: chainId === 8453 ? "Base" : "Base Sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [chainId === 8453 ? "https://mainnet.base.org" : "https://sepolia.base.org"],
            blockExplorerUrls: [chainId === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org"],
          }],
        });
      }
    }

    // Create wallet client with correct chain
    const walletClient = createWalletClient({
      account: connectedAddress,
      chain,
      transport: custom((window as any).ethereum),
    });

    // Build EIP-3009 transferWithAuthorization params
    const payTo = req.payTo as Address;
    const value = parseUnits(
      req.maxAmountRequired
        ? (Number(req.maxAmountRequired) / 1e6).toString()
        : req.price?.replace("$", "") || "0.1",
      6
    );
    const validAfter = BigInt(0);
    const validBefore = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;

    // Sign EIP-712 typed data for transferWithAuthorization
    const signature = await walletClient.signTypedData({
      account: connectedAddress,
      domain: {
        name: "USD Coin",
        version: "2",
        chainId: BigInt(chainId),
        verifyingContract: usdcAddress as Address,
      },
      types: {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: connectedAddress,
        to: payTo,
        value,
        validAfter,
        validBefore,
        nonce,
      },
    });

    // Build x402 payment payload
    const payload = {
      x402Version: 1,
      scheme: "exact",
      network: req.network || `eip155:${chainId}`,
      payload: {
        signature,
        authorization: {
          from: connectedAddress,
          to: payTo,
          value: value.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce,
        },
      },
    };

    return btoa(JSON.stringify(payload));
  } catch (err) {
    console.error("x402 payment signing failed:", err);
    return null;
  }
};
