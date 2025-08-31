import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div 
      className="food-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-center gap-6 mb-6">
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity className="w-7 h-7 text-red-600" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-gray-900">Health Metrics</h3>
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
    </motion.div>
  );
};

export default HealthMetricsSection;