import { useState, useCallback } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { ExportOptions, FoodLog } from '../types';
import { useAuth } from './useAuth';
import { firestoreService, exportService } from '../services';
import { getDateKey, loadFromLocalStorage } from '../utils';

export interface UseExportReturn {
  exportOptions: ExportOptions;
  setExportOptions: React.Dispatch<React.SetStateAction<ExportOptions>>;
  loading: boolean;
  error: string | null;
  setDateRange: (type: 'today' | 'week' | 'month') => void;
  exportAsText: () => Promise<void>;
  exportAsPDF: () => Promise<void>;
  clearError: () => void;
}

export function useExport(currentDate: Date): UseExportReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    startDate: getDateKey(currentDate),
    endDate: getDateKey(currentDate),
    includeHealthMetrics: true,
    includeNotes: true
  });

  // Set preset date ranges
  const setDateRange = useCallback((type: 'today' | 'week' | 'month') => {
    const today = currentDate;
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case 'today':
        startDate = endDate = today;
        break;
      case 'week':
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    setExportOptions(prev => ({
      ...prev,
      startDate: getDateKey(startDate),
      endDate: getDateKey(endDate)
    }));
  }, [currentDate]);

  // Get logs for export - separated into its own function for clarity
  const getLogsForExport = useCallback(async (): Promise<FoodLog[]> => {
    const logs: FoodLog[] = [];
    let firestoreError: string | null = null;

    if (user) {
      try {
        const result = await firestoreService.getFoodLogsByDateRange(
          user.uid,
          exportOptions.startDate,
          exportOptions.endDate
        );

        if (result.success && result.data) {
          logs.push(...result.data);
        } else if (result.error) {
          firestoreError = result.error;
          console.error('Firestore query failed:', result.error);
        }
      } catch (err) {
        firestoreError = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching logs from Firestore:', err);
      }
    }

    // Fill in missing dates with local storage data
    const startDate = new Date(exportOptions.startDate);
    const endDate = new Date(exportOptions.endDate);
    const existingDates = new Set(logs.map(log => log.date));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = getDateKey(d);
      if (!existingDates.has(dateKey)) {
        const localLog = loadFromLocalStorage(d);
        if (localLog) {
          logs.push(localLog);
        }
      }
    }

    // If no logs found and there was a Firestore error, throw a more specific error
    if (logs.length === 0 && firestoreError) {
      if (firestoreError.includes('index') || firestoreError.includes('Index')) {
        throw new Error('Export failed due to missing database index. Please contact support or try again later.');
      } else {
        throw new Error(`Failed to load data from cloud: ${firestoreError}`);
      }
    }

    return logs.sort((a, b) => a.date.localeCompare(b.date));
  }, [user, exportOptions.startDate, exportOptions.endDate]);

  // Export as text - simplified to use the service
  const exportAsText = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const logs = await getLogsForExport();
      await exportService.exportAsText(logs, exportOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, [getLogsForExport, exportOptions]);

  // Export as PDF - placeholder for now
  const exportAsPDF = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await exportService.exportAsPDF();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    exportOptions,
    setExportOptions,
    loading,
    error,
    setDateRange,
    exportAsText,
    exportAsPDF,
    clearError
  };
}