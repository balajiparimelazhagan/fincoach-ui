import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patternService, PatternObligation } from '../../services/patternService';
import { queryKeys } from '../../lib/queryKeys';

export function usePatterns(status?: string) {
  return useQuery({
    queryKey: queryKeys.patterns(status),
    queryFn: () => patternService.getPatterns(status),
  });
}

export function useUpcomingObligations(daysAhead = 365) {
  return useQuery({
    queryKey: queryKeys.upcomingObligations(daysAhead),
    queryFn: () => patternService.getUpcomingObligations(daysAhead),
  });
}

export function useFulfillObligation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      obligationId,
      transactionId,
    }: {
      obligationId: string;
      transactionId?: string;
    }) => patternService.fulfillObligation(obligationId, transactionId),

    // Optimistic update — flip status to FULFILLED in every obligations cache
    onMutate: async ({ obligationId }) => {
      await queryClient.cancelQueries({ queryKey: ['obligations'] });

      const previousEntries = queryClient.getQueriesData<PatternObligation[]>({
        queryKey: ['obligations'],
      });

      queryClient.setQueriesData<PatternObligation[]>(
        { queryKey: ['obligations'] },
        (old) => old?.map((o) => o.id === obligationId ? { ...o, status: 'FULFILLED' as const } : o)
      );

      return { previousEntries };
    },

    onError: (_err, _vars, context) => {
      context?.previousEntries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSnoozeObligation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ obligationId, days }: { obligationId: string; days?: number }) =>
      patternService.snoozeObligation(obligationId, days),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['obligations'] }),
  });
}

export function useSkipObligation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ obligationId }: { obligationId: string }) =>
      patternService.skipObligation(obligationId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['obligations'] }),
  });
}

export function useDeletePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patternId: string) => patternService.deletePattern(patternId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
    },
  });
}
