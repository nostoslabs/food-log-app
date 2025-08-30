import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import type { MealSectionProps } from '../../types';

const MealSection: React.FC<MealSectionProps> = ({ 
  mealData, 
  displayName, 
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
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Utensils className="w-6 h-6 text-white drop-shadow-lg" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">{displayName}</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="form-label">Time</label>
          <input
            type="time"
            value={mealData.time}
            onChange={(e) => onUpdate('time', e.target.value)}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="form-label">Meat & Dairy</label>
          <textarea
            value={mealData.meatDairy}
            onChange={(e) => onUpdate('meatDairy', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="e.g., chicken breast, milk, cheese..."
          />
        </div>
        
        <div>
          <label className="form-label">Vegetables & Fruits</label>
          <textarea
            value={mealData.vegetablesFruits}
            onChange={(e) => onUpdate('vegetablesFruits', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="e.g., spinach, apple, carrots..."
          />
        </div>
        
        <div>
          <label className="form-label">Breads, Cereals & Grains</label>
          <textarea
            value={mealData.breadsCerealsGrains}
            onChange={(e) => onUpdate('breadsCerealsGrains', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="e.g., whole wheat bread, oatmeal, rice..."
          />
        </div>
        
        <div>
          <label className="form-label">Fats (butter, margarine, oils, etc.)</label>
          <textarea
            value={mealData.fats}
            onChange={(e) => onUpdate('fats', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="e.g., olive oil, butter, avocado..."
          />
        </div>
        
        <div>
          <label className="form-label">Candy, Sweets, & Junk Food</label>
          <textarea
            value={mealData.candySweets}
            onChange={(e) => onUpdate('candySweets', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="e.g., cookies, chips, candy..."
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="form-label">Water Intake (fl. oz.)</label>
            <input
              type="number"
              value={mealData.waterIntake}
              onChange={(e) => onUpdate('waterIntake', e.target.value)}
              className="input-field"
              placeholder="8"
              min="0"
            />
          </div>
          <div>
            <label className="form-label">Other Drinks</label>
            <input
              type="text"
              value={mealData.otherDrinks}
              onChange={(e) => onUpdate('otherDrinks', e.target.value)}
              className="input-field"
              placeholder="coffee, juice..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MealSection;