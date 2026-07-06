/**
 * Interaction methodology sections (Treaty + FTC).
 *
 * Sources: .research/03-us-thai-treaty.md, .research/07-oracle-critique.md.
 */

import type { MethodologyGroup } from './content.js';

export const INTERACTION_GROUP: MethodologyGroup = {
  id: 'group-interaction',
  title: 'How the two systems interact',
  intro: 'The interaction between US and Thai tax systems as governed by the 1996 tax treaty and foreign tax credit mechanisms.',
  sections: [
    {
      id: 'treaty-article-20',
      title: 'Article 20 — Pensions and Social Security',
      paragraphs: [
        'Article 20(1) of the 1996 US-Thailand tax treaty grants the residence state exclusive taxing rights over private pensions and similar remuneration paid in consideration of past employment. Article 20(2) grants the paying state exclusive taxing rights over social security and other public pensions.',
        'For a US citizen who is a Thai tax resident, the Saving Clause (Article 1(2)) allows the United States to tax its citizens as though the treaty did not exist. Article 20(1) is not among the Saving-Clause exceptions, so both the United States and Thailand may tax a Traditional IRA/401(k) distribution — relief from double taxation must be obtained through the Foreign Tax Credit (Article 25). Article 20(2) IS in the Saving-Clause exception list, so Thailand may not tax US Social Security benefits.',
      ],
      citations: [
        { text: 'US-Thailand Income Tax Convention (1996) — IRS text', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
        { text: 'Treasury Technical Explanation of the US-Thailand Treaty', url: 'https://www.irs.gov/pub/irs-trty/thaitech.pdf' },
      ],
    },
    {
      id: 'treaty-article-25',
      title: 'Article 25 — Relief from Double Taxation (Foreign Tax Credit)',
      paragraphs: [
        'Article 25 provides for relief from double taxation through the Foreign Tax Credit mechanism. Under Article 25(1), the United States grants a credit for Thai tax paid by a US citizen, subject to the limitations of IRC §901–§904. Under Article 25(2), Thailand grants a corresponding credit for US tax paid on US-source income. In both directions the credit is limited to the domestic tax that would otherwise be due on that specific category of income.',
        'Article 25(3) contains a re-sourcing rule: for a US citizen resident in Thailand, income the treaty permits Thailand to tax is treated as arising in Thailand for the purpose of computing the US Foreign Tax Credit limitation under IRC §904. Whether Article 25(3) reaches US-source pension distributions — which under US domestic sourcing rules in IRC §§861–865 would otherwise be US-source income — is disputed among practitioners and is one of the unsettled regulatory questions grouped in the "Regulatory Uncertainties" section below.',
      ],
      citations: [
        { text: 'US-Thailand Income Tax Convention — Article 25', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
        { text: 'IRC §904 — Limitation on Credit', url: 'https://www.law.cornell.edu/uscode/text/26/904' },
        { text: 'IRC §§861–865 — Source Rules for Income', url: 'https://www.law.cornell.edu/uscode/text/26/861' },
      ],
    },
    {
      id: 'saving-clause',
      title: 'Saving Clause and Its Exceptions',
      paragraphs: [
        'The Saving Clause in Article 1(2) preserves each country\'s right to tax its own citizens and residents as though the treaty had not entered into force. Article 1(3) lists specific treaty provisions that are excepted from the Saving Clause, meaning they still bind the United States as against its own citizens.',
        'Provisions that DO survive the Saving Clause for US citizens include: Article 20(2) (Social Security and other public pensions), Article 20(5) (child support), Article 25 (relief from double taxation), Article 26 (non-discrimination), and Article 27 (Mutual Agreement Procedure). Provisions that DO NOT survive the Saving Clause include: Article 10 (dividends), Article 11 (interest), Article 13 (capital gains), Article 20(1) (private pensions), and Article 20(3) (annuities).',
      ],
      citations: [
        { text: 'US-Thailand Income Tax Convention — Article 1', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
        { text: 'Treasury Technical Explanation of the US-Thailand Treaty', url: 'https://www.irs.gov/pub/irs-trty/thaitech.pdf' },
      ],
    },
    {
      id: 'treaty-resourcing',
      title: 'Treaty Re-sourcing of US-Source Pensions (UNSETTLED)',
      paragraphs: [
        'When Article 25(3) treaty re-sourcing is applied, US-source pension income that Thailand is permitted to tax is treated as foreign-source income for the purpose of the US Foreign Tax Credit limitation under IRC §904. The US then grants a credit for Thai tax paid on that income, and total tax paid on the item is the greater of the US and Thai tax that would apply.',
        'When Article 25(3) is NOT read to re-source US-source pensions, both countries tax the same income under their domestic law and the taxpayer bears the sum of the two liabilities on that item. This is a genuine double-taxation outcome. The reach of Article 25(3) to US-source pensions is UNSETTLED — see the "Regulatory Uncertainties" section for a summary of the optimistic and pessimistic readings.',
      ],
      citations: [
        { text: 'US-Thailand Income Tax Convention — Article 25(3)', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
        { text: 'IRC §904 — Limitation on Credit', url: 'https://www.law.cornell.edu/uscode/text/26/904' },
      ],
    },
    {
      id: 'roth-uncertainty',
      title: 'Roth IRA Treatment in Thailand — UNSETTLED',
      paragraphs: [
        'The 1996 US-Thailand treaty was signed a year before Roth IRAs were created (Taxpayer Relief Act of 1997). The treaty\'s definition of "pension" in Article 20 does not distinguish between traditional and Roth accounts. Under US domestic law, a qualified Roth IRA distribution is tax-free; the treaty does not change this outcome for US purposes.',
        'Thailand has no statutory recognition of Roth IRAs. The prevailing view among cross-border practitioners is that a Roth withdrawal remitted to Thailand would be treated as pension income under Section 40(1) of the Thai Revenue Code and taxed at Thai progressive rates — with no US tax to credit under Article 25 because the US does not tax the distribution. This treatment is UNSETTLED and has no binding authority — see the "Regulatory Uncertainties" section for a summary of the optimistic and pessimistic readings.',
        'The "Regulatory exposure delta" shown in the calculator results is the absolute difference in the Monte Carlo success rate between the optimistic and pessimistic regulatory scenarios. It quantifies the risk to the retirement plan posed strictly by unsettled tax law. A large delta means the plan\'s viability relies heavily on favorable interpretations by tax authorities.',
      ],
      citations: [
        { text: 'IRC §408A — Roth IRAs (added by Taxpayer Relief Act of 1997)', url: 'https://www.law.cornell.edu/uscode/text/26/408A' },
        { text: 'Expat Tax Thailand — Practitioner Q&A on Foreign Retirement Accounts', url: 'https://www.expattaxthailand.com/your-questions-answered/' },
      ],
    },
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
  ],
};
