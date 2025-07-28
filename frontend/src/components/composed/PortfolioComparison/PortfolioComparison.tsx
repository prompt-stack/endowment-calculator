/**
 * @fileoverview Portfolio comparison table showing all three strategies
 * @layer composed
 * @status stable
 */

import type { PortfolioResult } from '../../../types/calculator';
import { formatCurrency, formatPercentage } from '../../../utils/chartConfig';
import './portfolio-comparison.css';

interface PortfolioComparisonProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
  selectedPortfolioId?: string;
}

export function PortfolioComparison({ results, selectedPortfolioId }: PortfolioComparisonProps) {
  const portfolios = [
    { key: 'conservative', data: results.conservative },
    { key: 'balanced', data: results.balanced },
    { key: 'aggressive', data: results.aggressive }
  ];

  const getSuccessRateClass = (rate: number) => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'danger';
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility <= 0.13) return 'Low';
    if (volatility <= 0.16) return 'Medium';
    return 'High';
  };

  return (
    <div className="portfolio-comparison">
      <h3 className="portfolio-comparison__title">Portfolio Strategy Comparison</h3>
      
      <div className="portfolio-comparison__table-wrapper">
        <table className="portfolio-comparison__table">
          <thead>
            <tr>
              <th>Portfolio</th>
              <th>Success Rate</th>
              <th>Median Final Balance</th>
              <th>Expected Return</th>
              <th>Risk Level</th>
              <th>Asset Allocation</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map(({ key, data }) => (
              <tr 
                key={key} 
                className={selectedPortfolioId === key ? 'selected' : ''}
              >
                <td>
                  <div className="portfolio-comparison__name">
                    {data.portfolio.name}
                  </div>
                </td>
                <td>
                  <div className={`portfolio-comparison__success-rate ${getSuccessRateClass(data.success_rate)}`}>
                    {formatPercentage(data.success_rate)}
                  </div>
                </td>
                <td>
                  <div className="portfolio-comparison__balance">
                    {formatCurrency(data.median_final_balance)}
                  </div>
                </td>
                <td>
                  <div className="portfolio-comparison__return">
                    {formatPercentage(data.portfolio.expected_return)}
                  </div>
                </td>
                <td>
                  <div className={`portfolio-comparison__risk risk-${getRiskLevel(data.portfolio.volatility).toLowerCase()}`}>
                    {getRiskLevel(data.portfolio.volatility)}
                  </div>
                </td>
                <td>
                  <div className="portfolio-comparison__allocation">
                    <span className="allocation-stocks">{data.portfolio.stocks_percentage}% Stocks</span>
                    <span className="allocation-bonds">{data.portfolio.bonds_percentage}% Bonds</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

PortfolioComparison.meta = {
  layer: 'composed',
  cssFile: 'portfolio-comparison.css',
  dependencies: ['formatCurrency', 'formatPercentage'],
  status: 'stable'
};