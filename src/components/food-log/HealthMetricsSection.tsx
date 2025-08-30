import React from 'react';
import { Activity } from 'lucide-react';
import type { FoodLog } from '../../types';

interface HealthMetricsSectionProps {
  foodLog: FoodLog;
  onUpdate: (field: keyof Omit<FoodLog, 'id' | 'userId' | 'date' | 'breakfast' | 'lunch' | 'dinner' | 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack' | 'createdAt' | 'updatedAt'>, value: string | number) => void;
}

const HealthMetricsSection: React.FC<HealthMetricsSectionProps> = ({ 
  foodLog, 
  onUpdate 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-800">Health Metrics</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="form-label">
            Bowel Movements (how many and consistency)
          </label>
          <input
            type="text"
            value={foodLog.bowelMovements}
            onChange={(e) => onUpdate('bowelMovements', e.target.value)}
            className="input-field"
            placeholder="e.g., 1 - normal"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="form-label">
              Exercise (minutes per day)
            </label>
            <input
              type="number"
              value={foodLog.exercise}
              onChange={(e) => onUpdate('exercise', e.target.value)}
              className="input-field"
              placeholder="30"
              min="0"
            />
          </div>
          
          <div>
            <label className="form-label">
              Daily Water Intake (Qt's)
            </label>
            <input
              type="number"
              step="0.1"
              value={foodLog.dailyWaterIntake}
              onChange={(e) => onUpdate('dailyWaterIntake', e.target.value)}
              className="input-field"
              placeholder="2.5"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricsSection;