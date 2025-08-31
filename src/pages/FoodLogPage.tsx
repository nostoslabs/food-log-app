import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Download, Save, Loader2 } from 'lucide-react';
import { formatDate } from '../utils';
import { useFoodLog, useAuth, useDateNavigation } from '../hooks';
import { 
  MealSection, 
  SnackSection, 
  HealthMetricsSection, 
  SleepSection, 
  NotesSection, 
  ExportModal 
} from '../components';

const FoodLogPage: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const { user } = useAuth();
  const { currentDate, changeDate } = useDateNavigation();
  
  const {
    foodLog,
    loading,
    saving,
    error,
    updateMeal,
    updateSnack,
    updateHealthMetric,
    forceSave,
    clearError
  } = useFoodLog(currentDate);

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSave = async () => {
    try {
      await forceSave();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-lg font-medium">Loading your food log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="glass-card mx-6 mt-6 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8 w-full">
            <motion.button 
              onClick={() => changeDate(-1)}
              className="btn-glass p-4 hover:scale-110 flex-shrink-0 z-10 border-2 border-white/30 shadow-lg"
              aria-label="Previous day"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 text-white drop-shadow-sm" />
            </motion.button>
            
            <div className="text-center flex-1 px-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald to-sapphire flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald to-sapphire bg-clip-text text-transparent">FoodLogger.me</h1>
              </div>
              <p className="text-slate text-lg font-semibold mb-2">Your diet may be the key to better health</p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 py-3 mb-4">
                <p className="text-xl font-bold text-gray-800 mb-1">{formatDate(currentDate)}</p>
                <p className="text-sm text-gray-600">Use arrows to navigate between days</p>
              </div>
            </div>
            
            <motion.button 
              onClick={() => changeDate(1)}
              className="btn-glass p-4 hover:scale-110 flex-shrink-0 z-10 border-2 border-white/30 shadow-lg"
              aria-label="Next day"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-white drop-shadow-sm" />
            </motion.button>
          </div>

          <div className="flex justify-center gap-4">
            {user && (
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="btn-glass disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            )}
            
            <motion.button
              onClick={handleExport}
              className="btn-primary text-lg px-8 py-4"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-up">
            <div className="flex justify-between items-center">
              <p className="text-destructive text-sm font-medium">{error}</p>
              <button
                onClick={clearError}
                className="text-destructive/60 hover:text-destructive transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Meals */}
        <MealSection 
          mealName="breakfast"
          mealData={foodLog.breakfast}
          displayName="Breakfast"
          onUpdate={(field, value) => updateMeal('breakfast', field, value)}
        />
        
        <MealSection 
          mealName="lunch"
          mealData={foodLog.lunch}
          displayName="Lunch"
          onUpdate={(field, value) => updateMeal('lunch', field, value)}
        />
        
        <MealSection 
          mealName="dinner"
          mealData={foodLog.dinner}
          displayName="Dinner"
          onUpdate={(field, value) => updateMeal('dinner', field, value)}
        />

        {/* Snacks Section */}
        <SnackSection 
          snackName="midMorningSnack"
          snackData={foodLog.midMorningSnack}
          displayName="Mid-Morning Snack"
          onUpdate={(field, value) => updateSnack('midMorningSnack', field, value)}
        />
        
        <SnackSection 
          snackName="midDaySnack"
          snackData={foodLog.midDaySnack}
          displayName="Mid-Day Snack"
          onUpdate={(field, value) => updateSnack('midDaySnack', field, value)}
        />
        
        <SnackSection 
          snackName="nighttimeSnack"
          snackData={foodLog.nighttimeSnack}
          displayName="Nighttime Snack"
          onUpdate={(field, value) => updateSnack('nighttimeSnack', field, value)}
        />

        {/* Health Metrics */}
        <HealthMetricsSection 
          foodLog={foodLog}
          onUpdate={updateHealthMetric}
        />

        {/* Sleep */}
        <SleepSection 
          foodLog={foodLog}
          onUpdate={updateHealthMetric}
        />

        {/* Notes */}
        <NotesSection 
          foodLog={foodLog}
          onUpdate={updateHealthMetric}
        />

        {/* Status indicators */}
        <div className="text-center mt-4">
          {saving && (
            <p className="text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
              Saving changes...
            </p>
          )}
          {!user && (
            <p className="text-sm text-amber-600">
              Sign in to sync your data across devices
            </p>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentDate={currentDate}
      />
    </div>
  );
};

export default FoodLogPage;