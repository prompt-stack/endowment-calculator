/**
 * @fileoverview Comprehensive results summary component
 * @layer features
 * @status stable
 * @dependencies [ResultsCard, formatCurrency, formatPercentage]
 */

import { ResultsCard } from '../../composed/ResultsCard/ResultsCard';
import type { MonteCarloResults, CalculatorInputs, PortfolioResult } from '../../../types/calculator';
import { formatCurrency, formatPercentage } from '../../../utils/chartConfig';
import './results-summary.css';

interface ResultsSummaryProps {
  results: MonteCarloResults | PortfolioResult;
  inputs: CalculatorInputs;
}

export function ResultsSummary({ results, inputs }: ResultsSummaryProps) {
  // Normalize results to handle both MonteCarloResults and PortfolioResult
  const portfolioResult: PortfolioResult = 'portfolios' in results 
    ? results.portfolios[inputs.portfolioId] || results.portfolios.balanced
    : results;
  
  // Calculate additional metrics
  const totalWithdrawals = calculateTotalWithdrawals(inputs, portfolioResult);
  const finalWithdrawal = calculateFinalWithdrawal(inputs, portfolioResult);
  const averageGrowthRate = calculateAverageGrowthRate(portfolioResult, inputs);
  
  // Determine success rate variant
  const getSuccessVariant = (rate: number) => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'danger';
  };

  return (
    <div className="results-summary">
      <h2 className="results-summary__title">Analysis Summary</h2>
      
      <div className="results-summary__grid">
        <ResultsCard
          title="Success Rate"
          value={formatPercentage(portfolioResult.success_rate)}
          label={`Probability of funds lasting ${inputs.years} years`}
          variant={getSuccessVariant(portfolioResult.success_rate)}
        />
        
        <ResultsCard
          title="Median Final Balance"
          value={formatCurrency(portfolioResult.median_final_balance)}
          label={`Expected remaining after ${inputs.years} years`}
          variant="primary"
        />
        
        <ResultsCard
          title="Total Withdrawals"
          value={formatCurrency(totalWithdrawals)}
          label={`Over ${inputs.years} years`}
          variant="primary"
        />
        
        <ResultsCard
          title="Final Year Withdrawal"
          value={formatCurrency(finalWithdrawal)}
          label={inputs.adjustForInflation ? "Inflation-adjusted" : "Nominal"}
          variant="primary"
        />
        
        <ResultsCard
          title="10th Percentile"
          value={formatCurrency(portfolioResult.percentile_10 || 0)}
          label="Worst case scenario"
          variant="danger"
        />
        
        <ResultsCard
          title="90th Percentile"
          value={formatCurrency(portfolioResult.percentile_90 || 0)}
          label="Best case scenario"
          variant="success"
        />
      </div>
      
      <div className="results-summary__insights">
        <h3>Key Insights</h3>
        <ul>
          {portfolioResult.success_rate >= 0.8 && (
            <li className="insight--positive">
              High success rate indicates sustainable withdrawal strategy
            </li>
          )}
          {portfolioResult.success_rate < 0.6 && (
            <li className="insight--negative">
              Low success rate suggests withdrawal rate may be too aggressive
            </li>
          )}
          {portfolioResult.median_final_balance > inputs.startingBalance && (
            <li className="insight--positive">
              Portfolio expected to grow despite withdrawals
            </li>
          )}
          {averageGrowthRate > 0 && (
            <li className="insight--positive">
              Average growth rate of {formatPercentage(averageGrowthRate)} after withdrawals
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Helper functions
function calculateTotalWithdrawals(inputs: CalculatorInputs, results: PortfolioResult): number {
  let total = 0;
  
  if (inputs.withdrawalMethod === 'percentage') {
    // For percentage method, use actual portfolio values from projection_data
    const medianDataset = results.projection_data?.datasets?.find((d: any) => 
      d.label?.includes('Median') || d.label?.includes('50th')
    );
    const medianPath = medianDataset?.data || [];
    
    for (let year = 1; year <= inputs.years; year++) {
      if (year - 1 < medianPath.length) {
        const portfolioValue = medianPath[year - 1];
        if (portfolioValue > 0) {
          total += portfolioValue * (inputs.withdrawalRate! / 100);
        }
      }
    }
  } else {
    // For fixed method, use fixed amount with inflation
    const baseWithdrawal = inputs.withdrawalAmount!;
    
    for (let year = 1; year <= inputs.years; year++) {
      if (inputs.adjustForInflation) {
        total += baseWithdrawal * Math.pow(1 + (inputs.inflationRate / 100), year - 1);
      } else {
        total += baseWithdrawal;
      }
    }
  }
  
  return total;
}

function calculateFinalWithdrawal(inputs: CalculatorInputs, results: PortfolioResult): number {
  if (inputs.withdrawalMethod === 'percentage') {
    // For percentage, use the final year's portfolio value from projection_data
    const medianDataset = results.projection_data?.datasets?.find((d: any) => 
      d.label?.includes('Median') || d.label?.includes('50th')
    );
    const medianPath = medianDataset?.data || [];
    const finalYearIndex = inputs.years - 1;
    
    if (finalYearIndex < medianPath.length && medianPath[finalYearIndex] > 0) {
      return medianPath[finalYearIndex] * (inputs.withdrawalRate! / 100);
    }
    return 0;
  } else {
    // For fixed method
    const baseWithdrawal = inputs.withdrawalAmount!;
    
    if (inputs.adjustForInflation) {
      return baseWithdrawal * Math.pow(1 + (inputs.inflationRate / 100), inputs.years - 1);
    }
    
    return baseWithdrawal;
  }
}

function calculateAverageGrowthRate(results: PortfolioResult, inputs: CalculatorInputs): number {
  const finalValue = results.median_final_balance;
  const totalWithdrawals = calculateTotalWithdrawals(inputs, results);
  const totalValue = finalValue + totalWithdrawals;
  
  // CAGR calculation
  const years = inputs.years;
  const growthRate = Math.pow(totalValue / inputs.startingBalance, 1 / years) - 1;
  
  return growthRate;
}

ResultsSummary.meta = {
  layer: 'features',
  cssFile: 'results-summary.css',
  dependencies: ['ResultsCard', 'formatCurrency', 'formatPercentage'],
  status: 'stable'
};