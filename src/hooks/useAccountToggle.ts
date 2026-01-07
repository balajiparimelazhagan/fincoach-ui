import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage account toggle state
 * Handles enabling/disabling accounts and initializing all accounts as enabled
 */
export const useAccountToggle = (accountIds: string[]) => {
  const [enabledAccounts, setEnabledAccounts] = useState<Set<string>>(new Set());

  // Initialize all accounts as enabled when account list changes
  useEffect(() => {
    if (accountIds.length > 0) {
      const allAccountIds = new Set(accountIds);
      setEnabledAccounts(allAccountIds);
    }
  }, [accountIds]);

  // Toggle a single account on/off
  const handleToggleAccount = useCallback((accountId: string, isEnabled: boolean) => {
    setEnabledAccounts(prev => {
      const newSet = new Set(prev);
      if (isEnabled) {
        newSet.add(accountId);
      } else {
        newSet.delete(accountId);
      }
      return newSet;
    });
  }, []);

  return {
    enabledAccounts,
    handleToggleAccount,
  };
};
