import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Download, Save, Loader2 } from 'lucide-react';
import { formatDate } from '../utils';
import { useFoodLog } from '../hooks/useFoodLog';
import { useAuth } from '../hooks/useAuth';
import MealSection from '../components/food-log/MealSection';
import SnackSection from '../components/food-log/SnackSection';
import HealthMetricsSection from '../components/food-log/HealthMetricsSection';
import SleepSection from '../components/food-log/SleepSection';
import NotesSection from '../components/food-log/NotesSection';
import ExportModal from '../components/export/ExportModal';

const FoodLogPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const { user } = useAuth();
  
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

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading food log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Food Log</h1>
          </div>
          
          <button 
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-primary-100 text-sm">Your diet may be the key to better health</p>
          <p className="text-white font-medium">{formatDate(currentDate)}</p>
          {user && (
            <p className="text-primary-200 text-xs">
              Signed in as {user.displayName || user.email}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {user && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export for Doctor
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-4 pb-6 max-w-4xl mx-auto">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Snacks</h3>
          </div>
          
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
        </div>

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