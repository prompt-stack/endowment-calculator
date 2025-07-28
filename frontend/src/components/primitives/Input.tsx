/**
 * @fileoverview Input primitive component
 * @layer primitives
 * @status stable
 * @dependencies []
 */

import './input-luxury.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export function Input({ 
  label,
  error,
  prefix,
  suffix,
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const classes = [
    'input',
    error && 'input--error',
    prefix && 'input--has-prefix',
    suffix && 'input--has-suffix',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      
      <div className="input__container">
        {prefix && <span className="input__prefix">{prefix}</span>}
        
        <input
          id={inputId}
          className={classes}
          {...props}
          onWheel={(e) => {
            // Prevent scroll wheel from changing number inputs
            if (props.type === 'number') {
              e.currentTarget.blur();
            }
          }}
        />
        
        {suffix && <span className="input__suffix">{suffix}</span>}
      </div>
      
      {error && (
        <span className="input__error">{error}</span>
      )}
    </div>
  );
}

Input.meta = {
  layer: 'primitive',
  cssFile: 'input.css',
  dependencies: [],
  status: 'stable'
};