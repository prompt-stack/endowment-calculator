/**
 * @fileoverview Configuration showcase page
 * @layer pages
 * @status stable
 */

import './config-showcase.css';

export function ConfigShowcase() {
  return (
    <div className="config-showcase">
      <div className="config-showcase__hero">
        <h1>Configuration Services (Beta)</h1>
        <p>We're testing custom calculator solutions with select partners</p>
      </div>

      <div className="config-showcase__content">
        {/* Branding Section */}
        <section className="config-section">
          <h2>Branding & Identity</h2>
          <div className="config-grid">
            <div className="config-item">
              <h3>Organization Name</h3>
              <p>Display your foundation or organization name in the header</p>
              <div className="code-wrapper">
                <code>VITE_ORG_NAME="Smith Family Foundation"</code>
              </div>
            </div>
            <div className="config-item">
              <h3>Logo</h3>
              <p>Add your organization's logo to the header</p>
              <div className="code-wrapper">
                <code>VITE_LOGO_URL="https://yourorg.com/logo.png"</code>
              </div>
            </div>
            <div className="config-item">
              <h3>Footer Branding</h3>
              <p>Customize the "Powered by" text and link</p>
              <div className="code-wrapper">
                <code>VITE_POWERED_BY="Your Organization"</code>
              </div>
            </div>
            <div className="config-item">
              <h3>Custom Colors</h3>
              <p>Override theme colors to match your brand</p>
              <div className="code-wrapper">
                <code>VITE_PRIMARY_COLOR="#004085"</code>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="config-section">
          <h2>How Organizations Use This Tool</h2>
          <div className="config-grid">
            <div className="config-item">
              <h3>Scenario Planning</h3>
              <p>Model different spending rates and withdrawal strategies for board presentations</p>
              <div className="feature-badge">Most Common</div>
            </div>
            <div className="config-item">
              <h3>Donor Conversations</h3>
              <p>Show potential donors how their gifts will sustain over time</p>
              <div className="feature-badge">Lead Generation</div>
            </div>
            <div className="config-item">
              <h3>Emergency Planning</h3>
              <p>Test sustainability during funding cuts or economic downturns</p>
              <div className="feature-badge">Risk Management</div>
            </div>
            <div className="config-item">
              <h3>Investment Strategy</h3>
              <p>Compare conservative vs aggressive portfolio allocations</p>
              <div className="feature-badge">Portfolio Design</div>
            </div>
          </div>
        </section>

        {/* Service Options */}
        <section className="config-section">
          <h2>Available Services</h2>
          <div className="deployment-options">
            <div className="deployment-card">
              <h3>Basic Configuration</h3>
              <ul>
                <li>Your organization's branding</li>
                <li>Custom domain setup</li>
                <li>Basic training included</li>
              </ul>
              <div className="deployment-price">Contact for Details</div>
            </div>
            <div className="deployment-card featured">
              <h3>Full Service</h3>
              <ul>
                <li>White-label setup</li>
                <li>Ongoing hosting</li>
                <li>Technical support</li>
                <li>Feature requests</li>
              </ul>
              <div className="deployment-price">By Invitation</div>
            </div>
            <div className="deployment-card">
              <h3>Pilot Partnership</h3>
              <ul>
                <li>Co-develop features</li>
                <li>Early access to updates</li>
                <li>Case study opportunity</li>
              </ul>
              <div className="deployment-price">Limited Spots</div>
            </div>
          </div>
        </section>

        {/* Custom Features */}
        <section className="config-section">
          <h2>Customization Options</h2>
          <div className="addon-list">
            <div className="addon-item">
              <h4>Multi-Phase Withdrawals</h4>
              <p>Model different withdrawal rates over multiple time periods</p>
            </div>
            <div className="addon-item">
              <h4>Major Gift Scenarios</h4>
              <p>Include anticipated future donations in projections</p>
            </div>
            <div className="addon-item">
              <h4>Custom Portfolios</h4>
              <p>Add your specific investment mix and historical returns</p>
            </div>
            <div className="addon-item">
              <h4>Board Report Templates</h4>
              <p>Automated presentation-ready reports for stakeholders</p>
            </div>
            <div className="addon-item">
              <h4>Lead Capture Forms</h4>
              <p>Collect contact info before PDF downloads</p>
            </div>
            <div className="addon-item">
              <h4>API Integration</h4>
              <p>Connect with your existing financial systems</p>
            </div>
          </div>
        </section>

        {/* Current Capabilities */}
        <section className="config-section">
          <h2>What We're Testing</h2>
          <div className="config-example" style={{ background: 'white', padding: '2rem' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1.5rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#d4af37', fontWeight: 'bold' }}>✓</span>
                <strong>Monte Carlo Analysis:</strong> Run thousands of market scenarios
              </li>
              <li style={{ marginBottom: '1.5rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#d4af37', fontWeight: 'bold' }}>✓</span>
                <strong>Custom Branding:</strong> Make it yours with white-label options
              </li>
              <li style={{ marginBottom: '1.5rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#d4af37', fontWeight: 'bold' }}>✓</span>
                <strong>Scenario Planning:</strong> Model different withdrawal strategies
              </li>
              <li style={{ paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#d4af37', fontWeight: 'bold' }}>✓</span>
                <strong>PDF Reports:</strong> Generate professional presentations
              </li>
            </ul>
            <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#6b7280' }}>
              Note: Features and pricing are subject to change during our beta period.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="config-section contact-section">
          <h2>Interested in Beta Access?</h2>
          <p>We're working with a small group of organizations to refine our offering</p>
          <div className="contact-buttons">
            <button className="btn-primary" onClick={() => window.location.href = 'mailto:info@zenith.com?subject=Beta Access Request'}>Request Information</button>
            <button className="btn-secondary" onClick={() => window.location.href = '/'}>Try Demo</button>
          </div>
        </section>
      </div>
    </div>
  );
}

ConfigShowcase.meta = {
  layer: 'pages',
  cssFile: 'config-showcase.css',
  status: 'stable'
};