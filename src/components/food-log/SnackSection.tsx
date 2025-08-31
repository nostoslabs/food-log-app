import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { TimeInput, TextInput } from '../ui';
import type { SnackSectionProps } from '../../types';

const SnackSection: React.FC<SnackSectionProps> = ({
  snackData,
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
          <Clock className="w-7 h-7 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-gray-900">{displayName}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TimeInput
          label="Time"
          value={snackData.time}
          onChange={(value) => onUpdate('time', value)}
        />
        <TextInput
          label="Snack"
          value={snackData.snack}
          onChange={(value) => onUpdate('snack', value)}
          placeholder="nuts, fruit, yogurt..."
        />
      </div>
    </motion.div>
  );
};

export default SnackSection;