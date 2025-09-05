/**
 * CRITICAL: Unified Food Log Hook - Single Source of Truth
 * 
 * This hook replaces useFoodLog and useTimelineData to eliminate
 * race conditions and data inconsistencies that could impact patient care.
 */

import { useEffect } from 'react';
import { useFoodLogStore } from '../stores/foodLogStore';
import { useAuth } from './useAuth';
import type { MealData, SnackData } from '../types';

export interface UseFoodLogV2Return {
  // Current food log data
  currentLog: any;
  
  // Timeline data (multiple days)
  timelineData: any[];
  
  // State tracking
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  error: string | null;
  
  // Data operations
  updateMeal: (mealType: 'breakfast' | 'lunch' | 'dinner', mealData: MealData) => Promise<void>;
  updateSnack: (snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData: SnackData) => Promise<void>;
  updateHealthMetric: (field: string, value: any) => Promise<void>;
  
  // Navigation
  setCurrentDate: (date: Date) => void;
  currentDate: Date;
  
  // Timeline operations
  refreshTimelineData: () => Promise<void>;
  getDaySummary: (date: Date) => { meals: number; snacks: number; waterIntake: number };
  
  // Error handling
  clearError: () => void;
  
  // Force save for immediate persistence
  forceSave: () => Promise<void>;
  
  // Emergency recovery
  recoverData: () => Promise<void>;
  
  // Healthcare compliance
  getAuditTrail: () => any[];
  validateData: () => Promise<{ valid: number; invalid: number; errors: string[] }>;
}

export function useFoodLogV2(initialDate?: Date): UseFoodLogV2Return {
  const { user } = useAuth();
  
  // Get all store state and actions
  const {
    logs,
    currentDate,
    loading,
    saving,
    syncing,
    error,
    setCurrentDate: setStoreDate,
    setUserId,
    getFoodLog,
    updateFoodLog,
    updateMeal,
    updateSnack,
    updateHealthMetric,
    loadFoodLog,
    syncAllData,
    clearError,
    recoverFromLocalStorage,
    validateAllData,
    getAuditTrail,
  } = useFoodLogStore();
  
  // Convert currentDate string to Date object
  const currentDateObj = new Date(currentDate.replace(/-/g, '/'));
  
  // Get current food log
  const currentLog = getFoodLog(currentDateObj);
  
  // Set user ID when authentication changes
  useEffect(() => {
    setUserId(user?.uid || null);
  }, [user?.uid]); // Removed setUserId from dependencies
  
  // Set initial date if provided (only once)
  useEffect(() => {
    if (initialDate) {
      setStoreDate(initialDate);
    }
  }, [initialDate]); // Removed setStoreDate from dependencies to prevent loops
  
  // Auto-load current date data (only when date changes, not when loadFoodLog changes)
  useEffect(() => {
    loadFoodLog(currentDateObj);
  }, [currentDateObj]); // Removed loadFoodLog from dependencies
  
  // Generate timeline data from logs
  const timelineData = generateTimelineData(logs, 7);
  
  // Wrapped operations that work with current date
  const wrappedUpdateMeal = async (mealType: 'breakfast' | 'lunch' | 'dinner', mealData: MealData) => {
    await updateMeal(currentDateObj, mealType, mealData);
  };
  
  const wrappedUpdateSnack = async (snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData: SnackData) => {
    await updateSnack(currentDateObj, snackType, snackData);
  };
  
  const wrappedUpdateHealthMetric = async (field: string, value: any) => {
    await updateHealthMetric(currentDateObj, field, value);
  };
  
  const forceSave = async () => {
    if (currentLog) {
      await updateFoodLog(currentDateObj, currentLog);
    }
  };
  
  const refreshTimelineData = async () => {
    await syncAllData();
  };
  
  const getDaySummary = (date: Date) => {
    const log = getFoodLog(date);
    if (!log) return { meals: 0, snacks: 0, waterIntake: 0 };
    
    const meals = [log.breakfast, log.lunch, log.dinner].filter(meal => 
      hasContent(meal)
    ).length;
    
    const snacks = [log.midMorningSnack, log.midDaySnack, log.nighttimeSnack].filter(snack => 
      hasContent(snack)
    ).length;
    
    const waterIntake = parseWaterIntake(log.dailyWaterIntake) + 
      parseWaterIntake(log.breakfast.waterIntake) +
      parseWaterIntake(log.lunch.waterIntake) +
      parseWaterIntake(log.dinner.waterIntake);
    
    return { meals, snacks, waterIntake };
  };
  
  return {
    currentLog,
    timelineData,
    loading,
    saving,
    syncing,
    error,
    updateMeal: wrappedUpdateMeal,
    updateSnack: wrappedUpdateSnack,
    updateHealthMetric: wrappedUpdateHealthMetric,
    setCurrentDate: setStoreDate,
    currentDate: currentDateObj,
    refreshTimelineData,
    getDaySummary,
    clearError,
    forceSave,
    recoverData: recoverFromLocalStorage,
    getAuditTrail,
    validateData: validateAllData,
  };
}

// Helper function to generate timeline data from logs
function generateTimelineData(logs: Map<string, any>, days: number) {
  const timeline = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateKey = date.toISOString().split('T')[0];
    const log = logs.get(dateKey);
    
    if (log) {
      const entries = convertFoodLogToTimelineEntries(log);
      if (entries.length > 0) {
        timeline.push({
          id: `day-${dateKey}`,
          date: dateKey,
          displayDate: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }),
          entries,
        });
      }
    }
  }
  
  return timeline;
}

// Helper function to check if data has content
function hasContent(data: any): boolean {
  if (typeof data === 'string') {
    return data.trim() !== '';
  }
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).some(value => value && value.toString().trim() !== '');
  }
  return false;
}

// Helper function to parse water intake
function parseWaterIntake(waterStr: string): number {
  if (!waterStr) return 0;
  const match = waterStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper function to format food content
function formatFoodContent(meal: any): string {
  const parts = [];
  if (meal.meatDairy?.trim()) parts.push(meal.meatDairy);
  if (meal.vegetablesFruits?.trim()) parts.push(meal.vegetablesFruits);
  if (meal.breadsCerealsGrains?.trim()) parts.push(meal.breadsCerealsGrains);
  if (meal.fats?.trim()) parts.push(meal.fats);
  if (meal.candySweets?.trim()) parts.push(meal.candySweets);
  if (meal.otherDrinks?.trim()) parts.push(meal.otherDrinks);
  
  return parts.length > 0 ? parts.join(', ') : 'No details recorded';
}

// Helper function to convert food log to timeline entries
function convertFoodLogToTimelineEntries(foodLog: any) {
  const entries = [];

  // Add meals
  if (hasContent(foodLog.breakfast)) {
    entries.push({
      time: foodLog.breakfast.time || '8:00 AM',
      type: 'breakfast',
      title: 'Breakfast',
      content: formatFoodContent(foodLog.breakfast),
      waterIntake: parseWaterIntake(foodLog.breakfast.waterIntake)
    });
  }

  if (hasContent(foodLog.lunch)) {
    entries.push({
      time: foodLog.lunch.time || '12:00 PM',
      type: 'lunch',
      title: 'Lunch',
      content: formatFoodContent(foodLog.lunch),
      waterIntake: parseWaterIntake(foodLog.lunch.waterIntake)
    });
  }

  if (hasContent(foodLog.dinner)) {
    entries.push({
      time: foodLog.dinner.time || '6:00 PM',
      type: 'dinner',
      title: 'Dinner',
      content: formatFoodContent(foodLog.dinner),
      waterIntake: parseWaterIntake(foodLog.dinner.waterIntake)
    });
  }

  // Add snacks
  if (hasContent(foodLog.midMorningSnack)) {
    entries.push({
      time: foodLog.midMorningSnack.time || '10:00 AM',
      type: 'snack',
      title: 'Mid-Morning Snack',
      content: foodLog.midMorningSnack.snack,
      waterIntake: 0
    });
  }

  if (hasContent(foodLog.midDaySnack)) {
    entries.push({
      time: foodLog.midDaySnack.time || '3:00 PM',
      type: 'snack',
      title: 'Afternoon Snack',
      content: foodLog.midDaySnack.snack,
      waterIntake: 0
    });
  }

  if (hasContent(foodLog.nighttimeSnack)) {
    entries.push({
      time: foodLog.nighttimeSnack.time || '9:00 PM',
      type: 'snack',
      title: 'Evening Snack',
      content: foodLog.nighttimeSnack.snack,
      waterIntake: 0
    });
  }

  // Add water intake if recorded separately
  if (hasContent(foodLog.dailyWaterIntake)) {
    entries.push({
      time: '12:00 PM',
      type: 'water',
      title: 'Daily Water Intake',
      content: foodLog.dailyWaterIntake,
      waterIntake: parseWaterIntake(foodLog.dailyWaterIntake)
    });
  }

  // Add exercise if recorded
  if (hasContent(foodLog.exercise)) {
    entries.push({
      time: '6:00 AM',
      type: 'exercise',
      title: 'Exercise',
      content: foodLog.exercise,
      waterIntake: 0
    });
  }

  // Add sleep if recorded - SINGLE SOURCE OF TRUTH for percentage display
  if (foodLog.sleepQuality > 0 || hasContent(foodLog.sleepHours)) {
    const sleepContent = [];
    if (hasContent(foodLog.sleepHours)) sleepContent.push(foodLog.sleepHours);
    if (foodLog.sleepQuality > 0) {
      // Display sleep quality as percentage (data is validated in store)
      sleepContent.push(`Quality: ${foodLog.sleepQuality}%`);
    }
    
    entries.push({
      time: '11:00 PM',
      type: 'sleep',
      title: 'Sleep',
      content: sleepContent.join(', ') || 'Sleep recorded',
      waterIntake: 0
    });
  }

  // Sort entries by time
  return entries.sort((a, b) => {
    const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
    const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
    return timeA - timeB;
  });
}