/**
 * @fileoverview Withdrawal vs portfolio value dual-axis chart
 * @layer composed
 * @status stable
 * @dependencies [react-chartjs-2, chartConfig]
 */

import { Line } from 'react-chartjs-2';
import type { MonteCarloResults, CalculatorInputs, PortfolioResult } from '../../../types/calculator';
import { LUXURY_CHART_COLORS, WITHDRAWAL_CHART_OPTIONS } from '../../../utils/chartConfig';
import './withdrawal-chart.css';

interface WithdrawalChartProps {
  results: MonteCarloResults | PortfolioResult;
  inputs: CalculatorInputs;
}

export function WithdrawalChart({ results, inputs }: WithdrawalChartProps) {
  // Normalize results to handle both MonteCarloResults and PortfolioResult
  const portfolioResult: PortfolioResult = 'portfolios' in results 
    ? results.portfolios[inputs.portfolioId] || results.portfolios.balanced
    : results;
  
  // Parse projection_data if it's a string
  let projectionData = portfolioResult.projection_data;
  if (typeof projectionData === 'string') {
    try {
      projectionData = JSON.parse(projectionData);
    } catch (e) {
      console.error('Failed to parse projection_data:', e);
      projectionData = { labels: [], datasets: [] };
    }
  }
  
  // Extract median data from projection_data
  const getMedianData = () => {
    if (!projectionData?.datasets) return [];
    const medianDataset = projectionData.datasets.find(
      (d: any) => d.label?.includes('Median') || d.label?.includes('50th')
    );
    return medianDataset?.data || [];
  };

  // Calculate annual withdrawal amounts
  const years = projectionData?.labels || [];
  const medianPortfolioValues = getMedianData();
  
  // Calculate withdrawal amounts for each year
  const withdrawalAmounts = years.map((_, index) => {
    if (index === 0) return 0;
    
    // Check if portfolio has value to withdraw from
    const currentPortfolioValue = medianPortfolioValues[index] || 0;
    
    // If portfolio is depleted, no withdrawal possible
    if (currentPortfolioValue <= 0) {
      return 0;
    }
    
    let baseWithdrawal: number;
    if (inputs.withdrawalMethod === 'percentage') {
      // For percentage, use the current portfolio value
      baseWithdrawal = currentPortfolioValue * (inputs.withdrawalRate! / 100);
    } else {
      // For fixed amount, check if portfolio can support the withdrawal
      baseWithdrawal = inputs.withdrawalAmount!;
      
      // Apply inflation if enabled
      if (inputs.adjustForInflation) {
        baseWithdrawal = baseWithdrawal * Math.pow(1 + (inputs.inflationRate / 100), index);
      }
      
      // Can't withdraw more than what's available
      if (baseWithdrawal > currentPortfolioValue) {
        return currentPortfolioValue;
      }
    }
    
    return baseWithdrawal;
  });

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Portfolio Value (Median)',
        data: medianPortfolioValues,
        borderColor: LUXURY_CHART_COLORS.primary,
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y',
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Annual Withdrawal',
        data: withdrawalAmounts,
        borderColor: LUXURY_CHART_COLORS.secondary,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [8, 4],
        fill: false,
        yAxisID: 'y1',
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    ...WITHDRAWAL_CHART_OPTIONS,
    plugins: {
      ...WITHDRAWAL_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Portfolio Value vs Annual Withdrawals',
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 18,
          weight: 500 as const,
        },
        color: '#1a1a1a',
        padding: { bottom: 24 },
      },
    },
    scales: {
      ...WITHDRAWAL_CHART_OPTIONS.scales,
      y: {
        ...WITHDRAWAL_CHART_OPTIONS.scales!.y,
        position: 'left' as const,
      },
      y1: {
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: 'Annual Withdrawal',
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
          callback: function(value: any) {
            if (typeof value === 'number') {
              const absValue = Math.abs(value);
              if (absValue >= 1e6) {
                return '$' + (absValue / 1e6).toFixed(1) + 'M';
              } else if (absValue >= 1e3) {
                return '$' + (absValue / 1e3).toFixed(0) + 'K';
              }
              return '$' + absValue.toFixed(0);
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="withdrawal-chart">
      <Line data={chartData} options={options} />
    </div>
  );
}

WithdrawalChart.meta = {
  layer: 'composed',
  cssFile: 'withdrawal-chart.css',
  dependencies: ['react-chartjs-2', 'chartConfig'],
  status: 'stable'
};