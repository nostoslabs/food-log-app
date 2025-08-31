import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { NumberInput } from '../ui';
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
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-medium text-gray-600">Poor</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <motion.button
                  key={rating}
                  type="button"
                  onClick={() => onUpdate('sleepQuality', rating)}
                  className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    foodLog.sleepQuality === rating
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:shadow-md'
                  }`}
                  whileHover={{ 
                    scale: 1.1,
                    y: -2,
                    boxShadow: foodLog.sleepQuality === rating 
                      ? '0 8px 25px rgba(147, 51, 234, 0.4)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: rating * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {rating}
                  {foodLog.sleepQuality === rating && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">Excellent</span>
          </div>
          {foodLog.sleepQuality && (
            <motion.div 
              className="mt-2 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <Moon className="w-4 h-4" />
                {foodLog.sleepQuality === 1 && "Very Poor"}
                {foodLog.sleepQuality === 2 && "Poor"}
                {foodLog.sleepQuality === 3 && "Fair"}
                {foodLog.sleepQuality === 4 && "Good"}
                {foodLog.sleepQuality === 5 && "Excellent"}
              </span>
            </motion.div>
          )}
        </div>
        
        <div>
          <label className="form-label">Hours of Sleep</label>
          <NumberInput
            label="Hours of Sleep"
            value={foodLog.sleepHours}
            onChange={(value) => onUpdate('sleepHours', value)}
            placeholder="8.0"
            min="0"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SleepSection;