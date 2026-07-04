/**
 * Default assumptions and starter UserInputs.
 *
 * Return/vol/correlation/FX values come from .research/05-monte-carlo.md
 * (Vanguard VCMM 10-yr forward as the default; more conservative than
 * historical). Regulatory scenarios come from .research/08-algorithm-v2.md.
 */

import type {
  Assumption,
  CorrelationMatrix,
  RegulatoryScenario,
  UserInputs,
} from '../types.js';

/**
 * 4x4 correlation matrix ordered as [US Stock, US Bond, Intl Stock, Cash].
 * Symmetric, unit diagonal, PSD. Values from cFIREsim / Portfolio Visualizer
 * (see .research/05-monte-carlo.md §2).
 */
export const DEFAULT_CORRELATION_MATRIX: CorrelationMatrix = [
  [1.00, -0.20, 0.70, 0.00],
  [-0.20, 1.00, 0.10, 0.10],
  [0.70, 0.10, 1.00, 0.05],
  [0.00, 0.10, 0.05, 1.00],
] as const;

/**
 * Default market assumptions.
 *
 * Return distributions: Vanguard VCMM 2026 10-yr forward-looking (mid of range).
 * Inflation: US 3.0% mean / 1.4% sd (Portfolio Visualizer CPI-U);
 * Thai 2.0% mean / 2.5% sd (FRED FPCPITOTLZGTHA 2010-2024).
 * FX USD/THB: log-normal random walk centered at 35, 8% annual log-vol.
 * Portfolio: 60/40 stocks/bonds by default.
 */
export const DEFAULT_ASSUMPTION: Assumption = {
  usStock: { mean: 0.06, sd: 0.17 },
  usBond: { mean: 0.04, sd: 0.07 },
  intlStock: { mean: 0.06, sd: 0.19 },
  cash: { mean: 0.035, sd: 0.01 },
  correlationMatrix: DEFAULT_CORRELATION_MATRIX,
  usInflation: { mean: 0.03, sd: 0.014 },
  thaiInflation: { mean: 0.02, sd: 0.025 },
  fxUsdThb: { mean: 35, sdAnnualLog: 0.08, meanReversion: 0 },
  stockAllocationTaxable: 0.60,
  stockAllocationTaxDeferred: 0.60,
};

/**
 * Optimistic regulatory reading (all uncertainty resolves in the user's favor).
 * See .research/08-algorithm-v2.md §Regulatory bands.
 */
export const DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC: RegulatoryScenario = {
  rothTaxedByThailand: false,
  treatyResourcesUsSourcePensions: true,
  thaiPensionDeductionApplies: true,
  niitCreditableAgainstThai: true,
};

/**
 * Pessimistic regulatory reading (all uncertainty resolves against the user).
 * The delta vs optimistic = the user's regulatory exposure.
 */
export const DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC: RegulatoryScenario = {
  rothTaxedByThailand: true,
  treatyResourcesUsSourcePensions: false,
  thaiPensionDeductionApplies: false,
  niitCreditableAgainstThai: false,
};

/**
 * Empty starter state. The UI presents this as a blank slate the user fills in.
 * currentAge/lifeExpectancy defaults chosen so form validation passes on load
 * without requiring any user action just to render.
 */
export const DEFAULT_USER_INPUTS: UserInputs = {
  currentAge: 55,
  lifeExpectancy: 90,
  birthYear: 1971,
  accounts: [],
  expenses: {
    housingThbMo: 0,
    foodThbMo: 0,
    transportThbMo: 0,
    otherThbMo: 0,
    healthcareThbYr: 0,
    legalTaxThbYr: 0,
    travelUsdYr: 0,
  },
  thaiResidencyByYear: Array.from({ length: 90 - 55 }, () => true),
  successThreshold: 0.90,
  monteCarloTrials: 1000,
  regulatoryStance: 'both',
};
