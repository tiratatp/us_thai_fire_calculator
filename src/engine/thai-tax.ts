/**
 * Thai Personal Income Tax (PIT) engine.
 *
 * Computes Thai tax on remittances under the post-2024 remittance-basis regime
 * (Departmental Instruction Paw 161/2566 + 162/2566). All amounts in THB.
 *
 * Design anchors:
 * - .research/02-thai-tax.md §4 (source-type taxability + treaty overlay)
 * - .research/08-algorithm-v2.md (per-item assessable rules)
 * - Oracle Systemic #4: Paw 162/2566 grandfathering does NOT apply to
 *   retirement accounts (Traditional IRA / Roth / HSA). The engine MUST
 *   ignore `preTaxOrigin` for those source types.
 * - Oracle D1b: non-Thai-resident year short-circuits to 0 (residency is
 *   the primary lever; taxability only exists if you're a tax resident).
 *
 * All functions here are pure; every runtime numeric default is pulled from
 * `Cited<T>` constants in `../data/constants.ts` — no magic numbers.
 */

import type {
  Bracket,
  RegulatoryScenario,
  RemittanceItem,
  RemittanceSourceType,
} from '../types.js';
import {
  THAI_PENSION_DEDUCTION_CAP,
  THAI_PENSION_DEDUCTION_PCT,
  THAI_PERSONAL_ALLOWANCE,
  THAI_PIT_BRACKETS,
} from '../data/constants.js';

/**
 * Apply the Thai progressive PIT schedule bracket-by-bracket.
 *
 * Same shape as usOrdinaryTax but in THB. Brackets are cumulative: the top
 * of bracket N is the floor of bracket N+1. The final bracket's `top` is
 * `Number.POSITIVE_INFINITY`.
 *
 * Returns 0 when `assessableIncomeThb <= 0`.
 */
export function thaiPit(
  assessableIncomeThb: number,
  brackets: readonly Bracket[],
): number {
  if (assessableIncomeThb <= 0) return 0;
  let tax = 0;
  let prevTop = 0;
  for (const b of brackets) {
    if (assessableIncomeThb <= prevTop) break;
    const slice = Math.min(assessableIncomeThb, b.top) - prevTop;
    tax += slice * b.rate;
    prevTop = b.top;
  }
  return tax;
}

/**
 * Pension-like source types under Thai RD treatment. Retirement account
 * withdrawals — Traditional IRA, Roth, HSA — remitted into Thailand are
 * treated as pension income (see .research/02-thai-tax.md §4). This makes
 * them eligible for the 50%/100k THB pension deduction *when* the
 * regulatory scenario flag `thaiPensionDeductionApplies` is on.
 *
 * Note: HSA is not recognized as tax-advantaged in Thailand; classifying
 * it as pension-like here is an intentional pessimistic-friendly choice
 * because it lets the pension deduction *reduce* Thai tax on HSA
 * remittances when the flag is on. When the flag is off, this classifier
 * is irrelevant.
 */
export function isPensionSourceType(t: RemittanceSourceType): boolean {
  return t === 'TraditionalIRA' || t === 'Roth' || t === 'HSA';
}

/**
 * Compute the THB amount subject to Thai tax for a single remittance item.
 *
 * Rules — see .research/08-algorithm-v2.md and Oracle Systemic #4:
 *
 * - `Cash`: assessable = amountThb IF post-2024 origin; 0 if pre-2024
 *   (Paw 162/2566 grandfathering).
 * - `TaxableBasis`: never assessable (return of capital, regardless of
 *   origin). Grandfathering irrelevant.
 * - `TaxableGain`: fully assessable. Grandfathering is applied by the
 *   remittance solver at source selection, not here.
 * - `TraditionalIRA`: fully assessable. `preTaxOrigin` IGNORED
 *   (Systemic #4 — RD does not extend Paw 162 to retirement accounts).
 * - `Roth`: fully assessable IFF `regScenario.rothTaxedByThailand`;
 *   otherwise 0 (treaty-protected). `preTaxOrigin` IGNORED.
 * - `HSA`: fully assessable (Thailand does not recognize HSA).
 *   `preTaxOrigin` IGNORED.
 */
export function thaiAssessableFromRemittance(
  item: RemittanceItem,
  regScenario: RegulatoryScenario,
): number {
  switch (item.sourceType) {
    case 'Cash':
      return item.preTaxOrigin === 'pre2024' ? 0 : item.amountThb;
    case 'TaxableBasis':
      return 0;
    case 'TaxableGain':
      return item.amountThb;
    case 'TraditionalIRA':
      // Systemic #4: grandfathering does NOT apply to retirement accounts.
      return item.amountThb;
    case 'Roth':
      return regScenario.rothTaxedByThailand ? item.amountThb : 0;
    case 'HSA':
      return item.amountThb;
  }
}

/**
 * Top-level Thai tax on a year's remittances.
 *
 * Steps:
 *   1. Residency short-circuit: non-resident → 0 (Oracle D1b).
 *   2. Sum assessable across items via `thaiAssessableFromRemittance`.
 *   3. If `thaiPensionDeductionApplies` and pension income > 0, subtract
 *      min(cap, pct × pensionIncome) from the assessable total.
 *   4. Subtract personal allowance.
 *   5. `thaiPit(max(0, taxableIncome), brackets)`.
 *
 * All optional parameters default to the constants in `data/constants.ts`
 * so callers can override for tests or scenario tweaks without touching
 * the source-of-truth values.
 */
export function thaiTaxOnRemittances(
  items: readonly RemittanceItem[],
  regScenario: RegulatoryScenario,
  isThaiResident: boolean,
  personalAllowance: number = THAI_PERSONAL_ALLOWANCE.value,
  pensionDedCap: number = THAI_PENSION_DEDUCTION_CAP.value,
  pensionDedPct: number = THAI_PENSION_DEDUCTION_PCT.value,
  brackets: readonly Bracket[] = THAI_PIT_BRACKETS.value,
): number {
  if (!isThaiResident) return 0;

  let totalAssessable = 0;
  let pensionAssessable = 0;
  for (const item of items) {
    const a = thaiAssessableFromRemittance(item, regScenario);
    totalAssessable += a;
    if (isPensionSourceType(item.sourceType)) {
      pensionAssessable += a;
    }
  }

  let deductions = personalAllowance;
  if (regScenario.thaiPensionDeductionApplies && pensionAssessable > 0) {
    deductions += Math.min(pensionDedCap, pensionDedPct * pensionAssessable);
  }

  const taxableIncome = Math.max(0, totalAssessable - deductions);
  return thaiPit(taxableIncome, brackets);
}
