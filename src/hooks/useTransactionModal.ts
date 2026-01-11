import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../services/transactionService';

interface TransactionModalState {
  selectedCategoryId: string;
  transactorLabel: string;
  initialCategoryId: string;
  initialLabel: string;
  includeFuture: boolean;
}

/**
 * Custom hook for managing transaction modal state and logic
 */
export const useTransactionModal = (transaction: Transaction | null) => {
  const [state, setState] = useState<TransactionModalState>({
    selectedCategoryId: '',
    transactorLabel: '',
    initialCategoryId: '',
    initialLabel: '',
    includeFuture: true,
  });

  // Initialize state when transaction changes
  useEffect(() => {
    if (transaction) {
      const catId = transaction.category_id || '';
      const label = transaction.transactor?.label || '';
      
      setState({
        selectedCategoryId: catId,
        transactorLabel: label,
        initialCategoryId: catId,
        initialLabel: label,
        includeFuture: true,
      });
    }
  }, [transaction]);

  // Check if any changes have been made
  const hasChanges = 
    state.selectedCategoryId !== state.initialCategoryId || 
    state.transactorLabel !== state.initialLabel;

  // Update category
  const updateCategory = useCallback((categoryId: string) => {
    setState(prev => ({ ...prev, selectedCategoryId: categoryId }));
  }, []);

  // Update transactor label
  const updateTransactorLabel = useCallback((label: string) => {
    setState(prev => ({ ...prev, transactorLabel: label }));
  }, []);

  // Toggle include future
  const toggleIncludeFuture = useCallback(() => {
    setState(prev => ({ ...prev, includeFuture: !prev.includeFuture }));
  }, []);

  // Reset to initial values
  const resetChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCategoryId: prev.initialCategoryId,
      transactorLabel: prev.initialLabel,
    }));
  }, []);

  // Update initial values after save
  const confirmChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      initialCategoryId: prev.selectedCategoryId,
      initialLabel: prev.transactorLabel,
    }));
  }, []);

  // Get updates object for API
  const getUpdates = useCallback(() => {
    return {
      category_id: state.selectedCategoryId !== state.initialCategoryId 
        ? state.selectedCategoryId 
        : undefined,
      transactor_label: state.transactorLabel !== state.initialLabel 
        ? state.transactorLabel 
        : undefined,
    };
  }, [state]);

  // Calculate update scope
  const getUpdateScope = useCallback((buttonType: 'single' | 'month') => {
    if (buttonType === 'single') {
      return state.includeFuture ? 'current_and_future' : 'single';
    } else {
      return state.includeFuture ? 'month_and_future' : 'month_only';
    }
  }, [state.includeFuture]);

  return {
    selectedCategoryId: state.selectedCategoryId,
    transactorLabel: state.transactorLabel,
    includeFuture: state.includeFuture,
    hasChanges,
    updateCategory,
    updateTransactorLabel,
    toggleIncludeFuture,
    resetChanges,
    confirmChanges,
    getUpdates,
    getUpdateScope,
  };
};
