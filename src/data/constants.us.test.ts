/**
 * Invariants over US federal tax constants.
 */

import { describe, expect, it } from 'vitest';
import {
  EARLY_WITHDRAWAL_PENALTY_RATE,
  HSA_MEDICARE_AGE,
  HSA_PRE_65_PENALTY_RATE,
  RMD_AGE_BY_BIRTH_YEAR,
  RMD_UNIFORM_LIFETIME_TABLE,
  US_LTCG_BRACKETS_2025_SINGLE,
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_RATE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2025_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2025_SINGLE,
  US_STD_DED_2026_SINGLE,
} from './constants.js';

describe('US ordinary brackets — monotonicity', () => {
  it('2026 single brackets ascend strictly in top', () => {
    const b = US_ORDINARY_BRACKETS_2026_SINGLE.value;
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!.top, `bracket ${i}`).toBeGreaterThan(b[i - 1]!.top);
    }
  });

  it('2026 single brackets ascend strictly in rate', () => {
    const b = US_ORDINARY_BRACKETS_2026_SINGLE.value;
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!.rate).toBeGreaterThan(b[i - 1]!.rate);
    }
  });

  it('2026 single: last bracket is 37% and open-ended', () => {
    const b = US_ORDINARY_BRACKETS_2026_SINGLE.value;
    const last = b[b.length - 1]!;
    expect(last.rate).toBe(0.37);
    expect(last.top).toBe(Number.POSITIVE_INFINITY);
  });

  it('2026 single: 12% bracket top = $49,725 (Oracle mutex line)', () => {
    const b = US_ORDINARY_BRACKETS_2026_SINGLE.value;
    const twelve = b.find((x) => x.rate === 0.12)!;
    expect(twelve.top).toBe(49725);
  });

  it('2025 single brackets ascend strictly and end at 37%', () => {
    const b = US_ORDINARY_BRACKETS_2025_SINGLE.value;
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!.top).toBeGreaterThan(b[i - 1]!.top);
    }
    expect(b[b.length - 1]!.rate).toBe(0.37);
  });
});

describe('US LTCG thresholds', () => {
  it('2026 single: 0% top = $49,450', () => {
    expect(US_LTCG_BRACKETS_2026_SINGLE.value.zeroTop).toBe(49450);
  });

  it('2026 single: 15% top = $545,500', () => {
    expect(US_LTCG_BRACKETS_2026_SINGLE.value.fifteenTop).toBe(545500);
  });

  it('2025 single: 0% top = $48,350', () => {
    expect(US_LTCG_BRACKETS_2025_SINGLE.value.zeroTop).toBe(48350);
  });

  it('2025 single: 15% top = $533,400', () => {
    expect(US_LTCG_BRACKETS_2025_SINGLE.value.fifteenTop).toBe(533400);
  });
});

describe('US standard deduction', () => {
  it('2025 single = $15,750', () => {
    expect(US_STD_DED_2025_SINGLE.value).toBe(15750);
  });

  it('2026 single = $16,100', () => {
    expect(US_STD_DED_2026_SINGLE.value).toBe(16100);
  });
});

describe('NIIT', () => {
  it('rate = 3.8%', () => {
    expect(US_NIIT_RATE.value).toBeCloseTo(0.038, 10);
  });

  it('single MAGI threshold = $200,000', () => {
    expect(US_NIIT_THRESHOLD_SINGLE.value).toBe(200000);
  });
});

describe('RMD Uniform Lifetime Table', () => {
  const table = RMD_UNIFORM_LIFETIME_TABLE.value;

  it('age 73 divisor = 26.5', () => {
    expect(table[73]).toBe(26.5);
  });

  it('age 74 divisor = 25.5 (Oracle E3 sanity)', () => {
    expect(table[74]).toBe(25.5);
  });

  it('age 75 divisor = 24.6', () => {
    expect(table[75]).toBe(24.6);
  });

  it('divisors strictly descending 72→120', () => {
    for (let age = 73; age <= 120; age++) {
      const prev = table[age - 1]!;
      const cur = table[age]!;
      expect(cur, `age ${age}`).toBeLessThan(prev);
    }
  });

  it('covers ages 72 through 120 without gaps', () => {
    for (let age = 72; age <= 120; age++) {
      expect(table[age], `age ${age}`).toBeDefined();
    }
  });

  it('age 120 divisor = 2.0 (floor)', () => {
    expect(table[120]).toBe(2.0);
  });
});

describe('SECURE 2.0 RMD age by birth year', () => {
  it('born 1950 → 73', () => {
    expect(RMD_AGE_BY_BIRTH_YEAR.value(1950)).toBe(73);
  });

  it('born 1951 → 75', () => {
    expect(RMD_AGE_BY_BIRTH_YEAR.value(1951)).toBe(75);
  });

  it('born 1958 → 75', () => {
    expect(RMD_AGE_BY_BIRTH_YEAR.value(1958)).toBe(75);
  });

  it('born 1960 → 75', () => {
    expect(RMD_AGE_BY_BIRTH_YEAR.value(1960)).toBe(75);
  });
});

describe('Penalty rates', () => {
  it('early withdrawal = 10%', () => {
    expect(EARLY_WITHDRAWAL_PENALTY_RATE.value).toBeCloseTo(0.10, 10);
  });

  it('HSA pre-65 non-medical = 20%', () => {
    expect(HSA_PRE_65_PENALTY_RATE.value).toBeCloseTo(0.20, 10);
  });

  it('HSA Medicare age = 65', () => {
    expect(HSA_MEDICARE_AGE.value).toBe(65);
  });
});
