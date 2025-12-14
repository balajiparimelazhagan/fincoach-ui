import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { userService, UserProfile, UserPreferences, DashboardPreferences } from '../services/userService';

// ============ State Types ============

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

// ============ Action Types ============

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_DATA'; payload: { profile: UserProfile; preferences: UserPreferences } }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_PREFERENCE'; payload: { key: keyof DashboardPreferences; value: boolean } }
  | { type: 'RESET_USER' };

// ============ Reducer ============

const initialState: UserState = {
  profile: null,
  preferences: null,
  loading: true,
  error: null
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_USER_DATA':
      return {
        ...state,
        profile: action.payload.profile,
        preferences: action.payload.preferences,
        loading: false,
        error: null
      };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    
    case 'UPDATE_PREFERENCE':
      if (!state.preferences) return state;
      return {
        ...state,
        preferences: {
          ...state.preferences,
          dashboard: {
            ...state.preferences.dashboard,
            [action.payload.key]: action.payload.value
          }
        }
      };
    
    case 'RESET_USER':
      return initialState;
    
    default:
      return state;
  }
}

// ============ Context Types ============

interface UserContextType {
  state: UserState;
  fetchUserData: () => Promise<void>;
  updateDashboardPreference: (key: keyof DashboardPreferences, value: boolean) => Promise<void>;
  updateDashboardPreferences: (prefs: Partial<DashboardPreferences>) => Promise<void>;
  logout: () => Promise<void>;
}

// ============ Context ============

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============ Provider ============

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchUserData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const userData = await userService.getUserData();
      
      dispatch({
        type: 'SET_USER_DATA',
        payload: userData
      });
    } catch (err: any) {
      console.error('Failed to fetch user data:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err?.message || 'Failed to fetch user data' 
      });
      
      // Set default preferences on error
      if (!state.preferences) {
        dispatch({
          type: 'SET_PREFERENCES',
          payload: {
            dashboard: {
              show_ai_suggestions: false,
              show_budget_summary: false,
              show_income_expense: false,
              show_transaction_list: false,
              show_category_breakdown: false
            }
          }
        });
      }
    }
  };

  const updateDashboardPreference = async (key: keyof DashboardPreferences, value: boolean) => {
    try {
      // Optimistic update
      dispatch({ type: 'UPDATE_PREFERENCE', payload: { key, value } });
      
      const response = await userService.updateDashboardPreference(key, value);
      
      // Update with server response
      dispatch({ type: 'SET_PREFERENCES', payload: response.ui_preferences });
    } catch (err: any) {
      console.error('Failed to update preference:', err);
      
      // Revert optimistic update by refetching
      await fetchUserData();
      
      throw err;
    }
  };

  const updateDashboardPreferences = async (prefs: Partial<DashboardPreferences>) => {
    try {
      const response = await userService.updateDashboardPreferences(prefs);
      dispatch({ type: 'SET_PREFERENCES', payload: response.ui_preferences });
    } catch (err: any) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  };

  const logout = async () => {
    await userService.logout();
    dispatch({ type: 'RESET_USER' });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        state,
        fetchUserData,
        updateDashboardPreference,
        updateDashboardPreferences,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ============ Hook ============

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
