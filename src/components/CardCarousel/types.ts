export interface Card {
  id: string;
  type: 'credit' | 'debit';
  balance: number;
  title: string;
  bankName: string;
  lastFourDigits: string;
  referenceNumber?: string;
  cardBrand?: 'visa' | 'mastercard' | 'rupay';
  income?: number;
  expense?: number;
  savings?: number;
}
