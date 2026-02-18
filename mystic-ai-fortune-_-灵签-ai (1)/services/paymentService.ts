import { PaymentSession } from "../types";

/**
 * Mocks the creation of a Coinbase Commerce charge.
 * In a real application, this would call your backend, which uses the 
 * Coinbase CDP SDK / Commerce API to create a charge securely.
 */
export const createPaymentSession = async (): Promise<PaymentSession> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    id: `charge_${Math.random().toString(36).substr(2, 9)}`,
    amount: 0.01,
    currency: 'USDC',
    status: 'pending'
  };
};

/**
 * Mocks checking the status of a payment.
 * In production, you would use Webhooks or polling against your backend.
 */
export const checkPaymentStatus = async (sessionId: string): Promise<'completed' | 'failed' | 'pending'> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // For demo purposes, we always succeed after the user clicks "I Paid"
  return 'completed';
};
