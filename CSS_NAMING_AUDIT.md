# CSS Naming Convention Audit

Generated: 2025-07-28

## Summary

✅ **Most CSS follows BEM methodology correctly**
⚠️ **Minor inconsistencies found in some components**

## BEM Methodology

BEM = Block__Element--Modifier

### Correct Examples:
```css
.calculator__sidebar        /* Block__Element */
.btn--primary              /* Block--Modifier */
.results-card__value       /* Block__Element */
.results-card--success     /* Block--Modifier */
```

## Component CSS Audit

### ✅ Fully Compliant Components

1. **Calculator** (`calculator.css`)
   - `.calculator__sidebar`
   - `.calculator__form-card`
   - `.calculator__title`
   - Uses `calculator-layout` for page-level container

2. **Button** (`button.css`)
   - `.btn`
   - `.btn--primary`
   - `.btn--secondary`
   - `.btn__spinner`

3. **Input** (`input.css`)
   - `.input`
   - `.input__label`
   - `.input__container`
   - `.input--error`

4. **Results Card** (`results-card.css`)
   - `.results-card`
   - `.results-card__title`
   - `.results-card__value`
   - `.results-card--success`

### ⚠️ Minor Issues Found

1. **Header** (`header.css`)
   - ❌ `.settings-item` → Should be `.header__settings-item`
   - ❌ `.settings-note` → Should be `.header__settings-note`
   - ❌ `.about-content` → Should be `.header__about-content`

2. **Results Summary** (`results-summary.css`)
   - ❌ `.insight--positive` → Should be `.results-summary__insight--positive`
   - ❌ `.insight--negative` → Should be `.results-summary__insight--negative`

3. **Portfolio Comparison Chart** (`portfolio-comparison-chart.css`)
   - ❌ `.legend-item` → Should be `.portfolio-comparison-chart__legend-item`
   - ❌ `.legend-color` → Should be `.portfolio-comparison-chart__legend-color`

4. **Success Rate Chart** (`success-rate-chart.css`)
   - ❌ `.success-detail` → Should be `.success-rate-chart__detail`
   - ❌ `.success-percentage` → Should be `.success-rate-chart__percentage`

5. **Portfolio Comparison** (`portfolio-comparison.css`)
   - ❌ `.allocation-stocks` → Should be `.portfolio-comparison__allocation--stocks`
   - ❌ `.allocation-bonds` → Should be `.portfolio-comparison__allocation--bonds`

## CSS File Naming

✅ **All CSS files correctly use kebab-case**
- `calculator.css`
- `results-summary.css`
- `portfolio-comparison-chart.css`

## Naming Rules

### 1. Block Names
- Use component name as block
- Kebab-case for multi-word blocks
- Examples: `calculator`, `results-card`, `portfolio-comparison`

### 2. Elements
- Use double underscore `__`
- Descriptive element names
- Examples: `__title`, `__value`, `__container`

### 3. Modifiers
- Use double dash `--`
- State or variant descriptions
- Examples: `--primary`, `--success`, `--loading`

### 4. Nested Elements
- Avoid deep nesting in class names
- Use semantic HTML instead
- Bad: `.card__header__title__text`
- Good: `.card__title`

## Recommendations

1. **Fix non-BEM classes** in Header, Results Summary, and chart components
2. **Maintain consistency** - if a component uses BEM, all its classes should follow BEM
3. **Document exceptions** - utility classes like `.app` for root components
4. **Use grammar-ops CSS audit** script regularly

## Grammar-Ops Compliance

According to `grammar-ops/docs/NAMING-CONVENTIONS.md`:
- ✅ CSS files use kebab-case
- ✅ CSS classes use kebab-case with BEM
- ⚠️ Some classes need BEM fixes

---

**Action Required**: Fix the 11 non-BEM compliant classes identified above to achieve 100% consistency.