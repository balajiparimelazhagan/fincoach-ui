import { useQuery } from '@tanstack/react-query';
import { statsService } from '../../services/statsService';
import { queryKeys } from '../../lib/queryKeys';

export function useDailySummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.dailySummary(year, month),
    queryFn: () => statsService.getCashflowDailySummary(year, month),
  });
}

export function useCategoryBudgets(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.categoryBudgets(year, month),
    queryFn: () => statsService.getCategoryBudgets(year, month),
  });
}

export function useProjectedSummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.projectedSummary(year, month),
    queryFn: () => statsService.getProjectedSummary(year, month),
  });
}

export function useSpendingByCategory(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: queryKeys.spendingByCategory(dateFrom, dateTo),
    queryFn: () => statsService.getSpendingByCategory(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  });
}

export function useComprehensiveStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: queryKeys.comprehensiveStats(dateFrom, dateTo),
    queryFn: () => statsService.getComprehensiveStats(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  });
}
