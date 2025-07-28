/**
 * @fileoverview Luxury chart configuration
 * @layer utils
 * @status stable
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

// Luxury color palette
export const LUXURY_CHART_COLORS = {
  primary: '#1a1a1a',
  gold: '#d4af37',
  success: '#2e7d32',
  danger: '#c62828',
  percentile90: '#2d2d2d',
  percentile50: '#666666',
  percentile10: '#cccccc',
  gridLine: 'rgba(0, 0, 0, 0.03)',
};

// Luxury chart options
export const LUXURY_CHART_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 0, // Remove dots
      hoverRadius: 4,
      hitRadius: 10,
    },
    line: {
      tension: 0.4, // Smooth curves
      borderWidth: 2,
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: false,
        padding: 24,
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 500 as const,
        },
        color: '#666666',
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#cccccc',
      borderColor: 'rgba(212, 175, 55, 0.2)',
      borderWidth: 1,
      titleFont: {
        family: 'Inter, sans-serif',
        size: 13,
        weight: 600 as const,
      },
      bodyFont: {
        family: 'Inter, sans-serif',
        size: 12,
        weight: 400 as const,
      },
      padding: 16,
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        label: function(context) {
          if (!context || !context.dataset) return '';
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed && context.parsed.y !== null && context.parsed.y !== undefined) {
            label += formatCurrencyCompact(context.parsed.y);
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
      border: {
        display: false,
      },
      title: {
        display: true,
        text: 'Years',
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 500 as const,
        },
        color: '#666666',
        padding: { top: 10 },
      },
      ticks: {
        font: {
          family: 'Inter, sans-serif',
          size: 11,
        },
        color: '#999999',
      },
    },
    y: {
      position: 'left',
      grid: {
        color: LUXURY_CHART_COLORS.gridLine,
        lineWidth: 1,
      },
      border: {
        display: false,
      },
      title: {
        display: true,
        text: 'Portfolio Value',
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 500 as const,
        },
        color: '#666666',
        padding: { bottom: 10 },
      },
      ticks: {
        font: {
          family: 'JetBrains Mono, monospace',
          size: 11,
        },
        color: '#999999',
        callback: function(value) {
          return formatCurrencyCompact(value as number);
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

// Format currency compactly
export const formatCurrencyCompact = (value: number): string => {
  if (typeof value !== 'number') return String(value);
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return sign + '$' + (absValue / 1e9).toFixed(1) + 'B';
  } else if (absValue >= 1e6) {
    return sign + '$' + (absValue / 1e6).toFixed(1) + 'M';
  } else if (absValue >= 1e3) {
    return sign + '$' + (absValue / 1e3).toFixed(0) + 'K';
  }
  return sign + '$' + absValue.toFixed(0);
};

// Withdrawal chart specific options
export const WITHDRAWAL_CHART_OPTIONS: ChartOptions<'line'> = {
  ...LUXURY_CHART_OPTIONS,
  scales: {
    ...LUXURY_CHART_OPTIONS.scales,
    y: {
      ...LUXURY_CHART_OPTIONS.scales!.y,
      title: {
        ...LUXURY_CHART_OPTIONS.scales!.y!.title,
        text: 'Annual Withdrawal',
      },
    },
  },
};