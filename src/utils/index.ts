import { format, parseISO, isValid } from 'date-fns';
import type { FoodLog, ValidationError, FormValidation } from '../types';

// Date utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE, MMMM d, yyyy');
};

export const getDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDate = (dateString: string): Date | null => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Food Log utilities
export const createEmptyFoodLog = (date: Date): FoodLog => ({
  date: getDateKey(date),
  breakfast: {
    time: '',
    meatDairy: '',
    vegetablesFruits: '',
    breadsCerealsGrains: '',
    fats: '',
    candySweets: '',
    waterIntake: '',
    otherDrinks: ''
  },
  lunch: {
    time: '',
    meatDairy: '',
    vegetablesFruits: '',
    breadsCerealsGrains: '',
    fats: '',
    candySweets: '',
    waterIntake: '',
    otherDrinks: ''
  },
  dinner: {
    time: '',
    meatDairy: '',
    vegetablesFruits: '',
    breadsCerealsGrains: '',
    fats: '',
    candySweets: '',
    waterIntake: '',
    otherDrinks: ''
  },
  midMorningSnack: {
    time: '',
    snack: ''
  },
  midDaySnack: {
    time: '',
    snack: ''
  },
  nighttimeSnack: {
    time: '',
    snack: ''
  },
  bowelMovements: '',
  exercise: '',
  dailyWaterIntake: '',
  sleepQuality: 3,
  sleepHours: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Validation utilities
export const validateFoodLog = (log: FoodLog): FormValidation => {
  const errors: ValidationError[] = [];

  // Validate sleep quality
  if (log.sleepQuality < 1 || log.sleepQuality > 5) {
    errors.push({
      field: 'sleepQuality',
      message: 'Sleep quality must be between 1 and 5'
    });
  }

  // Validate exercise (if provided)
  if (log.exercise && isNaN(Number(log.exercise))) {
    errors.push({
      field: 'exercise',
      message: 'Exercise must be a number'
    });
  }

  // Validate water intake (if provided)
  if (log.dailyWaterIntake && isNaN(Number(log.dailyWaterIntake))) {
    errors.push({
      field: 'dailyWaterIntake',
      message: 'Water intake must be a number'
    });
  }

  // Validate sleep hours (if provided)
  if (log.sleepHours && isNaN(Number(log.sleepHours))) {
    errors.push({
      field: 'sleepHours',
      message: 'Sleep hours must be a number'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Local Storage utilities
export const getLocalStorageKey = (date: Date): string => {
  return `foodLog_${getDateKey(date)}`;
};

export const saveToLocalStorage = (date: Date, log: FoodLog): void => {
  try {
    const key = getLocalStorageKey(date);
    localStorage.setItem(key, JSON.stringify(log));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (date: Date): FoodLog | null => {
  try {
    const key = getLocalStorageKey(date);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
};

// Error handling utilities
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Debounce utility for auto-save
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  waitFor: number
): T => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  }) as T;
};