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
 * Auth Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Initiates Google OAuth sign-in flow
   * @returns Promise with authorization URL and state
   */
  async initiateGoogleSignIn(): Promise<GoogleSignInResponse> {
    const response = await api.get<GoogleSignInResponse>('/auth/google/signin');
    return response.data;
  }

  /**
   * Stores the access token in storage (uses Capacitor Preferences on native, localStorage on web)
   * @param token - JWT access token
   */
  async setAccessToken(token: string): Promise<void> {
    await storageService.set('access_token', token);
  }

  /**
   * Retrieves the access token from storage
   * @returns Access token or null
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
   * @returns True if access token exists
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Logs out the user (client-side)
   * Clears the access token from storage
   */
  async logout(): Promise<void> {
    await this.removeAccessToken();
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Gets the current user's profile
   * @returns Promise with user profile data
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  }

  /**
   * Updates the current user's profile
   * @param userData - User data to update
   * @returns Promise with updated user profile
   */
  async updateUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/users/me', userData);
    return response.data;
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;

