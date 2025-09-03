import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { RefreshCw, Calendar } from 'lucide-react';
import { useDateNavigation } from '../hooks';
import { TimelineEntry } from '../components/timeline/TimelineEntry';

const TimelinePage: React.FC = () => {
  const { currentDate } = useDateNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - we'll replace this with real data from hooks
  const mockTimelineData = useMemo(() => {
    const entries = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(currentDate, i);
      entries.push({
        id: `entry-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'MMM d, yyyy'),
        entries: [
          {
            time: '8:00 AM',
            type: 'breakfast' as const,
            title: 'Breakfast',
            content: 'Oatmeal with berries, coffee',
            waterIntake: 16,
          },
          {
            time: '10:30 AM',
            type: 'water' as const,
            title: 'Water',
            content: '32 oz',
            waterIntake: 32,
          },
          {
            time: '12:30 PM',
            type: 'lunch' as const,
            title: 'Lunch',
            content: 'Salad with chicken, sparkling water',
            waterIntake: 12,
          },
          {
            time: '3:00 PM',
            type: 'snack' as const,
            title: 'Afternoon Snack',
            content: 'Apple and almonds',
            waterIntake: 0,
          },
          {
            time: '7:00 PM',
            type: 'dinner' as const,
            title: 'Dinner',
            content: 'Grilled salmon, vegetables, water',
            waterIntake: 16,
          },
        ],
      });
    }
    return entries;
  }, [currentDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
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
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-orange">3</p>
            <p className="text-xs text-gray-500">Meals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">76</p>
            <p className="text-xs text-gray-500">oz Water</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">2</p>
            <p className="text-xs text-gray-500">Snacks</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div 
        className="flex-1 px-4 space-y-4"
        onTouchMove={handlePullToRefresh}
      >
        <AnimatePresence mode="popLayout">
          {mockTimelineData.map((dayData, dayIndex) => (
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

        {/* Load More Indicator */}
        <motion.div 
          className="flex items-center justify-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => {/* Load more logic */}}
          >
            Load more entries...
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TimelinePage;