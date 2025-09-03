import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { useDateNavigation, useTimelineData } from '../hooks';
import { TimelineEntry } from '../components/timeline/TimelineEntry';

const TimelinePage: React.FC = () => {
  const { currentDate } = useDateNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { timelineData, loading, error, refreshTimelineData, getDaySummary } = useTimelineData(7);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTimelineData();
    } catch (err) {
      console.error('Failed to refresh timeline:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePullToRefresh = (e: React.TouchEvent) => {
    // Simple pull-to-refresh logic
    if (e.touches[0]?.clientY > 100) {
      handleRefresh();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Compact Header */}
      <motion.div 
        className="sticky top-0 z-40 bg-gradient-to-r from-brand-orange to-red-500 text-white shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h1 className="text-lg font-bold">Food Timeline</h1>
            </div>
            
            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          
          <p className="text-white/80 text-sm mt-1">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </motion.div>

      {/* Today Quick Stats */}
      <motion.div 
        className="bg-white m-4 rounded-xl shadow-sm border border-gray-100 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          {(() => {
            const todaySummary = getDaySummary(currentDate);
            return (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-orange">{todaySummary.meals}</p>
                  <p className="text-xs text-gray-500">Meals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{todaySummary.waterIntake}</p>
                  <p className="text-xs text-gray-500">oz Water</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{todaySummary.snacks}</p>
                  <p className="text-xs text-gray-500">Snacks</p>
                </div>
              </>
            );
          })()}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mx-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-red-800 text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading your timeline...</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div 
          className="flex-1 px-4 space-y-4"
          onTouchMove={handlePullToRefresh}
        >
          {timelineData.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Timeline Data</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start logging your meals and activities to see them here!
              </p>
              <button
                onClick={handleRefresh}
                className="text-brand-orange hover:text-red-600 font-medium text-sm transition-colors"
              >
                Refresh Timeline
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {timelineData.map((dayData, dayIndex) => (
                <motion.div
                  key={dayData.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: dayIndex * 0.05 }}
                >
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-px bg-gray-200 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                      {dayData.displayDate}
                    </p>
                    <div className="w-full h-px bg-gray-200" />
                  </div>

                  {/* Day's Entries */}
                  <div className="space-y-3 mb-6">
                    {dayData.entries.map((entry, entryIndex) => (
                      <TimelineEntry
                        key={`${dayData.id}-${entryIndex}`}
                        time={entry.time}
                        type={entry.type}
                        title={entry.title}
                        content={entry.content}
                        waterIntake={entry.waterIntake}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;