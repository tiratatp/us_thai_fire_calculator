/**
 * Roth conversion value test (T9).
 *
 * Returns the recommended USD amount to convert from Traditional US
 * retirement accounts into Roth this year. Returns 0 when converting is
 * NOT optimal — which, per Oracle's v2 correction, is the default answer.
 *
 * Oracle Systemic #2 (Thai-resident conversion buys ZERO Thai benefit):
 *   Converting Traditional → Roth costs US ordinary tax NOW. If the user
 *   is a Thai tax resident, Thailand may STILL tax the eventual Roth
 *   remittance as pension income (rothTaxedByThailand=true) and there is
 *   no Thai FTC available to absorb the US conversion tax (it wasn't a
 *   remittance year). Net: pure US out-of-pocket cost. Even under the
 *   optimistic scenario (rothTaxedByThailand=false), v1 keeps the
 *   conservative default of 0 — a proper NPV(future RMD tax) vs
 *   current-conversion-tax value test is v2 territory.
 *
 * Oracle Systemic #3 (0% LTCG vs Roth conversion mutex):
 *   0% LTCG harvesting and Roth conversion compete for the SAME 12%
 *   ordinary bracket space (a conversion is ordinary income; harvested
 *   gain rides on top). If the caller has already planned any LTCG
 *   harvest for the year, this function returns 0. The two actions are
 *   mutually exclusive in a single year.
 *
 * See .research/07-oracle-critique.md and .research/08-algorithm-v2.md.
 */

import type { RegulatoryScenario } from '../types.js';
import {
  RMD_AGE_BY_BIRTH_YEAR,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2026_SINGLE,
} from '../data/constants.js';

/** Inputs to the Roth-conversion value test (single filer, v1). */
export interface RothConversionInputs {
  readonly age: number;
  readonly birthYear: number;
  /** All Traditional US accounts (Traditional IRA + Traditional 401k). USD. */
  readonly traditionalUsBalanceUsd: number;
  /** US ordinary income this year BEFORE any conversion (RMDs, withdrawals). */
  readonly usOrdinaryIncomeUsd: number;
  /**
   * LTCG the caller has ALREADY planned to harvest this year.
   * If > 0, this function returns 0 (Systemic #3 mutex).
   */
  readonly ltcgHarvestPlannedUsd: number;
  /** True if the user is a Thai tax resident this year. */
  readonly isThaiResident: boolean;
  readonly regScenario: RegulatoryScenario;
}

/**
 * Decide the Roth conversion amount for this year.
 *
 * Returns 0 unless every gate below passes, at which point the function
 * fills the 12% ordinary bracket:
 *   1. Age < RMD age (post-RMD conversions have no forward benefit).
 *   2. Traditional US balance > 0.
 *   3. No LTCG harvest planned (Systemic #3 mutex).
 *   4. There is room left in the 12% bracket (gross cap = bracket top + std ded).
 *   5. Not a Thai-resident year (Systemic #2 default).
 *
 * The returned amount is `min(bracket12Room, traditionalUsBalanceUsd)`.
 */
export function valueTestRothConversion(inputs: RothConversionInputs): number {
  const {
    age,
    birthYear,
    traditionalUsBalanceUsd,
    usOrdinaryIncomeUsd,
    ltcgHarvestPlannedUsd,
    isThaiResident,
    regScenario: _regScenario,
  } = inputs;

  // Gate 1: age must be strictly below the SECURE 2.0 RMD age.
  const rmdAge = RMD_AGE_BY_BIRTH_YEAR.value(birthYear);
  if (age >= rmdAge) return 0;

  // Gate 2: need something to convert.
  if (traditionalUsBalanceUsd <= 0) return 0;

  // Gate 3 (Systemic #3): 0% LTCG harvest and conversion are mutex.
  if (ltcgHarvestPlannedUsd > 0) return 0;

  // Gate 4: compute available room inside the 12% bracket.
  //   Taxable income = ordinary − standard deduction.
  //   The 12% bracket ceiling is on TAXABLE income, so the gross-income
  //   equivalent is `bracket12Top + stdDed`.
  const bracket12Top = US_ORDINARY_BRACKETS_2026_SINGLE.value[1]?.top;
  if (bracket12Top === undefined) return 0;
  const stdDed = US_STD_DED_2026_SINGLE.value;
  const bracket12GrossCap = bracket12Top + stdDed;
  const conversionRoom = Math.max(0, bracket12GrossCap - usOrdinaryIncomeUsd);
  if (conversionRoom <= 0) return 0;

  // Gate 5 (Systemic #2): Thai-resident year → do not convert.
  //   Pessimistic (rothTaxedByThailand=true): conversion is pure US cost.
  //   Optimistic (rothTaxedByThailand=false): a proper NPV value test is
  //   v2 territory; v1 keeps the conservative default. The caller can
  //   still opt in during a non-resident year (isThaiResident=false).
  if (isThaiResident) return 0;

  // Non-resident year, gates passed: fill the 12% bracket, capped by
  // the actual Traditional balance.
  return Math.min(conversionRoom, traditionalUsBalanceUsd);
}
