/**
 * @fileoverview API service for calculator backend communication
 * @layer services
 * @status stable
 */

import axios from 'axios';
import type { CalculatorInputs, MonteCarloResults, Portfolio } from '../types/calculator';

// Dynamically determine API URL based on current location
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production or when served through a proxy, use relative path
  if (window.location.hostname !== 'localhost') {
    return ''; // Use same origin
  }
  
  // In local development, use localhost:5000
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const calculatorApi = {
  async getPortfolios(): Promise<Portfolio[]> {
    const response = await api.get('/api/portfolios');
    return response.data;
  },

  async calculateMonteCarlo(inputs: CalculatorInputs): Promise<MonteCarloResults> {
    const payload = {
      starting_balance: inputs.startingBalance,
      withdrawal_method: inputs.withdrawalMethod,
      withdrawal_rate: inputs.withdrawalRate,
      withdrawal_amount: inputs.withdrawalAmount,
      years: inputs.years,
      portfolio_id: inputs.portfolioId,
      inflation_rate: inputs.inflationRate / 100,
      management_fee: inputs.managementFee / 100,
      adjust_for_inflation: inputs.adjustForInflation,
    };

    const response = await api.post('/api/calculate', payload);
    return response.data;
  },

  async generatePdf(inputs: CalculatorInputs, results: MonteCarloResults): Promise<Blob> {
    const payload = {
      inputs,
      results,
    };

    const response = await api.post('/api/generate-pdf', payload, {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default api;