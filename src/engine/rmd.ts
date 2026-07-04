/**
 * RMD (Required Minimum Distribution) engine (T6).
 *
 * Implements SECURE 2.0 age boundary + IRS Uniform Lifetime Table
 * (Publication 590-B). Applies only to Traditional IRA and Traditional
 * 401(k). Roth 401(k) RMDs were ELIMINATED by SECURE 2.0 effective 2024,
 * so no Roth account type triggers an RMD in this engine.
 *
 * V1 simplification: Traditional 401(k) and Traditional IRA balances are
 * aggregated when computing the household RMD. In real tax law each 401(k)
 * plan must satisfy its own RMD, while multiple Traditional IRAs may be
 * aggregated. V2 will split per-plan for 401(k)s (see plan §T6 / v2 backlog).
 *
 * @see .research/01-us-federal-tax.md §5
 * @see src/data/constants.ts — RMD_AGE_BY_BIRTH_YEAR, RMD_UNIFORM_LIFETIME_TABLE
 */

import type { AccountType } from '../types.js';
import {
  RMD_AGE_BY_BIRTH_YEAR,
  RMD_UNIFORM_LIFETIME_TABLE,
} from '../data/constants.js';

/** Divisor floor: ages ≥ 120 use the age-120 divisor (2.0). */
const MAX_TABLE_AGE = 120;

/**
 * SECURE 2.0 RMD-start age given birth year.
 *
 * Whole-year approximation (per constants module):
 *   - born 1950 or earlier → 73
 *   - born 1951 or later   → 75
 *
 * NOTE: Actual statute uses Jul 1, 1951 as the boundary. The plan's spec
 * `rmdAge(1959) === 73` is INCORRECT — 1959 falls into the 75 bracket.
 * We defer to the constants module (single source of truth).
 */
export function rmdAge(birthYear: number): number {
  return RMD_AGE_BY_BIRTH_YEAR.value(birthYear);
}

/**
 * Whether a given account type is subject to RMDs.
 *
 * Only Traditional 401(k) and Traditional IRA qualify. Roth 401(k) RMDs
 * were eliminated by SECURE 2.0 effective 2024, so Roth accounts of any
 * kind, HSA, Cash, and TaxableBrokerage all return false.
 */
export function isRmdApplicable(accountType: AccountType): boolean {
  switch (accountType) {
    case 'Traditional401k':
    case 'TraditionalIRA':
      return true;
    case 'Roth401k':
    case 'RothIRA':
    case 'HSA':
    case 'Cash':
    case 'TaxableBrokerage':
      return false;
  }
}

/**
 * RMD amount for a single account.
 *
 * @param priorYearEndBalance - prior-year-end balance (USD). Caller passes
 *   the correct snapshot; the engine does not track history.
 * @param currentAge - the account holder's age as of Dec 31 of the RMD year.
 * @param accountType - account type; non-Traditional types return 0.
 * @param birthYear - used to compute the SECURE 2.0 start age.
 *
 * Clamps: never negative, never NaN. Ages ≥ 120 use the age-120 divisor (2.0).
 */
export function rmdAmount(
  priorYearEndBalance: number,
  currentAge: number,
  accountType: AccountType,
  birthYear: number,
): number {
  if (!isRmdApplicable(accountType)) return 0;
  if (currentAge < rmdAge(birthYear)) return 0;
  if (!Number.isFinite(priorYearEndBalance) || priorYearEndBalance <= 0) {
    return 0;
  }

  const lookupAge = currentAge > MAX_TABLE_AGE ? MAX_TABLE_AGE : currentAge;
  const divisor = RMD_UNIFORM_LIFETIME_TABLE.value[lookupAge];
  // Defensive: table covers 72..120; only reachable if currentAge < 72,
  // but that path is already gated by `currentAge < rmdAge(birthYear)`
  // (min RMD age is 73). Guard anyway.
  if (divisor === undefined || divisor <= 0) return 0;

  return priorYearEndBalance / divisor;
}

/**
 * Aggregate RMD across all Traditional IRA + Traditional 401(k) accounts.
 *
 * V1 aggregates (per plan §T6). Callers pass current balances as the
 * prior-year-end snapshot for the RMD year in question.
 */
export function totalRmd(
  accounts: readonly { balance: number; type: AccountType }[],
  currentAge: number,
  birthYear: number,
): number {
  let total = 0;
  for (const account of accounts) {
    total += rmdAmount(account.balance, currentAge, account.type, birthYear);
  }
  return total;
}
