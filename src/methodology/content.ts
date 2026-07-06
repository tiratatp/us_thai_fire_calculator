/**
 * Methodology sections — single source of truth for the methodology page.
 *
 * Combines US, Thai, treaty, and algorithm sections from split files
 * to keep each file under the 250 LOC ceiling.
 */

import { READ_FIRST_GROUP } from './content-read-first.js';
import { US_RULES_GROUP } from './content-us-rules.js';
import { THAI_RULES_GROUP } from './content-thai-rules.js';
import { INTERACTION_GROUP } from './content-interaction.js';
import { SIMULATION_GROUP } from './content-simulation.js';

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

// ---------- Correlation matrix constant ----------

export const CORRELATION_MATRIX: readonly (readonly number[])[] = Object.freeze([
  [1.00, -0.20, 0.70, 0.00],
  [-0.20, 1.00, 0.10, 0.10],
  [0.70, 0.10, 1.00, 0.05],
  [0.00, 0.10, 0.05, 1.00],
]);

// ---------- Combined array (ordered) ----------

export const METHODOLOGY_GROUPS: readonly MethodologyGroup[] = [
  READ_FIRST_GROUP,
  US_RULES_GROUP,
  THAI_RULES_GROUP,
  INTERACTION_GROUP,
  SIMULATION_GROUP,
];

export const METHODOLOGY_SECTIONS: readonly MethodologySection[] =
  METHODOLOGY_GROUPS.flatMap((g) => g.sections);
