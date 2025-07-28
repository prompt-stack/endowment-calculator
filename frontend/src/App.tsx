/**
 * @fileoverview Main React application component
 * @layer app
 * @status stable
 */

import { useState, useEffect } from 'react';
import { Calculator } from './components/features/Calculator/Calculator';
import { ConfigShowcase } from './components/pages/ConfigShowcase/ConfigShowcase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';
import { loadWhiteLabelConfig } from './config/whiteLabel';
import './App.css';

function App() {
  const config = loadWhiteLabelConfig();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  
  const isConfigPage = currentPath === '/config';
  
  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          organizationName={config.organizationName}
          logoUrl={config.logoUrl}
          currentPath={currentPath}
        />
        <main className="app__main">
          {isConfigPage ? <ConfigShowcase /> : <Calculator />}
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
