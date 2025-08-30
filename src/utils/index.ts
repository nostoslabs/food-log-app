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

// Text processing utilities
export const generatePlainTextExport = (logs: FoodLog[]): string => {
  if (logs.length === 0) {
    return 'No food log entries found for the selected date range.';
  }

  let text = 'FOOD LOG EXPORT\\n';
  text += `Generated: ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}\\n`;
  text += `Date Range: ${logs.length === 1 ? 'Single Day' : `${logs.length} Days`}\\n\\n`;

  logs.forEach((log) => {
    const logDate = parseDate(log.date);
    if (logDate) {
      text += `${formatDate(logDate).toUpperCase()}\\n`;
      text += '='.repeat(50) + '\\n\\n';

      // Meals
      const meals = [
        { key: 'breakfast' as const, name: 'BREAKFAST' },
        { key: 'lunch' as const, name: 'LUNCH' },
        { key: 'dinner' as const, name: 'DINNER' }
      ];

      meals.forEach(meal => {
        const data = log[meal.key];
        text += `${meal.name}${data.time ? ` (${data.time})` : ''}:\\n`;
        if (data.meatDairy) text += `  Meat & Dairy: ${data.meatDairy}\\n`;
        if (data.vegetablesFruits) text += `  Vegetables & Fruits: ${data.vegetablesFruits}\\n`;
        if (data.breadsCerealsGrains) text += `  Breads, Cereals & Grains: ${data.breadsCerealsGrains}\\n`;
        if (data.fats) text += `  Fats: ${data.fats}\\n`;
        if (data.candySweets) text += `  Candy, Sweets & Junk Food: ${data.candySweets}\\n`;
        if (data.waterIntake) text += `  Water Intake: ${data.waterIntake} fl oz\\n`;
        if (data.otherDrinks) text += `  Other Drinks: ${data.otherDrinks}\\n`;
        text += '\\n';
      });

      // Snacks
      text += 'SNACKS:\\n';
      if (log.midMorningSnack.snack || log.midMorningSnack.time) {
        text += `  Mid-Morning${log.midMorningSnack.time ? ` (${log.midMorningSnack.time})` : ''}: ${log.midMorningSnack.snack}\\n`;
      }
      if (log.midDaySnack.snack || log.midDaySnack.time) {
        text += `  Mid-Day${log.midDaySnack.time ? ` (${log.midDaySnack.time})` : ''}: ${log.midDaySnack.snack}\\n`;
      }
      if (log.nighttimeSnack.snack || log.nighttimeSnack.time) {
        text += `  Nighttime${log.nighttimeSnack.time ? ` (${log.nighttimeSnack.time})` : ''}: ${log.nighttimeSnack.snack}\\n`;
      }
      text += '\\n';

      // Health Metrics
      text += 'HEALTH METRICS:\\n';
      if (log.bowelMovements) text += `  Bowel Movements: ${log.bowelMovements}\\n`;
      if (log.exercise) text += `  Exercise: ${log.exercise} minutes\\n`;
      if (log.dailyWaterIntake) text += `  Daily Water Intake: ${log.dailyWaterIntake} quarts\\n`;
      if (log.sleepQuality) text += `  Sleep Quality: ${log.sleepQuality}/5\\n`;
      if (log.sleepHours) text += `  Hours of Sleep: ${log.sleepHours}\\n`;
      text += '\\n';

      // Notes
      if (log.notes) {
        text += `NOTES:\\n${log.notes}\\n\\n`;
      }

      text += '\\n';
    }
  });

  return text;
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