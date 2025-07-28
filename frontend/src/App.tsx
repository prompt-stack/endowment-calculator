/**
 * @fileoverview Main React application component
 * @layer app
 * @status stable
 */

import { useState, useEffect } from 'react';
import { Calculator } from './components/features/Calculator/Calculator';
import { PlaygroundPage } from './components/pages/PlaygroundPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';
import { loadWhiteLabelConfig } from './config/whiteLabel';
import './App.css';

function App() {
  const config = loadWhiteLabelConfig();
  
  // Get initial page from URL hash
  const getPageFromHash = () => {
    const hash = window.location.hash.slice(1);
    return hash === 'playground' ? 'playground' : 'calculator';
  };
  
  const [currentPage, setCurrentPage] = useState<'calculator' | 'playground'>(getPageFromHash());
  
  // Update URL when page changes
  const handleNavigate = (page: 'calculator' | 'playground') => {
    window.location.hash = page;
    setCurrentPage(page);
  };
  
  // Listen for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          organizationName={config.organizationName}
          logoUrl={config.logoUrl}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
        <main className={`app__main ${currentPage === 'playground' ? 'app__main--full' : ''}`}>
          {currentPage === 'calculator' ? <Calculator /> : <PlaygroundPage />}
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
