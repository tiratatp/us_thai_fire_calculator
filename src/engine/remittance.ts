/**
 * Remittance solver (T8).
 *
 * Decides HOW TO FUND a given THB (Thailand-side) spending need using
 * USD-denominated ("US-side") accounts, after the caller has already
 * exhausted Thai-currency balances. Sources are picked in a fixed
 * preference order chosen to minimize the combined US + Thai tax burden.
 *
 * This solver does NOT compute Thai tax — it determines the *assessable
 * portion* of each remittance so `thai-tax.ts` can chain from it.
 * Residency short-circuit (`isThaiResident === false`) is applied at the
 * tax layer, not here.
 *
 * Systemic #4 (Oracle): retirement accounts are NEVER grandfathered under
 * Paw 162/2566. If a `FundingSource` is emitted with `isPre2024=true` for
 * a retirement source, this engine treats the assessable portion as the
 * full amount anyway.
 *
 * @see .research/02-thai-tax.md §4 (remittance treatment)
 * @see .research/07-oracle-critique.md (Systemic #4)
 * @see .research/08-algorithm-v2.md Step 2/3
 */

import type { Account, RemittanceItem, RemittanceSourceType } from '../types.js';

export { buildFundingSources } from './funding-sources.js';

/** Working state describing an available funding source. */
export interface FundingSource {
  readonly accountId: string;
  readonly sourceType: RemittanceSourceType;
  /** USD available from this source (basis, gain, or full withdrawal). */
  readonly availableUsd: number;
  /** True if the balance is pre-2024 origin (Cash/TaxableBrokerage only). */
  readonly isPre2024: boolean;
}

export interface RemittanceResult {
  readonly items: readonly RemittanceItem[];
  readonly totalRemittedUsd: number;
  readonly totalRemittedThb: number;
  readonly spendingUnmet: boolean;
  readonly shortfallThb: number;
}

/**
 * Fixed preference order for a Thai-resident user, cheapest to most
 * expensive combined tax:
 *   1. Cash — pre-2024 grandfathered to 0/0; post-2024 assessable.
 *   2. TaxableBasis — return of principal, always 0/0.
 *   3. TaxableGain — Thai taxes gain only; US LTCG applies.
 *   4. TraditionalIRA — US ordinary + Thai pension (FTC helps).
 *   5. Roth — US=0 but Thai may tax as pension (worst; no FTC to absorb).
 *   6. HSA — US ordinary/penalty + Thai pension.
 */
const SOURCE_ORDER: readonly RemittanceSourceType[] = [
  'Cash',
  'TaxableBasis',
  'TaxableGain',
  'TraditionalIRA',
  'Roth',
  'HSA',
] as const;

export function sourceOrder(): readonly RemittanceSourceType[] {
  return SOURCE_ORDER;
}

export function sourceOrderIndex(t: RemittanceSourceType): number {
  const idx = SOURCE_ORDER.indexOf(t);
  if (idx < 0) throw new Error(`Unhandled RemittanceSourceType: ${String(t)}`);
  return idx;
}

/**
 * Split a TaxableBrokerage withdrawal into basis vs gain proportionally.
 * Handles missing basis (all-gain) and zero balance (all-gain, honest total).
 */
export function splitTaxableLot(
  account: Account,
  drawUsd: number,
): { readonly basisUsd: number; readonly gainUsd: number } {
  const basis = account.basis ?? 0;
  if (account.balance <= 0) return { basisUsd: 0, gainUsd: drawUsd };
  const basisFraction = Math.min(1, basis / account.balance);
  const basisUsd = drawUsd * basisFraction;
  return { basisUsd, gainUsd: drawUsd - basisUsd };
}

/** Assessable Thai portion of a remittance by source type + origin. */
function assessableThb(
  sourceType: RemittanceSourceType,
  isPre2024: boolean,
  amountThb: number,
): number {
  switch (sourceType) {
    case 'TaxableBasis':
      return 0;
    case 'Cash':
      return isPre2024 ? 0 : amountThb;
    case 'TaxableGain':
    case 'TraditionalIRA':
    case 'Roth':
    case 'HSA':
      // Retirement + gain sources: always fully assessable at the solver
      // layer. Systemic #4 — never honor pre-2024 for retirement.
      return amountThb;
    default: {
      const unreachable: never = sourceType;
      throw new Error(`Unhandled RemittanceSourceType: ${String(unreachable)}`);
    }
  }
}

/**
 * Greedy fill of a THB need from a pool of USD funding sources.
 *
 * Sources consumed cheapest-first (see `SOURCE_ORDER`); stable secondary
 * sort places pre-2024 Cash before post-2024 Cash so grandfather is used
 * up before assessable balance is touched.
 *
 * Emits `RemittanceItem`s with the correct `assessablePortionThb` so
 * `thai-tax.ts` can chain from the result.
 */
export function solveRemittance(
  thbNeed: number,
  sources: readonly FundingSource[],
  fxRate: number,
  // Accepted for API symmetry with drawdown.ts; residency short-circuit
  // lives in thai-tax.ts so the audit trail reflects real cash movement.
  _isThaiResident: boolean,
): RemittanceResult {
  if (fxRate <= 0) throw new Error(`fxRate must be positive; got ${fxRate}`);

  const sorted = [...sources].sort((a, b) => {
    const primary = sourceOrderIndex(a.sourceType) - sourceOrderIndex(b.sourceType);
    if (primary !== 0) return primary;
    if (a.isPre2024 === b.isPre2024) return 0;
    return a.isPre2024 ? -1 : 1;
  });

  const items: RemittanceItem[] = [];
  let remainingThb = thbNeed;
  let totalRemittedUsd = 0;
  let totalRemittedThb = 0;

  for (const source of sorted) {
    if (remainingThb <= 0) break;
    if (source.availableUsd <= 0) continue;

    const availableThb = source.availableUsd * fxRate;
    const takeThb = Math.min(remainingThb, availableThb);
    const takeUsd = takeThb / fxRate;
    // Systemic #4: retirement sources never honor pre-2024 origin.
    const effectivePre2024 =
      source.isPre2024 &&
      (source.sourceType === 'Cash' || source.sourceType === 'TaxableBasis');
    const assessable = assessableThb(source.sourceType, effectivePre2024, takeThb);

    items.push({
      sourceAccountId: source.accountId,
      amountUsd: takeUsd,
      amountThb: takeThb,
      assessablePortionThb: assessable,
      sourceType: source.sourceType,
      preTaxOrigin: effectivePre2024 ? 'pre2024' : 'post2024',
    });

    remainingThb -= takeThb;
    totalRemittedUsd += takeUsd;
    totalRemittedThb += takeThb;
  }

  const spendingUnmet = remainingThb > 1e-6;
  return {
    items,
    totalRemittedUsd,
    totalRemittedThb,
    spendingUnmet,
    shortfallThb: spendingUnmet ? remainingThb : 0,
  };
}
