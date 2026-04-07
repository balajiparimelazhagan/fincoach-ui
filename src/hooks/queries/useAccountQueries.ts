import { useQuery } from '@tanstack/react-query';
import { accountService, AccountQueryParams } from '../../services/accountService';
import { queryKeys } from '../../lib/queryKeys';

export function useAccounts(params?: AccountQueryParams) {
  return useQuery({
    queryKey: queryKeys.accounts(params as Record<string, unknown>),
    queryFn: () => accountService.getAccounts(params),
    staleTime: 1000 * 60 * 10, // accounts change rarely — cache 10 min
  });
}

export function useAccountStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: queryKeys.accountStats(dateFrom, dateTo),
    queryFn: () => accountService.getAccountsWithStats(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  });
}
