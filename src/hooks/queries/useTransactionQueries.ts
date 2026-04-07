import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transactionService,
  TransactionQueryParams,
  CreateTransactionRequest,
} from '../../services/transactionService';
import { queryKeys } from '../../lib/queryKeys';

export function useTransactions(params: TransactionQueryParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.transactions(params as Record<string, unknown>),
    queryFn: () => transactionService.getTransactions(params),
    enabled,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
  });
}

export function useMonthTotals(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.monthTotals(year, month),
    queryFn: () => transactionService.getMonthTotals(year, month),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { category_id?: string; transactor_label?: string };
    }) => transactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useBulkUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        category_id?: string;
        transactor_label?: string;
        update_scope: 'single' | 'current_and_future' | 'month_only' | 'month_and_future';
      };
    }) => transactionService.bulkUpdateTransactions(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
