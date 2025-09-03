import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import type { MealData } from '../../types';
import { TimeInput, TextAreaField } from '../ui';

interface QuickMealEntryProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  initialData?: MealData;
  onSave: (mealData: MealData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const QuickMealEntry: React.FC<QuickMealEntryProps> = ({
  mealType,
  initialData,
  onSave,
  onClose,
}) => {
  const [mealData, setMealData] = useState<MealData>(initialData || {
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    meatDairy: '',
    vegetablesFruits: '',
    breadsCerealsGrains: '',
    fats: '',
    candySweets: '',
    waterIntake: '',
    otherDrinks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const mealDisplayNames = {
    breakfast: 'Breakfast',
    lunch: 'Lunch', 
    dinner: 'Dinner'
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(mealData);
      onClose();
    } catch (error) {
      console.error('Failed to save meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof MealData, value: string) => {
    setMealData(prev => ({ ...prev, [field]: value }));
  };

  const hasContent = Object.values(mealData).some(value => 
    value && value.toString().trim() !== ''
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mealDisplayNames[mealType]}
              </h2>
              <p className="text-sm text-gray-500">Add your meal details</p>
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
        <div className="p-6 overflow-y-auto">
          <div className="space-y-5">
            <TimeInput
              label="Time"
              value={mealData.time}
              onChange={(value) => updateField('time', value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextAreaField
                label="🥩 Meat & Dairy"
                value={mealData.meatDairy}
                onChange={(value) => updateField('meatDairy', value)}
                placeholder="e.g., chicken breast, greek yogurt, eggs..."
                rows={2}
              />
              
              <TextAreaField
                label="🥬 Vegetables & Fruits"
                value={mealData.vegetablesFruits}
                onChange={(value) => updateField('vegetablesFruits', value)}
                placeholder="e.g., spinach salad, apple, carrots..."
                rows={2}
              />
              
              <TextAreaField
                label="🍞 Breads & Grains"
                value={mealData.breadsCerealsGrains}
                onChange={(value) => updateField('breadsCerealsGrains', value)}
                placeholder="e.g., brown rice, whole wheat bread..."
                rows={2}
              />
              
              <TextAreaField
                label="🥑 Fats & Oils"
                value={mealData.fats}
                onChange={(value) => updateField('fats', value)}
                placeholder="e.g., olive oil, avocado, nuts..."
                rows={2}
              />
              
              <TextAreaField
                label="🍭 Sweets & Treats"
                value={mealData.candySweets}
                onChange={(value) => updateField('candySweets', value)}
                placeholder="e.g., dark chocolate, cookies..."
                rows={2}
              />
              
              <div className="space-y-4">
                <TextAreaField
                  label="💧 Water with Meal"
                  value={mealData.waterIntake}
                  onChange={(value) => updateField('waterIntake', value)}
                  placeholder="e.g., 16 oz water"
                  rows={1}
                />
                
                <TextAreaField
                  label="🥤 Other Drinks"
                  value={mealData.otherDrinks}
                  onChange={(value) => updateField('otherDrinks', value)}
                  placeholder="e.g., coffee, tea, juice..."
                  rows={1}
                />
              </div>
            </div>
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
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save {mealDisplayNames[mealType]}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};