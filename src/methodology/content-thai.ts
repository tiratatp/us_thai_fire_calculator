/**
 * Thai personal income tax methodology sections.
 *
 * Sources: .research/02-thai-tax.md, .research/07-oracle-critique.md.
 */

import type { MethodologySection } from './content.js';

export const THAI_SECTIONS: readonly MethodologySection[] = [
  {
    id: 'thai-pit-brackets',
    title: 'Thai PIT Progressive Brackets',
    paragraphs: [
      'Thailand taxes personal income at progressive rates from 0% to 35%. The brackets are: 0% up to 150,000 THB, 5% from 150,001 to 300,000, 10% from 300,001 to 500,000, 15% from 500,001 to 750,000, 20% from 750,001 to 1,000,000, 25% from 1,000,001 to 2,000,000, 30% from 2,000,001 to 4,000,000, and 35% above 4,000,000 THB.',
    ],
    citations: [
      { text: 'Thai Revenue Department — Personal Income Tax', url: 'https://www.rd.go.th/english/6045' },
    ],
  },
  {
    id: 'thai-personal-allowance',
    title: 'Thai Personal Allowance',
    paragraphs: [
      'Every Thai tax resident gets a flat personal allowance of 60,000 THB against assessable income. Additional allowances are available for spouses, children, parents, disabled family members, and antenatal expenses.',
    ],
    citations: [
      { text: 'PwC Tax Summaries — Thailand individual deductions', url: 'https://taxsummaries.pwc.com/thailand/individual/deductions' },
    ],
  },
  {
    id: 'thai-pension-deduction',
    title: 'Thai 50% Pension Deduction',
    paragraphs: [
      'Pension income qualifies for a 50% deduction capped at 100,000 THB. The calculator applies this only when the optimistic regulatory scenario sets thaiPensionDeductionApplies to true. The combined cap for life insurance, pension, PVD, and RMF deductions is 500,000 THB.',
    ],
    citations: [
      { text: 'PwC Tax Summaries — Thailand', url: 'https://taxsummaries.pwc.com/thailand/individual/deductions' },
    ],
  },
  {
    id: 'por-161-remittance',
    title: 'Por 161/2566 — Foreign Income Taxable on Remittance',
    paragraphs: [
      'Effective January 1, 2024, foreign-sourced income (sections 40(1) through 40(8) of the Thai Revenue Code) becomes taxable in the year it is remitted to Thailand, regardless of when it was earned. This is governed by Revenue Department Instruction Por 161/2566.',
    ],
    citations: [
      { text: 'RD Instruction Paw 161/2566 Translation', url: 'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf' },
    ],
  },
  {
    id: 'paw-162-grandfathering',
    title: 'Paw 162/2566 — Pre-2024 Grandfathering (NOT for Retirement)',
    paragraphs: [
      'Revenue Department Instruction Paw 162/2566 (November 20, 2023) provides grandfathering for income earned before January 1, 2024. Such income is NOT taxable when remitted, even if remitted in 2024 or later.',
      'However, this grandfathering does NOT extend to retirement accounts. Traditional IRA, Roth IRA, 401(k), and HSA distributions are considered "earned" at the time of distribution (post-2024), so no grandfathering applies. The calculator enforces this: the pre-2024 snapshot input is disabled in the UI for all retirement account types, and the engine ignores it if injected. Only Cash and Taxable Brokerage balances can use the optional Jan-1-2024 snapshot for grandfathering.',
    ],
    citations: [
      { text: 'RD Instruction Paw 162/2566 — pre-2024 grandfathering', url: 'https://www.hlbthai.com/wp-content/uploads/2023/09/RD-Instruction-No.-Paw161-2566-Translation.pdf' },
    ],
  },
  {
    id: 'thai-cgt-set-listed',
    title: 'Thai Capital Gains on SET-Listed Shares',
    paragraphs: [
      'Capital gains from the sale of SET-listed shares are exempt from Thai personal income tax for individual taxpayers. ASEAN-Link shares and mutual fund units (Royal Decree 689/2562) are also exempt. Unlisted shares and OTC securities are fully taxable at PIT rates. Digital assets traded on SEC-licensed platforms are exempt through 2029.',
    ],
    citations: [
      { text: 'Stock Exchange of Thailand — Tax Information', url: 'https://www.set.or.th/en/market/information/tax' },
    ],
  },
];
