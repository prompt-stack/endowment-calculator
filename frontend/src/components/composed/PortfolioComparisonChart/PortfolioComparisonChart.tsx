/**
 * @fileoverview Portfolio comparison chart showing all three strategies on one graph
 * @layer composed
 * @status stable
 */

import { Line } from 'react-chartjs-2';
import type { PortfolioResult } from '../../../types/calculator';
import { LUXURY_CHART_OPTIONS } from '../../../utils/chartConfig';
import './portfolio-comparison-chart.css';

interface PortfolioComparisonChartProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
}

export function PortfolioComparisonChart({ results }: PortfolioComparisonChartProps) {
  // Guard clause - ensure we have all required portfolios
  if (!results || !results.conservative || !results.balanced || !results.aggressive) {
    return (
      <div className="portfolio-comparison-chart">
        <h3 className="portfolio-comparison-chart__title">Median Portfolio Projections</h3>
        <div className="portfolio-comparison-chart__container">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading portfolio data...
          </p>
        </div>
      </div>
    );
  }
  
  // Extract median data from projection_data for each portfolio
  const getMedianData = (portfolio: PortfolioResult) => {
    let projectionData = portfolio.projection_data;
    
    // Parse if projection_data is a string
    if (typeof projectionData === 'string') {
      try {
        projectionData = JSON.parse(projectionData);
      } catch (e) {
        console.error('Failed to parse projection_data:', e);
        return [];
      }
    }
    
    if (!projectionData?.datasets) {
      return [];
    }
    const medianDataset = projectionData.datasets.find(
      (d: any) => d.label?.includes('Median') || d.label?.includes('50th')
    );
    return medianDataset?.data || [];
  };

  const conservativeData = getMedianData(results.conservative);
  const balancedData = getMedianData(results.balanced);
  const aggressiveData = getMedianData(results.aggressive);

  // Find the last non-zero index to trim unnecessary zero padding
  const findLastNonZeroIndex = (data: number[]) => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] > 0.01) return i;
    }
    return data.length - 1;
  };

  const lastIdx = Math.max(
    findLastNonZeroIndex(conservativeData),
    findLastNonZeroIndex(balancedData),
    findLastNonZeroIndex(aggressiveData)
  ) + 1;

  // Trim data and labels to remove trailing zeros
  const trimmedConservative = conservativeData.slice(0, lastIdx);
  const trimmedBalanced = balancedData.slice(0, lastIdx);
  const trimmedAggressive = aggressiveData.slice(0, lastIdx);

  // Use labels from any portfolio (they should all be the same)
  const getLabels = (portfolio: PortfolioResult) => {
    let projectionData = portfolio.projection_data;
    if (typeof projectionData === 'string') {
      try {
        projectionData = JSON.parse(projectionData);
      } catch (e) {
        return [];
      }
    }
    return projectionData?.labels || [];
  };
  
  const allLabels = getLabels(results.conservative) || getLabels(results.balanced) || [];
  const labels = allLabels.slice(0, lastIdx);
  
  // If no data found, return empty state
  if (!conservativeData.length && !balancedData.length && !aggressiveData.length) {
    return (
      <div className="portfolio-comparison-chart">
        <h3 className="portfolio-comparison-chart__title">Median Portfolio Projections</h3>
        <div className="portfolio-comparison-chart__container">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No projection data available. Please calculate projections first.
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Conservative (50/50)',
        data: trimmedConservative,
        borderColor: '#38bdf8',  // Sky blue
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderDash: [5, 5],  // Dashed line
      },
      {
        label: 'Balanced (70/30)',
        data: trimmedBalanced,
        borderColor: '#1a2b6d',  // Navy (primary color)
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Aggressive (90/10)',
        data: trimmedAggressive,
        borderColor: '#1e40af',  // Royal blue
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderDash: [2, 2],  // Dotted line
      },
    ],
  };

  const options = {
    ...LUXURY_CHART_OPTIONS,
    plugins: {
      ...LUXURY_CHART_OPTIONS.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#6b7280',
        },
      },
      title: {
        display: false
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