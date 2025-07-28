/**
 * @fileoverview Input with increment/decrement buttons
 * @layer primitives
 * @status stable
 */

import { useState } from 'react';
import './increment-input.css';

interface IncrementInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function IncrementInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.5,
  suffix = '%'
}: IncrementInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val === '') {
      onChange(0);
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(Math.min(Math.max(numVal, min), max));
      }
    }
  };

  const handleBlur = () => {
    // Ensure value is formatted correctly on blur
    setInputValue(value.toString());
  };

  return (
    <div className="increment-input">
      <label className="increment-input__label">{label}</label>
      <div className="increment-input__controls">
        <button
          type="button"
          className="increment-input__button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease value"
        >
          −
        </button>
        <div className="increment-input__field">
          <input
            type="number"
            className="increment-input__input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            onWheel={(e) => e.currentTarget.blur()}
          />
          {suffix && <span className="increment-input__suffix">{suffix}</span>}
        </div>
        <button
          type="button"
          className="increment-input__button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase value"
        >
          +
        </button>
      </div>
    </div>
  );
}

IncrementInput.meta = {
  layer: 'primitive',
  cssFile: 'increment-input.css',
  dependencies: [],
  status: 'stable'
};