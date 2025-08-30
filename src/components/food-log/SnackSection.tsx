import React from 'react';
import type { SnackSectionProps } from '../../types';

const SnackSection: React.FC<SnackSectionProps> = ({
  snackData,
  displayName,
  onUpdate
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <h4 className="text-md font-medium text-gray-700 mb-2">{displayName}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
          <input
            type="time"
            value={snackData.time}
            onChange={(e) => onUpdate('time', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Snack</label>
          <input
            type="text"
            value={snackData.snack}
            onChange={(e) => onUpdate('snack', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            placeholder="nuts, fruit..."
          />
        </div>
      </div>
    </div>
  );
};

export default SnackSection;