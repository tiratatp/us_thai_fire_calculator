/**
 * Invariants over Thai tax constants + citation coverage across all constants.
 */

import { describe, expect, it } from 'vitest';
import type { Cited } from '../types.js';
import {
  EARLY_WITHDRAWAL_PENALTY_RATE,
  HSA_MEDICARE_AGE,
  HSA_PRE_65_PENALTY_RATE,
  PAW_162_CUTOFF_DATE,
  RMD_AGE_BY_BIRTH_YEAR,
  RMD_UNIFORM_LIFETIME_TABLE,
  THAI_PENSION_DEDUCTION_CAP,
  THAI_PENSION_DEDUCTION_PCT,
  THAI_PERSONAL_ALLOWANCE,
  THAI_PIT_BRACKETS,
  US_LTCG_BRACKETS_2025_SINGLE,
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_RATE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2025_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2025_SINGLE,
  US_STD_DED_2026_SINGLE,
} from './constants.js';

function assertCited<T>(c: Cited<T>, label: string): void {
  expect(c.sourceUrl, `${label}.sourceUrl`).toMatch(/^https:\/\//);
  expect(c.sourceName.length, `${label}.sourceName length`).toBeGreaterThan(0);
  expect(c.retrievedDate, `${label}.retrievedDate`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
}

describe('Thai PIT brackets', () => {
  const b = THAI_PIT_BRACKETS.value;

  it('has 8 brackets', () => {
    expect(b.length).toBe(8);
  });

  it('first bracket = 0% up to 150,000 THB', () => {
    expect(b[0]!.top).toBe(150000);
    expect(b[0]!.rate).toBe(0);
  });

  it('30% bracket top = 4,000,000 THB (NOT 5M — Oracle fact-correction)', () => {
    const thirty = b.find((x) => x.rate === 0.30)!;
    expect(thirty.top).toBe(4000000);
  });

  it('35% bracket is open-ended', () => {
    const last = b[b.length - 1]!;
    expect(last.rate).toBe(0.35);
    expect(last.top).toBe(Number.POSITIVE_INFINITY);
  });

  it('brackets ascend strictly in top and rate', () => {
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!.top).toBeGreaterThan(b[i - 1]!.top);
      expect(b[i]!.rate).toBeGreaterThan(b[i - 1]!.rate);
    }
  });
});

describe('Thai allowances and deductions', () => {
  it('personal allowance = 60,000 THB', () => {
    expect(THAI_PERSONAL_ALLOWANCE.value).toBe(60000);
  });

  it('pension deduction cap = 100,000 THB', () => {
    expect(THAI_PENSION_DEDUCTION_CAP.value).toBe(100000);
  });

  it('pension deduction pct = 50%', () => {
    expect(THAI_PENSION_DEDUCTION_PCT.value).toBeCloseTo(0.5, 10);
  });
});

describe('Paw 162 grandfathering', () => {
  it('cutoff = 2024-01-01', () => {
    expect(PAW_162_CUTOFF_DATE.value).toBe('2024-01-01');
  });

  it('has notes reminding NOT to apply to retirement accounts', () => {
    expect(PAW_162_CUTOFF_DATE.notes).toMatch(/retirement/i);
    expect(PAW_162_CUTOFF_DATE.notes).toMatch(/never|not/i);
  });
});

describe('Citation coverage', () => {
  const all: readonly Cited<unknown>[] = [
    US_ORDINARY_BRACKETS_2025_SINGLE,
    US_ORDINARY_BRACKETS_2026_SINGLE,
    US_LTCG_BRACKETS_2025_SINGLE,
    US_LTCG_BRACKETS_2026_SINGLE,
    US_STD_DED_2025_SINGLE,
    US_STD_DED_2026_SINGLE,
    US_NIIT_RATE,
    US_NIIT_THRESHOLD_SINGLE,
    RMD_UNIFORM_LIFETIME_TABLE,
    RMD_AGE_BY_BIRTH_YEAR,
    EARLY_WITHDRAWAL_PENALTY_RATE,
    HSA_PRE_65_PENALTY_RATE,
    HSA_MEDICARE_AGE,
    THAI_PIT_BRACKETS,
    THAI_PERSONAL_ALLOWANCE,
    THAI_PENSION_DEDUCTION_CAP,
    THAI_PENSION_DEDUCTION_PCT,
    PAW_162_CUTOFF_DATE,
  ];

  it('every constant is a Cited<T> with an https URL and source name', () => {
    for (const [i, c] of all.entries()) {
      assertCited(c, `constants[${i}]`);
    }
  });

  it('at least 5 distinct https source URLs across constants', () => {
    const urls = new Set(all.map((c) => c.sourceUrl));
    expect(urls.size).toBeGreaterThanOrEqual(5);
  });
});
