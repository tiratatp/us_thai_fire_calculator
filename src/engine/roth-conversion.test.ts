/**
 * Roth conversion value test (T9).
 *
 * TDD: written BEFORE the implementation.
 *
 * Anchors Oracle Systemic #2 (Thai-resident conversion has ZERO Thai benefit;
 * default is do-not-convert) and Systemic #3 (0% LTCG harvest and Roth
 * conversion compete for 12% bracket room; if a harvest is planned, this
 * function MUST return 0).
 */

import { describe, expect, it } from 'vitest';

import type { RegulatoryScenario } from '../types.js';
import {
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2026_SINGLE,
} from '../data/constants.js';
import {
  valueTestRothConversion,
  type RothConversionInputs,
} from './roth-conversion.js';

// Derived caps used by several tests below.
const bracket12Top = US_ORDINARY_BRACKETS_2026_SINGLE.value[1]!.top; // 49725
const stdDed = US_STD_DED_2026_SINGLE.value; // 16100
const bracket12GrossCap = bracket12Top + stdDed; // 65825

const pessimisticReg: RegulatoryScenario = {
  rothTaxedByThailand: true,
  treatyResourcesUsSourcePensions: false,
  thaiPensionDeductionApplies: false,
  niitCreditableAgainstThai: false,
};

const optimisticReg: RegulatoryScenario = {
  rothTaxedByThailand: false,
  treatyResourcesUsSourcePensions: true,
  thaiPensionDeductionApplies: true,
  niitCreditableAgainstThai: true,
};

function baseInputs(overrides: Partial<RothConversionInputs> = {}): RothConversionInputs {
  return {
    age: 55,
    birthYear: 1971,
    traditionalUsBalanceUsd: 500_000,
    usOrdinaryIncomeUsd: 0,
    ltcgHarvestPlannedUsd: 0,
    isThaiResident: false,
    regScenario: pessimisticReg,
    ...overrides,
  };
}

describe('valueTestRothConversion — Oracle Systemic #2 (Thai-resident default)', () => {
  it('returns 0 for a Thai-resident year under the pessimistic scenario (default answer)', () => {
    // Rationale: converting Traditional→Roth costs US tax NOW, and Thailand
    // still taxes the eventual Roth remittance as pension income. Pure cost.
    const out = valueTestRothConversion(
      baseInputs({ isThaiResident: true, regScenario: pessimisticReg }),
    );
    expect(out).toBe(0);
  });

  it('returns 0 for a Thai-resident year even under the optimistic scenario (v1 conservative default)', () => {
    // v1 does not run the full NPV(future RMD tax) vs current conversion tax
    // comparison — that is v2. The conservative default remains 0.
    const out = valueTestRothConversion(
      baseInputs({ isThaiResident: true, regScenario: optimisticReg }),
    );
    expect(out).toBe(0);
  });
});

describe('valueTestRothConversion — Oracle Systemic #3 (0% LTCG mutex)', () => {
  it('returns 0 when caller has already planned an LTCG harvest (mutex regression)', () => {
    const out = valueTestRothConversion(
      baseInputs({ ltcgHarvestPlannedUsd: 5_000 }),
    );
    expect(out).toBe(0);
  });

  it('returns 0 for an arbitrarily tiny planned LTCG harvest (mutex is strict)', () => {
    const out = valueTestRothConversion(
      baseInputs({ ltcgHarvestPlannedUsd: 0.01 }),
    );
    expect(out).toBe(0);
  });
});

describe('valueTestRothConversion — age / balance / RMD gates', () => {
  it('returns 0 once age has reached the RMD age (birthYear 1971 → 75)', () => {
    const out = valueTestRothConversion(baseInputs({ age: 76 }));
    expect(out).toBe(0);
  });

  it('returns 0 exactly at the RMD age boundary', () => {
    // birthYear 1971 → RMD age 75.
    const out = valueTestRothConversion(baseInputs({ age: 75 }));
    expect(out).toBe(0);
  });

  it('returns 0 when Traditional US balance is 0', () => {
    const out = valueTestRothConversion(
      baseInputs({ traditionalUsBalanceUsd: 0 }),
    );
    expect(out).toBe(0);
  });

  it('returns 0 when Traditional US balance is negative (defensive)', () => {
    const out = valueTestRothConversion(
      baseInputs({ traditionalUsBalanceUsd: -1 }),
    );
    expect(out).toBe(0);
  });
});

describe('valueTestRothConversion — non-resident, bracket-filling positive path', () => {
  it('converts up to the 12% bracket gross cap when ordinary income is 0', () => {
    const out = valueTestRothConversion(baseInputs());
    // min(65825 - 0, 500000) = 65825
    expect(out).toBe(bracket12GrossCap);
  });

  it('converts the remaining 12% bracket room when ordinary income is partial', () => {
    const out = valueTestRothConversion(
      baseInputs({ usOrdinaryIncomeUsd: 20_000 }),
    );
    expect(out).toBe(bracket12GrossCap - 20_000); // 45825
  });

  it('returns 0 when ordinary income already exceeds the 12% bracket cap', () => {
    const out = valueTestRothConversion(
      baseInputs({ usOrdinaryIncomeUsd: 100_000 }),
    );
    expect(out).toBe(0);
  });

  it('returns 0 when ordinary income exactly matches the bracket cap', () => {
    const out = valueTestRothConversion(
      baseInputs({ usOrdinaryIncomeUsd: bracket12GrossCap }),
    );
    expect(out).toBe(0);
  });

  it('clamps the conversion to the remaining Traditional balance', () => {
    const out = valueTestRothConversion(
      baseInputs({ traditionalUsBalanceUsd: 10_000 }),
    );
    // min(65825, 10000) = 10000
    expect(out).toBe(10_000);
  });

  it('produces a positive answer regardless of regScenario when not Thai-resident', () => {
    const optimistic = valueTestRothConversion(
      baseInputs({ regScenario: optimisticReg }),
    );
    const pessimistic = valueTestRothConversion(
      baseInputs({ regScenario: pessimisticReg }),
    );
    expect(optimistic).toBe(bracket12GrossCap);
    expect(pessimistic).toBe(bracket12GrossCap);
  });
});

describe('valueTestRothConversion — RMD age varies by birth year', () => {
  it('converts at age 72 for birthYear 1950 (RMD age 73)', () => {
    const out = valueTestRothConversion(
      baseInputs({ age: 72, birthYear: 1950 }),
    );
    expect(out).toBe(bracket12GrossCap);
  });

  it('returns 0 at age 73 for birthYear 1950 (RMD age reached)', () => {
    const out = valueTestRothConversion(
      baseInputs({ age: 73, birthYear: 1950 }),
    );
    expect(out).toBe(0);
  });

  it('converts at age 74 for birthYear 1971 (RMD age 75, below boundary)', () => {
    const out = valueTestRothConversion(
      baseInputs({ age: 74, birthYear: 1971 }),
    );
    expect(out).toBe(bracket12GrossCap);
  });
});
