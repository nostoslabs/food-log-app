import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  className = ''
}) => {
  const setCurrentTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    onChange(timeString);
  };

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field flex-1 ${className}`}
        />
        <motion.button
          type="button"
          onClick={setCurrentTime}
          className="btn-glass px-3 py-2 text-xs font-medium flex items-center gap-1 flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Set to current time"
        >
          <Clock className="w-3 h-3" />
          Now
        </motion.button>
      </div>
    </div>
  );
};

export default TimeInput;