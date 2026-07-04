/**
 * Shared type definitions for the US-Thai FIRE calculator.
 *
 * All numeric constants used at runtime live in src/data/constants.ts wrapped
 * in Cited<T>. Types here describe the SHAPE only; values come from data/.
 */

// ---------- Primitive brands (opt-in; used where clarity helps) ----------

/** USD amount, dollars (not cents). */
export type UsdAmount = number & { readonly __brand: 'USD' };
/** THB amount, baht (not satang). */
export type ThbAmount = number & { readonly __brand: 'THB' };

// ---------- Currency & Account ----------

export type Currency = 'USD' | 'THB';

/**
 * The 7 account types tracked by the calculator.
 * Ordering: pre-tax retirement, post-tax retirement, then taxable/cash/HSA.
 */
export type AccountType =
  | 'Cash'
  | 'TaxableBrokerage'
  | 'Traditional401k'
  | 'Roth401k'
  | 'TraditionalIRA'
  | 'RothIRA'
  | 'HSA';

/**
 * Account state.
 *
 * - `basis`: current cost basis. ONLY meaningful for TaxableBrokerage.
 *   For other account types this field is ignored by the engine.
 * - `pre2024Snapshot`: Jan-1-2024 balance for Paw 162/2566 grandfathering.
 *   ONLY meaningful for Cash and TaxableBrokerage. The UI MUST disable
 *   this field for all retirement account types; the engine MUST ignore
 *   it if injected for a retirement account (see Systemic #4 regression).
 */
export interface Account {
  readonly id: string;
  readonly type: AccountType;
  readonly currency: Currency;
  readonly balance: number;
  readonly basis?: number;
  readonly pre2024Snapshot?: number;
}

// ---------- Expenses ----------

export interface Expenses {
  readonly housingThbMo: number;
  readonly foodThbMo: number;
  readonly transportThbMo: number;
  readonly otherThbMo: number;
  readonly healthcareThbYr: number;
  readonly legalTaxThbYr: number;
  readonly travelUsdYr: number;
}

// ---------- Assumption / market model ----------

/** Nominal-return distribution (annual, log-normalish). */
export interface ReturnDist {
  readonly mean: number;
  readonly sd: number;
}

/**
 * 4x4 correlation matrix in the fixed ordering
 * [US Stock, US Bond, Intl Stock, Cash].
 * Must be symmetric with unit diagonal and PSD.
 */
export type CorrelationMatrix = readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
];

export interface InflationDist {
  readonly mean: number;
  readonly sd: number;
}

export interface FxModel {
  /** Long-run center (used as t=0 rate). */
  readonly mean: number;
  /** Annual log-return std dev for the random walk. */
  readonly sdAnnualLog: number;
  /** Mean-reversion pull (0 = pure random walk). */
  readonly meanReversion: number;
}

export interface Assumption {
  readonly usStock: ReturnDist;
  readonly usBond: ReturnDist;
  readonly intlStock: ReturnDist;
  readonly cash: ReturnDist;
  readonly correlationMatrix: CorrelationMatrix;
  readonly usInflation: InflationDist;
  readonly thaiInflation: InflationDist;
  readonly fxUsdThb: FxModel;
  /** Fraction of taxable brokerage held in stocks (rest in bonds). */
  readonly stockAllocationTaxable: number;
  /** Fraction of tax-deferred holdings in stocks (rest in bonds). */
  readonly stockAllocationTaxDeferred: number;
}

// ---------- Regulatory scenario ----------

/**
 * Four independent regulatory levers per Oracle critique (see
 * .research/07-oracle-critique.md and .research/08-algorithm-v2.md).
 *
 * NOTE the fifth lever from the original design — grandfathering
 * for retirement accounts — is HARD-LOCKED to false and is NOT a flag
 * (Paw 162/2566 does not extend to retirement accounts).
 */
export interface RegulatoryScenario {
  /** True = Thailand taxes Roth withdrawals as pension (pessimistic). */
  readonly rothTaxedByThailand: boolean;
  /** True = US treaty re-sources US-source pensions for FTC (optimistic). */
  readonly treatyResourcesUsSourcePensions: boolean;
  /** True = 50% (cap 100k THB) pension deduction available (optimistic). */
  readonly thaiPensionDeductionApplies: boolean;
  /** True = NIIT can be credited against Thai tax (optimistic). */
  readonly niitCreditableAgainstThai: boolean;
}

export type RegulatoryStance = 'optimistic' | 'pessimistic' | 'both';

// ---------- User inputs ----------

export interface UserInputs {
  readonly currentAge: number;
  readonly lifeExpectancy: number;
  readonly birthYear: number;
  readonly accounts: readonly Account[];
  readonly expenses: Expenses;
  /** length === lifeExpectancy - currentAge; true = Thai resident that year. */
  readonly thaiResidencyByYear: readonly boolean[];
  /** 0..1; e.g. 0.90 for the FIRE badge. */
  readonly successThreshold: number;
  readonly monteCarloTrials: number;
  readonly regulatoryStance: RegulatoryStance;
}

// ---------- Remittance & year outcome ----------

/**
 * The five source types the Thai side needs to distinguish. See
 * .research/02-thai-tax.md §4.
 */
export type RemittanceSourceType =
  | 'Cash'
  | 'TaxableBasis'
  | 'TaxableGain'
  | 'TraditionalIRA'
  | 'Roth'
  | 'HSA';

export type PreTaxOrigin = 'pre2024' | 'post2024';

export interface RemittanceItem {
  readonly sourceAccountId: string;
  readonly amountUsd: number;
  readonly amountThb: number;
  readonly assessablePortionThb: number;
  readonly sourceType: RemittanceSourceType;
  readonly preTaxOrigin: PreTaxOrigin;
}

export interface YearOutcome {
  readonly year: number;
  readonly age: number;
  readonly isThaiResident: boolean;
  readonly balancesByAccount: Readonly<Record<string, number>>;
  readonly rmdAmount: number;
  readonly rothConversionAmount: number;
  readonly ltcgHarvestedAmount: number;
  readonly remittances: readonly RemittanceItem[];
  readonly usOrdinaryIncome: number;
  readonly usLtcgIncome: number;
  readonly usTax: number;
  readonly thaiAssessable: number;
  readonly thaiTax: number;
  readonly ftcApplied: number;
  readonly usTaxAfterFtc: number;
  readonly spendingMet: boolean;
}

// ---------- Simulation result ----------

export interface SimResult {
  /** 0..1. Fraction of trials that survived to lifeExpectancy. */
  readonly successRate: number;
  readonly p10: readonly YearOutcome[];
  readonly p50: readonly YearOutcome[];
  readonly p90: readonly YearOutcome[];
  readonly medianTaxUsd: number;
  readonly failedTrialCount: number;
  readonly trialsRun: number;
}

// ---------- Citation wrapper ----------

/**
 * Every runtime numeric constant is wrapped in Cited<T>. The methodology
 * page renders directly from these — the values on-screen and the values
 * used by the engine are the same object.
 */
export interface Cited<T> {
  readonly value: T;
  readonly sourceUrl: string;
  readonly sourceName: string;
  readonly retrievedDate: string;
  readonly notes?: string;
}

// ---------- Tax bracket shape ----------

/**
 * Ordinary-income bracket: `top` is the ceiling of the bracket in the
 * source currency (USD for US, THB for Thai). The last bracket uses
 * `Number.POSITIVE_INFINITY`.
 */
export interface Bracket {
  readonly top: number;
  readonly rate: number;
}

/** LTCG threshold table (USD, single filer). */
export interface LtcgThresholds {
  readonly zeroTop: number;
  readonly fifteenTop: number;
}
