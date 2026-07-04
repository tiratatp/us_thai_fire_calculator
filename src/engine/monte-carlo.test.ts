/**
 * Monte Carlo runner tests (T11).
 *
 * Covers: determinism under fixed seed, trials-honored, success rate
 * range, both-scenarios wrapper, percentile ordering, and evidence that
 * correlated draws (via Cholesky) actually flow into the simulation.
 */

import { describe, expect, it } from 'vitest';
import type {
  Account,
  Assumption,
  UserInputs,
} from '../types.js';
import { DEFAULT_ASSUMPTION } from '../data/defaults.js';
import { runBothRegulatoryScenarios, runMonteCarlo } from './monte-carlo.js';

function makeUserInputs(overrides: Partial<UserInputs> = {}): UserInputs {
  const accounts: readonly Account[] = [
    {
      id: 'trad-ira',
      type: 'TraditionalIRA',
      currency: 'USD',
      balance: 1_500_000,
    },
    {
      id: 'cash',
      type: 'Cash',
      currency: 'USD',
      balance: 100_000,
    },
  ];
  return {
    currentAge: 55,
    lifeExpectancy: 90,
    birthYear: 1971,
    accounts,
    expenses: {
      housingThbMo: 30_000,
      foodThbMo: 15_000,
      transportThbMo: 5_000,
      otherThbMo: 10_000,
      healthcareThbYr: 60_000,
      legalTaxThbYr: 20_000,
      travelUsdYr: 3_000,
    },
    thaiResidencyByYear: Array.from({ length: 35 }, () => true),
    successThreshold: 0.9,
    monteCarloTrials: 100,
    regulatoryStance: 'both',
    ...overrides,
  };
}

function sumBalances(record: Readonly<Record<string, number>>): number {
  return Object.values(record).reduce((s, v) => s + v, 0);
}

describe('runMonteCarlo', () => {
  it('is deterministic: same seed → identical successRate and p50 trace', () => {
    const inputs = makeUserInputs();
    const args = {
      userInputs: inputs,
      assumption: DEFAULT_ASSUMPTION,
      regScenario: {
        rothTaxedByThailand: false,
        treatyResourcesUsSourcePensions: true,
        thaiPensionDeductionApplies: true,
        niitCreditableAgainstThai: true,
      },
      seed: 42,
      trials: 50,
    };
    const a = runMonteCarlo(args);
    const b = runMonteCarlo(args);
    expect(a.successRate).toBe(b.successRate);
    expect(a.trialsRun).toBe(b.trialsRun);
    expect(a.medianTaxUsd).toBe(b.medianTaxUsd);
    expect(a.p50.length).toBe(b.p50.length);
    for (let i = 0; i < a.p50.length; i++) {
      expect(sumBalances(a.p50[i]!.balancesByAccount)).toBe(
        sumBalances(b.p50[i]!.balancesByAccount),
      );
      expect(a.p50[i]!.usTax).toBe(b.p50[i]!.usTax);
      expect(a.p50[i]!.thaiTax).toBe(b.p50[i]!.thaiTax);
    }
  });

  it('honors the trials parameter', () => {
    const result = runMonteCarlo({
      userInputs: makeUserInputs(),
      assumption: DEFAULT_ASSUMPTION,
      regScenario: {
        rothTaxedByThailand: false,
        treatyResourcesUsSourcePensions: true,
        thaiPensionDeductionApplies: true,
        niitCreditableAgainstThai: true,
      },
      seed: 1,
      trials: 25,
    });
    expect(result.trialsRun).toBe(25);
    expect(result.failedTrialCount).toBeGreaterThanOrEqual(0);
    expect(result.failedTrialCount).toBeLessThanOrEqual(25);
  });

  it('falls back to userInputs.monteCarloTrials when trials not provided', () => {
    const result = runMonteCarlo({
      userInputs: makeUserInputs({ monteCarloTrials: 20 }),
      assumption: DEFAULT_ASSUMPTION,
      regScenario: {
        rothTaxedByThailand: false,
        treatyResourcesUsSourcePensions: true,
        thaiPensionDeductionApplies: true,
        niitCreditableAgainstThai: true,
      },
      seed: 7,
    });
    expect(result.trialsRun).toBe(20);
  });

  it('successRate is in [0, 1]', () => {
    const result = runMonteCarlo({
      userInputs: makeUserInputs(),
      assumption: DEFAULT_ASSUMPTION,
      regScenario: {
        rothTaxedByThailand: true,
        treatyResourcesUsSourcePensions: false,
        thaiPensionDeductionApplies: false,
        niitCreditableAgainstThai: false,
      },
      seed: 99,
      trials: 40,
    });
    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(1);
    expect(result.failedTrialCount + Math.round(result.successRate * result.trialsRun)).toBe(
      result.trialsRun,
    );
  });

  it('percentile traces are ordered by final portfolio value (p10 ≤ p50 ≤ p90)', () => {
    const result = runMonteCarlo({
      userInputs: makeUserInputs(),
      assumption: DEFAULT_ASSUMPTION,
      regScenario: {
        rothTaxedByThailand: false,
        treatyResourcesUsSourcePensions: true,
        thaiPensionDeductionApplies: true,
        niitCreditableAgainstThai: true,
      },
      seed: 123,
      trials: 100,
    });

    const finalOf = (trace: readonly typeof result.p10[number][]) =>
      trace.length === 0 ? 0 : sumBalances(trace[trace.length - 1]!.balancesByAccount);

    // p10 ≤ p50 ≤ p90 on the final year (definitional ordering).
    expect(finalOf(result.p10)).toBeLessThanOrEqual(finalOf(result.p50));
    expect(finalOf(result.p50)).toBeLessThanOrEqual(finalOf(result.p90));
    expect(result.p50.length).toBeGreaterThan(0);
  });

  it('uses correlated returns: swapping in an identity correlation shifts the outcome', () => {
    const base = makeUserInputs();
    const identityAssumption: Assumption = {
      ...DEFAULT_ASSUMPTION,
      correlationMatrix: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ],
    };
    const args = {
      userInputs: base,
      regScenario: {
        rothTaxedByThailand: false,
        treatyResourcesUsSourcePensions: true,
        thaiPensionDeductionApplies: true,
        niitCreditableAgainstThai: true,
      },
      seed: 2024,
      trials: 60,
    };
    const correlated = runMonteCarlo({ ...args, assumption: DEFAULT_ASSUMPTION });
    const independent = runMonteCarlo({ ...args, assumption: identityAssumption });
    // Cholesky output differs between correlation matrices, so the p50
    // final portfolio value MUST differ; if not, the matrix was ignored.
    const finalP50Corr = sumBalances(
      correlated.p50[correlated.p50.length - 1]!.balancesByAccount,
    );
    const finalP50Indep = sumBalances(
      independent.p50[independent.p50.length - 1]!.balancesByAccount,
    );
    expect(finalP50Corr).not.toBe(finalP50Indep);
  });
});

describe('runBothRegulatoryScenarios', () => {
  it('returns both bands with pessimistic ≤ optimistic successRate', () => {
    const result = runBothRegulatoryScenarios(
      makeUserInputs(),
      DEFAULT_ASSUMPTION,
      777,
      100,
    );
    expect(result.optimistic.trialsRun).toBe(100);
    expect(result.pessimistic.trialsRun).toBe(100);
    expect(result.pessimistic.successRate).toBeLessThanOrEqual(
      result.optimistic.successRate + 1e-9,
    );
  });

  it('uses trials from userInputs when omitted', () => {
    const result = runBothRegulatoryScenarios(
      makeUserInputs({ monteCarloTrials: 30 }),
      DEFAULT_ASSUMPTION,
      5,
    );
    expect(result.optimistic.trialsRun).toBe(30);
    expect(result.pessimistic.trialsRun).toBe(30);
  });
});
