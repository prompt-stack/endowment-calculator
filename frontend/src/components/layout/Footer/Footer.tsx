/**
 * @fileoverview Footer component with branding
 * @layer layout
 * @status stable
 */

import './footer.css';

interface FooterProps {
  poweredByText?: string;
  poweredByUrl?: string;
  showPoweredBy?: boolean;
}

export function Footer({ 
  poweredByText = "Your Organization",
  poweredByUrl,
  showPoweredBy = true
}: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__container">
        {showPoweredBy && (
          <div className="footer__powered-by">
            Powered by {poweredByUrl ? (
              <a href={poweredByUrl} target="_blank" rel="noopener noreferrer" className="footer__link">
                {poweredByText}
              </a>
            ) : (
              <span className="footer__brand">{poweredByText}</span>
            )}
          </div>
        )}
        
        <div className="footer__disclaimer">
          For illustrative purposes only. Past performance does not guarantee future results.
        </div>
      </div>
    </footer>
  );
}

Footer.meta = {
  layer: 'layout',
  cssFile: 'footer.css',
  status: 'stable'
};