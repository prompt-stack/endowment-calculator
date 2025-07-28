/**
 * @fileoverview Monte Carlo projection chart component
 * @layer composed
 * @status stable
 * @dependencies [react-chartjs-2, chartConfig]
 */

import { Line } from 'react-chartjs-2';
import type { MonteCarloResults, PortfolioResult } from '../../../types/calculator';
import { LUXURY_CHART_OPTIONS, LUXURY_CHART_COLORS } from '../../../utils/luxuryChartConfig';
import './projection-chart.css';

interface ProjectionChartProps {
  results: MonteCarloResults | PortfolioResult;
  height?: number;
}

export function ProjectionChart({ results, height = 400 }: ProjectionChartProps) {
  // Normalize results to handle both MonteCarloResults and PortfolioResult
  const portfolioResult: PortfolioResult = 'portfolios' in results 
    ? results.portfolios.balanced  // Default to balanced for MonteCarloResults
    : results;
  
  // Use the projection data directly from the backend
  const chartData = portfolioResult?.projection_data || {
    labels: [],
    datasets: []
  };
  
  // Ensure datasets is always an array
  if (!Array.isArray(chartData.datasets)) {
    chartData.datasets = [];
  }

  // Apply luxury styling to datasets
  if (chartData.datasets && chartData.datasets.length > 0) {
    chartData.datasets = chartData.datasets.map((dataset: any, index: number) => {
      const colors = [LUXURY_CHART_COLORS.percentile90, LUXURY_CHART_COLORS.percentile50, LUXURY_CHART_COLORS.percentile10];
      return {
        ...dataset,
        borderColor: colors[index] || LUXURY_CHART_COLORS.primary,
        backgroundColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 4,
      };
    });
  }

  const options = {
    ...LUXURY_CHART_OPTIONS,
    plugins: {
      ...LUXURY_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Portfolio Value Projection',
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
    <div className="projection-chart" style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

ProjectionChart.meta = {
  layer: 'composed',
  cssFile: 'projection-chart.css',
  dependencies: ['react-chartjs-2', 'chartConfig'],
  status: 'stable'
};