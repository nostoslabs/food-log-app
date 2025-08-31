import { useState, useEffect, useCallback } from 'react';
import type { FoodLog, MealData, SnackData } from '../types';
import { firestoreService } from '../services/firestore';
import { useAuth } from './useAuth';
import {
  createEmptyFoodLog,
  getDateKey,
  saveToLocalStorage,
  loadFromLocalStorage,
  debounce
} from '../utils';

export function useFoodLog(date: Date) {
  const { user } = useAuth();
  const [foodLog, setFoodLog] = useState<FoodLog>(() => createEmptyFoodLog(date));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to Firestore
  const saveFoodLogToFirestore = async (logToSave: FoodLog): Promise<void> => {
    if (!user) return;

    try {
      setSaving(true);
      const result = await firestoreService.upsertFoodLog({
        ...logToSave,
        userId: user.uid
      });

      if (result.success && result.data) {
        setFoodLog(result.data);
      } else {
        throw new Error(result.error || 'Failed to save food log');
      }
    } catch (err) {
      setError('Failed to save food log to cloud');
      console.error('Error saving to Firestore:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Load food log when date or user changes
  useEffect(() => {
    const loadFoodLog = async () => {
      setLoading(true);
      setError(null);
      
      const dateKey = getDateKey(date);

      try {
        if (user) {
          // Try to load from Firestore first
          const result = await firestoreService.getFoodLogByDate(user.uid, dateKey);
          
          if (result.success && result.data) {
            setFoodLog(result.data);
          } else {
            // Check if it's an index error
            if (result.error && (result.error.includes('index') || result.error.includes('Index'))) {
              setError('Database query failed. Please try refreshing the page or contact support.');
              console.error('Firestore index error:', result.error);
            }
            
            // If not found in Firestore, try local storage
            const localLog = loadFromLocalStorage(date);
            if (localLog) {
              setFoodLog(localLog);
              // Sync local data to Firestore
              try {
                await saveFoodLogToFirestore({ ...localLog, userId: user.uid });
              } catch (syncError) {
                console.error('Failed to sync local data to Firestore:', syncError);
                // Don't show error to user for sync failures
              }
            } else {
              // Create new empty log
              setFoodLog(createEmptyFoodLog(date));
            }
          }
        } else {
          // User not logged in, use local storage only
          const localLog = loadFromLocalStorage(date);
          setFoodLog(localLog || createEmptyFoodLog(date));
        }
      } catch (err) {
        // Check if it's a Firestore/index related error
        if (err instanceof Error && (err.message.includes('index') || err.message.includes('Index'))) {
          setError('Database connection issue. Your data may not be fully synced. Please try refreshing the page.');
        } else {
          setError('Failed to load food log');
        }
        console.error('Error loading food log:', err);
        // Fallback to local storage
        const localLog = loadFromLocalStorage(date);
        setFoodLog(localLog || createEmptyFoodLog(date));
      } finally {
        setLoading(false);
      }
    };

    loadFoodLog();
  }, [date, user]);

  // Debounced save function to avoid too many API calls
  const debouncedSave = useCallback(
    debounce(async (logToSave: FoodLog) => {
      // Always save to local storage immediately
      saveToLocalStorage(date, logToSave);
      
      // Try to save to Firestore if user is logged in
      if (user) {
        try {
          await saveFoodLogToFirestore(logToSave);
        } catch (err) {
          // Error already handled in saveFoodLogToFirestore
        }
      }
    }, 1000),
    [date, user]
  );

  // Update meal data
  const updateMeal = (meal: keyof Pick<FoodLog, 'breakfast' | 'lunch' | 'dinner'>, field: keyof MealData, value: string) => {
    setFoodLog(prev => {
      const updated = {
        ...prev,
        [meal]: {
          ...prev[meal],
          [field]: value
        },
        updatedAt: new Date().toISOString()
      };
      
      debouncedSave(updated);
      return updated;
    });
  };

  // Update snack data
  const updateSnack = (snack: keyof Pick<FoodLog, 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack'>, field: keyof SnackData, value: string) => {
    setFoodLog(prev => {
      const updated = {
        ...prev,
        [snack]: {
          ...prev[snack],
          [field]: value
        },
        updatedAt: new Date().toISOString()
      };
      
      debouncedSave(updated);
      return updated;
    });
  };

  // Update health metrics
  const updateHealthMetric = (field: keyof Omit<FoodLog, 'id' | 'userId' | 'date' | 'breakfast' | 'lunch' | 'dinner' | 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    setFoodLog(prev => {
      const updated = {
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString()
      };
      
      debouncedSave(updated);
      return updated;
    });
  };

  // Force save (for manual sync)
  const forceSave = async (): Promise<void> => {
    if (user) {
      await saveFoodLogToFirestore(foodLog);
    }
    saveToLocalStorage(date, foodLog);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    foodLog,
    loading,
    saving,
    error,
    updateMeal,
    updateSnack,
    updateHealthMetric,
    forceSave,
    clearError
  };
}