import React from 'react';
import { Utensils } from 'lucide-react';
import type { MealSectionProps } from '../../types';

const MealSection: React.FC<MealSectionProps> = ({ 
  mealData, 
  displayName, 
  onUpdate 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Utensils className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800">{displayName}</h3>
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
    </div>
  );
};

export default MealSection;