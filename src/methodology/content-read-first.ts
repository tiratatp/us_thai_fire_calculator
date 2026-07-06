import type { MethodologyGroup, MethodologySection } from './content.js';

const DISCLAIMER_SECTION: MethodologySection = {
  id: 'disclaimer',
  title: 'Disclaimer',
  paragraphs: [
    'This is not tax advice. The information on this page is for educational purposes only and does not constitute legal, tax, or financial advice. The rules described here interpret the 1996 US-Thailand tax treaty and post-2024 Thai remittance regime as they stand in mid-2026; several key questions remain unsettled. Consult a cross-border tax professional before making any decisions.',
    'Four specific rules are UNSETTLED and reasonable practitioners disagree on their correct application: (i) whether Thailand taxes remitted qualified Roth IRA distributions; (ii) whether Article 25(3) of the treaty re-sources US-source pension distributions for US Foreign Tax Credit purposes; (iii) whether the Thai 50% pension deduction applies to foreign retirement account remittances; and (iv) whether the US Net Investment Income Tax is creditable against Thai tax under Article 25. Each is described in detail in the "Regulatory Uncertainties" section below. Results are reported for both the optimistic and pessimistic reading of the combined bundle so the range of plausible outcomes is visible.',
    'This calculator also assumes — consistent with the prevailing practitioner view but not with any binding authority — that Paw 162/2566 pre-2024 grandfathering does NOT extend to Traditional IRA, Roth IRA, 401(k), or HSA distributions; only Cash and Taxable Brokerage balances held on January 1, 2024 can be grandfathered.',
  ],
};

const REGULATORY_UNCERTAINTIES_SECTION: MethodologySection = {
  id: 'regulatory-uncertainties',
  title: 'Regulatory Uncertainties — Four Unsettled Questions',
  paragraphs: [
    'Four specific questions relevant to a US-citizen Thai tax resident are UNSETTLED as of mid-2026: no binding statute, ruling, or case law resolves them, and reasonable practitioners disagree. This calculator presents both a pessimistic reading (each question resolves against the taxpayer) and an optimistic reading (each resolves in the taxpayer\'s favor). The two readings define the outer bounds of plausible outcomes.',
    '1. Roth IRA taxation in Thailand. Pessimistic reading: Thailand taxes remitted qualified Roth distributions as pension income under Section 40(1) of the Thai Revenue Code at progressive PIT rates, with no US tax to credit under Article 25 (the US does not tax the distribution). Optimistic reading: Thailand recognizes the US tax character of a qualified Roth distribution and does not tax it. There is no binding Thai Revenue Department position on this question; the statute pre-dates the Roth IRA (1996 treaty; Roth created 1997).',
    '2. Treaty re-sourcing of US-source pensions under Article 25(3). Pessimistic reading: Article 25(3) does not reach US-source pension distributions, so both the US and Thailand tax the same distribution under their domestic law and the taxpayer bears the sum of the two liabilities on that item. Optimistic reading: Article 25(3) re-sources US-source pension income to Thailand for US Foreign Tax Credit purposes, so the US grants a §904-limited credit for the Thai tax paid and the total on the item is the greater of the two countries\' taxes. This is one of the most consequential unsettled questions for a Thai-resident retiree.',
    '3. Thai 50% pension deduction applied to foreign retirement remittances. Pessimistic reading: the 50% deduction (capped at 100,000 THB) is confined by statute to domestic Thai pensions and does not apply to foreign retirement account remittances. Optimistic reading: the deduction applies to any income falling within Section 40(1) of the Thai Revenue Code, including foreign pension remittances that Thailand chooses to tax as pension income.',
    '4. NIIT creditability against Thai tax. Pessimistic reading: the 3.8% US Net Investment Income Tax under IRC §1411 is not a "tax on income" within the meaning of Article 25 of the treaty and is therefore not creditable in either direction. This is the historical IRS position. Optimistic reading: NIIT is a covered tax on income and is creditable against Thai tax under Article 25(2), reducing the Thai side of the bill on investment items. Recent US federal case law (notably Christensen v. United States, Fed. Cl. 2023, and Bruyea v. United States, Fed. Cl. 2024) has held NIIT to be creditable under similar treaty language against Canadian and French tax; the extension to Thailand has not been tested.',
  ],
  citations: [
    { text: 'US-Thailand Income Tax Convention (1996) — IRS text', url: 'https://www.irs.gov/pub/irs-trty/thailand.pdf' },
    { text: 'IRC §1411 — Imposition of NIIT', url: 'https://www.law.cornell.edu/uscode/text/26/1411' },
    { text: 'IRC §904 — Limitation on Credit', url: 'https://www.law.cornell.edu/uscode/text/26/904' },
    { text: 'Christensen v. United States (Fed. Cl. 2023) — NIIT creditability', url: 'https://ecf.cofc.uscourts.gov/cgi-bin/show_public_doc?2020cv0935-49-0' },
  ],
};

export const READ_FIRST_GROUP: MethodologyGroup = {
  id: 'group-read-first',
  title: 'Read this first',
  intro: 'This calculator is for educational purposes and does not constitute tax advice. Several key regulatory questions remain unsettled; please read these critical disclosures before proceeding.',
  sections: [DISCLAIMER_SECTION, REGULATORY_UNCERTAINTIES_SECTION],
};
