export enum AppState {
  IDLE = 'IDLE',
  CATEGORY_SELECT = 'CATEGORY_SELECT',
  PAYMENT = 'PAYMENT',
  SHAKING = 'SHAKING',
  INTERPRETING = 'INTERPRETING',
  RESULT = 'RESULT',
}

export type Language = 'en' | 'zh-CN' | 'zh-TW';

export type WishCategory = 'career' | 'wealth' | 'love' | 'health' | 'family';

export interface FortuneResult {
  stickNumbers: number[];
  mainPoem: string[]; // Combined or main poem
  overallLuck: string; // e.g., "Rising Dragon"
  explanation: string; // Detailed analysis of the 3 sticks
  advice: string; // Specific advice based on category
}

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}
