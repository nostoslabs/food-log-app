import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Target,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const WaterPage: React.FC = () => {
  const [customAmount, setCustomAmount] = useState(32);
  const [dailyIntake, setDailyIntake] = useState(48);
  const [dailyGoal] = useState(128); // This will come from preferences
  const [recentEntries, setRecentEntries] = useState([
    { time: '2:30 PM', amount: 16, id: '1' },
    { time: '12:15 PM', amount: 32, id: '2' },
    { time: '9:00 AM', amount: 16, id: '3' },
  ]);

  const presetAmounts = [8, 16, 20, 32];

  const handleQuickAdd = (amount: number) => {
    const newEntry = {
      id: Date.now().toString(),
      amount,
      time: format(new Date(), 'h:mm a'),
    };
    
    setRecentEntries(prev => [newEntry, ...prev]);
    setDailyIntake(prev => prev + amount);
  };

  const handleCustomAdd = () => {
    if (customAmount > 0) {
      handleQuickAdd(customAmount);
    }
  };

  const progressPercentage = Math.min((dailyIntake / dailyGoal) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-6 h-6" />
            <h1 className="text-xl font-bold">Water Tracker</h1>
          </div>
          <p className="text-white/80 text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </motion.div>

      {/* Progress Section */}
      <motion.div 
        className="mx-4 mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p 
                className="text-2xl font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {dailyIntake}
              </motion.p>
              <p className="text-sm text-gray-500">oz</p>
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            {dailyIntake} oz of {dailyGoal} oz daily goal
          </p>
          <div className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Section */}
      <motion.div 
        className="mx-4 mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h2>
        
        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {presetAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl p-4 font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Droplets className="w-5 h-5 mx-auto mb-1" />
              {amount} oz
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Custom Amount</p>
          
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              onClick={() => setCustomAmount(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </motion.button>
            
            <div className="flex-1 text-center">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-lg font-semibold bg-transparent border-none outline-none"
              />
              <span className="text-sm text-gray-500 ml-1">oz</span>
            </div>
            
            <motion.button
              onClick={() => setCustomAmount(prev => prev + 1)}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
          
          <motion.button
            onClick={handleCustomAdd}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg py-3 font-semibold shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add {customAmount} oz
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Entries */}
      <motion.div 
        className="mx-4 mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Entries</h2>
        
        <AnimatePresence mode="popLayout">
          {recentEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{entry.amount} oz</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {entry.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recentEntries.length === 0 && (
          <div className="text-center py-8">
            <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No water logged today yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WaterPage;