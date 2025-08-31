import React from 'react';

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  min = "0",
  className = ''
}) => {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${className}`}
        placeholder={placeholder}
        min={min}
      />
    </div>
  );
};

export default NumberInput;