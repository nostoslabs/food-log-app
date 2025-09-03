import React from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Droplets, 
  Coffee, 
  Clock,
  Zap
} from 'lucide-react';

interface TimelineEntryProps {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'water' | 'exercise' | 'sleep';
  title: string;
  content: string;
  waterIntake?: number;
}

const getIconAndColor = (type: TimelineEntryProps['type']) => {
  switch (type) {
    case 'breakfast':
      return { icon: Coffee, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' };
    case 'lunch':
      return { icon: Utensils, color: 'bg-green-100 text-green-600 border-green-200' };
    case 'dinner':
      return { icon: Utensils, color: 'bg-blue-100 text-blue-600 border-blue-200' };
    case 'snack':
      return { icon: Zap, color: 'bg-purple-100 text-purple-600 border-purple-200' };
    case 'water':
      return { icon: Droplets, color: 'bg-cyan-100 text-cyan-600 border-cyan-200' };
    case 'exercise':
      return { icon: Zap, color: 'bg-red-100 text-red-600 border-red-200' };
    case 'sleep':
      return { icon: Clock, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' };
    default:
      return { icon: Clock, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
};

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  time,
  type,
  title,
  content,
  waterIntake = 0
}) => {
  const { icon: Icon, color } = getIconAndColor(type);

  return (
    <motion.div 
      className="flex items-start gap-3 relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Timeline Line */}
      <div className="absolute left-6 top-12 w-px h-full bg-gray-200 -z-10" />
      
      {/* Icon */}
      <motion.div 
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${color} z-10`}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.div 
          className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <span className="text-xs text-gray-500 font-medium">{time}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-2">{content}</p>

          {/* Water Intake */}
          {waterIntake > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-600 font-medium">
                {waterIntake} oz water
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};