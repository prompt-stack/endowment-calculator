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

// Minimal luxury color palette
export const CHART_COLORS = {
  conservative: '#059669',
  balanced: '#1a2332',
  aggressive: '#6b7280',
  positive: '#059669',
  negative: '#dc2626',
  neutral: '#6b7280',
  percentile90: '#1a2332',
  percentile50: '#6b7280',
  percentile10: '#9ca3af',
  primary: '#1a2332',
  gold: '#d4af37',
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

// Luxury chart options with enhanced styling
export const LUXURY_CHART_OPTIONS: ChartOptions<'line'> = {
  ...DEFAULT_CHART_OPTIONS,
  plugins: {
    ...DEFAULT_CHART_OPTIONS.plugins,
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 14,
          weight: 'normal' as const,
        },
        color: '#1a2332',
      },
    },
    tooltip: {
      ...DEFAULT_CHART_OPTIONS.plugins?.tooltip,
      backgroundColor: 'rgba(26, 35, 50, 0.95)',
      titleFont: {
        family: 'Georgia, serif',
        size: 16,
        weight: 'bold' as const,
      },
      bodyFont: {
        family: 'Georgia, serif',
        size: 14,
      },
      padding: 16,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(26, 35, 50, 0.05)',
        lineWidth: 1,
      },
      title: {
        display: true,
        text: 'Years',
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 16,
          weight: 'normal' as const,
        },
        color: '#1a2332',
      },
      ticks: {
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 12,
        },
        color: '#525252',
      },
    },
    y: {
      grid: {
        display: true,
        color: 'rgba(26, 35, 50, 0.08)',
        lineWidth: 1,
      },
      title: {
        display: true,
        text: 'Portfolio Value',
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 16,
          weight: 'normal' as const,
        },
        color: '#1a2332',
      },
      ticks: {
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 12,
        },
        color: '#525252',
        callback: function(value) {
          if (typeof value === 'number') {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value.toFixed(0);
          }
          return value;
        },
      },
    },
  },
};

// Chart theme for compatibility
export const chartTheme = {
  colors: {
    primary: '#1a2332',
    secondary: '#d4af37',
    tertiary: '#059669',
    danger: '#dc2626',
  }
};

// Luxury chart colors
// Clean professional palette - Blue theme
export const LUXURY_CHART_COLORS = {
  // Primary chart colors - minimal variation
  primary: '#1a2b6d',                        // Navy
  secondary: '#38bdf8',                      // Sky blue
  accent: '#1e40af',                         // Royal blue
  
  // Data lines - blue variations
  percentile90: '#1e40af',                   // Royal blue
  percentile50: '#1a2b6d',                   // Navy (main)
  percentile10: '#38bdf8',                   // Sky blue
  
  // Portfolio types - blue spectrum
  conservative: '#38bdf8',                   // Sky blue
  balanced: '#1a2b6d',                       // Navy
  aggressive: '#1e40af',                     // Royal blue
  
  // Semantic colors - muted
  positive: '#1a2b6d',                       // Navy (instead of green)
  negative: '#dc2626',                       // Red (use rarely)
  neutral: '#6b7280',                        // Gray
  
  // Legacy mapping
  gold: '#1a2b6d',                           // Now navy
  navy: '#1a2b6d',
  green: '#1a2b6d',                          // Now navy
};

// Withdrawal chart options
export const WITHDRAWAL_CHART_OPTIONS = DEFAULT_CHART_OPTIONS;