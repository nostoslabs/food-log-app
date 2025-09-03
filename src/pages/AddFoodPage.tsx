import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Utensils, Cookie, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFoodLog, useDateNavigation } from '../hooks';
import { QuickMealEntry, QuickSnackEntry } from '../components';
import type { MealData, SnackData } from '../types';

const AddFoodPage: React.FC = () => {
  const { currentDate } = useDateNavigation();
  const { 
    foodLog, 
    loading, 
    error, 
    updateMeal, 
    updateSnack 
  } = useFoodLog(currentDate);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleMealSave = async (mealType: 'breakfast' | 'lunch' | 'dinner', mealData: MealData) => {
    try {
      // Update each field of the meal data
      Object.entries(mealData).forEach(([field, value]) => {
        updateMeal(mealType, field as keyof MealData, value as string);
      });
      setSaveSuccess(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} saved successfully!`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save meal:', error);
    }
  };

  const handleSnackSave = async (snackType: 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData: SnackData) => {
    try {
      // Update each field of the snack data
      Object.entries(snackData).forEach(([field, value]) => {
        updateSnack(snackType, field as keyof SnackData, value as string);
      });
      setSaveSuccess('Snack saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save snack:', error);
    }
  };

  const mealButtons = [
    { 
      key: 'breakfast', 
      label: 'Breakfast', 
      icon: '🌅', 
      color: 'from-amber-400 to-orange-500',
      data: foodLog.breakfast
    },
    { 
      key: 'lunch', 
      label: 'Lunch', 
      icon: '☀️', 
      color: 'from-green-500 to-emerald-500',
      data: foodLog.lunch
    },
    { 
      key: 'dinner', 
      label: 'Dinner', 
      icon: '🌆', 
      color: 'from-indigo-500 to-purple-500',
      data: foodLog.dinner
    }
  ];

  const snackButtons = [
    { 
      key: 'midMorningSnack', 
      label: 'Mid-Morning', 
      icon: '🍎', 
      color: 'from-green-400 to-teal-500',
      data: foodLog.midMorningSnack
    },
    { 
      key: 'midDaySnack', 
      label: 'Afternoon', 
      icon: '🥨', 
      color: 'from-blue-400 to-indigo-500',
      data: foodLog.midDaySnack
    },
    { 
      key: 'nighttimeSnack', 
      label: 'Evening', 
      icon: '🍪', 
      color: 'from-purple-400 to-pink-500',
      data: foodLog.nighttimeSnack
    }
  ];

  const hasContent = (data: MealData | SnackData) => {
    return Object.values(data).some(value => value && value.toString().trim() !== '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-lg font-medium">Loading your food log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Log Food</h1>
                <p className="text-white/80 text-sm mt-1">
                  {new Date(currentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Link 
              to="/legacy"
              className="text-xs text-white/80 hover:text-white bg-white/20 px-3 py-1 rounded-full transition-colors"
            >
              Full Form
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 text-sm font-medium">{saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Meals Section */}
      <motion.div 
        className="m-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Meals
        </h2>
        <div className="space-y-3">
          {mealButtons.map((meal, index) => (
            <motion.button
              key={meal.key}
              onClick={() => setActiveModal(meal.key)}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${meal.color} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{meal.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{meal.label}</h3>
                  {hasContent(meal.data) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {hasContent(meal.data) ? 'Logged - tap to edit' : `Add ${meal.label.toLowerCase()} items`}
                </p>
              </div>
              <Plus className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Snacks Section */}
      <motion.div 
        className="m-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Cookie className="w-5 h-5" />
          Snacks
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {snackButtons.map((snack, index) => (
            <motion.button
              key={snack.key}
              onClick={() => setActiveModal(snack.key)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${snack.color} flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{snack.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{snack.label} Snack</h3>
                  {hasContent(snack.data) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {hasContent(snack.data) ? 'Logged - tap to edit' : 'Add snack details'}
                </p>
              </div>
              <Plus className="w-4 h-4 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {/* Meal Modals */}
        {['breakfast', 'lunch', 'dinner'].includes(activeModal || '') && (
          <QuickMealEntry
            mealType={activeModal as 'breakfast' | 'lunch' | 'dinner'}
            initialData={foodLog[activeModal as 'breakfast' | 'lunch' | 'dinner']}
            onSave={(mealData) => handleMealSave(activeModal as 'breakfast' | 'lunch' | 'dinner', mealData)}
            onClose={() => setActiveModal(null)}
          />
        )}
        
        {/* Snack Modals */}
        {['midMorningSnack', 'midDaySnack', 'nighttimeSnack'].includes(activeModal || '') && (
          <QuickSnackEntry
            snackType={activeModal as 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack'}
            initialData={foodLog[activeModal as 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack']}
            onSave={(snackData) => handleSnackSave(activeModal as 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack', snackData)}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddFoodPage;