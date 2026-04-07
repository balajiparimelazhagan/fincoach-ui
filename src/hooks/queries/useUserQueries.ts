import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, DashboardPreferences, UserPreferenceResponse } from '../../services/userService';
import { queryKeys } from '../../lib/queryKeys';

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => userService.getUserProfile(),
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: queryKeys.userPreferences(),
    queryFn: () => userService.getUserPreferences(),
  });
}

export function useUpdateDashboardPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: keyof DashboardPreferences; value: boolean }) =>
      userService.updateDashboardPreference(key, value),

    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userPreferences() });
      const previous = queryClient.getQueryData(queryKeys.userPreferences());

      queryClient.setQueryData(queryKeys.userPreferences(), (old: UserPreferenceResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ui_preferences: {
            ...old.ui_preferences,
            dashboard: { ...old.ui_preferences.dashboard, [key]: value },
          },
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.userPreferences(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() });
    },
  });
}

export function useUpdateDashboardPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<DashboardPreferences>) =>
      userService.updateDashboardPreferences(prefs),

    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.userPreferences(), data);
    },
  });
}
