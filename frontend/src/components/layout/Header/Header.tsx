/**
 * @fileoverview Header component with navigation
 * @layer layout
 * @status stable
 */

import './header.css';

interface HeaderProps {
  organizationName?: string;
  logoUrl?: string;
}

export function Header({ 
  organizationName = "EndowmentIQ",
  logoUrl
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          {logoUrl && <img src={logoUrl} alt={organizationName} className="header__logo" />}
          <h1 className="header__title">{organizationName}</h1>
        </div>
      </div>
    </header>
  );
}

Header.meta = {
  layer: 'layout',
  cssFile: 'header.css',
  status: 'stable'
};