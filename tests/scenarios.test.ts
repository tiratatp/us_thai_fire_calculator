/**
 * T19 acceptance-gate scenarios (S1-S7). See .omo/plans/v1-work-plan.md §T19
 * and .research/07-oracle-critique.md (Systemic #1-#4).
 */
import { describe, expect, it } from 'vitest';
import type { Account, RemittanceItem, UserInputs } from '../src/types.js';
import { yearStep, type YearShocks, type YearState } from '../src/engine/drawdown.js';
import { runBothRegulatoryScenarios } from '../src/engine/monte-carlo.js';
import {
  DEFAULT_ASSUMPTION,
  DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC,
  DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
} from '../src/data/defaults.js';
import { computeFtc, primaryTaxerFor } from '../src/engine/ftc.js';
import { thaiAssessableFromRemittance } from '../src/engine/thai-tax.js';

// ---------- helpers ----------

const NO_SHOCKS: YearShocks = {
  stockReturn: 0.07,
  bondReturn: 0.04,
  intlReturn: 0.06,
  cashReturn: 0.03,
  usInflation: 0,
  thaiInflation: 0,
  fxLogShockZ: 0,
};

function state(overrides: Partial<YearState> = {}): YearState {
  return {
    year: 0,
    age: 65,
    birthYear: 1961,
    accounts: [],
    fxRateUsdThb: 35,
    cumulativeUsTaxPaid: 0,
    cumulativeThaiTaxPaid: 0,
    failed: false,
    ...overrides,
  };
}

function acct(o: Partial<Account> & { id: string; type: Account['type']; balance: number }): Account {
  return { currency: 'USD', ...o };
}

// ---------- S1 — D3 corrected FTC (both bands) ----------

describe('S1: D3 corrected FTC — both bands', () => {
  const item: RemittanceItem = {
    sourceAccountId: 'trad',
    amountUsd: 50000,
    amountThb: 50000 * 35,
    assessablePortionThb: 50000 * 35,
    sourceType: 'TraditionalIRA',
    preTaxOrigin: 'post2024',
  };
  const usTaxOnItem = 3850;
  const thaiTaxOnItem = 7500;
  const perItem = [
    { item, primary: primaryTaxerFor('TraditionalIRA'), usTaxOnItem, thaiTaxOnItem },
  ];

  it('optimistic (re-sourcing on): total tax ≈ $7,500', () => {
    const r = computeFtc(perItem, DEFAULT_REGULATORY_SCENARIO_OPTIMISTIC);
    expect(r.totalTax).toBeCloseTo(7500, 0);
    expect(r.usTaxAfterFtc).toBeCloseTo(0, 0);
    expect(r.thaiTaxAfterFtc).toBeCloseTo(7500, 0);
    expect(r.totalTax).toBeGreaterThanOrEqual(7500);
  });

  it('pessimistic (re-sourcing off): total tax ≈ $11,350', () => {
    const r = computeFtc(perItem, DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC);
    expect(r.totalTax).toBeCloseTo(11350, 0);
    expect(r.usTaxAfterFtc).toBeCloseTo(3850, 0);
    expect(r.thaiTaxAfterFtc).toBeCloseTo(7500, 0);
  });
});

// ---------- S2 — age 74 RMD sanity ----------

describe('S2: age 74 RMD $500k Traditional → $19,607.84 (Oracle E3)', () => {
  it('yields ~$19,607.84 RMD, no conversion, modest US tax', () => {
    const s = state({
      age: 74,
      birthYear: 1950,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 500000 })],
    });
    const { outcome } = yearStep({
      state: s,
      shocks: NO_SHOCKS,
      baseExpensesThbMo: 0,
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: false,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.rmdAmount).toBeCloseTo(19607.84, 1);
    expect(outcome.rothConversionAmount).toBe(0);
  });
});

// ---------- S3 — Roth funds USD travel ----------

describe('S3: Roth funds USD travel — US=0, Thai=0', () => {
  it('$10k travel from $500k Roth: no tax anywhere', () => {
    const s = state({
      age: 55,
      birthYear: 1971,
      accounts: [acct({ id: 'roth', type: 'RothIRA', balance: 500000 })],
    });
    const { outcome } = yearStep({
      state: s,
      shocks: NO_SHOCKS,
      baseExpensesThbMo: 0,
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 10000,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.usTax).toBeCloseTo(0, 0);
    expect(outcome.thaiTax).toBeCloseTo(0, 0);
    expect(outcome.remittances).toHaveLength(0);
  });
});

// ---------- S4 — Non-resident year: Thai tax = 0 ----------

describe('S4: non-resident year → Thai tax = 0 on remittance', () => {
  it('remit $30k Traditional in a non-resident year: Thai tax = 0', () => {
    const s = state({
      age: 65,
      birthYear: 1961,
      accounts: [acct({ id: 'trad', type: 'TraditionalIRA', balance: 500000 })],
    });
    const { outcome } = yearStep({
      state: s,
      shocks: NO_SHOCKS,
      baseExpensesThbMo: 0,
      baseExpensesThbYr: 30000 * 35,
      baseTravelUsdYr: 0,
      isThaiResident: false,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.thaiTax).toBeCloseTo(0, 0);
    expect(outcome.usTax).toBeGreaterThan(0);
  });
});

// ---------- S5 — no grandfathering on retirement accounts ----------

describe('S5: no grandfathering on retirement accounts (Systemic #4)', () => {
  it('TraditionalIRA with preTaxOrigin=pre2024 → fully assessable', () => {
    const item: RemittanceItem = {
      sourceAccountId: 't',
      amountUsd: 30000,
      amountThb: 30000 * 35,
      assessablePortionThb: 30000 * 35,
      sourceType: 'TraditionalIRA',
      preTaxOrigin: 'pre2024',
    };
    const assessable = thaiAssessableFromRemittance(item, DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC);
    expect(assessable).toBe(30000 * 35);
  });

  it('Cash with pre2024 IS grandfathered (control)', () => {
    const item: RemittanceItem = {
      sourceAccountId: 'c',
      amountUsd: 10000,
      amountThb: 10000 * 35,
      assessablePortionThb: 0,
      sourceType: 'Cash',
      preTaxOrigin: 'pre2024',
    };
    const assessable = thaiAssessableFromRemittance(item, DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC);
    expect(assessable).toBe(0);
  });
});

// ---------- S6 — 0% LTCG vs Roth conversion mutex ----------

describe('S6: 0% LTCG harvest vs Roth conversion mutex (Systemic #3)', () => {
  it('Thai-resident year: Roth conversion module returns 0', () => {
    const s = state({
      age: 60,
      birthYear: 1966,
      accounts: [
        acct({ id: 'tb', type: 'TaxableBrokerage', balance: 100000, basis: 20000 }),
        acct({ id: 'trad', type: 'TraditionalIRA', balance: 500000 }),
      ],
    });
    const { outcome } = yearStep({
      state: s,
      shocks: NO_SHOCKS,
      baseExpensesThbMo: 0,
      baseExpensesThbYr: 0,
      baseTravelUsdYr: 0,
      isThaiResident: true,
      regScenario: DEFAULT_REGULATORY_SCENARIO_PESSIMISTIC,
      assumption: DEFAULT_ASSUMPTION,
    });
    expect(outcome.rothConversionAmount).toBe(0);
  });
});

// ---------- S7 — FIRE verdict displays both bands ----------

describe('S7: FIRE verdict displays both bands', () => {
  it('runBothRegulatoryScenarios returns optimistic + pessimistic SimResults', () => {
    const userInputs: UserInputs = {
      currentAge: 55,
      lifeExpectancy: 90,
      birthYear: 1971,
      accounts: [
        acct({ id: 'trad', type: 'TraditionalIRA', balance: 500000 }),
        acct({ id: 'roth', type: 'RothIRA', balance: 500000 }),
      ],
      expenses: {
        housingThbMo: 30000,
        foodThbMo: 15000,
        transportThbMo: 5000,
        otherThbMo: 5000,
        healthcareThbYr: 100000,
        legalTaxThbYr: 50000,
        travelUsdYr: 3000,
      },
      thaiResidencyByYear: Array.from({ length: 35 }, () => true),
      successThreshold: 0.9,
      monteCarloTrials: 50,
      regulatoryStance: 'both',
    };
    const { optimistic, pessimistic } = runBothRegulatoryScenarios(
      userInputs,
      DEFAULT_ASSUMPTION,
      42,
      50,
    );
    expect(optimistic.successRate).toBeGreaterThanOrEqual(0);
    expect(optimistic.successRate).toBeLessThanOrEqual(1);
    expect(pessimistic.successRate).toBeGreaterThanOrEqual(0);
    expect(pessimistic.successRate).toBeLessThanOrEqual(1);
    expect(pessimistic.successRate).toBeLessThanOrEqual(optimistic.successRate + 0.05);
  });
});
