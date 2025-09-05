import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { ApiResponse } from '../types';

// User Preferences Types
export interface UserPreferences {
  id?: string;
  userId: string;
  
  // Water preferences
  defaultWaterAmount: number; // Default water amount in oz
  dailyWaterGoal: number;     // Daily water goal in oz
  
  // General preferences
  units: 'imperial' | 'metric'; // For future expansion
  timeFormat: '12h' | '24h';    // For future expansion
  
  // Notification preferences (for future)
  enableWaterReminders: boolean;
  waterReminderInterval: number; // in minutes
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto'; // For future dark mode
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Default preferences for new users
export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  defaultWaterAmount: 32,
  dailyWaterGoal: 128,
  units: 'imperial',
  timeFormat: '12h',
  enableWaterReminders: false,
  waterReminderInterval: 60,
  theme: 'light',
};

export class PreferencesService {
  private readonly COLLECTION_NAME = 'userPreferences';
  private readonly LOCAL_STORAGE_KEY = 'foodlogger_preferences';

  // Helper method to convert Firestore timestamps to ISO strings
  private convertTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    return timestamp.toDate?.()?.toISOString() || timestamp;
  }

  // LocalStorage methods
  private getPreferencesFromLocalStorage(): UserPreferences | null {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error getting preferences from localStorage:', error);
      return null;
    }
  }

  private savePreferencesToLocalStorage(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    // If no userId (unauthenticated), use localStorage
    if (!userId) {
      const localPrefs = this.getPreferencesFromLocalStorage();
      if (localPrefs) {
        return {
          success: true,
          data: localPrefs
        };
      } else {
        // Return default preferences for unauthenticated users
        const defaultPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          userId: 'local',
          id: 'local',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.savePreferencesToLocalStorage(defaultPrefs);
        return {
          success: true,
          data: defaultPrefs
        };
      }
    }

    // For authenticated users, try Firestore if configured
    if (!isFirebaseConfigured) {
      // Fall back to localStorage if Firebase not configured
      const localPrefs = this.getPreferencesFromLocalStorage();
      if (localPrefs) {
        return {
          success: true,
          data: { ...localPrefs, userId }
        };
      } else {
        const defaultPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          userId,
          id: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.savePreferencesToLocalStorage(defaultPrefs);
        return {
          success: true,
          data: defaultPrefs
        };
      }
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const preferences: UserPreferences = {
          id: docSnap.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as UserPreferences;

        return {
          success: true,
          data: preferences
        };
      } else {
        // Return default preferences if none exist
        const defaultPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          userId,
          id: userId,
        };
        
        return {
          success: true,
          data: defaultPrefs
        };
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user preferences'
      };
    }
  }

  // Create or update user preferences
  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    // If no userId (unauthenticated), use localStorage
    if (!userId) {
      try {
        const existingPrefs = this.getPreferencesFromLocalStorage();
        const updatedPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...existingPrefs,
          ...preferences,
          userId: 'local',
          id: 'local',
          updatedAt: new Date().toISOString(),
          createdAt: existingPrefs?.createdAt || new Date().toISOString()
        };
        
        this.savePreferencesToLocalStorage(updatedPrefs);
        
        return {
          success: true,
          data: updatedPrefs,
          message: 'Preferences saved locally'
        };
      } catch (error) {
        console.error('Error updating local preferences:', error);
        return {
          success: false,
          error: 'Failed to save preferences locally'
        };
      }
    }

    // For authenticated users, try Firestore if configured
    if (!isFirebaseConfigured) {
      // Fall back to localStorage if Firebase not configured
      try {
        const existingPrefs = this.getPreferencesFromLocalStorage();
        const updatedPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...existingPrefs,
          ...preferences,
          userId,
          id: userId,
          updatedAt: new Date().toISOString(),
          createdAt: existingPrefs?.createdAt || new Date().toISOString()
        };
        
        this.savePreferencesToLocalStorage(updatedPrefs);
        
        return {
          success: true,
          data: updatedPrefs,
          message: 'Preferences saved locally'
        };
      } catch (error) {
        console.error('Error updating local preferences:', error);
        return {
          success: false,
          error: 'Failed to save preferences locally'
        };
      }
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      
      // Check if preferences already exist
      const existingDoc = await getDoc(docRef);
      const isUpdate = existingDoc.exists();
      
      const preferencesData = {
        ...preferences,
        userId,
        updatedAt: serverTimestamp(),
        ...(isUpdate ? {} : { createdAt: serverTimestamp() })
      };

      await setDoc(docRef, preferencesData, { merge: true });

      // Fetch the updated document
      const result = await this.getUserPreferences(userId);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: isUpdate ? 'Preferences updated successfully' : 'Preferences created successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to retrieve updated preferences'
        };
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user preferences'
      };
    }
  }

  // Initialize preferences for a new user
  async initializeUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    const actualUserId = userId || 'local';
    const defaultPrefs: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'> = {
      ...DEFAULT_PREFERENCES,
      userId: actualUserId
    };
    
    return this.updateUserPreferences(userId, defaultPrefs);
  }

  // Update specific preference fields
  async updateWaterPreferences(
    userId: string,
    waterPrefs: Pick<UserPreferences, 'defaultWaterAmount' | 'dailyWaterGoal'>
  ): Promise<ApiResponse<UserPreferences>> {
    return this.updateUserPreferences(userId, waterPrefs);
  }

  async updateNotificationPreferences(
    userId: string,
    notificationPrefs: Pick<UserPreferences, 'enableWaterReminders' | 'waterReminderInterval'>
  ): Promise<ApiResponse<UserPreferences>> {
    return this.updateUserPreferences(userId, notificationPrefs);
  }

  async updateTheme(userId: string, theme: UserPreferences['theme']): Promise<ApiResponse<UserPreferences>> {
    return this.updateUserPreferences(userId, { theme });
  }
}

// Export a singleton instance
export const preferencesService = new PreferencesService();