/**
 * @fileoverview Risk vs return scatter plot for portfolio comparison
 * @layer composed
 * @status stable
 */

import { Scatter } from 'react-chartjs-2';
import type { PortfolioResult } from '../../../types/calculator';
import './risk-return-chart.css';

interface RiskReturnChartProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
}

export function RiskReturnChart({ results }: RiskReturnChartProps) {
  const portfolios = [
    { key: 'conservative', data: results.conservative, color: '#10b981' },
    { key: 'balanced', data: results.balanced, color: '#3b82f6' },
    { key: 'aggressive', data: results.aggressive, color: '#ef4444' }
  ];

  const chartData = {
    datasets: portfolios.map(({ data, color }) => ({
      label: data.portfolio.name,
      data: [{
        x: data.portfolio.volatility * 100, // Convert to percentage
        y: data.portfolio.expected_return * 100, // Convert to percentage
      }],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 10,
      pointHoverRadius: 12,
    })),
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
            const portfolio = portfolios[context.datasetIndex];
            return [
              `${portfolio.data.portfolio.name}`,
              `Risk (Volatility): ${context.parsed.x.toFixed(1)}%`,
              `Expected Return: ${context.parsed.y.toFixed(1)}%`,
              `Success Rate: ${(portfolio.data.success_rate * 100).toFixed(1)}%`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Risk (Annual Volatility %)',
          font: {
            size: 14,
            weight: 500 as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Expected Annual Return %',
          font: {
            size: 14,
            weight: 500 as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="risk-return-chart">
      <h3 className="risk-return-chart__title">Risk vs Return Analysis</h3>
      <div className="risk-return-chart__container">
        <Scatter data={chartData} options={options} />
      </div>
      <div className="risk-return-chart__insight">
        <p>
          This chart illustrates the fundamental investment principle: higher potential returns come with increased risk. 
          Choose the portfolio that aligns with your organization's risk tolerance and financial goals.
        </p>
      </div>
    </div>
  );
}

RiskReturnChart.meta = {
  layer: 'composed',
  cssFile: 'risk-return-chart.css',
  dependencies: ['Scatter'],
  status: 'stable'
};