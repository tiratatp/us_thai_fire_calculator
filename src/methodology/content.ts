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
    | undefined;
}

// ---------- Disclaimer (always first) ----------

export const DISCLAIMER_SECTION: MethodologySection = {
  id: 'disclaimer',
  title: 'Disclaimer',
  paragraphs: [
    'This is not tax advice. The information on this page is for educational purposes only and does not constitute legal, tax, or financial advice. Consult a cross-border tax professional before making any decisions.',
    'Roth treatment in Thailand is UNSETTLED. Thailand does not have statutory recognition of Roth IRAs. The prevailing view among cross-border practitioners is that Thailand will tax remitted Roth withdrawals as pension income under Thai Revenue Code Section 40(1). This is an unsettled area with no binding authority.',
    'Paw 162/2566 grandfathering does NOT extend to retirement accounts. Traditional IRA, Roth IRA, 401(k), and HSA distributions are considered "earned" at the time of distribution (post-2024), so no grandfathering applies. Only Cash and Taxable Brokerage balances can use the optional Jan-1-2024 snapshot for grandfathering.',
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

export const METHODOLOGY_SECTIONS: readonly MethodologySection[] = [
  DISCLAIMER_SECTION,
  ...US_SECTIONS,
  ...THAI_SECTIONS,
  ...TREATY_SECTIONS,
  ...ALGO_SECTIONS,
];
