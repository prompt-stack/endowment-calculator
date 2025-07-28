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
import { Modal } from '../../primitives/Modal/Modal';
import { ProjectionChart, WithdrawalChart } from '../../composed';
import { ResultsSummary } from '../ResultsSummary/ResultsSummary';
import { PortfolioComparison } from '../../composed/PortfolioComparison/PortfolioComparison';
import { PortfolioComparisonChart } from '../../composed/PortfolioComparisonChart/PortfolioComparisonChart';
import './calculator.css';

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
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

  const handlePdfDownload = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // In a real app, this would send the email to the backend
    console.log('Email submitted:', email);
    
    // Show success message
    setShowToast(true);
    setShowEmailModal(false);
    setEmail('');
    setEmailError('');
    
    // Simulate PDF generation
    setTimeout(() => {
      generatePdf();
    }, 1000);
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

            {error && !error.includes('PDF') && (
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
            loadingText="Calculating..."
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
            
            {/* Portfolio Navigation Tabs */}
            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' }}>
                {['conservative', 'balanced', 'aggressive'].map((portfolioId) => (
                  <button
                    key={portfolioId}
                    onClick={() => updateInputs({ portfolioId })}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: inputs.portfolioId === portfolioId ? '#1a2b6d' : 'transparent',
                      color: inputs.portfolioId === portfolioId ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {results.portfolios[portfolioId].portfolio.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Toggle between tab view and side-by-side view */}
            <div style={{ marginTop: '1rem', marginBottom: '1rem', textAlign: 'right' }}>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  const sideBySide = document.getElementById('side-by-side-view');
                  const tabView = document.getElementById('tab-view');
                  if (sideBySide && tabView) {
                    if (sideBySide.style.display === 'none') {
                      sideBySide.style.display = 'grid';
                      tabView.style.display = 'none';
                    } else {
                      sideBySide.style.display = 'none';
                      tabView.style.display = 'block';
                    }
                  }
                }}
              >
                Toggle View
              </Button>
            </div>

            {/* Tab View - Show individual portfolio analyses */}
            <div id="tab-view" style={{ marginTop: '2rem' }}>
              {['conservative', 'balanced', 'aggressive'].map((portfolioId) => {
                const portfolio = results.portfolios[portfolioId];
                const isSelected = inputs.portfolioId === portfolioId;
                
                return (
                  <div 
                    key={portfolioId}
                    className="calculator__portfolio-section" 
                    id={`portfolio-${portfolioId}`}
                    style={{ 
                      display: isSelected ? 'block' : 'none',
                      animation: isSelected ? 'fadeIn 0.3s ease-in' : 'none'
                    }}
                  >
                    <h3 className="calculator__portfolio-title">
                      {portfolio.portfolio.name} Portfolio Analysis
                    </h3>
                    
                    {/* Results Summary with all metrics */}
                    <ResultsSummary results={portfolio} inputs={inputs} />
                    
                    {/* Projection Chart */}
                    <div className="calculator__chart-full">
                      <ProjectionChart results={portfolio} />
                    </div>
                    
                    {/* Withdrawal Analysis Chart */}
                    <div className="calculator__chart-full">
                      <WithdrawalChart results={portfolio} inputs={inputs} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison View - Show all portfolios stacked */}
            <div 
              id="side-by-side-view" 
              style={{ 
                display: 'none',
                marginTop: '2rem'
              }}
            >
              <div style={{ 
                display: 'grid',
                gap: '2rem'
              }}>
                {['conservative', 'balanced', 'aggressive'].map((portfolioId, index) => {
                  const portfolio = results.portfolios[portfolioId];
                  const isFirst = index === 0;
                  
                  return (
                    <div 
                      key={portfolioId}
                      style={{ 
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        marginBottom: isFirst ? '0' : '1rem'
                      }}
                    >
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '2rem',
                        alignItems: 'start'
                      }}>
                        {/* Left side - Portfolio info and metrics */}
                        <div>
                          <h3 style={{ 
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#1a2b6d',
                            marginBottom: '1.5rem',
                            fontFamily: "'Playfair Display', serif"
                          }}>
                            {portfolio.portfolio.name}
                          </h3>
                          
                          {/* Key Metrics Grid */}
                          <div style={{ 
                            display: 'grid',
                            gap: '1rem'
                          }}>
                            <div style={{ 
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Success Rate</div>
                              <div style={{ 
                                fontSize: '2rem', 
                                fontWeight: 600, 
                                color: portfolio.success_rate >= 0.8 ? '#7cb342' : portfolio.success_rate >= 0.6 ? '#f59e0b' : '#dc2626' 
                              }}>
                                {(portfolio.success_rate * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div style={{ 
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Median Final Balance</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                ${portfolio.median_final_balance.toLocaleString()}
                              </div>
                            </div>
                            
                            <div style={{ 
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Expected Return</div>
                              <div style={{ fontSize: '1.125rem' }}>
                                {(portfolio.portfolio.expected_return * 100).toFixed(1)}% annually
                              </div>
                            </div>
                            
                            <div style={{ 
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Asset Allocation</div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {portfolioId === 'conservative' ? '50% Stocks / 50% Bonds' :
                                 portfolioId === 'balanced' ? '70% Stocks / 30% Bonds' :
                                 '90% Stocks / 10% Bonds'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right side - Chart */}
                        <div style={{ height: '300px' }}>
                          <ProjectionChart results={portfolio} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Action Buttons at the bottom */}
            <div className="calculator__actions">
              <Button onClick={handlePdfDownload} variant="secondary">
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

      {/* Email Modal for PDF Download */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmail('');
          setEmailError('');
        }}
        title="Download PDF Report"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
            Enter your email address to receive the comprehensive endowment analysis report.
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="your@email.com"
              error={emailError}
            />
          </div>
          
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Your report will include:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
              <li>Monte Carlo simulation results</li>
              <li>Portfolio performance projections</li>
              <li>Risk analysis for all three strategies</li>
              <li>Personalized recommendations</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEmailModal(false);
                setEmail('');
                setEmailError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEmailSubmit}
            >
              Send Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Calculator.meta = {
  layer: 'feature',
  cssFile: 'calculator.css',
  dependencies: ['Button', 'Input', 'ProjectionChart', 'WithdrawalChart', 'ResultsSummary'],
  status: 'stable'
};