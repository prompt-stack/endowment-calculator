/**
 * @fileoverview Header component with navigation
 * @layer layout
 * @status stable
 */

import './header.css';

interface HeaderProps {
  organizationName?: string;
  logoUrl?: string;
  currentPath?: string;
}

export function Header({ 
  organizationName = "EndowmentIQ",
  logoUrl,
  currentPath = '/'
}: HeaderProps) {
  const handleTitleClick = () => {
    if (currentPath !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand" onClick={handleTitleClick} style={{ cursor: currentPath !== '/' ? 'pointer' : 'default' }}>
          {logoUrl && <img src={logoUrl} alt={organizationName} className="header__logo" />}
          <h1 className="header__title">{organizationName}</h1>
        </div>
        
        <nav className="header__nav">
          <button 
            className="header__nav-item" 
            onClick={() => {
              window.history.pushState({}, '', '/config');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Configuration
          </button>
        </nav>
      </div>
    </header>

  );
}

Header.meta = {
  layer: 'layout',
  cssFile: 'header.css',
  status: 'stable'
};