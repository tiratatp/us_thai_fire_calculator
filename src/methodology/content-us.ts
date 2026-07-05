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
      'US federal income tax on ordinary income is levied at seven marginal rates for single filers in 2026: 10%, 12%, 22%, 24%, 32%, 35%, and 37%. Bracket thresholds are inflation-adjusted each year and were re-set for 2026 under the One Big Beautiful Bill Act (OBBBA). The 2026 bracket thresholds are shown below.',
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
      'Long-term capital gains and qualified dividends are taxed at 0%, 15%, or 20% for single filers in 2026. The 0% bracket covers taxable income up to $49,450. The 15% bracket applies from $49,451 to $545,500. The 20% bracket applies above $545,500.',
      'Long-term capital gains stack on top of ordinary income when determining which LTCG bracket applies. If ordinary income (including any Traditional IRA/401(k) distribution or Roth conversion) fills the 0% LTCG bracket space, additional capital gains taxable that year are taxed at 15% or higher.',
    ],
    citations: [
      { text: 'IRS Topic No. 409 — Capital Gains and Losses', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
    constantRef: 'US_LTCG_BRACKETS_2026_SINGLE',
  },
  {
    id: 'us-standard-deduction',
    title: '2026 US Standard Deduction (Single)',
    paragraphs: [
      'The standard deduction for single filers in 2026 is $16,100. This amount reduces taxable ordinary income before bracket calculation. An additional $1,600 is available for taxpayers aged 65 or older or blind.',
    ],
    citations: [
      { text: 'IRS Topic No. 551 — Standard Deduction', url: 'https://www.irs.gov/taxtopics/tc551' },
    ],
  },
  {
    id: 'us-niit',
    title: 'US Net Investment Income Tax (NIIT)',
    paragraphs: [
      'IRC §1411 imposes a 3.8% Net Investment Income Tax on the lesser of (a) net investment income or (b) modified adjusted gross income (MAGI) above the threshold. For single filers, the threshold is $200,000 and is not inflation-adjusted.',
      'NIIT applies to interest, dividends, capital gains, rental income, and passive business income. Traditional IRA and 401(k) distributions are excluded from net investment income (they are ordinary income), and qualified Roth IRA distributions are also excluded — but any of these distributions can raise MAGI enough to bring OTHER investment income into NIIT range.',
    ],
    citations: [
      { text: 'IRS Topic No. 559 — NIIT (IRC §1411)', url: 'https://www.irs.gov/taxtopics/tc559' },
    ],
  },
  {
    id: 'us-rmd-table',
    title: 'US Required Minimum Distribution (RMD) Table',
    paragraphs: [
      'Required Minimum Distributions (RMDs) from Traditional IRAs and 401(k)s are calculated by dividing the prior-year-end account balance by the divisor from the IRS Uniform Lifetime Table for the account holder\'s attained age. The divisors are published in IRS Publication 590-B and shown in full below.',
      'Qualified Roth IRAs have no RMD requirement during the owner\'s lifetime. HSAs also have no RMD requirement.',
    ],
    citations: [
      { text: 'IRS Publication 590-B — Uniform Lifetime Table', url: 'https://www.irs.gov/publications/p590b' },
    ],
    constantRef: 'RMD_UNIFORM_LIFETIME_TABLE',
  },
  {
    id: 'us-secure-2-age',
    title: 'SECURE 2.0 RMD Age Boundaries',
    paragraphs: [
      'The SECURE 2.0 Act of 2022 raised the RMD starting age in stages. Under the current statutory rules: taxpayers born before July 1, 1951 begin RMDs at age 73; taxpayers born on or after January 1, 1960 begin RMDs at age 75. Individuals born between July 2, 1951 and December 31, 1959 also begin RMDs at age 75 under SECURE 2.0.',
    ],
    citations: [
      { text: 'IRS Publication 590-B — Required Minimum Distributions', url: 'https://www.irs.gov/publications/p590b' },
      { text: 'SECURE 2.0 Act of 2022 (Pub. L. 117-328, Div. T) — full text PDF', url: 'https://www.congress.gov/117/plaws/publ328/PLAW-117publ328.pdf' },
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
      { text: 'IRS Publication 590-B — Roth IRA Distributions', url: 'https://www.irs.gov/publications/p590b' },
    ],
  },
  {
    id: 'early-withdrawal-penalty',
    title: 'US 10% Early Withdrawal Penalty Exceptions',
    paragraphs: [
      'Withdrawals from Traditional IRAs and 401(k)s before age 59½ are subject to a 10% additional tax under IRC §72(t). Statutory exceptions include: reaching age 59½; separation from service at age 55 or later for 401(k)/403(b) plans (Rule of 55); Substantially Equal Periodic Payments (SEPP) under §72(t)(2)(A)(iv); return of Roth basis; unreimbursed medical expenses exceeding 7.5% of AGI; first-time homebuyer ($10,000 lifetime cap for IRAs); qualified higher education expenses; disability; death; and health insurance premiums while unemployed.',
    ],
    citations: [
      { text: 'IRC §72(t) — Exceptions to Tax on Early Distributions', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions' },
    ],
  },
  {
    id: 'hsa-post-65',
    title: 'HSA Non-Medical Withdrawals Post-Age-65',
    paragraphs: [
      'After age 65, Health Savings Account (HSA) non-qualified withdrawals are subject to ordinary income tax but the 20% additional tax is removed. HSA withdrawals for qualified medical expenses under IRC §213(d) remain tax-free at any age. HSAs have no lifetime RMD requirement for the owner.',
      'Note for Thailand retirees: most medical services obtained abroad do not qualify as §213(d) qualified medical expenses unless they meet US legal and licensing standards. As a practical matter, an HSA drawn for typical Thai medical spending after age 65 is likely to function as ordinary-income-taxed distributions, similar to a Traditional IRA.',
    ],
    citations: [
      { text: 'IRS Publication 969 — HSAs and Other Tax-Favored Health Plans', url: 'https://www.irs.gov/publications/p969' },
      { text: 'IRC §213(d) — Definition of Medical Care', url: 'https://www.law.cornell.edu/uscode/text/26/213' },
    ],
  },
];
