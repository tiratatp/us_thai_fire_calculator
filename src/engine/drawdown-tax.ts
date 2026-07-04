/**
 * Drawdown tax helpers (T10). Extracted from drawdown.ts to respect the
 * 250 LOC ceiling. Pure functions only.
 *
 * @see .research/08-algorithm-v2.md Steps 5-7 (US tax, Thai tax, FTC)
 * @see .research/07-oracle-critique.md (Systemic #1)
 */

import type {
  Assumption,
  RegulatoryScenario,
  RemittanceItem,
  RemittanceSourceType,
} from '../types.js';
import {
  US_LTCG_BRACKETS_2026_SINGLE,
  US_NIIT_THRESHOLD_SINGLE,
  US_ORDINARY_BRACKETS_2026_SINGLE,
  US_STD_DED_2026_SINGLE,
} from '../data/constants.js';
import {
  computeFtc,
  primaryTaxerFor,
  type FtcResult,
  type PerItemTax,
} from './ftc.js';
import {
  thaiAssessableFromRemittance,
  thaiTaxOnRemittances,
} from './thai-tax.js';
import { usLtcgStackTax, usNiit, usOrdinaryTax } from './us-tax.js';

export interface UsTaxInputs {
  readonly usOrdinaryIncome: number;
  readonly usLtcgIncome: number;
  readonly earlyPenalty: number;
}

export interface UsTaxBreakdown {
  readonly usTaxOrdinary: number;
  readonly usTaxLtcg: number;
  readonly niit: number;
  readonly usTaxGross: number;
}

export function computeUsTax(inputs: UsTaxInputs): UsTaxBreakdown {
  const stdDed = US_STD_DED_2026_SINGLE.value;
  const taxableOrd = Math.max(0, inputs.usOrdinaryIncome - stdDed);
  const usTaxOrdinary = usOrdinaryTax(
    taxableOrd,
    US_ORDINARY_BRACKETS_2026_SINGLE.value,
  );
  const usTaxLtcg = usLtcgStackTax(
    taxableOrd,
    inputs.usLtcgIncome,
    US_LTCG_BRACKETS_2026_SINGLE.value,
  );
  const magi = inputs.usOrdinaryIncome + inputs.usLtcgIncome;
  const niit = usNiit(magi, inputs.usLtcgIncome, US_NIIT_THRESHOLD_SINGLE.value);
  const usTaxGross = usTaxOrdinary + usTaxLtcg + niit + inputs.earlyPenalty;
  return { usTaxOrdinary, usTaxLtcg, niit, usTaxGross };
}

export interface ThaiTaxInputs {
  readonly items: readonly RemittanceItem[];
  readonly regScenario: RegulatoryScenario;
  readonly isThaiResident: boolean;
}

/** Returns Thai tax in THB. */
export function computeThaiTax(inputs: ThaiTaxInputs): number {
  return thaiTaxOnRemittances(
    inputs.items,
    inputs.regScenario,
    inputs.isThaiResident,
  );
}

export interface FtcAllocationInputs {
  readonly items: readonly RemittanceItem[];
  readonly usTaxGross: number;
  readonly thaiTaxUsd: number;
  readonly regScenario: RegulatoryScenario;
  /** Total US ordinary income this year (INCLUDING non-remittance events). */
  readonly totalUsOrdinaryIncome: number;
  /** Total US LTCG income this year (INCLUDING non-remittance events). */
  readonly totalUsLtcgIncome: number;
}

/** Apportion this year's US and Thai tax across remittance items for FTC. */
export function allocateAndComputeFtc(inputs: FtcAllocationInputs): FtcResult {
  const {
    items,
    usTaxGross,
    thaiTaxUsd,
    regScenario,
    totalUsOrdinaryIncome,
    totalUsLtcgIncome,
  } = inputs;

  // Per-item share of ORDINARY income (Traditional/HSA remittance items).
  const isOrdSource = (t: RemittanceSourceType): boolean =>
    t === 'TraditionalIRA' || t === 'HSA';
  const isLtcgSource = (t: RemittanceSourceType): boolean => t === 'TaxableGain';

  const totalRemitOrd = items
    .filter((it) => isOrdSource(it.sourceType))
    .reduce((s, it) => s + it.amountUsd, 0);
  const totalRemitLtcg = items
    .filter((it) => isLtcgSource(it.sourceType))
    .reduce((s, it) => s + it.amountUsd, 0);

  const assessableSumUsd = items.reduce((s, it) => {
    const thb = thaiAssessableFromRemittance(it, regScenario);
    return s + thb / (it.amountThb > 0 ? it.amountThb / it.amountUsd : 1);
  }, 0);

  // Rough usTaxGross split into ordinary vs ltcg by input income proportions.
  const totalTaxableIncome = totalUsOrdinaryIncome + totalUsLtcgIncome;
  const usTaxOrdFrac =
    totalTaxableIncome > 0 ? totalUsOrdinaryIncome / totalTaxableIncome : 0;
  const usTaxOrdPortion = usTaxGross * usTaxOrdFrac;
  const usTaxLtcgPortion = usTaxGross - usTaxOrdPortion;

  const perItem: PerItemTax[] = items.map((it) => {
    let usTaxOnItem = 0;
    if (isOrdSource(it.sourceType) && totalRemitOrd > 0) {
      usTaxOnItem = usTaxOrdPortion * (it.amountUsd / totalRemitOrd);
    } else if (isLtcgSource(it.sourceType) && totalRemitLtcg > 0) {
      usTaxOnItem = usTaxLtcgPortion * (it.amountUsd / totalRemitLtcg);
    }
    let thaiTaxOnItem = 0;
    if (assessableSumUsd > 0) {
      const itemAssessableUsd =
        thaiAssessableFromRemittance(it, regScenario) /
        (it.amountThb > 0 ? it.amountThb / it.amountUsd : 1);
      thaiTaxOnItem = thaiTaxUsd * (itemAssessableUsd / assessableSumUsd);
    }
    return {
      item: it,
      primary: primaryTaxerFor(it.sourceType),
      usTaxOnItem,
      thaiTaxOnItem,
    };
  });

  const ftc = computeFtc(perItem, regScenario);

  // Non-remittance US tax (Roth conversion, RMD-not-remitted, penalties on
  // USD-side draws) is NOT eligible for FTC and stands on top of the
  // per-item result. Add it to usTaxAfterFtc.
  const remittanceUsTaxCovered = perItem.reduce(
    (s, p) => s + p.usTaxOnItem,
    0,
  );
  const nonRemittanceUsTax = Math.max(0, usTaxGross - remittanceUsTaxCovered);

  return {
    usTaxAfterFtc: ftc.usTaxAfterFtc + nonRemittanceUsTax,
    thaiTaxAfterFtc: ftc.thaiTaxAfterFtc,
    totalTax: ftc.usTaxAfterFtc + nonRemittanceUsTax + ftc.thaiTaxAfterFtc,
    ftcApplied: ftc.ftcApplied,
  };
}

/** Growth rate for a given account type per Assumption. */
export function returnForAccountType(
  accountType: string,
  shocks: {
    stockReturn: number;
    bondReturn: number;
    cashReturn: number;
  },
  assumption: Assumption,
): number {
  if (accountType === 'Cash') return shocks.cashReturn;
  const stockAlloc =
    accountType === 'TaxableBrokerage'
      ? assumption.stockAllocationTaxable
      : assumption.stockAllocationTaxDeferred;
  return stockAlloc * shocks.stockReturn + (1 - stockAlloc) * shocks.bondReturn;
}
