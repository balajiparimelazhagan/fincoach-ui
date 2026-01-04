import { useState, useCallback, useEffect } from 'react';
import { accountService, AccountWithStats } from '../services/accountService';

export const useAccounts = (dateFrom?: string, dateTo?: string) => {
  const [accounts, setAccounts] = useState<AccountWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await accountService.getAccountsWithStats(dateFrom, dateTo);
      setAccounts(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(errorMessage);
      console.error('Failed to fetch accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  // Auto-fetch accounts on component mount or when dates change
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
  };
};
