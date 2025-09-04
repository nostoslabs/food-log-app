import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Moon } from 'lucide-react';
import { NumberInput } from '../ui';

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

  const updateSleepQuality = (rating: number) => {
    setSleepData(prev => ({ ...prev, sleepQuality: rating }));
  };

  const updateSleepHours = (hours: string) => {
    setSleepData(prev => ({ ...prev, sleepHours: hours }));
  };

  const hasContent = sleepData.sleepQuality > 0 || (sleepData.sleepHours && sleepData.sleepHours.trim() !== '');

  const getSleepQualityLabel = (rating: number) => {
    const labels = {
      1: "Very Poor",
      2: "Poor", 
      3: "Fair",
      4: "Good",
      5: "Excellent"
    };
    return labels[rating as keyof typeof labels] || "";
  };

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
            {/* Sleep Quality Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Quality of Sleep
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Poor</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      type="button"
                      onClick={() => updateSleepQuality(rating)}
                      className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        sleepData.sleepQuality === rating
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:shadow-md'
                      }`}
                      whileHover={{ 
                        scale: 1.1,
                        y: -2,
                        boxShadow: sleepData.sleepQuality === rating 
                          ? '0 8px 25px rgba(147, 51, 234, 0.4)' 
                          : '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: rating * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      {rating}
                      {sleepData.sleepQuality === rating && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/20"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">Excellent</span>
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

            {/* Sleep Hours */}
            <div>
              <NumberInput
                label="🛌 Hours of Sleep"
                value={sleepData.sleepHours}
                onChange={updateSleepHours}
                placeholder="e.g., 8.0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
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
      </motion.div>
    </motion.div>
  );
};