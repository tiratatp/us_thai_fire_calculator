/**
 * Methodology sections — single source of truth for the methodology page.
 *
 * Combines US, Thai, treaty, and algorithm sections from split files
 * to keep each file under the 250 LOC ceiling.
 */

import type { Bracket } from '../types.js';
import { US_ORDINARY_BRACKETS_2026_SINGLE } from '../data/constants.js';
import { THAI_PIT_BRACKETS } from '../data/constants.js';
import { RMD_UNIFORM_LIFETIME_TABLE } from '../data/constants.js';
import { US_SECTIONS } from './content-us.js';
import { THAI_SECTIONS } from './content-thai.js';
import { TREATY_SECTIONS } from './content-treaty.js';
import { ALGO_SECTIONS } from './content-algo.js';
import { FIRE_MULTIPLIERS } from './content-algo.js';
import { UNCERTAINTIES_SECTIONS } from './content-uncertainties.js';

// ---------- Shared types ----------

export interface MethodologyCitation {
  readonly text: string;
  readonly url: string;
}

export interface MethodologySection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly citations?: readonly MethodologyCitation[];
  readonly constantRef?:
    | 'US_ORDINARY_BRACKETS_2026_SINGLE'
    | 'US_LTCG_BRACKETS_2026_SINGLE'
    | 'THAI_PIT_BRACKETS'
    | 'RMD_UNIFORM_LIFETIME_TABLE'
    | 'CORRELATION_MATRIX'
    | 'FIRE_MULTIPLIER_30_YR'
    | 'FIRE_MULTIPLIER_LONG'
    | undefined;
}

export interface MethodologyGroup {
  readonly id: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly MethodologySection[];
}

// ---------- Disclaimer (always first) ----------

export const DISCLAIMER_SECTION: MethodologySection = {
  id: 'disclaimer',
  title: 'Disclaimer',
  paragraphs: [
    'This is not tax advice. The information on this page is for educational purposes only and does not constitute legal, tax, or financial advice. The rules described here interpret the 1996 US-Thailand tax treaty and post-2024 Thai remittance regime as they stand in mid-2026; several key questions remain unsettled. Consult a cross-border tax professional before making any decisions.',
    'Four specific rules are UNSETTLED and reasonable practitioners disagree on their correct application: (i) whether Thailand taxes remitted qualified Roth IRA distributions; (ii) whether Article 25(3) of the treaty re-sources US-source pension distributions for US Foreign Tax Credit purposes; (iii) whether the Thai 50% pension deduction applies to foreign retirement account remittances; and (iv) whether the US Net Investment Income Tax is creditable against Thai tax under Article 25. Each is described in detail in the "Regulatory Uncertainties" section below. Results are reported for both the optimistic and pessimistic reading of the combined bundle so the range of plausible outcomes is visible.',
    'This calculator also assumes — consistent with the prevailing practitioner view but not with any binding authority — that Paw 162/2566 pre-2024 grandfathering does NOT extend to Traditional IRA, Roth IRA, 401(k), or HSA distributions; only Cash and Taxable Brokerage balances held on January 1, 2024 can be grandfathered.',
  ],
};

// ---------- Correlation matrix constant ----------

export const CORRELATION_MATRIX: readonly (readonly number[])[] = Object.freeze([
  [1.00, -0.20, 0.70, 0.00],
  [-0.20, 1.00, 0.10, 0.10],
  [0.70, 0.10, 1.00, 0.05],
  [0.00, 0.10, 0.05, 1.00],
]);

// ---------- Combined array (ordered) ----------

export const METHODOLOGY_GROUPS: readonly MethodologyGroup[] = [
  {
    id: 'group-read-first',
    title: 'Read this first',
    intro:
      'This calculator is for educational purposes and does not constitute tax advice. Several key regulatory questions remain unsettled; please read these critical disclosures before proceeding.',
    sections: [DISCLAIMER_SECTION, ...UNCERTAINTIES_SECTIONS],
  },
  {
    id: 'group-us-rules',
    title: 'US tax rules that apply to you',
    intro:
      'US federal tax rules for citizens abroad, covering ordinary income, capital gains, and retirement account distributions.',
    sections: [...US_SECTIONS],
  },
  {
    id: 'group-thai-rules',
    title: 'Thai tax rules that apply to you',
    intro:
      'Thai tax residency and personal income tax rules, including the treatment of foreign-source income remitted to Thailand.',
    sections: [...THAI_SECTIONS],
  },
  {
    id: 'group-interaction',
    title: 'How the two systems interact',
    intro:
      'The interaction between US and Thai tax systems as governed by the 1996 tax treaty and foreign tax credit mechanisms.',
    sections: [...TREATY_SECTIONS],
  },
  {
    id: 'group-simulation',
    title: 'How this calculator simulates it',
    intro:
      'The technical implementation of the simulation, including the Monte Carlo engine and the step-by-step drawdown algorithm.',
    sections: [...ALGO_SECTIONS, ...FIRE_MULTIPLIERS],
  },
];

export const METHODOLOGY_SECTIONS: readonly MethodologySection[] =
  METHODOLOGY_GROUPS.flatMap((g) => g.sections);
