import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Storage service that uses Capacitor Preferences on native platforms
 * and falls back to localStorage on web
 */
class StorageService {
  /**
   * Sets a value in storage
   * @param key - Storage key
   * @param value - Value to store
   */
  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Gets a value from storage
   * @param key - Storage key
   * @returns The stored value or null
   */
  async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  }

  /**
   * Removes a value from storage
   * @param key - Storage key
   */
  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clears all storage
   */
  async clear(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
export default storageService;

