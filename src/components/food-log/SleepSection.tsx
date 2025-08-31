import React from 'react';
import { motion } from 'framer-motion';
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
          <Moon className="w-7 h-7 text-purple-600" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-gray-900">Sleep</h3>
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
            placeholder="8.0"
            min="0"
            max="24"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SleepSection;