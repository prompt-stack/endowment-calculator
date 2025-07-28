/**
 * @fileoverview Calculator state management hook
 * @layer hooks
 * @status stable
 */

import { useState, useCallback, useEffect } from 'react';
import { calculatorApi } from '../services/api';
import type { CalculatorInputs, CalculatorState } from '../types/calculator';

const getInitialInputs = (): CalculatorInputs => {
  // Try to load from localStorage
  const saved = localStorage.getItem('calculatorInputs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved inputs:', e);
    }
  }
  
  // Default values
  return {
    startingBalance: 1000000,
    withdrawalMethod: 'percentage',
    withdrawalRate: 4,
    withdrawalAmount: 40000,
    years: 30,
    portfolioId: 'balanced',
    inflationRate: 3,
    managementFee: 1,
    adjustForInflation: true,
  };
};

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    inputs: getInitialInputs(),
    results: null,
    loading: false,
    error: null,
    portfolios: [],
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = useCallback(async () => {
    try {
      const portfolios = await calculatorApi.getPortfolios();
      setState(prev => ({ ...prev, portfolios }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load portfolios' 
      }));
    }
  }, []);

  const updateInputs = useCallback((updates: Partial<CalculatorInputs>) => {
    setState(prev => {
      const newInputs = { ...prev.inputs, ...updates };
      // Save to localStorage
      localStorage.setItem('calculatorInputs', JSON.stringify(newInputs));
      return {
        ...prev,
        inputs: newInputs,
        error: null,
      };
    });
    // Mark that we have unsaved changes if we had results
    if (state.results) {
      setHasUnsavedChanges(true);
    }
  }, [state.results]);

  const calculate = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setHasUnsavedChanges(false);

    try {
      const results = await calculatorApi.calculateMonteCarlo(state.inputs);
      setState(prev => ({ 
        ...prev, 
        results, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Calculation failed' 
      }));
    }
  }, [state.inputs]);

  const generatePdf = useCallback(async () => {
    if (!state.results) return null;

    try {
      const pdfBlob = await calculatorApi.generatePdf(state.inputs, state.results);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'EndowmentIQ-Analysis.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return pdfBlob;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'PDF generation failed' 
      }));
      return null;
    }
  }, [state.inputs, state.results]);

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: null, error: null }));
  }, []);

  return {
    ...state,
    hasUnsavedChanges,
    updateInputs,
    calculate,
    generatePdf,
    clearResults,
  };
}