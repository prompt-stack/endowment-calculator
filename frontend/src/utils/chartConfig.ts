/**
 * @fileoverview Chart.js configuration and registration
 * @layer utils
 * @status stable
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart color constants
export const CHART_COLORS = {
  conservative: '#059669',
  balanced: '#1a2332',
  aggressive: '#2b6cb0',
  positive: '#059669',
  negative: '#dc2626',
  neutral: '#6b7280',
};

// Common chart options
export const DEFAULT_CHART_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 12,
      },
      padding: 12,
      callbacks: {
        label: function(context) {
          if (!context || !context.dataset) return '';
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed && context.parsed.y !== null && context.parsed.y !== undefined) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: 'Years',
        font: {
          size: 14,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      title: {
        display: true,
        text: 'Portfolio Value ($)',
        font: {
          size: 14,
        },
      },
      ticks: {
        callback: function(value) {
          if (typeof value === 'number') {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value;
          }
          return value;
        },
      },
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
};

// Format currency for display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};