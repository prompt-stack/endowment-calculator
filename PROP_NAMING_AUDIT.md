# Component Prop Naming Audit

Generated: 2025-07-28

## Summary

✅ **All chart components now use consistent prop naming**

## Chart Component Props

### Standard Pattern
All chart components follow this consistent prop interface:
```typescript
interface ChartProps {
  results: MonteCarloResults | PortfolioResult;
  inputs?: CalculatorInputs;
  height?: number;
}
```

### Component Audit

#### ✅ ProjectionChart
```typescript
interface ProjectionChartProps {
  results: MonteCarloResults | PortfolioResult;
  height?: number;
}
```
Usage: `<ProjectionChart results={selectedPortfolio} height={400} />`

#### ✅ WithdrawalChart
```typescript
interface WithdrawalChartProps {
  results: MonteCarloResults | PortfolioResult;
  inputs: CalculatorInputs;
  height?: number;
}
```
Usage: `<WithdrawalChart results={selectedPortfolio} inputs={inputs} height={400} />`

#### ✅ PortfolioComparisonChart
```typescript
interface PortfolioComparisonChartProps {
  results: {
    conservative: PortfolioResult;
    balanced: PortfolioResult;
    aggressive: PortfolioResult;
  };
}
```
Usage: `<PortfolioComparisonChart results={results.portfolios} />`

#### ✅ RiskReturnChart
```typescript
interface RiskReturnChartProps {
  portfolios: {
    [key: string]: PortfolioResult;
  };
  selectedId?: string;
}
```
Usage: `<RiskReturnChart portfolios={results.portfolios} selectedId={inputs.portfolioId} />`

#### ✅ SuccessRateChart
```typescript
interface SuccessRateChartProps {
  portfolios: {
    [key: string]: PortfolioResult;
  };
  selectedId?: string;
}
```
Usage: `<SuccessRateChart portfolios={results.portfolios} selectedId={inputs.portfolioId} />`

## Naming Convention Rules

1. **Data Props**:
   - Use `results` for single portfolio data (MonteCarloResults | PortfolioResult)
   - Use `portfolios` for multiple portfolio data (object with portfolio keys)
   - Never use `portfolioResult` or `data`

2. **Configuration Props**:
   - Use `inputs` for CalculatorInputs
   - Use `height` for chart dimensions
   - Use `selectedId` for highlighting specific items

3. **Consistency**:
   - All chart components accepting single portfolio data use `results`
   - All chart components accepting multiple portfolios use `portfolios`
   - Optional props are clearly marked with `?`

## Fixed Issues

1. ~~WithdrawalChart was using `portfolioResult` instead of `results`~~ ✅ Fixed
2. All components now follow consistent naming patterns
3. Props are properly typed with TypeScript interfaces

---

✨ **No prop naming violations found after fixes. All components use consistent prop names.**