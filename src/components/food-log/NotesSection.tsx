import React from 'react';
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
      </div>
      <textarea
        value={foodLog.notes}
        onChange={(e) => onUpdate('notes', e.target.value)}
        rows={4}
        className="input-field resize-none"
        placeholder="Additional observations, symptoms, or notes about your day..."
      />
    </div>
  );
};

export default NotesSection;