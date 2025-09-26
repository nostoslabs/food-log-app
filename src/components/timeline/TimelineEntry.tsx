import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import React from 'react';

import { getEntryStyle } from '../../config/entryStyles';
import type { EntryType } from '../../types';

interface TimelineEntryProps {
  time: string;
  type: EntryType;
  title: string;
  content: string;
  waterIntake?: number;
  onClick?: () => void;
}


export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  time,
  type,
  title,
  content,
  waterIntake = 0,
  onClick
}) => {
  const { icon: Icon, iconClasses, containerClasses } = getEntryStyle(type);

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
        className={`${containerClasses} z-10`}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className={iconClasses} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.div 
          className={`bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow ${
            onClick ? 'cursor-pointer hover:border-blue-200' : ''
          }`}
          whileHover={{ y: -2 }}
          whileTap={onClick ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.2 }}
          onClick={onClick}
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

          {/* Click indicator */}
          {onClick && (
            <div className="absolute top-2 right-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs">✏️</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};