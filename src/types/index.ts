// Food Log Types
export interface MealData {
  time: string;
  meatDairy: string;
  vegetablesFruits: string;
  breadsCerealsGrains: string;
  fats: string;
  candySweets: string;
  waterIntake: string;
  otherDrinks: string;
}

export interface SnackData {
  time: string;
  snack: string;
}

export interface FoodLog {
  id?: string;
  userId?: string;
  date: string;
  
  // Meals
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  
  // Snacks
  midMorningSnack: SnackData;
  midDaySnack: SnackData;
  nighttimeSnack: SnackData;
  
  // Health Metrics
  bowelMovements: string;
  exercise: string;
  dailyWaterIntake: string;
  sleepQuality: number;
  sleepHours: string;
  notes: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// PDF Export Types
export interface ExportOptions {
  startDate: string;
  endDate: string;
  includeHealthMetrics: boolean;
  includeNotes: boolean;
}

export interface ExportData {
  logs: FoodLog[];
  user: User;
  options: ExportOptions;
  generatedAt: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Component Props Types
export interface MealSectionProps {
  mealName: keyof Pick<FoodLog, 'breakfast' | 'lunch' | 'dinner'>;
  mealData: MealData;
  displayName: string;
  onUpdate: (field: keyof MealData, value: string) => void;
}

export interface SnackSectionProps {
  snackName: keyof Pick<FoodLog, 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack'>;
  snackData: SnackData;
  displayName: string;
  onUpdate: (field: keyof SnackData, value: string) => void;
}

// Entry Style Types - Domain Layer
export type EntryType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'water'
  | 'exercise'
  | 'sleep'
  | 'health';

export interface EntryStyle {
  icon: any; // LucideIcon type
  iconClasses: string;
  containerClasses: string;
}