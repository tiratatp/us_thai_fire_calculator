/**
 * US federal tax methodology sections.
 *
 * Sources: .research/01-us-federal-tax.md, .research/08-algorithm-v2.md.
 */

import type { MethodologySection } from './content.js';

export const US_SECTIONS: readonly MethodologySection[] = [
  {
    id: 'us-brackets-2026',
    title: '2026 US Ordinary Income Brackets (Single)',
    paragraphs: [
      'The calculator uses the 2026 tax brackets for single filers as published by the IRS under the One Big Beautiful Bill Act (OBBBA). These are the seven marginal rates: 10%, 12%, 22%, 24%, 32%, 35%, and 37%.',
      'Bracket thresholds are inflation-adjusted each year. The calculator always renders the values from src/data/constants.ts, so any update to the constants file immediately updates the methodology page.',
    ],
    citations: [
      { text: 'IRS 2026 Inflation Adjustments (OBBBA)', url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill' },
    ],
    constantRef: 'US_ORDINARY_BRACKETS_2026_SINGLE',
  },
  {
    id: 'us-ltcg-2026',
    title: '2026 US Long-Term Capital Gains Brackets (Single)',
    paragraphs: [
      'Long-term capital gains stack on top of ordinary income. The 0% bracket covers taxable income up to $49,450 for single filers in 2026. The 15% bracket applies from $49,451 to $545,500. The 20% bracket applies above $545,501.',
      'The calculator accounts for ordinary income crowding into the LTCG brackets. If a Traditional IRA RMD pushes taxable ordinary income above $49,450, LTCG gains that would have been 0% become 15%.',
    ],
    citations: [
      { text: 'IRS Topic No. 409', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
    constantRef: 'US_LTCG_BRACKETS_2026_SINGLE',
  },
  {
    id: 'us-standard-deduction',
    title: '2026 US Standard Deduction (Single)',
    paragraphs: [
      'The standard deduction for single filers in 2026 is $16,100. This amount reduces taxable ordinary income before bracket calculation. An additional $1,600 is available for taxpayers aged 65 or older or blind.',
      'The calculator uses the base single-filer amount. The user only enters a single filing status in v1.',
    ],
    citations: [
      { text: 'IRS Topic No. 551', url: 'https://www.irs.gov/taxtopics/tc551' },
    ],
  },
  {
    id: 'us-niit',
    title: 'US Net Investment Income Tax (NIIT)',
    paragraphs: [
      'The NIIT imposes a 3.8% tax on the lesser of (a) net investment income or (b) modified adjusted gross income (MAGI) above the threshold. For single filers, the threshold is $200,000 and is not inflation-adjusted.',
      'NIIT applies to interest, dividends, capital gains, rental income, and passive business income. Roth IRA distributions are generally excluded from NII. NIIT can be triggered by MAGI creep from Roth conversions.',
    ],
    citations: [
      { text: 'IRS Topic No. 559 (IRC §1411)', url: 'https://www.irs.gov/taxtopics/tc559' },
    ],
  },
  {
    id: 'us-rmd-table',
    title: 'US Required Minimum Distribution (RMD) Table',
    paragraphs: [
      'Required Minimum Distributions (RMDs) from Traditional IRAs and 401(k)s are calculated using the IRS Uniform Lifetime Table. The divisor depends on the account holder\'s age.',
      'The RMD age is 73 for those born before July 1, 1951, and 75 for those born in 1960 or later under SECURE 2.0. The calculator uses a whole-year approximation: birth year 1950 or earlier gives RMD age 73; 1951 and later gives 75.',
    ],
    citations: [
      { text: 'IRS Publication 590-B (Uniform Lifetime Table)', url: 'https://www.irs.gov/publications/p590b' },
    ],
    constantRef: 'RMD_UNIFORM_LIFETIME_TABLE',
  },
  {
    id: 'us-secure-2-age',
    title: 'SECURE 2.0 RMD Age Boundaries',
    paragraphs: [
      'SECURE 2.0 raised the RMD age in phases. People born before July 1, 1951, start RMDs at age 73. People born July 2, 1951 through December 31, 1959, start at 75. Those born in 1960 and later also start at 75.',
    ],
    citations: [
      { text: 'IRS Publication 590-B — SECURE 2.0 RMD age boundaries', url: 'https://www.irs.gov/publications/p590b' },
    ],
  },
  {
    id: 'roth-5yr-rules',
    title: 'Roth IRA 5-Year Rules',
    paragraphs: [
      'A qualified Roth IRA distribution (tax-free earnings) requires the account to have been open for at least five tax years starting January 1 of the first contribution year, plus the account holder being age 59½, deceased, or disabled.',
      'Each conversion has its own separate 5-year clock for the 10% early withdrawal penalty on converted principal if withdrawn before age 59½. Distribution ordering rules are: (1) contributions, (2) conversions FIFO, (3) earnings.',
    ],
    citations: [
      { text: 'IRS Publication 590-B', url: 'https://www.irs.gov/publications/p590b' },
    ],
  },
  {
    id: 'early-withdrawal-penalty',
    title: 'US 10% Early Withdrawal Penalty Exceptions',
    paragraphs: [
      'Withdrawals from Traditional IRAs and 401(k)s before age 59½ are subject to a 10% additional tax under IRC §72(t). Exceptions include: age 59½, Rule of 55 (401(k)/403(b) separation at 55+), 72(t) SEPP, Roth basis withdrawals, unreimbursed medical over 7.5% of AGI, first-time homebuyer ($10k lifetime), higher education, disability, death, and health insurance while unemployed.',
    ],
    citations: [
      { text: 'IRC §72(t) — exceptions to tax on early distributions', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions' },
    ],
  },
  {
    id: 'hsa-post-65',
    title: 'HSA Non-Medical Withdrawals Post-Age-65',
    paragraphs: [
      'After age 65, Health Savings Account (HSA) non-qualified withdrawals are subject to ordinary income tax but the 20% penalty is removed. HSA withdrawals for qualified medical expenses remain tax-free at any age.',
      'HSA has no RMD requirement. In Thailand retirement, most Thai medical expenses do not qualify as US-qualified medical under IRC §213(d), so HSA effectively becomes a Traditional IRA for daily Thai spending after age 65.',
    ],
    citations: [
      { text: 'IRS Publication 969', url: 'https://www.irs.gov/publications/p969' },
    ],
  },
];
