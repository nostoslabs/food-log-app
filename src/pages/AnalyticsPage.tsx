import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Track your progress and trends
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="m-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Weekly Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">21</p>
              <p className="text-sm text-green-700">Meals Logged</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">896</p>
              <p className="text-sm text-blue-700">oz Water</p>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trends</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Water Intake</span>
              </div>
              <span className="text-sm text-green-600">+15% vs last week</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Logging Consistency</span>
              </div>
              <span className="text-sm text-blue-600">6/7 days</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Detailed analytics coming soon!</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;