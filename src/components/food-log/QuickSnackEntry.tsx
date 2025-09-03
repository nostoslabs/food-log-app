import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import type { SnackData } from '../../types';
import { TimeInput, TextAreaField } from '../ui';

interface QuickSnackEntryProps {
  snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack';
  initialData?: SnackData;
  onSave: (snackData: SnackData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const QuickSnackEntry: React.FC<QuickSnackEntryProps> = ({
  snackType,
  initialData,
  onSave,
  onClose,
}) => {
  const [snackData, setSnackData] = useState<SnackData>(initialData || {
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    snack: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const snackDisplayNames = {
    midMorningSnack: 'Mid-Morning Snack',
    midDaySnack: 'Afternoon Snack', 
    nighttimeSnack: 'Evening Snack'
  };

  const snackEmojis = {
    midMorningSnack: '🌅',
    midDaySnack: '☀️',
    nighttimeSnack: '🌙'
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(snackData);
      onClose();
    } catch (error) {
      console.error('Failed to save snack:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof SnackData, value: string) => {
    setSnackData(prev => ({ ...prev, [field]: value }));
  };

  const hasContent = snackData.snack.trim() !== '';

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-2xl">{snackEmojis[snackType]}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {snackDisplayNames[snackType]}
              </h2>
              <p className="text-sm text-gray-500">Add your snack details</p>
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
        <div className="p-6">
          <div className="space-y-5">
            <TimeInput
              label="Time"
              value={snackData.time}
              onChange={(value) => updateField('time', value)}
            />
            
            <TextAreaField
              label="🍎 What did you snack on?"
              value={snackData.snack}
              onChange={(value) => updateField('snack', value)}
              placeholder="e.g., apple with peanut butter, trail mix, yogurt..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
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
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Snack
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};