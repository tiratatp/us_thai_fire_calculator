import type { MethodologyGroup } from './content.js';

export const SIMULATION_GROUP: MethodologyGroup = {
  id: 'group-simulation',
  title: 'How this calculator simulates it',
  intro: 'The technical implementation of the simulation, including the Monte Carlo engine and the step-by-step drawdown algorithm.',
  sections: [
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
    {
      id: 'thai-tax-timing',
      title: 'Why Thai Tax Appears Only in Certain Years',
      paragraphs: [
        'With default inputs (THB Cash = 9.5M THB, USD Cash = $165k, Taxable Brokerage = $1.275M with $900k basis), Thai tax follows a distinctive pattern.',
        'THB Cash lasts ~3 years. When it runs out, remittations from USD Cash begin. Under post-2024 Thai rules, USD Cash remittances are <strong>fully assessable</strong> (no grandfathering applies), triggering Thai personal income tax on amounts above the 150k THB deduction. This creates a sharp tax spike in years 4–5.',
        'Once USD Cash is spent, the calculator remits <strong>Taxable Brokerage basis</strong> ($900k) before touching gains. Under <em>Paw 162/2566</em>, basis remittances are <strong>not assessable</strong> in Thailand — so Thai tax drops to near zero. This gap lasts ~10 years while the $900k basis is drawn down.',
        'After basis is exhausted, <strong>capital gains</strong> are remitted and taxed in Thailand (with FTC offset). Simultaneously, <strong>Traditional IRA RMDs</strong> begin at age 75. Both are fully assessable in Thailand, creating sustained Thai tax liability offset by foreign tax credits on US-paid tax.',
      ],
    },
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
  ],
};
