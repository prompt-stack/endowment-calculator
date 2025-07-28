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

  const getRiskLevel = (stocksPercentage: number) => {
    if (stocksPercentage <= 50) return 'Low';
    if (stocksPercentage <= 70) return 'Medium';
    return 'High';
  };
  
  const getStocksBondsFromName = (name: string) => {
    if (name.includes('50/50')) return { stocks: 50, bonds: 50 };
    if (name.includes('70/30')) return { stocks: 70, bonds: 30 };
    if (name.includes('90/10')) return { stocks: 90, bonds: 10 };
    return { stocks: 0, bonds: 0 };
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
            {portfolios.map(({ key, data }) => {
              const allocation = getStocksBondsFromName(data.portfolio.name);
              return (
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
                    <div className={`portfolio-comparison__risk risk-${getRiskLevel(allocation.stocks).toLowerCase()}`}>
                      {getRiskLevel(allocation.stocks)}
                    </div>
                  </td>
                  <td>
                    <div className="portfolio-comparison__allocation">
                      <span className="allocation-stocks">{allocation.stocks}% Stocks</span>
                      <span className="allocation-bonds">{allocation.bonds}% Bonds</span>
                    </div>
                  </td>
                </tr>
              );
            })}
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