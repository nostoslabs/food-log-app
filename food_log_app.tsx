import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Utensils, Activity, Moon, Droplets, Download, Copy, X } from 'lucide-react';

const FoodLogApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportText, setExportText] = useState('');
  
  const getDateKey = (date) => date.toISOString().split('T')[0];
  
  const [foodLog, setFoodLog] = useState({
    // Meals
    breakfast: {
      time: '',
      meatDairy: '',
      vegetablesFruits: '',
      breadsCerealsGrains: '',
      fats: '',
      candySweets: '',
      waterIntake: '',
      otherDrinks: ''
    },
    lunch: {
      time: '',
      meatDairy: '',
      vegetablesFruits: '',
      breadsCerealsGrains: '',
      fats: '',
      candySweets: '',
      waterIntake: '',
      otherDrinks: ''
    },
    dinner: {
      time: '',
      meatDairy: '',
      vegetablesFruits: '',
      breadsCerealsGrains: '',
      fats: '',
      candySweets: '',
      waterIntake: '',
      otherDrinks: ''
    },
    // Snacks
    midMorningSnack: {
      time: '',
      snack: ''
    },
    midDaySnack: {
      time: '',
      snack: ''
    },
    nighttimeSnack: {
      time: '',
      snack: ''
    },
    // Health metrics
    bowelMovements: '',
    exercise: '',
    dailyWaterIntake: '',
    sleepQuality: 3,
    sleepHours: '',
    notes: ''
  });

  // Load data from localStorage when date changes
  useEffect(() => {
    const dateKey = getDateKey(currentDate);
    const savedData = localStorage.getItem(`foodLog_${dateKey}`);
    if (savedData) {
      setFoodLog(JSON.parse(savedData));
    } else {
      // Reset to empty form for new date
      setFoodLog({
        breakfast: { time: '', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
        lunch: { time: '', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
        dinner: { time: '', meatDairy: '', vegetablesFruits: '', breadsCerealsGrains: '', fats: '', candySweets: '', waterIntake: '', otherDrinks: '' },
        midMorningSnack: { time: '', snack: '' },
        midDaySnack: { time: '', snack: '' },
        nighttimeSnack: { time: '', snack: '' },
        bowelMovements: '',
        exercise: '',
        dailyWaterIntake: '',
        sleepQuality: 3,
        sleepHours: '',
        notes: ''
      });
    }
  }, [currentDate]);

  // Save data to localStorage whenever foodLog changes
  useEffect(() => {
    const dateKey = getDateKey(currentDate);
    localStorage.setItem(`foodLog_${dateKey}`, JSON.stringify(foodLog));
  }, [foodLog, currentDate]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const updateMeal = (meal, field, value) => {
    setFoodLog(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value
      }
    }));
  };

  const updateSnack = (snack, field, value) => {
    setFoodLog(prev => ({
      ...prev,
      [snack]: {
        ...prev[snack],
        [field]: value
      }
    }));
  };

  const updateHealthMetric = (field, value) => {
    setFoodLog(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateExportText = () => {
    const dateStr = formatDate(currentDate);
    let text = `DAILY FOOD LOG - ${dateStr}\n`;
    text += `Health in Hand - Your diet may be the key to better health\n\n`;

    // Meals
    const meals = [
      { key: 'breakfast', name: 'BREAKFAST' },
      { key: 'lunch', name: 'LUNCH' }, 
      { key: 'dinner', name: 'DINNER' }
    ];

    meals.forEach(meal => {
      const data = foodLog[meal.key];
      text += `${meal.name}${data.time ? ` (${data.time})` : ''}:\n`;
      if (data.meatDairy) text += `  Meat & Dairy: ${data.meatDairy}\n`;
      if (data.vegetablesFruits) text += `  Vegetables & Fruits: ${data.vegetablesFruits}\n`;
      if (data.breadsCerealsGrains) text += `  Breads, Cereals & Grains: ${data.breadsCerealsGrains}\n`;
      if (data.fats) text += `  Fats: ${data.fats}\n`;
      if (data.candySweets) text += `  Candy, Sweets & Junk Food: ${data.candySweets}\n`;
      if (data.waterIntake) text += `  Water Intake: ${data.waterIntake} fl oz\n`;
      if (data.otherDrinks) text += `  Other Drinks: ${data.otherDrinks}\n`;
      text += `\n`;
    });

    // Snacks
    text += `SNACKS:\n`;
    if (foodLog.midMorningSnack.snack || foodLog.midMorningSnack.time) {
      text += `  Mid-Morning${foodLog.midMorningSnack.time ? ` (${foodLog.midMorningSnack.time})` : ''}: ${foodLog.midMorningSnack.snack}\n`;
    }
    if (foodLog.midDaySnack.snack || foodLog.midDaySnack.time) {
      text += `  Mid-Day${foodLog.midDaySnack.time ? ` (${foodLog.midDaySnack.time})` : ''}: ${foodLog.midDaySnack.snack}\n`;
    }
    if (foodLog.nighttimeSnack.snack || foodLog.nighttimeSnack.time) {
      text += `  Nighttime${foodLog.nighttimeSnack.time ? ` (${foodLog.nighttimeSnack.time})` : ''}: ${foodLog.nighttimeSnack.snack}\n`;
    }
    text += `\n`;

    // Health Metrics
    text += `HEALTH METRICS:\n`;
    if (foodLog.bowelMovements) text += `  Bowel Movements: ${foodLog.bowelMovements}\n`;
    if (foodLog.exercise) text += `  Exercise: ${foodLog.exercise} minutes\n`;
    if (foodLog.dailyWaterIntake) text += `  Daily Water Intake: ${foodLog.dailyWaterIntake} quarts\n`;
    if (foodLog.sleepQuality) text += `  Sleep Quality: ${foodLog.sleepQuality}/5\n`;
    if (foodLog.sleepHours) text += `  Hours of Sleep: ${foodLog.sleepHours}\n`;
    text += `\n`;

    // Notes
    if (foodLog.notes) {
      text += `NOTES:\n${foodLog.notes}\n`;
    }

    return text;
  };

  const handleExport = () => {
    const exportData = generateExportText();
    setExportText(exportData);
    setShowExportModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText);
    alert('Copied to clipboard!');
  };

  const MealSection = ({ mealName, mealData, displayName }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Utensils className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">{displayName}</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={mealData.time}
            onChange={(e) => updateMeal(mealName, 'time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meat & Dairy</label>
          <textarea
            value={mealData.meatDairy}
            onChange={(e) => updateMeal(mealName, 'meatDairy', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., chicken breast, milk, cheese..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vegetables & Fruits</label>
          <textarea
            value={mealData.vegetablesFruits}
            onChange={(e) => updateMeal(mealName, 'vegetablesFruits', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., spinach, apple, carrots..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breads, Cereals & Grains</label>
          <textarea
            value={mealData.breadsCerealsGrains}
            onChange={(e) => updateMeal(mealName, 'breadsCerealsGrains', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., whole wheat bread, oatmeal, rice..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fats (butter, margarine, oils, etc.)</label>
          <textarea
            value={mealData.fats}
            onChange={(e) => updateMeal(mealName, 'fats', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., olive oil, butter, avocado..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candy, Sweets, & Junk Food</label>
          <textarea
            value={mealData.candySweets}
            onChange={(e) => updateMeal(mealName, 'candySweets', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., cookies, chips, candy..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Intake (fl. oz.)</label>
            <input
              type="number"
              value={mealData.waterIntake}
              onChange={(e) => updateMeal(mealName, 'waterIntake', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Drinks</label>
            <input
              type="text"
              value={mealData.otherDrinks}
              onChange={(e) => updateMeal(mealName, 'otherDrinks', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="coffee, juice..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const SnackSection = ({ snackName, snackData, displayName }) => (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <h4 className="text-md font-medium text-gray-700 mb-2">{displayName}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
          <input
            type="time"
            value={snackData.time}
            onChange={(e) => updateSnack(snackName, 'time', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Snack</label>
          <input
            type="text"
            value={snackData.snack}
            onChange={(e) => updateSnack(snackName, 'snack', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="nuts, fruit..."
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Export Food Log</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <p className="text-sm text-gray-600 mb-3">
                Copy this text to share with your doctor or save to your notes:
              </p>
              <textarea
                readOnly
                value={exportText}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
              />
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Text
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Food Log</h1>
          </div>
          
          <button 
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-blue-100 text-sm">Your diet may be the key to better health</p>
          <p className="text-white font-medium">{formatDate(currentDate)}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleExport}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export for Doctor
          </button>
        </div>
      </div>

      <div className="p-4 pb-6">
        {/* Meals */}
        <MealSection 
          mealName="breakfast" 
          mealData={foodLog.breakfast} 
          displayName="Breakfast" 
        />
        
        <MealSection 
          mealName="lunch" 
          mealData={foodLog.lunch} 
          displayName="Lunch" 
        />
        
        <MealSection 
          mealName="dinner" 
          mealData={foodLog.dinner} 
          displayName="Dinner" 
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
          />
          
          <SnackSection 
            snackName="midDaySnack" 
            snackData={foodLog.midDaySnack} 
            displayName="Mid-Day Snack" 
          />
          
          <SnackSection 
            snackName="nighttimeSnack" 
            snackData={foodLog.nighttimeSnack} 
            displayName="Nighttime Snack" 
          />
        </div>

        {/* Health Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">Health Metrics</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bowel Movements (how many and consistency)
              </label>
              <input
                type="text"
                value={foodLog.bowelMovements}
                onChange={(e) => updateHealthMetric('bowelMovements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1 - normal"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise (minutes per day)
                </label>
                <input
                  type="number"
                  value={foodLog.exercise}
                  onChange={(e) => updateHealthMetric('exercise', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Water Intake (Qt's)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodLog.dailyWaterIntake}
                  onChange={(e) => updateHealthMetric('dailyWaterIntake', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Sleep</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality of Sleep
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Poor</span>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateHealthMetric('sleepQuality', rating)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      foodLog.sleepQuality === rating
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
                <span className="text-sm text-gray-500">Good</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours of Sleep</label>
              <input
                type="number"
                step="0.5"
                value={foodLog.sleepHours}
                onChange={(e) => updateHealthMetric('sleepHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
          <textarea
            value={foodLog.notes}
            onChange={(e) => updateHealthMetric('notes', e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional observations, symptoms, or notes about your day..."
          />
        </div>
      </div>
    </div>
  );
};

export default FoodLogApp;