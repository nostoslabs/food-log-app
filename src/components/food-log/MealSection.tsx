import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import type { MealSectionProps } from '../../types';
import { TimeInput, TextAreaField, NumberInput, TextInput } from '../ui';

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
      <div className="flex items-center gap-6 mb-6">
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Utensils className="w-7 h-7 text-gray-700" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-gray-900">{displayName}</h3>
      </div>
      
      <div className="space-y-3">
        <TimeInput
          label="Time"
          value={mealData.time}
          onChange={(value) => onUpdate('time', value)}
        />
        
        <TextAreaField
          label="Meat & Dairy"
          value={mealData.meatDairy}
          onChange={(value) => onUpdate('meatDairy', value)}
          placeholder="e.g., chicken breast, milk, cheese..."
        />
        
        <TextAreaField
          label="Vegetables & Fruits"
          value={mealData.vegetablesFruits}
          onChange={(value) => onUpdate('vegetablesFruits', value)}
          placeholder="e.g., spinach, apple, carrots..."
        />
        
        <TextAreaField
          label="Breads, Cereals & Grains"
          value={mealData.breadsCerealsGrains}
          onChange={(value) => onUpdate('breadsCerealsGrains', value)}
          placeholder="e.g., whole wheat bread, oatmeal, rice..."
        />
        
        <TextAreaField
          label="Fats (butter, margarine, oils, etc.)"
          value={mealData.fats}
          onChange={(value) => onUpdate('fats', value)}
          placeholder="e.g., olive oil, butter, avocado..."
        />
        
        <TextAreaField
          label="Candy, Sweets, & Junk Food"
          value={mealData.candySweets}
          onChange={(value) => onUpdate('candySweets', value)}
          placeholder="e.g., cookies, chips, candy..."
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label="Water Intake (fl. oz.)"
            value={mealData.waterIntake}
            onChange={(value) => onUpdate('waterIntake', value)}
            placeholder="8"
          />
          <TextInput
            label="Other Drinks"
            value={mealData.otherDrinks}
            onChange={(value) => onUpdate('otherDrinks', value)}
            placeholder="coffee, juice..."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MealSection;