import { useState, useCallback } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays } from 'date-fns';
import { exportService, type ExportOptions, type ExportResult } from '../services/exportService';
import { firestoreService } from '../services/firestore';
import { validateAndMigrateFoodLog } from '../schemas/foodLogSchema';
import type { FoodLog } from '../types';

export type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export interface UseExportOptions {
  userId?: string;
}

export function useExport(options: UseExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Helper function to get date range based on preset
  const getDateRange = useCallback((preset: DatePreset, customStart?: string, customEnd?: string) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
      
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          start: format(yesterday, 'yyyy-MM-dd'),
          end: format(yesterday, 'yyyy-MM-dd')
        };
      
      case 'thisWeek':
        return {
          start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        };
      
      case 'lastWeek':
        const lastWeek = subDays(today, 7);
        return {
          start: format(startOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        };
      
      case 'thisMonth':
        return {
          start: format(startOfMonth(today), 'yyyy-MM-dd'),
          end: format(endOfMonth(today), 'yyyy-MM-dd')
        };
      
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
        };
      
      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom date range requires both start and end dates');
        }
        return {
          start: customStart,
          end: customEnd
        };
      
      default:
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
    }
  }, []);

  // Get food logs from localStorage if no userId provided
  const getFoodLogsFromLocalStorage = useCallback((startDate: string, endDate: string): FoodLog[] => {
    try {
      const logs: FoodLog[] = [];
      
      // Get all localStorage keys that match the foodLog pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('foodLog_')) {
          const dateFromKey = key.replace('foodLog_', '');
          
          // Check if this date falls within our range
          if (dateFromKey >= startDate && dateFromKey <= endDate) {
            const stored = localStorage.getItem(key);
            if (stored) {
              const log = JSON.parse(stored);
              
              // Transform the data structure to match our FoodLog type
              const transformedLog: FoodLog = {
                date: log.date,
                breakfast: log.breakfast || {
                  time: '',
                  meatDairy: '',
                  vegetablesFruits: '',
                  breadsCerealsGrains: '',
                  fats: '',
                  candySweets: '',
                  waterIntake: '',
                  otherDrinks: ''
                },
                lunch: log.lunch || {
                  time: '',
                  meatDairy: '',
                  vegetablesFruits: '',
                  breadsCerealsGrains: '',
                  fats: '',
                  candySweets: '',
                  waterIntake: '',
                  otherDrinks: ''
                },
                dinner: log.dinner || {
                  time: '',
                  meatDairy: '',
                  vegetablesFruits: '',
                  breadsCerealsGrains: '',
                  fats: '',
                  candySweets: '',
                  waterIntake: '',
                  otherDrinks: ''
                },
                midMorningSnack: log.midMorningSnack || {
                  time: '',
                  snack: ''
                },
                midDaySnack: log.midDaySnack || {
                  time: '',
                  snack: ''
                },
                nighttimeSnack: log.nighttimeSnack || {
                  time: '',
                  snack: ''
                },
                bowelMovements: log.bowelMovements || '',
                exercise: log.exercise || '',
                dailyWaterIntake: log.dailyWaterIntake || '',
                sleepQuality: log.sleepQuality || 0,
                sleepHours: log.sleepHours || '',
                notes: log.notes || '',
                createdAt: log.createdAt || new Date().toISOString(),
                updatedAt: log.updatedAt || new Date().toISOString()
              };
              
              // CRITICAL: Migrate and validate localStorage data before export
              const validation = validateAndMigrateFoodLog(transformedLog);
              if (validation.success && validation.data) {
                logs.push(validation.data);
              } else {
                console.warn(`Export localStorage validation failed for ${transformedLog.date}:`, validation.errors);
                // Include original log if migration fails to prevent data loss
                logs.push(transformedLog);
              }
            }
          }
        }
      }
      
      // Sort by date
      return logs.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }, []);

  // Fetch food logs for the specified date range
  const fetchFoodLogs = useCallback(async (dateRange: { start: string; end: string }): Promise<FoodLog[]> => {
    setExportProgress(20);

    if (!options.userId) {
      // Use localStorage for unauthenticated users
      const logs = getFoodLogsFromLocalStorage(dateRange.start, dateRange.end);
      setExportProgress(50);
      return logs;
    }

    try {
      const result = await firestoreService.getFoodLogsByDateRange(
        options.userId,
        dateRange.start,
        dateRange.end
      );

      setExportProgress(50);

      if (result.success && result.data) {
        // CRITICAL: Migrate and validate all data before export
        const migratedLogs: FoodLog[] = [];
        
        for (const log of result.data) {
          const validation = validateAndMigrateFoodLog(log);
          if (validation.success && validation.data) {
            migratedLogs.push(validation.data);
          } else {
            console.warn(`Export data validation failed for ${log.date}:`, validation.errors);
            // Include original log if migration fails to prevent data loss
            migratedLogs.push(log);
          }
        }
        
        return migratedLogs;
      } else {
        throw new Error(result.error || 'Failed to fetch food logs');
      }
    } catch (error) {
      console.error('Error fetching food logs:', error);
      throw error;
    }
  }, [options.userId, getFoodLogsFromLocalStorage]);

  // Main export function
  const exportData = useCallback(async (
    exportOptions: Omit<ExportOptions, 'dateRange' | 'exportFormat'> & {
      format: 'pdf' | 'text' | 'json';
      datePreset: DatePreset;
      customStartDate?: string;
      customEndDate?: string;
      autoDownload?: boolean;
    }
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setError(null);
    setExportProgress(0);

    try {
      // Get date range
      const dateRange = getDateRange(
        exportOptions.datePreset,
        exportOptions.customStartDate,
        exportOptions.customEndDate
      );

      setExportProgress(10);

      // Fetch food logs
      const foodLogs = await fetchFoodLogs(dateRange);
      
      if (foodLogs.length === 0) {
        throw new Error('No food logs found for the selected date range');
      }

      setExportProgress(60);

      // Prepare export options
      const fullExportOptions: ExportOptions = {
        exportFormat: exportOptions.format,
        dateRange,
        includeMetadata: exportOptions.includeMetadata ?? true,
        includeHealthMetrics: exportOptions.includeHealthMetrics ?? true,
        title: exportOptions.title
      };

      setExportProgress(70);

      // Generate export based on format
      let result: ExportResult;
      
      switch (exportOptions.format) {
        case 'pdf':
          result = await exportService.exportToPDF(foodLogs, fullExportOptions);
          break;
        case 'text':
          result = await exportService.exportToText(foodLogs, fullExportOptions);
          break;
        case 'json':
          result = await exportService.exportToJSON(foodLogs, fullExportOptions);
          break;
        default:
          throw new Error(`Unsupported export format: ${exportOptions.format}`);
      }

      setExportProgress(90);

      if (!result.success) {
        throw new Error(result.error || 'Export failed');
      }

      // Auto-download if requested
      if (exportOptions.autoDownload !== false) {
        await exportService.downloadFile(result);
      }

      setExportProgress(100);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsExporting(false);
      // Reset progress after a delay
      setTimeout(() => setExportProgress(0), 2000);
    }
  }, [getDateRange, fetchFoodLogs]);

  // Quick export functions for common use cases
  const exportToday = useCallback(async (exportFormat: 'pdf' | 'text' | 'json' = 'pdf') => {
    return exportData({
      format: exportFormat,
      datePreset: 'today',
      title: `Daily Food Log - ${format(new Date(), 'MMM d, yyyy')}`
    });
  }, [exportData]);

  const exportThisWeek = useCallback(async (exportFormat: 'pdf' | 'text' | 'json' = 'pdf') => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    return exportData({
      format: exportFormat,
      datePreset: 'thisWeek',
      title: `Weekly Food Log - ${format(weekStart, 'MMM d')} to ${format(weekEnd, 'MMM d, yyyy')}`
    });
  }, [exportData]);

  const exportThisMonth = useCallback(async (exportFormat: 'pdf' | 'text' | 'json' = 'pdf') => {
    return exportData({
      format: exportFormat,
      datePreset: 'thisMonth',
      title: `Monthly Food Log - ${format(new Date(), 'MMMM yyyy')}`
    });
  }, [exportData]);

  const exportForDoctor = useCallback(async (datePreset: DatePreset = 'thisWeek') => {
    return exportData({
      format: 'pdf',
      datePreset,
      title: 'Food & Health Log Report for Healthcare Provider',
      includeMetadata: true,
      includeHealthMetrics: true
    });
  }, [exportData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isExporting,
    error,
    exportProgress,

    // Main export function
    exportData,

    // Quick export functions
    exportToday,
    exportThisWeek,
    exportThisMonth,
    exportForDoctor,

    // Utilities
    getDateRange,
    clearError,

    // Helper to check if data exists for a date range
    checkDataAvailability: useCallback(async (datePreset: DatePreset, customStart?: string, customEnd?: string) => {
      try {
        const dateRange = getDateRange(datePreset, customStart, customEnd);
        const foodLogs = await fetchFoodLogs(dateRange);
        return {
          hasData: foodLogs.length > 0,
          count: foodLogs.length,
          dateRange
        };
      } catch (error) {
        return {
          hasData: false,
          count: 0,
          dateRange: { start: '', end: '' },
          error: error instanceof Error ? error.message : 'Failed to check data'
        };
      }
    }, [getDateRange, fetchFoodLogs])
  };
}