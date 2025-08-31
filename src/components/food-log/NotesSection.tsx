import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { FoodLog } from '../../types';

interface NotesSectionProps {
  foodLog: FoodLog;
  onUpdate: (field: keyof Omit<FoodLog, 'id' | 'userId' | 'date' | 'breakfast' | 'lunch' | 'dinner' | 'midMorningSnack' | 'midDaySnack' | 'nighttimeSnack' | 'createdAt' | 'updatedAt'>, value: string | number) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ 
  foodLog, 
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
          <FileText className="w-7 h-7 text-gray-600" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-gray-900">Notes</h3>
      </div>
      <textarea
        value={foodLog.notes}
        onChange={(e) => onUpdate('notes', e.target.value)}
        rows={4}
        className="input-field resize-none"
        placeholder="Additional observations, symptoms, or notes about your day..."
      />
    </motion.div>
  );
};

export default NotesSection;