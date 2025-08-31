import { useState } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { ExportOptions, FoodLog } from '../types';
import { useAuth } from './useAuth';
import { firestoreService } from '../services/firestore';
import { PDFExportService } from '../services/pdfExport';
import { generatePlainTextExport, getDateKey, loadFromLocalStorage } from '../utils';

export function useExport(currentDate: Date) {
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
  const setDateRange = (type: 'today' | 'week' | 'month') => {
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
  };

  // Get logs for export
  const getLogsForExport = async (): Promise<FoodLog[]> => {
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
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      const logs = await getLogsForExport();
      
      if (logs.length === 0) {
        throw new Error('No food log data found for the selected date range');
      }

      const exportData = {
        logs,
        user: user || { uid: 'anonymous', email: null, displayName: 'Anonymous User', photoURL: null },
        options: exportOptions,
        generatedAt: new Date().toISOString()
      };
      
      await PDFExportService.downloadPDF(exportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  // Export as text
  const exportAsText = async () => {
    setLoading(true);
    setError(null);

    try {
      const logs = await getLogsForExport();
      
      if (logs.length === 0) {
        throw new Error('No food log data found for the selected date range');
      }

      const textContent = generatePlainTextExport(logs);
      
      // Download as text file
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `food-log-${exportOptions.startDate}-to-${exportOptions.endDate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    exportOptions,
    setExportOptions,
    loading,
    error,
    setDateRange,
    exportAsPDF,
    exportAsText,
    clearError
  };
}