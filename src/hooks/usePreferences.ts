import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { preferencesService, type UserPreferences, DEFAULT_PREFERENCES } from '../services/preferencesService';

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    userId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences when user changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        // Reset to default preferences when user logs out
        setPreferences({
          ...DEFAULT_PREFERENCES,
          userId: '',
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await preferencesService.getUserPreferences(user.uid);
        
        if (result.success && result.data) {
          setPreferences(result.data);
        } else {
          setError(result.error || 'Failed to load preferences');
          // Fall back to defaults
          setPreferences({
            ...DEFAULT_PREFERENCES,
            userId: user.uid,
          });
        }
      } catch (err) {
        setError('Failed to load preferences');
        console.error('Error loading preferences:', err);
        // Fall back to defaults
        setPreferences({
          ...DEFAULT_PREFERENCES,
          userId: user.uid,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>): Promise<boolean> => {
    if (!user) {
      setError('Must be logged in to update preferences');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await preferencesService.updateUserPreferences(user.uid, updates);
      
      if (result.success && result.data) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to update preferences');
        return false;
      }
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Specific update functions for convenience
  const updateWaterPreferences = useCallback(async (
    defaultAmount: number, 
    dailyGoal: number
  ): Promise<boolean> => {
    return updatePreferences({
      defaultWaterAmount: defaultAmount,
      dailyWaterGoal: dailyGoal,
    });
  }, [updatePreferences]);

  const updateTheme = useCallback(async (theme: UserPreferences['theme']): Promise<boolean> => {
    return updatePreferences({ theme });
  }, [updatePreferences]);

  const updateNotificationSettings = useCallback(async (
    enabled: boolean,
    interval: number
  ): Promise<boolean> => {
    return updatePreferences({
      enableWaterReminders: enabled,
      waterReminderInterval: interval,
    });
  }, [updatePreferences]);

  // Initialize preferences for new users
  const initializePreferences = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const result = await preferencesService.initializeUserPreferences(user.uid);
      
      if (result.success && result.data) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to initialize preferences');
        return false;
      }
    } catch (err) {
      setError('Failed to initialize preferences');
      console.error('Error initializing preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateWaterPreferences,
    updateTheme,
    updateNotificationSettings,
    initializePreferences,
    clearError,
    
    // Convenience getters
    get defaultWaterAmount() {
      return preferences.defaultWaterAmount;
    },
    
    get dailyWaterGoal() {
      return preferences.dailyWaterGoal;
    },
    
    get isMetric() {
      return preferences.units === 'metric';
    },
    
    get is24Hour() {
      return preferences.timeFormat === '24h';
    },
  };
}