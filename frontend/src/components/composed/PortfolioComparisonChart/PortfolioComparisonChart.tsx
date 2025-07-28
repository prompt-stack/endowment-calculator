/**
 * @fileoverview Portfolio comparison chart showing all three strategies on one graph
 * @layer composed
 * @status stable
 */

import { Line } from 'react-chartjs-2';
import type { PortfolioResult } from '../../../types/calculator';
import { LUXURY_CHART_OPTIONS } from '../../../utils/luxuryChartConfig';
import './portfolio-comparison-chart.css';

interface PortfolioComparisonChartProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
}

export function PortfolioComparisonChart({ results }: PortfolioComparisonChartProps) {
  const years = results.conservative.percentile_paths.p50.length;
  const labels = Array.from({ length: years }, (_, i) => i);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Conservative (50/50)',
        data: results.conservative.percentile_paths.p50,
        borderColor: '#059669',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Balanced (70/30)',
        data: results.balanced.percentile_paths.p50,
        borderColor: '#1a2332',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Aggressive (90/10)',
        data: results.aggressive.percentile_paths.p50,
        borderColor: '#d4af37',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    ...LUXURY_CHART_OPTIONS,
    plugins: {
      ...LUXURY_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Portfolio Strategy Comparison',
        font: {
          family: 'Playfair Display, serif',
          size: 18,
          weight: 400 as const,
        },
        color: '#1a1a1a',
        padding: { bottom: 24 },
      },
    },
  };

  return (
    <div className="portfolio-comparison-chart">
      <h3 className="portfolio-comparison-chart__title">Median Portfolio Projections</h3>
      <div className="portfolio-comparison-chart__container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

PortfolioComparisonChart.meta = {
  layer: 'composed',
  cssFile: 'portfolio-comparison-chart.css',
  dependencies: ['Line', 'getChartOptions'],
  status: 'stable'
};