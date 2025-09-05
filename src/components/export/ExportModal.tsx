import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Download, 
  FileIcon, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format as formatDate, parseISO, isValid } from 'date-fns';
import { useExport, type DatePreset } from '../../hooks/useExport';
import { useAuth } from '../../hooks/useAuth';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormat?: 'pdf' | 'text' | 'json';
  initialPreset?: DatePreset;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  initialFormat = 'pdf',
  initialPreset = 'thisWeek'
}) => {
  const { user } = useAuth();
  const { 
    exportData, 
    isExporting, 
    error, 
    exportProgress, 
    clearError,
    checkDataAvailability 
  } = useExport({ userId: user?.uid });

  const [format, setFormat] = useState<'pdf' | 'text' | 'json'>(initialFormat);
  const [datePreset, setDatePreset] = useState<DatePreset>(initialPreset);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeHealthMetrics, setIncludeHealthMetrics] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [dataAvailability, setDataAvailability] = useState<{ hasData: boolean; count: number; dateRange: any } | null>(null);
  const [isCheckingData, setIsCheckingData] = useState(false);

  // Check data availability when date range changes
  useEffect(() => {
    const checkData = async () => {
      setIsCheckingData(true);
      try {
        const result = await checkDataAvailability(
          datePreset, 
          datePreset === 'custom' ? customStartDate : undefined,
          datePreset === 'custom' ? customEndDate : undefined
        );
        setDataAvailability(result);
      } catch (error) {
        console.error('Error checking data availability:', error);
        setDataAvailability({ hasData: false, count: 0, dateRange: null });
      } finally {
        setIsCheckingData(false);
      }
    };

    if (isOpen) {
      checkData();
    }
  }, [datePreset, customStartDate, customEndDate, isOpen, checkDataAvailability]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      clearError();
      setFormat(initialFormat);
      setDatePreset(initialPreset);
      setCustomTitle('');
    }
  }, [isOpen, initialFormat, initialPreset, clearError]);

  const handleExport = async () => {
    clearError();
    
    try {
      const result = await exportData({
        format,
        datePreset,
        customStartDate: datePreset === 'custom' ? customStartDate : undefined,
        customEndDate: datePreset === 'custom' ? customEndDate : undefined,
        includeHealthMetrics,
        title: customTitle || undefined,
        autoDownload: true
      });

      if (result.success) {
        // Close modal after successful export
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const isFormValid = () => {
    if (datePreset === 'custom') {
      return customStartDate && customEndDate && 
             isValid(parseISO(customStartDate)) && 
             isValid(parseISO(customEndDate)) &&
             customStartDate <= customEndDate;
    }
    return true;
  };

  const getDateRangeDisplay = () => {
    if (!dataAvailability?.dateRange) return '';
    
    const { start, end } = dataAvailability.dateRange;
    const startDate = formatDate(parseISO(start), 'MMM d, yyyy');
    const endDate = formatDate(parseISO(end), 'MMM d, yyyy');
    
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Professional format for healthcare providers' },
    { value: 'text', label: 'Text File', icon: FileIcon, description: 'Simple text format for viewing and editing' },
    { value: 'json', label: 'JSON Data', icon: FileIcon, description: 'Raw data format for analysis tools' }
  ] as const;

  const datePresetOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
                  <p className="text-sm text-gray-500">Download your food logs</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isExporting}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="space-y-2">
                  {formatOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setFormat(option.value)}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                        format === option.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isExporting}
                    >
                      <div className="flex items-center gap-3">
                        <option.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs opacity-70">{option.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {datePresetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDatePreset(option.value)}
                      className={`p-3 border-2 rounded-lg text-sm transition-all ${
                        datePreset === option.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isExporting}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Inputs */}
                {datePreset === 'custom' && (
                  <motion.div
                    className="grid grid-cols-2 gap-3 mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isExporting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isExporting}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Data availability check */}
              {isCheckingData ? (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600">Checking data availability...</span>
                </div>
              ) : dataAvailability && (
                <div className={`rounded-lg p-3 flex items-center gap-3 ${
                  dataAvailability.hasData 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  {dataAvailability.hasData ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      dataAvailability.hasData ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {dataAvailability.hasData 
                        ? `${dataAvailability.count} entries found`
                        : 'No data found for this date range'
                      }
                    </div>
                    {dataAvailability.hasData && (
                      <div className={`text-xs ${
                        dataAvailability.hasData ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {getDateRangeDisplay()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Medical Report for Dr. Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isExporting}
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Include Health Metrics</label>
                    <p className="text-xs text-gray-500">Sleep, exercise, bowel movements, etc.</p>
                  </div>
                  <button
                    onClick={() => setIncludeHealthMetrics(!includeHealthMetrics)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeHealthMetrics ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                    disabled={isExporting}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeHealthMetrics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Export Failed</p>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Export Progress */}
              {isExporting && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Generating export... {exportProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-indigo-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 flex gap-3 p-6 rounded-b-2xl">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isExporting}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleExport}
                disabled={!isFormValid() || isExporting || !dataAvailability?.hasData}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;