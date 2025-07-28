/**
 * @fileoverview Calculator type definitions
 * @layer types
 * @status stable
 */

export interface Portfolio {
  id: string;
  name: string;
  stocks_percentage: number;
  bonds_percentage: number;
  expected_return: number;
  volatility: number;
}

export interface CalculatorInputs {
  startingBalance: number;
  withdrawalMethod: 'percentage' | 'fixed';
  withdrawalRate?: number;
  withdrawalAmount?: number;
  years: number;
  portfolioId: string;
  inflationRate: number;
  managementFee: number;
  adjustForInflation: boolean;
}

export interface PortfolioResult {
  portfolio: {
    id: string;
    name: string;
    stocks_percentage: number;
    bonds_percentage: number;
    expected_return: number;
    volatility: number;
  };
  success_rate: number;
  median_final_balance: number;
  percentile_paths: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  annual_stats: {
    year: number;
    p10: number;
    p50: number;
    p90: number;
  }[];
  projection_data: {
    labels: number[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderDash?: number[];
      borderWidth?: number;
    }[];
  };
}

export interface MonteCarloResults {
  withdrawal_amount: number;
  withdrawal_method: string;
  years: number;
  portfolios: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
    [key: string]: PortfolioResult;
  };
}

export interface CalculatorState {
  inputs: CalculatorInputs;
  results: MonteCarloResults | null;
  loading: boolean;
  error: string | null;
  portfolios: Portfolio[];
}