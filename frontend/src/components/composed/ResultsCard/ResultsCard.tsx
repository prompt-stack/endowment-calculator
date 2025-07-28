/**
 * @fileoverview Results card component for displaying metrics
 * @layer composed
 * @status stable
 * @dependencies []
 */

import './results-card.css';

interface ResultsCardProps {
  title: string;
  value: string;
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: string;
}

export function ResultsCard({ 
  title, 
  value, 
  label, 
  variant = 'primary',
  icon 
}: ResultsCardProps) {
  return (
    <div className={`results-card results-card--${variant}`}>
      <div className="results-card__header">
        <h3 className="results-card__title">{title}</h3>
        {icon && <span className="results-card__icon">{icon}</span>}
      </div>
      <div className="results-card__content">
        <div className="results-card__value">{value}</div>
        <div className="results-card__label">{label}</div>
      </div>
    </div>
  );
}

ResultsCard.meta = {
  layer: 'composed',
  cssFile: 'results-card.css',
  dependencies: [],
  status: 'stable'
};