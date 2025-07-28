/**
 * @fileoverview Formatted number input with comma separation
 * @layer primitives
 * @status stable
 * @dependencies [Input, formatNumberWithCommas, parseFormattedNumber]
 */

import { useState, useEffect } from 'react';
import { Input } from './Input';
import { formatNumberWithCommas } from '../../utils/formatters';

interface FormattedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement> & { target: { value: string; numericValue: number } }) => void;
  formatOnBlur?: boolean;
}

export function FormattedInput({ 
  value,
  onChange,
  formatOnBlur = true,
  type,
  ...props 
}: FormattedInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatNumberWithCommas(value));
  const [isFocused, setIsFocused] = useState(false);

  // Update display when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumberWithCommas(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      setDisplayValue('');
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: '',
          numericValue: 0
        }
      };
      onChange(syntheticEvent);
      return;
    }

    // Only allow valid number characters
    const cleaned = inputValue.replace(/[^0-9]/g, '');
    
    // If cleaned is empty after removing non-digits, clear the field
    if (cleaned === '') {
      setDisplayValue('');
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: '',
          numericValue: 0
        }
      };
      onChange(syntheticEvent);
      return;
    }
    
    // Parse the numeric value - use parseFloat for large numbers
    const numericValue = parseFloat(cleaned);
    
    // Format with commas while typing
    const formatted = formatNumberWithCommas(numericValue);
    setDisplayValue(formatted);
    
    // Create enhanced event
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
        numericValue
      }
    };
    
    onChange(syntheticEvent);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <Input
      {...props}
      type="text" // Use text type to show formatted numbers
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

FormattedInput.meta = {
  layer: 'primitive',
  dependencies: ['Input', 'formatNumberWithCommas', 'parseFormattedNumber'],
  status: 'stable'
};