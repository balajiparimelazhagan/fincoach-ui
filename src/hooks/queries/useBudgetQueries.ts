import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetService, CreateCustomBudgetItemRequest, CustomBudgetItem } from '../../services/budgetService';
import { queryKeys } from '../../lib/queryKeys';

export function useCustomBudgetItems() {
  return useQuery({
    queryKey: queryKeys.customBudgetItems(),
    queryFn: () => budgetService.getCustomItems(),
  });
}

export function useCreateBudgetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomBudgetItemRequest) => budgetService.createCustomItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customBudgetItems() });
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteCustomItem(id),

    // Optimistic removal
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customBudgetItems() });
      const previous = queryClient.getQueryData<CustomBudgetItem[]>(queryKeys.customBudgetItems());

      queryClient.setQueryData<CustomBudgetItem[]>(
        queryKeys.customBudgetItems(),
        (old) => old?.filter((item) => item.id !== id) ?? []
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.customBudgetItems(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customBudgetItems() });
    },
  });
}
