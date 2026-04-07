import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, UserProfile, UserPreferences, DashboardPreferences } from '../services/userService';
import { useUpdateDashboardPreference, useUpdateDashboardPreferences } from '../hooks/queries/useUserQueries';
import { queryKeys } from '../lib/queryKeys';
import { storageService } from '../services/storage';

// ============ Context Types ============

interface UserContextType {
  state: {
    profile: UserProfile | null;
    preferences: UserPreferences | null;
    loading: boolean;
    error: string | null;
  };
  fetchUserData: () => Promise<void>;
  updateDashboardPreference: (key: keyof DashboardPreferences, value: boolean) => Promise<void>;
  updateDashboardPreferences: (prefs: Partial<DashboardPreferences>) => Promise<void>;
  logout: () => Promise<void>;
}

// ============ Context ============

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============ Provider ============

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

  // Check auth token on mount
  useEffect(() => {
    storageService.get('access_token').then((token) => {
      setIsAuthenticated(!!token);
    });
  }, []);

  const {
    data: profile = null,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => userService.getUserProfile(),
    enabled: isAuthenticated === true,
  });

  const {
    data: preferencesResponse,
    isLoading: prefsLoading,
  } = useQuery({
    queryKey: queryKeys.userPreferences(),
    queryFn: () => userService.getUserPreferences(),
    enabled: isAuthenticated === true,
  });

  const updatePreferenceMutation = useUpdateDashboardPreference();
  const updatePreferencesMutation = useUpdateDashboardPreferences();

  // Derive preferences with fallback defaults
  const preferences: UserPreferences | null = preferencesResponse?.ui_preferences ?? (
    isAuthenticated
      ? {
          dashboard: {
            show_ai_suggestions: true,
            show_budget_summary: true,
            show_income_expense: true,
            show_transaction_list: true,
            show_category_breakdown: true,
          },
        }
      : null
  );

  const loading = isAuthenticated === null || profileLoading || prefsLoading;
  const error = profileError ? (profileError as Error).message : null;

  const fetchUserData = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() });
  };

  const updateDashboardPreference = async (key: keyof DashboardPreferences, value: boolean) => {
    await updatePreferenceMutation.mutateAsync({ key, value });
  };

  const updateDashboardPreferences = async (prefs: Partial<DashboardPreferences>) => {
    await updatePreferencesMutation.mutateAsync(prefs);
  };

  const logout = async () => {
    await userService.logout();
    setIsAuthenticated(false);
    queryClient.clear(); // wipe entire cache on logout
  };

  return (
    <UserContext.Provider
      value={{
        state: { profile, preferences, loading, error },
        fetchUserData,
        updateDashboardPreference,
        updateDashboardPreferences,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ============ Hook ============

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
