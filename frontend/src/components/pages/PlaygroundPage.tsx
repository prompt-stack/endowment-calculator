/**
 * @fileoverview Design playground showcasing minimal luxury approach
 * @layer pages
 * @status experimental
 */

import { useState } from 'react';
import './playground-page.css';

export function PlaygroundPage() {
  const [activeSection, setActiveSection] = useState('philosophy');

  return (
    <div className="playground">
      <header className="playground__header">
        <h1 className="playground__title">Minimal Luxury Design System</h1>
        <p className="playground__subtitle">A thoughtful approach to financial interface design</p>
      </header>

      <nav className="playground__nav">
        <button 
          className={`playground__nav-item ${activeSection === 'philosophy' ? 'active' : ''}`}
          onClick={() => setActiveSection('philosophy')}
        >
          Philosophy
        </button>
        <button 
          className={`playground__nav-item ${activeSection === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveSection('typography')}
        >
          Typography
        </button>
        <button 
          className={`playground__nav-item ${activeSection === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('colors')}
        >
          Colors
        </button>
        <button 
          className={`playground__nav-item ${activeSection === 'components' ? 'active' : ''}`}
          onClick={() => setActiveSection('components')}
        >
          Components
        </button>
        <button 
          className={`playground__nav-item ${activeSection === 'layouts' ? 'active' : ''}`}
          onClick={() => setActiveSection('layouts')}
        >
          Layouts
        </button>
      </nav>

      <main className="playground__content">
        {activeSection === 'philosophy' && (
          <section className="playground__section">
            <h2>Design Philosophy</h2>
            <div className="philosophy-grid">
              <div className="philosophy-card">
                <h3>Restraint</h3>
                <p>Every element serves a purpose. No decoration without function.</p>
              </div>
              <div className="philosophy-card">
                <h3>Clarity</h3>
                <p>Information hierarchy guides the eye naturally through complex data.</p>
              </div>
              <div className="philosophy-card">
                <h3>Trust</h3>
                <p>Professional aesthetics that convey reliability and expertise.</p>
              </div>
              <div className="philosophy-card">
                <h3>Timelessness</h3>
                <p>Classic design principles that won't feel dated in five years.</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'typography' && (
          <section className="playground__section">
            <h2>Typography Scale</h2>
            <div className="type-specimen">
              <div className="type-sample">
                <span className="type-label">Display</span>
                <h1 className="type-display">Wealth Preserved</h1>
              </div>
              <div className="type-sample">
                <span className="type-label">Heading 1</span>
                <h1 className="type-h1">Portfolio Analysis</h1>
              </div>
              <div className="type-sample">
                <span className="type-label">Heading 2</span>
                <h2 className="type-h2">Investment Strategy</h2>
              </div>
              <div className="type-sample">
                <span className="type-label">Heading 3</span>
                <h3 className="type-h3">Annual Performance</h3>
              </div>
              <div className="type-sample">
                <span className="type-label">Body</span>
                <p className="type-body">Your endowment's sustainable withdrawal rate is calculated using Monte Carlo simulations across 10,000 scenarios.</p>
              </div>
              <div className="type-sample">
                <span className="type-label">Caption</span>
                <p className="type-caption">Results based on historical market data from 1926-2024</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'colors' && (
          <section className="playground__section">
            <h2>Color Palette</h2>
            <div className="color-grid">
              <div className="color-group">
                <h3>Primary Colors</h3>
                <div className="color-swatches">
                  <div className="color-swatch" style={{ backgroundColor: '#1a2b6d' }}>
                    <span>Navy</span>
                    <code>#1a2b6d</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#1e40af' }}>
                    <span>Royal Blue</span>
                    <code>#1e40af</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#38bdf8' }}>
                    <span>Sky Blue</span>
                    <code>#38bdf8</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#7cb342' }}>
                    <span>Green</span>
                    <code>#7cb342</code>
                  </div>
                </div>
              </div>
              
              <div className="color-group">
                <h3>Neutral Scale</h3>
                <div className="color-swatches">
                  <div className="color-swatch" style={{ backgroundColor: '#1f2937' }}>
                    <span>Gray 900</span>
                    <code>#1f2937</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#4b5563' }}>
                    <span>Gray 700</span>
                    <code>#4b5563</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#6b7280' }}>
                    <span>Gray 500</span>
                    <code>#6b7280</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#d1d5db' }}>
                    <span>Gray 300</span>
                    <code>#d1d5db</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#f3f4f6' }}>
                    <span>Gray 100</span>
                    <code>#f3f4f6</code>
                  </div>
                  <div className="color-swatch" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                    <span>White</span>
                    <code>#ffffff</code>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'components' && (
          <section className="playground__section">
            <h2>Component Library</h2>
            
            <div className="component-demo">
              <h3>Buttons</h3>
              <div className="component-row">
                <button className="btn-minimal btn-minimal--primary">Calculate Projection</button>
                <button className="btn-minimal btn-minimal--secondary">Download Report</button>
                <button className="btn-minimal btn-minimal--ghost">Learn More</button>
              </div>
            </div>

            <div className="component-demo">
              <h3>Data Cards</h3>
              <div className="card-grid">
                <div className="data-card">
                  <span className="data-card__label">Portfolio Value</span>
                  <div className="data-card__value">$2,450,000</div>
                  <span className="data-card__change positive">+12.4%</span>
                </div>
                <div className="data-card">
                  <span className="data-card__label">Annual Withdrawal</span>
                  <div className="data-card__value">$98,000</div>
                  <span className="data-card__change">4% of portfolio</span>
                </div>
                <div className="data-card">
                  <span className="data-card__label">Success Rate</span>
                  <div className="data-card__value">94.3%</div>
                  <span className="data-card__change">Very sustainable</span>
                </div>
              </div>
            </div>

            <div className="component-demo">
              <h3>Form Elements</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Initial Investment</label>
                  <input type="text" className="form-input" placeholder="$1,000,000" />
                </div>
                <div className="form-field">
                  <label className="form-label">Time Horizon</label>
                  <select className="form-select">
                    <option>20 years</option>
                    <option>30 years</option>
                    <option>40 years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="component-demo">
              <h3>Progress Indicators</h3>
              <div className="progress-demo">
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: '75%' }}></div>
                </div>
                <p className="progress-label">75% probability of success</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'layouts' && (
          <section className="playground__section">
            <h2>Layout Patterns</h2>
            
            <div className="layout-demo">
              <h3>Dashboard Layout</h3>
              <div className="mini-dashboard">
                <div className="mini-dashboard__sidebar">
                  <div className="sidebar-placeholder">Navigation</div>
                </div>
                <div className="mini-dashboard__main">
                  <div className="mini-dashboard__header">
                    <div className="header-placeholder">Page Title</div>
                  </div>
                  <div className="mini-dashboard__grid">
                    <div className="grid-item">Metric Card</div>
                    <div className="grid-item">Metric Card</div>
                    <div className="grid-item">Metric Card</div>
                    <div className="grid-item grid-item--wide">Chart</div>
                    <div className="grid-item grid-item--tall">Details</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="layout-demo">
              <h3>Spacing System</h3>
              <div className="spacing-demo">
                <div className="spacing-example">
                  <div className="spacing-box spacing-box--xs"></div>
                  <span>XS - 4px</span>
                </div>
                <div className="spacing-example">
                  <div className="spacing-box spacing-box--sm"></div>
                  <span>SM - 8px</span>
                </div>
                <div className="spacing-example">
                  <div className="spacing-box spacing-box--md"></div>
                  <span>MD - 16px</span>
                </div>
                <div className="spacing-example">
                  <div className="spacing-box spacing-box--lg"></div>
                  <span>LG - 24px</span>
                </div>
                <div className="spacing-example">
                  <div className="spacing-box spacing-box--xl"></div>
                  <span>XL - 32px</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}