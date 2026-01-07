import { Card } from '../components/CardCarousel';
import { AccountWithStats } from '../services/accountService';

/**
 * Converts account data from API to Card format for UI display
 */
export const mapAccountToCard = (account: AccountWithStats): Card => ({
  id: account.id,
  type: account.type === 'credit' ? 'credit' : 'debit',
  balance: 0, // Not available from current API
  title: account.bank_name,
  bankName: account.bank_name,
  lastFourDigits: account.account_last_four,
  referenceNumber: account.id.substring(0, 12).toUpperCase(),
  cardBrand: 'visa' as const,
  income: account.income,
  expense: account.expense,
  savings: account.savings,
});

/**
 * Converts multiple accounts to Card array
 */
export const mapAccountsToCards = (accounts: AccountWithStats[]): Card[] => {
  return accounts.map(mapAccountToCard);
};
