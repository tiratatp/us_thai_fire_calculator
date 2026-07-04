/**
 * Drawdown year_step orchestrator tests (T10). TDD-first.
 *
 * Anchor: plan §T10 QA + Oracle Systemic #1/#2/#3/#4.
 */
import { describe, expect, it } from 'vitest';
import type {
  Account,
  Assumption,
  RegulatoryScenario,
  YearOutcome,
} from '../types.js';
import {
  DEFAULT_ASSUMPTION,
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
  DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
} from '../data/defaults.js';
import { yearStep, type YearShocks, type YearState, type YearStepInputs } from './drawdown.js';

const NO_SHOCKS: YearShocks = {
  stockReturn: 0.07,
  bondReturn: 0.04,
  intlReturn: 0.06,
  cashReturn: 0.03,
  usInflation: 0,
  thaiInflation: 0,
  fxLogShockZ: 0,
};

function baseState(overrides: Partial<YearState> = {}): YearState {
  return {
    year: 0,
    age: 55,
    birthYear: 1971,
    accounts: [],
    fxRateUsdThb: 35,
    cumulativeUsTaxPaid: 0,
    cumulativeThaiTaxPaid: 0,
    failed: false,
    ...overrides,
  };
}

function baseInputs(
  state: YearState,
  overrides: Partial<Omit<YearStepInputs, 'state'>> = {},
): YearStepInputs {
  return {
    state,
    shocks: NO_SHOCKS,
    baseExpensesThbMo: 0,
    baseExpensesThbYr: 0,
    baseTravelUsdYr: 0,
    isThaiResident: true,
    regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
    assumption: DEFAULT_ASSUMPTION,
    ...overrides,
  };
}

function acct(overrides: Partial<Account>): Account {
  return {
    id: 'a',
    type: 'Cash',
    currency: 'USD',
    balance: 0,
    ...overrides,
  };
}

describe('yearStep', () => {
  it('S2-like: age 73 RMD ≈ 18867.92, no conversion', () => {
    const state = baseState({
      age: 73,
      birthYear: 1950,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 500000 })],
    });
    const { outcome } = yearStep(baseInputs(state, { isThaiResident: false }));
    expect(outcome.rmdAmount).toBeCloseTo(18867.92, 2);
    expect(outcome.rothConversionAmount).toBe(0);
  });

  it('S3: Roth funds USD travel, US=0, Thai=0', () => {
    const state = baseState({
      accounts: [
        acct({ id: 'roth', type: 'RothIRA', balance: 500000 }),
        acct({ id: 'cash', type: 'Cash', currency: 'THB', balance: 1_000_000 }),
      ],
    });
    const { outcome } = yearStep(baseInputs(state, { baseTravelUsdYr: 10000 }));
    expect(outcome.usTax).toBeCloseTo(0, 2);
    expect(outcome.thaiTax).toBeCloseTo(0, 2);
    // 490000 after draw, then × 1.058 growth (60/40 stock/bond @ 0.07/0.04) = 518420
    const rothBal = outcome.balancesByAccount['roth'] ?? -1;
    expect(rothBal).toBeCloseTo(490000 * 1.058, 0);
  });

  it('THB from Thai-side first, no US remittance', () => {
    const state = baseState({
      accounts: [
        acct({ id: 'thbCash', type: 'Cash', currency: 'THB', balance: 400_000 }),
        acct({ id: 'thbBrok', type: 'TaxableBrokerage', currency: 'THB', balance: 200_000 }),
        acct({ id: 'trad', type: 'TraditionalIRA', currency: 'USD', balance: 500_000 }),
      ],
    });
    const { outcome } = yearStep(baseInputs(state, { baseExpensesThbYr: 500_000 }));
    expect(outcome.remittances).toHaveLength(0);
    // 0 balance × any growth = 0
    expect(outcome.balancesByAccount['thbCash']).toBeCloseTo(0, 2);
    // 100_000 × 1.058 growth = 105_800
    expect(outcome.balancesByAccount['thbBrok']).toBeCloseTo(100_000 * 1.058, 0);
  });

  it('Failure detection: tiny balances, big spending', () => {
    const state = baseState({
      accounts: [acct({ id: 'cash', type: 'Cash', currency: 'THB', balance: 1000 })],
    });
    const { state: next, outcome } = yearStep(
      baseInputs(state, { baseExpensesThbYr: 5_000_000 }),
    );
    expect(outcome.spendingMet).toBe(false);
    expect(next.failed).toBe(true);
    expect(next.failureYear).toBe(0);
  });

  it('Determinism: same input → identical outcome', () => {
    const state = baseState({
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 100_000 })],
    });
    const a = yearStep(baseInputs(state, { baseTravelUsdYr: 5000 }));
    const b = yearStep(baseInputs(state, { baseTravelUsdYr: 5000 }));
    expect(a.outcome).toEqual(b.outcome);
  });

  it('RMD > balance clamp: never goes negative', () => {
    const state = baseState({
      age: 76,
      birthYear: 1950,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 1000 })],
    });
    const { outcome } = yearStep(baseInputs(state, { isThaiResident: false }));
    expect(outcome.balancesByAccount['trad'] ?? -1).toBeGreaterThanOrEqual(0);
    expect(outcome.rmdAmount).toBeLessThanOrEqual(1000);
  });

  it('Non-resident year: Thai tax = 0 despite Traditional remittance', () => {
    const state = baseState({
      age: 65,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 500_000 })],
    });
    const { outcome } = yearStep(baseInputs(state, {
      isThaiResident: false,
      baseExpensesThbYr: 10000 * 35,
    }));
    expect(outcome.thaiTax).toBeCloseTo(0, 2);
    expect(outcome.usTax).toBeGreaterThan(0);
  });

  it('Pessimistic total tax >= optimistic on same state', () => {
    const state = baseState({
      age: 65,
      accounts: [
        acct({ id: 'roth', type: 'RothIRA', balance: 200_000 }),
        acct({ id: 'trad', type: 'TraditionalIRA', balance: 200_000 }),
      ],
    });
    const opt = yearStep(baseInputs(state, {
      baseExpensesThbYr: 30_000 * 35,
      regScenario: DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
    }));
    const pes = yearStep(baseInputs(state, {
      baseExpensesThbYr: 30_000 * 35,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
    }));
    const optTotal = opt.outcome.usTaxAfterFtc + opt.outcome.thaiTax / 35;
    const pesTotal = pes.outcome.usTaxAfterFtc + pes.outcome.thaiTax / 35;
    expect(pesTotal).toBeGreaterThanOrEqual(optTotal - 0.01);
  });

  it('Age < 59.5 penalty: Traditional draw incurs 10% penalty', () => {
    const state = baseState({
      age: 55,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 200_000 })],
    });
    const withPenalty = yearStep(baseInputs(state, {
      isThaiResident: false,
      baseTravelUsdYr: 10_000,
    }));
    const noDraw = yearStep(baseInputs(state, { isThaiResident: false }));
    // Penalty makes us tax at least 10% * 10000 = 1000 higher when drawing.
    expect(withPenalty.outcome.usTax).toBeGreaterThanOrEqual(
      noDraw.outcome.usTax + 1000 - 0.01,
    );
  });

  it('Zero spending: spendingMet true, no withdrawals', () => {
    const state = baseState({
      accounts: [acct({ id: 'roth', type: 'RothIRA', balance: 100_000 })],
    });
    const { outcome } = yearStep(baseInputs(state));
    expect(outcome.spendingMet).toBe(true);
    expect(outcome.remittances).toHaveLength(0);
    expect(outcome.rmdAmount).toBe(0);
    expect(outcome.balancesByAccount['roth']).toBeCloseTo(100_000 * 1.058, 0);
  });
});

// silence unused imports for tests that skip them
export type { YearOutcome, Assumption, RegulatoryScenario };
