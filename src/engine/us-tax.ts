/**
 * US federal tax engine (T4).
 *
 * Pure functions — no I/O, no globals. Every numeric constant is passed in
 * (from `src/data/constants.ts`) so tests can pin the exact tax year.
 *
 * Responsibilities:
 *   - Progressive ordinary-income tax (`usOrdinaryTax`)
 *   - Long-term capital gains stack tax (`usLtcgStackTax`)
 *   - Net Investment Income Tax (`usNiit`)
 *   - HSA pre-65 non-medical withdrawal penalty (`usHsaPenalty`)
 *
 * The engine deliberately does NOT know about standard deduction — the caller
 * subtracts std ded from gross to get `taxableIncome` before calling.
 * Similarly, `usHsaPenalty` returns ONLY the 20% penalty; the ordinary income
 * tax on a non-medical HSA withdrawal is computed by `usOrdinaryTax` on the
 * separately-added ordinary income.
 */

import type { Bracket, LtcgThresholds } from '../types.js';
import {
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_RATE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2026_SINGLE,
  HSA_PRE_65_PENALTY_RATE,
  HSA_MEDICARE_AGE,
} from '../data/constants.js';

// Re-export the cited constants so downstream callers can reach them via the
// engine barrel without re-importing from `../data/constants.js`.
export {
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_RATE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2026_SINGLE,
  HSA_PRE_65_PENALTY_RATE,
  HSA_MEDICARE_AGE,
};

/**
 * Progressive bracket tax on ordinary income.
 *
 * @param taxableIncome — post-standard-deduction taxable income, USD.
 * @param brackets — ordered by ascending `top`; last bracket must be
 *   `{ top: Number.POSITIVE_INFINITY, rate }`.
 *
 * Contract:
 *   - Returns 0 for `taxableIncome <= 0`.
 *   - Sums `(min(income, top) - prevTop) * rate` bracket by bracket.
 *   - Handles the open-ended top bracket via `Number.POSITIVE_INFINITY`.
 */
export function usOrdinaryTax(
  taxableIncome: number,
  brackets: readonly Bracket[],
): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let prevTop = 0;

  for (const { top, rate } of brackets) {
    const bracketTop = Math.min(top, taxableIncome);
    const slice = bracketTop - prevTop;
    if (slice > 0) tax += slice * rate;
    if (taxableIncome <= top) break;
    prevTop = top;
  }

  return tax;
}

/**
 * Long-term capital gains stack tax.
 *
 * LTCG stacks ON TOP of already-taxed ordinary income. The 0/15/20 thresholds
 * are measured against the *combined* `ordinaryTaxable + ltcgIncome`, so
 * ordinary income can crowd LTCG out of the 0% band and into 15% (and 15% into
 * 20%).
 *
 * @param ordinaryTaxable — ordinary taxable income (post-std-ded), USD.
 * @param ltcgIncome — long-term capital gain amount, USD (>= 0).
 * @param ltcg — thresholds { zeroTop, fifteenTop }; 20% applies above.
 */
export function usLtcgStackTax(
  ordinaryTaxable: number,
  ltcgIncome: number,
  ltcg: LtcgThresholds,
): number {
  if (ltcgIncome <= 0) return 0;
  const ord = Math.max(0, ordinaryTaxable);

  // 0% band: room = zeroTop - ord (clamped at 0).
  const zeroRoom = Math.max(0, ltcg.zeroTop - ord);
  const amount0 = Math.min(ltcgIncome, zeroRoom);
  const afterZero = ltcgIncome - amount0;

  // 15% band: starts at max(ord, zeroTop) and ends at fifteenTop.
  const fifteenFloor = Math.max(ord, ltcg.zeroTop);
  const fifteenRoom = Math.max(0, ltcg.fifteenTop - fifteenFloor);
  const amount15 = Math.min(afterZero, fifteenRoom);

  // Everything else is 20%.
  const amount20 = afterZero - amount15;

  return amount15 * 0.15 + amount20 * 0.2;
}

/**
 * Net Investment Income Tax (IRC §1411).
 *
 * 3.8% × min(NII, MAGI − threshold). Returns 0 if MAGI ≤ threshold.
 * The threshold is NOT inflation-adjusted (single filer default $200,000).
 *
 * @param magi — modified adjusted gross income, USD.
 * @param netInvIncome — net investment income, USD (>= 0).
 * @param threshold — filer-status threshold; default single $200,000.
 * @param rate — statutory rate; default 3.8%.
 */
export function usNiit(
  magi: number,
  netInvIncome: number,
  threshold: number = US_NIIT_THRESHOLD_SINGLE.value,
  rate: number = US_NIIT_RATE.value,
): number {
  const excess = magi - threshold;
  if (excess <= 0) return 0;
  const nii = Math.max(0, netInvIncome);
  return rate * Math.min(nii, excess);
}

/**
 * HSA pre-65 non-qualified withdrawal penalty.
 *
 * Returns ONLY the 20% penalty (IRC §223(f)(4)). The ordinary income tax on
 * the non-medical withdrawal is applied separately by `usOrdinaryTax`.
 *
 * Rules:
 *   - Qualified medical expense at any age → 0 penalty (and no ordinary tax,
 *     but that's the caller's concern).
 *   - Age ≥ Medicare age (65) → 0 penalty regardless of purpose (ordinary
 *     income tax still applies for non-medical).
 *   - Otherwise → `penaltyRate * withdrawalAmount`.
 */
export function usHsaPenalty(
  withdrawalAmount: number,
  age: number,
  isQualifiedMedical: boolean,
  penaltyRate: number = HSA_PRE_65_PENALTY_RATE.value,
  medicareAge: number = HSA_MEDICARE_AGE.value,
): number {
  if (isQualifiedMedical) return 0;
  if (age >= medicareAge) return 0;
  if (withdrawalAmount <= 0) return 0;
  return penaltyRate * withdrawalAmount;
}
