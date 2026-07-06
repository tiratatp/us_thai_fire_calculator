import type { MethodologyGroup } from './content.js';

export const SIMULATION_GROUP: MethodologyGroup = {
  id: 'group-simulation',
  title: 'How this calculator simulates it',
  intro: 'The technical implementation of the simulation and the step-by-step drawdown algorithm.',
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
      title: 'FIRE Multiplier (33×)',
      paragraphs: [
        'The FIRE target — the portfolio value at which a retiree could reasonably expect to fund annual real spending indefinitely — is expressed as a multiplier applied to annual expenses. The multiplier is the reciprocal of the assumed sustainable withdrawal rate.',
        'While the traditional "4% rule" (a 25× multiplier) derived from the Trinity Study (Cooley, Hubbard, and Walz, 1998) is commonly cited for 30-year retirements, cross-border retirements introduce severe structural frictions. This calculator enforces a more conservative 33× multiplier (a 3% initial withdrawal rate) globally, regardless of your time horizon.',
        'The 33× target provides a necessary buffer against three major risks inherent to US/Thai retirements: Sequence of Returns Risk, FX Volatility (spending in THB while holding USD assets), and most importantly, Double-Tax Drag. When pre-tax or capital-gains heavy assets are drawn down, the combined friction of US tax, Thai Personal Income Tax, and imperfect Foreign Tax Credits drastically inflates the gross withdrawal required to net the desired spending.'
      ],
      citations: [
        { text: 'Trinity Study — Cooley, Hubbard, Walz (1998) — overview', url: 'https://en.wikipedia.org/wiki/Trinity_study' },
        { text: 'Bengen (1994) — 4% Rule — overview', url: 'https://en.wikipedia.org/wiki/William_Bengen' },
      ],
      constantRef: 'FIRE_MULTIPLIER',
    },
  ],
};
