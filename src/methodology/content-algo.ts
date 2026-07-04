/**
 * Algorithm methodology sections (drawdown strategy, Monte Carlo, etc.).
 *
 * Sources: .research/04-drawdown-strategy.md, .research/05-monte-carlo.md,
 *          .research/07-oracle-critique.md, .research/08-algorithm-v2.md.
 */

import type { MethodologySection } from './content.js';

export const ALGO_SECTIONS: readonly MethodologySection[] = [
  {
    id: 'ftc-corrected',
    title: 'Corrected FTC — Single Primary Taxer Per Item',
    paragraphs: [
      'The calculator implements a corrected Foreign Tax Credit model based on the Oracle critique (Systemic #1). Instead of double-crediting Thai tax against US tax AND US tax against Thai tax on the same income, the model assigns exactly one primary taxer per income item per treaty article.',
      'For US-source pensions (Traditional IRA/401(k)/Roth remittances), Thailand is the primary taxer under Article 20(1). The US grants an FTC = min(usTaxOnItem, thaiTaxOnItem). For capital gains remittances, Thailand is primary under Article 13.',
      'Walkthrough example (Oracle D3): $50,000 Traditional IRA remitted at FX 35 = 1,750,000 THB. US tax on $50,000 ordinary ≈ $3,850. Thai PIT on 1,750,000 THB (after deductions) ≈ 262,500 THB ≈ $7,500. With treaty re-sourcing (optimistic): US FTC = min($3,850, $7,500) = $3,850, US net = $0, total = $7,500. Without re-sourcing (pessimistic): US $3,850 + Thai $7,500 = $11,350 total. The primary taxer model ensures the user always pays at least the higher of the two rates.',
    ],
    citations: [
      { text: 'Oracle Critique — Systemic #1 Double-FTC Bug', url: 'https://github.com/tiratatp/us_thai_fire_calculator/blob/main/.research/07-oracle-critique.md' },
    ],
  },
  {
    id: 'roth-conversion-value-test',
    title: 'Roth Conversion Value Test (Oracle Systemic #2)',
    paragraphs: [
      'The calculator does NOT default to "fill the 12% bracket" with Roth conversions. For a Thai resident, a Roth conversion costs US out-of-pocket tax with zero Thai benefit (since no remittance means no Thai tax, and no Thai tax means no FTC to absorb the US cost). The conversion must pass a value test.',
      'The value test only returns a positive conversion amount when: (a) age is below RMD age, (b) Traditional US balance is positive, (c) the 0% LTCG bracket is NOT being used for taxable harvest this year (the two compete for the same bracket space), and (d) forecasted future US marginal rate on RMDs exceeds current US marginal rate plus Thai marginal rate on eventual remittance.',
      'For a Thai-resident user at typical FIRE balances, the value test almost always returns 0 because future RMDs are trivial and there is no Thai FTC to justify prepaying US tax. The algorithm does not fill 12% with conversions — it only converts if the value test clears.',
    ],
    citations: [
      { text: 'Oracle Critique — Systemic #2 Roth Ladder Collapse', url: 'https://github.com/tiratatp/us_thai_fire_calculator/blob/main/.research/07-oracle-critique.md' },
    ],
  },
  {
    id: 'residency-180-days',
    title: 'Thai Residency as a Control Lever (<180 Days)',
    paragraphs: [
      'A dual citizen spending fewer than 180 days in Thailand in a given year is NOT a Thai tax resident that year. Foreign-sourced income remitted during a non-resident year triggers zero Thai tax.',
      'This is a powerful planning lever: bunch Roth conversions or capital gain realizations into non-resident years to avoid Thai tax entirely. Pre-position cash in Thailand during non-resident years to minimize future remittances.',
    ],
    citations: [
      { text: 'Oracle Critique — D1b Residency Lever', url: 'https://github.com/tiratatp/us_thai_fire_calculator/blob/main/.research/07-oracle-critique.md' },
    ],
  },
  {
    id: 'monte-carlo-defaults',
    title: 'Monte Carlo Default Assumptions',
    paragraphs: [
      'The calculator uses Vanguard VCMM forward-looking return forecasts as defaults: US Equities 6% mean / 17% vol, International Developed 6% / 19%, US Aggregate Bonds 4% / 7%, Cash 3.5% / 1%. US inflation defaults to 3% mean / 1.4% std dev. Thai inflation defaults to 2% / 2.5%. USD/THB FX defaults to a random walk centered at 35 THB/USD with 8% annual log-vol.',
      'The default number of trials is 1,000 (fast in-browser). Users can adjust upward to 10,000 for higher confidence. Success rate is the fraction of trials where the portfolio stays positive through life expectancy with no unmet spending year.',
    ],
    citations: [
      { text: 'Vanguard VCMM Return Forecasts (2026)', url: 'https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html' },
    ],
  },
  {
    id: 'correlation-matrix',
    title: 'Correlation Matrix',
    paragraphs: [
      'The Monte Carlo engine draws correlated returns across four asset classes using Cholesky decomposition. The default 4x4 correlation matrix (ordered US Stock, US Bond, Intl Stock, Cash) is based on cFIREsim and Portfolio Visualizer data.',
    ],
    citations: [
      { text: 'cFIREsim FAQ; Portfolio Visualizer', url: 'https://www.portfoliovisualizer.com/monte-carlo-simulation' },
    ],
    constantRef: 'CORRELATION_MATRIX',
  },
  {
    id: 'mulberry32',
    title: 'PRNG: Mulberry32 Seeded Random Number Generator',
    paragraphs: [
      'The Monte Carlo engine uses the Mulberry32 PRNG, a 32-bit fast PRNG that passes the gjrand statistical tests. It accepts a numeric seed, producing deterministic sequences — identical seeds yield byte-identical return paths. Box-Muller pairs convert uniform random draws into standard normal variates for correlated asset returns.',
    ],
    citations: [
      { text: 'Mulberry32 by Tommy Ettinger (gjrand tests)', url: 'https://gist.github.com/tommyettinger/46a874533244883189143505d203312c' },
    ],
  },
];
