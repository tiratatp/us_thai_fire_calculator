# Monte Carlo Retirement Calculator — Industry Assumptions Reference

## 1. Return & Std Dev (Industry Defaults)

| Asset | Mean (nominal) | Std Dev | Source |
|-------|----------------|---------|--------|
| US Large-Cap (S&P 500 TR) | 10% | 18% | cFIREsim defaults |
| US Large-Cap (PV VTI 1972-2025) | 12.2% | 15.6% | Portfolio Visualizer |
| US Agg Bonds | 5% | 6% | cFIREsim |
| US Agg Bonds (PV BND) | 6.6% | 8.0% | Portfolio Visualizer |
| Intl Developed | 10% | 18-20% | cFIREsim / PV EFA-VXUS |
| Cash | 2% | 1% | cFIREsim |

**Vanguard VCMM 10-yr forecast (2026, forward-looking):**

| Asset | Return | Vol |
|-------|--------|-----|
| US Equities | 5.5-6.5% | 17-18% |
| Intl Dev Equities | 5.5-6.5% | 18-20% |
| US Agg Bonds | 3.5-4.5% | 6-7% |
| Cash | 3.5-4.0% | 1% |

**Source:** https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html ; https://pomegra.io/learn/library/track-a-foundations/compounding/chapter-12-calculators-and-tools/cfiresim-walkthrough ; https://www.portfoliovisualizer.com/monte-carlo-simulation

**Design choice for calculator defaults:** Use the Vanguard VCMM forward-looking numbers as defaults (more conservative than historical, industry-current). Allow user to switch to "historical" values.

## 2. Correlation Matrix

|         | US Stk | US Bnd | Intl | Cash |
|---------|--------|--------|------|------|
| US Stk  | 1.00   | -0.20  | 0.70 | 0.00 |
| US Bnd  | -0.20  | 1.00   | 0.10 | 0.10 |
| Intl    | 0.70   | 0.10   | 1.00 | 0.05 |
| Cash    | 0.00   | 0.10   | 0.05 | 1.00 |

**Source:** cFIREsim FAQ; Portfolio Visualizer correlation examples.

## 3. US Inflation

| Value | Source |
|-------|--------|
| Mean 1926-present: 3.0-3.5% | FIRECalc / NestEgg |
| Mean 1972-2025: 3.91% | Portfolio Visualizer CPI-U |
| Std dev: 1.3-1.4% | Portfolio Visualizer |
| Vanguard default: 3% | Vanguard RWC |

**Calculator default:** 3% mean, 1.4% std dev.

## 4. Thai Inflation (2010-2024)

Annual CPI (FRED FPCPITOTLZGTHA):

| Year | Rate | Year | Rate |
|------|------|------|------|
| 2010 | 3.25% | 2018 | 1.06% |
| 2011 | 3.81% | 2019 | 0.71% |
| 2012 | 3.01% | 2020 | -0.85% |
| 2013 | 2.18% | 2021 | 1.23% |
| 2014 | 1.90% | 2022 | -1.61% |
| 2015 | -0.90% | 2023 | 8.48% |
| 2016 | 0.19% | 2024 | 1.37% |
| 2017 | 0.67% | | |

- 2010-2019 avg: ~1.7%
- 2010-2024 avg: ~2.6%
- Recent trend (2024): 1.37%

**Calculator default:** 2.0% mean, 2.5% std dev (Thailand tends to be lower + more volatile than US, with occasional deflation).

**Source:** https://fred.stlouisfed.org/data/FPCPITOTLZGTHA

## 5. USD/THB Exchange Rate

| Metric | Value | Source |
|--------|-------|--------|
| Mean 2010-2024 | ~33.5 THB/USD | FRED AEXTHUS |
| Recent (Jun 2026) | ~32.90 THB/USD | FRED EXTHUS |
| Annualized vol (GARCH) | ~22% | NYU V-Lab |
| Persistence β | 0.9156 (very slow mean reversion) | NYU V-Lab APARCH |

**Calculator design:** Model USD/THB as a random walk (log-normal returns) with high persistence. Default 35 THB/USD center, 8% annual vol as user-editable. Small drift = 0 (no reliable directional forecast).

**Source:** https://vlab.stern.nyu.edu/volatility/VOL.USDTHB%3AFOREX-R.GARCH ; https://fred.stlouisfed.org/data/AEXTHUS

## 6. Portfolio Mix

| Mix | Stocks / Bonds | Use |
|-----|----------------|-----|
| Conservative | 40 / 60 | Near retirement / low risk |
| Balanced | 60 / 40 | Default retiree |
| Growth | 70 / 30 | Early retirement |
| Aggressive | 80 / 20 | Young retiree |

Rebalancing: **Annual** (industry standard).

**Source:** Portfolio Visualizer methodology; Fidelity IRE methodology.

## 7. Number of Trials

| Tool | Trials |
|------|--------|
| Vanguard | 10,000 |
| Fidelity | 250+ (uses percentile confidence) |
| Portfolio Visualizer | 10,000 |
| cFIREsim | ~119 historical cycles (30-yr) — exhaustive not MC |

**Calculator default:** 1,000 trials (fast in-browser). Allow user to bump to 10,000 for higher confidence.

## 8. Sequence-of-Returns Risk

Sequence-of-returns risk is the danger that poor early returns deplete a portfolio faster than average-return math suggests. When withdrawing a fixed dollar amount annually, a market decline in the first few years forces selling more shares at depressed prices to fund the same withdrawal. This permanently reduces the portfolio's recovery capacity — even if markets later hit historical average, the portfolio may never recover because fewer shares remain. Monte Carlo simulation captures this by generating thousands of return sequences with different orderings of good/bad years, tracking portfolio year-by-year with withdrawals. A static average-return calc assumes one smooth mean path, hiding that two retirees with identical average returns can have vastly different outcomes depending on when the worst years occur.

**Source:** Wade Pfau — FPA Journal July 2016.

## 9. Success Metric

| Tool | Definition |
|------|------------|
| cFIREsim | Portfolio > $0 at ALL times |
| Vanguard | Portfolio > $0 at target age |
| Fidelity | Confidence percentiles (50/75/90) |
| Portfolio Visualizer | % of trials ending positive + percentile ending balances |

**Calculator design:**
- Primary: "success rate" = % of trials where portfolio > 0 at life expectancy
- Secondary: percentile ending balances (10th, 50th, 90th)
- Show FIRE = success rate >= some threshold (default 90%)

## 10. Seeded PRNG (JavaScript)

**Recommended: Mulberry32** — 32-bit, fast, passes gjrand tests.

```typescript
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

**Box-Muller for normal draws:**

```typescript
export function normalPair(u: () => number): [number, number] {
  const u1 = u();
  const u2 = u();
  const r = Math.sqrt(-2 * Math.log(u1));
  const t = 2 * Math.PI * u2;
  return [r * Math.cos(t), r * Math.sin(t)];
}
```

**Cholesky decomposition** for correlated multivariate normals (needed to draw correlated returns across 4 assets):

```typescript
// Standard Cholesky — decompose corr matrix L such that L @ L.T = Σ
// Then correlated returns = L @ independent_normals
```

**Source:** https://gist.github.com/tommyettinger/46a874533244883189143505d203312c ; standard numerical methods.
