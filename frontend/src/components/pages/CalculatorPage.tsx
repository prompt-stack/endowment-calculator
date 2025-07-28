/**
 * @fileoverview Calculator page component
 * @layer pages
 * @status stable
 * @dependencies [Calculator]
 */

import { Calculator } from '../features/Calculator/Calculator';
import './calculator-page.css';

export function CalculatorPage() {
  return (
    <div className="calculator-page">
      <Calculator />
    </div>
  );
}

CalculatorPage.meta = {
  layer: 'page',
  cssFile: 'calculator-page.css',
  dependencies: ['Calculator'],
  status: 'stable'
};