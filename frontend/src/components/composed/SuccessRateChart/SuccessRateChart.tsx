/**
 * @fileoverview Success rate comparison bar chart
 * @layer composed
 * @status stable
 */

import { Bar } from 'react-chartjs-2';
import type { PortfolioResult } from '../../../types/calculator';
import { formatPercentage } from '../../../utils/chartConfig';
import './success-rate-chart.css';

interface SuccessRateChartProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
  years: number;
}

export function SuccessRateChart({ results, years }: SuccessRateChartProps) {
  const chartData = {
    labels: ['Conservative', 'Balanced', 'Aggressive'],
    datasets: [
      {
        label: 'Success Rate',
        data: [
          results.conservative.success_rate * 100,
          results.balanced.success_rate * 100,
          results.aggressive.success_rate * 100,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0,
        barThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Success Rate: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getSuccessRateMessage = (rate: number) => {
    if (rate >= 0.8) return 'Excellent - Very high probability of maintaining withdrawals';
    if (rate >= 0.6) return 'Good - Reasonable probability of success';
    if (rate >= 0.4) return 'Moderate - Consider reducing withdrawal rate';
    return 'Low - High risk of depleting funds';
  };

  return (
    <div className="success-rate-chart">
      <h3 className="success-rate-chart__title">
        Success Rate Comparison
        <span className="success-rate-chart__subtitle">
          Probability of maintaining withdrawals for {years} years
        </span>
      </h3>
      <div className="success-rate-chart__container">
        <Bar data={chartData} options={options} />
      </div>
      <div className="success-rate-chart__details">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className="success-detail">
            <h4>{result.portfolio.name}</h4>
            <div className="success-percentage">{formatPercentage(result.success_rate)}</div>
            <p>{getSuccessRateMessage(result.success_rate)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

SuccessRateChart.meta = {
  layer: 'composed',
  cssFile: 'success-rate-chart.css',
  dependencies: ['Bar', 'formatPercentage'],
  status: 'stable'
};