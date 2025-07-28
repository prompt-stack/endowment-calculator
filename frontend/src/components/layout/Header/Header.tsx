/**
 * @fileoverview Header component with navigation
 * @layer layout
 * @status stable
 */

import './header.css';

interface HeaderProps {
  organizationName?: string;
  logoUrl?: string;
  onNavigate?: (page: 'calculator' | 'playground') => void;
  currentPage?: 'calculator' | 'playground';
}

export function Header({ 
  organizationName = "EndowmentIQ",
  logoUrl,
  onNavigate,
  currentPage = 'calculator'
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          {logoUrl && <img src={logoUrl} alt={organizationName} className="header__logo" />}
          <h1 className="header__title">{organizationName}</h1>
        </div>
        {onNavigate && (
          <nav className="header__nav">
            <button 
              className={`header__nav-item ${currentPage === 'calculator' ? 'active' : ''}`}
              onClick={() => onNavigate('calculator')}
            >
              Calculator
            </button>
            <button 
              className={`header__nav-item ${currentPage === 'playground' ? 'active' : ''}`}
              onClick={() => onNavigate('playground')}
            >
              Design System
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

Header.meta = {
  layer: 'layout',
  cssFile: 'header.css',
  status: 'stable'
};