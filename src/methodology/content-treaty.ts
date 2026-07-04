/**
 * US-Thailand tax treaty methodology sections.
 *
 * Sources: .research/03-us-thai-treaty.md, .research/07-oracle-critique.md.
 */

import type { MethodologySection } from './content.js';

export const TREATY_SECTIONS: readonly MethodologySection[] = [
  {
    id: 'treaty-article-20',
    title: 'Article 20 — Pensions and Social Security',
    paragraphs: [
      'Article 20(1) grants the residence state (Thailand) exclusive taxing rights over private pensions and similar remuneration. Article 20(2) grants the paying state (US) exclusive taxing rights over social security and public pensions.',
      'However, the Saving Clause (Article 1(2)) lets the US tax its citizens as if the treaty did not exist. Article 20(1) is subject to the Saving Clause, meaning both countries can tax Traditional IRA/401(k) distributions. Social Security under Article 20(2) is excepted from the Saving Clause, so Thailand cannot tax US Social Security.',
    ],
    citations: [
      { text: 'US-Thailand Tax Treaty (IRS)', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
      { text: 'Technical Explanation (Treasury)', url: 'https://www.irs.gov/pub/irs-trty/thaitech.pdf' },
    ],
  },
  {
    id: 'treaty-article-25',
    title: 'Article 25 — Foreign Tax Credit (FTC)',
    paragraphs: [
      'Article 25 provides relief from double taxation. The US grants a credit for Thai tax paid by a US citizen under IRC §904. Thailand grants a credit for US tax on US-source income. The FTC is limited to the domestic tax on that specific income in both directions.',
      'The calculator implements the corrected single-primary-taxer model: for each remitted income item, one country is the primary taxer per treaty article, and the other grants a limited credit. This avoids the double-credit bug that would understate total liability.',
    ],
    citations: [
      { text: 'US-Thailand Tax Treaty — Article 25', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
    ],
  },
  {
    id: 'saving-clause',
    title: 'Saving Clause Exceptions',
    paragraphs: [
      'The US Saving Clause (Article 1(2)) preserves US taxation of its citizens despite treaty benefits. Articles that survive for US citizens: Article 20(2) (Social Security), Article 20(5) (child support), Article 25 (FTC), Article 26 (non-discrimination), and Article 27 (Mutual Agreement Procedure). Articles that do NOT survive: Article 10 (dividends), Article 11 (interest), Article 13 (capital gains), Article 20(1) (private pensions), and Article 20(3) (annuities).',
    ],
    citations: [
      { text: 'Technical Explanation (Treasury)', url: 'https://www.irs.gov/pub/irs-trty/thaitech.pdf' },
    ],
  },
  {
    id: 'treaty-resourcing',
    title: 'Treaty Re-sourcing of US-Source Pensions',
    paragraphs: [
      'When the optimistic regulatory scenario sets treatyResourcesUsSourcePensions to true, the US treats remitted pension income as foreign-source for FTC purposes under Article 25(3). This means the US grants a foreign tax credit for Thai tax paid on that income, reducing US tax to zero. The total tax paid equals the higher of the two countries\' rates.',
      'When this flag is false (pessimistic scenario), both countries tax the same income independently. The user pays the sum of both taxes — genuine double taxation.',
    ],
    citations: [
      { text: 'US-Thailand Tax Treaty — Article 25(3)', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
    ],
  },
  {
    id: 'roth-uncertainty',
    title: 'Roth IRA Treatment in Thailand — UNSETTLED',
    paragraphs: [
      'The US-Thailand treaty was signed in 1996, before Roth IRAs existed (created in 1997). The treaty\'s definition of "pension" does not distinguish Roth distributions. The US treats qualified Roth distributions as tax-free under domestic law, unaffected by the treaty.',
      'Thailand does not have statutory recognition of Roth IRAs. The prevailing view among cross-border practitioners is that Thailand will tax remitted Roth withdrawals as pension income under §40(1). This is an UNSETTLED area with no binding authority. The calculator treats Roth as Thailand-taxable in the pessimistic scenario and provides an optimistic toggle.',
    ],
    citations: [
      { text: 'Expat Tax Thailand — Your Questions Answered', url: 'https://www.expattaxthailand.com/your-questions-answered/' },
    ],
  },
];
