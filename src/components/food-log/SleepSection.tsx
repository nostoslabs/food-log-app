import React from 'react';
import { Moon } from 'lucide-react';
import type { FoodLog } from '../../types';

interface SleepSectionProps {
  foodLog: FoodLog;
  onUpdate: (field: keyof Omit<FoodLog, 'id' | 'userId' | 'date' | 'breakfast' | 'lunch' | 'dinner' | 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack' | 'createdAt' | 'updatedAt'>, value: string | number) => void;
}

const SleepSection: React.FC<SleepSectionProps> = ({ 
  foodLog, 
  onUpdate 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Moon className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Sleep</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="form-label">
            Quality of Sleep
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Poor</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onUpdate('sleepQuality', rating)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                  foodLog.sleepQuality === rating
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                }`}
              >
                {rating}
              </button>
            ))}
            <span className="text-sm text-gray-500">Good</span>
          </div>
        </div>
        
        <div>
          <label className="form-label">Hours of Sleep</label>
          <input
            type="number"
            step="0.5"
            value={foodLog.sleepHours}
            onChange={(e) => onUpdate('sleepHours', e.target.value)}
            className="input-field"
            placeholder="8"
            min="0"
            max="24"
          />
        </div>
      </div>
    </div>
  );
};

export default SleepSection;