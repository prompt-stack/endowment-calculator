/**
 * @fileoverview Simple toast notification component
 * @layer primitives
 * @status stable
 */

import { useEffect } from 'react';
import './toast.css';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast">
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

Toast.meta = {
  layer: 'primitive',
  cssFile: 'toast.css',
  dependencies: [],
  status: 'stable'
};