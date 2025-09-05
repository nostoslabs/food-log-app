import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Activity, Trash2 } from 'lucide-react';
import { TextAreaField } from '../ui';

interface HealthMetricsData {
  bowelMovements: string;
  exercise: string;
  dailyWaterIntake: string;
}

interface QuickHealthMetricsEntryProps {
  initialData?: HealthMetricsData;
  onSave: (data: HealthMetricsData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const QuickHealthMetricsEntry: React.FC<QuickHealthMetricsEntryProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<HealthMetricsData>(initialData || {
    bowelMovements: '',
    exercise: '',
    dailyWaterIntake: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(healthData);
      onClose();
    } catch (error) {
      console.error('Failed to save health metrics:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof HealthMetricsData, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    const clearedData = {
      bowelMovements: '',
      exercise: '',
      dailyWaterIntake: ''
    };
    setHealthData(clearedData);
    setShowClearConfirmation(false);
  };

  const hasContent = Object.values(healthData).some(value => 
    value && value.toString().trim() !== ''
  );

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Health Metrics
              </h2>
              <p className="text-sm text-gray-500">Track your daily health indicators</p>
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
          <div className="space-y-5">
            <TextAreaField
              label="💩 Bowel Movements"
              value={healthData.bowelMovements}
              onChange={(value) => updateField('bowelMovements', value)}
              placeholder="e.g., 1 - normal consistency"
              rows={2}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextAreaField
                label="🏃 Exercise (minutes)"
                value={healthData.exercise}
                onChange={(value) => updateField('exercise', value)}
                placeholder="e.g., 30 minutes walking"
                rows={2}
              />
              
              <TextAreaField
                label="💧 Daily Water Intake (oz)"
                value={healthData.dailyWaterIntake}
                onChange={(value) => updateField('dailyWaterIntake', value)}
                placeholder="e.g., 64 oz"
                rows={2}
              />
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
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Health Metrics
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
                Are you sure you want to clear all health metrics data? This action cannot be undone.
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