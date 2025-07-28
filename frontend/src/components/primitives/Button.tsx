/**
 * @fileoverview Primary button primitive component
 * @layer primitives
 * @status stable
 * @dependencies []
 */

import './button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  className = '',
  ...props 
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn__spinner" />
          <span className="btn__text">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

Button.meta = {
  layer: 'primitive',
  cssFile: 'button.css',
  dependencies: [],
  status: 'stable'
};