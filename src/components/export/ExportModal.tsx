import React, { useState } from 'react';
import { X, Download, Loader2, FileText } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { ExportOptions, ExportData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { firestoreService } from '../../services/firestore';
import { PDFExportService } from '../../services/pdfExport';
import { generatePlainTextExport, getDateKey } from '../../utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, currentDate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    startDate: getDateKey(currentDate),
    endDate: getDateKey(currentDate),
    includeHealthMetrics: true,
    includeNotes: true
  });
  const [exportFormat, setExportFormat] = useState<'pdf' | 'text'>('pdf');

  // Preset date ranges
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

  // Handle export
  const handleExport = async () => {
    if (!user) {
      setError('Please sign in to export your food logs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch food logs for the date range
      const result = await firestoreService.getFoodLogsByDateRange(
        user.uid,
        exportOptions.startDate,
        exportOptions.endDate
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch food logs');
      }

      const logs = result.data || [];

      if (logs.length === 0) {
        setError('No food logs found for the selected date range');
        return;
      }

      // Create export data
      const exportData: ExportData = {
        logs,
        user,
        options: exportOptions,
        generatedAt: new Date().toISOString()
      };

      // Export based on format
      if (exportFormat === 'pdf') {
        await PDFExportService.downloadPDF(exportData);
      } else {
        // Text export
        const textContent = generatePlainTextExport(logs);
        const filename = `food-log-${exportOptions.startDate}${exportOptions.startDate !== exportOptions.endDate ? `-to-${exportOptions.endDate}` : ''}.txt`;
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Export Food Log</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!user && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              Please sign in to export your food logs from the cloud. Local data export is not yet available.
            </div>
          )}

          {/* Date Range Selection */}
          <div>
            <label className="form-label">Date Range</label>
            
            {/* Preset buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setDateRange('today')}
                className="btn-secondary text-xs py-1 px-2"
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('week')}
                className="btn-secondary text-xs py-1 px-2"
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className="btn-secondary text-xs py-1 px-2"
              >
                This Month
              </button>
            </div>

            {/* Custom date inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={exportOptions.startDate}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={exportOptions.endDate}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="form-label">Export Format</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'text')}
                  className="text-primary-600"
                />
                <FileText className="w-4 h-4 text-red-600" />
                <span className="text-sm">PDF Document</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="text"
                  checked={exportFormat === 'text'}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'text')}
                  className="text-primary-600"
                />
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Text File</span>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="form-label">Include Sections</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeHealthMetrics}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeHealthMetrics: e.target.checked
                  }))}
                  className="text-primary-600"
                />
                <span className="text-sm">Health Metrics</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeNotes}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeNotes: e.target.checked
                  }))}
                  className="text-primary-600"
                />
                <span className="text-sm">Notes</span>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs">
              💡 This export is perfect for sharing with your doctor or healthcare provider. 
              It includes all your food intake and health metrics in a professional format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={handleExport}
            disabled={loading || !user}
            className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;