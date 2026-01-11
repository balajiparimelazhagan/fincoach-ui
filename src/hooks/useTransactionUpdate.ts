import { useState, useCallback } from 'react';
import { useIonToast } from '@ionic/react';
import { transactionService, Transaction } from '../services/transactionService';

interface UseTransactionUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for handling transaction update operations
 * Manages single and bulk update logic with toast notifications
 */
export const useTransactionUpdate = (options?: UseTransactionUpdateOptions) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [present] = useIonToast();

  const handleTransactionUpdate = useCallback(
    async (
      transactionId: string,
      updates: { category_id?: string; transactor_label?: string },
      updateScope: 'single' | 'current_and_future' | 'month_only' | 'month_and_future'
    ) => {
      setIsUpdating(true);
      
      try {
        let result: { updated_count: number; transaction?: Transaction };
        
        if (updateScope === 'single') {
          await transactionService.updateTransaction(transactionId, updates);
          result = { updated_count: 1 };
        } else {
          result = await transactionService.bulkUpdateTransactions(transactionId, {
            ...updates,
            update_scope: updateScope,
          });
        }
        
        // Show success message
        const message =
          result.updated_count === 1
            ? 'Transaction updated successfully'
            : `${result.updated_count} transaction(s) updated successfully`;
        
        present({
          message,
          duration: 2000,
          color: 'success',
        });
        
        options?.onSuccess?.();
      } catch (err) {
        console.error('Error updating transaction:', err);
        
        present({
          message: 'Failed to update transaction',
          duration: 2000,
          color: 'danger',
        });
        
        options?.onError?.(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsUpdating(false);
      }
    },
    [present, options]
  );

  return {
    handleTransactionUpdate,
    isUpdating,
  };
};
