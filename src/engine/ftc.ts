/**
 * Foreign Tax Credit (FTC) engine (T7) — HIGHEST-RISK.
 *
 * Fixes Oracle Systemic #1: the v1 algorithm double-credited — it credited
 * Thai tax against US AND US tax against Thai on the same income, silently
 * understating liability. This engine enforces ONE primary taxer per
 * remittance item; the other side may grant a limited credit but never
 * both directions on the same income.
 *
 * Treaty basis:
 *   - US-source pensions (Traditional IRA / 401(k), Roth, HSA): Thailand
 *     primary under US-Thai treaty Art. 20(1) (pensions taxable in the
 *     residence state). The US credits Thai tax ONLY IF the treaty
 *     re-sourcing scenario flag is on
 *     (`regScenario.treatyResourcesUsSourcePensions`).
 *   - Long-term capital gains (TaxableGain): Thailand primary under
 *     Art. 13. Same re-sourcing rule applies for US-side credit.
 *   - Cash / return-of-basis: US-primary — this money was already taxed
 *     by the US before it ever entered the account. Thai side generally
 *     charges 0 on principal, so no credit is needed. In v1 we do NOT
 *     credit in either direction for US-primary items.
 *
 * NIIT nuance (v1 simplification): when re-sourcing is on we treat the
 * whole US tax on the item as creditable. `niitCreditableAgainstThai` is
 * reserved for a future refinement that splits the NIIT portion out of
 * the FTC pool; it is currently unused inside `computeFtc`.
 *
 * @see .research/07-oracle-critique.md (Systemic #1)
 * @see .research/08-algorithm-v2.md Step 7
 */

import type {
  RegulatoryScenario,
  RemittanceItem,
  RemittanceSourceType,
} from '../types.js';

/** Which country has primary taxing right on a given remittance item. */
export type PrimaryTaxer = 'US' | 'Thailand';

/** Per-item tax breakdown before FTC. Amounts are USD; the caller
 *  converts THB → USD at the item's FX rate before invoking `computeFtc`. */
export interface PerItemTax {
  readonly item: RemittanceItem;
  readonly primary: PrimaryTaxer;
  readonly usTaxOnItem: number;
  readonly thaiTaxOnItem: number;
}

/** Result of {@link computeFtc}. All amounts in USD. */
export interface FtcResult {
  readonly usTaxAfterFtc: number;
  readonly thaiTaxAfterFtc: number;
  readonly totalTax: number;
  readonly ftcApplied: number;
}

/**
 * Primary taxer selection by remittance source type.
 *
 * Treaty mapping (v1):
 *   - TraditionalIRA / Roth / HSA → Thailand (Art. 20(1))
 *   - TaxableGain                 → Thailand (Art. 13)
 *   - Cash / TaxableBasis         → US (return of already-taxed principal;
 *                                       Thai side taxes 0 unless assessable)
 *
 * The function is exhaustive: adding a new `RemittanceSourceType` will
 * force the TypeScript compiler to flag this switch as non-exhaustive.
 */
export function primaryTaxerFor(sourceType: RemittanceSourceType): PrimaryTaxer {
  switch (sourceType) {
    case 'TraditionalIRA':
    case 'Roth':
    case 'HSA':
    case 'TaxableGain':
      return 'Thailand';
    case 'Cash':
    case 'TaxableBasis':
      return 'US';
    default: {
      const unreachable: never = sourceType;
      throw new Error(`Unhandled RemittanceSourceType: ${String(unreachable)}`);
    }
  }
}

/**
 * Apply corrected per-item FTC to a set of taxed remittance items.
 *
 * Algorithm — one primary taxer per item, credit only in the direction
 * that doesn't double-count:
 *
 *   for each item:
 *     if primary === 'Thailand' AND treatyResourcesUsSourcePensions:
 *       credit_i = min(usTaxOnItem, thaiTaxOnItem)
 *       ftcApplied += credit_i
 *     // If treaty doesn't re-source, US tax stands. No credit.
 *     // If primary === 'US', we do NOT credit in either direction (v1).
 *
 *   usTaxAfterFtc  = max(0, sum(usTaxOnItem)  - ftcApplied)
 *   thaiTaxAfterFtc = sum(thaiTaxOnItem)   // Thai side never reduced
 *   totalTax        = usTaxAfterFtc + thaiTaxAfterFtc
 *
 * Systemic #1 regression: Thai side keeps its full assessment regardless
 * of any US-side FTC. Never both directions on the same income.
 */
export function computeFtc(
  perItem: readonly PerItemTax[],
  regScenario: RegulatoryScenario,
): FtcResult {
  let usTaxGross = 0;
  let thaiTaxGross = 0;
  let ftcApplied = 0;

  for (const entry of perItem) {
    usTaxGross += entry.usTaxOnItem;
    thaiTaxGross += entry.thaiTaxOnItem;

    if (
      entry.primary === 'Thailand' &&
      regScenario.treatyResourcesUsSourcePensions
    ) {
      // US credits Thai tax on this item, limited to the US tax it owes on
      // the same item. NIIT nuance deferred (see file-header note).
      ftcApplied += Math.min(entry.usTaxOnItem, entry.thaiTaxOnItem);
    }
    // primary === 'US' → no cross-credit in v1 (Systemic #1 guard).
  }

  const usTaxAfterFtc = Math.max(0, usTaxGross - ftcApplied);
  const thaiTaxAfterFtc = thaiTaxGross;
  const totalTax = usTaxAfterFtc + thaiTaxAfterFtc;

  return { usTaxAfterFtc, thaiTaxAfterFtc, totalTax, ftcApplied };
}
