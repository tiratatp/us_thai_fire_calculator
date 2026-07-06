import type { MethodologyGroup, MethodologySection } from './content.js';

export const THAI_RULES_GROUP: MethodologyGroup = {
  id: 'group-thai-rules',
  title: 'Thai tax rules that apply to you',
  intro: 'Thai tax residency and personal income tax rules, including the treatment of foreign-source income remitted to Thailand.',
  sections: [
    {
      id: 'thai-residency',
      title: 'Thai Tax Residency — 180-Day Test and Planning Lever',
      paragraphs: [
        'Under Section 41 of the Thai Revenue Code, an individual is a Thai tax resident for a given calendar year if physically present in Thailand for 180 days or more in that year. Thai tax residency applies year-by-year and is independent of citizenship or immigration status.',
        'A non-resident year (fewer than 180 days in Thailand) does not trigger Thai personal income tax on foreign-sourced income, regardless of when that income is remitted to Thailand within the same year.',
        'Under Section 41 of the Thai Revenue Code, an individual is a Thai tax resident for a given calendar year only if physically present in Thailand for 180 days or more in that year. In a non-resident year, foreign-sourced income remitted to Thailand does not fall within the assessable income base and does not trigger Thai personal income tax, irrespective of the Paw 161/2566 remittance rule.',
        'A dual citizen who can control their physical presence therefore has a legally recognized planning lever: concentrating large realizations — Roth conversions, taxable brokerage capital-gain harvests, or lump-sum remittances of pre-2024 balances — into years in which physical presence in Thailand is under 180 days can eliminate the Thai side of the tax bill on those items. Note that this is a residency test based on physical presence and applies to the calendar year as a whole; it is not a per-transaction rule.',
      ],
      citations: [
        { text: 'Thai Revenue Department — Personal Income Tax', url: 'https://www.rd.go.th/english/6045' },
        { text: 'Thai Revenue Code Section 41 — Residency Test', url: 'https://www.rd.go.th/english/6045' },
      ],
    },
    {
      id: 'thai-pit-brackets',
      title: 'Thai PIT Progressive Brackets',
      paragraphs: [
        'Thailand taxes assessable personal income at progressive rates from 0% to 35%. The brackets are: 0% up to 150,000 THB, 5% from 150,001 to 300,000, 10% from 300,001 to 500,000, 15% from 500,001 to 750,000, 20% from 750,001 to 1,000,000, 25% from 1,000,001 to 2,000,000, 30% from 2,000,001 to 4,000,000, and 35% above 4,000,000 THB.',
      ],
      citations: [
        { text: 'Thai Revenue Department — Personal Income Tax', url: 'https://www.rd.go.th/english/6045' },
      ],
      constantRef: 'THAI_PIT_BRACKETS',
    },
    {
      id: 'thai-personal-allowance',
      title: 'Thai Personal Allowance',
      paragraphs: [
        'Every Thai tax resident receives a flat personal allowance of 60,000 THB against assessable income. Additional allowances are available for spouses, children, parents, disabled family members, and antenatal expenses.',
      ],
      citations: [
        { text: 'PwC Tax Summaries — Thailand Individual Deductions', url: 'https://taxsummaries.pwc.com/thailand/individual/deductions' },
      ],
    },
    {
      id: 'thai-pension-deduction',
      title: 'Thai 50% Pension Deduction (100,000 THB Cap)',
      paragraphs: [
        'Pension income assessable in Thailand qualifies for a 50% deduction capped at 100,000 THB per year. The combined aggregate cap for life insurance premiums, pension contributions, Provident Fund contributions, and Retirement Mutual Fund contributions is 500,000 THB.',
        'Whether the 50% pension deduction applies to foreign retirement account distributions (Traditional IRA, 401(k), Roth IRA, HSA) remitted by a US-citizen Thai tax resident is UNSETTLED. The optimistic reading treats these as pension income within the meaning of Section 40(1) of the Thai Revenue Code and applies the deduction. The pessimistic reading confines the deduction to domestic Thai pensions and denies it for foreign retirement remittances, on the basis that the statute was written before foreign retirement remittances became broadly taxable under Paw 161/2566 and no binding authority has extended it. There is no Thai Revenue Department ruling directly on point.',
      ],
      citations: [
        { text: 'PwC Tax Summaries — Thailand Individual Deductions', url: 'https://taxsummaries.pwc.com/thailand/individual/deductions' },
        { text: 'Thai Revenue Code Section 40 — Categories of Assessable Income', url: 'https://www.rd.go.th/english/6045' },
      ],
    },
    {
      id: 'por-161-remittance',
      title: 'Paw 161/2566 — Foreign Income Taxable on Remittance',
      paragraphs: [
        'Effective for tax years beginning January 1, 2024, foreign-sourced income falling within sections 40(1) through 40(8) of the Thai Revenue Code becomes taxable in the year it is remitted to Thailand, regardless of the year in which it was earned. This is set by Thai Revenue Department Instruction Paw 161/2566, which reversed the prior long-standing "earn-year-remit-later-year" tax-free interpretation.',
      ],
      citations: [
        { text: 'RD Instruction Paw 161/2566 — English Translation (HLB Thailand)', url: 'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf' },
      ],
    },
    {
      id: 'paw-162-grandfathering',
      title: 'Paw 162/2566 — Pre-2024 Grandfathering (Not for Retirement Accounts)',
      paragraphs: [
        'Thai Revenue Department Instruction Paw 162/2566 (November 20, 2023) provides that foreign-sourced income earned before January 1, 2024 is NOT assessable when remitted to Thailand, even if the remittance itself occurs in 2024 or a later year. This grandfathers cash balances and taxable investment gains that had been earned under the prior regime.',
        'Whether Paw 162 grandfathering extends to US retirement accounts (Traditional IRA, Roth IRA, 401(k), HSA) is UNSETTLED. The prevailing practitioner view is that it does not: a distribution from a US retirement account is "earned" for Thai tax purposes at the moment of distribution (which is a post-2024 event), regardless of when the underlying contributions were made or investment returns accrued. There is no Thai Revenue Department ruling directly on point; consult a cross-border tax professional before relying on grandfathering for retirement withdrawals.',
      ],
      citations: [
        { text: 'PwC Tax Summaries — Thailand Individual Income Determination (Paw 161/162)', url: 'https://taxsummaries.pwc.com/thailand/individual/income-determination' },
        { text: 'RD Instruction Paw 161/2566 — English Translation (HLB Thailand)', url: 'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf' },
      ],
    },
    {
      id: 'thai-cgt-set-listed',
      title: 'Thai Capital Gains on SET-Listed Shares',
      paragraphs: [
        'Capital gains from the sale of shares listed on the Stock Exchange of Thailand (SET) are exempt from Thai personal income tax for individual taxpayers. ASEAN-Link shares and mutual fund units are similarly exempt under Royal Decree 689/2562. Unlisted shares and OTC securities are fully taxable at progressive PIT rates. Capital gains on digital assets traded on SEC-licensed Thai platforms are exempt through 2029.',
        'Capital gains from foreign brokerage accounts (e.g., US-taxable brokerage) are not covered by the SET-listed exemption; they are treated as foreign-sourced income and become assessable in Thailand under the remittance rules described above.',
      ],
      citations: [
        { text: 'Stock Exchange of Thailand — Tax Information', url: 'https://www.set.or.th/en/market/information/tax' },
      ],
    },
  ],
};
