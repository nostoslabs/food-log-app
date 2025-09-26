import { AnimatePresence,motion } from 'framer-motion';
import { Activity, AlertCircle, Calendar, CheckCircle, ChevronLeft, ChevronRight, Cookie, Loader2, Moon, Plus, Utensils } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { QuickHealthMetricsEntry, QuickMealEntry, QuickSleepEntry,QuickSnackEntry } from '../components';
import { getCompactEntryStyle } from '../config/entryStyles';
import { useDateNavigation,useFoodLog } from '../hooks';
import type { MealData, SnackData } from '../types';

const LogPage: React.FC = () => {
  const { currentDate, changeDate, goToToday } = useDateNavigation();
  const { 
    foodLog, 
    loading, 
    error, 
    updateMeal, 
    updateSnack,
    updateHealthMetric
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

  const handleHealthMetricsSave = async (healthData: { bowelMovements: string; exercise: string; dailyWaterIntake: string }) => {
    try {
      // Update each health metric field
      updateHealthMetric('bowelMovements', healthData.bowelMovements);
      updateHealthMetric('exercise', healthData.exercise);
      updateHealthMetric('dailyWaterIntake', healthData.dailyWaterIntake);
      setSaveSuccess('Health metrics saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save health metrics:', error);
    }
  };

  const handleSleepSave = async (sleepData: { sleepQuality: number; sleepHours: string }) => {
    try {
      // Update sleep fields
      updateHealthMetric('sleepQuality', sleepData.sleepQuality);
      updateHealthMetric('sleepHours', sleepData.sleepHours);
      setSaveSuccess('Sleep data saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save sleep data:', error);
    }
  };

  const mealButtons = [
    {
      key: 'breakfast' as const,
      label: 'Breakfast',
      type: 'breakfast' as const,
      data: foodLog.breakfast
    },
    {
      key: 'lunch' as const,
      label: 'Lunch',
      type: 'lunch' as const,
      data: foodLog.lunch
    },
    {
      key: 'dinner' as const,
      label: 'Dinner',
      type: 'dinner' as const,
      data: foodLog.dinner
    }
  ];

  const snackButtons = [
    {
      key: 'midMorningSnack' as const,
      label: 'Mid-Morning',
      type: 'snack' as const,
      data: foodLog.midMorningSnack
    },
    {
      key: 'midDaySnack' as const,
      label: 'Afternoon',
      type: 'snack' as const,
      data: foodLog.midDaySnack
    },
    {
      key: 'nighttimeSnack' as const,
      label: 'Evening',
      type: 'snack' as const,
      data: foodLog.nighttimeSnack
    }
  ];

  const hasContent = (data: MealData | SnackData) => {
    return Object.values(data).some(value => value && value.toString().trim() !== '');
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center pb-24 overflow-hidden">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-lg font-medium">Loading your log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background pb-24 overflow-hidden">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-brand-orange to-red-500 text-white shadow-lg sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              <h1 className="text-lg font-bold">Log</h1>
            </div>
            <Link 
              to="/legacy"
              className="text-xs text-white/80 hover:text-white bg-white/20 px-3 py-1 rounded-full transition-colors"
            >
              Full Form
            </Link>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <motion.button 
              onClick={() => changeDate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <div className="flex-1 text-center px-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-white font-semibold">
                  {new Date(currentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Today button if not today */}
              {new Date(currentDate).toDateString() !== new Date().toDateString() && (
                <button
                  onClick={goToToday}
                  className="text-xs text-white/80 hover:text-white bg-white/20 px-2 py-1 rounded-full transition-colors"
                >
                  Today
                </button>
              )}
            </div>
            
            <motion.button 
              onClick={() => changeDate(1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            className="mx-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
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
          className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {/* Meals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Meals
          </h2>
          <div className="space-y-2">
          {mealButtons.map((meal, index) => {
            const { icon: MealIcon, iconClasses, containerClasses } = getCompactEntryStyle(meal.type);
            return (
              <motion.button
                key={meal.key}
                onClick={() => setActiveModal(meal.key)}
                className="w-full bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={containerClasses}>
                  <MealIcon className={iconClasses} />
                </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{meal.label}</h3>
                  {hasContent(meal.data) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {hasContent(meal.data) ? 'Logged - tap to edit' : `Add ${meal.label.toLowerCase()} items`}
                </p>
                </div>
                <Plus className="w-5 h-5 text-gray-400" />
              </motion.button>
            );
          })}
          </div>
        </motion.div>

        {/* Snacks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
            <Cookie className="w-4 h-4" />
            Snacks
          </h2>
          <div className="grid grid-cols-1 gap-2">
          {snackButtons.map((snack, index) => {
            const { icon: SnackIcon, iconClasses, containerClasses } = getCompactEntryStyle(snack.type);
            return (
              <motion.button
                key={snack.key}
                onClick={() => setActiveModal(snack.key)}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={containerClasses}>
                  <SnackIcon className={iconClasses} />
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
            );
          })}
          </div>
        </motion.div>

        {/* Health Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health Metrics
          </h2>
          <motion.button
            onClick={() => setActiveModal('healthMetrics')}
            className="w-full bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
            {(() => {
              const { icon: HealthIcon, iconClasses, containerClasses } = getCompactEntryStyle('health');
              return (
                <div className={containerClasses}>
                  <HealthIcon className={iconClasses} />
                </div>
              );
            })()}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Health Tracking</h3>
              {(foodLog.bowelMovements || foodLog.exercise) && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
              <p className="text-xs text-gray-500">
                {(foodLog.bowelMovements || foodLog.exercise)
                  ? 'Logged - tap to edit'
                  : 'Add bowel movements, exercise'}
              </p>
          </div>
          <Plus className="w-5 h-5 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Sleep Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep
          </h2>
          <motion.button
            onClick={() => setActiveModal('sleep')}
            className="w-full bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
            {(() => {
              const { icon: SleepIcon, iconClasses, containerClasses } = getCompactEntryStyle('sleep');
              return (
                <div className={containerClasses}>
                  <SleepIcon className={iconClasses} />
                </div>
              );
            })()}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Sleep Tracking</h3>
              {(foodLog.sleepQuality > 0 || foodLog.sleepHours) && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
              <p className="text-xs text-gray-500">
                {(foodLog.sleepQuality > 0 || foodLog.sleepHours)
                  ? 'Logged - tap to edit'
                  : 'Add sleep quality and hours'}
              </p>
          </div>
          <Plus className="w-5 h-5 text-gray-400" />
          </motion.button>
        </motion.div>
      </div>

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

        {/* Health Metrics Modal */}
        {activeModal === 'healthMetrics' && (
          <QuickHealthMetricsEntry
            initialData={{
              bowelMovements: foodLog.bowelMovements || '',
              exercise: foodLog.exercise || '',
              dailyWaterIntake: foodLog.dailyWaterIntake || ''
            }}
            onSave={handleHealthMetricsSave}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Sleep Modal */}
        {activeModal === 'sleep' && (
          <QuickSleepEntry
            initialData={{
              sleepQuality: foodLog.sleepQuality || 0,
              sleepHours: foodLog.sleepHours || ''
            }}
            onSave={handleSleepSave}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogPage;
