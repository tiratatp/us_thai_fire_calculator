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
    title: 'Foreign Tax Credit — Per-Item Primary Taxer Model',
    paragraphs: [
      'The US and Thai Foreign Tax Credit rules (IRC §901–§904 and Section 61 of the Thai Revenue Code as coordinated through Article 25 of the treaty) are limited-credit regimes: each country credits the foreign tax paid on a given item of income only up to the amount of its own domestic tax on that same item. When both countries apply their FTC rules to the same income item, the taxpayer\'s total tax on that item equals the higher of the two countries\' domestic taxes — not the sum, and not zero.',
      'For a US citizen who is a Thai tax resident, treaty article assignment determines which country is the "primary taxer" (the one whose tax is not credited against by anyone) for each item: Thailand for private pension distributions remitted to Thailand under Article 20(1), Thailand for capital gains under Article 13, and the United States for US Social Security under Article 20(2). Item-by-item application of the FTC prevents the arithmetic error of allowing both countries to credit the other simultaneously — an error that would understate the true combined liability.',
      'Worked example. A US-citizen Thai tax resident remits a $50,000 Traditional IRA distribution at an FX rate of 35 THB/USD, or 1,750,000 THB. US federal tax on the $50,000 ordinary distribution is approximately $3,850. Thai personal income tax on 1,750,000 THB after allowances and the 100,000 THB pension deduction is approximately 262,500 THB, or approximately $7,500. With Article 25(3) re-sourcing applied (optimistic scenario), the US grants a foreign tax credit equal to min($3,850, $7,500) = $3,850, so US net tax on the item is $0 and total tax is $7,500. Without re-sourcing (pessimistic scenario), the two taxes stack: $3,850 + $7,500 = $11,350.',
    ],
    citations: [
      { text: 'US-Thailand Income Tax Convention — Article 25', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
      { text: 'IRC §904 — Limitation on Credit', url: 'https://www.law.cornell.edu/uscode/text/26/904' },
      { text: 'Thai Revenue Department — Personal Income Tax', url: 'https://www.rd.go.th/english/6045' },
    ],
  },
  {
    id: 'roth-conversion-value-test',
    title: 'Roth Conversion Value Test',
    paragraphs: [
      'A Roth conversion is a taxable event under IRC §408A(d)(3): the pre-tax portion of the amount converted from a Traditional IRA to a Roth IRA is included in ordinary income for the year of the conversion. Conversions have no direct Thai tax consequence because no Thai remittance occurs at the moment of conversion — the money moves from one US retirement account to another.',
      'The classic "fill up the 12% bracket" heuristic assumes that any US tax paid now on a conversion will be recouped later by avoiding a higher US marginal rate on Required Minimum Distributions. For a US citizen who is a Thai tax resident, this heuristic can fail: at the time of eventual remittance, Thailand may tax the distribution regardless of source (Traditional or Roth), and if the taxpayer\'s Thai marginal rate exceeds the US rate on the same income, the US FTC absorbs the entire US liability. Prepaying US tax through a conversion then produces no net saving on the US side and no offset on the Thai side.',
      'A meaningful conversion value test requires all of the following to hold: (a) the taxpayer is under the RMD starting age; (b) a positive Traditional balance exists; (c) the 0% LTCG bracket is not simultaneously being used for tax-gain harvesting (the two strategies compete for the same headroom in the 12% ordinary bracket); and (d) the projected future US marginal rate on RMDs exceeds the current US marginal rate on the conversion plus the projected Thai marginal rate on the eventual remittance of that same money. In practice, at typical FIRE portfolio sizes and Thai residency, the value test frequently returns zero, and a rational optimization declines to convert unless the test clears.',
    ],
    citations: [
      { text: 'IRC §408A — Roth IRAs', url: 'https://www.law.cornell.edu/uscode/text/26/408A' },
      { text: 'IRS Publication 590-A — Contributions to IRAs (Roth conversions)', url: 'https://www.irs.gov/publications/p590a' },
    ],
  },
  {
    id: 'residency-180-days',
    title: 'Thai Residency as a Planning Lever (<180 Days)',
    paragraphs: [
      'Under Section 41 of the Thai Revenue Code, an individual is a Thai tax resident for a given calendar year only if physically present in Thailand for 180 days or more in that year. In a non-resident year, foreign-sourced income remitted to Thailand does not fall within the assessable income base and does not trigger Thai personal income tax, irrespective of the Paw 161/2566 remittance rule.',
      'A dual citizen who can control their physical presence therefore has a legally recognized planning lever: concentrating large realizations — Roth conversions, taxable brokerage capital-gain harvests, or lump-sum remittances of pre-2024 balances — into years in which physical presence in Thailand is under 180 days can eliminate the Thai side of the tax bill on those items. Note that this is a residency test based on physical presence and applies to the calendar year as a whole; it is not a per-transaction rule.',
    ],
    citations: [
      { text: 'Thai Revenue Code Section 41 — Residency Test', url: 'https://www.rd.go.th/english/6045' },
    ],
  },
  {
    id: 'withdrawal-order',
    title: 'Withdrawal Order Used to Fund Thai Baht Spending',
    paragraphs: [
      'When a Thai tax resident needs to remit money to Thailand to fund living expenses, the tax cost of the remittance depends heavily on which account the money comes from. The Thai personal income tax under Paw 161/2566 assesses the "assessable portion" of what is remitted, and the US federal tax treatment (ordinary income, LTCG, penalty) depends on account type. A greedy, source-by-source funding order minimizes the combined US + Thai bill on a per-baht basis.',
      'The tax-minimizing order, from cheapest to most expensive on the combined bill, is: (1) Cash held on or before Jan 1, 2024 (grandfathered under Paw 162, zero-assessable in Thailand and no US tax); (2) return of basis from a taxable brokerage account (already-taxed principal, zero on both sides); (3) taxable brokerage capital gains (US LTCG plus Thai assessment on the gain portion); (4) Traditional IRA / 401(k) distributions (US ordinary income plus, if optimistic, the Thai pension deduction and treaty re-sourcing FTC); (5) Roth IRA (US-tax-free but Thailand may tax as pension income under the pessimistic reading — the FTC cannot absorb the Thai side because there is no US tax to credit); (6) HSA (US ordinary income and possible penalty if pre-65 non-medical, plus Thai pension treatment).',
      'The order shifts for US-dollar spending that never touches Thailand (e.g., US-based travel). In that case Roth IRA moves ahead of Traditional IRA because Roth is US-tax-free AND generates no Thai remittance — the classic "shining moment" for Roth in a Thai-resident portfolio.',
    ],
    citations: [
      { text: 'RD Instruction Paw 161/2566 — English Translation (HLB Thailand)', url: 'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf' },
      { text: 'PwC Tax Summaries — Thailand Individual Income Determination', url: 'https://taxsummaries.pwc.com/thailand/individual/income-determination' },
    ],
  },
  {
    id: 'drawdown-sequence',
    title: 'Order of Operations Within Each Year',
    paragraphs: [
      'The tax outcome of a given year depends on the order in which events occur. This calculator applies a fixed sequence intended to match how the US and Thai systems compute liability: (1) inflate this year\'s baseline Thai baht and USD spending needs; (2) execute all Required Minimum Distributions from Traditional IRA and 401(k) accounts, which are non-optional under IRC §401(a)(9); (3) if a Thai tax resident, fund the Thai baht spending need PLUS an estimate of the Thai tax it will trigger — because the remittance to pay Thai tax is itself an assessable remittance, this requires a fixed-point iteration; (4) fund the USD-only spending need (travel, US medical), which does not create Thai remittances; (5) evaluate the Roth conversion value test and apply a conversion only if it clears; (6) compute US federal tax on the year\'s ordinary income, LTCG, and any early-withdrawal penalty; (7) compute Thai personal income tax on the assessable portion of what was actually remitted; (8) apply the per-item Foreign Tax Credit; (9) pay the net US tax from the USD cash pool; (10) apply this year\'s market returns to all account balances; (11) advance the USD/THB exchange rate by one step.',
      'Two ordering decisions matter especially. RMDs are computed and executed BEFORE the Roth conversion value test, so the conversion sees the correct post-RMD ordinary income floor. The 0% LTCG bracket and Roth conversions both compete for the same headroom in the 12% ordinary bracket; because both would draw down that headroom, they are treated as mutually exclusive within a single year, with 0% LTCG harvesting preferred when both are otherwise attractive.',
    ],
    citations: [
      { text: 'IRC §401(a)(9) — Required Minimum Distributions', url: 'https://www.law.cornell.edu/uscode/text/26/401' },
      { text: 'IRC §408A(d)(3) — Roth Conversion Rules', url: 'https://www.law.cornell.edu/uscode/text/26/408A' },
    ],
  },
  {
    id: 'monte-carlo-defaults',
    title: 'Monte Carlo Default Assumptions',
    paragraphs: [
      'Monte Carlo simulation of portfolio outcomes uses forward-looking capital market assumptions rather than pure historical bootstrapping, following the approach used by Vanguard\'s Capital Markets Model (VCMM) and similar institutional forecasts. Default annualized parameters are: US Equities 6.0% mean / 17.0% volatility, International Developed Equities 6.0% / 19.0%, US Aggregate Bonds 4.0% / 7.0%, Cash 3.5% / 1.0%. US CPI inflation defaults to a 3.0% mean with 1.4% standard deviation; Thai CPI inflation defaults to 2.0% / 2.5%. The USD/THB exchange rate follows a geometric random walk centered at 35 THB/USD with 8% annual log-volatility.',
      'The default trial count is 1,000, adjustable upward to 10,000. A trial "succeeds" when the portfolio remains positive through the specified life expectancy AND every year\'s desired real spending was fully funded from portfolio and non-portfolio income. The reported success rate is the fraction of trials meeting both conditions.',
    ],
    citations: [
      { text: 'Vanguard Capital Markets Model — Return Forecasts', url: 'https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html' },
      { text: 'Federal Reserve Economic Data — USD/THB Exchange Rate', url: 'https://fred.stlouisfed.org/data/AEXTHUS' },
      { text: 'Federal Reserve Economic Data — Thai CPI Inflation', url: 'https://fred.stlouisfed.org/data/FPCPITOTLZGTHA' },
    ],
  },
  {
    id: 'correlation-matrix',
    title: 'Correlation Matrix',
    paragraphs: [
      'Correlated multi-asset returns are drawn using Cholesky decomposition of a 4×4 correlation matrix over the asset ordering (US Stock, US Bond, International Stock, Cash). The default correlations approximate long-run historical values as reported by Portfolio Visualizer and consistent with the cFIREsim methodology: a mild negative US-stock/US-bond correlation, a strong positive US-stock/international-stock correlation, and near-zero correlations between cash and the risky assets.',
    ],
    citations: [
      { text: 'Portfolio Visualizer — Monte Carlo Simulation', url: 'https://www.portfoliovisualizer.com/monte-carlo-simulation' },
    ],
    constantRef: 'CORRELATION_MATRIX',
  },
  {
    id: 'mulberry32',
    title: 'PRNG: Mulberry32 Seeded Random Number Generator',
    paragraphs: [
      'Random draws are produced by the Mulberry32 pseudorandom number generator, a 32-bit generator that passes the gjrand statistical test suite. Mulberry32 takes an integer seed and produces a deterministic sequence — identical seeds produce byte-identical return paths, so results are fully reproducible. Uniform draws are converted to standard normal variates via the Box-Muller transform, and correlated multi-asset draws are obtained by matrix-multiplying the independent normal vector by the lower-triangular Cholesky factor of the correlation matrix.',
    ],
    citations: [
      { text: 'Mulberry32 — Tommy Ettinger (public-domain gist, gjrand-tested)', url: 'https://gist.github.com/tommyettinger/46a874533244883189143505d203312c' },
    ],
  },
];

// ---------- FIRE multipliers ----------

export const FIRE_MULTIPLIERS: readonly MethodologySection[] = [
  {
    id: 'fire-multipliers',
    title: 'FIRE Multipliers (25× / 33×) by Retirement Horizon',
    paragraphs: [
      'The FIRE number — the portfolio value at which a retiree could reasonably expect to fund annual real spending indefinitely — is expressed as a multiplier applied to annual expenses. The multiplier is the reciprocal of the assumed sustainable withdrawal rate.',
      'A 25× multiplier corresponds to a 4% initial withdrawal rate. This is the "4% rule" derived from the Trinity Study (Cooley, Hubbard, and Walz, 1998), which found that historical US returns supported a 4% inflation-adjusted withdrawal rate at high success probability over 30-year retirement horizons. The 25× multiplier is applied when the projected retirement horizon (life expectancy minus retirement age) is 30 years or less.',
      'A 33× multiplier corresponds to a 3% initial withdrawal rate and is applied when the retirement horizon exceeds 30 years. The lower rate provides additional margin for the sequence-of-returns and longevity risk inherent in longer horizons; contemporary academic work (Bengen, Kitces, and Pfau, among others) supports rates in the 3.0–3.5% range for horizons of 40+ years.',
    ],
    citations: [
      { text: 'Trinity Study — Cooley, Hubbard, Walz (1998) — overview', url: 'https://en.wikipedia.org/wiki/Trinity_study' },
      { text: 'Bengen (1994) — 4% Rule — overview', url: 'https://en.wikipedia.org/wiki/William_Bengen' },
    ],
    constantRef: 'FIRE_MULTIPLIER_30_YR',
  },
];
