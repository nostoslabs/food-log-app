/**
 * CRITICAL: Centralized Food Log State Management
 * 
 * This store implements a single source of truth pattern to eliminate
 * data inconsistencies that could impact patient care.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { firestoreService } from '../services/firestore';
import { validateFoodLog, validateAndMigrateFoodLog, type ValidatedFoodLog } from '../schemas/foodLogSchema';
import { getDateKey } from '../utils';

// Audit trail for healthcare compliance
interface DataAudit {
  timestamp: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'migrate';
  field?: string;
  oldValue?: any;
  newValue?: any;
  source: 'user' | 'migration' | 'sync' | 'system';
}

// Error tracking for patient data safety
interface DataError {
  timestamp: string;
  operation: string;
  error: string;
  data?: any;
  resolved: boolean;
}

// Store state interface
interface FoodLogState {
  // Data storage - SINGLE SOURCE OF TRUTH
  logs: Map<string, ValidatedFoodLog>; // Date-keyed cache
  currentDate: string;
  
  // State tracking
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  error: string | null;
  
  // Healthcare compliance
  auditTrail: DataAudit[];
  errors: DataError[];
  
  // User context
  userId: string | null;
  
  // Core operations
  setCurrentDate: (date: Date) => void;
  setUserId: (userId: string | null) => void;
  
  // Data operations with validation
  getFoodLog: (date: Date) => ValidatedFoodLog | null;
  updateFoodLog: (date: Date, updates: Partial<ValidatedFoodLog>) => Promise<void>;
  deleteFoodLog: (date: Date) => Promise<void>;
  
  // Meal-specific operations
  updateMeal: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner', mealData: any) => Promise<void>;
  updateSnack: (date: Date, snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData: any) => Promise<void>;
  updateHealthMetric: (date: Date, field: string, value: any) => Promise<void>;
  
  // Data loading and syncing
  loadFoodLog: (date: Date) => Promise<void>;
  syncAllData: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
  recordError: (operation: string, error: string, data?: any) => void;
  
  // Audit and compliance
  addAuditEntry: (audit: Omit<DataAudit, 'timestamp'>) => void;
  getAuditTrail: (dateRange?: { start: Date; end: Date }) => DataAudit[];
  
  // Emergency data recovery
  recoverFromLocalStorage: () => Promise<void>;
  validateAllData: () => Promise<{ valid: number; invalid: number; errors: string[] }>;
}

// Create the store with middleware for subscriptions
export const useFoodLogStore = create<FoodLogState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    logs: new Map(),
    currentDate: getDateKey(new Date()),
    loading: false,
    saving: false,
    syncing: false,
    error: null,
    auditTrail: [],
    errors: [],
    userId: null,

    // Set current date
    setCurrentDate: (date: Date) => {
      const dateKey = getDateKey(date);
      set({ currentDate: dateKey });
      // Note: Removed auto-load to prevent circular dependencies
      // Components should explicitly call loadFoodLog when needed
    },

    // Set user ID and trigger data sync
    setUserId: (userId: string | null) => {
      set({ userId });
      if (userId) {
        get().syncAllData();
      }
    },

    // Get food log with validation
    getFoodLog: (date: Date) => {
      const dateKey = getDateKey(date);
      return get().logs.get(dateKey) || null;
    },

    // Update food log with comprehensive validation
    updateFoodLog: async (date: Date, updates: Partial<ValidatedFoodLog>) => {
      const state = get();
      const dateKey = getDateKey(date);
      
      try {
        set({ saving: true, error: null });
        
        // Get current data or create empty structure
        const currentLog = state.logs.get(dateKey) || createEmptyValidatedFoodLog(date);
        
        // Merge updates with current data
        const updatedLog = {
          ...currentLog,
          ...updates,
          updatedAt: new Date().toISOString(),
          userId: state.userId || undefined,
        };
        
        // CRITICAL: Validate all data before saving
        const validation = validateFoodLog(updatedLog);
        if (!validation.success) {
          const errorMsg = `Validation failed: ${validation.errors?.join(', ')}`;
          state.recordError('updateFoodLog', errorMsg, updatedLog);
          throw new Error(errorMsg);
        }
        
        // Update in-memory store (single source of truth)
        const newLogs = new Map(state.logs);
        newLogs.set(dateKey, validation.data!);
        set({ logs: newLogs });
        
        // Add audit entry
        state.addAuditEntry({
          userId: state.userId || 'anonymous',
          action: 'update',
          source: 'user',
        });
        
        // Persist to Firestore if user is authenticated
        if (state.userId) {
          try {
            const result = await firestoreService.upsertFoodLog(validation.data!);
            if (!result.success) {
              throw new Error(result.error || 'Firestore save failed');
            }
          } catch (error) {
            // Record error but don't fail the operation - data is safe in memory
            state.recordError('firestore_save', error instanceof Error ? error.message : 'Unknown error');
            console.error('Firestore save failed, data preserved in memory:', error);
          }
        }
        
        set({ saving: false });
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Update failed';
        set({ saving: false, error: errorMsg });
        state.recordError('updateFoodLog', errorMsg, updates);
        throw error;
      }
    },

    // Delete food log
    deleteFoodLog: async (date: Date) => {
      const state = get();
      const dateKey = getDateKey(date);
      
      try {
        set({ saving: true, error: null });
        
        const currentLog = state.logs.get(dateKey);
        
        // Remove from memory
        const newLogs = new Map(state.logs);
        newLogs.delete(dateKey);
        set({ logs: newLogs });
        
        // Add audit entry
        state.addAuditEntry({
          userId: state.userId || 'anonymous',
          action: 'delete',
          source: 'user',
        });
        
        // Delete from Firestore if authenticated
        if (state.userId && currentLog?.id) {
          try {
            await firestoreService.deleteFoodLog(currentLog.id);
          } catch (error) {
            state.recordError('firestore_delete', error instanceof Error ? error.message : 'Delete failed');
          }
        }
        
        set({ saving: false });
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Delete failed';
        set({ saving: false, error: errorMsg });
        throw error;
      }
    },

    // Update specific meal
    updateMeal: async (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner', mealData: any) => {
      const updates = { [mealType]: mealData };
      await get().updateFoodLog(date, updates);
    },

    // Update specific snack
    updateSnack: async (date: Date, snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData: any) => {
      const updates = { [snackType]: snackData };
      await get().updateFoodLog(date, updates);
    },

    // Update health metric
    updateHealthMetric: async (date: Date, field: string, value: any) => {
      const updates = { [field]: value };
      await get().updateFoodLog(date, updates);
    },

    // Load food log from Firestore
    loadFoodLog: async (date: Date) => {
      const state = get();
      const dateKey = getDateKey(date);
      
      // Don't reload if already loading or data exists
      if (state.loading || state.logs.has(dateKey)) {
        return;
      }
      
      try {
        set({ loading: true, error: null });
        
        let foodLog: ValidatedFoodLog | null = null;
        
        // Try Firestore first if authenticated
        if (state.userId) {
          try {
            const result = await firestoreService.getFoodLogByDate(state.userId, dateKey);
            if (result.success && result.data) {
              // Validate and migrate data from Firestore
              const validation = validateAndMigrateFoodLog(result.data);
              if (validation.success) {
                foodLog = validation.data!;
              } else {
                state.recordError('validation', `Firestore data invalid: ${validation.errors?.join(', ')}`);
              }
            }
          } catch (error) {
            state.recordError('firestore_load', error instanceof Error ? error.message : 'Load failed');
          }
        }
        
        // Create empty log if no data found
        if (!foodLog) {
          foodLog = createEmptyValidatedFoodLog(date);
        }
        
        // Update store
        const newLogs = new Map(state.logs);
        newLogs.set(dateKey, foodLog);
        set({ logs: newLogs, loading: false });
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Load failed';
        set({ loading: false, error: errorMsg });
        state.recordError('loadFoodLog', errorMsg);
      }
    },

    // Sync all data
    syncAllData: async () => {
      const state = get();
      if (!state.userId) return;
      
      try {
        set({ syncing: true });
        
        // Get all logs for the user from Firestore
        const result = await firestoreService.getFoodLogs(state.userId, 100);
        if (result.success && result.data) {
          const newLogs = new Map(state.logs);
          
          for (const log of result.data) {
            const validation = validateAndMigrateFoodLog(log);
            if (validation.success) {
              newLogs.set(log.date, validation.data!);
            }
          }
          
          set({ logs: newLogs });
        }
        
        set({ syncing: false });
        
      } catch (error) {
        set({ syncing: false });
        state.recordError('syncAllData', error instanceof Error ? error.message : 'Sync failed');
      }
    },

    // Error handling
    clearError: () => set({ error: null }),
    
    recordError: (operation: string, error: string, data?: any) => {
      const state = get();
      const errorEntry: DataError = {
        timestamp: new Date().toISOString(),
        operation,
        error,
        data,
        resolved: false,
      };
      
      set({ 
        errors: [...state.errors, errorEntry].slice(-100) // Keep last 100 errors
      });
    },

    // Audit trail
    addAuditEntry: (audit: Omit<DataAudit, 'timestamp'>) => {
      const state = get();
      const auditEntry: DataAudit = {
        ...audit,
        timestamp: new Date().toISOString(),
      };
      
      set({ 
        auditTrail: [...state.auditTrail, auditEntry].slice(-1000) // Keep last 1000 entries
      });
    },

    getAuditTrail: (dateRange?: { start: Date; end: Date }) => {
      const trail = get().auditTrail;
      if (!dateRange) return trail;
      
      return trail.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    },

    // Emergency recovery
    recoverFromLocalStorage: async () => {
      const state = get();
      try {
        const recovered = new Map<string, ValidatedFoodLog>();
        
        // Scan localStorage for food logs
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('foodLog_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              const validation = validateAndMigrateFoodLog(data);
              if (validation.success) {
                recovered.set(validation.data!.date, validation.data!);
              }
            } catch (error) {
              state.recordError('localStorage_recovery', `Failed to recover ${key}`, error);
            }
          }
        }
        
        // Merge with current data
        const newLogs = new Map([...state.logs, ...recovered]);
        set({ logs: newLogs });
        
        state.addAuditEntry({
          userId: state.userId || 'anonymous',
          action: 'migrate',
          source: 'system',
        });
        
      } catch (error) {
        state.recordError('recoverFromLocalStorage', error instanceof Error ? error.message : 'Recovery failed');
      }
    },

    // Validate all data in store
    validateAllData: async () => {
      const state = get();
      let valid = 0;
      let invalid = 0;
      const errors: string[] = [];
      
      for (const [dateKey, log] of state.logs) {
        const validation = validateFoodLog(log);
        if (validation.success) {
          valid++;
        } else {
          invalid++;
          errors.push(`${dateKey}: ${validation.errors?.join(', ')}`);
        }
      }
      
      return { valid, invalid, errors };
    },
  }))
);

// Helper function to create empty validated food log
function createEmptyValidatedFoodLog(date: Date): ValidatedFoodLog {
  const now = new Date().toISOString();
  const dateKey = getDateKey(date);
  
  return {
    date: dateKey,
    breakfast: { time: '8:00 AM', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
    lunch: { time: '12:00 PM', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
    dinner: { time: '6:00 PM', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
    midMorningSnack: { time: '10:00 AM', snack: '' },
    midDaySnack: { time: '3:00 PM', snack: '' },
    nighttimeSnack: { time: '9:00 PM', snack: '' },
    bowelMovements: '',
    exercise: '',
    dailyWaterIntake: '',
    sleepQuality: 0,
    sleepHours: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

// Selector hooks for specific data
export const useCurrentFoodLog = () => useFoodLogStore(state => {
  const currentDate = new Date(state.currentDate.replace(/-/g, '/'));
  return state.getFoodLog(currentDate);
});

export const useFoodLogForDate = (date: Date) => useFoodLogStore(state => 
  state.getFoodLog(date)
);

export const useFoodLogErrors = () => useFoodLogStore(state => ({
  errors: state.errors,
  currentError: state.error,
}));

export const useFoodLogAudit = () => useFoodLogStore(state => ({
  auditTrail: state.auditTrail,
  getAuditTrail: state.getAuditTrail,
}));