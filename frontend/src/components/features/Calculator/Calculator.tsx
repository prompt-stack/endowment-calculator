/**
 * @fileoverview Main calculator feature component
 * @layer features
 * @status stable
 * @dependencies [Button, Input, composed/Card]
 */

import { useState, useRef } from 'react';
import { useCalculator } from '../../../hooks/useCalculator';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { FormattedInput } from '../../primitives/FormattedInput';
import { IncrementInput } from '../../primitives/IncrementInput';
import { Toast } from '../../primitives/Toast';
import { ProjectionChart, WithdrawalChart } from '../../composed';
import { ResultsSummary } from '../ResultsSummary/ResultsSummary';
import { PortfolioComparison } from '../../composed/PortfolioComparison/PortfolioComparison';
import { PortfolioComparisonChart } from '../../composed/PortfolioComparisonChart/PortfolioComparisonChart';
import './calculator-simple.css';

export function Calculator() {
  const {
    inputs,
    results,
    loading,
    error,
    updateInputs,
    calculate,
    generatePdf,
    clearResults
  } = useCalculator();

  const [showToast, setShowToast] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  // Removed debug code for stability

  // Override updateInputs to show toast when changing values after calculation
  const handleUpdateInputs = (updates: Partial<typeof inputs>) => {
    updateInputs(updates);
    if (results && !showToast) {
      setShowToast(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
    setShowToast(false);
  };


  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: '380px', flexShrink: 0, backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'relative' }} ref={sidebarRef}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem 2rem 2rem 2.5rem', boxSizing: 'border-box', scrollBehavior: 'smooth' }} ref={formCardRef}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
            {/* Starting Balance */}
            <div className="calculator__field">
              <FormattedInput
                label="Starting Balance"
                type="number"
                value={inputs.startingBalance}
                onChange={(e) => handleUpdateInputs({ startingBalance: e.target.numericValue })}
                min="100000"
                max="1000000000"
                step="10000"
                prefix="$"
              />
            </div>

            {/* Withdrawal Method */}
            <div className="calculator__field">
              <label className="calculator__label">Withdrawal Method</label>
              <div className="calculator__radio-group">
                <label className="calculator__radio">
                  <input
                    type="radio"
                    checked={inputs.withdrawalMethod === 'percentage'}
                    onChange={() => handleUpdateInputs({ withdrawalMethod: 'percentage' })}
                  />
                  <span>Percentage Rate</span>
                </label>
                <label className="calculator__radio">
                  <input
                    type="radio"
                    checked={inputs.withdrawalMethod === 'fixed'}
                    onChange={() => handleUpdateInputs({ withdrawalMethod: 'fixed' })}
                  />
                  <span>Fixed Amount</span>
                </label>
              </div>
            </div>

            {/* Withdrawal Rate/Amount */}
            {inputs.withdrawalMethod === 'percentage' ? (
              <div className="calculator__field">
                <Input
                  label="Annual Withdrawal Rate"
                  type="number"
                  value={inputs.withdrawalRate || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : Number(e.target.value);
                    handleUpdateInputs({ withdrawalRate: value });
                  }}
                  min="1"
                  max="10"
                  step="0.1"
                  suffix="%"
                />
              </div>
            ) : (
              <div className="calculator__field">
                <FormattedInput
                  label="Annual Withdrawal Amount"
                  type="number"
                  value={inputs.withdrawalAmount || 0}
                  onChange={(e) => handleUpdateInputs({ withdrawalAmount: e.target.numericValue })}
                  min="1000"
                  step="1000"
                  prefix="$"
                />
              </div>
            )}

            {/* Time Horizon */}
            <div className="calculator__field">
              <label className="calculator__label">Time Horizon</label>
              <div className="calculator__button-group">
                {[10, 20, 30, 50].map((years) => (
                  <button
                    key={years}
                    type="button"
                    className={`calculator__year-btn ${inputs.years === years ? 'active' : ''}`}
                    onClick={() => handleUpdateInputs({ years })}
                  >
                    {years} years
                  </button>
                ))}
              </div>
            </div>


            {/* Advanced Settings */}
            <div className="calculator__advanced">
              <h3 className="calculator__advanced-title">Advanced Settings</h3>
              
              <div className="calculator__field">
                <IncrementInput
                  label="Inflation Rate"
                  value={inputs.inflationRate}
                  onChange={(value) => handleUpdateInputs({ inflationRate: value })}
                  min={0}
                  max={10}
                  step={0.5}
                  suffix="%"
                />
              </div>

              <div className="calculator__field">
                <IncrementInput
                  label="Management Fee"
                  value={inputs.managementFee}
                  onChange={(value) => handleUpdateInputs({ managementFee: value })}
                  min={0}
                  max={5}
                  step={0.5}
                  suffix="%"
                />
              </div>

              <div className="calculator__field">
                <label className="calculator__checkbox">
                  <input
                    type="checkbox"
                    checked={inputs.adjustForInflation}
                    onChange={(e) => handleUpdateInputs({ adjustForInflation: e.target.checked })}
                  />
                  <span>Adjust withdrawals for inflation</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="calculator__error">
                {error}
              </div>
            )}
          </form>
        </div>
        
        {/* Fixed Submit Button */}
        <div style={{ 
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5rem 2rem 1.5rem 2.5rem',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <Button 
            type="button" 
            variant="primary" 
            size="lg" 
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
            style={{ width: '100%' }}
          >
            Calculate Projections
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem', scrollBehavior: 'smooth', backgroundColor: '#f8fafc' }}>
          {results && results.portfolios ? (
          <div className="calculator__results-content">
            {/* Portfolio Comparison Table */}
            <PortfolioComparison 
              results={results.portfolios} 
              selectedPortfolioId={inputs.portfolioId}
            />
            
            {/* Portfolio Comparison Chart */}
            <PortfolioComparisonChart results={results.portfolios} />
            
            {/* Detailed Analysis for All Portfolios */}
            {Object.entries(results.portfolios).map(([key, portfolio]) => (
              <div key={key} className="calculator__portfolio-section">
                <h3 className="calculator__portfolio-title">
                  {portfolio.portfolio.name} Portfolio Analysis
                </h3>
                
                {/* Results Summary with all metrics */}
                <ResultsSummary results={portfolio} inputs={inputs} />
                
                {/* Projection Chart */}
                <div className="calculator__chart-full">
                  <ProjectionChart results={portfolio} height={400} />
                </div>
                
                {/* Withdrawal Analysis Chart */}
                <div className="calculator__chart-full">
                  <WithdrawalChart results={portfolio} inputs={inputs} height={400} />
                </div>
              </div>
            ))}
            
            {/* Action Buttons at the bottom */}
            <div className="calculator__actions">
              <Button onClick={generatePdf} variant="secondary">
                Download PDF Report
              </Button>
              <Button onClick={clearResults} variant="secondary">
                Clear Results
              </Button>
            </div>
          </div>
        ) : (
          <div className="calculator__empty-state">
            <h3>Portfolio Projection Analysis</h3>
            <p>Configure your endowment parameters and click "Calculate Projections" to see detailed Monte Carlo analysis.</p>
          </div>
          )}
      </div>
      
      <Toast 
        message="Inputs have changed. Click 'Calculate Projections' to update results."
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

Calculator.meta = {
  layer: 'feature',
  cssFile: 'calculator.css',
  dependencies: ['Button', 'Input', 'ProjectionChart', 'WithdrawalChart', 'ResultsSummary'],
  status: 'stable'
};