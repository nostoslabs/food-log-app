import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Target, Droplets, Moon, Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAnalytics } from '../hooks';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const { analytics, loading } = useAnalytics(dateRange);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-20">
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
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-20">
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
        
        <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm">Start logging your meals to see analytics!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <h1 className="text-xl font-bold">Analytics</h1>
            </div>
            
            {/* Date Range Toggle */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  dateRange === 'week'
                    ? 'bg-white text-purple-600'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  dateRange === 'month'
                    ? 'bg-white text-purple-600'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            Track your progress and trends
          </p>
        </div>
      </motion.div>

      <div className="flex-1 p-4 space-y-4">
        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEntries}</p>
                <p className="text-xs text-gray-500">Total Entries</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.streakCount}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.totalWaterIntake)}</p>
                <p className="text-xs text-gray-500">oz Water</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgSleepQuality}</p>
                <p className="text-xs text-gray-500">Avg Sleep</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Weekly Progress Chart */}
          {analytics.weeklyData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleepQuality" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="Sleep Quality"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="waterIntake" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      name="Water (oz)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Meal Distribution */}
          {analytics.mealDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Distribution</h3>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="h-48 flex-shrink-0">
                  <ResponsiveContainer width={200} height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.mealDistribution}
                        cx={100}
                        cy={96}
                        outerRadius={80}
                        dataKey="count"
                        label={({ meal, percent }) => `${meal} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {analytics.mealDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-2">
                  {analytics.mealDistribution.map((item, index) => (
                    <div key={item.meal} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.meal}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.count} entries</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Weekly Average</span>
                </div>
                <span className="text-sm text-gray-600">{analytics.weeklyAverage} entries/week</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Exercise Days</span>
                </div>
                <span className="text-sm text-gray-600">{analytics.exerciseDays} days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Avg Sleep Hours</span>
                </div>
                <span className="text-sm text-gray-600">{analytics.avgSleepHours}h</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Most Logged</span>
                </div>
                <span className="text-sm text-gray-600">{analytics.mostLoggedMeal}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;