/**
 * RMD engine tests (T6).
 *
 * TDD: written BEFORE the implementation.
 *
 * DEVIATION FROM PLAN §T6 QA #1:
 *   The plan states `rmdAge(1959) === 73`, but per .research/01-us-federal-tax.md
 *   the actual SECURE 2.0 boundary is:
 *     - Before Jul 1, 1951 → 73
 *     - Jul 2, 1951 through Dec 31, 1959 → 75
 *     - 1960+ → 75
 *   The whole-year approximation in `rmdAgeByBirthYear` (constants.ts) treats
 *   1950 or earlier → 73, 1951+ → 75. Tests below match the constants module,
 *   not the plan text (the plan spec is incorrect).
 */

import { describe, expect, it } from 'vitest';

import type { AccountType } from '../types.js';
import { isRmdApplicable, rmdAge, rmdAmount, totalRmd } from './rmd.js';

describe('rmdAge', () => {
  it('returns 73 for birth year 1950 (before SECURE 2.0 boundary)', () => {
    expect(rmdAge(1950)).toBe(73);
  });

  it('returns 75 for birth year 1951 (whole-year approximation)', () => {
    expect(rmdAge(1951)).toBe(75);
  });

  it('returns 75 for birth year 1959', () => {
    expect(rmdAge(1959)).toBe(75);
  });

  it('returns 75 for birth year 1960', () => {
    expect(rmdAge(1960)).toBe(75);
  });

  it('returns 73 for very old birth years (e.g. 1940)', () => {
    expect(rmdAge(1940)).toBe(73);
  });
});

describe('isRmdApplicable', () => {
  it('returns true for Traditional401k', () => {
    expect(isRmdApplicable('Traditional401k')).toBe(true);
  });

  it('returns true for TraditionalIRA', () => {
    expect(isRmdApplicable('TraditionalIRA')).toBe(true);
  });

  it('returns false for Roth401k (SECURE 2.0 eliminated Roth 401k RMDs)', () => {
    expect(isRmdApplicable('Roth401k')).toBe(false);
  });

  it('returns false for RothIRA', () => {
    expect(isRmdApplicable('RothIRA')).toBe(false);
  });

  it('returns false for HSA', () => {
    expect(isRmdApplicable('HSA')).toBe(false);
  });

  it('returns false for Cash', () => {
    expect(isRmdApplicable('Cash')).toBe(false);
  });

  it('returns false for TaxableBrokerage', () => {
    expect(isRmdApplicable('TaxableBrokerage')).toBe(false);
  });
});

describe('rmdAmount', () => {
  it('age 73 TraditionalIRA: 500k / 26.5 = 18,867.92', () => {
    expect(rmdAmount(500_000, 73, 'TraditionalIRA', 1950)).toBeCloseTo(
      18_867.92,
      2,
    );
  });

  it('age 74 TraditionalIRA (Oracle E3 canonical): 500k / 25.5 = 19,607.84', () => {
    expect(rmdAmount(500_000, 74, 'TraditionalIRA', 1950)).toBeCloseTo(
      19_607.84,
      2,
    );
  });

  it('age 74 Traditional401k also uses 25.5 divisor', () => {
    expect(rmdAmount(500_000, 74, 'Traditional401k', 1950)).toBeCloseTo(
      19_607.84,
      2,
    );
  });

  it('returns 0 for RothIRA regardless of age', () => {
    expect(rmdAmount(500_000, 74, 'RothIRA', 1950)).toBe(0);
  });

  it('returns 0 for Roth401k (SECURE 2.0 change effective 2024)', () => {
    expect(rmdAmount(500_000, 74, 'Roth401k', 1950)).toBe(0);
  });

  it('returns 0 for HSA regardless of age', () => {
    expect(rmdAmount(500_000, 74, 'HSA', 1950)).toBe(0);
  });

  it('returns 0 for Cash', () => {
    expect(rmdAmount(500_000, 74, 'Cash', 1950)).toBe(0);
  });

  it('returns 0 for TaxableBrokerage', () => {
    expect(rmdAmount(500_000, 74, 'TaxableBrokerage', 1950)).toBe(0);
  });

  it('returns 0 below RMD age (72 < 73 for birth year 1950)', () => {
    expect(rmdAmount(500_000, 72, 'TraditionalIRA', 1950)).toBe(0);
  });

  it('returns 0 below RMD age for post-1950 birth (74 < 75 for birth year 1960)', () => {
    expect(rmdAmount(500_000, 74, 'TraditionalIRA', 1960)).toBe(0);
  });

  it('age above 120 uses floor divisor 2.0', () => {
    expect(rmdAmount(100_000, 125, 'TraditionalIRA', 1950)).toBe(50_000);
  });

  it('age exactly 120 uses divisor 2.0', () => {
    expect(rmdAmount(100_000, 120, 'TraditionalIRA', 1950)).toBe(50_000);
  });

  it('negative balance clamps to 0 (defensive)', () => {
    expect(rmdAmount(-100, 74, 'TraditionalIRA', 1950)).toBe(0);
  });

  it('NaN balance clamps to 0 (defensive)', () => {
    expect(rmdAmount(Number.NaN, 74, 'TraditionalIRA', 1950)).toBe(0);
  });

  it('zero balance returns 0', () => {
    expect(rmdAmount(0, 74, 'TraditionalIRA', 1950)).toBe(0);
  });
});

describe('totalRmd', () => {
  it('sums across Traditional IRA + Traditional 401k, excludes Roth', () => {
    const accounts: readonly { balance: number; type: AccountType }[] = [
      { balance: 300_000, type: 'TraditionalIRA' },
      { balance: 200_000, type: 'Traditional401k' },
      { balance: 500_000, type: 'RothIRA' },
    ];
    // (300k + 200k) / 26.5 = 18,867.92
    expect(totalRmd(accounts, 73, 1950)).toBeCloseTo(18_867.92, 2);
  });

  it('returns 0 when no traditional retirement accounts', () => {
    const accounts: readonly { balance: number; type: AccountType }[] = [
      { balance: 500_000, type: 'RothIRA' },
      { balance: 100_000, type: 'HSA' },
      { balance: 50_000, type: 'Cash' },
    ];
    expect(totalRmd(accounts, 74, 1950)).toBe(0);
  });

  it('returns 0 when all accounts are below RMD age', () => {
    const accounts: readonly { balance: number; type: AccountType }[] = [
      { balance: 500_000, type: 'TraditionalIRA' },
    ];
    expect(totalRmd(accounts, 70, 1950)).toBe(0);
  });

  it('returns 0 for empty account list', () => {
    expect(totalRmd([], 74, 1950)).toBe(0);
  });

  it('aggregates two Traditional401k accounts (v1 aggregation)', () => {
    const accounts: readonly { balance: number; type: AccountType }[] = [
      { balance: 100_000, type: 'Traditional401k' },
      { balance: 150_000, type: 'Traditional401k' },
    ];
    // 250k / 25.5 = 9,803.92
    expect(totalRmd(accounts, 74, 1950)).toBeCloseTo(9_803.92, 2);
  });
});
