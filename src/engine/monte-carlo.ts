/**
 * Monte Carlo runner (T11).
 *
 * Runs `trials` independent seeded simulations of the drawdown engine,
 * aggregates success rate + percentile traces, and returns a SimResult.
 * `runBothRegulatoryScenarios` wraps this for the 'both' stance.
 *
 * Percentile traces (p10/p50/p90) are chosen by ranking trials on their
 * final total portfolio value and picking the representative trial at
 * each percentile — this gives a coherent full YearOutcome[] trace at
 * each band, avoiding synthetic per-year blends.
 */

import type {
  Account,
  Assumption,
  RegulatoryScenario,
  SimResult,
  UserInputs,
  YearOutcome,
} from '../types.js';
import { choleskyDecompose, correlatedDraws } from './cholesky.js';
import {
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
  DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
} from '../data/defaults.js';
import { yearStep, type YearState } from './drawdown.js';
import { drawInflation } from './inflation.js';
import { mulberry32, normalPair } from './prng.js';

export interface MonteCarloInputs {
  readonly userInputs: UserInputs;
  readonly assumption: Assumption;
  readonly regScenario: RegulatoryScenario;
  readonly seed: number;
  readonly trials?: number;
}

interface TrialResult {
  readonly trace: readonly YearOutcome[];
  readonly finalPortfolio: number;
  readonly failed: boolean;
  readonly totalTaxUsd: number;
}

function sumExpensesThbMo(u: UserInputs): number {
  const e = u.expenses;
  return e.housingThbMo + e.foodThbMo + e.transportThbMo + e.otherThbMo;
}

function sumExpensesThbYr(u: UserInputs): number {
  return u.expenses.healthcareThbYr + u.expenses.legalTaxThbYr;
}

function totalBalance(accts: readonly Account[], fxRateUsdThb: number): number {
  return accts.reduce(
    (s, a) => s + (a.currency === 'THB' ? a.balance / fxRateUsdThb : a.balance),
    0,
  );
}

function initialState(u: UserInputs, assumption: Assumption): YearState {
  return {
    year: 0,
    age: u.currentAge,
    birthYear: u.birthYear,
    accounts: u.accounts,
    fxRateUsdThb: u.currentFxUsdThb ?? assumption.fxUsdThb.mean,
    cumulativeUsTaxPaid: 0,
    cumulativeThaiTaxPaid: 0,
    failed: false,
  };
}

function runSingleTrial(
  u: UserInputs,
  assumption: Assumption,
  regScenario: RegulatoryScenario,
  L: readonly (readonly number[])[],
  rng: () => number,
  years: number,
): TrialResult {
  let state = initialState(u, assumption);
  const trace: YearOutcome[] = [];
  const baseThbMo = sumExpensesThbMo(u);
  const baseThbYr = sumExpensesThbYr(u);
  const baseTravel = u.expenses.travelUsdYr;

  for (let yr = 0; yr < years; yr++) {
    // 4 correlated asset-return Z draws (uses 4 normals = 2 normalPair calls).
    const [z0, z1] = normalPair(rng);
    const [z2, z3] = normalPair(rng);
    const corr = correlatedDraws(L, [z0, z1, z2, z3]);
    // Two more normals for inflation (Z for US + Thai) — cash uses one normal
    // draw per pair, we grab a fresh pair to keep the stream aligned.
    const [zUsInf, zThInf] = normalPair(rng);
    const [zFx] = normalPair(rng);

    const shocks = {
      stockReturn: assumption.usStock.mean + assumption.usStock.sd * corr[0]!,
      bondReturn: assumption.usBond.mean + assumption.usBond.sd * corr[1]!,
      intlReturn: assumption.intlStock.mean + assumption.intlStock.sd * corr[2]!,
      cashReturn: assumption.cash.mean + assumption.cash.sd * corr[3]!,
      usInflation: drawInflation(assumption.usInflation, zUsInf),
      thaiInflation: drawInflation(assumption.thaiInflation, zThInf),
      fxLogShockZ: zFx,
    };

    const isThaiResident = u.thaiResidencyByYear[yr] ?? true;

    const { state: next, outcome } = yearStep({
      state,
      shocks,
      baseExpensesThbMo: baseThbMo,
      baseExpensesThbYr: baseThbYr,
      baseTravelUsdYr: baseTravel,
      isThaiResident,
      regScenario,
      assumption,
    });

    trace.push(outcome);
    state = next;
    if (state.failed) break;
  }

  const totalTaxUsd =
    state.cumulativeUsTaxPaid +
    state.cumulativeThaiTaxPaid / state.fxRateUsdThb;

  return {
    trace,
    finalPortfolio: totalBalance(state.accounts, state.fxRateUsdThb),
    failed: state.failed,
    totalTaxUsd,
  };
}

function pickPercentileTrace(
  trials: readonly TrialResult[],
  q: number,
): readonly YearOutcome[] {
  if (trials.length === 0) return [];
  const sorted = [...trials].sort((a, b) => a.finalPortfolio - b.finalPortfolio);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(q * (sorted.length - 1))),
  );
  return sorted[idx]!.trace;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >>> 1;
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

/** Run a single-scenario Monte Carlo. Returns SimResult. */
export function runMonteCarlo(inputs: MonteCarloInputs): SimResult {
  const { userInputs, assumption, regScenario, seed } = inputs;
  const trialsToRun = inputs.trials ?? userInputs.monteCarloTrials;
  const years = userInputs.lifeExpectancy - userInputs.currentAge;
  const rng = mulberry32(seed);
  const L = choleskyDecompose(assumption.correlationMatrix as readonly (readonly number[])[]);

  const results: TrialResult[] = [];
  let survived = 0;
  let failed = 0;

  for (let t = 0; t < trialsToRun; t++) {
    const r = runSingleTrial(userInputs, assumption, regScenario, L, rng, years);
    results.push(r);
    if (r.failed) failed++;
    else survived++;
  }

  const taxes = results.map((r) => r.totalTaxUsd);
  return {
    successRate: trialsToRun === 0 ? 0 : survived / trialsToRun,
    p10: pickPercentileTrace(results, 0.1),
    p50: pickPercentileTrace(results, 0.5),
    p90: pickPercentileTrace(results, 0.9),
    medianTaxUsd: median(taxes),
    failedTrialCount: failed,
    trialsRun: trialsToRun,
  };
}

/** Run both regulatory bands (optimistic + pessimistic) with the same seed. */
export function runBothRegulatoryScenarios(
  userInputs: UserInputs,
  assumption: Assumption,
  seed: number,
  trials?: number,
): { optimistic: SimResult; pessimistic: SimResult } {
  const optimistic = runMonteCarlo({
    userInputs,
    assumption,
    regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
    seed,
    ...(trials !== undefined ? { trials } : {}),
  });
  const pessimistic = runMonteCarlo({
    userInputs,
    assumption,
    regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
    seed,
    ...(trials !== undefined ? { trials } : {}),
  });
  return { optimistic, pessimistic };
}
