/**
 * @fileoverview Main React application component
 * @layer app
 * @status stable
 */

import { Calculator } from './components/features/Calculator/Calculator';
// ConfigShowcase removed - single page app
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';
import { loadWhiteLabelConfig } from './config/whiteLabel';
import './App.css';

function App() {
  const config = loadWhiteLabelConfig();
  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          organizationName={config.organizationName}
          logoUrl={config.logoUrl}
        />
        <main className="app__main">
          <Calculator />
        </main>
        <Footer 
          poweredByText={config.poweredByText}
          poweredByUrl={config.poweredByUrl}
          showPoweredBy={config.showPoweredBy}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App
