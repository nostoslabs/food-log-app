import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Moon, Trash2 } from 'lucide-react';

interface SleepData {
  sleepQuality: number;
  sleepHours: string;
}

interface QuickSleepEntryProps {
  initialData?: SleepData;
  onSave: (data: SleepData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const QuickSleepEntry: React.FC<QuickSleepEntryProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [sleepData, setSleepData] = useState<SleepData>(initialData || {
    sleepQuality: 0,
    sleepHours: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(sleepData);
      onClose();
    } catch (error) {
      console.error('Failed to save sleep data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSleepHours = (hours: string) => {
    setSleepData(prev => ({ ...prev, sleepHours: hours }));
  };

  const updateSleepQuality = (quality: number) => {
    setSleepData(prev => ({ ...prev, sleepQuality: quality }));
  };

  const handleClear = () => {
    const clearedData = {
      sleepQuality: 0,
      sleepHours: ''
    };
    setSleepData(clearedData);
    setSleepHours(8);
    setSleepMinutes(0);
    setShowClearConfirmation(false);
  };

  const hasContent = sleepData.sleepQuality > 0 || (sleepData.sleepHours && sleepData.sleepHours.trim() !== '');

  const getSleepQualityLabel = (quality: number) => {
    if (quality === 0) return "";
    if (quality <= 20) return "Very Poor";
    if (quality <= 40) return "Poor";
    if (quality <= 60) return "Fair";
    if (quality <= 80) return "Good";
    return "Excellent";
  };

  // Parse sleep hours from string format like "8h 30m" or "8.5"
  const parseSleepHours = (sleepStr: string) => {
    if (!sleepStr) return { hours: 8, minutes: 0 };
    
    // Check for "Xh Ym" format
    const hourMinMatch = sleepStr.match(/(\d+)h\s*(\d+)m/);
    if (hourMinMatch) {
      return { 
        hours: parseInt(hourMinMatch[1], 10), 
        minutes: parseInt(hourMinMatch[2], 10) 
      };
    }
    
    // Check for decimal format like "8.5"
    const decimalMatch = sleepStr.match(/^(\d+(?:\.\d+)?)$/);
    if (decimalMatch) {
      const totalHours = parseFloat(decimalMatch[1]);
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      return { hours, minutes };
    }
    
    // Default fallback
    return { hours: 8, minutes: 0 };
  };

  const formatSleepHours = (hours: number, minutes: number) => {
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const initialSleep = parseSleepHours(sleepData.sleepHours);
  const [sleepHours, setSleepHours] = useState(initialSleep.hours);
  const [sleepMinutes, setSleepMinutes] = useState(initialSleep.minutes);

  // Update sleepHours string when hours/minutes change
  React.useEffect(() => {
    const formattedSleep = formatSleepHours(sleepHours, sleepMinutes);
    updateSleepHours(formattedSleep);
  }, [sleepHours, sleepMinutes]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Moon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Sleep Tracking
              </h2>
              <p className="text-sm text-gray-500">Log your sleep quality and duration</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Sleep Quality Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                Sleep Quality: {sleepData.sleepQuality}%
              </label>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sleepData.sleepQuality}
                  onChange={(e) => updateSleepQuality(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${sleepData.sleepQuality}%, #e5e7eb ${sleepData.sleepQuality}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Poor (0%)</span>
                  <span>Excellent (100%)</span>
                </div>
              </div>
              
              {sleepData.sleepQuality > 0 && (
                <motion.div 
                  className="mt-3 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <Moon className="w-4 h-4" />
                    {getSleepQualityLabel(sleepData.sleepQuality)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Sleep Duration - Hours and Minutes */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                🛌 Sleep Duration
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Minutes</label>
                  <select
                    value={sleepMinutes}
                    onChange={(e) => setSleepMinutes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[0, 15, 30, 45].map(min => (
                      <option key={min} value={min}>{min} min</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-500 text-center">
                Total: {formatSleepHours(sleepHours, sleepMinutes)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            {hasContent && (
              <button
                onClick={() => setShowClearConfirmation(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={!hasContent || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Sleep Data
              </>
            )}
          </button>
        </div>

        {/* Clear Confirmation Dialog */}
        {showClearConfirmation && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Clear All Data?</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear all sleep data? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirmation(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};