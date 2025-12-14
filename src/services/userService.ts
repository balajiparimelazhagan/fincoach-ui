import api from './api';
import { storageService } from './storage';

/**
 * Google Sign-In Response
 */
export interface GoogleSignInResponse {
  authorization_url: string;
  state: string;
}

/**
 * Authentication Response (from callback)
 */
export interface AuthResponse {
  message: string;
  user_id: string;
  email: string;
  access_token: string;
  token_type: string;
}

/**
 * User Profile Response
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  currency_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Dashboard Preferences
 */
export interface DashboardPreferences {
  show_ai_suggestions: boolean;
  show_budget_summary: boolean;
  show_income_expense: boolean;
  show_transaction_list: boolean;
  show_category_breakdown: boolean;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  dashboard: Partial<DashboardPreferences>;
  [key: string]: any;
}

/**
 * User Preference Response
 */
export interface UserPreferenceResponse {
  id: string;
  user_id: string;
  ui_preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

/**
 * User Preference Update
 */
export interface UserPreferenceUpdate {
  ui_preferences: Partial<UserPreferences>;
}

/**
 * Combined User Data
 */
export interface UserData {
  profile: UserProfile;
  preferences: UserPreferences;
}

/**
 * Unified User Service
 * Handles authentication, user profile, and preferences
 */
class UserService {
  // ============ Authentication ============
  
  /**
   * Initiates Google OAuth sign-in flow
   */
  async initiateGoogleSignIn(): Promise<GoogleSignInResponse> {
    const response = await api.get<GoogleSignInResponse>('/auth/google/signin');
    return response.data;
  }

  /**
   * Stores the access token in storage
   */
  async setAccessToken(token: string): Promise<void> {
    await storageService.set('access_token', token);
  }

  /**
   * Retrieves the access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    return await storageService.get('access_token');
  }

  /**
   * Removes the access token from storage
   */
  async removeAccessToken(): Promise<void> {
    await storageService.remove('access_token');
  }

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Logs out the user
   */
  async logout(): Promise<void> {
    await this.removeAccessToken();
    window.location.href = '/login';
  }

  // ============ User Profile ============

  /**
   * Gets the current user's profile
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  }

  // ============ User Preferences ============

  /**
   * Gets user's preferences
   */
  async getUserPreferences(): Promise<UserPreferenceResponse> {
    const response = await api.get<UserPreferenceResponse>('/user-preferences');
    return response.data;
  }

  /**
   * Updates user's preferences (supports partial updates)
   */
  async updateUserPreferences(update: UserPreferenceUpdate): Promise<UserPreferenceResponse> {
    const response = await api.put<UserPreferenceResponse>('/user-preferences', update);
    return response.data;
  }

  /**
   * Updates specific dashboard preference
   */
  async updateDashboardPreference(key: keyof DashboardPreferences, value: boolean): Promise<UserPreferenceResponse> {
    return this.updateUserPreferences({
      ui_preferences: {
        dashboard: {
          [key]: value
        }
      }
    });
  }

  /**
   * Updates multiple dashboard preferences at once
   */
  async updateDashboardPreferences(preferences: Partial<DashboardPreferences>): Promise<UserPreferenceResponse> {
    return this.updateUserPreferences({
      ui_preferences: {
        dashboard: preferences
      }
    });
  }

  // ============ Combined Operations ============

  /**
   * Fetches complete user data (profile + preferences)
   */
  async getUserData(): Promise<UserData> {
    const [profile, preferencesResponse] = await Promise.all([
      this.getUserProfile(),
      this.getUserPreferences()
    ]);

    return {
      profile,
      preferences: preferencesResponse.ui_preferences
    };
  }
}

export const userService = new UserService();

// Re-export for backward compatibility
export const authService = userService;
