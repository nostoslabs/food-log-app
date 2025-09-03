import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Search } from 'lucide-react';

const AddFoodPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <h1 className="text-xl font-bold">Log Food</h1>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Add your meals and snacks
          </p>
        </div>
      </motion.div>

      {/* Quick Add Buttons */}
      <motion.div 
        className="m-4 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((meal, index) => (
          <motion.button
            key={meal}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">{meal}</h3>
              <p className="text-sm text-gray-500">Add {meal.toLowerCase()} items</p>
            </div>
            <Plus className="w-5 h-5 text-gray-400" />
          </motion.button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div 
        className="m-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for food items..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Food search and logging interface coming soon!</p>
      </div>
    </div>
  );
};

export default AddFoodPage;